/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          "card-hover": "var(--bg-card-hover)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          green: "var(--accent-green)",
          orange: "var(--accent-orange)",
          glow: "var(--accent-glow)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          subtle: "var(--border-subtle)",
          card: "var(--border-card)",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 20px var(--accent-glow)",
        "glow-lg": "0 0 50px var(--accent-glow)",
      },

      backgroundImage: {
        hero: "var(--gradient-hero)",
        'purple-glow': 'radial-gradient(circle at 30% 30%, rgba(108,99,255,0.15) 0%, transparent 50%)',
        'emerald-glow': 'radial-gradient(circle at 70% 70%, rgba(16,217,160,0.1) 0%, transparent 50%)',
        "gradient-fancy":
          "linear-gradient(135deg, #6c63ff 0%, #a78bfa 50%, #10d9a0 100%)",
      },

      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 20px var(--accent-glow)" },
          "50%": {
            boxShadow:
              "0 0 50px var(--accent-glow), 0 0 80px rgba(108,99,255,0.15)",
          },
        },

        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },

        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        wave: {
          "0%,100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },

        orbit: {
          from: {
            transform: "rotate(0deg) translateX(60px) rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg) translateX(60px) rotate(-360deg)",
          },
        },

        "bounce-dot": {
          "0%,80%,100%": {
            transform: "scale(0.6)",
            opacity: "0.4",
          },
          "40%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },

      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        wave: "wave 1.2s ease-in-out infinite",
        orbit: "orbit 6s linear infinite",
        "bounce-dot": "bounce-dot 1.2s infinite",
        'pulse-glow-cubic': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};