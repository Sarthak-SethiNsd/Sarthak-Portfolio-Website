"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="center-state"><h1>Something interrupted this signal.</h1><p>The content may be incomplete or temporarily unavailable.</p><button className="primary-link" onClick={reset} type="button">Try again</button></div>;
}
