import { RGB } from "./rgb.js";

export const iconStyles = ["default", "paper", "paper-tint", "night", "night-tint"] as const;
export type IconStyle = (typeof iconStyles)[number];

export function isIconStyle(name: string): name is IconStyle {
    return (iconStyles as readonly string[]).includes(name);
}

/** The background and symbol treatment a style derives from the accent color. */
export interface IconLook {
    background: Background;
    symbolFill: RGB;
    /** Fill for the duotone back shape when the symbol is drawn in two tones. */
    detailFill: RGB;
    isGlass: boolean;
    shadow: Shadow;
    translucency: number;
    hasSpecularHighlights: boolean;
}

export type Background =
    | { kind: "automatic-gradient"; color: RGB }
    | { kind: "system-light" }
    | { kind: "vertical-gradient"; top: RGB; bottom: RGB };

export interface Shadow {
    kind: "neutral" | "layer-color";
    opacity: number;
}

export function lookFor(style: IconStyle, accent: RGB): IconLook {
    switch (style) {
        case "default":
            return {
                background: { kind: "automatic-gradient", color: accent },
                symbolFill: RGB.white,
                detailFill: accent.lit(0.3, 24),
                isGlass: false,
                shadow: { kind: "neutral", opacity: 0.3 },
                translucency: 0.4,
                hasSpecularHighlights: false,
            };
        case "paper":
            return {
                background: { kind: "system-light" },
                symbolFill: accent,
                detailFill: accent.lit(0.22, 24),
                isGlass: true,
                shadow: { kind: "layer-color", opacity: 0.6 },
                translucency: 0,
                hasSpecularHighlights: true,
            };
        case "paper-tint":
            return {
                background: { kind: "vertical-gradient", top: accent.mixedWithWhite(0.97), bottom: accent.mixedWithWhite(0.9) },
                symbolFill: accent,
                detailFill: accent.lit(0.22, 24),
                isGlass: true,
                shadow: { kind: "layer-color", opacity: 0.6 },
                translucency: 0,
                hasSpecularHighlights: true,
            };
        case "night":
            return {
                background: { kind: "vertical-gradient", top: new RGB(0.25, 0.25, 0.27), bottom: new RGB(0.08, 0.08, 0.09) },
                symbolFill: accent.adjusted({ lightness: 0.08 }),
                detailFill: accent.lit(0.24, 24),
                isGlass: true,
                shadow: { kind: "layer-color", opacity: 0.7 },
                translucency: 0.4,
                hasSpecularHighlights: true,
            };
        case "night-tint":
            return {
                background: { kind: "vertical-gradient", top: accent.shaded(0.3), bottom: accent.shaded(0.44) },
                symbolFill: accent.lit(0.12),
                detailFill: accent.lit(0.3, 24),
                isGlass: true,
                shadow: { kind: "layer-color", opacity: 0.7 },
                translucency: 0.4,
                hasSpecularHighlights: true,
            };
    }
}

export function iconValue(background: Background): unknown {
    switch (background.kind) {
        case "automatic-gradient":
            return { "automatic-gradient": background.color.iconValue };
        case "system-light":
            return "system-light";
        case "vertical-gradient":
            return {
                "linear-gradient": [background.top.iconValue, background.bottom.iconValue],
                orientation: { start: { x: 0.5, y: 0 }, stop: { x: 0.5, y: 1 } },
            };
    }
}
