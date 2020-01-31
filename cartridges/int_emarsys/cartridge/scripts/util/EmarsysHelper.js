/**
 * Helper class for working with Emarsys API
 *
 */

var Money = require("dw/value/Money");
var Site = require("dw/system/Site");
var ShippingMgr = require("dw/order/ShippingMgr");
var web = require("dw/web");
var order = require("dw/order");
var siteCustomPreferences = Site.current.preferences.custom;

function EmarsysHelper() {

    /**
     * @description Triggers API call
     * @param {String} serviceName - name service
     * @param {String} endpoint - the endpoint to use when generating urls
     * @param {Object} requestBody - the request object
     * @param {String} requestMethod - method GET/POST/...
     * @return {Object} service Call
     */
    this.triggerAPICall = function(endpoint, requestBody, requestMethod) {
        var service = require('~/cartridge/scripts/service/emarsysService');

        return service.call(endpoint, requestBody, requestMethod);
    };

    /**
     * @description Get sourceId
     * @param {Object} callResult - result call request
     * @param {String} name - name source
     * @return {String}
     */
    this.getSourceId = function (callResult, name) {
        var dataObj = JSON.parse(callResult.object),
            sources = dataObj.data,
            sourceId;

        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source.name === name) {
                sourceId = source.id;
                break;
            }
        }
        return sourceId;
    };

    /**
     * @description Add new fields
     * @param {Object} map - Object to retrieve data from
     * @param {Object} requestBody - The request object
     * @return {void}
     */
    this.addFields = function (map, requestBody) {
        if (map) {
            // add new fields
            for (var id in map) {
                if (id === '5') {
                    requestBody[id] = this.convertGenderCode(map[id]);
                } else if (id === '14') {
                    requestBody[id] = this.convertCountryCode(map[id]);
                } else {
                    if (map[id]) {
                        requestBody[id] = map[id];
                    }
                }
            }
        }
    };

    /**
     * @description Method adds object's specified keys' values to map object which is used to populate request body sent to emarsys
     * @param {Object} object Object to retrieve data from
     * @param {Object} map Object to add data to
     */
    this.addDataToMap = function(object, map) {
        // read site preference value with emarsys ids for fields
        var emarsysIdsMap = JSON.parse(siteCustomPreferences.emarsysContactFieldsMap);
        Object.keys(emarsysIdsMap).forEach(function(element) {
            var value = null;

            value = this.getValues(emarsysIdsMap[element], object, 0);

            if (typeof(value) === 'object') {
                value = value.value;
            }

            if (value) {
                map[element] = value;
            }
        }, this);

        // if addres2 property is not null add it to the address field
        if ("address2" in object && object.address2) {
            map["10"] += ", " + object.address2;
        }
    };

    /**
     * @description Method adds Address object's specified keys' values to map object which is used to populate request body sent to emarsys
     * @param {Object} object Object to retrieve data from
     * @param {Object} map Object to add data to
     * @param {Int} i Int address counter
     */
    this.addAddressDataToMap = function(object, map, i) {
        var emarsysIdsMap = JSON.parse(siteCustomPreferences.emarsysAddressFieldsMap);

        Object.keys(emarsysIdsMap[i]).forEach(function(element) {
            var value = null;
            value = this.getValues(emarsysIdsMap[i][element], object, 0);

            if (typeof(value) === 'object') {
                value = value.value;
            }

            if (value) {
                map[element] = value;
            }
        }, this);
    };

    /**
     * @description Returns country code object
     * @param {string} countryCode - specific country code
     * @return {Object}
     */
    this.convertCountryCode = function (countryCode) {
        var countryCodes = JSON.parse(siteCustomPreferences.emarsysCountryCodes);
        return countryCodes[countryCode.toLowerCase()];
    };

    /**
     * @description returns gender code object
     * @param {string} gender - specific gender code
     * @return {Object}
     */
    this.convertGenderCode = function (gender) {
        var genderCodes = JSON.parse(siteCustomPreferences.emarsysGenderCodes);
        return genderCodes[gender];
    };

       /**
     * @description  This function transforms the field string into an object
     * and iterates through the object parameter to find values. If you only have one attribute to go through, use skipLoop = 1;
     * @param {String} field
     * @param {} object - Object to retrieve data from
     * @param {} skipLoop
     * @return {String}
     */
    this.getValues = function (field, object, skipLoop) {
        if(!empty(field)) {
            var toObject = field.split("."),
                attributes = '';

                if(skipLoop === 0 && toObject[0] in object) {
                    attributes = object[toObject[0]];
                }

                if(skipLoop === 1 && toObject[1] in object) {
                    attributes = object[toObject[1]];
                }

            toObject.forEach( function (val, key) {
                if (skipLoop) {
                    if(key !== 0 && key !== 1) {
                        attributes = attributes[val];
                    }
                } else {
                    if(key !== 0) {
                        attributes = val in attributes ? attributes[val] : '';
                    }
                }
            });

            if (attributes instanceof Money) {
                attributes = attributes.getValueOrNull() || '0';
            }

            //23.10.18 : fix g.h. : Date Attribute for order.creationDate is wrong.
            if (attributes instanceof Date) {
                attributes = this.formatDate(attributes, '-', ':');
            }

            try {
                if (typeof(attributes) === 'object') {
                    attributes = attributes.value;
                } else if(typeof(attributes) === 'string') {
                    attributes = attributes;
                }
            } catch(e) {
                attributes = attributes || '';
            }

            return attributes;
        }
    };


    /**
     * @description Returns link to PDP
     * @param {Object} product
     * @returns {*}
     */
    this.returnProductURL = function ( product ) {
        if (!empty(product)) {
            var pid = null,
                cgid = null;
            if (product instanceof order.ProductLineItem) {
                pid = product.productID;
                cgid = product.categoryID;
            } else {
                var firstCategoryID = !empty(product.allCategories) ? product.allCategories[0].getID() : null,
                    primaryCategoryID = !empty(product.primaryCategory) ? product.primaryCategory.getID() : null,
                    classificationCategoryID = !empty(product.classificationCategory) ? product.classificationCategory.getID() : null;
                cgid = primaryCategoryID || classificationCategoryID || firstCategoryID;
                pid = product.ID;
            }
            var URLAction = new web.URLAction("Product-Show", Site.current.ID);
            var URLParameter = new web.URLParameter("pid", pid);
            var URL = web.URLUtils.https(URLAction, URLParameter);
            if (cgid) {
                URL.append("cgid", cgid);
            }

            return URL;
        }
    };

    /**
     * @description Append the product to our product list
     * @param {Object} mappedFields - Object to retrieve data from
     * @param {Object} order - Object to retrieve data from
     * @param {Object} dataObject - Object to add data to
     * @return {void}
     */
    this.appendProductInfo = function (mappedFields, order, dataObject) {

        /**
         * @description add product image url
         * @param {String} viewType
         * @param {Object} placeholder
         * @param {Object} productLineItem
         * @return {void}
         */
        function addProductImageUrl(viewType, placeholder, productLineItem) {
            var addProduct = {};
            addProduct[placeholder] = productLineItem.product.getImage(viewType) !== null ? productLineItem.product.getImage(viewType).getAbsURL().toString() : "";
        }

        if (mappedFields && order && dataObject) {

            for (var i = 0; i < order.shipments[0].productLineItems.length; i++) {

                //Needed vars
                var productLineItem = order.shipments[0].productLineItems[i],
                    rebate = "",
                    url;

                //Get product URL
                url = this.returnProductURL(productLineItem);

                //Get product price adjustments
                rebate = this.returnProductRebate(productLineItem);

                //Add product
                var addProduct = {};

                for (var j = 0; j < mappedFields.length; j++) {

                    var placeholder = mappedFields[j].placeholder,
                        field = mappedFields[j].field,
                        splitField = mappedFields[j].field.split(".");

                    switch (splitField[0]) {

                        case 'product':
                          if (splitField[1] === "url") {
                            addProduct[placeholder] = url.toString();
                          } else if(splitField[1] === "image") {
                                var viewType = siteCustomPreferences.emarsysProductImageSize;
                                addProductImageUrl(viewType, placeholder, productLineItem);
                          } else if (splitField[1] === "rebate") {
                            addProduct[placeholder] = rebate;
                          } else {
                            addProduct[placeholder] = this.getValues(field, productLineItem, 1);
                          }

                        break;

                        case 'productItemPrice':
                            addProduct[placeholder] = productLineItem.proratedPrice.toFormattedString();
                        break;

                        case 'productItemGrossPrice':
                            addProduct[placeholder] = productLineItem.proratedPrice.add(productLineItem.adjustedTax).toFormattedString();
                        break;

                        case 'productItemTax':
                            addProduct[placeholder] = productLineItem.adjustedTax.toFormattedString();
                        break;

                    }
                }

                dataObject.push(addProduct); //append the product to our product list
            }
        }
    };

    /**
     * @description This function adds order information to the JSON object sent to Emarsys
     * @param {Object} mappedFields - Object to retrieve data from
     * @param {Object} order - Object to retrieve data from
     * @param {Object} dataObject - Object to add data to
     * @return {void}
     */
    this.appendGlobalMappedFieldsObject = function ( mappedFields, dataObject, order) {

        /**
         * @description select placeholder
         * @param {Object} mappedField1 - to retrieve data from
         * @return {void}
         */
        function mappedField(mappedField1) {
            var placeholder = mappedField1.placeholder,
            field = mappedField1.field,
            splitField = mappedField1.field.split(".");

            switch (splitField[0]) {

                /*  Billing address
                    The available element should starts with 'billingAddress' and it should contain real attributes
                    in this way we get needed values from billingAddress object.
                    Examples: billingAddress.address1, billingAddress.postalCode, billingAddress.countryCode.displayValue, etc.
                */
                case 'billingAddress':
                    dataObject[placeholder] = this.getValues(field, order, 0);
                    break;

                /*  Shipping address
                    The available element should starts with 'shippingAddress' and it should contain real attributes
                    in this way we get needed values from order.shipments[0].shippingAddress object.
                    Examples: shippingAddress.address1, shippingAddress.postalCode, shippingAddress.countryCode.displayValue, etc.
                */
                case 'shippingAddress':
                    dataObject[placeholder] = this.getValues(field, order.shipments[0], 0);
                    break;

                /*  General order attributes
                    The available element should starts with 'order' and it should contain real attributes
                    in this way we get needed values from order object.
                    Examples: order.orderNo, order.creationDate, etc.
                */
                case 'order':
                    dataObject[placeholder] = this.getValues(field, order, 1);
                    break;

                /*  Tracking number
                    Separate case for 'trackingNumber' element only.
                */
                case 'trackingNumber':
                    dataObject[placeholder] = order.shipments[0].trackingNumber;
                break;

                /*  Delivery method
                    Separate case for 'deliveryMethod.display' element only.
                    It reads shipping method name and description from order.shipments[0].shippingMethod object
                */
                case 'deliveryMethod':
                    dataObject[placeholder] = order.shipments[0].shippingMethod.displayName + " - " + order.shipments[0].shippingMethod.description;
                    break;

                /*  Payment method
                    Separate case for 'paymentMethod.display' element only.
                    It reads 1st payment method from order object
                */
                case 'paymentMethod':
                    dataObject[placeholder] = order.paymentInstruments[0].paymentMethod;
                break;

                /*  Order rebate
                    Separate case for 'orderRebate' element only.
                */
                case 'orderRebate':
                    dataObject[placeholder] = this.returnOrderRebate(order).toFormattedString();
                    break;

                /*  Shipping costs
                    Separate case for 'shippingCosts.display' element only,
                    it reads shipping total price from order.shipments[0] object
                */
                case 'shippingCosts':
                    dataObject[placeholder] = order.shipments[0].shippingTotalPrice.toFormattedString();
                break;

                /* Tracking number, shipment company, date of arrival, tracking link,
                    should have the following element definition:
                    custom.shipmentTrackingNumber
                    custom.shippingCompany
                    custom.arrivalDate
                    custom.trackingLink
                    The available element should starts with 'custom',
                    it reads custom attributes values from order.shipments[0] object
                */
                case 'custom':
                    dataObject[placeholder] = this.getValues(field, order.shipments[0].custom, 1);
                    break;
            }
        }

        if (!empty(mappedFields) && !empty(dataObject) && !empty(order)) {

            for (var i = 0; i < mappedFields.length; i++) {

                mappedField.call(this, mappedFields[i]);
            }
        }
    };

    /**
     * @description Returns object attribute
     * @param {Object} obj
     * @param {Object} attributes - array of attributes
     * @returns {*}
     */
    this.getObjectAttr = function (obj, attributes) {

        // if we have no attributes, then return empty string
        if (!attributes.length) {
            return '';
        }

        // set attribute as first attribute from object
        var lineItemAttr = null;
        try {
            lineItemAttr = obj[attributes[0]];
        } catch (e) {
            lineItemAttr = null;
        }

        // remove first element from attrArr
        attributes.shift();

        // while attribute exists in it's parent object
        if (lineItemAttr) {
            attributes.forEach(function (key) {

                // check if object is not empty
                if (lineItemAttr) {

                    // try to retrieve object's key
                    try {
                        lineItemAttr = lineItemAttr[key];
                    } catch (e) {
                        lineItemAttr = null;
                    }

                }
            });
        }
        if (lineItemAttr instanceof Money) {
            lineItemAttr = lineItemAttr.getValueOrNull() || '0';
        }
        return lineItemAttr || '';
    };

    /**
     * @description Returns product rebate
     * @param {Object} product
     * @returns {dw.value.Money}
     */
    this.returnProductRebate = function (product) {
        var currencyCode = Site.current.defaultCurrency;
        var rebate = new Money(0, currencyCode);
        if (!empty(product)) {
            var quantity = product.quantityValue,
                adjustedPrice = product.adjustedPrice.divide(quantity),
                basePrice = product.basePrice;
            currencyCode = product.price.currencyCode;
            rebate = new Money(0, currencyCode);
            if (basePrice.subtract(adjustedPrice).value > 0) {
                rebate = basePrice.subtract(adjustedPrice);
                rebate = rebate.multiply(quantity);
            }
        }

        return rebate;
    };

    /**
     * @description Returns order rebate
     * @param {Object} order
     * @returns {dw.value.Money}
     */
    this.returnOrderRebate = function (order) {
        var currencyCode = Site.current.defaultCurrency;
        var rebate = new Money(0, currencyCode);
        if (!empty(order)) {
            var shippingMethod = order.shipments[0].getShippingMethod(),
                shippingModel = ShippingMgr.getShipmentShippingModel(order.shipments[0]),
                shippingCost = shippingModel.getShippingCost(shippingMethod).amount;

            currencyCode = order.currencyCode;
            rebate = new Money(0, currencyCode);

            //order level rebate
            if (order.priceAdjustments.length > 0) {
                for (var i = 0; i < order.priceAdjustments.length; i++) {
                    var basePrice = order.priceAdjustments[i].basePrice;
                    rebate = rebate.add(basePrice.multiply(-1));
                }
            }

            //product level rebate
            var productLineItems = order.shipments[0].productLineItems;
            for (var j = 0; j < productLineItems.length; j++) {
                rebate = rebate.add(this.returnProductRebate(productLineItems[j]));
            }

            //shipping level rebate
            if (order.shipments[0].shippingTotalTax.value === 0 && shippingCost !== order.shipments[0].shippingTotalTax.value) {
                rebate = rebate.add(shippingCost.amount);
            }
        }

        return rebate;
    };

    /**
     * @description Add SourceId to request
     * @param {Object} object
     * @return {void}
     */
    this.addSourceIdToRequest = function(object) {
        var source_id = siteCustomPreferences.emarsysSourceID;
        if (source_id) {
            object.source_id = source_id;
        }
    };

    /**
     * @description format date
     * @param {String} date
     * @param {String} dateDelimeter
     * @param {String} timeDelimeter
     * @return {String}
     */
    this.formatDate = function (date, dateDelimeter, timeDelimeter) {
        dateDelimeter = dateDelimeter ? dateDelimeter : '';
        timeDelimeter = timeDelimeter ? timeDelimeter : '';

        var day = ( date.getDate() > 9 ? '' : '0' ) + date.getDate(),
            month = ( date.getMonth() + 1 > 9 ? '' : '0' ) + (date.getMonth() + 1),
            year = ( date.getFullYear() > 9 ? '' : '0' ) + date.getFullYear(),
            hours = ( date.getHours() > 9 ? '' : '0' ) + date.getHours(),
            minutes = ( date.getMinutes() > 9 ? '' : '0' ) + date.getMinutes(),
            seconds = ( date.getSeconds() > 9 ? '' : '0') + date.getSeconds();

        var firstHalf = [year, month, day].join(dateDelimeter),
            secondHalf = [hours, minutes, seconds].join(timeDelimeter);

        var dateGlue = '';
        if (dateDelimeter && dateDelimeter) {
            dateGlue = ' ';
        }

        return [firstHalf, secondHalf].join(dateGlue);

    };

}

module.exports = EmarsysHelper;
