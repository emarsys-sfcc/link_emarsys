'use strict';

var server = require('server');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var BMEmarsysHelper = require('*/cartridge/scripts/helpers/BMEmarsysHelper');
var currentSite = require('dw/system/Site').getCurrent();

server.get('ShowCatalogConfigurations', server.middleware.https, function (req, res, next) {
    var productAttrs = currentSite.getCustomPreferenceValue('emarsysPredictProductAttributes');
    var additionalValues = BMEmarsysHelper.parseCustomPrefValue('emarsysCatalogExportType');
    var catalogConfigs = BMEmarsysHelper.getAllCustomObjectByType('EmarsysCatalogConfig');
    var tabsAttr = BMEmarsysHelper.getTabsAttr('EmarsysCatalogConfig', 'EmarsysCatalogConfig', true);
    var newCatalogConfigs = BMEmarsysHelper.parseCustomObjects(catalogConfigs, 'EmarsysCatalogConfig', 'exportType');

    productAttrs = Array.prototype.slice.call(productAttrs);

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'catalog.configurations',
        tabsAttr: tabsAttr,
        content: {
            contentConfigs: newCatalogConfigs,
            generalAttrs: productAttrs,
            additionalValues: additionalValues.values,
            isProperties: true
        }
    });

    next();
});

server.post('SaveCatalogConfigurations', server.middleware.https, function (req, res, next) {
    var catalogConf = JSON.parse(request.httpParameterMap.data.value);

    if (catalogConf) {
        try {
            Transaction.wrap(function () {
                var currentCustomObject = CustomObjectMgr.getCustomObject('EmarsysCatalogConfig', catalogConf.typeCustomObject);

                currentCustomObject.custom.mappedFields = JSON.stringify(catalogConf.fields);
                if (Object.prototype.hasOwnProperty.call(catalogConf, 'additionalValue')) {
                    currentCustomObject.custom.exportType = catalogConf.additionalValue;
                }
            });
            res.json({
                success: true
            });
        } catch (err) {
            res.json({
                success: false,
                responseText: 'An error occurred while transacting a possibly missing custom object or custom fields.' +
                '\nMessege: ' + err.message
            });
        }
    } else {
        res.json({
            success: false,
            responseText: 'Missing parameter "data" in request'
        });
    }

    next();
});

server.get('ShowOrderConfirmation', server.middleware.https, function (req, res, next) {
    var confirmAttrs = BMEmarsysHelper.parseCustomPrefValue('emarsysOrderConfirmationElements');
    var additionalValues = BMEmarsysHelper.getExternalEvents('EmarsysExternalEvents', 'StoredEvents', 'otherResult');
    var OrderConfigurationObject = CustomObjectMgr.getCustomObject('EmarsysTransactionalEmailsConfig', 'orderconf');
    var newOrderConfigs = BMEmarsysHelper.parseCustomObjects([OrderConfigurationObject], 'EmarsysEmailTypeConfig', 'externalEvent');

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'order.configurations',
        content: {
            contentConfigs: newOrderConfigs,
            generalAttrs: confirmAttrs,
            additionalValues: additionalValues.values,
            isProperties: false
        }
    });
    next();
});

server.get('ShowShippingConfirmation', server.middleware.https, function (req, res, next) {
    var confirmAttrs = BMEmarsysHelper.parseCustomPrefValue('emarsysShippingInformationElements');
    var additionalValues = BMEmarsysHelper.getExternalEvents('EmarsysExternalEvents', 'StoredEvents', 'otherResult');
    var ShippingConfigurationObject = CustomObjectMgr.getCustomObject('EmarsysTransactionalEmailsConfig', 'shipping');
    var newShippingConfigs = BMEmarsysHelper.parseCustomObjects([ShippingConfigurationObject], 'EmarsysEmailTypeConfig', 'externalEvent');

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'shipping.configurations',
        content: {
            contentConfigs: newShippingConfigs,
            generalAttrs: confirmAttrs,
            additionalValues: additionalValues.values,
            isProperties: false
        }
    });

    next();
});

server.get('ShowOrderCancelledConfigurations', server.middleware.https, function (req, res, next) {
    var confirmAttrs = BMEmarsysHelper.parseCustomPrefValue('emarsysCancelledOrderInformationElements');
    var additionalValues = BMEmarsysHelper.getExternalEvents('EmarsysExternalEvents', 'StoredEvents', 'otherResult');
    var OrderCancelledConfObj = CustomObjectMgr.getCustomObject('EmarsysTransactionalEmailsConfig', 'orderCancelledConf');
    var newOrderCancelledConfObj = BMEmarsysHelper.parseCustomObjects([OrderCancelledConfObj], 'EmarsysEmailTypeConfig', 'externalEvent');

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'order.cancelled.configurations',
        content: {
            contentConfigs: newOrderCancelledConfObj,
            generalAttrs: confirmAttrs,
            additionalValues: additionalValues,
            isProperties: false
        }
    });

    next();
});

server.post('SaveTransactionalEmailsConfig', server.middleware.https, function (req, res, next) {
    var transactionalEmailsConfig = JSON.parse(request.httpParameterMap.data.value);

    if (transactionalEmailsConfig) {
        try {
            Transaction.wrap(function () {
                var currentCustomObject = CustomObjectMgr.getCustomObject('EmarsysTransactionalEmailsConfig', transactionalEmailsConfig.typeCustomObject);

                currentCustomObject.custom.mappedFields = JSON.stringify(transactionalEmailsConfig.fields);
                if (Object.prototype.hasOwnProperty.call(transactionalEmailsConfig, 'additionalValue')) {
                    currentCustomObject.custom.externalEvent = transactionalEmailsConfig.additionalValue;
                }
            });
            res.json({
                success: true
            });
        } catch (err) {
            res.json({
                success: false,
                responseText: 'An error occurred while transacting a possibly missing custom object or custom fields.' +
                '\nMessege: ' + err.message
            });
        }
    } else {
        res.json({
            success: false,
            responseText: 'Missing parameter "data" in request'
        });
    }

    next();
});

server.get('ShowDBLoad', server.middleware.https, function (req, res, next) {
    var profileFieldsObject = JSON.parse(CustomObjectMgr.getCustomObject('EmarsysProfileFields', 'profileFields').custom.result);
    var confirmAttrs = BMEmarsysHelper.parseCustomPrefValue('emarsysDBLoadAttributes');
    var DBloadConfigurationObject = CustomObjectMgr.getCustomObject('EmarsysDBLoadConfig', 'dbloadConfig');
    var newDBloadConfigs = BMEmarsysHelper.parseCustomObjects([DBloadConfigurationObject], 'EmarsysDBLoadConfig');

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'dbload.configurations',
        content: {
            contentConfigs: newDBloadConfigs,
            generalAttrs: profileFieldsObject,
            selectPlacheholder: confirmAttrs,
            newLabelForPlaceholderCol: 'available.attribute',
            newLabelForAvailableCol: 'emarsys.field'
        }
    });

    next();
});

server.post('SaveDBLoad', server.middleware.https, function (req, res, next) {
    var DBloadConfig = JSON.parse(request.httpParameterMap.data.value);

    if (DBloadConfig) {
        try {
            Transaction.wrap(function () {
                var DBLoadConfigCustomObj = CustomObjectMgr.getCustomObject('EmarsysDBLoadConfig', DBloadConfig.typeCustomObject);

                DBLoadConfigCustomObj.custom.mappedFields = JSON.stringify(DBloadConfig.fields);
            });
            res.json({
                success: true
            });
        } catch (err) {
            res.json({
                success: false,
                responseText: 'An error occurred while transacting a possibly missing custom object or custom fields.' +
                '\nMessege: ' + err.message
            });
        }
    } else {
        res.json({
            success: false,
            responseText: 'Missing parameter "data" in request'
        });
    }

    next();
});

server.get('ShowSmartInsight', server.middleware.https, function (req, res, next) {
    var smartInsightAttrs = currentSite.getCustomPreferenceValue('emarsysSmartInsightAvailableElements');

    var SmartInsightConfigurationObject = CustomObjectMgr.getCustomObject('EmarsysSmartInsightConfiguration', 'emarsysSmartInsight');
    var newSmartInsightConfigs = BMEmarsysHelper.parseCustomObjects([SmartInsightConfigurationObject], 'SmartInsightConfig');

    smartInsightAttrs = Array.prototype.slice.call(smartInsightAttrs);

    res.render('mainPage', {
        contentTemplate: 'dynamic',
        pageType: 'smartinsight.configurations',
        content: {
            contentConfigs: newSmartInsightConfigs,
            generalAttrs: smartInsightAttrs
        }
    });

    next();
});

server.post('SaveSmartInsight', server.middleware.https, function (req, res, next) {
    var shippingConf = JSON.parse(request.httpParameterMap.data.value);

    if (shippingConf) {
        try {
            Transaction.wrap(function () {
                var currentCustomObject = CustomObjectMgr.getCustomObject('EmarsysSmartInsightConfiguration', shippingConf.typeCustomObject);

                currentCustomObject.custom.mappedFields = JSON.stringify(shippingConf.fields);
            });
            res.json({
                success: true
            });
        } catch (err) {
            res.json({
                success: false,
                responseText: 'An error occurred while transacting a possibly missing custom object or custom fields.' +
                '\nMessege: ' + err.message
            });
        }
    } else {
        res.json({
            success: false,
            responseText: 'Missing parameter "data" in request'
        });
    }

    next();
});

server.get('ShowOrderConfirmationEmail', server.middleware.https, function (req, res, next) {
    var orderConfEmailForm = server.forms.getForm('sendOrderConfEmail');
    orderConfEmailForm.clear();

    res.render('mainPage', {
        contentTemplate: 'sendOrderConfEmail',
        pageType: 'orderconfemail.configurations',
        orderConfEmailForm: orderConfEmailForm
    });

    next();
});

server.post('SendOrderConfirmationEmail', server.middleware.https, function (req, res, next) {
    var orderConfEmailForm = server.forms.getForm('sendOrderConfEmail');
    var orderId = orderConfEmailForm.orderId.value;
    var order = require('dw/order/OrderMgr').getOrder(orderId);

    if (order) {
        try {
            Transaction.wrap(function () {
                if (require('dw/system/HookMgr').hasHook('emarsys.sendOrderConfirmation')) {
                    require('dw/system/HookMgr').callHook('emarsys.sendOrderConfirmation', 'orderConfirmation', { Order: order });
                }
            });
            res.json({
                success: true,
                responseText: 'Message sent and order status updated'
            });
        } catch (err) {
            res.json({
                success: false,
                responseText: 'An error occurred while transacting a possibly missing custom object or custom fields.' +
                '\nMessege: ' + err.message
            });
        }
    } else {
        res.json({
            success: false,
            responseText: 'Order with number: ' + orderId + ' not exist.'
        });
    }

    next();
});


module.exports = server.exports();
