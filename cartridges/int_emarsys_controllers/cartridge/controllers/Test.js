'use strict';

/**
 * Controller for testing.
 *
 * @module controllers/Test
 */

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var ISML = require('dw/template/ISML');
function OrderConfirmation() {
    var Order = OrderMgr.getOrder(request.httpParameterMap.order.value);
    ISML.renderTemplate('checkout/confirmation/confirmation', {
        Order: Order
    });
    return;
}

// function OrderConfirmationEmail() {
//     var Order = OrderMgr.getOrder(request.httpParameterMap.order.value);
//     app.getView({Order: Order}).render('mail/orderconfirmation');
// }

exports.OrderConfirmation = OrderConfirmation;
exports.OrderConfirmation.public = true;
// exports.OrderConfirmationEmail = OrderConfirmationEmail;
// exports.OrderConfirmationEmail.public = true;