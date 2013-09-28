/*
 * Created by Alex Cottner on 9/2013.
 * This is a direct replacement for the stock signature field. It is a very heavily 
 * modified version that works exactly the way I want. Rather than having a "view"
 * and an "Edit" mode, both are rolled into one. This stores the image as Base64 PNG.
 */

define('AlexFMS/SignatureField', [
    'dojo/_base/declare',
    'dojo/_base/json',
    'dojo/dom-attr',
    'Sage/Platform/Mobile/Format',
    'Sage/Platform/Mobile/Fields/_Field',
    'Sage/Platform/Mobile/FieldManager'
], function(
    declare,
    json,
    domAttr,
    format,
    Field,
    FieldManager
) {

    /**
     * @class Sage.Platform.Mobile.Fields.SignatureField
     * The SignatureField uses an HTML5 canvas element to render the signature.
     * Signature is saved as a PNG in base64.
     *
     * ###Example:
     *     {
     *         name: 'Signature',
     *         property: 'Signature',
     *         label: this.signatureText,
     *         type: 'signature'
     *     }
     *
     * @alternateClassName SignatureField
     * @extends Sage.Platform.Mobile.Fields.Field
     * @requires Sage.Platform.Mobile.FieldManager
     * @requires Sage.Platform.Mobile.Views.SignatureView
     * @requires Sage.Platform.Mobile.Format
     */
    var control = declare('AlexFMS.SignatureField', [Field], {
        // Localization
        /**
         * @property {String}
         * Text used for ARIA label
         */
        signatureLabelText: 'signature',
        /**
         * @property {String}
         * Text used within button
         */
        clearText: 'clear',
        /**
         * @property {Boolean}
         * Set to false if the user should not be able to clear or draw on the signature grid.
         */
        enabled: true,
        /**
         * @property {Simplate}
         * Simplate that defines the fields HTML Markup
         *
         * * `$` => Field instance
         * * `$$` => Owner View instance
         *
         */
        widgetTemplate: new Simplate([
            '<label for="{%= $.name %}" style="z-index: 1;">{%: $.label %}</label>',
            '<button class="button simpleSubHeaderButton" data-dojo-attach-point="btnClear" style="z-index: 1;"><span aria-hidden="true">{%: $.clearText %}</span></button>',
            '<canvas data-dojo-attach-point="signatureNode" style="position: relative; border: 1px solid #000000; z-index:0;"></canvas>'
        ]),
        
        init: function() {
        	this.inherited(arguments);
        	this.connect(this.btnClear, 'onclick', this.clearValue);
        },
        
        getValue: function() {
        	return this.signatureNode.toDataURL("image/png");
        },
        
        /**
         * Sets the signature value by loading the PNG Base64 string into the canvas.
         * @param val
         * @param initial
         */
        setValue: function (val, initial) {
        	console.log(val);
        	console.log(initial);
        	
        	if (initial) this.originalValue = val;
        	this.currentValue = val;
        	if (!val)
        		return;
        	var tempImage = new Image();
        	tempImage.src = val;
        	this.signatureNode.getContext('2d').drawImage(tempImage, 0, 0);
        },
        /**
         * Resets our canvas to an emtpy canvas with a line.
         */
        clearValue: function() {
        	var canvas = this.signatureNode;
    		var context = canvas.getContext("2d");
			// setting max width to 450 and height to 150
			// setting this any bigger appears to cause issues on devices with very high pixel densities (aka, my phone)
    		if (screen.width > 450) {
    			canvas.width = 450;
    			canvas.height = 150;
    		} else {
    			canvas.width = screen.width - 150;
    			canvas.height = screen.width / 3;
    		}
    		// if we aren't enabled, stop here
    		if (!this.enabled)
    			return;
			// if we are enabled, draw empty box with a line
    		context.fillStyle = "#fff";
    		context.fillRect(0, 0, canvas.width, canvas.height);
    		context.strokeStyle = "#202020";
    		context.lineWidth = 1;
    		context.moveTo((canvas.width * 0.042), (canvas.height * 0.7));
    		context.lineTo((canvas.width * 0.958), (canvas.height * 0.7));
    		context.stroke();
    		context.fillStyle = "#fff";
    		context.lineWidth = 2;
    		context.strokeStyle = "#0000c0";

    		var pixels = [];
    		var xyLast = {};
    		var xyAddLast = {};
    		var draw = false;

			// reset event listeners
    		function remove_event_listeners() {
    			canvas.removeEventListener('mousemove', on_mousemove, false);
    			canvas.removeEventListener('mouseup', on_mouseup, false);
    			canvas.removeEventListener('touchmove', on_mousemove, false);
    			canvas.removeEventListener('touchend', on_mouseup, false);

    			document.body.removeEventListener('mouseup', on_mouseup, false);
    			document.body.removeEventListener('touchend', on_mouseup, false);
    		}

			// calculate coordinates
    		function get_board_coords(e) {
    			var x, y;
    			if (e.changedTouches && e.changedTouches[0]) {
    				// need to calculate offsets based on the current position in the browser window
    				var boundRect = canvas.getBoundingClientRect();
    				var offsety = boundRect.top;
    				var offsetx = boundRect.left;
    				x = e.changedTouches[0].pageX - offsetx;
    				y = e.changedTouches[0].pageY - offsety;
    			} else if (e.layerX || 0 == e.layerX) {
    				x = e.layerX;
    				y = e.layerY;
    			} else if (e.offsetX || 0 == e.offsetX) {
    				x = e.offsetX;
    				y = e.offsetY;
    			}

    			return {
    				x : x,
    				y : y
    			};
    		}

			// handling mouse click and touch events
    		function on_mousedown(e) {
    			e.preventDefault();
    			e.stopPropagation();

    			canvas.addEventListener('mousemove', on_mousemove, false);
    			canvas.addEventListener('mouseup', on_mouseup, false);
    			canvas.addEventListener('touchmove', on_mousemove, false);
    			canvas.addEventListener('touchend', on_mouseup, false);

    			document.body.addEventListener('mouseup', on_mouseup, false);
    			document.body.addEventListener('touchend', on_mouseup, false);

    			empty = false;
    			var xy = get_board_coords(e);
    			context.beginPath();
    			pixels.push('moveStart');
    			context.moveTo(xy.x, xy.y);
    			pixels.push(xy.x, xy.y);
    			xyLast = xy;
    		}

			// handling drag events for mouse and touch
    		function on_mousemove(e, finish) {
    			e.preventDefault();
    			e.stopPropagation();

    			var xy = get_board_coords(e);
    			var xyAdd = {
    				x : (xyLast.x + xy.x) / 2,
    				y : (xyLast.y + xy.y) / 2
    			};

    			if (draw) {
    				var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
    				var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
    				pixels.push(xLast, yLast);
    			} else {
    				draw = true;
    			}

    			context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
    			pixels.push(xyAdd.x, xyAdd.y);
    			context.stroke();
    			context.beginPath();
    			context.moveTo(xyAdd.x, xyAdd.y);
    			xyAddLast = xyAdd;
    			xyLast = xy;

    		}

			// handling release click and touch stop events
    		function on_mouseup(e) {
    			remove_event_listeners();
    			disableSave = false;
    			context.stroke();
    			pixels.push('e');
    			draw = false;
    		}
    		
    		canvas.addEventListener('mousedown', on_mousedown, false);
    		canvas.addEventListener('touchstart', on_mousedown, false);
        },
        /**
         * No need to format, just return our value
         * @param val
         * @return {Array/String}
         */
        formatValue: function(val) {
            return val;
        }
    });
	// override the stock signature field
    return FieldManager.register('signature', control);
});
