'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = './../../../../../mocks/';

var Logger = require(mockPath + 'dw/system/Logger');
var Status = require(mockPath + 'dw/system/Status');
var CustomObjectMgr = require(mockPath + 'dw/object/CustomObjectMgr');
var emarsysService = require(mockPath + 'service/emarsysService');
var Site = require(mockPath + 'dw/system/Site');

var cartridgePath = '../../../../../../cartridges/bm_emarsys/';
var cartridgePathE = '../../../../../../cartridges/int_emarsys/';

var BMEmarsysEventsHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/BMEmarsysEventsHelper.js', {
    'int_emarsys/cartridge/scripts/service/emarsysService': emarsysService,
    'dw/system/Site': Site
});

var CreateExternalEvents = proxyquire(cartridgePathE + 'cartridge/scripts/jobsteps/CreateExternalEvents.js', {
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'dw/system/Status': Status,
    'dw/system/Logger': Logger,
    'bm_emarsys/cartridge/scripts/helpers/BMEmarsysEventsHelper': BMEmarsysEventsHelper
});

describe('CreateExternalEvents jobstep', () => {
    global.empty = function(val) {
        if (val === undefined || val == null || val.length <= 0) {
            return true;
        } else {
            return false;
        }
    };

    it('Testing method: execute #1', () => {
        var params = {};
        var result = CreateExternalEvents.execute(params);
        assert.deepEqual(result, {
                code: 'OK',
                status: 2
            });
    });

    it('Testing method: execute; #2', () => {
        var params = {
            customObjectKey:'emptyObject'
        };
        var result = CreateExternalEvents.execute(params);
        assert.deepEqual(result, {
                code: 'ERROR',
                status: 1
            });
    });

    it('Testing method: execute; #3', () => {
        var params = {
            customObjectKey:'testObject'
        };
        var result = CreateExternalEvents.execute(params);
        assert.deepEqual(result, {
                code: 'ERROR',
                status: 1
            });
    });
});
