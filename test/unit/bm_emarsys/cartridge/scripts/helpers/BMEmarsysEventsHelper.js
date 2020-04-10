'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = '../../../../../mocks/';
var emarsysService = require(mockPath + 'service/emarsysService');

var cartridgePath = '../../../../../../cartridges/bm_emarsys/';

var BMEmarsysEventsHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/BMEmarsysEventsHelper.js', {
    'int_emarsys/cartridge/scripts/service/emarsysService': emarsysService
});

describe('BMEmarsysEventsHelper Helpers', () => {
    global.empty = function(val) {
        if (val === undefined || val == null || val.length <= 0) {
            return true;
        } else {
            return false;
        }
    };

    it('Testing method: makeCallToEmarsys #1', () => {
        var result = BMEmarsysEventsHelper.makeCallToEmarsys('event/badtest', {}, 'PUT');

        assert.deepEqual(result,{
            replyCode: 1,
            replyMessage: 'ERROR',
            responseCode: 400,
            responseMessage: 'Bad request',
            status: 'ERROR'
        });
    });

    it('Testing method: makeCallToEmarsys #2', () => {
        var result = BMEmarsysEventsHelper.makeCallToEmarsys('event/test', {}, 'PUT');

        assert.deepEqual(result,{
            result: {
                data: []
            },
            status: 'OK'
        });
    });

    it('Testing method: parseList #1(Empty string)', () => {
        var result = BMEmarsysEventsHelper.parseList('');
        assert.deepEqual(result,[]);
    });

    it('Testing method: parseList #2', () => {
        var result = BMEmarsysEventsHelper.parseList('[1,2]');
        assert.deepEqual(result,[1,2]);
    });

    it('Testing method: eventNameFormatter', () => {
        var result = BMEmarsysEventsHelper.eventNameFormatter('test');
        assert.equal(result,'SFCC_TEST');
    });

    it('Testing method: getNotMappedEvents', () => {
        var eventsCustomObject = { 
            custom: {
                otherResult: JSON.stringify([
                    {"emarsysId":"1234","emarsysName":"SFCC_CANCELLED_ORDER","sfccName":"cancelled_order"},
                    {"emarsysId":"1278","emarsysName":"SFCC_DOUBLE_OPTIN","sfccName":"double-optin"}]),
                otherSource: JSON.stringify(["cancelled_order","single","double-optin"])
            },
            name: 'StoredEvents'
        };
        var descriptionsList = JSON.parse(eventsCustomObject.custom.otherResult);
        var nameKey = 'otherSource';
        var result = BMEmarsysEventsHelper.getNotMappedEvents(eventsCustomObject, nameKey, descriptionsList);
        assert.deepEqual(result,['single']);
    });

    it('Testing method: collectEmarsysDescriptions', () => {
        var descriptionList = [
            {"emarsysId":"1234","emarsysName":"SFCC_CANCELLED_ORDER","sfccName":"cancelled_order"},
            {"emarsysId":"1244","emarsysName":"SFCC_SINGLE","sfccName":"single"},
            {"emarsysId":"1278","emarsysName":"SFCC_DOUBLE_OPTIN","sfccName":"double-optin"}];
        var result = BMEmarsysEventsHelper.collectEmarsysDescriptions(descriptionList);
        assert.deepEqual(result, [{
                "emarsysId": "1234",
                "emarsysName": "SFCC_CANCELLED_ORDER"},
            {
                "emarsysId": "1244",
                "emarsysName": "SFCC_SINGLE"},
            {
                "emarsysId": "1278",
                "emarsysName": "SFCC_DOUBLE_OPTIN"
            }
        ]);
    });
});