const JSDELIVR = "https://cdn.jsdelivr.net/";
const CACHE = {};

/**
 * @typedef IconSet
 * @property {String} alias Short two letters alias
 * @property {Function} svgPath The svg path
 * @property {Boolean} [fixFill] Does this set needs fixing fill:currentColor ?
 * @property {String} [useStroke] Add stroke to svg
 * @property {String} [defaultStroke] Default stroke to use (if supports stroke)
 * @property {String} [defaultType] Default type to use (when there are multiple types)
 * @property {Object.<string, string>} [prefixes] Types to prefixes
 * @property {Function} [fontClass] Font class
 * @property {Boolean} [opticalFont] Is an optical font?
 * @property {String} [name] Full name (injected automatically)
 */

/**
 * @typedef Options
 * @property {Boolean} debug Should we output messages to console
 * @property {Boolean} lazy Load icons lazily
 * @property {Object} replaceName Transparently replace icons with other values
 * @property {Array} fonts Icon sets using font icons rather than svg
 * @property {String} defaultSet Default icon set
 * @property {Object.<string, IconSet>} sets Available iconsets
 */
const options = {
  debug: false,
  lazy: true,
  replaceName: {},
  fonts: [],
  defaultSet: "tabler",
  defaultStroke: 2,
  sets: {
    bootstrap: {
      alias: "bs",
      svgPath: () => JSDELIVR + "npm/bootstrap-icons@1/icons/{icon}.svg",
    },
    boxicons: {
      alias: "bx",
      // types: ["solid", "regular", "logos"],
      defaultType: "solid",
      svgPath: () => JSDELIVR + "npm/boxicons@2/svg/{type}/{prefix}-{icon}.svg",
      fixFill: true,
      fontClass: () => "bx {prefix}-{icon}",
      prefixes: {
        solid: "bxs",
        regular: "bx",
        logos: "bxl",
      },
    },
    bytesize: {
      alias: "by",
      svgPath: () => JSDELIVR + "npm/bytesize-icons@1/dist/icons/{icon}.svg",
      useStroke: true,
    },
    cssgg: {
      alias: "gg",
      svgPath: () => JSDELIVR + "npm/css.gg@2/icons/svg/{icon}.svg",
    },
    emojicc: {
      alias: "em",
      svgPath: () => JSDELIVR + "npm/emoji-cc@1/svg/{icon}.svg",
    },
    eos: {
      alias: "eo",
      // types: ["solid", "outlined", "animated"],
      defaultType: "solid",
      svgPath: () => JSDELIVR + "gh/lekoala/eos-icons-mirror/{type}/{icon}.svg",
      fixFill: true,
    },
    feather: {
      alias: "ft",
      svgPath: () => JSDELIVR + "npm/feather-icons@4/dist/icons/{icon}.svg",
    },
    flags: {
      alias: "fl",
      // types: ["4x3", "1x1"],
      defaultType: "4x3",
      svgPath: () => JSDELIVR + "npm/flag-svg-collection@1/flags/{type}/{icon}.svg",
    },
    fontawesome: {
      alias: "fa",
      // types: ["solid", "regular", "brands", "light", "duotone"],
      defaultType: "solid",
      svgPath: () => JSDELIVR + "npm/@fortawesome/fontawesome-free@5/svgs/{type}/{icon}.svg",
      fixFill: true,
      fontClass: () => "{prefix} fa-{icon}",
      prefixes: {
        solid: "fas",
        regular: "far",
        light: "fal",
        duotone: "fad",
        brands: "fab",
      },
    },
    iconoir: {
      alias: "in",
      svgPath: () => JSDELIVR + "gh/lucaburgio/iconoir/icons/{icon}.svg",
      fontClass: () => "iconoir-{icon}",
      useStroke: true,
    },
    iconpark: {
      alias: "ip",
      types: [], // see full list here https://github.com/bytedance/IconPark/tree/master/source
      svgPath: () => JSDELIVR + "gh/bytedance/IconPark/source/{type}/{icon}.svg",
      useStroke: true,
    },
    lucide: {
      alias: "lu",
      svgPath: () => JSDELIVR + "npm/lucide-static/icons/{icon}.svg",
    },
    material: {
      alias: "mi",
      // types: ["filled", "outlined", "round", "sharp", "two-tone"],
      defaultType: "filled",
      svgPath: () => JSDELIVR + "npm/@material-design-icons/svg/{type}/{icon}.svg",
      fontClass: (type) => {
        if (type === "filled") {
          return "material-icons";
        }
        return "material-icons-{type}";
      },
    },
    phosphor: {
      alias: "ph",
      // types: ["regular", "bold", "duotone", "fill", "light", "thin"],
      defaultType: "regular",
      svgPath: (type) => {
        if (type === "regular") {
          return JSDELIVR + "npm/@phosphor-icons/core@2/assets/{type}/{icon}.svg";
        }
        return JSDELIVR + "npm/@phosphor-icons/core@2/assets/{type}/{icon}-{type}.svg";
      },
      fontClass: (type) => {
        if (type === "regular") {
          return "ph ph-{icon}";
        }
        return "ph-{type} ph-{icon}";
      },
    },
    supertiny: {
      alias: "st",
      svgPath: () => JSDELIVR + "npm/super-tiny-icons/images/svg/{icon}.svg",
    },
    symbols: {
      alias: "ms",
      // types: ["outlined", "rounded", "sharp"],
      defaultType: "outlined",
      svgPath: () => JSDELIVR + "npm/@material-symbols/svg-400@0.5/{type}/{icon}.svg",
      fixFill: true,
      fontClass: () => "material-symbols-{type}",
      opticalFont: true,
    },
    tabler: {
      alias: "tb",
      svgPath: () => JSDELIVR + "npm/@tabler/icons@2/icons/{icon}.svg",
      useStroke: true,
    },
  },
};

/**
 * @var {IntersectionObserver}
 */
const observer = new window.IntersectionObserver((entries, observerRef) => {
  entries.forEach(async (entry) => {
    if (entry.isIntersecting) {
      observerRef.unobserve(entry.target);
      entry.target.init();
    }
  });
});

/**
 * @param {string} value
 * @param {string} iconName
 * @param {IconSet} iconSet
 * @param {string} iconType
 * @return {string}
 */
function replacePlaceholders(value, iconName, iconSet, iconType) {
  value = value.replace("{icon}", iconName);
  if (iconType) {
    value = value.replaceAll("{type}", iconType);
  } else {
    // Maybe we want to remove the type like in material icons
    value = value.replace("-{type}", "");
  }
  if (iconSet.prefixes && iconSet.prefixes[iconType]) {
    value = value.replace("{prefix}", iconSet.prefixes[iconType]);
  }
  return value;
}

function log(message) {
  if (options.debug) {
    console.log(`[l-i] ${message}`);
  }
}

/**
 * @param {string} iconName
 * @param {IconSet} iconSet
 * @param {string} iconType
 * @return {Promise<String, Error>}
 */
function getIconSvg(iconName, iconSet, iconType) {
  let iconUrl = iconSet.svgPath(iconType);
  let cacheKey = `${iconSet.name}-${iconName}-${iconType || "base"}`;
  if (!iconUrl) {
    return new Promise(() => {
      console.error(`Icon set ${iconSet} does not exists`);
    });
  }

  iconUrl = replacePlaceholders(iconUrl, iconName, iconSet, iconType);

  // If we have it in cache
  if (iconUrl && CACHE[cacheKey]) {
    log(`Fetching ${cacheKey} from cache`);
    return CACHE[cacheKey];
  }

  // Or resolve
  log(`Fetching ${cacheKey} from url ${iconUrl}`);
  CACHE[cacheKey] = fetch(iconUrl).then(function (response) {
    if (response.ok) {
      return response.text();
    }
    throw Error(response.status);
  });
  return CACHE[cacheKey];
}

/**
 * @param {LastIcon} inst
 * @param {string} iconName
 * @param {IconSet} iconSet
 * @param {string} iconType
 */
function refreshIcon(inst, iconName, iconSet, iconType) {
  // Replace name
  if (options.replaceName[iconName]) {
    iconName = options.replaceName[iconName];
  }
  // Set default type if any
  if (!iconType && iconSet.defaultType) {
    iconType = iconSet.defaultType;
  }

  // Use font
  if (options.fonts.includes(iconSet.name)) {
    log(`Using font for ${iconName}`);
    let iconClass = iconSet.fontClass(iconType);
    let nameAsClass = iconClass.includes("{icon}");
    iconClass = replacePlaceholders(iconClass, iconName, iconSet, iconType);
    if (nameAsClass) {
      inst.innerHTML = `<i class="${iconClass}"></i>`;
    } else {
      inst.innerHTML = `<i class="${iconClass}">${iconName}</i>`;
    }
    if (inst.stroke && iconSet.opticalFont) {
      inst.style.setProperty("--weight", inst.stroke * 100);
    }
    return; // Return early
  }

  getIconSvg(iconName, iconSet, iconType)
    .then((iconData) => {
      // Strip class attribute as it may be affected by css
      if (iconData.includes("class=")) {
        iconData = iconData.replace(/ class="([a-z- ]*)"/g, "");
      }
      // Add and/or fix stroke
      if (inst.stroke || iconSet.useStroke) {
        iconData = iconData.replace(/stroke-width="([0-9\.]*)"/g, `stroke-width="${inst.stroke}"`);
      }
      // Fix fill to currentColor
      if (iconSet.fixFill) {
        iconData = iconData.replace(/(<svg.*?)>/, '$1 fill="currentColor">');
      }
      // If we have some html, pass it along (useful for svg anim)
      if (inst.defaultHTML) {
        iconData = iconData.replace("</svg>", `${inst.defaultHTML}</svg>`);
      }
      inst.innerHTML = iconData;
    })
    .catch((error) => {
      inst.innerHTML = "<span>⚠️</span>";
      console.error(`Failed to load icon ${iconName} (error ${error})`);
    });
}

/**
 * @param {HTMLElement} element
 * @returns {Boolean}
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === "object";

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

let aliases = {};
function processIconSets() {
  for (const [key, set] of Object.entries(options.sets)) {
    // List aliases for easy retrieval
    aliases[set.alias] = key;
    // Include full name in iconset definition
    set.name = key;
  }
}
processIconSets();

class LastIcon extends HTMLElement {
  /**
   * @param {object} opts
   * @returns {Options} The updated option object
   */
  static configure(opts = {}) {
    for (const k in opts) {
      if (typeof options[k] === "undefined") {
        console.error(`Invalid option key ${k}`);
        return;
      }
      if (Array.isArray(opts[k])) {
        options[k] = options[k].concat(opts[k]);
      } else if (typeof opts[k] === "object") {
        options[k] = mergeDeep(options[k], opts[k]);
      } else {
        options[k] = opts[k];
      }
    }
    processIconSets();
    // Log after we had the opportunity to change debug flag
    log("configuring options");
    return options;
  }

  /**
   * @return {String|null}
   */
  get type() {
    return this.getAttribute("type") || null;
  }

  /**
   * @return {String}
   */
  get set() {
    let v = this.getAttribute("set") || options.defaultSet;
    return aliases[v] || v;
  }

  /**
   * @return {IconSet|null}
   */
  get iconSet() {
    return options.sets[this.set] || null;
  }

  /**
   * @return {Number}
   */
  get stroke() {
    return this.getAttribute("stroke") || options.defaultStroke;
  }

  static get observedAttributes() {
    return ["name", "stroke", "size", "set", "type"];
  }

  connectedCallback() {
    // innerHTML is not available because not parsed yet
    // setTimeout also allows whenDefined to kick in before init
    setTimeout(() => {
      if (options.lazy && !isInViewport(this)) {
        // observer will call init when element is visible
        observer.observe(this);
      } else {
        // init directly
        this.init();
      }
    });
  }

  init() {
    // Store default content as we will inject it back later
    this.defaultHTML = this.innerHTML;
    this.loadIcon();
  }

  loadIcon() {
    const name = this.getAttribute("name");
    const iconSet = this.iconSet;
    if (!name || !iconSet) {
      return;
    }

    // Clear icon
    this.innerHTML = "";
    // Useful for customizing size in css
    if (this.hasAttribute("size")) {
      this.setSize(this.getAttribute("size"));
    }
    refreshIcon(this, name, iconSet, this.type);
  }

  setSize(size) {
    this.style.setProperty("--size", `${size}px`);
    if (this.iconSet.opticalFont) {
      this.style.setProperty("--opsz", size);
    }
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    // Wait until properly loaded for the first time
    if (typeof this.defaultHTML !== "string") {
      return;
    }
    log(`Attr ${attr} changed from ${oldVal} to ${newVal}`);
    if (attr === "size") {
      this.setSize(newVal);
    } else if (newVal) {
      log("attribute changed");
      this.loadIcon();
    }
  }
}

customElements.define("l-i", LastIcon);
