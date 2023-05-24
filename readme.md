# last-icon

[![NPM](https://nodei.co/npm/last-icon.png?mini=true)](https://nodei.co/npm/last-icon/)
[![Downloads](https://img.shields.io/npm/dt/last-icon.svg)](https://www.npmjs.com/package/last-icon)

The last icon library you will ever need.

Key features:

- Load as svg or font icons
- Mix & match icon sets if needed
- Bring your own icons
- Fix iconsistencies
- Lazy load your icons

## How to use

Simply include the library

```html
<script src="last-icon.js"></script>
```

**NOTE:** It is recommended to define this as early as possible so that all icons are resolved as soon
as possible. Otherwise, you might see a delay before your icons are being displayed.
Even when doing this, you might still see a very small delay as opposed as a font icon or an embedded SVG.

If you are fine with a little more delay, you can use this instead (which will be ignored on browsers
that don’t support modules):

```html
<!-- preload helps displaying things as early as possible, doesn't work in firefox and safari -->
<link rel="modulepreload" href="last-icon.js" />
<script type="module" src="./last-icon.js"></script>
```

And call your icons!

```html
<l-i name="star"></l-i>
<l-i name="star" set="tb"></l-i>
<l-i name="star" size="32" set="tb"></l-i>

<l-i name="star" set="bx" type="solid"></l-i>
<l-i name="star" set="bx" type="regular"></l-i>
<l-i name="github" set="bx" type="logos"></l-i>
```

The following CSS is recommended:

```css
l-i {
  --size: 1em;
  display: inline-flex;
  width: var(--size);
  height: var(--size);
  vertical-align: middle;
}
l-i svg {
  display: block;
  width: 100%;
  height: 100%;
}
p l-i,
button l-i,
a l-i,
span l-i {
  vertical-align: -0.125em;
}
```

## Configuring

You can set any options using `LastIcon.configure`. The recommended way to call it is this way:

```js
customElements.whenDefined("l-i").then(() => {
  // Access through registry
  customElements.get("l-i").configure({
    debug: true,
    // Transform stars to trash
    // replaceName: {
    //   star: "trash"
    // },
    // Use font icon
    // fonts: [
    //   "material",
    //   "phosphor",
    // ],
    // Change default set
    defaultSet: "tabler",
    // Change default stroke
    // defaultStroke: 1,
  });
});
```

All available options:

| Name        | Type                                        | Description                                   |
| ----------- | ------------------------------------------- | --------------------------------------------- |
| debug       | <code>Boolean</code>                        | Should we output messages to console          |
| lazy        | <code>Boolean</code>                        | Load icons lazily                             |
| replaceName | <code>Object</code>                         | Transparently replace icons with other values |
| fonts       | <code>Array</code>                          | Icon sets using font icons rather than SVG    |
| defaultSet  | <code>String</code>                         | Default icon set                              |
| sets        | <code>Object.&lt;string, IconSet&gt;</code> | Available iconsets                            |

## Supported icon sets

| Icon Set          | Name        | Alias | Types | Stroke | Count | Website                                                                  |
| ----------------- | ----------- | ----- | :---: | :----: | :---- | ------------------------------------------------------------------------ |
| Bootstrap Icons   | bootstrap   | bs    |   1   |   x    | 1800+ | [bootstrap](https://icons.getbootstrap.com/)                             |
| Boxicons          | boxicons    | bx    |   3   |   x    | 1600+ | [boxicons](https://boxicons.com/)                                        |
| Bytesized Icons   | bytesize    | by    |   1   |   v    | 101   | [bytesize](https://github.com/danklammer/bytesize-icons)                 |
| Css.gg            | cssgg       | gg    |   1   |   x    | 700+  | [cssgg](https://css.gg/)                                                 |
| Emoji             | emojicc     | em    |   1   |   x    | ?     | [emojicc](https://github.com/buildbreakdo/emoji-cc/)                     |
| Eos Icons         | eos         | eo    |   3   |   x    | 1000+ | [eos](https://eos-icons.com/)                                            |
| Feather           | feather     | ft    |   1   |   v    | 280+  | [feather](https://feathericons.com/)                                     |
| Flags             | flags       | fl    |   1   |   x    | ?     | [flags](https://github.com/ducin/flag-svg-collection/)                   |
| Fontawesome       | fontawesome | fa    |   5   |   x    | 1600+ | [fontawesome](https://fontawesome.com/cheatsheet)                        |
| Iconoir           | iconoir     | in    |   1   |   x    | 1300+ | [iconoir](https://iconoir.com/)                                          |
| IconPark          | iconpark    | ip    |   4   |   v    | 2400+ | [iconpark](https://iconpark.oceanengine.com/official)                    |
| Lucide            | lucide      | lu    |   1   |   v    | 1800+ | [lucide](https://lucide.dev/)                                            |
| Materials Icons   | material    | mi    |   5   |   x    | 1100+ | [material icons](https://fonts.google.com/icons?selected=Material+Icons) |
| Phosphor          | phosphor    | ph    |   6   |   x    | 6200+ | [phosphor](https://phosphoricons.com/)                                   |
| Super Tiny Icons  | supertiny   | st    |   1   |   x    | ?     | [supertiny](https://github.com/edent/SuperTinyIcons)                     |
| Materials Symbols | symbols     | ms    |   3   |   v    | 2500+ | [material symbols](https://fonts.google.com/icons)                       |
| Tabler Icons      | tabler      | ti    |   1   |   v    | 4000+ | [tabler](https://tabler-icons.io/)                                       |

---

## Adding or updating an icon set

You can update any option for an icon set

| Name            | Type                                       | Description                                         |
| --------------- | ------------------------------------------ | --------------------------------------------------- |
| alias           | <code>String</code>                        | Short two letters alias                             |
| svgPath         | <code>function</code>                      | The SVG path                                        |
| [fixFill]       | <code>Boolean</code>                       | Does this set needs fixing `fill:currentColor`?     |
| [useStroke]     | <code>String</code>                        | Add stroke to svg                                   |
| [defaultStroke] | <code>String</code>                        | Default stroke to use (if supports stroke)          |
| [defaultType]   | <code>String</code>                        | Default type to use (when there are multiple types) |
| [prefixes]      | <code>Object.&lt;string, string&gt;</code> | Types to prefixes                                   |
| [fontClass]     | <code>function</code>                      | Font class                                          |
| [opticalFont]   | <code>Boolean</code>                       | Is an optical font?                                 |
| [name]          | <code>String</code>                        | Full name (injected automatically)                  |

## Fill

Some icon sets include a default `fill="currentColor"` and some don't. In order
to have all icon sets behave consistently, we apply a `fill="currentColor"` to all
icon sets. This fix apply to: 'material', 'fontawesome'.

## Why a custom element

- External sprite or font is loading all the icons which lead to extra load time
- Including SVG is leading to really super long HTML and not very developer friendly
- No need for custom JS inliner, it feels cleaner overall

## Why external CSS

A custom element CSS is not loaded until the component itself is loaded, which
can lead to FOUC and things moving around as the icon appear.
The solution I've found so far is to apply some global CSS rules than are known
before the component is loaded.

You can check any extra SCSS that might be useful for you as well.

## Using fonts

Sometimes it is easier to use an icon font. Indeed, it is fully cached by the browser and will not have any display glitch.
Obviously, the downside is that you have to load the whole font, but it's cached after the first load.
The advantage of using LastIcon over regular icons is that is allows you to switch easily between one way or the other.

First of all, load any relevant fonts style

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone" rel="stylesheet" />
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet" />
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
```

And after that, use the font config to tell Last Icon to use the font over the SVG icons

```js
customElements.whenDefined("l-i").then(() => {
  // Access through registry
  customElements.get("l-i").configure({
    debug: true,
    fonts: ["material"],
    material: {
      defaultType: "two-tone",
    },
  });
});
```

And then, update your styles:

```css
l-i {
  --size: 1em;
  display: inline-flex;
  width: var(--size);
  height: var(--size);
  vertical-align: middle;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  i {
    font-size: var(--size) !important;
    color: currentColor;
  }
}
p,
button,
a,
span {
  l-i {
    vertical-align: -0.125em;
  }
}

.material-icons-two-tone {
  background-color: currentColor;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Demo

See `demo.html` or the following pen https://codepen.io/lekoalabe/pen/eYvdjqY

## Worth looking at

You might also be interested in https://icon-sets.iconify.design/
