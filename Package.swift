// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "glasur",
    platforms: [.macOS(.v26)],
    products: [
        .executable(name: "glasur", targets: ["Glasur"]),
    ],
    targets: [
        .executableTarget(name: "Glasur"),
    ]
)
