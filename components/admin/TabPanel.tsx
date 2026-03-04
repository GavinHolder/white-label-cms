"use client";

import { useState, ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
  badge?: string | number;
}

interface TabPanelProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "pills" | "underline" | "boxed";
}

export default function TabPanel({ tabs, defaultTab, variant = "pills" }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const getTabClasses = (tabId: string) => {
    const isActive = activeTab === tabId;

    if (variant === "pills") {
      return `nav-link ${isActive ? "active" : ""}`;
    } else if (variant === "underline") {
      return `nav-link ${isActive ? "active border-bottom border-primary border-3" : "text-muted"}`;
    } else {
      // boxed variant
      return `nav-link ${isActive ? "active bg-white border border-bottom-0" : "text-muted"}`;
    }
  };

  const getNavClasses = () => {
    if (variant === "pills") {
      return "nav nav-pills mb-4";
    } else if (variant === "underline") {
      return "nav nav-tabs border-0 mb-4";
    } else {
      return "nav nav-tabs mb-0";
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <ul className={getNavClasses()} role="tablist">
        {tabs.map((tab) => (
          <li key={tab.id} className="nav-item" role="presentation">
            <button
              className={getTabClasses(tab.id)}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                padding: "0.625rem 1rem",
                border: variant === "boxed" && activeTab !== tab.id ? "1px solid transparent" : undefined,
                transition: "all 0.2s",
              }}
            >
              {tab.icon && <span style={{ fontSize: "1.125rem" }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="badge rounded-pill text-primary border border-primary-subtle" style={{ fontSize: "0.625rem" }}>
                  {tab.badge}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className={variant === "boxed" ? "border border-top-0 rounded-bottom p-4 bg-white" : ""}>
        {activeTabContent}
      </div>
    </div>
  );
}
