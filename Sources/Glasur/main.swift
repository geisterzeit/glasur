import Foundation

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

let styleNames = IconStyle.allCases.map(\.rawValue).joined(separator: "|")

let commandArguments = Array(CommandLine.arguments.dropFirst())
if commandArguments.isEmpty || commandArguments == ["--help"] || commandArguments == ["generate", "--help"] {
    print("""
    Usage: glasur generate --icon <Phosphor icon> --color <#RRGGBB> --output <name.icon>
                           [--style \(styleNames)] [--two-tone]

    Generate an editable, layered Liquid Glass Icon Composer source from a
    Phosphor icon (https://phosphoricons.com), such as sneaker-move.

    Styles:
      default     Gradient background in the color, flat white symbol
      paper       System light background, symbol in the color
      paper-tint  Background in a very light tint of the color, symbol in the color
      night       Dark gray background, symbol in the color
      night-tint  Background in a very dark shade of the color, symbol in the color

    --two-tone    Draw the outline in the color over a lighter inner shape
    """)
    exit(0)
}
guard commandArguments.first == "generate" else {
    fail("unknown command; use glasur --help for usage")
}
let arguments = Array(commandArguments.dropFirst())
guard let iconName = value(after: "--icon", in: arguments), !iconName.isEmpty else {
    fail("provide a Phosphor icon name with --icon, such as sneaker-move")
}
guard let colorText = value(after: "--color", in: arguments), let color = RGB(hex: colorText) else {
    fail("provide a color as #RRGGBB with --color")
}
guard let outputText = value(after: "--output", in: arguments) else {
    fail("provide an output .icon directory with --output")
}
let styleText = value(after: "--style", in: arguments) ?? IconStyle.default.rawValue
guard let style = IconStyle(rawValue: styleText) else {
    fail("unknown style \(styleText); use one of \(styleNames)")
}
let isTwoTone = arguments.contains("--two-tone")

let output = URL(fileURLWithPath: outputText).standardizedFileURL
guard output.pathExtension == "icon", output.lastPathComponent != ".icon" else {
    fail("output must be a named .icon directory")
}
guard let icon = PhosphorIcon(named: iconName) else {
    let suggestions = PhosphorIcon.names(resembling: iconName)
    let hint = suggestions.isEmpty
        ? "browse the icons at https://phosphoricons.com"
        : "did you mean \(suggestions.joined(separator: ", "))?"
    fail("unknown Phosphor icon \(iconName); \(hint)")
}
let document = IconDocument(icon: icon, look: style.look(accent: color), isTwoTone: isTwoTone)
if isTwoTone, document.symbolLayers.count == 1 {
    print("note: \(iconName) has no duotone inner shape, so the icon uses one tone")
}

do {
    try document.write(to: output)
} catch {
    fail("could not write \(output.path): \(error.localizedDescription)")
}

print("Generated \(output.path) from \(iconName) in \(colorText.uppercased()) with the \(style.rawValue) style")
