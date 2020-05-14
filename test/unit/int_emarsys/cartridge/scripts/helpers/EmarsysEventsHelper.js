'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = '../../../../../mocks/';
var Resource = require(mockPath +'dw/web/Resource');
var CustomObjectMgr = require(mockPath +'dw/object/CustomObjectMgr');
var emarsysService = require(mockPath + 'service/emarsysService');

var cartridgePath = '../../../../../../cartridges/int_emarsys/';

var emarsysEventsHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/emarsysEventsHelper.js', {
    'dw/web/Resource': Resource,
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'int_emarsys/cartridge/scripts/service/emarsysService': emarsysService
});

describe('emarsysEventsHelper Helpers', () => {
    global.empty = function(val) {
        if (val === undefined || val == null || val.length <= 0) {
            return true;
        } else {
            return false;
        }
    };

    it('Testing method: makeCallToEmarsys #1 (success)', () => {
        var result = emarsysEventsHelper.makeCallToEmarsys('event', null, 'GET');

        assert.deepEqual(result, {
            result: {
                data: [
                    {"id":"12678","name":"SFCC_CANCELLED_ORDER"},
                    {"id":"12601","name":"SFCC_SHARE_A_WISHLIST"},
                    {"id":"12644","name":"SFCC_NEWSLETTER_SUBSCRIPTION_CONFIRMATION"},
                    {"id":"12645","name":"SFCC_NEWSLETTER_SUBSCRIPTION_SUCCESS"},
                    {"id":"5633","name":"single"},
                    {"id":"5634","name":"double"}
                ]
            },
            status: 'OK'
        });
    });
    it('Testing method: makeCallToEmarsys #2 (emarsys error)', () => {
        var result = emarsysEventsHelper.makeCallToEmarsys('validError', null, 'GET');

        assert.deepEqual(result, {
            status: 'ERROR',
            replyCode: 5004,
            replyMessage: 'Event ID: {id} is invalid',
            message: 'Event ID: {id} is invalid' + ' (' +
                Resource.msg('emarsys.reply.code', 'errorMessages', null) +
                5004 + ')'
        });
    });

    it('Testing method: makeCallToEmarsys #3 (unknown error)', () => {
        var result = emarsysEventsHelper.makeCallToEmarsys('unknownError', null, 'GET');

        assert.deepEqual(result, {
            status: 'ERROR',
            responseCode: 400,
            responseMessage: 'Bad request',
            message: 'Bad request' + ' (' +
                Resource.msg('emarsys.response.code', 'errorMessages', null) +
                400 + ')'
        });
    });

    it('Testing method: makeCallToEmarsys #4 (invalid error)', () => {
        var result = emarsysEventsHelper.makeCallToEmarsys('invalidError', null, 'GET');

        assert.deepEqual(result, {
            status: 'ERROR',
            message: Resource.msg('parsing.error', 'errorMessages', null)
        });
    });

    it('Testing method: makeCallToEmarsys #5 (invalid data)', () => {
        var result = emarsysEventsHelper.makeCallToEmarsys('invalidData', null, 'GET');

        assert.deepEqual(result, {
            status: 'ERROR',
            message: Resource.msg('parsing.error', 'errorMessages', null)
        });
    });

    it('Testing method: parseList #1', () => {
        var result = emarsysEventsHelper.parseList('[1,2]');
        assert.deepEqual(result, [1,2]);
    });

    it('Testing method: parseList #2 (empty string)', () => {
        var result = emarsysEventsHelper.parseList('');
        assert.deepEqual(result, []);
    });

    it('Testing method: parseList #3 (invalid list)', () => {
        var result = emarsysEventsHelper.parseList('{1,2}');
        assert.deepEqual(result, null);
    });

    it('Testing method: readEventsCustomObject #1', () => {
        var customObjectKey = 'StoredEvents';
        var result = emarsysEventsHelper.readEventsCustomObject([
            'newsletterSubscriptionSource',
            'otherSource',
            'newsletterSubscriptionResult',
            'otherResult'
        ], customObjectKey);
        assert.deepEqual(result.fields, {
            otherSource: ["forgot_password_submitted","contact_form_submitted"],
            newsletterSubscriptionSource: ["newsletter_subscription_confirmation","newsletter_unsubscribe_success"],
            otherResult: [
                {"sfccName":"cancelled_order","emarsysId":"12678","emarsysName":"SFCC_CANCELLED_ORDER"},
                {"sfccName":"forgot_password_submitted","emarsysId":"12561","emarsysName":"SFCC_FORGOT_PASSWORD_SUBMITTED"},
                {"sfccName":"contact_form_submitted","emarsysId":"12563","emarsysName":"SFCC_CONTACT_FORM_SUBMITTED"},
            ],
            newsletterSubscriptionResult: [
                {"sfccName":"newsletter_subscription_confirmation","emarsysId":"12644","emarsysName":"SFCC_NEWSLETTER_SUBSCRIPTION_CONFIRMATION"},
                {"sfccName":"newsletter_unsubscribe_success","emarsysId":"12646","emarsysName":"SFCC_NEWSLETTER_UNSUBSCRIBE_SUCCESS"}
            ]
        });
    })

    it('Testing method: readEventsCustomObject #2 (no such object)', () => {
        var expectedMessage = Resource.msg('custom.object.error1', 'errorMessages', null) +
            'notValidKey' +
            Resource.msg('custom.object.error2', 'errorMessages', null);
        var errorMessage = null;
        try {
            errorMessage = emarsysEventsHelper.readEventsCustomObject([], 'notValidKey');
        } catch(err) {
            errorMessage = err.message;
        }
        assert.equal(errorMessage, expectedMessage);
    });

    it('Testing method: readEventsCustomObject #3 (invalid field)', () => {
        var expectedMessage = Resource.msg('invalid.field.error1', 'errorMessages', null) +
        'otherSource' +
        Resource.msg('invalid.field.error2', 'errorMessages', null);
        var errorMessage = null;
        try {
            errorMessage = emarsysEventsHelper.readEventsCustomObject(
                ['otherSource', 'newsletterSubscriptionResult'], 'invalidFields'
            );
        } catch(err) {
            errorMessage = err.message;
        }
        assert.equal(errorMessage, expectedMessage);
    });

    it('Testing method: eventNameFormatter', () => {
        var result = emarsysEventsHelper.eventNameFormatter('test');
        assert.equal(result,'SFCC_TEST');
    });

    it('Testing method: getNotMappedEvents', () => {
        var eventsCustomObject = { 
            custom: {
                otherSource: JSON.stringify(["cancelled_order","single","double-optin"]),
                otherResult: JSON.stringify([
                    {"emarsysId":"1234","emarsysName":"SFCC_CANCELLED_ORDER","sfccName":"cancelled_order"},
                    {"emarsysId":"1278","emarsysName":"SFCC_DOUBLE_OPTIN","sfccName":"double-optin"}])
            },
            name: 'StoredEvents'
        };
        var sourceList = JSON.parse(eventsCustomObject.custom.otherSource);
        var descriptionsList = JSON.parse(eventsCustomObject.custom.otherResult);
        var result = emarsysEventsHelper.getNotMappedEvents(sourceList, descriptionsList);
        assert.deepEqual(result, ['single']);
    });

    it('Testing method: getEmarsysEvents', () => {
        var allEmarsysEvents = [
            {"id":"5633","name":"single"},
            {"id":"5634","name":"double"},
            {"id":"12561","name":"SFCC_FORGOT_PASSWORD_SUBMITTED"},
            {"id":"12563","name":"SFCC_CONTACT_FORM_SUBMITTED"},
            {"id":"12644","name":"SFCC_NEWSLETTER_SUBSCRIPTION_CONFIRMATION"},
            {"id":"12646","name":"SFCC_NEWSLETTER_UNSUBSCRIBE_SUCCESS"}
        ];
        var sfccNames = [
            "cancelled_order",
            "forgot_password_submitted",
            "contact_form_submitted",
            "share_a_wishlist"
        ];

        var result = emarsysEventsHelper.getEmarsysEvents(allEmarsysEvents, sfccNames);
        assert.deepEqual(result, [
            {'id': '', 'name': 'SFCC_CANCELLED_ORDER'},
            {'id': '12561', 'name': 'SFCC_FORGOT_PASSWORD_SUBMITTED'},
            {'id': '12563', 'name': 'SFCC_CONTACT_FORM_SUBMITTED'},
            {'id': '', 'name': 'SFCC_SHARE_A_WISHLIST'}
        ]);
    });
});
