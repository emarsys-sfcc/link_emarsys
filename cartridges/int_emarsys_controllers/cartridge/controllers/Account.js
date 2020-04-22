'use strict';

var guard = require('~/cartridge/scripts/guard');
var object = require('~/cartridge/scripts/object');
var Form = require('~/cartridge/scripts/models/FormModel');
var Site = require('dw/system/Site');
var baseController = require('app_storefront_controllers/cartridge/controllers/Account');

/**
 * @description Triggers specified external event to transmit customer data
 * @param {string} sfccEventName - Emarsys external event
 * @param {string} email - customer email
 */
function triggerExternalEvent(sfccEventName, email) {
    var eventsHelper = require('*/cartridge/scripts/helpers/triggerEventHelper');
    var logger = require('dw/system/Logger').getLogger('emarsys');
    var isEmarsysEnable = Site.getCurrent().getCustomPreferenceValue('emarsysEnabled');
    if (isEmarsysEnable) {
        try {
            var context = {};
            context.email = email;

            // get emarsys side external event name and it's id
            context.externalEventId = eventsHelper.getExternalEventData(sfccEventName).emarsysId;

            // get Emarsys profile fields descriptions
            context.profileFields = eventsHelper.prepareFieldsDescriptions();

            if (!empty(context.externalEventId)) {
                eventsHelper.triggerExternalEvent(context);
            }
        } catch (err) {
            logger.error(err.errorMessage);
        }
    }
}

function passwordResetDialogForm() {
    var viewData = baseController.PasswordResetDialogForm();
    if(viewData && viewData.ShowContinue === true) {
        var sfccEventName = 'forgot_password_submitted';
        var email = Form.get('requestpassword').object.email.htmlValue;
        triggerExternalEvent(sfccEventName, email);
    }
}

object.extend(exports, baseController);
exports.PasswordResetDialogForm = guard.ensure(['post', 'https', 'csrf'], passwordResetDialogForm);
