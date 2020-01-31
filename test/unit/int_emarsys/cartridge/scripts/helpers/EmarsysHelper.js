'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = '../../../../../mocks/';

var Session = require(mockPath + 'dw/system/Session');
var Money = require(mockPath + 'dw/value/Money');
var Product = require(mockPath + 'dw/catalog/Product');
var ProductLineItem = require(mockPath + 'dw/order/ProductLineItem');
var ShippingMgr = require(mockPath + 'dw/order/ShippingMgr');
var Site = require(mockPath + 'dw/system/Site');
var order = require(mockPath + 'dw/order/Order');
var web = require(mockPath + 'dw/web/Web');
var emarsysService = require(mockPath + 'service/emarsysService');

var cartridgePath = '../../../../../../cartridges/int_emarsys/';
var siteCustomPreferences = Site.current.preferences.custom;

var EmarsysHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/emarsysHelper.js', {
    'dw/web': web,
    'dw/order': order,
    'dw/value/Money': Money,
    'dw/system/Site': Site,
    'dw/order/ShippingMgr': ShippingMgr,
    '~/cartridge/scripts/service/emarsysService': emarsysService,
    siteCustomPreferences: siteCustomPreferences
});

var emarsys = new EmarsysHelper();

describe('EmarsysHelper Scripts', () => {
    global.empty = function(val) {
        if (val === undefined || val == null || val.length <= 0) {
            return true;
        } else {
            return false;
        }
    };
    global.session = new Session();

    it('Testing method: triggerAPICall', () => {
        var result = emarsys.triggerAPICall('field', {}, 'GET');

        assert.equal(result.status, 'OK');
    });

    it('Testing method: getSourceId', () => {
        var callResult = {
            object: '{"data": [{"name": "test", "id":"3"},{"name": "test2", "id":"33"}]}'
        };
        var name = 'test2';
        var result = emarsys.getSourceId(callResult, name);

        assert.equal(result, '33');
    });

    it('Testing method: addFields', () => {
        var map = {'5':'male', '14': 'US', '3':'address', '2':'testLastName'},
            requestBody= {};
        emarsys.addFields(map, requestBody);
        var res = {'2': 'testLastName', '3': 'address','5': 1,'14': 185};
        assert.deepEqual(requestBody, res);
    });

    it('testing method: addDataToMap', () => {
        var object = {
            'address1': 'Street Address',
            'city': 'City',
            'firstName': 'Test',
            'fullName': 'Test Test',
            'lastName': 'Test',
            'phone': '333-333-3333',
            'postalCode': '12345',
            'stateCode': 'AL',
            'countryCode': 'us',
            'UUID': 'e6032325a4f6a31032a5d17aeb'
        };
        var map = {};
        var eqRes = {
            '1': 'Test',
            '2': 'Test',
            '10': 'Street Address',
            '11': 'City',
            '12': 'AL',
            '13': '12345',
            '14': 'us',
            '15': '333-333-3333'
        };

        emarsys.addDataToMap(object, map);
        assert.deepEqual(map, eqRes);
    });

    it('testing method: addAddressDataToMap', () => {
        var i = 1,
            map = {},
            object = {
                'address1': 'Street Address',
                'city': 'City',
                'firstName': 'Test',
                'fullName': 'Test Test',
                'lastName': 'Test',
                'phone': '333-333-3333',
                'postalCode': '12345',
                'stateCode': 'AL',
                'countryCode': 'us'
            };
        var eqRes = {
            '1_1': 'Test',
            '2_1': 'Test',
            '10_1': 'Street Address',
            '11_1': 'City',
            '12_1': 'AL',
            '13_1': '12345',
            '14_1': 'us',
            '15_1': '333-333-3333'
        };

        emarsys.addAddressDataToMap(object, map, i);
        assert.deepEqual(map, eqRes);
    });

    it('testing method: convertCountryCode', () => {
        var countryCode ='us';
        var result = emarsys.convertCountryCode(countryCode);
        assert.equal(result, 185);
    });
    
    it('testing method: convertGenderCode', () => {
        var gender ='female';
        var result = emarsys.convertGenderCode(gender);
        assert.equal(result, 2);
    });
    
    it('testing method: getValues', () => {
        var field = 'firstName',
            object = {
                'address1': 'Street Address',
                'city': 'City',
                'firstName': 'Test',
                'fullName': 'Test Test',
                'lastName': 'Test',
                'phone':'333-333-3333',
                'postalCode': '12345',
                'stateCode': 'AL',
                'countryCode': 'us',
                'UUID': 'e6032325a4f6a31032a5d17aeb'
            },
            skipLoop = 0;
        var result2= 'Test';
        var result = emarsys.getValues(field, object, skipLoop);
        assert.equal(result, result2);
    });

    it('testing method: returnProductURL', () => {
        var product = new Product();
        var res = 'Product-Show/pid=1234567';
        var result = emarsys.returnProductURL(product);
        assert.equal(result, res.toString()); 
    });

    it('testing method: appendProductInfo', () => {
        var dataObject = [], //product []
            mappedFields = [{'field':'product.ID','placeholder':'item'},
                            {'field':'product.url','placeholder':'link_url'},
                            {'field':'product.image','placeholder':'image'},
                            {'field':'product.rebate','placeholder':'rebate'}],
            res =[{
                'item': '0045001',
                'link_url': 'Product-Show/pid=1234567',
                'rebate': {
                    'currencyCode': 'USD',
                    'value': 3
                }
            }];
        
        emarsys.appendProductInfo(mappedFields, order, dataObject);
        assert.deepEqual(dataObject, res);  
    });

    it('testing method: appendGlobalMappedFieldsObject', () => {
        var dataObject = {},
            mappedFields = [
                            {'field':'shippingAddress','placeholder':'shippingAddress'},
                            {'field':'trackingNumber','placeholder':'trackingNumber'},
                            {'field':'deliveryMethod','placeholder':'deliveryMethod'},
                            {'field':'orderRebate','placeholder':'orderRebate'},
                            {'field':'shippingCosts','placeholder':'shippingCosts'},
                            {'field':'paymentMethod','placeholder':'paymentMethod'},
                            {'field':'order','placeholder':'order'}];

        var res = {
            'deliveryMethod': '002 - test',
            'order': '',
            'orderRebate': '13.77 USD',
            'paymentMethod': 'paymentInstrumentId1',
            'shippingAddress': {
                'firstName': 'Amanda',
                'lastName': 'Jones',
                'address1': '65 May Lane',
                'address2': '',
                'city': 'Allston',
                'postalCode': '02135',
                'countryCode': { 'value': 'us' },
                'phone': '617-555-1234',
                'stateCode': 'MA'
            },
            'shippingCosts': '1 USD',
            'trackingNumber': '000333'
        };

        emarsys.appendGlobalMappedFieldsObject(mappedFields, dataObject, order);
        assert.deepEqual(dataObject, res); 
    });

    it('testing method: getObjectAttr', () => {
        var attributes = ['product', 'availabilityModel', 'inventoryRecord', 'ATS', 'value'];
        var result = emarsys.getObjectAttr(new ProductLineItem(), attributes);

        assert.equal(result, 100); 
    });

    it('testing method: returnProductRebate', () => {
        var res = {currencyCode: 'USD', value: 3};
        var result = emarsys.returnProductRebate(new ProductLineItem());

        assert.deepEqual(result, res); 
    });

    it('testing method: returnOrderRebate', () => {
        var res = {
            'currencyCode': 'USD',
            'value': 13.77
        };
        var result = emarsys.returnOrderRebate(order);
        
        assert.deepEqual(result, res); 
    });

    it('testing method: addSourceIdToRequest', () => {
        var object = {
            source_id: 0 
        };
        var res = '34967'; 

        emarsys.addSourceIdToRequest(object);
        assert.deepEqual(object.source_id, res);
    });

    it('testing method: formatDate', () => {
        var date = new Date(2019,11,20),
            dateDelimeter = '-', 
            timeDelimeter = ':';
        var res = '2019-12-20 00:00:00'; 
        var result = emarsys.formatDate(date, dateDelimeter, timeDelimeter);

        assert.equal(result, res);
    });
});
