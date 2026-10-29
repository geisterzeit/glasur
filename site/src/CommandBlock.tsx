import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { IconExample } from "./examples";

interface Option {
    flag: string;
    value?: string;
    swatch?: string;
}

const command = "npx @geisterzeit/glasur generate";

function options(example: IconExample): Option[] {
    return [
        { flag: "--icon", value: example.icon },
        { flag: "--color", value: `'${example.color}'`, swatch: example.color },
        { flag: "--style", value: example.style },
        ...(example.twoTone ? [{ flag: "--two-tone" }] : []),
    ];
}

function commandText(example: IconExample): string {
    const arguments_ = options(example).map(({ flag, value }) => (value ? `${flag} ${value}` : flag));
    return [command, ...arguments_].join(" ");
}

const changeTransition = { type: "spring", stiffness: 420, damping: 34 } as const;

interface CommandBlockProps {
    example: IconExample;
    onHoverChange?: (isHovered: boolean) => void;
}

/** Shows the glasur command for the icon on display, animating each value as it changes. */
export function CommandBlock({ example, onHoverChange }: CommandBlockProps) {
    const lines = options(example);
    return (
        <figure
            className="terminal"
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
        >
            <div className="terminal-bar">
                <span className="terminal-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                </span>
                <CopyButton text={commandText(example)} />
            </div>
            <pre>
                <code>
                    <span className="command-line">
                        <span className="prompt">$ </span>{command}
                        <Continuation />
                    </span>
                    <AnimatePresence initial={false}>
                        {lines.map((option, index) => (
                            <motion.span
                                key={option.flag}
                                className="command-line option"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={changeTransition}
                            >
                                <span className="flag">{option.flag}</span>
                                {option.value && <ChangingValue option={option} />}
                                {index < lines.length - 1 && <Continuation />}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </code>
            </pre>
        </figure>
    );
}

function ChangingValue({ option }: { option: Option }) {
    return (
        <span className="value-slot">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={option.value}
                    className="value"
                    initial={{ opacity: 0, y: "0.7em", filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: "-0.7em", filter: "blur(3px)" }}
                    transition={changeTransition}
                >
                    {option.swatch && <span className="swatch" style={{ background: option.swatch }} />}
                    {option.value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

function Continuation() {
    return <span className="continuation"> \</span>;
}

function CopyButton({ text }: { text: string }) {
    const [isCopied, setCopied] = useState(false);

    useEffect(() => {
        if (!isCopied) return;
        const timer = setTimeout(() => setCopied(false), 1600);
        return () => clearTimeout(timer);
    }, [isCopied]);

    async function copy() {
        await navigator.clipboard.writeText(text);
        setCopied(true);
    }

    return (
        <button type="button" className="copy" onClick={copy}>
            {isCopied ? "Copied" : "Copy"}
        </button>
    );
}
