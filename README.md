# glasur

I find myself creating more and more small utility macOS apps and wanted an easy way for me (and my agents) to create icons that fit the macOS look without fiddling with Icon Composer.

Glasur turns a [Phosphor](https://phosphoricons.com) icon and an accent color into an editable, layered Liquid Glass Icon Composer `.icon` source.

For example, this command:

```sh
glasur generate \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
```

generates this icon:

![Icon generated from sneaker-move and #5E5CE6](docs/example-icon.png)

## Icons

`--icon` takes the name of any of the 1,512 [Phosphor icons](https://phosphoricons.com),
such as `sneaker-move`, `clock-countdown` or `gear-six`. Glasur uses the fill
weight and keeps it as vector artwork. If a name isn't found, glasur suggests
similar ones.

## Styles

Pick a style with `--style`. Each one derives its colors from `--color`. The
examples use `sneaker-move` `#5E5CE6`, `clock-countdown` `#3656F7`,
`gear-six` `#FF9500` and `waveform` `#20B2A0`.

### `default`

A gradient in the color with a flat white symbol. Used when you leave out `--style`.

![The default style](docs/styles/default.png)

### `paper`

Icon Composer's System Light background with the symbol in the color.

![The paper style](docs/styles/paper.png)

```sh
glasur generate --style paper \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
```

### `paper-tint`

Like `paper`, on a very light tint of the color.

![The paper-tint style](docs/styles/paper-tint.png)

```sh
glasur generate --style paper-tint \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
```

### `night`

A dark gray gradient with the symbol in a slightly brighter version of the color.

![The night style](docs/styles/night.png)

```sh
glasur generate --style night \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
```

### `night-tint`

A very dark shade of the color with the symbol in a brighter version of it.

![The night-tint style](docs/styles/night-tint.png)

```sh
glasur generate --style night-tint \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
```

### Two tones

Add `--two-tone` to any style to use Phosphor's duotone version of the icon:
the outline in the color over its inner shape in a lighter detail color, each
on its own layer. Here is `clock-countdown` with `--two-tone` in each style:

![clock-countdown with --two-tone in the default, paper, paper-tint, night and night-tint styles](docs/styles/two-tone.png)

```sh
glasur generate --style paper --two-tone \
  --icon clock-countdown --color '#3656F7' --output Resources/AppIcon.icon
```

## Use in one project

From your project's root directory, clone glasur and run it:

```sh
git clone https://github.com/geisterzeit/glasur.git BuildTools/glasur
swift run --package-path BuildTools/glasur glasur generate \
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
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
  --icon sneaker-move --color '#5E5CE6' --output Resources/AppIcon.icon
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
  --icon sneaker-move --color '#5E5CE6' \
  --output "$SRCROOT/Resources/AppIcon.icon"
```

Set the phase's **Output Files** to `$(SRCROOT)/Resources/AppIcon.icon`, uncheck
**Based on dependency analysis**, and set the target's **User Script Sandboxing**
to **No**. Each run replaces the generated icon.

## Update the Phosphor icons

The icons are embedded in `Sources/Glasur/PhosphorCatalog.generated.swift`. To
regenerate it from the pinned `@phosphor-icons/core` release, which needs npm,
run:

```sh
Scripts/update-phosphor-icons.sh
```

To move to a newer release, update `version` and `integrity` in the script
(`npm view @phosphor-icons/core@<version> dist.integrity`).

## License

glasur is available under the [MIT License](LICENSE). The embedded
[Phosphor Icons](https://phosphoricons.com) are © 2023 Phosphor Icons, also
under the MIT License; see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
