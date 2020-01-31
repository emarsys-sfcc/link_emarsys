"use strict";
/**
 * @description Checks if contact exists and updates/creates a contact with order billngAddress object details.
 * Sends a call to emarsys with shipping details in request for each shipped order
 */

var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var Site = require("dw/system/Site");
var Status = require("dw/system/Status");
var Order = require("dw/order/Order");
var OrderMgr = require("dw/order/OrderMgr");

var ShippingData = {
    /** @type {dw.system.Log} */
    logger: require("dw/system/Logger").getLogger("ShippingData", "ShippingData"),
    execute: function() {
        try {
            this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/util/EmarsysHelper'))();
            this.sendShippingData();
        } catch (err) {
            this.logger.error("ShippingData: Error " + err.message + "\n" + err.stack);
            return new Status(Status.ERROR, "ERROR");
        }

        return new Status(Status.OK, "OK");
    },
    /**
     * @description  Checks a contact with order billngAddress object details. Sends a call to emarsys
     */
    sendShippingData: function() {
        var getContactData;
        var submitContactData;
        var triggerEvent;

        var method = "PUT";
        var co = CustomObjectMgr.getCustomObject("EmarsysTransactionalEmailsConfig","shipping"); // custom object that stores config for shipping emails

        // get all orders with status "SHIPPED", that are marked for shipping confirmation emails and the email has not been sent yet
        var orders = OrderMgr.searchOrders("shippingStatus = {0} AND custom.sendEmarsysShippingEmail = {1} AND NOT custom.emarsysShippingEmailSent = {2}", null, Order.SHIPPING_STATUS_SHIPPED, true, true);
        var genderCodes = JSON.parse(Site.current.preferences.custom.emarsysGenderCodes);
        var mappedFields = JSON.parse(co.custom.mappedFields);
        var externalEventId = co.custom.externalEvent;

        while (orders.hasNext()) {
            try {
                var order = orders.next();
                var email = order.customerEmail;

                // object to store emarsys fields codes and billingAddress attributes
                var billingAddressMap = {};

                this.emarsysHelper.addDataToMap(order.billingAddress, billingAddressMap);

                // base request to check if contact already exists
                var baseRequest = {
                    keyId: "3",
                    keyValues: [email]
                };

                // call to check if contact already exists
                getContactData = this.emarsysHelper.triggerAPICall("contact/getdata", baseRequest, "POST");
                if (getContactData.status !== "OK") {
                    this.logger.error("[SendShippingData.js - Get data error:" + getContactData.error + "] - ***Emarsys error message: " + getContactData.errorMessage);
                }

                // parse response and check for errors
                var dataObj = JSON.parse(getContactData.object),
                    errors = dataObj.data.errors;

                if (errors.length > 0) {
                    var error = errors[0];
                    // check if account exists and change request method depending on that
                    // error code 2008 means that account wasn't created yet
                    if (error.errorCode === 2008) {
                        method = "POST";
                    }
                }

                // request object to update/create contact data
                var contactDataToSubmit = {
                    keyId: "3",
                    "3": email
                };

                // if source id value exists add it to request
                this.emarsysHelper.addSourceIdToRequest(contactDataToSubmit);

                // add billing address fields
                this.emarsysHelper.addFields(billingAddressMap, contactDataToSubmit);

                // map gender string value to a scalar
                if (order.customer.profile && order.customer.profile.gender.value !== 0) {
                    var code = genderCodes[order.customer.profile.gender.value];
                    contactDataToSubmit["5"] = code;
                }

                // call to Emarsys to update/create contact data
                submitContactData = this.emarsysHelper.triggerAPICall("contact", contactDataToSubmit, method);
                if (submitContactData.status !== "OK") {
                    this.logger.error("SendShippingData.js - Submit data error:" + submitContactData.error + "] - ***Emarsys error message: " + submitContactData.errorMessage);
                }

                // order shipping data to send
                var shippingData = {
                    key_id: "3",
                    external_id: email,
                    data: {
                        global: {},
                        products: []
                    }
                };

                // add order fields to global object
                this.emarsysHelper.appendGlobalMappedFieldsObject(mappedFields, shippingData.data.global, order);

                // add products info
                this.emarsysHelper.appendProductInfo(mappedFields, order, shippingData.data.products);

                if (externalEventId) {
                    var endpoint = "event/" + externalEventId + "/trigger";
                    triggerEvent = this.emarsysHelper.triggerAPICall(endpoint, shippingData, "POST");

                    if (triggerEvent.status !== "OK") {
                        this.logger.error("[SendShippingData.js - Trigger event error:" + triggerEvent.error + "] - ***Emarsys error message: " + triggerEvent.errorMessage);
                    } else {
                        order.custom.emarsysShippingEmailSent = true;
                    }
                }
            } catch (err) {
                this.logger.error("[SendShippingData.js #" + err.lineNumber + "] - ***Submit data error message: " + err);
                return new Status(Status.ERROR, "ERROR");
            }
        }
    }
};

exports.execute = ShippingData.execute.bind(ShippingData);
