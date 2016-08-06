
var rules = [
	{
		// fake price, skip whole element
		check: function (tagname, attrs) {
			return tagname == "div" && attrs && attrs.class && attrs.class.indexOf("have-price") >= 0;
		},
		name: "SKIP_FAKE_PRICE"
	},
	{
		// extract old price and new price
		check: function (tagname, attrs) {
			return tagname == "div" && attrs && attrs.class && attrs.class.indexOf("price-box") >= 0;
		},
		name: "PRICE",
		extractInfo: function (elements) {

			var oldPrice = false;
			var newPrice = false;
			var regularPrice = false;

			var info = {};

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.tagnameStart == "p" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("old-price") >= 0) {
					oldPrice = true;
				}
				if (elem.tagnameStart == "p" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("special-price") >= 0) {
					newPrice = true;
				}
				if (elem.tagnameStart == "span" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("regular-price") >= 0) {
					regularPrice = true;
				}
				if (elem.tagnameEnd == "p" && oldPrice) {
					oldPrice = false;
				}
				if (elem.tagnameEnd == "p" && newPrice) {
					newPrice = false;
				}
				if (elem.tagnameEnd == "span" && newPrice) {
					regularPrice = false;
				}
				if (elem.text) {
					var text = (elem.text || "").trim();
					text = text.replace(/\./g, "").replace(",", ".");
					if (oldPrice) {
						info.oldPrice = parseFloat(text);
					}
					if (newPrice) {
						info.newPrice = parseFloat(text);
					}
					if (regularPrice) {
						info.regularPrice = parseFloat(text);
					}
				}
			}

			if (isNaN(info.newPrice) && !isNaN(info.regularPrice)) {
				info.newPrice = info.regularPrice;
			}

			return {
				newPrice: info.newPrice,
				oldPrice: info.oldPrice
			};
		}
	},
	{
		// extract product name
		check: function (tagname, attrs) {
			return tagname == "h2" && attrs && attrs.class && attrs.class.indexOf("product-name") >= 0 && attrs.itemprop == "name";
		},
		name: "PRODUCT_NAME",
		extractInfo: function (elements) {

			var info = {};

			var name = "";

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.text) {
					var text = (elem.text || "").trim();
					name += text;
				}
			}
			info.productName = name;
			return info;
		}
	},
	{
		// extract product image
		check: function (tagname, attrs) {
			return tagname == "a" && attrs && attrs.class && attrs.class.indexOf("fancybox-button") >= 0 && attrs.id == "yt_popup";
		},
		name: "IMAGE",
		extractInfo: function (elements) {

			var info = {};

			var elem = elements[0] || {};
			if (elem.tagnameStart == "a" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("fancybox-button") >= 0 && elem.attrs.id == "yt_popup") {
				info.image = elem.attrs.href;
			}

			return info;
		}
	},
	{
		// extract product specs
		check: function (tagname, attrs) {
			return tagname == "div" && attrs && attrs.class && attrs.class.indexOf("tab-pane") >= 0 && attrs.id == "yt_tab_decription";
		},
		name: "SPECS_LI",
		extractInfo: function (elements) {

			var info = {
				specs: []
			};

			var liOpen = false;
			var descriptionStarted = false;
			var spanS2 = {
				open: false,
				stackIndex: 0,
				index: 0
			};
			var specText = "";

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.tagnameStart == "li" && descriptionStarted) {
					liOpen = true;
				}
				if (elem.tagnameEnd == "li") {
					liOpen = false;
					info.specs.push(specText.trim());
					specText = "";
				}
				if (elem.tagnameStart == "div" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("std") >= 0 && elem.attrs.itemprop == "description") {
					descriptionStarted = true;
				}
				if (elem.tagnameEnd == "div" && descriptionStarted) {
					descriptionStarted = false;
				}
				if (elem.tagnameStart == "span" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("s2") >= 0) {
					spanS2.open = true;
				}
				if (spanS2.open && elem.tagnameStart) {
					spanS2.stackIndex++;
				}
				if (spanS2.open && elem.tagnameEnd) {
					spanS2.stackIndex--;
				}
				if (spanS2.stackIndex == 0 && spanS2.open) {
					spanS2.open = false;
					spanS2.index = 0;
				}

				if (spanS2.open) {
					if (elem.text) {
						spanS2.index++;
						specText += elem.text;
						if (spanS2.index == 1) {
							specText += " ";
						}
					}
				}
				else {
					if (elem.text && liOpen) {
						var text = (elem.text || "").trim();
						if (text.length > 0) {
							specText += text;
						}
					}
				}

			}

			if (info.specs.length == 0) {
				return {};
			}

			return info;
		}
	},
	{
		// extract product specs
		check: function (tagname, attrs) {
			return tagname == "div" && attrs && attrs.class && attrs.class.indexOf("tab-pane") >= 0 && attrs.id == "yt_tab_decription";
		},
		name: "SPECS_TABLE",
		extractInfo: function (elements) {

			var info = {
				specs: []
			};

			var trOpen = false;
			var descriptionStarted = false;
			var specText = "";
			var tdIndex = 0;

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.tagnameStart == "tr" && descriptionStarted) {
					trOpen = true;
				}
				if (elem.tagnameEnd == "tr" && trOpen) {
					trOpen = false;
					info.specs.push(specText);
					tdIndex = 0;
				}
				if (elem.tagnameStart == "div" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("std") >= 0 && elem.attrs.itemprop == "description") {
					descriptionStarted = true;
				}
				if (elem.tagnameEnd == "div" && descriptionStarted) {
					descriptionStarted = false;
				}

				if (elem.text && trOpen) {
					var text = (elem.text || "").trim();

					tdIndex++;

					if (tdIndex == 1) {
						specText = text + ": ";
					}
					else {
						specText += text;
					}

				}
			}

			if (info.specs.length == 0) {
				return {};
			}

			return info;
		}
	}
];

exports = module.exports = rules;
