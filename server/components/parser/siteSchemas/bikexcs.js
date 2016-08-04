
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

			var info = {};

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.tagnameStart == "p" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("old-price") >= 0) {
					oldPrice = true;
				}
				if (elem.tagnameStart == "p" && elem.attrs && elem.attrs.class && elem.attrs.class.indexOf("special-price") >= 0) {
					newPrice = true;
				}
				if (elem.tagnameEnd == "p" && oldPrice) {
					oldPrice = false;
				}
				if (elem.tagnameEnd == "p" && newPrice) {
					newPrice = false;
				}
				if (elem.text) {
					var text = (elem.text || "").trim();
					text = text.replace(/\./g, "").replace(",", ".");
					if (oldPrice) {
						info.oldPrice = text;
					}
					if (newPrice) {
						info.newPrice = text;
					}
				}
			}
			return info;
		}
	},
	{
		// extract old price and new price
		check: function (tagname, attrs) {
			return tagname == "h2" && attrs && attrs.class && attrs.class.indexOf("product_name") >= 0 && attrs.itemprop == "name";
		},
		name: "PRODUCT_NAME",
		extractInfo: function (elements) {

			var info = {};

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				if (elem.text) {
					var text = (elem.text || "").trim();
					info.productName = text;
				}
			}
			return info;
		}
	}
];

exports = module.exports = rules;
