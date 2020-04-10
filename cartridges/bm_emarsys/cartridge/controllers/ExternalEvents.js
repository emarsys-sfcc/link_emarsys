'use strict';

var server = require('server');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var eventsHelper = require('*/cartridge/scripts/helpers/emarsysEventsHelper');

server.get('Show',
    server.middleware.https,
    function (req, res, next) {
        var customObjectKey = 'StoredEvents';
        var custom = {};

        // read specified fields from custom object EmarsysExternalEvents
        try {
            custom = eventsHelper.readEventsCustomObject([
                'newsletterSubscriptionSource',
                'otherSource',
                'newsletterSubscriptionResult',
                'otherResult'
            ], customObjectKey);
        } catch (err) {
            res.render('components/errorPage', {
                message: Resource.msg('custom.object.message', 'errorMessages', null),
                error: err
            });
            return next();
        }

        // separate not mapped sfcc events (options for new event name)
        var subscriptionNotMappedEvents = eventsHelper.getNotMappedEvents(
            custom.fields.newsletterSubscriptionSource,
            custom.fields.newsletterSubscriptionResult
        );
        var otherNotMappedEvents = eventsHelper.getNotMappedEvents(
            custom.fields.otherSource,
            custom.fields.otherResult
        );

        var response = [];
        try {
            // send request to get all external events description from Emarsys
            response = eventsHelper.makeCallToEmarsys('event', null, 'GET');
        } catch (err) {
            res.render('components/errorPage', {
                message: Resource.msg('emarsys.request.message', 'errorMessages', null),
                error: err,
                continueUrl: URLUtils.url(
                    'ExternalEvents-Show',
                    'CurrentMenuItemId', 'emarsys_integration',
                    'menuname', 'External Events',
                    'mainmenuname', 'Emarsys Manager'
                ).toString()
            });
            return next();
        }
        var allEmarsysEvents = response.data;

        // get Emarsys events descriptions collection (emarsys names options for add and update functionality)
        var subscriptionEmarsysDescriptions = eventsHelper.getEmarsysEvents(
            allEmarsysEvents, custom.fields.newsletterSubscriptionSource
        );
        var otherEmarsysDescriptions = eventsHelper.getEmarsysEvents(
            allEmarsysEvents, custom.fields.otherSource
        );

        res.render('externalEvents', {
            contentTemplate: 'external.events.configurations',
            urls: {
                show: URLUtils.url('ExternalEvents-Show').toString(),
                addEvent: URLUtils.url('ExternalEvents-Add').toString(),
                updateEvent: URLUtils.url('ExternalEvents-Update').toString()
            },
            response: {
                status: 'OK',
                subscriptionSfccDescriptions: custom.fields.newsletterSubscriptionResult,
                otherSfccDescriptions: custom.fields.otherResult,
                subscriptionNotMappedEvents: subscriptionNotMappedEvents,
                otherNotMappedEvents: otherNotMappedEvents,
                subscriptionEmarsysDescriptions: subscriptionEmarsysDescriptions,
                otherEmarsysDescriptions: otherEmarsysDescriptions
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
            type: request.httpParameterMap.type.value,
            emarsysId: request.httpParameterMap.emarsysId.value || '',
            emarsysName: request.httpParameterMap.emarsysName.value || '',
            sfccName: request.httpParameterMap.sfccName.value
        };
        var customObjectKey = 'StoredEvents';
        var custom = {};

        // read events descriptions list from custom object
        var fieldId = (event.type === 'subscription') ? 'newsletterSubscriptionResult' : 'otherResult';
        try {
            custom = eventsHelper.readEventsCustomObject([fieldId], customObjectKey);
        } catch (err) {
            res.json({
                response: {
                    status: 'ERROR',
                    message: err.errorText
                }
            });
            return next();
        }

        var eventsDescriptionList = custom.fields[fieldId];
        if (!empty(event.emarsysName) && empty(event.emarsysId)) {
            event.emarsysStatus = 'new';
            var response = [];
            try {
                // send request to create event with specified name
                response = eventsHelper.makeCallToEmarsys('event', { name: event.emarsysName }, 'POST');
            } catch (err) {
                res.json({
                    response: {
                        status: 'ERROR',
                        message: Resource.msg('emarsys.error', 'errorMessages', null) +
                            err.errorText
                    }
                });
                return next();
            }

            event.emarsysId = response.data.id;
            event.emarsysName = response.data.name;
        } else {
            event.emarsysStatus = 'specified';
        }

        // prepare description object for the event
        var descriptionObject = {
            sfccName: event.sfccName,
            emarsysId: event.emarsysId,
            emarsysName: event.emarsysName
        };

        // get event description index (to prevent names duplication)
        eventsDescriptionList.forEach(function (descriptionObj, i) {
            if (descriptionObj.sfccName === this.sfccName) {
                this.descriptionIndex = i;
            }
        }, event);

        // add or update external event description
        if (event.descriptionIndex) {
            eventsDescriptionList.splice(event.descriptionIndex, 1, descriptionObject);
        } else {
            eventsDescriptionList.push(descriptionObject);
        }

        // store events description list to custom object field
        Transaction.wrap(function () {
            if (event.type === 'subscription') {
                custom.object.custom.newsletterSubscriptionResult = JSON.stringify(eventsDescriptionList);
            } else if (event.type === 'other') {
                custom.object.custom.otherResult = JSON.stringify(eventsDescriptionList);
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

/**
 * @description Update new Emarsys external event
 */
server.post('Update',
    server.middleware.https,
    function (req, res, next) {
        var event = {
            type: request.httpParameterMap.type.value,
            sfccName: request.httpParameterMap.sfccName.value,
            emarsysId: request.httpParameterMap.emarsysId.value || '',
            emarsysName: request.httpParameterMap.emarsysName.value || ''
        };
        var customObjectKey = 'StoredEvents';
        var custom = {};

        // read events descriptions list from custom object
        var fieldId = (event.type === 'subscription') ? 'newsletterSubscriptionResult' : 'otherResult';
        try {
            custom = eventsHelper.readEventsCustomObject([fieldId], customObjectKey);
        } catch (err) {
            res.json({
                response: {
                    status: 'ERROR',
                    message: err.errorText
                }
            });
            return next();
        }

        var eventsDescriptionList = custom.fields[fieldId];
        if (!empty(event.emarsysName) && empty(event.emarsysId)) {
            event.emarsysStatus = 'new';
            var response = [];
            try {
                // send request to create event with specified name
                response = eventsHelper.makeCallToEmarsys('event', { name: event.emarsysName }, 'POST');
            } catch (err) {
                res.json({
                    response: {
                        status: 'ERROR',
                        message: Resource.msg('emarsys.error', 'errorMessages', null) +
                            err.errorText
                    }
                });
                return next();
            }

            event.emarsysId = response.data.id;
            event.emarsysName = response.data.name;
        } else {
            event.emarsysStatus = 'specified';
        }

        // get event description index
        event.descriptionIndex = eventsDescriptionList.length;
        eventsDescriptionList.forEach(function (descriptionObj, i) {
            if (descriptionObj.sfccName === this.sfccName) {
                this.descriptionIndex = i;
            }
        }, event);

        // prepare description object for the event
        var descriptionObject = {
            sfccName: event.sfccName,
            emarsysId: event.emarsysId,
            emarsysName: event.emarsysName
        };

        // update external event description in the list
        eventsDescriptionList.splice(event.descriptionIndex, 1, descriptionObject);

        // store events description list to custom object field
        Transaction.wrap(function () {
            if (event.type === 'subscription') {
                custom.object.custom.newsletterSubscriptionResult = JSON.stringify(eventsDescriptionList);
            } else if (event.type === 'other') {
                custom.object.custom.otherResult = JSON.stringify(eventsDescriptionList);
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
