'use strict';

/**
 * @module controllers/Predict
 */

/* Script Modules */
var guard = require('~/cartridge/scripts/guard');

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

exports.ReturnCartObject = guard.ensure(['get'], returnCartObject);
