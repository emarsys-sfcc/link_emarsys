/**
 * Helper class for working with Emarsys ScarabQueue
 *
 */
var currentSite = require('dw/system/Site').getCurrent();

/**
 * @description gets product line item data from order or basket
 * @param {Object} basket
 * @returns {Array} products, products data
 */
function getBasketProductData(basket) {
    var useGrossPrice = currentSite.getCustomPreferenceValue('emarsysUseGrossPrice');
    var products = [];
    for (var i = 0; i < basket.getProductLineItems().size(); i++) {
        var ProductLineItem = basket.getProductLineItems()[i];
        if(ProductLineItem.bonusProductLineItem || ProductLineItem.bundledProductLineItem) {
            continue;
        }

        var prodObject = {
            'item' : ProductLineItem.productID,
            'price' : useGrossPrice ? parseFloat((ProductLineItem.adjustedGrossPrice.value).toFixed(2)) : parseFloat((ProductLineItem.adjustedNetPrice.value).toFixed(2)),
            'quantity' : ProductLineItem.quantityValue
        };

        products.push(prodObject);
    }

    return products;
}

function ScarabQueueHelper() {
    /**
     * @description Triggers API call
     * @param {String} serviceName - name service
     * @param {String} endpoint - the endpoint to use when generating urls
     * @param {Object} requestBody - the request object
     * @param {String} requestMethod - method GET/POST/...
     * @return {Object} service Call
     */
    this.getCategoryChain = function(category) {
        var doWhile = true;
        var currentCategory = category;
        var categoryChain = [];
        var currentUserLocale = request.locale;
        var defaultLocale = currentSite.getDefaultLocale();
        request.setLocale(defaultLocale);

        while(doWhile) {
            if(currentCategory && currentCategory.parent && currentCategory.ID !== 'root' && !currentCategory.root) {
                if(currentCategory.online) {
                    categoryChain.unshift(currentCategory.displayName);
                }
                currentCategory = currentCategory.parent;
            } else {
                doWhile = false;
                categoryChain = categoryChain.join(" > ");
            }
        }
        request.setLocale(currentUserLocale);

        return categoryChain;
    };

    /**
     * @descroption Collects analytics data for thank you page
     * @param {Object} order
     * @returns {Object} orderObj, collected order data
     */
    this.getOrderData = function(order) {
        var orderObj = {};
        orderObj['orderId'] = order.orderNo;
        orderObj['items'] = getBasketProductData(order);

        return orderObj;
    };

    /**
     * @descroption Collects analytics data for thank you page
     * @param {Object} cart, current basket
     * @returns {Array} cartObj, collected basket data
     */
    this.getCartData = function(cart) {
        var cartObj = [];
        if(cart) {
            cartObj = getBasketProductData(cart);
        }

        return cartObj;
    };
}

module.exports = ScarabQueueHelper;
