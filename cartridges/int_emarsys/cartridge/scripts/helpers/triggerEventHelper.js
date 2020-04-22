'use strict';

var Site = require('dw/system/Site');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var emarsysHelper = new (require('int_emarsys/cartridge/scripts/helpers/emarsysHelper'))();

/**
 * @description Set additional parameters into request object
 * @param {Object} context - main context object
 * @param {Object} requestObject - object with request parameters
 * @return {Object} - changed or created request object
 */
function setAdditionalParams(context, requestObject) {
    var requestObj = requestObject || {};
    if (context.profileFields) {
        Object.keys(context.additionalParams).forEach(function (paramName) {
            var param = {};
            param.string_id = paramName;
            param.value = this.additionalParams[paramName];

            var fieldDescription = this.profileFields[param.string_id] || {};
            // get index of field with specified name
            param.id = fieldDescription.id;

            // rewrite specified value by appropriate field option (for single choice fields)
            if (!empty(fieldDescription.isSingleChoice) && !empty(fieldDescription.options)) {
                param.value = fieldDescription.options[param.value];
            }

            // process valid parameters only
            if (!empty(param.id) && !empty(param.value)) {
                this.requestObj[param.id] = param.value;
            }
        }, {
            additionalParams: context.additionalParams,
            requestObj: requestObj,
            profileFields: context.profileFields
        });
    }
    return requestObj;
}

/**
 * @description triggers external event
 * @param {Object} context - main context object
 * @param {Function} onError - error handler
 * @return {Object} context object
 */
function triggerExternalEvent(context, onError) {
    var response = {};
    var requestObj = {};

    if (!empty(context.externalEventId)) {
        try {
            var endpoint = 'event/' + context.externalEventId + '/trigger';

            // context.additionalParams = { first_name: 'John', last_name: 'Snow', optin: 'True' };
            if (context.additionalParams) {
                requestObj = setAdditionalParams(context);
            }

            requestObj.key_id = context.profileFields.email.id;
            requestObj.external_id = context.email;

            response = emarsysHelper.triggerAPICall(endpoint, requestObj, 'POST');

            if (response.status !== 'OK') {
                throw new Error(response.errorMessage);
            }
        } catch (err) {
            if (onError) { return onError(err); }
            throw new Error('[Emarsys triggerEventHelper.js triggerExternalEvent()] - ***Emarsys trigger event data error message:' + err.message + '\n' + err.stack);
        }
    }
    return context;
}

/**
 * @description Set external events data to the passed object
 * @param {string} sfccEventName - name of event on sfcc side
 * @return {Object} specified external event description (mapping)
 */
function getExternalEventData(sfccEventName) {
    var BMEventsHelper = require('*/cartridge/scripts/helpers/emarsysEventsHelper');
    var context = {};
    try {
        // read other external events description
        var custom = BMEventsHelper.readEventsCustomObject(['otherResult'], 'StoredEvents');

        context = {
            sfccEventName: sfccEventName,
            otherResult: custom.fields.otherResult
        };

        // get emarsys side event name and it's id for Forgot password submitted
        Object.keys(custom.fields.otherResult).forEach(function (id) {
            if (this.otherResult[id].sfccName === this.sfccEventName) {
                this.eventDescription = this.otherResult[id];
            }
        }, context);

        if (empty(context.eventDescription) || empty(context.eventDescription.emarsysId)) {
            throw new Error('Event "' + sfccEventName + '" is not mapped. Check "otherResult" fild of "EmarsysExternalEvents" custom object');
        }
    } catch (err) {
        throw new Error('[Emarsys triggerEventHelper.js getExternalEventData()] - ***Get external event description error message:' + err.message + '\n' + err.stack);
    }

    // return description of specified event
    return context.eventDescription;
}

/**
 * @description Get Emarsys profile fields descriptions
 * @return {Object} - Emarsys fields descriptions
 */
function prepareFieldsDescriptions() {
    var currentSite = Site.getCurrent();
    var fieldValueMapping = {};
    var profileFieldsList = [];
    try {
        var ProfileFieldsCO = CustomObjectMgr.getCustomObject('EmarsysProfileFields', 'profileFields');
        profileFieldsList = JSON.parse(ProfileFieldsCO.custom.result);
    } catch (err) {
        throw new Error('[Emarsys triggerEventHelper.js getEmarsysProfileFields()] - ***Get Emarsys profile fields error message:' + err.message + '\n' + err.stack);
    }

    try {
        fieldValueMapping = JSON.parse(currentSite.getCustomPreferenceValue('emarsysSingleChoiceValueMapping'));
    } catch (err) {
        throw new Error('[Emarsys triggerEventHelper.js getSingleChoiceValueMapping()] - ***Get single choice value mapping error message:' + err.message + '\n' + err.stack);
    }

    var profileFields = {};
    profileFieldsList.forEach(function (fieldObj) {
        var field = {
            id: '' + fieldObj.id,
            name: fieldObj.name,
            string_id: fieldObj.string_id,
            application_type: fieldObj.application_type
        };

        field.isSingleChoice = Object.keys(this.fieldValueMapping).indexOf(field.id) !== -1;
        // get options data (if any exist)
        if (field.isSingleChoice) {
            field.options = {};
            this.fieldValueMapping[field.id].forEach(function (valueObj) {
                this.options[valueObj.choice] = valueObj.value;
            }, field);
        }

        // write data to profile fields collection if the record is valid
        if (!empty(fieldObj.string_id) && !empty(fieldObj.id)) {
            this.profileFields[fieldObj.string_id] = field;
        }
    }, {
        profileFields: profileFields,
        fieldValueMapping: fieldValueMapping
    });
    return profileFields;
}

module.exports = {
    triggerExternalEvent: triggerExternalEvent,
    getExternalEventData: getExternalEventData,
    prepareFieldsDescriptions: prepareFieldsDescriptions
};
