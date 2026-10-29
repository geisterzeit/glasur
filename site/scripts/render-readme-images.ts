// Captures the pages in readme-images/ with headless Chrome into the README's docs/ images.
// Run `npm run render-icons` first if the example icons changed.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pages = [
    { page: "header.html", image: "header.png", width: 1200, height: 380 },
    { page: "example.html", image: "example.png", width: 1200, height: 420 },
];

const profile = mkdtempSync(join(tmpdir(), "glasur-chrome-"));
try {
    for (const { page, image, width, height } of pages) {
        execFileSync(chrome, [
            "--headless=new",
            `--user-data-dir=${profile}`,
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            "--default-background-color=00000000",
            "--virtual-time-budget=3000",
            `--window-size=${width},${height}`,
            `--screenshot=${new URL(`../../docs/${image}`, import.meta.url).pathname}`,
            new URL(`../readme-images/${page}`, import.meta.url).href,
        ], { stdio: "ignore" });
        console.log(`Rendered docs/${image}`);
    }
} finally {
    rmSync(profile, { recursive: true, force: true });
}
