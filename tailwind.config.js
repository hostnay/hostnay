/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B1F3A",
        secondary: "#081426",
        accent: "#1E5EFF",
        glow: "#3B82F6"
      },
      boxShadow: {
        glass: "0 20px 60px rgba(2, 8, 23, 0.45)",
        soft: "0 10px 30px rgba(15, 23, 42, 0.35)",
        glow: "0 0 35px rgba(30, 94, 255, 0.5)"
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"]
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top, rgba(30, 94, 255, 0.25), transparent 55%)",
        "glass-gradient": "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 94, 255, 0.12))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        glow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
