import Foundation

/// An Icon Composer `.icon` source: a background and one glass group per symbol layer.
struct IconDocument {
    struct SymbolLayer {
        let name: String
        let imageName: String
        let svg: Data
        let fill: RGB
    }

    /// Scales Phosphor's 256 pt grid up to the symbol size on the 1024 pt canvas.
    private static let symbolScale = 2.8

    let look: IconLook
    /// Ordered front-most first, as Icon Composer stores groups.
    let symbolLayers: [SymbolLayer]

    /// A two-tone icon draws the duotone outline in the symbol fill over its back shape in the detail fill.
    /// Icons without a back shape keep one tone.
    init(icon: PhosphorIcon, look: IconLook, isTwoTone: Bool) {
        self.look = look
        if isTwoTone, let backSVG = icon.backSVG {
            symbolLayers = [
                SymbolLayer(name: "\(icon.name) outline", imageName: "symbol-outline.svg", svg: icon.outlineSVG, fill: look.symbolFill),
                SymbolLayer(name: "\(icon.name) back", imageName: "symbol-back.svg", svg: backSVG, fill: look.detailFill),
            ]
        } else {
            symbolLayers = [SymbolLayer(name: icon.name, imageName: "symbol.svg", svg: icon.fillSVG, fill: look.symbolFill)]
        }
    }

    func write(to output: URL) throws {
        let fileManager = FileManager.default
        let staging = output.deletingLastPathComponent()
            .appendingPathComponent(".\(output.lastPathComponent).staging-\(UUID().uuidString)")
        defer { try? fileManager.removeItem(at: staging) }

        let assets = staging.appendingPathComponent("Assets")
        try fileManager.createDirectory(at: assets, withIntermediateDirectories: true)
        for layer in symbolLayers {
            try layer.svg.write(to: assets.appendingPathComponent(layer.imageName), options: .atomic)
        }
        let json = try JSONSerialization.data(withJSONObject: iconJSON, options: [.prettyPrinted, .sortedKeys])
        try json.write(to: staging.appendingPathComponent("icon.json"), options: .atomic)

        if fileManager.fileExists(atPath: output.path) {
            try fileManager.removeItem(at: output)
        }
        try fileManager.moveItem(at: staging, to: output)
    }

    private var iconJSON: [String: Any] {
        [
            "fill": look.background.iconValue,
            "groups": symbolLayers.map(group),
            "supported-platforms": ["circles": ["watchOS"], "squares": "shared"],
        ]
    }

    private func group(containing layer: SymbolLayer) -> [String: Any] {
        [
            "layers": [[
                "blend-mode": "normal",
                "fill": ["solid": layer.fill.iconValue],
                "glass": look.isGlass,
                "image-name": layer.imageName,
                "name": layer.name,
                "position": ["scale": Self.symbolScale, "translation-in-points": [0, 0]],
            ]],
            "shadow": ["kind": look.shadow.kind.rawValue, "opacity": look.shadow.opacity],
            "specular": look.hasSpecularHighlights,
            "translucency": ["enabled": look.translucency > 0, "value": look.translucency],
        ]
    }
}
