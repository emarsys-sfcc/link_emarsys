'use strict';
/**
* @description The script for retrieving and storing Emarsys external events
* @output ErrorMsg : String
*/
var Status = require('dw/system/Status');

var externalEvent = {
    eventsHelper: require('*/cartridge/scripts/helpers/emarsysEventsHelper'),
    logger: require('dw/system/Logger').getLogger('externalEvent', 'externalEvent'),
    execute: function (params) {
        try {
            var customObjectKey = params.customObjectKey || 'StoredEvents';
            var custom = {};

            // read specified fields from custom object EmarsysExternalEvents
            custom = this.eventsHelper.readEventsCustomObject([
                'newsletterSubscriptionSource',
                'otherSource'
            ], customObjectKey);

            var subscriptionNames = custom.fields.newsletterSubscriptionSource;
            var otherNames = custom.fields.otherSource;

            this.eventsDescriptionList = this.getEventsDescription();

            // create newsletter subscription external events
            custom.object.custom.newsletterSubscriptionResult = this.createEvents(subscriptionNames);
            // create other external events
            custom.object.custom.otherResult = this.createEvents(otherNames);
        } catch (err) {
            this.logger.error('[Emarsys CreateExternalEvents.js] - ' + err.message + '\n' + err.stack);
            return new Status(Status.ERROR, 'ERROR');
        }

        this.logger.error('externalEvent: All events were succesfully created');
        return new Status(Status.OK, 'OK');
    },
    /**
     * @description get description of all Emarsys external events
     * @return {Array} list of objects with external events description
     */
    getEventsDescription: function () {
        // send request to get events description list
        var response = this.eventsHelper.makeCallToEmarsys('event', null, 'GET');
        if (response.status === 'ERROR') {
            throw new Error('***Emarsys get events error: ' + response.message);
        }
        return response.result.data;
    },
    /**
     * Create events and prepare their description
     * @param {Array} namesList - list of event names
     * @return {string} - created events description
     */
    createEvents: function (namesList) {
        var descriptionsList = namesList.map(function (eventName) {
            var formattedName = this.eventsHelper.eventNameFormatter(eventName);
            var eventDescription = this.queryEventDescription(formattedName);
            if (!eventDescription) {
                eventDescription = this.createExternalEvent(formattedName);
            }
            return {
                sfccName: eventName,
                emarsysId: eventDescription.id,
                emarsysName: eventDescription.name
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
        var response = this.eventsHelper.makeCallToEmarsys('event', { name: eventName }, 'POST');
        if (response.status === 'ERROR') {
            throw new Error('***Emarsys create event error: ' + response.message);
        }
        eventDescription = response.result.data;
        this.eventsDescriptionList.push(eventDescription);

        return eventDescription;
    }
};

exports.execute = externalEvent.execute.bind(externalEvent);
