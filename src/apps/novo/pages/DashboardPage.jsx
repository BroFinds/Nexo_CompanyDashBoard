import React from "react";
import { useNavigate } from "react-router-dom";
import NovoLayout from "../components/NovoLayout";
import { SectionCard, StatCard } from "../components/Shared";
import { UploadCloud, MessageSquareText, Bot, TrendingUp, ArrowRight, MessageCircleMore, BookOpen, MonitorSmartphone, ShieldCheck, Sparkles } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Conversations", value: "3,482", detail: "Steady growth this month", icon: MessageSquareText },
    { label: "Conversations Today", value: "124", detail: "Across web and chat", icon: MessageCircleMore },
    { label: "AI Resolution Rate", value: "92%", detail: "Escalations remain low", icon: ShieldCheck },
    { label: "Leads Captured", value: "81", detail: "Qualified prospects", icon: TrendingUp },
  ];

  const quickActions = [
    { title: "AI Configuration", description: "Set business details, knowledge, and instructions", route: "/nova/ai-configuration", icon: Sparkles },
    { title: "Upload Knowledge", description: "Add docs and FAQs", route: "/nova/ai-configuration", icon: UploadCloud },
    { title: "Test AI", description: "Try the playground", route: "/nova/playground", icon: Bot },
    { title: "Copy Widget Code", description: "Generate your embed snippet", route: "/nova/widget", icon: MonitorSmartphone },
  ];

  const recentConversations = [
    { customer: "Mina Patel", topic: "Booking update", time: "12m ago", status: "Resolved" },
    { customer: "Jordan Kim", topic: "Refund policy", time: "28m ago", status: "In Review" },
    { customer: "Nina Flores", topic: "Service availability", time: "1h ago", status: "Open" },
  ];

  return (
    <NovoLayout headerTitle="Dashboard" headerSubtitle="Overview">
      <div className="novo-shell">
        <div className="novo-page-header-clean">
          <h2 className="novo-title">Dashboard</h2>
          <p className="novo-subtitle">View key metrics and activity.</p>
        </div>
        <div className="novo-grid novo-grid--stats">
          {stats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} icon={item.icon} />
          ))}
        </div>

        <div className="novo-grid novo-grid--split">
          <SectionCard title="Conversations by Day" subtitle="A simple trend view with mock engagement data.">
            <div className="novo-chart-card">
              {[52, 64, 58, 74, 82, 78, 94].map((value, index) => (
                <div key={index} className="novo-chart-bar" style={{ height: `${value}px` }} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top Questions" subtitle="The most common prompts the assistant is handling.">
            <div className="novo-list">
              {[
                { label: "How do I book a consultation?", value: "34%" },
                { label: "What are your business hours?", value: "21%" },
                { label: "Do you offer same-day support?", value: "17%" },
              ].map((item) => (
                <div key={item.label} className="novo-list-item">
                  <span>{item.label}</span>
                  <span className="novo-badge">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="novo-grid novo-grid--split">
          <SectionCard title="Recent Conversations" subtitle="The latest customer threads from your assistant workflow.">
            <div className="novo-table-shell">
              <table className="novo-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Topic</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentConversations.map((item) => (
                    <tr key={item.customer}>
                      <td>{item.customer}</td>
                      <td>{item.topic}</td>
                      <td>{item.time}</td>
                      <td><span className="novo-badge">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions" subtitle="Jump into the most common setup workflows.">
            <div className="novo-list">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.title} className="novo-list-item" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => navigate(action.route)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="novo-integration-icon">
                        <Icon size={16} />
                      </div>
                      <div>
                        <strong>{action.title}</strong>
                        <div className="novo-muted">{action.description}</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="var(--color-primary-hover)" />
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </NovoLayout>
  );
};

export default DashboardPage;
