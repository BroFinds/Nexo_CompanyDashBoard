import React, { useEffect, useState } from "react";
import NovoLayout from "../components/NovoLayout";
import { SectionCard } from "../components/Shared";
import { Save, UploadCloud, Trash2, Download } from "lucide-react";
import Skeleton from "@/shared/components/ui/Skeleton";
import { getSession } from "@/services/api";

const ConfigureBusinessPage = () => {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [plainText, setPlainText] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [hasSavedConfig, setHasSavedConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingFiles, setDeletingFiles] = useState([]);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  const skeletonStyle = {
    backgroundColor: "#f1f5f9",
    backgroundImage:
      "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
  };

  const handleFileChange = (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const pdfFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      if (isPdf) {
        pdfFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(
        `Only PDF files are allowed. Skipped: ${invalidFiles.join(", ")}`,
      );
    }

    if (pdfFiles.length > 0) {
      setAttachedFiles((current) => [...current, ...pdfFiles]);
    }
  };

  const validateForm = () => {
    if (!businessName.trim()) {
      return "Business name is required.";
    }

    if (!industry.trim()) {
      return "Industry is required.";
    }

    if (!website.trim()) {
      return "Website is required.";
    }

    if (!plainText.trim()) {
      return "Plain text is required.";
    }

    if (!attachedFiles.length && !existingFiles.length) {
      return "At least one PDF file must be attached.";
    }

    return "";
  };

  const loadConfiguration = async (companyId) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/novo/configuration/${companyId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setBusinessName(data.businessName ?? "");
        setIndustry(data.industry ?? "");
        setWebsite(data.website ?? "");
        setPlainText(data.plainText ?? "");
        setExistingFiles(
          Array.isArray(data.attachedFiles) ? data.attachedFiles : [],
        );
        setHasSavedConfig(true);
      } else if (response.status === 404) {
        setHasSavedConfig(false);
      } else {
        const errorText = await response.text();
        setErrorMessage(
          `Failed to load saved configuration: ${response.status} ${errorText}`,
        );
      }
    } catch (error) {
      console.error("Load configuration failed:", error);
      setErrorMessage("Failed to load saved configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      setErrorMessage("Missing companyId in session.");
      return;
    }

    setCompanyId(session.companyId);
    loadConfiguration(session.companyId);
  }, []);

  const handleSubmit = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      if (!companyId) {
        setErrorMessage("Missing companyId for Novo configuration.");
        return;
      }

      const validationError = validateForm();
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("businessName", businessName);
      formData.append("industry", industry);
      formData.append("website", website);
      formData.append("plainText", plainText);

      attachedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const endpoint = hasSavedConfig
        ? `${API_BASE_URL}/api/v1/novo/configuration/${companyId}`
        : `${API_BASE_URL}/api/v1/novo/configuration`;
      const method = hasSavedConfig ? "PUT" : "POST";

      let response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok && !hasSavedConfig && response.status === 409) {
        response = await fetch(
          `${API_BASE_URL}/api/v1/novo/configuration/${companyId}`,
          {
            method: "PUT",
            body: formData,
          },
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(`Save failed: ${response.status} ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Saved configuration:", data);
      setSuccessMessage("Configuration saved successfully.");
      setHasSavedConfig(true);
      setExistingFiles(
        Array.isArray(data.attachedFiles) ? data.attachedFiles : existingFiles,
      );
    } catch (error) {
      console.error("Save configuration failed:", error);
      setErrorMessage(error?.message || "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavedFileDownload = async (file) => {
    if (!file?.url) return;
    setErrorMessage("");

    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        setErrorMessage(
          `Unable to download file. Server returned ${response.status}.`,
        );
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        file.originalFileName || file.storedFileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download saved file failed:", error);
      setErrorMessage("Unable to download file. Try opening it in a new tab.");
    }
  };

  const handleDeleteSavedFile = async (file) => {
    if (!file?.storedFileName) {
      setErrorMessage("Missing stored file identifier for delete.");
      return;
    }

    if (!companyId) {
      setErrorMessage("Missing companyId in session.");
      return;
    }

    const storedFileName = file.storedFileName;
    setErrorMessage("");
    setSuccessMessage("");
    setDeletingFiles((d) => [...d, storedFileName]);

    try {
      const deleteUrl = `${API_BASE_URL}/api/v1/novo/configuration/${companyId}/files/${encodeURIComponent(
        storedFileName
      )}`;

      const response = await fetch(deleteUrl, { method: "DELETE" });

      if (response.status === 204) {
        setExistingFiles((current) => current.filter((f) => f.storedFileName !== storedFileName));
        setSuccessMessage("File deleted successfully.");
      } else if (response.status === 404) {
        setErrorMessage("File not found on server.");
      } else {
        const text = await response.text().catch(() => "");
        setErrorMessage(`Unable to delete file. Server returned ${response.status} ${text}`);
      }
    } catch (err) {
      console.error("Delete saved file failed:", err);
      setErrorMessage("Unable to delete file. Try again later.");
    } finally {
      setDeletingFiles((d) => d.filter((s) => s !== storedFileName));
    }
  };

  if (isLoading) {
    return (
      <NovoLayout
        headerTitle="AI Configuration"
        headerSubtitle="Loading saved configuration..."
      >
        <div className="novo-shell">
          <div
            className="novo-page-header-clean"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <Skeleton
                width="180px"
                height="32px"
                borderRadius="8px"
                style={skeletonStyle}
              />
              <Skeleton
                width="280px"
                height="18px"
                borderRadius="8px"
                style={{ ...skeletonStyle, marginTop: 12 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
            <Skeleton
              width="100%"
              height="240px"
              borderRadius="18px"
              style={skeletonStyle}
            />
            <Skeleton
              width="100%"
              height="320px"
              borderRadius="18px"
              style={skeletonStyle}
            />
          </div>
        </div>
      </NovoLayout>
    );
  }

  return (
    <NovoLayout
      headerTitle="AI Configuration"
      headerSubtitle="One place for business details, knowledge sources, and instructions."
    >
      <div className="novo-shell">
        <div
          className="novo-page-header-clean"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 className="novo-title">AI Configuration</h2>
            <p className="novo-subtitle">
              Business information, knowledge sources, and a single instruction
              prompt.
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              className="novo-btn novo-btn--primary"
              disabled={isSaving}
              onClick={handleSubmit}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Save size={16} />{" "}
                {isSaving ? "Saving..." : "Save configuration"}
              </span>
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div
            style={{
              marginBottom: 20,
              color: "#b91c1c",
              background: "rgba(254, 226, 226, 0.8)",
              padding: "14px 18px",
              borderRadius: 14,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            style={{
              marginBottom: 20,
              color: "#115e59",
              background: "rgba(217, 249, 226, 0.8)",
              padding: "14px 18px",
              borderRadius: 14,
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <SectionCard
          title="Business Information"
          subtitle="Provide the core details your assistant should reference."
        >
          <div className="novo-form-grid">
            <label>
              <span>Business Name</span>
              <input
                className="novo-input"
                value={businessName}
                placeholder="Enter your business name"
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </label>
            <label>
              <span>Industry</span>
              <input
                className="novo-input"
                value={industry}
                placeholder="Enter your industry"
                onChange={(event) => setIndustry(event.target.value)}
              />
            </label>
            <label className="novo-full">
              <span>Website</span>
              <input
                className="novo-input"
                value={website}
                placeholder="Enter your website URL"
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Knowledge Sources"
          subtitle="Upload documents and provide source content for the AI."
        >
          <label className="novo-dropzone novo-dropzone--picker">
            <input
              type="file"
              hidden
              multiple
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <div>
              <UploadCloud size={24} color="var(--color-primary-hover)" />
              <div style={{ fontWeight: 700, marginTop: 8 }}>
                Drop PDFs here or click to upload
              </div>
              <div className="novo-muted">PDF uploads only</div>
              {attachedFiles.length > 0 ? (
                <div
                  className="novo-file-selected"
                  style={{ marginTop: 16, textAlign: "left" }}
                >
                  <strong>New attachments</strong>
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {attachedFiles.map((file) => (
                      <span key={file.name}>{file.name}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </label>

          {existingFiles.length > 0 ? (
            <div
              className="novo-file-selected"
              style={{ marginTop: 20, textAlign: "left" }}
            >
              <strong>Saved attachments</strong>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {existingFiles.map((file, index) => (
                  <div
                    key={`${file.storedFileName ?? file.originalFileName}-${index}`}
                    className="novo-file-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      minWidth: 0,
                      gap: 12,
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      className="novo-file-name"
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.originalFileName || file.storedFileName}
                    </div>

                    <div
                      className="novo-file-actions"
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginLeft: "auto",
                        flexShrink: 0,
                      }}
                    >

                      <button
                        type="button"
                        className="novo-btn novo-btn--ghost"
                        onClick={() => handleSavedFileDownload(file)}
                        disabled={deletingFiles.includes(file.storedFileName)}
                        title={`Download ${file.originalFileName || file.storedFileName}`}
                        style={{ padding: "6px 10px", minHeight: 32 }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <Download size={14} />
                          <span style={{ fontSize: 13 }}>Download</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        className="novo-btn novo-btn--ghost"
                        onClick={() => handleDeleteSavedFile(file)}
                        disabled={deletingFiles.includes(file.storedFileName)}
                        aria-label={`Delete ${file.originalFileName || file.storedFileName}`}
                        title={`Delete ${file.originalFileName || file.storedFileName}`}
                        style={{ color: "#dc2626", padding: "6px 10px", minHeight: 32 }}
                      >
                        {deletingFiles.includes(file.storedFileName) ? (
                          <span style={{ fontSize: 13, color: "#666" }}>Deleting...</span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Trash2 size={14} />
                            <span style={{ fontSize: 13 }}>Delete</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 20 }}>
            <label>
              <span>Plain text</span>
              <textarea
                className="novo-textarea"
                rows={4}
                value={plainText}
                placeholder="Enter business-related content"
                onChange={(event) => setPlainText(event.target.value)}
              />
            </label>
          </div>
        </SectionCard>
      </div>
    </NovoLayout>
  );
};

export default ConfigureBusinessPage;
