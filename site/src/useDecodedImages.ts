import { useEffect, useState, type RefObject } from "react";

/**
 * Whether every image inside `container` is decoded. Starting animations only then keeps the
 * first appearance of each image from stalling a frame mid-animation.
 */
export function useDecodedImages(container: RefObject<HTMLElement | null>): boolean {
    const [isDecoded, setDecoded] = useState(false);

    useEffect(() => {
        const images = [...(container.current?.querySelectorAll("img") ?? [])];
        let isCurrent = true;
        Promise.allSettled(images.map((image) => image.decode())).then(() => {
            if (isCurrent) setDecoded(true);
        });
        return () => {
            isCurrent = false;
        };
    }, [container]);

    return isDecoded;
}
