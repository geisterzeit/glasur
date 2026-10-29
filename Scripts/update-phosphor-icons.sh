#!/bin/sh
# Regenerates Sources/Glasur/PhosphorCatalog.generated.swift from a pinned
# @phosphor-icons/core release. The download is only read as data, never run.
set -eu

version=2.1.1
integrity=sha512-v4ARvrip4qBCImOE5rmPUylOEK4iiED9ZyKjcvzuezqMaiRASCHKcRIuvvxL/twvLpkfnEODCOJp5dM4eZilxQ==

repository=$(cd "$(dirname "$0")/.." && pwd)
download=$(mktemp -d)
extracted=$(mktemp -d)
trap 'rm -rf "$download" "$extracted"' EXIT

(cd "$download" && npm pack "@phosphor-icons/core@$version" --ignore-scripts --silent >/dev/null)
tarball="$download/phosphor-icons-core-$version.tgz"
actual="sha512-$(openssl dgst -sha512 -binary "$tarball" | base64)"
if [ "$actual" != "$integrity" ]; then
    echo "error: $tarball has integrity $actual, expected $integrity" >&2
    exit 1
fi

tar -xzf "$tarball" -C "$extracted"
swift "$repository/Scripts/GeneratePhosphorCatalog.swift" \
    "$extracted/package/assets" "$version" > "$download/catalog.swift"
mv "$download/catalog.swift" "$repository/Sources/Glasur/PhosphorCatalog.generated.swift"
