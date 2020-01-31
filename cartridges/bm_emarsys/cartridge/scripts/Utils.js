/**
* Rendering BM page tabs
*/

var ArrayList = require('dw/util/ArrayList');
var Resource = require('dw/web/Resource');

/**
 * @param {string} pipeline - name of pipline
 * @param {string} paramName - name of parameter
 * @param {string} paramVal - value of the parameter
 * @param {string} menuName - name of the menu
 * @param {string} mainMenuName - name of main menu
 * @param {string} currentMenuItem - name of current menu item
 * @returns {string} - created url
 */
function buildSubNavURL(pipeline, paramName, paramVal, menuName, mainMenuName, currentMenuItem) {
    return pipeline + '?CurrentMenuItemId=' + currentMenuItem + '&menuname=' + menuName + '&mainmenuname=' + mainMenuName + '&' + paramName + '=' + paramVal;
}

/**
 * @param {string} module - name of the module
 * @param {string} moduleParam - name of module parameter for link
 * @param {string} menuName - current menu name
 * @param {string} currentMenuItem - current menu item
 * @returns {Object} - list of arrays with newsletter navigation gonfiguration OR null
 */
function BuildSubNav(module, moduleParam, menuName, currentMenuItem) {
    // Pages
    var newsletterConfig = 'EmarsysConfig-Subscription';
    var mainMenuName = 'Emarsys Integration';

    switch (module) {

        // Reports
        case 'newsletter-configuration':

            var navigation = new ArrayList([
                buildSubNavURL(newsletterConfig, moduleParam, 'footer', menuName, mainMenuName, currentMenuItem),
                Resource.msg('nc.module.footer.title', 'newsletter_configuration', null),
                'footer'
            ], [
                buildSubNavURL(newsletterConfig, moduleParam, 'checkout', menuName, mainMenuName, currentMenuItem),
                Resource.msg('nc.module.checkout.title', 'newsletter_configuration', null),
                'checkout'
            ], [
                buildSubNavURL(newsletterConfig, moduleParam, 'account', menuName, mainMenuName, currentMenuItem),
                Resource.msg('nc.module.account.title', 'newsletter_configuration', null),
                'account'
            ]);

            return navigation;
        default:
            return null;
    }
}

module.exports = {
    BuildSubNav: BuildSubNav
};
