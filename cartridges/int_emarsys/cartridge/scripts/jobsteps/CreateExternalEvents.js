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
            this.campaignsData = this.getCampaignsData();

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
        // get events description list
        var response = this.eventsHelper.makeCallToEmarsys('event', null, 'GET');
        if (response.status === 'ERROR') {
            throw new Error('***Emarsys get events error: ' + response.message);
        }
        return response.result.data;
    },
    /**
     * @description get description of all Emarsys email campaigns
     * @return {Object} campaigns descriptions collection (by campaign name)
     */
    getCampaignsData: function () {
        // get campaigns
        var responseObj = this.eventsHelper.makeCallToEmarsys('email', null, 'GET');
        if (responseObj.status === 'ERROR') {
            throw new Error('***Emarsys get campaigns error: ' + responseObj.message);
        }
        return this.eventsHelper.prepareCampaignData(responseObj.result.data);
    },
    /**
     * Create events and prepare their description
     * @param {Array} namesList - list of event names
     * @return {string} - created events description
     */
    createEvents: function (namesList) {
        var descriptionsList = namesList.map(function (eventName) {
            var formattedName = this.eventsHelper.eventNameFormatter(eventName);
            var emarsysDescription = this.queryEventDescription(formattedName);
            if (!emarsysDescription) {
                emarsysDescription = this.createExternalEvent(formattedName);
            }
            var eventDescription = {
                sfccName: eventName,
                emarsysId: emarsysDescription.id,
                emarsysName: emarsysDescription.name
            };
            eventDescription.campaignId = this.getCampaignId(eventDescription);
            return eventDescription;
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
    },
    /**
     * @description creates test campaign for Emarsys external event
     * @param {string} event - the name of the event which should be created on emarsys
     * @return {Object} created event description
     */
    getCampaignId: function (event) {
        var campaignId = '';

        var campaignName = 'test_event_' + event.emarsysId;
        campaignId = this.campaignsData[campaignName] && this.campaignsData[campaignName].id;

        if (!campaignId) {
            // send request to create test campaign
            var response = this.eventsHelper.createTestCampaign(event);
            if (response.status === 'ERROR') {
                throw new Error('***Emarsys create campaign error: ' + response.message);
            }
            this.campaignsData[campaignName] = response.result.data;
            campaignId = response.result.data.id;
        }
        return campaignId;
    }
};

exports.execute = externalEvent.execute.bind(externalEvent);
