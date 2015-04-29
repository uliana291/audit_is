/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
 
/**
 * The user's current locale
 */
Saiku.i18n = {
    locale: "ru",
    po_file: {},
    translate: function (specificElement) {
        if (specificElement) {
            $(specificElement).find('.i18n').i18n(Saiku.i18n.po_file);
        } else {
            $('.i18n').i18n(Saiku.i18n.po_file);
        }
    },
    automatic_i18n: function () {
        // Load language file if it isn't English

        // compatible 'zh-CN' -> 'zh';
        if (Saiku.i18n.locale == 'zh') {
            Saiku.i18n.locale = 'cn';
        }
        // Load language file if edit in Settings.js
        else if (Settings.I18N_LOCALE !== 'en') {
            Saiku.i18n.locale = Settings.I18N_LOCALE;   
        }

        if (Saiku.i18n.locale != "en") {
            $.ajax({
                url: "js/saiku/plugins/I18n/po/" + Saiku.i18n.locale + ".json",
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    Saiku.i18n.po_file = data;
                    Saiku.i18n.translate();
                }
            });
        }

        return true;
    },
    elements: [],
    improve_translation: function () {
        return false;
    }
};

function recursive_menu_translate(object, po_file) {
    if (object && object.hasOwnProperty('name') && object.i18n && po_file) {
    	var translation = po_file[object.name];
    	if (typeof translation != "undefined") {
    		object.name = translation;
    	} else if (object && object.hasOwnProperty('name') && po_file) {
            if (Saiku.i18n.elements.indexOf(object.name) === -1) {
                Saiku.i18n.elements.push(object.name);
            }
        }
    }
	
	if (typeof object.items != "undefined") {
		$.each(object.items, function(key, item){
	    	recursive_menu_translate(item, po_file);
		});
	}
};		

/**
 * jQuery plugin for i18n
 */
(function( $ ){
	/**
	 * Internationalize selected elements with the provided PO file
	 */
	$.fn.i18n = function(po_file) {
		// If no PO file is provided, then don't translate anything
		if (! po_file)
			return this;
		
		// If key is not found, return original language
		var translate = function(key, po_file) {
			if (typeof po_file[key] == "undefined") {
				return "";
			} else {
				return po_file[key];
			}
		};		

		// Iterate over UI elements that need to be translated
		return $.each(this, function() {
			element = $(this);
			
			// Translate text
			if (element.html()) {
				translated_text = translate( element.html(), po_file );
                if (Saiku.i18n.elements.indexOf &&
                    Saiku.i18n.elements.indexOf(element.html()) === -1) {
                    Saiku.i18n.elements.push(element.html());
                }
				if (translated_text) {
					element.data('original', element.html());
					element.html(translated_text);
					element.removeClass('i18n');
				}
			}
			
			// Translate title
			if (element.attr('title')) {
				translated_title = translate( element.attr('title'), po_file );
                if (Saiku.i18n.elements.indexOf && 
                    Saiku.i18n.elements.indexOf(element.attr('title')) === -1) {
                    Saiku.i18n.elements.push(element.attr('title'));
                }
				if (translated_title) {
					element.data('original', element.attr('title'));
					element.attr({ 'title': translated_title });
					element.removeClass('i18n');
				}
			}
			
			if (element.attr('value')) {
				translated_value = translate( element.attr('value'), po_file );
                if (Saiku.i18n.elements.indexOf && 
                    Saiku.i18n.elements.indexOf(element.attr('value')) === -1) {
                    Saiku.i18n.elements.push(element.attr('value'));
                }
				if (translated_value) {
					element.data('original', element.attr('value'));
					element.attr({ 'value': translated_value });
					element.removeClass('i18n');
				}
			}
			
			// Remove class so this element isn't repeatedly translated
			if (element.hasClass('i18n')) {
			    element.addClass('i18n_failed');
			}
			element.addClass('i18n_translated');
		});
	};
	
	$.fn.un_i18n = function() {
		// Iterate over UI elements to replace the original text
		return $.each(this, function() {
			element = $(this);
			
			if (element.text())
				element.text(element.data('original'));
			
			if (element.attr('title'))
				element.attr({ 'title': element.data('original') });
			
			element.addClass('i18n');
			element.removeClass('i18n_translated')
			    .removeClass('i18n_failed');
		});
	};
})( jQuery );

/**
 * Automatically internationalize the UI based on the user's locale
 */
Saiku.i18n.automatic_i18n();


/**
 * Bind to new workspace
 */
Saiku.events.bind('session:new', function() {    
    // Translate elements already rendered
    Saiku.i18n.translate();
    
    // Translate new workspaces
    Saiku.session.bind('tab:add', Saiku.i18n.translate);

});

/**
 * Initialize Loggly input for user-provided translations
 */
if (window.logger) {
    window.Translate = new logger({ 
        url: Settings.TELEMETRY_SERVER + '/input/translations'
    });
}
