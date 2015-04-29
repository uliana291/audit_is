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
 * The "add a folder" dialog
 */
var MeasuresModal = Modal.extend({

    type: "filter",
    closeText: "Сохранить",

    events: {
        'submit form': 'save',
        'click .dialog_footer a' : 'call'
    },

    buttons: [
        { text: "OK", method: "save" },
        { text: "Отмена", method: "close" }
    ],

    message: "<form id='measure_form'>" +
                     "<table border='0px'>" +
                     "<tr><td class='col0 i18n'>Название:</td>" +
                     "<td class='col1'><input type='text' class='measure_name' value='Название меры'></input></td></tr>" +
                     "<tr><td class='col0 i18n'>Формула:</td>" +
                     "<td class='col1'><textarea class='measureFormula'>Measures.[Store Sales] + 100</textarea></td></tr>" +
                     "<tr><td class='col0 i18n'>Формат:</td>" +
                     "<td class='col1'><input class='measure_format' type='text' value='#,##0.00'></input></td></tr>" +
                     "</table></form>",


    measure: null,


    initialize: function(args) {
        var self = this;
        this.workspace = args.workspace;
        this.measure = args.measure;
        _.bindAll(this, "save");

        this.options.title = "Рассчитаная мера";

        if (this.measure) {
            _.extend(this.options, {
                title: "Фильтр для " + this.axis
            });
        }

        this.bind( 'open', function( ) {
            if (self.measure) {
            }

        });
        

        
        // fix event listening in IE < 9
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);    
        }

    },


    save: function( event ) {
        event.preventDefault( );
        var self = this;
        var measure_name = $(this.el).find('.measure_name').val();
        var measure_formula = $(this.el).find('.measureFormula').val();
        var measure_format = $(this.el).find('.measure_format').val();


        var alert_msg = "";
        if (typeof measure_name == "undefined" || !measure_name) {
            alert_msg += "Вы должны ввести наименование меры! ";
        }
        if (typeof measure_formula == "undefined" || !measure_formula || measure_formula === "") {
            alert_msg += "Вы должны вветси MDX формулу для меры! ";
        }
        if (alert_msg !== "") {
            alert(alert_msg);
        } else {
            var m = { name: measure_name, formula: measure_formula, properties: {}, uniqueName: "[Measures]." + measure_name };
            if (measure_format) {
                m.properties.FORMAT_STRING = measure_format;
            }
            self.workspace.query.helper.addCalculatedMeasure(m);
            self.workspace.sync_query();
            this.close();
        }
        
        return false;
    },

    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    }


});
