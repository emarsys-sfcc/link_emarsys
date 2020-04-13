'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = './../../../../../mocks/';

var Logger = require(mockPath + 'dw/system/Logger');
var Status = require(mockPath + 'dw/system/Status');
var Resource = require(mockPath +'dw/web/Resource');
var CustomObjectMgr = require(mockPath + 'dw/object/CustomObjectMgr');
var emarsysService = require(mockPath + 'service/emarsysService');
var Site = require(mockPath + 'dw/system/Site');

var cartridgePathE = '../../../../../../cartridges/int_emarsys/';

var EmarsysEventsHelper = proxyquire(cartridgePathE + 'cartridge/scripts/helpers/emarsysEventsHelper.js', {
    'dw/web/Resource': Resource,
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'int_emarsys/cartridge/scripts/service/emarsysService': emarsysService,
    'dw/system/Site': Site
});

var CreateExternalEvents = proxyquire(cartridgePathE + 'cartridge/scripts/jobsteps/CreateExternalEvents.js', {
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'dw/system/Status': Status,
    'dw/system/Logger': Logger,
    '*/cartridge/scripts/helpers/emarsysEventsHelper': EmarsysEventsHelper
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
