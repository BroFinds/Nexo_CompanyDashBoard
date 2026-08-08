import React, { useState } from "react";
import NovoLayout from "../components/NovoLayout";
import { SectionCard } from "../components/Shared";
import { Save, UploadCloud } from "lucide-react";

const ConfigureBusinessPage = () => {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [websiteSource, setWebsiteSource] = useState("");
  const [plainText, setPlainText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

  const handleFileChange = (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      setAttachedFiles((current) => [...current, ...files]);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("businessName", businessName);
      formData.append("industry", industry);
      formData.append("website", website);
      formData.append("websiteSource", websiteSource);
      formData.append("plainText", plainText);

      attachedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/novo/configuration`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Save failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Saved configuration:", data);
      setSuccessMessage("Configuration saved successfully.");
    } catch (error) {
      console.error("Save configuration failed:", error);
      setErrorMessage(error?.message || "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

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
                <Save size={16} /> {isSaving ? "Saving..." : "Save configuration"}
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
            <input type="file" hidden multiple onChange={handleFileChange} />
            <div>
              <UploadCloud size={24} color="var(--color-primary-hover)" />
              <div style={{ fontWeight: 700, marginTop: 8 }}>
                Drop PDFs here or click to upload
              </div>
              <div className="novo-muted">PDF, DOCX, and TXT uploads</div>
              {attachedFiles.length > 0 ? (
                <div className="novo-file-selected" style={{ marginTop: 16, textAlign: "left" }}>
                  <strong>Attached files</strong>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {attachedFiles.map((file) => (
                      <span key={file.name}>{file.name}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </label>

          <div className="novo-grid novo-grid--split" style={{ marginTop: 20 }}>
            <div>
              <label>
                <span>Website URL</span>
                <input
                  className="novo-input"
                  value={websiteSource}
                  placeholder="Enter the website URL"
                  onChange={(event) => setWebsiteSource(event.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                <span>Plain text</span>
                <textarea
                  className="novo-textarea"
                  rows={4}
                  value={plainText}
                  placeholder="Enter Business related content"
                  onChange={(event) => setPlainText(event.target.value)}
                />
              </label>
            </div>
          </div>
        </SectionCard>
      </div>
    </NovoLayout>
  );
};

export default ConfigureBusinessPage;
