import { readFileSync } from "node:fs";
import { icons } from "@phosphor-icons/core";

type Weight = "fill" | "duotone";

interface SVGPath {
    data: string;
    /** Duotone icons draw their inner "back" shape at 20% opacity. */
    isTranslucent: boolean;
}

const iconNames: ReadonlySet<string> = new Set(icons.map((icon) => icon.name));

/** An icon from Phosphor (https://phosphoricons.com), drawn on its 256 × 256 grid. */
export class PhosphorIcon {
    private constructor(
        readonly name: string,
        private readonly fill: SVGPath[],
        private readonly duotone: SVGPath[],
    ) {}

    static named(name: string): PhosphorIcon | undefined {
        if (!iconNames.has(name)) return undefined;
        return new PhosphorIcon(name, readPaths(name, "fill"), readPaths(name, "duotone"));
    }

    get fillSVG(): string {
        return svg(this.fill);
    }

    get outlineSVG(): string {
        return svg(this.duotone.filter((path) => !path.isTranslucent));
    }

    /** Undefined for the few icons without a duotone back shape. */
    get backSVG(): string | undefined {
        const back = this.duotone.filter((path) => path.isTranslucent);
        return back.length > 0 ? svg(back) : undefined;
    }

    /** Icon names that share the most words with `name`, or are spelled almost like it, closest first. */
    static namesResembling(name: string, limit = 8): string[] {
        return [...iconNames]
            .map((candidate) => ({
                candidate,
                sharedWords: sharedWordCount(name, candidate),
                distance: editDistance(name, candidate),
            }))
            .filter(({ sharedWords, distance }) => sharedWords > 0 || distance <= Math.max(1, Math.floor(name.length / 3)))
            .sort((first, second) =>
                second.sharedWords - first.sharedWords ||
                first.distance - second.distance ||
                first.candidate.localeCompare(second.candidate),
            )
            .slice(0, limit)
            .map(({ candidate }) => candidate);
    }
}

/** Path data must stay plain so it can't break out of the SVG attribute. */
const pathData = /^[0-9.,\- eEMmLlHhVvCcSsQqTtAaZz]+$/;

function readPaths(name: string, weight: Weight): SVGPath[] {
    const file = new URL(import.meta.resolve(`@phosphor-icons/core/${weight}/${name}-${weight}.svg`));
    const source = readFileSync(file, "utf8");
    const paths = [...source.matchAll(/<path\b([^>]*)\/>/g)].map(([, attributes = ""]) => ({
        data: /\bd="([^"]*)"/.exec(attributes)?.[1] ?? "",
        isTranslucent: /\bopacity="0\.2"/.test(attributes),
    }));
    if (paths.length === 0 || !paths.every((path) => pathData.test(path.data))) {
        throw new Error(`unexpected artwork in the Phosphor ${weight} icon ${name}`);
    }
    return paths;
}

function svg(paths: SVGPath[]): string {
    const elements = paths.map((path) => `<path d="${path.data}"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${elements}</svg>`;
}

function sharedWordCount(first: string, second: string): number {
    const words = (text: string) => new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const secondWords = words(second);
    return [...words(first)].filter((word) => secondWords.has(word)).length;
}

function editDistance(source: string, target: string): number {
    let previousRow = Array.from({ length: target.length + 1 }, (_, index) => index);
    for (const [sourceIndex, sourceCharacter] of [...source].entries()) {
        const row = [sourceIndex + 1];
        for (const [targetIndex, targetCharacter] of [...target].entries()) {
            row.push(Math.min(
                previousRow[targetIndex + 1]! + 1,
                row[targetIndex]! + 1,
                previousRow[targetIndex]! + (sourceCharacter === targetCharacter ? 0 : 1),
            ));
        }
        previousRow = row;
    }
    return previousRow[target.length]!;
}
