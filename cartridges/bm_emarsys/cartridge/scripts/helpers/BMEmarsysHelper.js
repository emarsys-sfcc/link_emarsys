'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var currentSite = require('dw/system/Site').getCurrent();

/**
 * @description constructor, main function
 */
function BMEmarsysHelper() {
    /**
     * @param {string} type it is type custom object
     * @returns {array} array with custom objects
     */
    this.getAllCustomObjectByType = function (type) {
        return CustomObjectMgr.getAllCustomObjects(type).asList().toArray();
    };

    this.getExternalEvents = function (type, externalEvents, fieldForResult) {
        var events = JSON.parse(CustomObjectMgr.getCustomObject(type, externalEvents).custom[fieldForResult]);
        return events.map(function (event) {
            return {
                id: event.emarsysId,
                name: event.sfccName
            };
        });
    };

    this.parseCustomPrefValue = function (name) {
        return JSON.parse(currentSite.getCustomPreferenceValue(name));
    };

    /**
     * @description create current objec for nav-tab menu
     * @param {string} type type custom object
     * @param {string} nameProperty name property in custom object
     * @param {boolean} isLabel if property use for label in options, isLabel true
     * @returns {Object} new object for nav-tab
     */
    this.getTabsAttr = function (type, nameProperty, isLabel) {
        var customObjects = this.getAllCustomObjectByType(type);

        return customObjects.map(function (customObj) {
            var customObject = {
                id: customObj.custom[nameProperty]
            };
            if (isLabel) {
                customObject.label = customObject.id[0].toUpperCase() + customObject.id.slice(1);
            }
            return customObject;
        });
    };

    this.getStoredConfigurations = function (type) {
        var customObjects = this.getAllCustomObjectByType(type);

        return customObjects.map(function (customObj) {
            return customObj.custom;
        });
    };

    this.parseCustomObjects = function (customObjects, contentID, nameAdditionalParam) {
        return customObjects.map(function (custObj) {
            var currentObj = {
                contentID: custObj.custom[contentID]
            };
            var mappedFields = JSON.parse(custObj.custom.mappedFields);

            currentObj.additionalParam = nameAdditionalParam ? custObj.custom[nameAdditionalParam] : false;
            currentObj.mappedFields = mappedFields;

            currentObj.fieldsLength = mappedFields ? mappedFields.length : 0;

            return currentObj;
        });
    };
}

module.exports = new BMEmarsysHelper();
