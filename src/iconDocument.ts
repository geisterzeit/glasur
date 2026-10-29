import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { iconValue, type IconLook } from "./iconStyle.js";
import type { PhosphorIcon } from "./phosphorIcon.js";
import type { RGB } from "./rgb.js";

interface SymbolLayer {
    name: string;
    imageName: string;
    svg: string;
    fill: RGB;
}

/** Scales Phosphor's 256 pt grid up to the symbol size on the 1024 pt canvas. */
const symbolScale = 2.8;

/** An Icon Composer `.icon` source: a background and one glass group per symbol layer. */
export class IconDocument {
    /** Ordered front-most first, as Icon Composer stores groups. */
    readonly symbolLayers: SymbolLayer[];

    /**
     * A two-tone icon draws the duotone outline in the symbol fill over its back shape in the detail fill.
     * Icons without a back shape keep one tone.
     */
    constructor(
        icon: PhosphorIcon,
        private readonly look: IconLook,
        isTwoTone: boolean,
    ) {
        const backSVG = isTwoTone ? icon.backSVG : undefined;
        this.symbolLayers = backSVG
            ? [
                  { name: `${icon.name} outline`, imageName: "symbol-outline.svg", svg: icon.outlineSVG, fill: look.symbolFill },
                  { name: `${icon.name} back`, imageName: "symbol-back.svg", svg: backSVG, fill: look.detailFill },
              ]
            : [{ name: icon.name, imageName: "symbol.svg", svg: icon.fillSVG, fill: look.symbolFill }];
    }

    write(output: string): void {
        const staging = join(dirname(output), `.${basename(output)}.staging-${randomUUID()}`);
        try {
            const assets = join(staging, "Assets");
            mkdirSync(assets, { recursive: true });
            for (const layer of this.symbolLayers) {
                writeFileSync(join(assets, layer.imageName), layer.svg);
            }
            writeFileSync(join(staging, "icon.json"), `${JSON.stringify(this.iconJSON, undefined, 2)}\n`);

            if (existsSync(output)) rmSync(output, { recursive: true });
            renameSync(staging, output);
        } finally {
            rmSync(staging, { recursive: true, force: true });
        }
    }

    private get iconJSON(): unknown {
        return {
            fill: iconValue(this.look.background),
            groups: this.symbolLayers.map((layer) => this.group(layer)),
            "supported-platforms": { circles: ["watchOS"], squares: "shared" },
        };
    }

    private group(layer: SymbolLayer): unknown {
        return {
            layers: [
                {
                    "blend-mode": "normal",
                    fill: { solid: layer.fill.iconValue },
                    glass: this.look.isGlass,
                    "image-name": layer.imageName,
                    name: layer.name,
                    position: { scale: symbolScale, "translation-in-points": [0, 0] },
                },
            ],
            shadow: { kind: this.look.shadow.kind, opacity: this.look.shadow.opacity },
            specular: this.look.hasSpecularHighlights,
            translucency: { enabled: this.look.translucency > 0, value: this.look.translucency },
        };
    }
}
