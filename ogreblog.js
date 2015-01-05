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
//* VERSION 0.1 REV A **//
//* DESCRIPTION Like an ogre, tumblr comments have layers - and you might not want to reblog all of them. Take control of the layers with Ogreblog. **//
//* DETAILS ** Currently in beta - use at your own risk ** <br/><br/> This extension currently only supports tumblr's built-in TinyMCE WYSIWYG post editor. To make sure this is enabled, go to your dashboard settings and choose "Rich text editor". **//
//* DEVELOPER nikulis **//
//* FRAME false **//
//* BETA true **//

XKit.extensions.ogreblog = new Object({

	running: false,

	mceBody: undefined,

	run: function() {
		this.running = true;

		// Bind functionality to the post window
		XKit.interface.post_window_listener.add("ogreblog", function() {
			// Start listening for tinymce to init
			XKit.extensions.ogreblog.waitForTinyMCE();
			mymce = XKit.interface.post_window;
		});		

	},

	destroy: function() {
		this.running = false;
	},

	waitForTinyMCE: function() {
	
		if(jQuery('#post_two_ifr').length === 0) {
			// If tinyMCE isn't yet loaded, wait 0.5 sec
			setTimeout(XKit.extensions.ogreblog.waitForTinyMCE, 500);
			return;
		}

		// Get the body element of the tinyMCE editor
		XKit.extensions.ogreblog.mceBody = jQuery('#post_two_ifr').contents().find('#tinymce');

		if(XKit.extensions.ogreblog.mceBody.length === 0) {
			// Wait for it to load contents of tinyMCE editor iframe
			setTimeout(XKit.extensions.ogreblog.waitForTinyMCE, 500);
		}
		// for convenience
		var mceBody = XKit.extensions.ogreblog.mceBody;

		// Add the delete button in front of each author name
		mceBody.find('a.tumblr_blog').before(function(i, html) {
			return '<div class="ogreblog-rm-btn" style="display:inline-block;margin-right:0.5em;color:white;background-color:#d95e40;border:2px solid #d95e40;cursor:pointer;border-radius:2px;width:1.25em;font-size:75%;font-weight:bold;text-align:center;">&#x2715;</span>';
		});

		// Add onclick functionality for actually removing layers,
		// binding relative to "this" layer
		mceBody.find('.ogreblog-rm-btn').each(function(i) {
			$(this).data('layerNum',i);
			this.onclick = function() {

				var isInnerMostLayer = true;
				// Get the tinyMCE body relative to us and count the number of layers
				if(parseInt($(this).data('layerNum')) < $(this).closest('#tinymce').find('.ogreblog-rm-btn').length - 1) {
					isInnerMostLayer = false;
				}

				// We want to delete this layer, but keep the ones under it
				// this.parent = <p> containing this username <a>
				// this.parent.parent = containing <blockquote> or mce <body>, if this is a top-level comment
				var parentLayer = $(this).parent().parent();
				
				// Save our child layer contents, stripping off the surrounding blockquote
				// and then then take only the first 2 children: author <p> and their <blockquote>
				var childLayer = parentLayer.children('blockquote').children().slice(0,2);

				// Detach this layer: the author <p> and their associated <blockquote>,
				// which are the first two children. (Must use jQuery .slice(), not javascript .splice())
				var removing_elems = parentLayer.children().slice(0,2);
				removing_elems.css('border','1px solid red');
				
				//setTimeout(function() {
					removing_elems.detach();
				//}, 1500);
				
				if(!isInnerMostLayer) {
					// If not removing the innermost layer,
					// re-insert our old child layer content
					parentLayer.prepend(childLayer);
				}

				// Reassign the layer numbers
				$(childLayer[0]).closest('#tinymce').find('.ogreblog-rm-btn').each(function(i) {
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
			XKit.console.add('waiting on button...');
			return;
		}

		// Bind function to clear previously inserted layer buttons from tinyMCE editor on post save/submission
		jQuery('.create_post_button').get(0).onclick = function() {
			jQuery('#post_two_ifr').contents().find('#tinymce').find('.ogreblog-rm-btn').remove();
		};
	}

});