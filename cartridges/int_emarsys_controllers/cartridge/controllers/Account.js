'use strict';

var guard = require('~/cartridge/scripts/guard');
var object = require('~/cartridge/scripts/object');
var Form = require('~/cartridge/scripts/models/FormModel');
var baseController = require('app_storefront_controllers/cartridge/controllers/Account');

function passwordResetDialogForm() {
    var eventsHelper = require('int_emarsys/cartridge/scripts/helpers/triggerEventHelper');
    var viewData = baseController.PasswordResetDialogForm();
    if(viewData && viewData.ShowContinue === true) {
        var sfccEventName = 'forgot_password_submitted';
        var email = Form.get('requestpassword').object.email.htmlValue;
        eventsHelper.processEventTriggering(sfccEventName, object.extend, { email: email });
    }
}

object.extend(exports, baseController);
exports.PasswordResetDialogForm = guard.ensure(['post', 'https', 'csrf'], passwordResetDialogForm);
