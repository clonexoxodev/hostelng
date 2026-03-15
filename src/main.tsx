import { createRoot } from "react-dom/client";
import { Component, ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";

// Global error boundary — prevents blank white screen on runtime errors
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: '4rem auto' }}>
          <h1 style={{ color: '#e53e3e' }}>Something went wrong</h1>
          <p style={{ color: '#555' }}>The app encountered an error. Please try refreshing the page.</p>
          <pre style={{ background: '#f7f7f7', padding: '1rem', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', color: '#333' }}>
            {err.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
