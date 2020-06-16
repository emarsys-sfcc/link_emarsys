'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('PasswordResetDialogForm', function (req, res, next) {
    var viewData = res.getViewData();
    var assign = require('modules/server/assign');
    var eventsHelper = require('int_emarsys/cartridge/scripts/helpers/triggerEventHelper');
    var isEmarsysEnable = require('dw/system/Site').getCurrent().getCustomPreferenceValue('emarsysEnabled');
    if (viewData.success === true && isEmarsysEnable) {
        var sfccEventName = 'forgot_password_submitted';
        var email = req.form.loginEmail;
        eventsHelper.processEventTriggering(sfccEventName, assign, { email: email });
    }
    next();
});

module.exports = server.exports();
