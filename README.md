# glasur

I find myself creaing more and more small utiliry macOS apps and wanted an easy way for me (and my agents) to create icons that fit the macOS look without fiddling with Icon Composer.

Glasur turns an [SF Symbols](https://developer.apple.com/sf-symbols/) icon and an accent color into an editable, layered Liquid Glass Icon Composer `.icon` source.

For example, this command:

```sh
glasur generate \
  --symbol shoe.2.fill --color '#5E5CE6' --output Resources/AppIcon.icon
```

generates this icon:

![Icon generated from shoe.2.fill and #5E5CE6](docs/example-icon.png)

## Use in one project

From your project's root directory, clone glasur and run it:

```sh
git clone https://github.com/geisterzeit/glasur.git BuildTools/glasur
swift run --package-path BuildTools/glasur glasur generate \
  --symbol shoe.2.fill --color '#5E5CE6' --output Resources/AppIcon.icon
```

## Install for all projects

From a glasur checkout, install to `~/.local/bin`:

```sh
make install
```

Add this to `~/.zshrc`:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Open a new terminal, then run from any project:

```sh
glasur generate \
  --symbol shoe.2.fill --color '#5E5CE6' --output Resources/AppIcon.icon
```

## Run during an Xcode build

Generate the icon once, add `Resources/AppIcon.icon` to your app target, and set
the target's **App Icon** to `AppIcon`.

To regenerate it during builds, add a **Run Script** phase before **Copy Bundle
Resources**. With glasur installed, use:

```sh
set -eu
export PATH="$HOME/.local/bin:$PATH"
glasur generate \
  --symbol shoe.2.fill --color '#5E5CE6' \
  --output "$SRCROOT/Resources/AppIcon.icon"
```

Set the phase's **Output Files** to `$(SRCROOT)/Resources/AppIcon.icon`, uncheck
**Based on dependency analysis**, and set the target's **User Script Sandboxing**
to **No**. Each run replaces the generated icon.
