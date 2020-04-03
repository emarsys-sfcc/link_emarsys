'use strict';

var server = require('server');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var URLUtils = require('dw/web/URLUtils');
var eventsHelper = require('bm_emarsys/cartridge/scripts/helpers/BMEmarsysEventsHelper');

server.get('Show',
    server.middleware.https,
    function (req, res, next) {
        var customObjectKey = 'StoredEvents';

        // get object which contain external events description (on BM side)
        var eventsCustomObject = CustomObjectMgr.getCustomObject('EmarsysExternalEvents', customObjectKey);
        if (eventsCustomObject === null) {
            res.render('components/errorPage', {
                response: {
                    status: 'ERROR',
                    message: 'Custom object with id "' + customObjectKey + '"dos\'t exist'
                }
            });
            return next();
        }

        // read sfcc events descriptions
        var subscriptionSfccDescriptions = eventsHelper.parseList(eventsCustomObject.custom.newsletterSubscriptionResult);
        var otherSfccDescriptions = eventsHelper.parseList(eventsCustomObject.custom.otherResult);

        // separate not mapped sfcc events
        var subscriptionNotMappedEvents = eventsHelper.getNotMappedEvents(
            eventsCustomObject,
            'newsletterSubscriptionSource',
            subscriptionSfccDescriptions
        );
        var otherNotMappedEvents = eventsHelper.getNotMappedEvents(
            eventsCustomObject,
            'otherSource',
            otherSfccDescriptions
        );

        // get Emarsys events descriptions collection
        var subscriptionEmarsysDescriptions = eventsHelper.collectEmarsysDescriptions(subscriptionSfccDescriptions);
        var otherEmarsysDescriptions = eventsHelper.collectEmarsysDescriptions(otherSfccDescriptions);

        // send request to get all external events description from Emarsys
        var response = eventsHelper.makeCallToEmarsys('event', null, 'GET');
        if (response.status === 'ERROR') {
            res.render('components/errorPage', { response: response });
            return next();
        }
        var allEmarsysEvents = response.result.data;

        res.render('externalEvents', {
            contentTemplate: 'external.events.configurations',
            urls: {
                show: URLUtils.url('ExternalEvents-Show').toString(),
                addEvent: URLUtils.url('ExternalEvents-Add').toString(),
                editEvent: URLUtils.url('ExternalEvents-Edit').toString(),
                removeEvent: URLUtils.url('ExternalEvents-Remove').toString()
            },
            response: {
                status: 'OK',
                subscriptionSfccDescriptions: subscriptionSfccDescriptions,
                otherSfccDescriptions: otherSfccDescriptions,
                subscriptionNotMappedEvents: subscriptionNotMappedEvents,
                otherNotMappedEvents: otherNotMappedEvents,
                subscriptionEmarsysDescriptions: subscriptionEmarsysDescriptions,
                otherEmarsysDescriptions: otherEmarsysDescriptions,
                allEmarsysEvents: allEmarsysEvents
            }
        });

        return next();
    }
);

/**
 * @description Add new Emarsys external event
 */
server.post('Add',
    server.middleware.https,
    function (req, res, next) {
        var event = {
            type: request.httpParameterMap.eventType.value,
            emarsysId: request.httpParameterMap.emarsysId.value,
            emarsysName: request.httpParameterMap.emarsysName.value,
            sfccName: request.httpParameterMap.sfccName.value
        };
        var customObjectKey = 'StoredEvents';

        // get object which contain external events data (on BM side)
        var eventsCustomObject = CustomObjectMgr.getCustomObject('EmarsysExternalEvents', customObjectKey);
        if (eventsCustomObject === null) {
            res.json({
                response: {
                    status: 'ERROR',
                    message: 'Custom object with id "' + customObjectKey + '"dos\'t exist'
                }
            });
            return next();
        }

        // get events descriptions list
        var eventsDescriptionList = '';
        if (event.type === 'subscription') {
            eventsDescriptionList = JSON.parse(eventsCustomObject.custom.newsletterSubscriptionResult);
        } else if (event.type === 'other') {
            eventsDescriptionList = JSON.parse(eventsCustomObject.custom.otherResult);
        }

        // to find out index of the event object in events descrptions list
        eventsDescriptionList.forEach(function (descriptionObj, i) {
            if (descriptionObj.sfccName === this.sfccName) {
                this.descriptionIndex = i;
            }
        }, event);

        if (event.emarsysId && event.emarsysName) {
            // is this emarsys event unique or mapped to another sfcc event
            event.emarsysEventStatus = 'unique';
            eventsDescriptionList.forEach(function (descriptionObj) {
                if (descriptionObj.sfccName !== this.sfccName &&
                    descriptionObj.emarsysId === this.emarsysId) {
                    this.emarsysEventStatus = 'not unique';
                }
            }, event);
        } else {
            var emarsysEventName = eventsHelper.eventNameFormatter(event.sfccName);
            // send request to create event with specified name
            var response = eventsHelper.makeCallToEmarsys('event', { name: emarsysEventName }, 'POST');
            if (response.status === 'ERROR') {
                res.json({ response: response });
                return next();
            }

            event.emarsysId = response.result.data.id;
            event.emarsysName = response.result.data.name;
            event.emarsysEventStatus = 'new';
        }

        // prepare description object for the event
        var descriptionObject = {
            emarsysId: event.emarsysId,
            emarsysName: event.emarsysName,
            sfccName: event.sfccName
        };

        // rewrite created event description
        if (event.descriptionIndex) {
            eventsDescriptionList.splice(event.descriptionIndex, 1, descriptionObject);
        } else {
            eventsDescriptionList.push(descriptionObject);
        }

        // store events description list to custom object field
        Transaction.wrap(function () {
            if (event.type === 'subscription') {
                eventsCustomObject.custom.newsletterSubscriptionResult = JSON.stringify(eventsDescriptionList);
            } else if (event.type === 'other') {
                eventsCustomObject.custom.otherResult = JSON.stringify(eventsDescriptionList);
            }
        });

        res.json({
            response: {
                status: 'OK',
                result: event
            }
        });
        return next();
    }
);

module.exports = server.exports();
