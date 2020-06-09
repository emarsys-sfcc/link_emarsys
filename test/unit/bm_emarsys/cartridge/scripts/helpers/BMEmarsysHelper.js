'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = '../../../../../mocks/';

var CustomObjectMgr = require(mockPath + 'dw/object/CustomObjectMgr');
var Site = require(mockPath + 'dw/system/Site');

var cartridgePath = '../../../../../../cartridges/bm_emarsys/';

var BMEmarsysHelper = proxyquire(cartridgePath + 'cartridge/scripts/helpers/BMEmarsysHelper.js', {
    'dw/object/CustomObjectMgr': CustomObjectMgr,
    'dw/system/Site': Site
});

describe('BMEmarsysHelper Helpers', () => {
    it('Testing method: getAllCustomObjectByType', () => {
        var customObj = CustomObjectMgr.getCustomObject('EmarsysCatalogConfig','customConfig');
        var result = BMEmarsysHelper.getAllCustomObjectByType('EmarsysCatalogConfig');

        assert.deepEqual(result[0], customObj);
    });

    it('Testing method: parseCustomPrefValue', () => {
        var result = BMEmarsysHelper.parseCustomPrefValue('emarsysCatalogExportType');

        assert.deepEqual(result,[{
            id: 'master', 
            name: 'master.export.type.label'
        },
        {
            id: 'variations',
            name: 'variations.export.type.label'
        }]);
    });
    it('Testing method: getExternalEvents', () => {
        var result = BMEmarsysHelper.getExternalEvents('EmarsysExternalEvents','StoredEvents', 'otherResult');
        assert.deepEqual(result, [
            {id: '12678', name: 'cancelled_order'},
            {id: '12561', name: 'forgot_password_submitted'},
            {id: '12563', name: 'contact_form_submitted'}]);
    });

    it('Testing method: getTabsAttr', () => {
        var res = [{ id: 'customConfig', label: 'CustomConfig'},
            {id: 'customConfig2', label: 'CustomConfig2'}];
        var result = BMEmarsysHelper.getTabsAttr('EmarsysCatalogConfig', 'EmarsysCatalogConfig', true);

        assert.deepEqual(result, res);
    });

    it('Testing method: getStoredConfigurations', () => {
        var res = CustomObjectMgr.getCustomObject('EmarsysCatalogConfig','customConfig2').custom;
        var result = BMEmarsysHelper.getStoredConfigurations('EmarsysCatalogConfig');

        assert.deepEqual(result[1], res);
    });

    it('Testing method: parseCustomObjects', () => {
        var res = { 
            contentID: 'customConfig2',
            additionalParam: 'masters',
            mappedFields: [
                {field: 'product.ID', placeholder: 'item'},
                {field: 'product.image', placeholder: 'image'}],
            fieldsLength: 2
        };
        var argument1 = BMEmarsysHelper.getAllCustomObjectByType('EmarsysCatalogConfig');
        var result = BMEmarsysHelper.parseCustomObjects(argument1, 'EmarsysCatalogConfig', 'exportType');

        assert.deepEqual(result[1], res);
    });

    it('Testing method: parseCustomObjects #2', () => {
        var argument1 = CustomObjectMgr.getCustomObject('EmarsysCatalogConfig', 'customConfigTEST');
        var result = BMEmarsysHelper.parseCustomObjects([argument1], 'EmarsysCatalogConfig', '');

        assert.deepEqual(result, [{
            additionalParam: false,
            contentID: 'customConfig2',
            fieldsLength: 0,
            mappedFields: ''
        }]);
    });
});
