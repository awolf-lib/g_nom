module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      transitionPropery: { width: "width", height: "height" },
      maxHeight: {
        50: "50vh",
        25: "25vh",
        75: "75vh",
        "100px": "100px",
      },
      height: {
        50: "50vh",
        25: "25vh",
        75: "75vh",
      },
      maxWeight: {
        "100px": "100px",
      },
      strokeWidth: {
        10: "10",
      },
      fill: {
        transparent: "transparent",
      },
      animation: {
        "spin-slow": "spin 30s linear infinite",
        "fade-in": "fade-in 1s ease-in",
        "fade-in-slow": "fade-in 3s ease-in",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  variants: {
    extend: {
      fontWeight: ["responsive", "hover"],
      backgroundColor: ["responsive", "hover", "odd", "even"],
      opacity: ["responsive", "hover"],
      width: ["responsive", "hover"],
      display: ["responsive", "hover"],
      ringWidth: ["responsive", "hover", "focus"],
    },
  },
  plugins: [],
};
