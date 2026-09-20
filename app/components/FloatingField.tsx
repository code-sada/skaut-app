"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  as?: "input" | "textarea" | "select";
};

export default function FloatingField({ id, label, as = "input", className = "", ...props }: Props) {
  const baseClass = `floating-input ${className}`.trim();

  return (
    <div className="floating">
      {as === "textarea" ? (
        <textarea id={id} placeholder=" " className={baseClass} {...(props as any)} />
      ) : as === "select" ? (
        <select id={id} className={baseClass} {...(props as any)} />
      ) : (
        <input id={id} placeholder=" " className={baseClass} {...(props as any)} />
      )}
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
