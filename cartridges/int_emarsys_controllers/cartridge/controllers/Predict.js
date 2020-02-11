'use strict';

/**
 * @module controllers/Predict
 */

/* Script Modules */
var guard = require('~/cartridge/scripts/guard');

/**
 * @description - send object
 * @returns {void}
 */
function getCartInfo() {
    var ScarabQueueHelper = new (require('*/cartridge/scripts/util/ScarabQueueHelper'))();
    var currentBasket = ScarabQueueHelper.getCartData(dw.order.BasketMgr.getCurrentBasket());

    response.getWriter().print(JSON.stringify({
        Basket: currentBasket
    }));
}

/**
 * @description - send object
 * @returns {void}
 */
function getCustomerInfo() {
    var isCustomer = (customer.authenticated && customer.registered);
    var customerObject = {
        PageContext: request.httpParameterMap.PageContext.value,
        GuestEmail: request.httpParameterMap.GuestEmail.value,
        IsCustomer: isCustomer
    };

    if (isCustomer) {
        if (!empty(customer.profile.email)) {
            customerObject.CustomerEmail = customer.profile.email;
        } else {
            customerObject.CustomerNo = customer.profile.customerNo;
        }
    }

    response.getWriter().print(JSON.stringify({
        Customer: customerObject
    }));
}

/**
 * @description return Cart object
 * @returns {void}
 */
function returnCartObject() {
    var useGrossPrice = dw.system.Site.current.getCustomPreferenceValue('emarsysUseGrossPrice'),
        cart          = dw.order.BasketMgr.getCurrentBasket(),
        cartObj       = [];

    if (cart) {
        var productItems = cart.getProductLineItems();
        for (var i = 0; i < productItems.length; i++) {
            var ProductLineItem = productItems[i];
            if (ProductLineItem.bonusProductLineItem || ProductLineItem.bundledProductLineItem) {continue;}

            var prodObject = {
                'item' : ProductLineItem.productID,
                'price' : useGrossPrice === true ? parseFloat((ProductLineItem.adjustedGrossPrice.value).toFixed(2)) : parseFloat((ProductLineItem.adjustedNetPrice.value).toFixed(2)),
                'quantity' : ProductLineItem.quantityValue
            };

            cartObj.push(prodObject);
        }
    }

    response.setContentType('application/json');

    response.writer.print(JSON.stringify(cartObj));
}

exports.GetCartInfo = guard.ensure(['get'], getCartInfo);
exports.GetCustomerInfo = guard.ensure(['get'], getCustomerInfo);
exports.ReturnCartObject = guard.ensure(['get'], returnCartObject);
