![glasur: Liquid Glass app icons for your Mac apps, from a single command](docs/header.png)

I find myself creating more and more small utility macOS apps and wanted an easy way for me (and my agents) to create icons that fit the macOS look without fiddling with Icon Composer.

Glasur turns a [Phosphor](https://phosphoricons.com) icon and an accent color into an editable, layered Liquid Glass Icon Composer `.icon` source. See it in action on the [website](https://geisterzeit.github.io/glasur/).

![The glasur command for clock-countdown and the icon it generates](docs/example.png)

```sh
npx glasur generate --icon clock-countdown --color '#3656F7' --style paper-tint --two-tone
```

## Icons

`--icon` takes the name of any of the 1,512 [Phosphor icons](https://phosphoricons.com),
such as `sneaker-move`, `clock-countdown` or `gear-six`. Glasur uses the fill
weight and keeps it as vector artwork.

## Styles

Pick a style with `--style`. Each one derives its colors from `--color`.

### `default`

![The default style](docs/styles/default.png)

```sh
npx glasur generate --icon sneaker-move --color '#5E5CE6'
```

### `paper`

![The paper style](docs/styles/paper.png)

```sh
npx glasur generate --style paper --icon sneaker-move --color '#5E5CE6'
```

### `paper-tint`

![The paper-tint style](docs/styles/paper-tint.png)

```sh
npx glasur generate --style paper-tint --icon sneaker-move --color '#5E5CE6'
```

### `night`

![The night style](docs/styles/night.png)

```sh
npx glasur generate --style night --icon sneaker-move --color '#5E5CE6'
```

### `night-tint`

![The night-tint style](docs/styles/night-tint.png)

```sh
npx glasur generate --style night-tint --icon sneaker-move --color '#5E5CE6'
```

### Two tones

Add `--two-tone` to any style to use Phosphor's duotone version of the icon.

![clock-countdown with --two-tone in the default, paper, paper-tint, night and night-tint styles](docs/styles/two-tone.png)

```sh
npx glasur generate --style paper --two-tone --icon clock-countdown --color '#3656F7'
```

## Output

Without `--output`, glasur writes `AppIcon.icon`, the App Icon name Xcode gives
new app targets:

- next to the app's `Assets.xcassets`, if the current directory or one of its
  folders has one, as in Xcode's app template (`MyApp/AppIcon.icon`)
- otherwise to `Resources/AppIcon.icon`, for a Swift package

If there are several asset catalogs, such as an app and a widget extension,
glasur asks you to choose with `--output`.

## License

glasur is available under the [MIT License](LICENSE). The
[Phosphor Icons](https://phosphoricons.com) it installs as a dependency are
© 2023 Phosphor Icons, also under the MIT License.
