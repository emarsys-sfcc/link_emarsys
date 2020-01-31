/**
 * The script for handling order confirmation emails
 *   @input Order : Object;
 */

/*exported execute*/
function execute(args) {
    try {

        if (require("dw/system/HookMgr").hasHook("emarsys.sendOrderConfirmation")) {
            require("dw/system/HookMgr").callHook("emarsys.sendOrderConfirmation", "orderConfirmation", { Order: args.Order });
        }

    } catch (err) {
        require("dw/system/Logger").error("[OrderConfirmationEmail.js #" + err.lineNumber + "] - ***Emarsys order confirmation email error message: " + err);

        return PIPELET_ERROR;
    }

    return PIPELET_NEXT;
}
