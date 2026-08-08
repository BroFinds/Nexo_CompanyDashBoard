import React, { useState } from "react";
import NovoLayout from "../components/NovoLayout";
import { SectionCard } from "../components/Shared";
import { Save, Trash2, RotateCcw } from "lucide-react";

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [conversationAlerts, setConversationAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  return (
    <NovoLayout headerTitle="Settings" headerSubtitle="Manage the agent’s general settings, appearance, and protection controls">
      <div className="novo-shell">
        <div style={{ marginBottom: 20 }}>
          <h2 className="novo-title">Settings</h2>
          <p className="novo-subtitle">Control the assistant workspace.</p>
        </div>
        <div className="novo-grid novo-grid--split">
          <SectionCard title="General" subtitle="Configure the defaults for the assistant experience.">
            <div className="novo-form-grid">
              <label>
                <span>Agent Name</span>
                <input className="novo-input" defaultValue="Nova" />
              </label>
              <label>
                <span>Default Language</span>
                <select className="novo-input" defaultValue="English">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </label>
              <label>
                <span>Timezone</span>
                <select className="novo-input" defaultValue="America/Los_Angeles">
                  <option>America/Los_Angeles</option>
                  <option>America/New_York</option>
                </select>
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Appearance" subtitle="Tune the widget presentation and visual style.">
            <div className="novo-form-grid">
              <label>
                <span>Theme Color</span>
                <input className="novo-input" defaultValue="#14b8a6" />
              </label>
              <label>
                <span>Widget Style</span>
                <select className="novo-input" defaultValue="Floating">
                  <option>Floating</option>
                  <option>Embedded</option>
                </select>
              </label>
              <label>
                <span>Chat Bubble Style</span>
                <select className="novo-input" defaultValue="Rounded">
                  <option>Rounded</option>
                  <option>Sharp</option>
                </select>
              </label>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Notifications" subtitle="Control how the assistant keeps your team informed.">
          <div className="novo-list">
            {[
              { label: "Email Notifications", value: emailNotifications, setter: setEmailNotifications },
              { label: "Conversation Alerts", value: conversationAlerts, setter: setConversationAlerts },
              { label: "Weekly Reports", value: weeklyReports, setter: setWeeklyReports },
            ].map((item) => (
              <div key={item.label} className="novo-list-item">
                <span>{item.label}</span>
                <button className={`novo-switch ${item.value ? "active" : ""}`} onClick={() => item.setter((current) => !current)}>
                  <span />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Danger Zone" subtitle="These actions are destructive and require confirmation.">
          <div className="novo-list">
            <div className="novo-list-item">
              <span>Delete Agent</span>
              <button className="novo-btn novo-btn--ghost" style={{ color: "#dc2626" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Trash2 size={14} /> Delete Agent</span>
              </button>
            </div>
            <div className="novo-list-item">
              <span>Reset Configuration</span>
              <button className="novo-btn novo-btn--ghost">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><RotateCcw size={14} /> Reset Configuration</span>
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="novo-actions">
          <button className="novo-btn novo-btn--primary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Save size={14} /> Save changes</span>
          </button>
        </div>
      </div>
    </NovoLayout>
  );
};

export default SettingsPage;
