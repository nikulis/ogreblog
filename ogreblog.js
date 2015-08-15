/*******************************************************************************
Ogreblog, an XKit extension for selectively removing nested post comments.

    Copyright (C) 2015 Nick Freeman <nikulis.github.io>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*******************************************************************************/

//* TITLE Ogreblog **//
//* VERSION 0.9 REV A **//
//* DESCRIPTION Tumblr comments have layers, and you might not want to reblog all of them. Take control of the layers with Ogreblog. **//
//* DETAILS ** Currently in beta - use at your own risk ** <br/><br/> This extension currently only supports tumblr's built-in rich text post editor. To make sure this is enabled, go to your dashboard settings and choose "Rich text editor". **//
//* DEVELOPER nikulis **//
//* FRAME false **//
//* BETA true **//

XKit.extensions.ogreblog = new Object({

	running: false,

	editorBody: undefined,

	run: function() {
		this.running = true;

		// Bind functionality to the post window
		XKit.interface.post_window_listener.add('ogreblog', XKit.extensions.ogreblog.waitForEditor);

	},

	destroy: function() {
		this.running = false;
	},

	waitForEditor: function() {

		// Get the editor wrapper div
		XKit.extensions.ogreblog.editorBody = jQuery('.editor.editor-richtext');

		if(XKit.extensions.ogreblog.editorBody.length === 0) {
			// If editor isn't yet loaded, wait 0.5 sec
			setTimeout(XKit.extensions.ogreblog.waitForEditor, 500);
			Xkit.console.add('Waiting on editor to load...');
			// return - don't continue yet
			return;
		}

		// short handle for convenience
		var editorBody = XKit.extensions.ogreblog.editorBody;

		// Get line-height of blog link containers
		var lineHeight;

		try {
			// Try to get actual reference height
			lineHeight = editorBody.find('a.tumblr_blog')[0].parentNode.clientHeight;
		} catch(err) {
			// If none found, set to 20px
			lineHeight = 20;
		}

		// Calculate other dimensions needed to construct the rm button
		var cx = lineHeight / 2;
		var cy = lineHeight / 2;
		var cr = lineHeight / 2;
		// var lineCoord1 = 0.281 * lineHeight;
		// var lineCoord2 = 0.719 * lineHeight;
		var lineCoord1 = 0.323 * lineHeight;
		var lineCoord2 = 0.677 * lineHeight;
		// Add the delete button in front of each author name
		editorBody.find('a.tumblr_blog').before(function(i, html) {
			return '<div class="ogreblog-rm-btn" style="display:inline-block;vertical-align:middle;cursor:pointer;margin-left:-0.5em;margin-right:0.5em;line-height:0;"><svg style="line-height:0;" width="' + lineHeight + '" height="' + lineHeight + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + cr + '" fill="#d95e40"/><line x1="' + lineCoord1 + '" y1="' + lineCoord1 + '" x2="' + lineCoord2 + '" y2="' + lineCoord2 + '" stroke="white" stroke-width="2"/><line x1="' + lineCoord2 + '" y1="' + lineCoord1 + '" x2="' + lineCoord1 + '" y2="' + lineCoord2 + '" stroke="white" stroke-width="2"/></svg></div>';
		});

		// Add onclick functionality for actually removing layers,
		// binding relative to the layer whose rm button is being clicked
		editorBody.find('.ogreblog-rm-btn').each(function(i) {
			$(this).data('layerNum',i);
			this.onclick = function() {

				var isInnerMostLayer = true;
				// Get the editor body relative to us and count the number of layers
				if(parseInt($(this).data('layerNum')) < $(this).closest('.editor').find('.ogreblog-rm-btn').length - 1) {
					isInnerMostLayer = false;
				}

				// We want to delete this layer, but keep the ones above and under it.
				// So, we need a handle to the layer above and the layer below this one.
				// First, let's get its parent: the closest containing blockquote (or the
				// editor itself, if this is the top-level layer)
				var parentLayer = $(this).closest('blockquote , .editor');

				// Construct child layer by keeping everything up to, and including,
				// the first <blockquote>. Everything after that is the content of the
				// current layer, which we want to remove.
				if(!isInnerMostLayer) {
					var childLayerElems = parentLayer.children('blockquote').contents().get();
					var i = 0;
					while(childLayerElems[i].nodeName !== 'BLOCKQUOTE') {
						i++;
						if(i >= childLayerElems.length) break; // for safety
					}
					// Now i is the index of the <blockquote>, remove everything after it
					while(childLayerElems.length > i + 1) {
						// Remove the node from its parent
						childLayerElems[i+1].parentNode.removeChild(childLayerElems[i+1]);
						// Remove the node from our array
						childLayerElems.splice(i+1,1);
					}
				}

				// Get a native DOM element to work with instead of a jQuery object
				var parentLayerElem = parentLayer[0];

				// Remove all child nodes up to, and including, the first <blockquote>
				// element. We want to save this layer's comments that come after that.
				while(parentLayerElem.hasChildNodes()) {
					if(parentLayerElem.firstChild.nodeName === 'BLOCKQUOTE') {
						parentLayerElem.removeChild(parentLayerElem.firstChild);
						break;
					}
					$(parentLayerElem.firstChild).css('border','1px solid red');
					parentLayerElem.removeChild(parentLayerElem.firstChild);
				}

				if(!isInnerMostLayer) {
					// If not removing the innermost layer,
					// re-insert our old child layer content
					parentLayer.prepend(jQuery(childLayerElems));
				}

				// Reassign the layer numbers
				$(parentLayer[0]).closest('.editor').find('.ogreblog-rm-btn').each(function(i) {
					$(this).data('layerNum',i);
				});
			
			};
		});

		// Bind the button-remover
		XKit.extensions.ogreblog.bindButtonRemover();

	},

	bindButtonRemover: function() {
		if(jQuery('.create_post_button').length === 0) {
			// If create_post button isn't yet loaded, wait for it to load
			setTimeout(XKit.extensions.ogreblog.bindButtonRemover, 100);
			Xkit.console.add('waiting on button...');
			return;
		}

		// Bind function to clear previously inserted layer buttons from editor on post save/submission
		jQuery('.create_post_button').get(0).onclick = function() {
			XKit.extensions.ogreblog.editorBody.find('.ogreblog-rm-btn').remove();
		};
	}

});