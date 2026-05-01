import React from "react";
import { Search, Bell, Menu } from "lucide-react";

const Header = ({ onToggleSidebar, title, subtitle = "" }) => {
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
              Hi, Admin
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
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
