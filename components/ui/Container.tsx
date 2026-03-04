export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Container({
  children,
  className = "",
  size = "lg",
}: ContainerProps) {
  const sizes = {
    sm: "container-sm",
    md: "container-md",
    lg: "container-lg",
    xl: "container-xl",
    full: "container-fluid",
  };

  return (
    <div className={`${sizes[size]} ${className}`} style={{ maxWidth: size === "full" ? "100%" : undefined }}>
      {children}
    </div>
  );
}
