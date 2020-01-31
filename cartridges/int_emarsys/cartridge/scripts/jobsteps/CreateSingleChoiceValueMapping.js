'use strict';
/**
* Create Single Choice Value Mapping
*/
var currentSite = require('dw/system/Site').getCurrent();
var Status = require('dw/system/Status');

var choiceValueMap = {
    /** @type {dw.system.Log} */
    logger: require('dw/system/Logger').getLogger('choiceValueMap', 'choiceValueMap'),
    /**
     * @description start CreateSingleChoiceValueMapping
     * @returns {dw.system.Status} - return status 'Ok' or 'Error'
     */
    execute: function() {
        try {
            this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/util/EmarsysHelper'))();

           this.CreateSingleChoiceValueMapping();
        } catch (err) {
            this.logger.error('choiceValueMap: Error ' + err.message + '\n' + err.stack);

            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    },
    /**
     * @description Create Single Choice Value Mapping
     * @returns {void}
     */
    CreateSingleChoiceValueMapping: function() {
        var fieldMapping  = {};
        var availableFields;
        var response = this.emarsysHelper.triggerAPICall('field', {}, 'GET');

        if (response.status === 'OK') {
            availableFields = JSON.parse(response.object);

            for (var keyField in availableFields['data']) {
                var field = availableFields['data'][keyField];
                if(field['application_type'] === 'singlechoice' || (field['application_type'] === 'special' && field['name'] === 'Opt-In')) {
                    response = this.emarsysHelper.triggerAPICall('field/' + field['id'] + '/choice', {}, 'GET');
                    if (response.status === 'OK') {
                        var fieldObject = JSON.parse(response.object),
                            filedChoiceMapping = [];

                        for (var keyFieldChoice in fieldObject['data']) {
                            var fieldChoice = fieldObject['data'][keyFieldChoice];
                            filedChoiceMapping.push({
                                "value" : fieldChoice['id'],
                                "choice" : fieldChoice['choice']
                            });
                        }

                        fieldMapping[field['id']] = filedChoiceMapping;
                    }
                }
            }

            currentSite.setCustomPreferenceValue('emarsysSingleChoiceValueMapping', JSON.stringify(fieldMapping));
        }

    }
};

exports.execute = choiceValueMap.execute.bind(choiceValueMap);
