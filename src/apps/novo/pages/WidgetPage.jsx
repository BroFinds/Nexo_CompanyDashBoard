import React, { useState } from "react";
import NovoLayout from "../components/NovoLayout";
import { SectionCard } from "../components/Shared";
import { Copy, Sparkles } from "lucide-react";

const WidgetPage = () => {
  const [themeColor, setThemeColor] = useState("#14b8a6");
  const [position, setPosition] = useState("Bottom Right");
  const [radius, setRadius] = useState(22);
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! I can help with product questions and appointments.");
  const [agentName, setAgentName] = useState("Nova");

  return (
    <NovoLayout headerTitle="Widget" headerSubtitle="Install the assistant">
      <div className="novo-shell">
        <div className="novo-page-header-clean">
          <div>
            <h2 className="novo-title">Widget</h2>
            <p className="novo-subtitle">Copy and install your embed code.</p>
          </div>
        </div>
        <div className="novo-grid novo-grid--split">
          <SectionCard title="Embed snippet" subtitle="Use this snippet to activate the widget on your website.">
            <pre className="novo-code-block">{`<script
src="https://nexo.ai/widget.js"
data-widget-id="wid_demo">
</script>`}</pre>
            <div className="novo-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="novo-btn novo-btn--primary">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Copy size={16} /> Copy snippet
                </span>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Customization" subtitle="Tune the visual presentation before publishing.">
            <div className="novo-form-grid">
              <label>
                <span>Theme Color</span>
                <input className="novo-input" value={themeColor} onChange={(event) => setThemeColor(event.target.value)} />
              </label>
              <label>
                <span>Position</span>
                <select className="novo-input" value={position} onChange={(event) => setPosition(event.target.value)}>
                  <option>Bottom Right</option>
                  <option>Bottom Left</option>
                  <option>Top Right</option>
                </select>
              </label>
              <label>
                <span>Border Radius</span>
                <input type="range" min="0" max="40" value={radius} onChange={(event) => setRadius(Number(event.target.value))} />
                <div className="novo-muted">{radius}px</div>
              </label>
              <label>
                <span>Welcome Message</span>
                <input className="novo-input" value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} />
              </label>
              <label>
                <span>Agent Name</span>
                <input className="novo-input" value={agentName} onChange={(event) => setAgentName(event.target.value)} />
              </label>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Live Preview" subtitle="A realistic preview of the floating assistant experience.">
          <div className="novo-preview-card" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)` }}>
            <div className="novo-preview-bubble">
              <Sparkles size={18} />
              <div>
                <strong>{agentName}</strong>
                <p>{welcomeMessage}</p>
              </div>
            </div>
            <div className="novo-preview-pill">{position}</div>
            <div className="novo-preview-bubble novo-preview-bubble--compact">Ready to help</div>
          </div>
        </SectionCard>
      </div>
    </NovoLayout>
  );
};

export default WidgetPage;
