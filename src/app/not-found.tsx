import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center-state">
      <p className="eyebrow">Signal lost · 404</p>
      <h1>This page is outside the known network.</h1>
      <Link className="primary-link" href="/about">Return to portfolio</Link>
    </div>
  );
}
