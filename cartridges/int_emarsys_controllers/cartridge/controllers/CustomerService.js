'use strict';

var guard = require('~/cartridge/scripts/guard');
var object = require('~/cartridge/scripts/object');
var Form = require('~/cartridge/scripts/models/FormModel');
var Status = require('dw/system/Status');
var baseController = require('app_storefront_controllers/cartridge/controllers/CustomerService');

/**
 * The form handler for the contactus form.
 */
function submit() {
    var eventsHelper = require('int_emarsys/cartridge/scripts/helpers/triggerEventHelper');
    var contactUsResult = baseController.Submit();
    if (contactUsResult && (contactUsResult.getStatus() === Status.OK)) {
        var sfccEventName = 'contact_form_submitted';
        var email = Form.get('contactus').object.email.htmlValue;
        eventsHelper.processEventTriggering(sfccEventName, object.extend, { email: email });
    }
}

object.extend(exports, baseController);
exports.Submit = guard.ensure(['post', 'https'], submit);
