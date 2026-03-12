export default function Footer() {
  return (
    <footer
      className="px-6 text-center"
      style={{
        paddingTop: "48px",
        paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C8.13 1 5 4.13 5 8C5 12.5 12 23 12 23C12 23 19 12.5 19 8C19 4.13 15.87 1 12 1Z" fill="#ffffff" opacity="0.9" />
            <circle cx="12" cy="8" r="3" fill="#ffffff" />
          </svg>
        </div>
        <span className="text-[16px] font-bold bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
          MeetingMind
        </span>
      </div>
      <p className="text-[13px] text-[var(--text-muted)]">
        (c) 2026 MeetingMind | AI Meeting Intelligence | Built with Next.js
      </p>
    </footer>
  );
}
