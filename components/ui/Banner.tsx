export interface BannerProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export default function Banner({
  children,
  variant = "info",
  className = "",
}: BannerProps) {
  const variants = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-danger",
  };

  return (
    <div
      className={`alert ${variants[variant]} border-start border-4 rounded ${className}`}
      role="alert"
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
