// Renders every example in src/examples.json to public/icons with the glasur in this
// repository, Icon Composer's ictool and ImageMagick, and saves the macOS icon shape
// the stack masks its cards with. Run `npm run build` in the repository root first.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import examples from "../src/examples.json" with { type: "json" };

const glasur = new URL("../../dist/main.js", import.meta.url).pathname;
const ictool = "/Applications/Icon Composer.app/Contents/Executables/ictool";
const iconsDirectory = new URL("../public/icons/", import.meta.url).pathname;
const iconShape = new URL("../src/assets/icon-shape.png", import.meta.url).pathname;
const renderedPixels = "640";

const workspace = mkdtempSync(join(tmpdir(), "glasur-site-"));
try {
    for (const { icon, color, style, twoTone } of examples) {
        const source = join(workspace, `${icon}.icon`);
        execFileSync("node", [
            glasur, "generate", "--icon", icon, "--color", color, "--style", style,
            ...(twoTone ? ["--two-tone"] : []), "--output", source,
        ]);
        const rendering = join(workspace, `${icon}.png`);
        execFileSync(ictool, [
            source, "--export-image", "--output-file", rendering,
            "--platform", "macOS", "--rendition", "Default",
            "--width", renderedPixels, "--height", renderedPixels, "--scale", "1",
        ]);
        execFileSync("magick", [rendering, "-quality", "90", join(iconsDirectory, `${icon}.webp`)]);
        console.log(`Rendered ${icon}`);
    }
    const anyRendering = join(workspace, `${examples[0]!.icon}.png`);
    execFileSync("magick", [anyRendering, "-strip", "-fill", "black", "-colorize", "100", iconShape]);
} finally {
    rmSync(workspace, { recursive: true, force: true });
}
