import React, { useState } from "react";
import NovoLayout from "../components/NovoLayout";
import { SectionCard } from "../components/Shared";
import { Send, Bot, Sparkles, CheckCircle2 } from "lucide-react";

const suggestedQuestions = ["What are your service hours?", "How do I book a consultation?", "Do you support weekend appointments?"];

const PlaygroundPage = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I can help with support, bookings, and general questions. Try one of the suggested prompts on the right." },
  ]);
  const [draft, setDraft] = useState("");

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((current) => [...current, { role: "user", text: draft.trim() }]);
    setDraft("");
  };

  return (
    <NovoLayout headerTitle="Playground" headerSubtitle="Test the assistant">
      <div className="novo-shell">
        <div className="novo-page-header-clean">
          <div>
            <h2 className="novo-title">Playground</h2>
            <p className="novo-subtitle">Chat with the assistant and review results.</p>
          </div>
        </div>
        <div className="novo-grid novo-grid--split novo-grid--playground">
          <SectionCard title="Conversation" subtitle="Mock chat experience for live testing.">
            <div className="novo-chat-panel">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`novo-chat-message ${message.role === "assistant" ? "assistant" : "user"}`}>
                  <div className="novo-chat-icon">
                    {message.role === "assistant" ? <Bot size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div>{message.text}</div>
                </div>
              ))}
            </div>
            <div className="novo-input-row">
              <input className="novo-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask the assistant something..." />
              <button className="novo-btn novo-btn--primary" onClick={sendMessage}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Send size={14} /> Send
                </span>
              </button>
            </div>
            <div className="novo-muted" style={{ marginTop: 10 }}>Suggested prompts</div>
            <div className="novo-chip-row" style={{ marginTop: 8 }}>
              {suggestedQuestions.map((question) => (
                <button key={question} className="novo-chip" onClick={() => setDraft(question)}>{question}</button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="AI Debug Panel" subtitle="Inspect knowledge retrieval and generation details.">
            <div className="novo-list">
              {[
                { label: "Retrieved Knowledge", value: "3 supporting passages" },
                { label: "Confidence", value: "94%" },
                { label: "Response Time", value: "1.1s" },
                { label: "Tokens Used", value: "682" },
                { label: "Tool Calls", value: "2" },
              ].map((item) => (
                <div key={item.label} className="novo-list-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="novo-muted" style={{ marginTop: 12 }}>Latest telemetry</div>
            <div className="novo-debug-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color="var(--color-primary-hover)" />
                <strong>Grounded answer generated</strong>
              </div>
              <p>The assistant pulled context from your FAQ and website source pages before replying.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </NovoLayout>
  );
};

export default PlaygroundPage;
