'use strict';

var Resource = require('dw/web/Resource');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/**
 * @description Make call to Emarsys
 * @param {string} endpoint - API endpoint to make a call at
 * @param {Object} requestBody - request body (for POST or PUT)
 * @param {string} requestMethod - request method
 * @return {Object} - object with response data
 */
function makeCallToEmarsys(endpoint, requestBody, requestMethod) {
    var emarsysService = require('int_emarsys/cartridge/scripts/service/emarsysService');
    var responseBody = {};
    var resultObj = {};

    var response = emarsysService.call(endpoint, requestBody, requestMethod);
    if (empty(response) || response.status === 'ERROR') {
        resultObj = { status: 'ERROR' };
        if (response.errorMessage) {
            try {
                responseBody = JSON.parse(response.errorMessage);
                resultObj.replyCode = responseBody.replyCode;
                resultObj.replyMessage = responseBody.replyText;
                resultObj.message = responseBody.replyText + ' (' +
                    Resource.msg('emarsys.reply.code', 'errorMessages', null) +
                    responseBody.replyCode + ')';
            } catch (err) {
                resultObj.message = Resource.msg('parsing.error', 'errorMessages', null);
            }
        } else {
            resultObj.responseCode = response.error;
            resultObj.responseMessage = response.msg;
            resultObj.message = response.msg + ' (' +
                Resource.msg('emarsys.response.code', 'errorMessages', null) +
                response.error + ')';
        }
        return resultObj;
    }
    try {
        return {
            status: 'OK',
            result: JSON.parse(response.object)
        };
    } catch (err) {
        return {
            status: 'ERROR',
            message: Resource.msg('parsing.error', 'errorMessages', null)
        };
    }
}

/**
 * Parse string representation of array
 * @param {string} listText - string representation of Array (may be empty)
 * @return {Array} - parsed array (null for parse error)
 */
function parseList(listText) {
    var list = [];
    if (listText && listText.length) {
        try {
            list = JSON.parse(listText);
        } catch (err) {
            list = null;
        }
    }
    return list;
}

/**
 * Reads specified fields of EmarsysExternalEvents custom object
 * @param {Array} fieldsKeys - keys of fields to read
 * @param {string} objectKey - EmarsysExternalEvents custom object key
 * @return {Object} - custom object data
 */
function readEventsCustomObject(fieldsKeys, objectKey) {
    var custom = {};
    var customObjectKey = objectKey;

    // get object which contain external events description (on BM side)
    custom.object = CustomObjectMgr.getCustomObject('EmarsysExternalEvents', customObjectKey);
    if (custom.object === null) {
        throw new Error(
            Resource.msg('custom.object.error1', 'errorMessages', null) +
            customObjectKey +
            Resource.msg('custom.object.error2', 'errorMessages', null)
        );
    }

    custom.fields = {};
    fieldsKeys.forEach(function (fieldKey) {
        var list = parseList(custom.object.custom[fieldKey]);
        var isFieldInvalid = false;
        if (fieldKey === 'newsletterSubscriptionSource' || fieldKey === 'otherSource') {
            isFieldInvalid = !list || list.length === 0;
        } else {
            isFieldInvalid = !list;
        }
        if (isFieldInvalid) {
            throw new Error(
                Resource.msg('invalid.field.error1', 'errorMessages', null) +
                fieldKey +
                Resource.msg('invalid.field.error2', 'errorMessages', null)
            );
        }
        this.fields[fieldKey] = list;
    }, custom);

    return custom;
}

/**
 * Event name formatter for Emarsys side
 * @param {string} sfccName - BM side event name
 * @return {string} - Emarsys side event name
 */
function eventNameFormatter(sfccName) {
    var formattedName = '';
    formattedName = sfccName.replace(/[-\s]+/g, '_');
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1_$2');
    return 'SFCC_' + formattedName.toUpperCase();
}

/**
 * Gets list of not mapped sfcc events
 * @param {Array} namesList - sfcc event names list
 * @param {Array} descriptionsList - mapped sfcc events descriptions
 * @return {Array} - not mapped events list
 */
function getNotMappedEvents(namesList, descriptionsList) {
    var notMappedEvents = namesList.filter(function (sfccName) {
        return this.every(function (eventObject) {
            return eventObject.sfccName !== this.sfccName;
        }, { sfccName: sfccName });
    }, descriptionsList);

    return notMappedEvents;
}

/**
 * Create descriptions collection for used Emarsys events
 * @param {Array} allEmarsysEvents - description list from Emarsys
 * @param {Array} sfccNames - sfcc event names list
 * @return {Array} - all allowed Emarsys events descriptions
 */
function getEmarsysEvents(allEmarsysEvents, sfccNames) {
    var allowedEmarsysDescriptions = sfccNames.map(function (name) {
        var emarsysDescription = {
            id: '',
            name: eventNameFormatter(name)
        };
        this.some(function (descriptionObj) {
            var isAppropriate = this.name === descriptionObj.name;
            if (isAppropriate) { this.id = descriptionObj.id; }
            return isAppropriate;
        }, emarsysDescription);
        return emarsysDescription;
    }, allEmarsysEvents);

    return allowedEmarsysDescriptions;
}

module.exports = {
    makeCallToEmarsys: makeCallToEmarsys,
    parseList: parseList,
    readEventsCustomObject: readEventsCustomObject,
    getNotMappedEvents: getNotMappedEvents,
    getEmarsysEvents: getEmarsysEvents,
    eventNameFormatter: eventNameFormatter
};
