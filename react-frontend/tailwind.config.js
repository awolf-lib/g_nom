module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  purge: false,
  theme: {
    screens: {},
    extend: {
      inset: { 16: "4rem" },
      transitionPropery: { width: "width", height: "height" },
      transitionDuration: {
        2000: "2000ms",
        3000: "3000ms",
      },
      maxHeight: {
        50: "50vh",
        25: "25vh",
        75: "75vh",
        "100px": "100px",
      },
      minHeight: {
        12: "3rem",
        24: "6rem",
        48: "12rem",
        96: "24rem",
        "1/4": "25vh",
        "1/2": "50vh",
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
        "fade-in-fast": "fade-in 0.5s ease-in",
        "fade-in": "fade-in 1s ease-in",
        "fade-in-slow": "fade-in 3s ease-in",
        "slide-left": "slide-left 0.5s",
        "slide-left-slow": "slide-left 1.0s",
        "grow-y": "grow-y 0.5s",
        "grow-y-slow": "grow-y 1.0s",
        wiggle: "wiggle 1s ease-in-out infinite",
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
        "slide-left": {
          "0%": {
            marginLeft: "120%",
          },
          "100%": {
            marginLeft: "0",
          },
        },
        "grow-y": {
          "0%": {
            transform: "scaleY(0)",
            transformOrigin: "top",
          },
          "100%": {
            transform: "scaleY(1)",
            transformOrigin: "top",
          },
        },
        wiggle: {
          "0%, 100%": {
            transform: "rotate(5deg)",
          },
          "50%": {
            transform: "rotate(-5deg)",
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
      animation: ["responsive", "hover", "focus"],
      maxHeight: ["responsive", "hover"],
    },
  },
  plugins: [],
};
