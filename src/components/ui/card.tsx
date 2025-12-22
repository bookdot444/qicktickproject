import React from "react";

export function Card({ className = "", children }: any) {
  return (
    <div className={`bg-white border rounded-2xl p-5 shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: any) {
  return <div className={`${className}`}>{children}</div>;
}
