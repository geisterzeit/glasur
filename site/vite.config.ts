import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Relative asset paths work both at geisterzeit.github.io/glasur and on a custom domain.
export default defineConfig({
    base: "./",
    plugins: [react()],
});
