import Foundation

struct RGB {
    let red: Double
    let green: Double
    let blue: Double

    static let white = RGB(red: 1, green: 1, blue: 1)

    init(red: Double, green: Double, blue: Double) {
        self.red = red
        self.green = green
        self.blue = blue
    }

    init?(hex input: String) {
        let hex = input.hasPrefix("#") ? String(input.dropFirst()) : input
        guard hex.count == 6, let value = UInt64(hex, radix: 16) else { return nil }
        self.init(
            red: Double((value >> 16) & 0xff) / 255,
            green: Double((value >> 8) & 0xff) / 255,
            blue: Double(value & 0xff) / 255
        )
    }

    var iconValue: String {
        String(format: "srgb:%.5f,%.5f,%.5f,1.00000", red, green, blue)
    }

    /// Mixes toward white by `amount`, from 0 (unchanged) to 1 (white).
    func mixedWithWhite(_ amount: Double) -> RGB {
        RGB(
            red: red + (1 - red) * amount,
            green: green + (1 - green) * amount,
            blue: blue + (1 - blue) * amount
        )
    }

    func adjusted(hueDegrees: Double = 0, lightness: Double = 0, saturation: Double = 0) -> RGB {
        var hls = HLS(self)
        hls.hue = (hls.hue + hueDegrees / 360).truncatingRemainder(dividingBy: 1)
        if hls.hue < 0 { hls.hue += 1 }
        hls.lightness = min(max(hls.lightness + lightness, 0), 1)
        // A gray has no hue, so saturating it would tint it red.
        if hls.saturation > 0 {
            hls.saturation = min(max(hls.saturation + saturation, 0), 1)
        }
        return hls.rgb
    }

    /// Yellow is the lightest hue, so light drifts toward it and shade drifts away from it.
    /// This keeps warm colors from turning muddy brown when they darken.
    func lit(by amount: Double, hueDrift: Double = 6) -> RGB {
        adjusted(hueDegrees: -directionAwayFromYellow * hueDrift, lightness: amount)
    }

    func shaded(by amount: Double, hueDrift: Double = 10) -> RGB {
        adjusted(hueDegrees: directionAwayFromYellow * hueDrift, lightness: -amount, saturation: 0.08)
    }

    private var directionAwayFromYellow: Double {
        let yellow = 60.0 / 360
        let distance = (HLS(self).hue - yellow + 1.5).truncatingRemainder(dividingBy: 1) - 0.5
        return distance >= 0 ? 1 : -1
    }
}

private struct HLS {
    var hue: Double
    var lightness: Double
    var saturation: Double

    init(_ color: RGB) {
        let maximum = max(color.red, color.green, color.blue)
        let minimum = min(color.red, color.green, color.blue)
        let range = maximum - minimum
        lightness = (maximum + minimum) / 2
        guard range > 0 else {
            hue = 0
            saturation = 0
            return
        }
        saturation = lightness <= 0.5 ? range / (maximum + minimum) : range / (2 - maximum - minimum)
        let redDistance = (maximum - color.red) / range
        let greenDistance = (maximum - color.green) / range
        let blueDistance = (maximum - color.blue) / range
        let sector: Double
        if color.red == maximum {
            sector = blueDistance - greenDistance
        } else if color.green == maximum {
            sector = 2 + redDistance - blueDistance
        } else {
            sector = 4 + greenDistance - redDistance
        }
        hue = (sector / 6).truncatingRemainder(dividingBy: 1)
        if hue < 0 { hue += 1 }
    }

    var rgb: RGB {
        guard saturation > 0 else { return RGB(red: lightness, green: lightness, blue: lightness) }
        let upper = lightness <= 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
        let lower = 2 * lightness - upper
        func channel(_ offset: Double) -> Double {
            var position = (hue + offset).truncatingRemainder(dividingBy: 1)
            if position < 0 { position += 1 }
            if position < 1.0 / 6 { return lower + (upper - lower) * position * 6 }
            if position < 0.5 { return upper }
            if position < 2.0 / 3 { return lower + (upper - lower) * (2.0 / 3 - position) * 6 }
            return lower
        }
        return RGB(red: channel(1.0 / 3), green: channel(0), blue: channel(-1.0 / 3))
    }
}
