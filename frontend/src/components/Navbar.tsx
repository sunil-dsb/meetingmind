"use client";

import { useCallback, useEffect, useState } from "react";
import CloseIcon from "./icons/CloseIcon";
import HamburgerIcon from "./icons/HamburgerMenu";
import LogoIcon from "./icons/LogoIcon";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const navOffset = 88;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - navOffset);
    window.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const navItems = [
    { label: "Features", targetId: "features-section" },
    { label: "How It Works", targetId: "upload-section" },
  ] as const;

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-[100] px-6 transition-all duration-300
        ${
          scrolled || menuOpen
            ? "bg-bg-primary backdrop-blur-xl border-b border-border-subtle shadow-lg"
            : "bg-transparent"
        }
      `}
      role="banner"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 sm:h-17">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xl bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))]">
            <LogoIcon />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] from-text-primary via-accent-primary to-accent-secondary bg-clip-text text-transparent">
            MeetingMind
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollToSection(item.targetId)}
              className="text-sm font-medium px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent-glow/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => scrollToSection("upload-section")}
            className="px-7 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            Get Started
          </button>
        </div>

        <button
          className="md:hidden flex items-center justify-center p-2 rounded-xl border border-border-subtle text-text-primary hover:bg-accent-glow/20 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-colors duration-200"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col pt-4 pb-6 border-t border-border-subtle gap-1 bg-bg-primary/95 backdrop-blur-xl">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollToSection(item.targetId)}
              className="block text-left text-base font-medium px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent-glow/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
          <div className="px-4 pt-3">
            <button
              type="button"
              onClick={() => scrollToSection("upload-section")}
              className="w-full text-sm font-semibold py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-xl hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent-glow/50"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
