# Ogreblog

**Like an ogre, tumblr comments have layers - and you might not want to reblog all of them. Take control of the layers with Ogreblog.**

This is an extension for [XKit](https://github.com/atesh/XKit), an extension framework that powers tweaks for Tumblr. Learn more at [xkit.info](http://xkit.info).

**Note:** This extension is currently in beta - use at your own risk. Ogreblog currently only supports Tumblr's built-in TinyMCE WYSIWYG post editor. To make sure it is enabled, go to your Tumblr dashboard settings and choose "Rich text editor".

<small><small>This extension is neither endorsed nor supported by Tumblr or Studio Xenix.</small></small>


## Installation 

- Open XKit panel
- Click the “Other” tab at the bottom
- Choose “XKit Editor” from the left-hand menu, then “Open Editor”.
- Click “New Extension”, name it “ogreblog”, click “ok"
- Make sure the “Script” tab is selected at the top, delete all of the auto-generated template code and paste in the full content of ogreblog.js (Just open in some plaintext editor (notepad, etc.) and copy/paste the whole thing.)
- Click “Save”
- Go back to tumblr, open XKit panel - Ogreblog should be listed in the enabled extensions in the “My XKit” tab.

Ogreblog should now work! If you want to add the icon to show up in the XKit panel, do the following:

- Use the XKit Extension Editor to open the Ogreblog extension.
- Choose the "Icon" tab and paste in the full content of ogreblog-icon-data.txt.
- Save

## Usage Instructions

Ogreblog should activate any time a window opens to edit / reblog a post, including on the dashboard and when editing posts in your drafts or queue. If the post has nested comments, there should be a red “X” button next to each comment author’s name - click the button to delete ONLY that user's comment layer, keeping the rest (above and below it) intact. 

Note: If a post has comments that are formatted weirdly - e.g., someone previously changed the normal comment structure - Ogreblog will try its best to interpret the comment layer structure, but it may not do what you want / expect.

Remember: with great power comes great responsibility.