'use strict';
/**
* @description The script for retrieving and storing Emarsys external events
* @output ErrorMsg : String
*/
var Status = require('dw/system/Status');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var eventsHelper = require('bm_emarsys/cartridge/scripts/helpers/BMEmarsysEventsHelper');

var externalEvent = {
    logger: require('dw/system/Logger').getLogger('externalEvent', 'externalEvent'),
    execute: function (params) {
        try {
            var customObjectKey = params.customObjectKey || 'StoredEvents';

            // get object which contain external events data (on BM side)
            var eventsCustomObject = CustomObjectMgr.getCustomObject('EmarsysExternalEvents', customObjectKey);
            if (eventsCustomObject === null) {
                throw new Error('Custom object with id "' + customObjectKey + '"dos\'t exist');
            }

            // create newsletter subscription external events
            var subscriptionNames = JSON.parse(eventsCustomObject.custom.newsletterSubscriptionSource);
            eventsCustomObject.custom.newsletterSubscriptionResult = this.createEvents(subscriptionNames);

            // create newsletter subscription external events
            var otherNames = JSON.parse(eventsCustomObject.custom.otherSource);
            eventsCustomObject.custom.otherResult = this.createEvents(otherNames);

            this.logger.error('externalEvent: All events were succesfully created');
        } catch (err) {
            this.logger.error('externalEvent: Error ' + err.message + '\n' + err.stack);
            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    },
    /**
     * Create events and prepare their description
     * @param {Array} namesList - list of event names
     * @return {string} - created events description
     */
    createEvents: function (namesList) {
        this.eventsDescriptionList = this.getEventsDescription();

        var descriptionsList = namesList.map(function (eventName) {
            var formattedName = eventsHelper.eventNameFormatter(eventName);
            var eventDescription = this.queryEventDescription(formattedName);
            if (!eventDescription) {
                eventDescription = this.createExternalEvent(formattedName);
            }
            return {
                emarsysId: eventDescription.id,
                emarsysName: eventDescription.name,
                sfccName: eventName
            };
        }, this);

        return JSON.stringify(descriptionsList);
    },
    /**
     * @description get description for external event with specified name
     * @param {string} eventName - the name of the event
     * @return {Object} event description
     */
    queryEventDescription: function (eventName) {
        var results = this.eventsDescriptionList.filter(function (eventDescription) {
            return eventDescription.name === this.eventName;
        }, { eventName: eventName });

        return results[0];
    },
    /**
     * @description creates Emarsys external event
     * @param {string} eventName - the name of the event which should be created on emarsys
     * @return {Object} created event description
     */
    createExternalEvent: function (eventName) {
        var eventDescription = {};

        // send request to create event with specified name
        var response = eventsHelper.makeCallToEmarsys('event', { name: eventName }, 'POST');
        if (response.status === 'ERROR') {
            if (response.replyCode) {
                if (response.replyCode === 5003) {
                    // event with such name already exists
                    eventDescription = this.queryExternalEvent(eventName);
                } else {
                    throw new Error('Create event error: ' + response.replyMessage + '; Reply code: ' + response.replyCode + ';');
                }
            } else {
                throw new Error('Response error: ' + response.responseMessage + '; Response code: ' + response.responseCode + ';');
            }
        } else {
            eventDescription = response.result.data;
        }

        return eventDescription;
    },
    /**
     * @description get description of all Emarsys external events
     * @return {Array} list of objects with external events description
     */
    getEventsDescription: function () {
        var eventsDescriptionList = [];

        // send request to get events description list
        var response = eventsHelper.makeCallToEmarsys('event', null, 'GET');
        if (response.status === 'ERROR') {
            if (response.replyCode) {
                throw new Error('Get events list error: ' + response.replyMessage + '; Reply code: ' + response.replyCode + ';');
            } else {
                throw new Error('Response error: ' + response.responseMessage + '; Response code: ' + response.responseCode + ';');
            }
        } else {
            eventsDescriptionList = response.result.data;
        }

        return eventsDescriptionList;
    }
};

exports.execute = externalEvent.execute.bind(externalEvent);
