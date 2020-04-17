'use strict';
var currentSite = require('dw/system/Site').getCurrent();
var logger = require('dw/system/Logger').getLogger('emarsysLoyalty');
/**
 * @description hash input data
 * @param {string} data - input data
 * @returns {string|void} return hex
 */
function getToken(data) {
    var key = currentSite.getCustomPreferenceValue('emarsysSecret'); // salt
    var emailDigest = '';
    if (!empty(key)) {
        var sha256mac = new dw.crypto.Mac(dw.crypto.Mac.HMAC_SHA_256).digest(data, key);
        emailDigest = dw.crypto.Encoding.toHex(sha256mac);
    } else {
        logger.error('[model/loyaltyCustomerData.js] - ***Empty CustomPreferenceValue - emarsysSecret');
    }
    return emailDigest;
}

/**
 * @description loyaltyCustomerData class that represents the customer data for Loyalty Wallet
 * @constructor
 */
function loyaltyCustomerData() {
    var loyaltyWalletEnabled = currentSite.getCustomPreferenceValue('emarsysLoyaltyWalletEnabled');
    var emarsysAppId = currentSite.getCustomPreferenceValue('emarsysAppId');
    var emarsysCustomerId = currentSite.getCustomPreferenceValue('emarsysCustomerId');
    var emarsysRegion = currentSite.getCustomPreferenceValue('emarsysRegion');

    if (loyaltyWalletEnabled && customer.authenticated && customer.registered
         && (!empty(emarsysAppId) && !empty(emarsysCustomerId) && !empty(emarsysRegion))) {
        this.appId = emarsysAppId;
        this.contactId = customer.profile.email || '';
        this.customerId = emarsysCustomerId;
        this.timestamp = Math.floor((new Date()).getTime() / 1000);
        this.token = getToken(this.contactId + this.timestamp);
        this.region = emarsysRegion;
    } else {
        logger.error('[model/loyaltyCustomerData.js] - ***Check the details in Custom Site Preference Groups - Emarsys Loyalty Wallet');
    }
}

module.exports = loyaltyCustomerData;
