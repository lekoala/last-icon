const JSDELIVR = "https://cdn.jsdelivr.net/";

/**
 * @typedef Options
 * @property {Boolean} debug Should we output messages to console
 * @property {Boolean} lazy Load icons lazily
 * @property {Object} replaceName Transparently replace icons with other values
 * @property {Object} aliases Icon sets aliases for ease of use
 * @property {Array} fonts Icon sets using font icons rather than svg
 * @property {Object} viewboxes View box values if not set in icon set
 * @property {Object} prefixes Types prefixes in each icon set
 * @property {Object} defaultTypes Default types for each icon set
 * @property {String} defaultSet Default icon set
 * @property {Number} defaultStroke Default stroke used
 * @property {Object} paths Svg loading paths
 * @property {Array} fixFill Fix fill for these sets
 * @property {Array} fixStroke Fix stroke for these sets
 * @property {Array} fixViewbox Fix viewbox for these sets
 */
const options = {
  debug: false,
  lazy: true,
  replaceName: {},
  aliases: {
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
    eo: "eos",
    ft: "feather",
    ip: "iconpark",
    ph: "phosphor",
    ms: "symbols",
    lu: "lucide",
  },
  fonts: [],
  viewboxes: {
    boxicons: 24,
    symbols: 48,
  },
  defaultTypes: {
    boxicons: "solid",
    fontawesome: "solid",
    material: "baseline",
    flags: "4x3",
    eos: "solid",
    phosphor: "regular",
    symbols: "outlined",
  },
  prefixes: {
    boxicons: {
      solid: "bxs",
      regular: "bx",
      logos: "bxl",
    },
    fontawesome: {
      solid: "fas",
      regular: "far",
      light: "fal",
      duotone: "fad",
      brands: "fab",
    },
  },
  defaultSet: "tabler",
  defaultStroke: 2,
  paths: {
    bootstrap: JSDELIVR + "npm/bootstrap-icons@1/icons/{icon}.svg",
    // type: solid, regular, logos
    boxicons: JSDELIVR + "npm/boxicons@2/svg/{type}/{prefix}-{icon}.svg",
    cssgg: JSDELIVR + "npm/css.gg@2/icons/svg/{icon}.svg",
    tabler: JSDELIVR + "npm/@tabler/icons@1/icons/{icon}.svg",
    // type: solid, regular, brands, light, duotone
    fontawesome: JSDELIVR + "npm/@fortawesome/fontawesome-free@5/svgs/{type}/{icon}.svg",
    bytesize: JSDELIVR + "npm/bytesize-icons@1/dist/icons/{icon}.svg",
    supertiny: JSDELIVR + "npm/super-tiny-icons/images/svg/{icon}.svg",
    // type: baseline, outline, round, sharp, twotone
    material: JSDELIVR + "npm/@material-icons/svg@1/svg/{icon}/{type}.svg",
    // type : 4x3 or 1x1
    flags: JSDELIVR + "npm/flag-svg-collection@1/flags/{type}/{icon}.svg",
    emojicc: JSDELIVR + "npm/emoji-cc@1/svg/{icon}.svg",
    iconoir: JSDELIVR + "gh/lucaburgio/iconoir/icons/{icon}.svg",
    // type: solid, outlined, animated
    eos: JSDELIVR + "gh/lekoala/eos-icons-mirror/{type}/{icon}.svg",
    feather: JSDELIVR + "npm/feather-icons@4/dist/icons/{icon}.svg",
    // type: 33 types ! see website
    iconpark: JSDELIVR + "gh/bytedance/IconPark/source/{type}/{icon}.svg",
    // type: bold, duotone, fill, light, regular, thin
    phosphor: JSDELIVR + "gh/phosphor-icons/phosphor-icons@1/assets/{type}/{icon}-{type}.svg",
    // type: outlined, rounded, sharp
    symbols: JSDELIVR + "npm/@material-symbols/svg-400@0.2.13/{type}/{icon}.svg",
    lucide: JSDELIVR + "npm/lucide-static/icons/{icon}.svg"
  },
  fixFill: ["material", "boxicons", "fontawesome", "eos", "phosphor", "symbols"],
  fixStroke: ["iconpark"],
  fixViewbox: ["boxicons", "symbols"],
  strokeSet: ["tabler", "iconpark"],
  opticalFont: ["symbols"],
};

const CACHE = {};
const FONT_ICONS = {
  material: {
    class: "material-icons-{type}",
    types: {
      baseline: "",
      twotone: "two-tone",
      outline: "outlined",
    },
  },
  symbols: {
    class: "material-symbols-{type}",
  },
  boxicons: {
    class: "bx {prefix}-{icon}",
  },
  bootstrap: {
    class: "bi-{icon}",
  },
  fontawesome: {
    class: "{prefix} fa-{icon}",
  },
  iconoir: {
    class: "iconoir-{icon}",
  },
  eos: {
    class: "eos-icons-{type}",
    types: {
      solid: "",
    },
  },
  // Note: duotone not supported yet
  phosphor: {
    class: "ph-{icon}-{type}",
    types: {
      solid: "",
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
 * @param {string} iconSet
 * @param {string} iconType
 * @return {string}
 */
function replacePlaceholders(value, iconName, iconSet, iconType) {
  let iconPrefix = (options.prefixes[iconSet] && options.prefixes[iconSet][iconType]) || null;
  value = value.replace("{icon}", iconName);
  if (iconType) {
    value = value.replaceAll("{type}", iconType);
  } else {
    // Maybe we want to remove the type like in material icons
    value = value.replace("-{type}", "");
  }
  if (iconPrefix) {
    value = value.replace("{prefix}", iconPrefix);
  }
  return value;
}

function log(message) {
  if (!options.debug) {
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
function getIconSvg(iconName, iconSet, iconType) {
  let iconUrl = options.paths[iconSet];
  let cacheKey = iconSet + "-" + iconName;
  if (iconType) {
    cacheKey += "-" + iconType;
  }
  if (!iconUrl) {
    return new Promise(() => {
      console.error(`Icon set ${iconSet} does not exists`);
    });
  }

  iconUrl = replacePlaceholders(iconUrl, iconName, iconSet, iconType);

  // If we have it in cache
  if (iconUrl && CACHE[cacheKey]) {
    log("Fetching " + cacheKey + " from cache");
    return CACHE[cacheKey];
  }

  // Or resolve
  log("Fetching " + cacheKey + " from url " + iconUrl);
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
 * @param {string} iconSet
 * @param {string} iconType
 */
function refreshIcon(inst, iconName, iconSet, iconType) {
  // Replace name
  if (options.replaceName[iconName]) {
    iconName = options.replaceName[iconName];
  }

  // Use font
  if (options.fonts.includes(iconSet)) {
    log("Using font for " + iconName);
    let iconClass = FONT_ICONS[iconSet]["class"];
    let nameAsClass = iconClass.includes("{icon}");
    let fontType = iconType;
    if (FONT_ICONS[iconSet]["types"] && iconType in FONT_ICONS[iconSet]["types"]) {
      fontType = FONT_ICONS[iconSet]["types"][iconType];
    }
    iconClass = replacePlaceholders(iconClass, iconName, iconSet, fontType);
    if (nameAsClass) {
      inst.innerHTML = '<i class="' + iconClass + '"></i>';
    } else {
      inst.innerHTML = '<i class="' + iconClass + '">' + iconName + "</i>";
    }
    if (inst.stroke && options.opticalFont.includes(inst.set)) {
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
      if (inst.stroke || options.fixStroke.includes(inst.set)) {
        iconData = iconData.replace(/stroke-width="([0-9]*)"/g, 'stroke-width="' + inst.stroke + '"');
      }
      // Fix fill to currentColor
      if (options.fixFill.includes(inst.set)) {
        iconData = iconData.replace(/(<svg.*?)>/, '$1 fill="currentColor">');
      }
      // Fix viewbox if missing to allow easy sizing
      if (options.fixViewbox.includes(inst.set) && !iconData.includes("viewBox")) {
        const size = options.viewboxes[iconSet] || 24;
        iconData = iconData.replace(/(<svg.*?)>/, '$1 viewBox="0 0 ' + size + " " + size + '">');
      }
      // If we have some html, pass it along (useful for svg anim)
      if (inst.defaultHTML) {
        iconData = iconData.replace("</svg>", inst.defaultHTML + "</svg>");
      }
      inst.innerHTML = iconData;
    })
    .catch((error) => {
      inst.innerHTML = "<span>⚠️</span>";
      console.error(`Failed to load icon ${iconName} (error ${error})`);
    });
}

class LastIcon extends HTMLElement {
  /**
   * @param {object} opts
   * @returns {Options} The updated option object
   */
  static configure(opts = {}) {
    for (const k in opts) {
      // Check first for isArray because typeof array is also object
      if (Array.isArray(opts[k])) {
        options[k] = options[k].concat(opts[k]);
      } else if (typeof opts[k] === "object") {
        options[k] = Object.assign(options[k], opts[k]);
      } else {
        options[k] = opts[k];
      }
    }
    // Log after we had the opportunity to change debug flag
    log("configuring options");
    return options;
  }

  get type() {
    return this.getAttribute("type") || options.defaultTypes[this.set];
  }

  get set() {
    let v = this.getAttribute("set") || options.defaultSet;
    return options.aliases[v] ?? v;
  }

  get stroke() {
    let v = this.getAttribute("stroke");
    if (!v && options.strokeSet.includes(this.set)) {
      v = options.defaultStroke;
    }
    return v;
  }

  static get observedAttributes() {
    return ["name", "stroke", "size", "set", "type"];
  }

  connectedCallback() {
    // innerHTML is not available because not parsed yet
    setTimeout(() => {
      // Do this is setTimeout to allow whenDefined to kick in before
      // otherwise it cannot be configured
      if (options.lazy) {
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
    if (!name) {
      return;
    }

    // Clear icon
    this.innerHTML = "";
    // Useful for customizing size in css
    if (this.hasAttribute("size")) {
      this.setSize(this.getAttribute("size"));
    }
    if (name) {
      refreshIcon(this, name, this.set, this.type);
    }
  }

  setSize(size) {
    this.style.setProperty("--size", size + "px");
    if (options.opticalFont.includes(this.set)) {
      this.style.setProperty("--opsz", size);
    }
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    // Wait until properly loaded for the first time
    if (typeof this.defaultHTML !== "string") {
      return;
    }
    log("Attr " + attr + " changed from " + oldVal + " to " + newVal);
    if (attr === "size") {
      this.setSize(newVal);
    } else if (newVal) {
      log("attribute changed");
      this.loadIcon();
    }
  }
}

customElements.define("l-i", LastIcon);
