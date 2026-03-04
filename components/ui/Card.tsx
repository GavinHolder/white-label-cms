"use client";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export default function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
}: CardProps) {
  const paddings = {
    sm: "p-3",
    md: "p-4 p-md-5",
    lg: "p-5 p-md-6",
  };

  return (
    <div
      className={`card border rounded-3 bg-white shadow-sm ${paddings[padding]} ${className}`}
      style={{
        transition: hover ? "box-shadow 0.3s ease-in-out" : undefined,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
        }
      }}
    >
      {children}
    </div>
  );
}
