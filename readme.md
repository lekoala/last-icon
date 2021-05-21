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

You can even avoid the http query entirely by embedding the data. This makes sure that you won't see any issue and should be reserved for your most
importants icons.

```js
function LastIconCache(name) {
    var data = '';
    switch(name) {
        case "material-account_box-twotone":
            data = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path opacity=".3" d="M5 19h14V5H5v14zm7-13c1.65 0 3 1.35 3 3s-1.35 3-3 3s-3-1.35-3-3s1.35-3 3-3zM6 16.47c0-2.5 3.97-3.58 6-3.58s6 1.08 6 3.58V18H6v-1.53z"/><path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3s-3 1.35-3 3s1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-1-2.53c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.53zM8.31 16c.69-.56 2.38-1.12 3.69-1.12s3.01.56 3.69 1.12H8.31z"/></svg>';
            break;
    }
    return new Promise((resolve,reject) => {
        resolve(data);
    });
}
window.LastIconPreload = {};
window.LastIconPreload["material-account_box-twotone"] = LastIconCache("material-account_box-twotone");
```

## Demo

See demo.html or the following pen https://codepen.io/lekoalabe/pen/eYvdjqY
