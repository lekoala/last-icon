const CACHE = {};
const DEBUG = (window.LastIcon && window.LastIcon.debug) || false;
const PRELOAD = window.LastIconPreload || {};
const FIX_FILL = ["material", "boxicons", "fontawesome"];
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

  static log(message) {
    if (!DEBUG) {
      return;
    }
    console.log("[l-i] " + message);
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
    let cacheKey = iconSet + "-" + iconName;
    if (iconType) {
      cacheKey += "-" + iconType;
    }
    if (PRELOAD[cacheKey]) {
      LastIcon.log("Fetching " + cacheKey + " from preloaded cache");
      return PRELOAD[cacheKey];
    }
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
    if (iconUrl && CACHE[cacheKey]) {
      LastIcon.log("Fetching " + cacheKey + " from cache");
      return CACHE[cacheKey];
    }

    // Or resolve
    LastIcon.log("Fetching " + cacheKey + " from url " + iconUrl);
    CACHE[cacheKey] = fetch(iconUrl).then(function (response) {
      if (response.status === 200) {
        return response.text();
      } else {
        throw Error(response.status);
      }
    });
    return CACHE[cacheKey];
  }

  /**
   * @param {object} inst
   * @param {string} iconName
   * @param {string} iconSet
   * @param {string} iconType
   */
  static refreshIcon(inst, iconName, iconSet, iconType) {
    LastIcon.getIconSvg(iconName, iconSet, iconType)
      .then((iconData) => {
        if (inst.stroke) {
          iconData = iconData.replace(/stroke-width="([0-9]*)"/, 'stroke-width="' + inst.stroke + '"');
        }
        if (FIX_FILL.indexOf(inst.set) !== -1) {
          iconData = iconData.replace(/(<svg.*?)>/, '$1 fill="currentColor">');
        }
        inst.innerHTML = iconData;
      })
      .catch((error) => {
        inst.innerHTML = "⚠️";
        console.error(`Failed to load icon ${iconName} (error ${error})`);
      });
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
      LastIcon.refreshIcon(this, newVal, set, type);
    }
  }

  connectedCallback() {
    // This is actually called AFTER attributeChangedCallback
  }
}

customElements.define("l-i", LastIcon);
