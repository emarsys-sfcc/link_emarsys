var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = './../../../../../mocks/';

var CustomObjectMgr = require(mockPath + 'dw/object/CustomObjectMgr');
var Logger = require(mockPath + 'dw/system/Logger');
var Status = require(mockPath + 'dw/system/Status');
var Site = require(mockPath + 'dw/system/Site');
var Money = require(mockPath + 'dw/value/Money');
var emarsysService = require(mockPath + 'service/emarsysService');
var ShippingMgr = require(mockPath + 'dw/order/ShippingMgr');
var order = require(mockPath + 'dw/order/Order');
var web = require(mockPath + 'dw/web/Web');

var cartridgePath = '../../../../../../cartridges/int_emarsys/';
var siteCustomPreferences = Site.getCurrent();

var EmarsysHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/emarsysHelper.js', {
    'dw/web': web,
    'dw/order': order,
    'dw/value/Money': Money,
    'dw/system/Site': Site,
    'dw/order/ShippingMgr': ShippingMgr,
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    siteCustomPreferences: siteCustomPreferences,
    '~/cartridge/scripts/service/emarsysService': emarsysService
});

var createAutoImportProfile = proxyquire(cartridgePath + 'cartridge/scripts/jobsteps/createAutoImportProfile.js', {
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'dw/system/Site': Site,
    'dw/system/Status': Status,
    'dw/system/Logger': Logger,
    'int_emarsys/cartridge/scripts/helpers/emarsysHelper': EmarsysHelper
});

describe('CreateAutoImportProfile jobstep', () => {

    it('Testing method: execute; isDisabled: true', () => {
       var args = {
        csvFileColumnsDelimiter: ';',
        isDisabled: true
       };
      var result = createAutoImportProfile.execute(args);
      assert.deepEqual(result,{
            code: 'OK',
            status: 2
        });
    });

    it('Testing method: execute; isDisabled: false', () => {
        var args = {
         csvFileColumnsDelimiter: ';',
         isDisabled: false
        };
       var result = createAutoImportProfile.execute(args);
       assert.deepEqual(result,{
             code: 'OK',
             status: 2
         });
     });
});
