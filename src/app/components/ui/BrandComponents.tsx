import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  href,
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "font-medium transition-colors rounded-brand inline-flex items-center justify-center";

  const variantClasses = {
    primary: "bg-brand-blue hover:bg-brand-blue-700 text-white shadow-brand",
    secondary: "bg-brand-brown hover:bg-brand-brown-700 text-white",
    accent:
      "bg-brand-copper hover:bg-brand-copper-700 text-white shadow-copper",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  const hoverEffect = hover ? "hover:shadow-brand-lg" : "";

  return (
    <div
      className={`bg-brand-white rounded-brand-lg shadow-brand p-6 border border-gray-100 transition-shadow ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
}

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  color?: "blue" | "brown" | "copper" | "white";
}

export function Heading({
  children,
  level = 1,
  className = "",
  color = "blue",
}: HeadingProps) {
  const colorClasses = {
    blue: "text-brand-blue",
    brown: "text-brand-brown",
    copper: "text-brand-copper",
    white: "text-brand-white",
  };

  const sizeClasses = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`font-heading font-bold ${colorClasses[color]} ${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
}

interface TextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  color?: "gray" | "blue" | "brown" | "copper" | "white";
  className?: string;
  arabic?: boolean;
}

export function Text({
  children,
  size = "base",
  color = "gray",
  className = "",
  arabic = false,
}: TextProps) {
  const fontClass = arabic ? "font-arabic" : "font-body";

  const colorClasses = {
    gray: "text-gray-700",
    blue: "text-brand-blue",
    brown: "text-brand-brown",
    copper: "text-brand-copper",
    white: "text-brand-white",
  };

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <p
      className={`${fontClass} ${colorClasses[color]} ${sizeClasses[size]} ${className}`}>
      {children}
    </p>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function Container({
  children,
  size = "lg",
  className = "",
}: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={`mx-auto px-4 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error";
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  const variantClasses = {
    primary: "bg-brand-blue text-white",
    secondary: "bg-brand-brown text-white",
    accent: "bg-brand-copper text-white",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
