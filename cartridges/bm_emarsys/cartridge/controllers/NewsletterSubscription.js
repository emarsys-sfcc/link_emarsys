'use strict';

var server = require('server');

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var BMEmarsysHelper = require('*/cartridge/scripts/helpers/BMEmarsysHelper');

/**
 * @description this function is colled with bm_extensions
 */
server.get('ShowNewsletterSubscription', server.middleware.https, function (req, res, next) {
    var tabsAttr = BMEmarsysHelper.getTabsAttr('EmarsysNewsletterSubscription', 'EmarsysSubscriptionType');
    var additionalValues = BMEmarsysHelper.getExternalEvents('EmarsysExternalEvents', 'StoredEvents', 'newsletterSubscriptionResult');
    var storedConfigurations = BMEmarsysHelper.getStoredConfigurations('EmarsysNewsletterSubscription');

    var newsletterSubForm = server.forms.getForm('newsletterSub');
    newsletterSubForm.clear();

    res.render('mainPage', {
        contentTemplate: 'newsletterConfiguration',
        tabsAttr: tabsAttr,
        additionalValues: additionalValues,
        newsletterSubForm: newsletterSubForm,
        storedConfigurations: storedConfigurations
    });
    next();
});

server.post('SaveNewsletter', server.middleware.https, function (req, res, next) {
    var newsletteForm = server.forms.getForm('newsletterSub');
    var newsletteFormObj = newsletteForm.toObject();

    if (newsletteFormObj.subscriptionType) {
        try {
            Transaction.wrap(function () {
                var currentCustomObject = CustomObjectMgr.getCustomObject('EmarsysNewsletterSubscription', newsletteFormObj.subscriptionType);

                currentCustomObject.custom.optInExternalEvent = newsletteFormObj.externalEventOptin;
                currentCustomObject.custom.optInStrategy = newsletteFormObj.subscriptionStrategy;
                currentCustomObject.custom.optInExternalEventAfterConfirmation = newsletteFormObj.externalEventOptinAfterConfirmation;
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
            responseText: 'Missing parameter "subscriptionType" in form'
        });
    }
    next();
});

module.exports = server.exports();
