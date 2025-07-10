import React from "react";

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  action,
  className,
}) => (
  <div
    className={className}
    style={{
      textAlign: "center",
      color: "#888",
      padding: "2rem 1rem",
      fontSize: "1.1rem",
    }}
  >
    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🪹</div>
    <div>{message}</div>
    {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
  </div>
);

export default EmptyState;
