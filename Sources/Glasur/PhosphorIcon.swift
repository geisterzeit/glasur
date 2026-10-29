import Foundation

/// An icon from Phosphor (https://phosphoricons.com), drawn on its 256 × 256 grid.
struct PhosphorIcon {
    private struct Paths: Decodable {
        /// The fill weight: the whole icon as solid shapes.
        let fill: [String]
        /// The duotone weight's translucent inner shape. Empty for a few icons.
        let back: [String]
        /// The duotone weight's outline, drawn over the back shape.
        let front: [String]
    }

    private static let catalog: [String: Paths] = {
        do {
            return try JSONDecoder().decode([String: Paths].self, from: Data(catalogJSON.utf8))
        } catch {
            fatalError("The embedded Phosphor catalog is invalid: \(error)")
        }
    }()

    let name: String
    private let paths: Paths

    init?(named name: String) {
        guard let paths = Self.catalog[name] else { return nil }
        self.name = name
        self.paths = paths
    }

    var fillSVG: Data { Self.svg(paths.fill) }
    var outlineSVG: Data { Self.svg(paths.front) }
    var backSVG: Data? { paths.back.isEmpty ? nil : Self.svg(paths.back) }

    private static func svg(_ paths: [String]) -> Data {
        let elements = paths.map { #"<path d="\#($0)"/>"# }.joined()
        return Data(#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">\#(elements)</svg>"#.utf8)
    }

    /// Icon names that share the most words with `name`, or are spelled almost like it, closest first.
    static func names(resembling name: String, limit: Int = 8) -> [String] {
        catalog.keys
            .map { (candidate: $0, sharedWords: sharedWordCount(name, $0), distance: editDistance(from: name, to: $0)) }
            .filter { $0.sharedWords > 0 || $0.distance <= max(1, name.count / 3) }
            .sorted { (-$0.sharedWords, $0.distance, $0.candidate) < (-$1.sharedWords, $1.distance, $1.candidate) }
            .prefix(limit)
            .map(\.candidate)
    }

    private static func sharedWordCount(_ first: String, _ second: String) -> Int {
        func words(_ text: String) -> Set<Substring> {
            Set(text.lowercased().split { !$0.isLetter && !$0.isNumber })
        }
        return words(first).intersection(words(second)).count
    }

    private static func editDistance(from source: String, to target: String) -> Int {
        let target = Array(target)
        var previousRow = Array(0...target.count)
        for (sourceIndex, sourceCharacter) in source.enumerated() {
            var row = [sourceIndex + 1]
            for (targetIndex, targetCharacter) in target.enumerated() {
                row.append(min(
                    previousRow[targetIndex + 1] + 1,
                    row[targetIndex] + 1,
                    previousRow[targetIndex] + (sourceCharacter == targetCharacter ? 0 : 1)
                ))
            }
            previousRow = row
        }
        return previousRow[target.count]
    }
}
