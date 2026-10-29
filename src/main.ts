#!/usr/bin/env node
import { relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { defaultIconPath } from "./defaultIconPath.js";
import { IconDocument } from "./iconDocument.js";
import { iconStyles, isIconStyle, lookFor } from "./iconStyle.js";
import { PhosphorIcon } from "./phosphorIcon.js";
import { RGB } from "./rgb.js";

const styleNames = iconStyles.join("|");

const usage = `Usage: glasur generate --icon <Phosphor icon> --color <#RRGGBB>
                       [--output <name.icon>] [--style ${styleNames}] [--two-tone]

Generate an editable, layered Liquid Glass Icon Composer source from a
Phosphor icon (https://phosphoricons.com), such as sneaker-move.

Without --output, glasur writes AppIcon.icon next to the app's Assets.xcassets,
or to Resources/AppIcon.icon if the project has no asset catalog.

Styles:
  default     Gradient background in the color, flat white symbol
  paper       System light background, symbol in the color
  paper-tint  Background in a very light tint of the color, symbol in the color
  night       Dark gray background, symbol in the color
  night-tint  Background in a very dark shade of the color, symbol in the color

--two-tone    Draw the outline in the color over a lighter inner shape`;

function fail(message: string): never {
    console.error(`error: ${message}`);
    process.exit(64);
}

function parseCommandLine() {
    try {
        return parseArgs({
            allowPositionals: true,
            options: {
                icon: { type: "string" },
                color: { type: "string" },
                output: { type: "string" },
                style: { type: "string", default: "default" },
                "two-tone": { type: "boolean", default: false },
                help: { type: "boolean", short: "h", default: false },
            },
        });
    } catch (error) {
        fail(`${(error as Error).message}; use glasur --help for usage`);
    }
}

function outputForProject(projectDirectory: string): string {
    try {
        return defaultIconPath(projectDirectory);
    } catch (error) {
        fail((error as Error).message);
    }
}

const { values: options, positionals } = parseCommandLine();
if (positionals.length === 0 || options.help) {
    console.log(usage);
    process.exit(0);
}
if (positionals.length > 1 || positionals[0] !== "generate") {
    fail("unknown command; use glasur --help for usage");
}

const iconName = options.icon;
if (!iconName) fail("provide a Phosphor icon name with --icon, such as sneaker-move");
const colorText = options.color ?? "";
const color = RGB.fromHex(colorText);
if (!color) fail("provide a color as #RRGGBB with --color");
const style = options.style;
if (!isIconStyle(style)) fail(`unknown style ${style}; use one of ${styleNames}`);
const isTwoTone = options["two-tone"];

const output = options.output ? resolve(options.output) : outputForProject(process.cwd());
if (!output.endsWith(".icon") || output.endsWith("/.icon")) {
    fail("output must be a named .icon directory");
}
const icon = PhosphorIcon.named(iconName);
if (!icon) {
    const suggestions = PhosphorIcon.namesResembling(iconName);
    const hint = suggestions.length > 0
        ? `did you mean ${suggestions.join(", ")}?`
        : "browse the icons at https://phosphoricons.com";
    fail(`unknown Phosphor icon ${iconName}; ${hint}`);
}
const document = new IconDocument(icon, lookFor(style, color), isTwoTone);
if (isTwoTone && document.symbolLayers.length === 1) {
    console.log(`note: ${iconName} has no duotone inner shape, so the icon uses one tone`);
}

try {
    document.write(output);
} catch (error) {
    fail(`could not write ${output}: ${(error as Error).message}`);
}

console.log(`Generated ${relative(process.cwd(), output)} from ${iconName} in ${colorText.toUpperCase()} with the ${style} style`);
