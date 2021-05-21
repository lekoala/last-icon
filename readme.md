# last-icon

[![NPM](https://nodei.co/npm/last-icon.png?mini=true)](https://nodei.co/npm/last-icon/)
[![Downloads](https://img.shields.io/npm/dt/last-icon.svg)](https://www.npmjs.com/package/last-icon)

## How to use

Simply include the library

```html
<script type="module" src="./last-icon.js"></script>
```

And call your icons!

```html
<l-i name="star"></l-i>
<l-i name="star" set="tb"></l-i>

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

You can set a custom base path:

```html
<script>
  // You can tweak settings by changing global variable
  window.LastIcon = {
    // paths: {
    //   bootstrap: "./vendor/bootstrap",
    // },
    types: {
      boxicons: "regular",
    },
    defaultSet: "boxicons",
    defaultStroke: 2,
  };
</script>
```

## Supported icon sets

- bootstrap
- boxicons
- cssgg
- tabler
- fontawesome
- supertiny
- material
- emojicc
- flags
- iconoir

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

## Demo

See demo.html or the following pen https://codepen.io/lekoalabe/pen/eYvdjqY
