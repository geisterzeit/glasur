import { MotionConfig } from "motion/react";
import { useRef, useState } from "react";
import { CommandBlock } from "./CommandBlock";
import Stack from "./components/Stack/Stack";
import { iconExamples, imageURL } from "./examples";
import { useDecodedImages } from "./useDecodedImages";

export function App() {
    const [shownIndex, setShownIndex] = useState(0);
    const shownExample = iconExamples[shownIndex] ?? iconExamples[0]!;
    const stackFrame = useRef<HTMLDivElement>(null);
    const areIconsDecoded = useDecodedImages(stackFrame);
    const [isCommandHovered, setCommandHovered] = useState(false);

    return (
        <MotionConfig reducedMotion="user">
            <main className="page">
                <section className="introduction">
                    <h1 className="wordmark">glasur</h1>
                    <p className="lede">Liquid Glass app icons for your Mac apps, from a single command.</p>
                    <p className="description">
                        Pick one of 1,512 <a href="https://phosphoricons.com">Phosphor icons</a> and an accent color.
                        glasur writes an editable, layered Icon Composer file that Xcode builds into your app icon.
                    </p>
                    <CommandBlock example={shownExample} onHoverChange={setCommandHovered} />
                    <nav className="links" aria-label="Project links">
                        <a href="https://github.com/geisterzeit/glasur">GitHub</a>
                        <a href="https://www.npmjs.com/package/@geisterzeit/glasur">npm</a>
                        <a href="https://phosphoricons.com">Phosphor Icons</a>
                    </nav>
                </section>

                <section className="examples" aria-label="Example icons">
                    <div className="stack-frame" ref={stackFrame}>
                        <Stack
                            cards={iconExamples.map((example) => (
                                <img
                                    key={example.icon}
                                    src={imageURL(example)}
                                    alt={`${example.icon} in ${example.color} with the ${example.style} style`}
                                    draggable={false}
                                />
                            ))}
                            layout="cascade"
                            tilt={60}
                            radius={0}
                            shadow={false}
                            visible={3}
                            depth={0.7}
                            threshold={40}
                            speed={0.6}
                            spread={1}
                            autoplay={areIconsDecoded && !isCommandHovered}
                            autoplayDelay={4000}
                            sendToBackOnClick
                            pauseOnHover
                            onChange={setShownIndex}
                        />
                    </div>
                </section>
            </main>
        </MotionConfig>
    );
}
