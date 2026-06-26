import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  className?: string;
  title?: string;
}

export function Panel({ children, className = "", title }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {title ? <h2 className="panel-title">{title}</h2> : null}
      {children}
    </section>
  );
}
