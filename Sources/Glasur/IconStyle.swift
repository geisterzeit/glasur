import Foundation

enum IconStyle: String, CaseIterable {
    case `default`
    case paper
    case paperTint = "paper-tint"
    case night
    case nightTint = "night-tint"

    func look(accent: RGB) -> IconLook {
        switch self {
        case .default:
            IconLook(
                background: .automaticGradient(accent),
                symbolFill: .white,
                detailFill: accent.lit(by: 0.30, hueDrift: 24),
                isGlass: false,
                shadow: Shadow(kind: .neutral, opacity: 0.3),
                translucency: 0.4,
                hasSpecularHighlights: false
            )
        case .paper:
            IconLook(
                background: .systemLight,
                symbolFill: accent,
                detailFill: accent.lit(by: 0.22, hueDrift: 24),
                isGlass: true,
                shadow: Shadow(kind: .chromatic, opacity: 0.6),
                translucency: 0,
                hasSpecularHighlights: true
            )
        case .paperTint:
            IconLook(
                background: .verticalGradient(top: accent.mixedWithWhite(0.97), bottom: accent.mixedWithWhite(0.90)),
                symbolFill: accent,
                detailFill: accent.lit(by: 0.22, hueDrift: 24),
                isGlass: true,
                shadow: Shadow(kind: .chromatic, opacity: 0.6),
                translucency: 0,
                hasSpecularHighlights: true
            )
        case .night:
            IconLook(
                background: .verticalGradient(
                    top: RGB(red: 0.25, green: 0.25, blue: 0.27),
                    bottom: RGB(red: 0.08, green: 0.08, blue: 0.09)
                ),
                symbolFill: accent.adjusted(lightness: 0.08),
                detailFill: accent.lit(by: 0.24, hueDrift: 24),
                isGlass: true,
                shadow: Shadow(kind: .chromatic, opacity: 0.7),
                translucency: 0.4,
                hasSpecularHighlights: true
            )
        case .nightTint:
            IconLook(
                background: .verticalGradient(top: accent.shaded(by: 0.30), bottom: accent.shaded(by: 0.44)),
                symbolFill: accent.lit(by: 0.12),
                detailFill: accent.lit(by: 0.30, hueDrift: 24),
                isGlass: true,
                shadow: Shadow(kind: .chromatic, opacity: 0.7),
                translucency: 0.4,
                hasSpecularHighlights: true
            )
        }
    }
}

/// The background and symbol treatment a style derives from the accent color.
struct IconLook {
    let background: Background
    let symbolFill: RGB
    /// Fill for the smaller symbol layer when the symbol is split into two tones.
    let detailFill: RGB
    let isGlass: Bool
    let shadow: Shadow
    let translucency: Double
    let hasSpecularHighlights: Bool
}

enum Background {
    case automaticGradient(RGB)
    case systemLight
    case verticalGradient(top: RGB, bottom: RGB)

    var iconValue: Any {
        switch self {
        case .automaticGradient(let color):
            ["automatic-gradient": color.iconValue]
        case .systemLight:
            "system-light"
        case .verticalGradient(let top, let bottom):
            [
                "linear-gradient": [top.iconValue, bottom.iconValue],
                "orientation": ["start": ["x": 0.5, "y": 0], "stop": ["x": 0.5, "y": 1]],
            ]
        }
    }
}

struct Shadow {
    enum Kind: String {
        case neutral
        case chromatic = "layer-color"
    }

    let kind: Kind
    let opacity: Double
}
