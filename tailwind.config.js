/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ensure all brand colors are always included
    "bg-brand-blue",
    "bg-brand-blue-700",
    "bg-brand-brown",
    "bg-brand-brown-700",
    "bg-brand-copper",
    "bg-brand-copper-700",
    "bg-brand-white",
    "text-brand-blue",
    "text-brand-brown",
    "text-brand-copper",
    "text-brand-white",
    "border-brand-blue",
    "border-brand-brown",
    "border-brand-copper",
    "hover:bg-brand-blue-700",
    "hover:bg-brand-brown-700",
    "hover:bg-brand-copper-700",
    "hover:text-brand-copper",
    "rounded-brand",
    "rounded-brand-lg",
    "shadow-brand",
    "shadow-brand-lg",
    "shadow-copper",
    "font-heading",
    "font-body",
    "font-arabic",
    "animate-fade-in",
    "animate-slide-up",
    // RTL-specific classes
    "text-right",
    "rtl:text-right",
    "ltr:text-left",
    "rtl:space-x-reverse",
    "rtl:flex-row-reverse",
  ],
  theme: {
    extend: {
      // Andrino Academy Brand Colors
      colors: {
        brand: {
          // Navy Dark Blue - Primary brand color
          blue: {
            DEFAULT: "#343b50",
            50: "#f8f9fa",
            100: "#e9ecf1",
            200: "#d3d9e3",
            300: "#b3bdd0",
            400: "#8c9bb8",
            500: "#6b7aa1",
            600: "#545f89",
            700: "#464f71",
            800: "#3c445e",
            900: "#343b50",
            950: "#232834",
          },
          // Brown Dark Carmel - Secondary brand color
          brown: {
            DEFAULT: "#7e5b3f",
            50: "#faf8f6",
            100: "#f3ede6",
            200: "#e6d9cc",
            300: "#d4c0a8",
            400: "#c0a082",
            500: "#ad8464",
            600: "#9c7159",
            700: "#7e5b3f",
            800: "#6b4d36",
            900: "#5a422f",
            950: "#2f2218",
          },
          // Light Copper - Accent color
          copper: {
            DEFAULT: "#c19170",
            50: "#faf8f6",
            100: "#f4f0ea",
            200: "#e7ddd1",
            300: "#d7c5b0",
            400: "#c19170",
            500: "#b5845f",
            600: "#a57154",
            700: "#895c47",
            800: "#704c3d",
            900: "#5c4034",
            950: "#31211b",
          },
          // White - Clean background
          white: "#ffffff",
        },
      },
      // Typography for Arabic/English support with RTL priorities
      fontFamily: {
        // Arabic-first font stack for RTL
        arabic: [
          "var(--font-cairo)",
          "var(--font-tajawal)",
          "Cairo",
          "Tajawal",
          "system-ui",
          "sans-serif",
        ],
        // Headers - primarily Arabic fonts
        heading: ["var(--font-cairo)", "Cairo", "system-ui", "sans-serif"],
        // Body text - balanced Arabic/Latin
        body: [
          "var(--font-tajawal)",
          "var(--font-cairo)",
          "Tajawal",
          "Cairo",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        // Fallback sans with Arabic support
        sans: [
          "var(--font-cairo)",
          "var(--font-tajawal)",
          "Cairo",
          "Tajawal",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      // RTL-optimized spacing
      spacing: {
        "safe-right": "env(safe-area-inset-right)",
        "safe-left": "env(safe-area-inset-left)",
      },
      // Enhanced typography scales for Arabic
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.6" }],
        sm: ["0.875rem", { lineHeight: "1.7" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.7" }],
        xl: ["1.25rem", { lineHeight: "1.6" }],
        "2xl": ["1.5rem", { lineHeight: "1.5" }],
        "3xl": ["1.875rem", { lineHeight: "1.4" }],
        "4xl": ["2.25rem", { lineHeight: "1.3" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },
      // Border radius for consistency
      borderRadius: {
        brand: "0.5rem",
        "brand-lg": "0.75rem",
      },
      // Box shadows for depth
      boxShadow: {
        brand:
          "0 4px 6px -1px rgba(52, 59, 80, 0.1), 0 2px 4px -1px rgba(52, 59, 80, 0.06)",
        "brand-lg":
          "0 10px 15px -3px rgba(52, 59, 80, 0.1), 0 4px 6px -2px rgba(52, 59, 80, 0.05)",
        copper:
          "0 4px 6px -1px rgba(193, 145, 112, 0.2), 0 2px 4px -1px rgba(193, 145, 112, 0.1)",
      },
      // Animation for smooth interactions
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    // Typography plugin will be added later
  ],
};
