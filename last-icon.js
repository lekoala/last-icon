const CACHE = {};
const FIX_FILL = ['material', 'boxicons', 'fontawesome'];
const ALIASES = Object.assign(
  {
    bs: "bootstrap",
    bx: "boxicons",
    cs: "cssgg",
    gg: "cssgg",
    tb: "tabler",
    fa: "fontawesome",
    st: "supertiny",
    mi: "material",
    em: "emojicc",
    fl: "flags",
    in: "iconoir",
  },
  (window.LastIcon && window.LastIcon.aliases) || {}
);
const TYPES = Object.assign(
  {
    boxicons: "solid",
    fontawesome: "solid",
    material: "baseline",
    flags: "4x3",
  },
  (window.LastIcon && window.LastIcon.types) || {}
);
const PREFIXES = Object.assign(
  {
    boxicons: {
      solid: "bxs",
      regular: "bx",
      logos: "bxl",
    },
  },
  (window.LastIcon && window.LastIcon.prefixes) || {}
);
const DEFAULT_SET = (window.LastIcon && window.LastIcon.defaultSet) || "tabler";
const DEFAULT_STROKE = (window.LastIcon && window.LastIcon.defaultStroke) || 2;
const PATHS = Object.assign(
  {
    bootstrap: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/icons/{icon}.svg",
    // type: solid, regular, logos
    boxicons: "https://cdn.jsdelivr.net/npm/boxicons@2.0.7/svg/{type}/{prefix}-{icon}.svg",
    cssgg: "https://cdn.jsdelivr.net/npm/css.gg@2.0.0/icons/svg/{icon}.svg",
    tabler: "https://cdn.jsdelivr.net/npm/@tabler/icons@1.41.2/icons/{icon}.svg",
    // type: solid, regular, brands
    fontawesome: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/svgs/{type}/{icon}.svg",
    bytesize: "https://cdn.jsdelivr.net/npm/bytesize-icons@1.4.0/dist/icons/{icon}.svg",
    supertiny: "https://cdn.jsdelivr.net/npm/super-tiny-icons@0.4.0/images/svg/{icon}.svg",
    // type: baseline, outline, round, sharp, twotone
    material: "https://cdn.jsdelivr.net/npm/@material-icons/svg@1.0.10/svg/{icon}/{type}.svg",
    // type : 4x3 or 1x1
    flags: "https://cdn.jsdelivr.net/npm/flag-svg-collection@1.1.0/flags/{type}/{icon}.svg",
    emojicc: "https://cdn.jsdelivr.net/npm/emoji-cc@1.0.1/svg/{icon}.svg",
    iconoir: "https://cdn.jsdelivr.net/gh/lucaburgio/iconoir/icons/{icon}.svg"
  },
  (window.LastIcon && window.LastIcon.paths) || {}
);

class LastIcon extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }

  /**
   * @param {string} iconName
   * @param {string} iconSet
   * @param {string} iconType
   * @return {Promise<String, Error>}
   */
  static getIconSvg(iconName, iconSet, iconType) {
    let iconPrefix = (PREFIXES[iconSet] && PREFIXES[iconSet][iconType]) || null;
    let iconUrl = PATHS[iconSet];
    if (!iconUrl) {
      return new Promise(() => {
        console.error(`Icon set ${iconSet} does not exists`);
      });
    }

    // Replace placeholders
    iconUrl = iconUrl.replace("{icon}", iconName);
    if (iconType) {
      iconUrl = iconUrl.replace("{type}", iconType);
    }
    if (iconPrefix) {
      iconUrl = iconUrl.replace("{prefix}", iconPrefix);
    }

    // If we have it in cache
    if (iconUrl && CACHE[iconUrl]) {
      return CACHE[iconUrl];
    }

    // Or resolve
    CACHE[iconUrl] = fetch(iconUrl).then(function (response) {
      if (response.status === 200) {
        return response.text();
      } else {
        throw Error(response.status);
      }
    });
    return CACHE[iconUrl];
  }

  get type() {
    let v = this.getAttribute("type");
    v = v || TYPES[this.set];
    return v;
  }

  get set() {
    let v = this.getAttribute("set") || DEFAULT_SET;
    if (ALIASES[v]) {
      v = ALIASES[v];
    }
    return v;
  }

  get stroke() {
    let v = this.getAttribute("stroke");
    if (!v && this.set == "tabler") {
      v = DEFAULT_STROKE;
    }
    return v;
  }

  static get observedAttributes() {
    return ["name"];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    this.innerHTML = "";

    let set = this.set;
    let type = this.type;

    if (newVal) {
      this.constructor
        .getIconSvg(newVal, set, type)
        .then((iconData) => {
          if (this.stroke) {
            iconData = iconData.replace(/stroke-width="([0-9]*)"/, 'stroke-width="' + this.stroke + '"');
          }
          if(FIX_FILL.indexOf(this.set) !== -1) {
            iconData = iconData.replace(/(<svg.*?)>/,'$1 fill="currentColor">');
          }
          this.innerHTML = iconData;
        })
        .catch((error) => {
          this.innerHTML = "⚠️";
          console.error(`Failed to load icon ${newVal} (error ${error})`);
        });
    }
  }

  connectedCallback() {}
}

customElements.define("l-i", LastIcon);

export default LastIcon;
