'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Subscribe', function (req, res, next) {
    var eventsHelper = require('*/cartridge/scripts/helpers/triggerEventHelper');
    var logger = require('dw/system/Logger').getLogger('emarsys');
    var isEmarsysEnable = require('dw/system/Site').getCurrent().getCustomPreferenceValue('emarsysEnabled');
    var myForm = req.form;
    var viewData = res.getViewData();
    if (viewData.success === true && isEmarsysEnable) {
        try {
            var context = {};
            context.email = myForm.contactEmail;
            // get emarsys side external event name and it's id
            context.externalEventId = eventsHelper.getExternalEventData('contact_form_submitted').emarsysId;

            // get Emarsys profile fields descriptions
            context.profileFields = eventsHelper.prepareFieldsDescriptions();

            if (!empty(context.externalEventId)) {
                eventsHelper.triggerExternalEvent(context);
            }
        } catch (err) {
            logger.error(err.errorMessage);
        }
    }

    next();
});

module.exports = server.exports();
