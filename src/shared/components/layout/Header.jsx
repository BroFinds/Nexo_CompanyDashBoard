import React from "react";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { getSession } from "@/services/api";

// notification: { count, onClick, title } — the bell shows a badge when count > 0
const Header = ({ onToggleSidebar, title, subtitle = "", onLogout, notification }) => {
  const notificationCount = notification?.count || 0;
  const session = getSession();
  const displayName = session?.userName || session?.username || "User";
  return (
    <header className="header-sticky">
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>

        {title ? (
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "var(--color-text-main)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-subtle)",
                  display: "none",
                }}
                className="hide-on-mobile"
              >
                {subtitle}
              </p>
            )}
            <style>{`
              @media (min-width: 768px) {
                .hide-on-mobile { display: block !important; }
              }
            `}</style>
          </div>
        ) : (
          <div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "var(--color-text-main)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Hi, {displayName}
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-subtle)",
                marginTop: "2px",
                display: "none",
              }}
              className="hide-on-mobile"
            >
              Here&apos;s what&apos;s happening today
            </p>
            <style>{`
              @media (min-width: 768px) {
                .hide-on-mobile { display: block !important; }
              }
            `}</style>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
        }}
      >
        {/* Search Input Fake */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-full)",
            padding: "8px 16px",
            width: "240px",
            boxShadow: "var(--shadow-sm)",
          }}
          className="search-bar"
        >
          <Search
            size={16}
            color="var(--color-text-subtle)"
            style={{ marginRight: "8px" }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.875rem",
              width: "100%",
            }}
          />
        </div>

        {/* Mobile Search Icon Only */}
        <button
          style={{
            display: "none",
          }}
          className="mobile-search-btn"
        >
          <Search size={20} />
        </button>

        <style>{`
          @media (max-width: 768px) {
            .search-bar { display: none !important; }
            .mobile-search-btn {
               display: flex !important;
               width: 40px; height: 40px; border-radius: 50%; border: none; background: transparent; align-items: center; justify-content: center; color: var(--color-text-main);
            }
          }
        `}</style>

        <button
          type="button"
          onClick={notification?.onClick}
          title={notification?.title}
          aria-label={notificationCount > 0 ? `${notificationCount} ${notification?.title || "notifications"}` : "Notifications"}
          style={{
            position: "relative",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: notificationCount > 0 ? "var(--color-text-main)" : "var(--color-text-subtle)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s",
          }}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                minWidth: "18px",
                height: "18px",
                padding: "0 5px",
                borderRadius: "999px",
                background: "#ef4444",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: 700,
                lineHeight: "18px",
                textAlign: "center",
                border: "2px solid var(--bg-surface)",
                boxSizing: "content-box",
              }}
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onLogout}
          title="Logout"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-subtle)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s",
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
