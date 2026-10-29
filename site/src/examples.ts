import examples from "./examples.json";

/** An icon on the page, with the glasur options that generated it. */
export interface IconExample {
    icon: string;
    color: string;
    style: string;
    twoTone: boolean;
}

export const iconExamples: IconExample[] = examples;

export function imageURL(example: IconExample): string {
    return `${import.meta.env.BASE_URL}icons/${example.icon}.webp`;
}
