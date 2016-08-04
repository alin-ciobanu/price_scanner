import * as htmlparser from 'htmlparser2';
import * as utils from '../util/utils';
import sites from './siteSchemas';

var rules = sites['bikexcs.com'];

export function parseLink (htmlInput, callback) {
	callback = utils.safeCallback(callback);

	var resetCurrentElement = function () {
		return {
				stackIndex: -1,
				status: "IDLE",
				elements: []
			};
	};

	var currentElement = resetCurrentElement();

	var data = '';
	var parser = new htmlparser.Parser({
	    onopentag: function(name, attribs){

	    	if (currentElement.status == "IDLE") {
		    	for (var i = 0; i < rules.length; i++) {
		    		var rule = rules[i];
		    		if (rule.check(name, attribs)) {
		    			// start new element
		    			currentElement.stackIndex = 0;
		    			currentElement.status = "PENDING";
		    			currentElement.elements = [];
		    			currentElement.rule = rule;
		    		}
		    	}
	    	}

	    	data += "<" + name + "> " + JSON.stringify(attribs) + "\n";

	    	currentElement.stackIndex++;
	    	currentElement.elements.push({tagnameStart: name, attrs: attribs});
	    },
	    ontext: function(text){
	    	var txt = (text || "").trim();
	    	if (txt.length != 0) {
	    		currentElement.elements.push({text: text});
	    	}
	    	data += text + "\n";
	    },
	    onclosetag: function(tagname){
	    	data += "<" + tagname + "\\>" + "\n";
	    	currentElement.elements.push({tagnameEnd: tagname});
	    	currentElement.stackIndex--;

	    	if (currentElement.stackIndex == 0 && currentElement.status == "PENDING") {
	    		// element ended

	    		var extractInfo = currentElement.rule.extractInfo;
	    		var info = {};
	    		if (typeof extractInfo === 'function') {
	    			info = extractInfo(currentElement.elements);
	    		}

	    		console.log(currentElement.rule.name, info);

	    		currentElement = resetCurrentElement();
	    	}
	    },
	    onend: function () {
	    	require('fs').writeFile('test.txt', data);
            callback();
	    }
	}, {decodeEntities: true});
	parser.write(htmlInput);
	parser.end();
}