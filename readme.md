# last-icon

[![NPM](https://nodei.co/npm/last-icon.png?mini=true)](https://nodei.co/npm/last-icon/)
[![Downloads](https://img.shields.io/npm/dt/last-icon.svg)](https://www.npmjs.com/package/last-icon)

## How to use

Simply include the library

```html
<script src="last-icon.js"></script>
```

NOTE: it is recommended to define this as early as possible so that all icons are resolved as soon
as possible. Otherwise, you might see a delay before your icons are being displayed.
Even when doing this, you might still see a very small delay as opposed as a font icon or an embedded svg.

If you are fine with a little more delay, you can use this instead

```html
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

The following css is recommended:

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

You can set a custom base path and other options
using window.LastIcon before including the library

```html
<script>
  // You can tweak settings by changing global variable
  window.LastIcon = {
    // paths: {
    //   bootstrap: "./vendor/bootstrap",
    // },
    debug: true,
    types: {
      boxicons: "regular",
    },
    defaultSet: "boxicons",
    defaultStroke: 2,
  };
</script>
```

## Supported icon sets

|Icon Set          |Name       | Alias | Types |Stroke |Count |Website |
|---               |---        |---    | ---   |---    |---   |---     |
|Bootstrap Icons   |bootstrap  |bs     | 1     | x     |1300+ |[bootstrap](https://icons.getbootstrap.com/)
|Boxicons          |boxicons   |bx     | 3     | x     |1500  |[boxicons](https://boxicons.com/)
|Tabler Icons      |tabler     |tb     | 1     | v     |1280  |[tabler](https://tablericons.com/)
|Materials Icons   |material   |mi     | 5     | x     |1100+ |[material](https://fonts.google.com/icons?selected=Material+Icons)
|Css.gg            |cssgg      |gg     | 1     | x     |700+  |[cssgg](https://css.gg/)
|Fontawesome       |fontawesome|fa     | 5     | x     |1609  |[fontawesome](https://fontawesome.com/cheatsheet)
|Super Tiny Icons  |supertiny  |st     | 1     | x     |?     |[supertiny](https://github.com/edent/SuperTinyIcons)
|Flags             |flags      |fl     | 1     | x     |?     |[flags](https://github.com/ducin/flag-svg-collection/)
|Emoji             |emojicc    |em     | 1     | x     |?     |[emojicc](https://github.com/buildbreakdo/emoji-cc/)
|Iconoir           |iconoir    |in     | 1     | x     |914   |[iconoir](https://iconoir.com/)
|Eos Icons         |eos        |eo     | 3     | x     |1000+ |[eos](https://eos-icons.com/)
|Feather Icons     |feather    |ft     | 3     | v     |286   |[feather](https://feathericons.com/)

If you feel that any icon set should be added to the already expansive list,
feel free to submit a PR. Otherwise, it's easy enough to add your own libraries:

```js
window.LastIcon = {
  aliases: {
    my: "myicons",
  },
  paths: {
    myicons: "/path/to/the/{icon}.svg",
  },
  defaultSet: "myicons",
};
```

## Fill

Some icon sets include a default fill="currentColor" and some don't. In order
to have all icon sets behave consistently, we apply a fill="currentColor" to all
icon sets. This fix apply to: 'material', 'boxicons', 'fontawesome'.

## Why a custom element

- External sprite or font is loading all the icons which lead to extra load time
- Including svg is leading to really super long html and not very developer friendly
- No need for custom js inliner, it feels cleaner overall

## Why external css

A custom element css is not loaded until the component itself is loaded, which
can lead to FOUC and things moving around as the icon appear.
The solution I've found so far is to apply some global css rules than are known
before the component is loaded.

## Preloading icons

Since icons are not fetched until the browser encounter the element, you might see
a slight delay before the icon is displayed. The prevent that, you can
preload your most commons icons using a script like this:

```js
window.LastIcon = {
  debug: true,
  types: {
    material: "twotone",
  },
};
function LastIconPreloader(iconUrl) {
  return fetch(iconUrl).then(function (response) {
    if (response.status === 200) {
      return response.text();
    } else {
      throw Error(response.status);
    }
  });
}
window.LastIconPreload = {};
window.LastIconPreload["material-account_box-twotone"] = LastIconPreloader("https://cdn.jsdelivr.net/npm/@material-icons/svg@1.0.10/svg/account_box/twotone.svg");
```

Thanks to the debug flag, it's easy to find the cache key and the matching url.

## Using fonts

If you find yourself preloading a lot of stuff... it might actually be easier to use the icon font instead. Indeed, it
is fully cached by the browser and will not have any display glitch. Obviously, the downside is that you have
to load the whole font, but it's cached after the first load. The advantage of using LastIcon over regular icons
is that is allows you to switch easily between one way or the other.

First of all, load your fonts

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" /> <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone" rel="stylesheet" />
```

And after that, use the font config to tell Last Icon to use the font over the svg icons

```js
window.LastIcon = {
  debug: true,
  types: {
    material: "twotone",
  },
  fonts: ["material"],
};
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

See demo.html or the following pen https://codepen.io/lekoalabe/pen/eYvdjqY
