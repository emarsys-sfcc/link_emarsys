/**
 * The script for handling order confirmation emails
 *   @input Order : Object;
 */

/**
 * @param {Object} args, pipeline icomming parameters
 * @returns {number} 0 or 1, 1 - success, 0 - error
*/
function execute(args) {// eslint-disable-line
    try {
        if (require('dw/system/HookMgr').hasHook('emarsys.sendOrderConfirmation')) {
            require('dw/system/HookMgr').callHook('emarsys.sendOrderConfirmation', 'orderConfirmation', { Order: args.Order });
        }
    } catch (err) {
        require('dw/system/Logger').error('[OrderConfirmationEmail.js #' + err.lineNumber + '] - ***Emarsys order confirmation email error message: ' + err);

        return PIPELET_ERROR;
    }

    return PIPELET_NEXT;
}
