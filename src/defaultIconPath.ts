import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

/** Matches the App Icon name Xcode sets on new app targets. */
const iconFileName = "AppIcon.icon";
const assetCatalogName = "Assets.xcassets";

/**
 * Where the app icon belongs when no output is given: next to the app's asset catalog, as in
 * Xcode's app template, or in Resources/ for a Swift package without one.
 */
export function defaultIconPath(projectDirectory: string): string {
    const catalogDirectories = [projectDirectory, ...visibleSubdirectories(projectDirectory)]
        .filter((directory) => existsSync(join(directory, assetCatalogName)));
    if (catalogDirectories.length > 1) {
        const catalogs = catalogDirectories.map((directory) => relative(projectDirectory, join(directory, assetCatalogName)));
        throw new Error(`found several asset catalogs (${catalogs.join(", ")}); choose where the icon goes with --output`);
    }
    return join(catalogDirectories[0] ?? join(projectDirectory, "Resources"), iconFileName);
}

function visibleSubdirectories(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules")
        .map((entry) => join(directory, entry.name));
}
