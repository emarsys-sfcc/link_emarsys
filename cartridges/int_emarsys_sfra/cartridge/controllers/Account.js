'use strict';

var server = require('server');
server.extend(module.superModule);
var Site = require('dw/system/Site');

server.append(
    'PasswordResetDialogForm',
    function (req, res, next) {
        var eventsHelper = require('*/cartridge/scripts/helpers/triggerEventHelper');
        var logger = require('dw/system/Logger').getLogger('emarsys');
        var viewData = res.getViewData();
        var isEmarsysEnable = Site.getCurrent().getCustomPreferenceValue('emarsysEnabled');
        if (viewData.success === true && isEmarsysEnable) {
            try {
                var context = {};
                context.email = req.form.loginEmail;

                // get emarsys side external event name and it's id
                context.externalEventId = eventsHelper.getExternalEventData('forgot_password_submitted').emarsysId;

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
    }
);

module.exports = server.exports();
