'use strict';

var emarsysService = require('int_emarsys/cartridge/scripts/service/emarsysService');

/**
 * @description Make call to Emarsys
 * @param {string} endpoint - API endpoint to make a call at
 * @param {Object} requestBody - request body (for POST or PUT)
 * @param {string} requestMethod - request method
 * @return {Object} - object with response data
 */
function makeCallToEmarsys(endpoint, requestBody, requestMethod) {
    var responseBody = {};
    var resultObj = {};

    var response = emarsysService.call(endpoint, requestBody, requestMethod);
    if (empty(response) || response.status === 'ERROR') {
        resultObj = {
            status: 'ERROR',
            responseCode: response.error,
            responseMessage: response.msg
        };
        if (response.errorMessage) {
            try {
                responseBody = JSON.parse(response.errorMessage);
                resultObj.replyCode = responseBody.replyCode;
                resultObj.replyMessage = responseBody.replyText;
            } catch (err) {
                resultObj.replyMessage = response.errorMessage;
            }
        }
        return resultObj;
    }
    return {
        status: 'OK',
        result: JSON.parse(response.object)
    };
}

/**
 * Parse string representation of array
 * @param {string} listText - string representation of Array (may be empty)
 * @return {Array} - parsed array
 */
function parseList(listText) {
    if (!listText.length) {
        return [];
    }
    return JSON.parse(listText);
}

/**
 * Event name formatter for Emarsys side
 * @param {string} eventName - BM side event name
 * @return {string} - Emarsys side event name
 */
function eventNameFormatter(eventName) {
    var formattedName = '';
    formattedName = eventName.replace(/[-\s]+/g, '_');
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1_$2');
    return 'SFCC_' + formattedName.toUpperCase();
}

/**
 * Gets list of not mapped sfcc events
 * @param {dw.object.CustomObject} eventsCustomObject - all external events description
 * @param {string} namesKey - key of list with event names
 * @param {Array} descriptionsList - mapped sfcc events descriptions
 * @return {Array} - not mapped events list
 */
function getNotMappedEvents(eventsCustomObject, namesKey, descriptionsList) {
    var namesList = parseList(eventsCustomObject.custom[namesKey]);

    var notMappedEvents = namesList.filter(function (sfccName) {
        return this.every(function (eventObject) {
            return eventObject.sfccName !== this.sfccName;
        }, { sfccName: sfccName });
    }, descriptionsList);

    return notMappedEvents;
}

/**
 * Create descriptions collection for used Emarsys events
 * @param {Array} descriptionList - events description list
 * @return {Object} - descriptions collection for used Emarsys events
 */
function collectEmarsysDescriptions(descriptionList) {
    var uniqueDescriptionsCollection = {};
    descriptionList.forEach(function (descriptionObj) {
        this[descriptionObj.emarsysId] = {
            emarsysId: descriptionObj.emarsysId,
            emarsysName: descriptionObj.emarsysName
        };
    }, uniqueDescriptionsCollection);

    // rewrite results from object into array
    var emarsysIds = Object.keys(uniqueDescriptionsCollection);
    var uniqueDescriptionsList = [];
    for (var i = 0; i < emarsysIds.length; i++) {
        var currentId = emarsysIds[i];
        uniqueDescriptionsList.push(uniqueDescriptionsCollection[currentId]);
    }
    return uniqueDescriptionsList;
}

module.exports = {
    makeCallToEmarsys: makeCallToEmarsys,
    parseList: parseList,
    getNotMappedEvents: getNotMappedEvents,
    collectEmarsysDescriptions: collectEmarsysDescriptions,
    eventNameFormatter: eventNameFormatter
};
