export class RGB {
    static readonly white = new RGB(1, 1, 1);

    constructor(
        readonly red: number,
        readonly green: number,
        readonly blue: number,
    ) {}

    static fromHex(input: string): RGB | undefined {
        const hex = input.startsWith("#") ? input.slice(1) : input;
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) return undefined;
        const value = Number.parseInt(hex, 16);
        return new RGB(((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255);
    }

    get iconValue(): string {
        return `srgb:${this.red.toFixed(5)},${this.green.toFixed(5)},${this.blue.toFixed(5)},1.00000`;
    }

    /** Mixes toward white by `amount`, from 0 (unchanged) to 1 (white). */
    mixedWithWhite(amount: number): RGB {
        return new RGB(
            this.red + (1 - this.red) * amount,
            this.green + (1 - this.green) * amount,
            this.blue + (1 - this.blue) * amount,
        );
    }

    adjusted({ hueDegrees = 0, lightness = 0, saturation = 0 } = {}): RGB {
        const hls = HLS.from(this);
        const hue = wrapToUnit(hls.hue + hueDegrees / 360);
        // A gray has no hue, so saturating it would tint it red.
        const adjustedSaturation = hls.saturation > 0 ? clampToUnit(hls.saturation + saturation) : 0;
        return new HLS(hue, clampToUnit(hls.lightness + lightness), adjustedSaturation).rgb;
    }

    /**
     * Yellow is the lightest hue, so light drifts toward it and shade drifts away from it.
     * This keeps warm colors from turning muddy brown when they darken.
     */
    lit(amount: number, hueDrift = 6): RGB {
        return this.adjusted({ hueDegrees: -this.directionAwayFromYellow * hueDrift, lightness: amount });
    }

    shaded(amount: number, hueDrift = 10): RGB {
        return this.adjusted({ hueDegrees: this.directionAwayFromYellow * hueDrift, lightness: -amount, saturation: 0.08 });
    }

    private get directionAwayFromYellow(): number {
        const yellow = 60 / 360;
        const distance = ((HLS.from(this).hue - yellow + 1.5) % 1) - 0.5;
        return distance >= 0 ? 1 : -1;
    }
}

class HLS {
    constructor(
        readonly hue: number,
        readonly lightness: number,
        readonly saturation: number,
    ) {}

    static from(color: RGB): HLS {
        const maximum = Math.max(color.red, color.green, color.blue);
        const minimum = Math.min(color.red, color.green, color.blue);
        const range = maximum - minimum;
        const lightness = (maximum + minimum) / 2;
        if (range === 0) return new HLS(0, lightness, 0);

        const saturation = lightness <= 0.5 ? range / (maximum + minimum) : range / (2 - maximum - minimum);
        const redDistance = (maximum - color.red) / range;
        const greenDistance = (maximum - color.green) / range;
        const blueDistance = (maximum - color.blue) / range;
        let sector: number;
        if (color.red === maximum) {
            sector = blueDistance - greenDistance;
        } else if (color.green === maximum) {
            sector = 2 + redDistance - blueDistance;
        } else {
            sector = 4 + greenDistance - redDistance;
        }
        return new HLS(wrapToUnit(sector / 6), lightness, saturation);
    }

    get rgb(): RGB {
        const { hue, lightness, saturation } = this;
        if (saturation === 0) return new RGB(lightness, lightness, lightness);
        const upper = lightness <= 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
        const lower = 2 * lightness - upper;
        const channel = (offset: number): number => {
            const position = wrapToUnit(hue + offset);
            if (position < 1 / 6) return lower + (upper - lower) * position * 6;
            if (position < 0.5) return upper;
            if (position < 2 / 3) return lower + (upper - lower) * (2 / 3 - position) * 6;
            return lower;
        };
        return new RGB(channel(1 / 3), channel(0), channel(-1 / 3));
    }
}

function wrapToUnit(value: number): number {
    const remainder = value % 1;
    return remainder < 0 ? remainder + 1 : remainder;
}

function clampToUnit(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}
