import * as htmlparser from 'htmlparser2';
import * as utils from '../util/utils';
import sites from './siteSchemas';


export function parseLink (htmlInput, siteName, callback) {
	callback = utils.safeCallback(callback);

	var rules = sites[siteName];

	var currentElements = [];

	var productInfo = {};

	if (typeof rules === 'undefined') {
		return callback("No parsing schema for this website.");
	}

	var data = '';
	var parser = new htmlparser.Parser({
	    onopentag: function(name, attribs){

	    	var i;

	    	for (i = 0; i < rules.length; i++) {
	    		var rule = rules[i];
	    		if (rule.check(name, attribs)) {
	    			// start new element
	    			currentElements.push({
	    				stackIndex: 0,
	    				elements: [],
	    				rule: rule
	    			});
	    		}
	    	}

	    	data += "<" + name + "> " + JSON.stringify(attribs) + "\n";

			for (i = 0; i < currentElements.length; i++) {
				var currentElement = currentElements[i];
				currentElement.stackIndex++;
	    		currentElement.elements.push({tagnameStart: name, attrs: attribs});
			}

	    },
	    ontext: function(text){
	    	var txt = (text || "").trim();
	    	if (txt.length != 0) {
	    		for (var i = 0; i < currentElements.length; i++) {
	    			var currentElement = currentElements[i];
	    			currentElement.elements.push({text: text});
	    		}
	    	}
	    	data += text + "\n";
	    },
	    onclosetag: function(tagname){
	    	data += "<" + tagname + "\\>" + "\n";

			for (var i = 0; i < currentElements.length; i++) {
				var currentElement = currentElements[i];
				currentElement.elements.push({tagnameEnd: tagname});
	    		currentElement.stackIndex--;

	    		if (currentElement.stackIndex == 0) {
	    			// element ended

	    			var extractInfo = currentElement.rule.extractInfo;
	    			var info = {};
	    			if (typeof extractInfo === 'function') {
	    				info = extractInfo(currentElement.elements);
	    			}

	    			for (var k in info) {
	    				if (info.hasOwnProperty(k)) {
	    					productInfo[k] = info[k];
	    				}
	    			}

	    			// remove current element from array
	    			currentElements.splice(i, 1);
	    			i--;
	    		}

			}
	    },
	    onend: function () {
	    	require('fs').writeFile('test.txt', data);
            callback(null, productInfo);
	    }
	}, {decodeEntities: true});
	parser.write(htmlInput);
	parser.end();
}