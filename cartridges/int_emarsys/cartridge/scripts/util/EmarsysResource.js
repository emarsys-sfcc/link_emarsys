/**
 * Emarsys Resource helper
 *
 */

function EmarsysResourceHelper() {}
/**
    * Get the client-side URLs of a given page
    * @returns {Object} An objects key key-value pairs holding the URLs
    */
EmarsysResourceHelper.getUrls = function() {
    var URLUtils = require('dw/web/URLUtils');

    // application urls
    var urls =  {
        footerSubscription    : URLUtils.url('EmarsysNewsletter-FooterSubscription').toString(),
        emarsysSignup         : URLUtils.url('EmarsysNewsletter-Signup').toString(),
        thankYouPage          : URLUtils.url('EmarsysNewsletter-ThankYouPage').toString(),
        alreadyRegisteredPage : URLUtils.url('EmarsysNewsletter-AlreadyRegisteredPage').toString(),
        dataSubmittedPage     : URLUtils.url('EmarsysNewsletter-DataSubmittedPage').toString(),
        errorPage             : URLUtils.url('EmarsysNewsletter-ErrorPage').toString(),
        emarsysDisabledPage   : URLUtils.url('EmarsysNewsletter-EmarsysDisabledTemplate').toString(),
        emarsysAddToCartAjax  : URLUtils.url('Predict-ReturnCartObject').toString()
    };

    return urls;
};

EmarsysResourceHelper.getResources = function() {
    var Resource = require('dw/web/Resource');
    var resources = {};

    // Privacy policy resources
    resources["privacyBeforeLink"]   = Resource.msg('global.privacy.beforelink', 'locale', null);
    resources["privacyAfterLink"]    = Resource.msg('global.privacy.afterlink', 'locale', null);
    resources["privacyErrorMessage"] = Resource.msg('global.privacy.errormessage', 'locale', null);

    return resources;
};

EmarsysResourceHelper.getPreferences = function() {
    var customPreferences = require('dw/system/Site').getCurrent();
    return {
        enabled: customPreferences.getCustomPreferenceValue('emarsysEnabled'),
        trackingJsEnabled: customPreferences.getCustomPreferenceValue('emarsysPredictEnableJSTrackingCode')
    };
};

module.exports = EmarsysResourceHelper;