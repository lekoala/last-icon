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
			svgPath: () => `${JSDELIVR}npm/bootstrap-icons@1/icons/{icon}.svg`,
		},
		flags: {
			alias: "fl",
			// types: ["4x3", "1x1"],
			defaultType: "4x3",
			svgPath: () =>
				`${JSDELIVR}npm/flag-svg-collection@1/flags/{type}/{icon}.svg`,
		},
		iconoir: {
			alias: "in",
			svgPath: () => `${JSDELIVR}gh/lucaburgio/iconoir/icons/{icon}.svg`,
			fontClass: () => "iconoir-{icon}",
			useStroke: true,
		},
		iconpark: {
			alias: "ip",
			types: [], // see full list here https://github.com/bytedance/IconPark/tree/master/source
			svgPath: () =>
				`${JSDELIVR}gh/bytedance/IconPark/source/{type}/{icon}.svg`,
			useStroke: true,
		},
		lucide: {
			alias: "lu",
			svgPath: () => `${JSDELIVR}npm/lucide-static/icons/{icon}.svg`,
		},
		material: {
			alias: "mi",
			// types: ["filled", "outlined", "round", "sharp", "two-tone"],
			defaultType: "filled",
			svgPath: () =>
				`${JSDELIVR}npm/@material-design-icons/svg/{type}/{icon}.svg`,
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
					return `${JSDELIVR}npm/@phosphor-icons/core@2/assets/{type}/{icon}.svg`;
				}
				return `${JSDELIVR}npm/@phosphor-icons/core@2/assets/{type}/{icon}-{type}.svg`;
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
			svgPath: () => `${JSDELIVR}npm/super-tiny-icons/images/svg/{icon}.svg`,
		},
		symbols: {
			alias: "ms",
			// types: ["outlined", "rounded", "sharp"],
			defaultType: "outlined",
			svgPath: () =>
				`${JSDELIVR}npm/@material-symbols/svg-400@0.5/{type}/{icon}.svg`,
			fixFill: true,
			fontClass: () => "material-symbols-{type}",
			opticalFont: true,
		},
		tabler: {
			alias: "ti",
			svgPath: () => `${JSDELIVR}npm/@tabler/icons@2/icons/{icon}.svg`,
			useStroke: true,
			fontClass: () => "ti ti-{icon}",
		},
	},
};

/**
 * @var {IntersectionObserver}
 */
const observer = new window.IntersectionObserver((entries, observerRef) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			observerRef.unobserve(entry.target);
			entry.target.init();
		}
	}
});

/**
 * @param {string} value
 * @param {string} iconName
 * @param {string} iconType
 * @return {string}
 */
function replacePlaceholders(value, iconName, iconType) {
	let v = value;
	v = v.replace("{icon}", iconName);
	if (iconType) {
		v = v.replaceAll("{type}", iconType);
	} else {
		// Maybe we want to remove the type like in material icons
		v = v.replace("-{type}", "");
	}
	return v;
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
	if (!iconUrl) {
		throw Error(`Icon set ${iconSet} does not exists`);
	}
	const cacheKey = `${iconSet.name}-${iconName}-${iconType || "base"}`;
	iconUrl = replacePlaceholders(iconUrl, iconName, iconType);

	// If we have it in cache
	if (iconUrl && CACHE[cacheKey]) {
		log(`Fetching ${cacheKey} from cache`);
		return CACHE[cacheKey];
	}

	// Or resolve
	log(`Fetching ${cacheKey} from url ${iconUrl}`);
	CACHE[cacheKey] = fetch(iconUrl).then((response) => {
		if (response.ok) {
			return response.text();
		}
		throw Error(response.status);
	});
	return CACHE[cacheKey];
}

/**
 * @param {LastIcon} inst
 * @param {string} name
 * @param {IconSet} iconSet
 * @param {string} type
 */
function refreshIcon(inst, name, iconSet, type) {
	let iconName = name;
	let iconType = type;
	// Replace name
	if (options.replaceName[iconName]) {
		iconName = options.replaceName[iconName];
	}
	// Set default type if any
	if (!iconType && iconSet.defaultType) {
		iconType = iconSet.defaultType;
	}

	// Use font (if not using a specific stroke)
	if (options.fonts.includes(iconSet.name) && !inst.hasAttribute("stroke")) {
		log(`Using font for ${iconName}`);
		let iconClass = iconSet.fontClass(iconType);
		const nameAsClass = iconClass.includes("{icon}");
		iconClass = replacePlaceholders(iconClass, iconName, iconType);
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
		.then((data) => {
			let iconData = data;
			// Strip class attribute as it may be affected by css
			if (iconData.includes("class=")) {
				iconData = iconData.replace(/ class="([a-z- ]*)"/g, "");
			}
			// Add and/or fix stroke
			if (inst.stroke || iconSet.useStroke) {
				iconData = iconData.replace(
					/stroke-width="([0-9\.]*)"/g,
					`stroke-width="${inst.stroke}"`,
				);
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
		rect.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
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
	const isArray = Array.isArray;

	return objects.reduce((prev, obj) => {
		for (const key of Object.keys(obj)) {
			const pVal = prev[key];
			const oVal = obj[key];

			if (isArray(pVal) && isArray(oVal)) {
				prev[key] = pVal.concat(...oVal);
			} else if (isObject(pVal) && isObject(oVal)) {
				prev[key] = mergeDeep(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		}
		return prev;
	}, {});
}

const aliases = {};
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
		return aliases[this.getAttribute("set")] || options.defaultSet;
	}

	/**
	 * @return {IconSet}
	 */
	get iconSet() {
		return options.sets[this.set];
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
		if (!name) {
			return;
		}
		const iconSet = this.iconSet;
		// Clear icon
		this.innerHTML = "";
		// Useful for customizing size in css
		const size = this.getAttribute("size");
		if (size) {
			this.setSize(size);
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
