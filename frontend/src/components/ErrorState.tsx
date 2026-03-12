import React from 'react';

interface ErrorStateProps {
  errorMsg: string;
  onReset: () => void;
}

export default function ErrorState({ errorMsg, onReset }: ErrorStateProps) {
  let displayError = errorMsg;
  try {
    if (typeof errorMsg === 'string' && errorMsg.startsWith('{')) {
      const parsed = JSON.parse(errorMsg);
      // Use parsed.error if present, or format the JSON so it's readable
      displayError = parsed.error || JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // Ignore parsing errors, display raw
  }

  return (
    <div 
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "0 20px",
        marginTop: "120px",
        marginBottom: "80px"
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "540px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "24px",
          padding: "48px 32px",
          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.08)"
        }}
      >
        <div 
          style={{ 
            fontSize: "56px", 
            marginBottom: "16px", 
            lineHeight: "1",
            filter: "drop-shadow(0 4px 12px rgba(239,68,68,0.3))" 
          }}
        >
          ⚠️
        </div>
        <h3 
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: "800",
            color: "#ef4444",
            marginBottom: "16px",
            letterSpacing: "-0.5px"
          }}
        >
          Processing Failed
        </h3>
        <p 
          style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            marginBottom: "36px",
            maxWidth: "400px",
            wordBreak: "break-word",
            whiteSpace: typeof displayError === "string" && displayError.includes("{") ? "pre-wrap" : "normal",
            textAlign: "center",
            background: typeof displayError === "string" && displayError.includes("{") ? "rgba(0,0,0,0.02)" : "transparent",
            padding: typeof displayError === "string" && displayError.includes("{") ? "12px" : "0",
            borderRadius: "8px"
          }}
        >
          {displayError || "An unexpected error occurred while processing your file. Please try again."}
        </p>
        <button
          onClick={onReset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px 32px",
            borderRadius: "100px",
            background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
            color: "white",
            fontSize: "16px",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 6px 20px rgba(108,99,255,0.3)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(108,99,255,0.45)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,99,255,0.3)"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}
