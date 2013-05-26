var Slides = {
	modules: {},
	slides: [],
	current: null,

	_path: [].slice.call(document.querySelectorAll("script")).pop().src.split("/").slice(0, -1).join("/"),
	_listeners: {
		key: [],
		change: []
	},

	next: function() {
		var result = this.current.next();
		if (!result) {
			var index = this.slides.indexOf(this.current) + 1;
			if (index == this.slides.length) { return; }
			this.show(this.slides[index]);
		}
	},

	prev: function() {
		var result = this.current.prev();
		if (!result) { 
			var index = this.slides.indexOf(this.current) - 1;
			if (index == -1) { return; }
			this.show(this.slides[index], true); 
		}

	},

	show: function(slide, expandAll) {
		this.current = slide;

		for (var i=0;i<this.slides.length;i++) {
			var slide = this.slides[i];
			if (this.current == slide) {
				slide.show(expandAll);
			} else {
				slide.hide();
			}
		}

		var event = {type:"change"};
		for (var i=0;i<this._listeners.change.length;i++) { this._listeners.change[i](event); }
	},

	addStylesheet: function(path) {
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = this._path + "/" + path;
		document.body.appendChild(link);
	},

	addKeyListener: function(listener, keys, label) {
		this._listeners.key.push({
			listener: listener,
			keys: [].concat(keys),
			label: label
		});
	},

	addChangeListener: function(listener) {
		this._listeners.change.push(listener);
	},

	getKeyListeners: function() {
		return this._listeners.key;
	},
	
	format: function(template) {
		var replacements = {
			"s": this.current.getNode().querySelector("h2, h3, strong, em").innerHTML,
			"t": document.body.querySelector("h1").innerHTML,
			"n": this.slides.indexOf(Slides.current) + 1,
			"c": this.slides.length
		};
		return template.replace(/%([a-z])/g, function(match, letter) {
			return replacements[letter] || match;
		});
	},

	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				this.addStylesheet("slides3.css");

				var nodes = document.querySelectorAll(".slide");
				for (var i=0;i<nodes.length;i++) {
					this.slides.push(new Slide(nodes[i]));
				}

				this.show(this.slides[0]);

				for (var id in this.modules) {
					var script = document.createElement("script");
					script.src = this._path + "/" + id + "/module.js";
					document.body.appendChild(script);
				}
			break;

			case "keydown":
			case "keypress":
				if (e.keyCode == 9) { 
					e.preventDefault();
					return;
				}
				for (var i=0;i<this._listeners.key.length;i++) {
					var item = this._listeners.key[i];
					var code = e.keyCode;
					if (e.type == "keypress") { code = String.fromCharCode(e.charCode).toUpperCase(); }
					if (item.keys.indexOf(code) != -1) { item.listener(e); }
				}
			break;
		} /* switch */
	} /* handleEvent */
};
window.addEventListener("load", Slides);
document.addEventListener("keydown", Slides);
document.addEventListener("keypress", Slides);

var Slide = function(node) {
	this._node = node;

	this._sections = [];
	this._index = -1;
	
	this._findSections(node);
	this.next(); /* show first section */
}

Slide.prototype.getNode = function() {
	return this._node;
}

Slide.prototype._findSections = function(node) {
	if (node.classList.contains("section")) { 
		this._sections.push(node);
	}

	var hasSections = node.classList.contains("sections");
	node.classList.remove("sections");
	
	for (var i=0;i<node.children.length;i++) {
		var child = node.children[i];
		if (hasSections) { child.classList.add("section"); }
		this._findSections(child);
	}
}

Slide.prototype.hide = function() {
	this._node.classList.remove("current");
}

Slide.prototype.show = function(expandAll) {
	this._node.classList.add("current");

	this._index = (expandAll ? this._sections.length-1 : 0);
	for (var i=0;i<this._sections.length;i++) {
		var section = this._sections[i];
		if (i == this._index) {
			section.classList.add("current");
		} else {
			section.classList.remove("current");
		}
	}
}

Slide.prototype.next = function() {
	if (this._index+1 >= this._sections.length) { return false; }

	if (this._index != -1) { this._sections[this._index].classList.remove("current"); }
	this._sections[++this._index].classList.add("current");

	return true;
}

Slide.prototype.prev = function() {
	if (this._index <= 0) { return false; }

	this._sections[this._index].classList.remove("current");
	this._sections[--this._index].classList.add("current");

	return true;
}

/* default module configuration */
Slides.modules.keyboard = true;
Slides.modules.url = true;
Slides.modules.title = "(%n) %t"; /* %t %s %n %c" */
Slides.modules.progress = {
	template: "%n/%c",
	parent: document.querySelector("footer") || document.body
};
Slides.modules.skin = "seznam";
Slides.modules.language = ["en"];
Slides.modules.transition = "horizontal"; /* none vertical horizontal blend corner */
Slides.modules.overview = true;
Slides.modules.help = true;
Slides.modules.fontsize = true;

/*
		syntax: 1,
		touch: 1 
*/