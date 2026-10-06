import AppKit
import Foundation

struct RGB {
    let red: Double
    let green: Double
    let blue: Double

    var iconValue: String {
        String(format: "srgb:%.5f,%.5f,%.5f,1.00000", red, green, blue)
    }

    func mixedWithWhite(_ amount: Double) -> RGB {
        RGB(
            red: red + (1 - red) * amount,
            green: green + (1 - green) * amount,
            blue: blue + (1 - blue) * amount
        )
    }
}

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data("error: \(message)\n".utf8))
    exit(64)
}

func value(after flag: String, in arguments: [String]) -> String? {
    guard let index = arguments.firstIndex(of: flag), arguments.indices.contains(index + 1) else {
        return nil
    }
    return arguments[index + 1]
}

func parseColor(_ input: String) -> RGB? {
    let hex = input.hasPrefix("#") ? String(input.dropFirst()) : input
    guard hex.count == 6, let value = UInt64(hex, radix: 16) else { return nil }
    return RGB(
        red: Double((value >> 16) & 0xff) / 255,
        green: Double((value >> 8) & 0xff) / 255,
        blue: Double(value & 0xff) / 255
    )
}

let commandArguments = Array(CommandLine.arguments.dropFirst())
if commandArguments.isEmpty || commandArguments == ["--help"] || commandArguments == ["generate", "--help"] {
    print("""
    Usage: glasur generate --symbol <SF Symbol> --color <#RRGGBB> --output <name.icon>

    Generate an editable, layered Liquid Glass Icon Composer source.
    """)
    exit(0)
}
guard commandArguments.first == "generate" else {
    fail("unknown command; use glasur --help for usage")
}
let arguments = Array(commandArguments.dropFirst())
guard let symbolName = value(after: "--symbol", in: arguments), !symbolName.isEmpty else {
    fail("provide an SF Symbol with --symbol")
}
guard let colorText = value(after: "--color", in: arguments), let color = parseColor(colorText) else {
    fail("provide a color as #RRGGBB with --color")
}
guard let outputText = value(after: "--output", in: arguments) else {
    fail("provide an output .icon directory with --output")
}

let output = URL(fileURLWithPath: outputText).standardizedFileURL
guard output.pathExtension == "icon", output.lastPathComponent != ".icon" else {
    fail("output must be a named .icon directory")
}
guard let baseImage = NSImage(systemSymbolName: symbolName, accessibilityDescription: nil) else {
    fail("unknown SF Symbol: \(symbolName)")
}

let configuration = NSImage.SymbolConfiguration(pointSize: 720, weight: .medium, scale: .large)
guard let symbol = baseImage.withSymbolConfiguration(configuration) else {
    fail("could not configure SF Symbol: \(symbolName)")
}

let pixels = 1024
guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: pixels,
    pixelsHigh: pixels,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fail("could not create the icon bitmap")
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.cgContext.clear(CGRect(x: 0, y: 0, width: pixels, height: pixels))
context.imageInterpolation = .high

let maximumDimension = 760.0
let scale = min(maximumDimension / symbol.size.width, maximumDimension / symbol.size.height)
let drawSize = NSSize(width: symbol.size.width * scale, height: symbol.size.height * scale)
let drawRect = NSRect(
    x: (Double(pixels) - drawSize.width) / 2,
    y: (Double(pixels) - drawSize.height) / 2,
    width: drawSize.width,
    height: drawSize.height
)
symbol.draw(in: drawRect, from: .zero, operation: .sourceOver, fraction: 1)
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fail("could not encode the SF Symbol as PNG")
}

let fileManager = FileManager.default
let staging = output.deletingLastPathComponent().appendingPathComponent(".\(output.lastPathComponent).staging-\(UUID().uuidString)")
defer { try? fileManager.removeItem(at: staging) }

do {
    try fileManager.createDirectory(at: staging.appendingPathComponent("Assets"), withIntermediateDirectories: true)
    try png.write(to: staging.appendingPathComponent("Assets/symbol.png"), options: .atomic)

    let icon: [String: Any] = [
        "fill": [
            "linear-gradient": [color.mixedWithWhite(0.90).iconValue, color.mixedWithWhite(0.74).iconValue],
            "orientation": ["start": ["x": 0.5, "y": 0], "stop": ["x": 0.5, "y": 0.78]],
        ],
        "groups": [[
            "layers": [[
                "blend-mode": "normal",
                "fill": ["solid": color.iconValue],
                "image-name": "symbol.png",
                "name": symbolName,
                "position": ["scale": 0.90, "translation-in-points": [0, 0]],
            ]],
            "shadow": ["kind": "neutral", "opacity": 0.45],
            "translucency": ["enabled": true, "value": 0.28],
        ]],
        "supported-platforms": ["circles": ["watchOS"], "squares": "shared"],
    ]
    let json = try JSONSerialization.data(withJSONObject: icon, options: [.prettyPrinted, .sortedKeys])
    try json.write(to: staging.appendingPathComponent("icon.json"), options: .atomic)

    if fileManager.fileExists(atPath: output.path) {
        try fileManager.removeItem(at: output)
    }
    try fileManager.moveItem(at: staging, to: output)
} catch {
    fail("could not write \(output.path): \(error.localizedDescription)")
}

print("Generated \(output.path) from \(symbolName) in \(colorText.uppercased())")
