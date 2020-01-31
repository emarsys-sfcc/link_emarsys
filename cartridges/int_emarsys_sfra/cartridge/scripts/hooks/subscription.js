'use strict';

var emarsysHelper = require('int_emarsys_sfra/cartridge/scripts/helpers/emarsysSFRAHelper');

/**
 * @description - Called from pipeline. Creates account subscription.
 * @param {Object} res - response
 * @param {Object} profileForm - it is a profile form
 * @returns {void}
 */
function accountSubscriptionPipe(res, profileForm) {
    emarsysHelper.accountSubscription(res, profileForm);
}

/**
 * @description - Called from pipeline. Creates account subscription on checkout steps.
 * @param {Object} res - response
 * @param {Object} billingData - it is a billing address form
 * @returns {void}
 */
function checkoutSubscriptionPipe(res, billingData) {
    emarsysHelper.checkoutSubscription(res, billingData);
}

module.exports = {
    accountSubscriptionPipe: accountSubscriptionPipe,
    checkoutSubscriptionPipe: checkoutSubscriptionPipe
};
