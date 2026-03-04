import Link from "next/link";

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline-primary",
    ghost: "btn-link text-decoration-none",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const btnClass = `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={btnClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={btnClass}>
      {children}
    </button>
  );
}
