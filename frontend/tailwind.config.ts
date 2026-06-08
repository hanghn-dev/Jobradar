import daisyui from "daisyui";
import lineClamp from "@tailwindcss/line-clamp";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui, lineClamp],
  daisyui: {
    themes: true,
  },
};
