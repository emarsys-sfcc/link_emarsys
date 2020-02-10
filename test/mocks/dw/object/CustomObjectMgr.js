'use strict';
var objects = {
    'EmarsysPredictConfig': {
        'predictConfig': {
            custom: {
                mappedFields: JSON.stringify([{
                    'field':'product.ID','placeholder':'item'},
                    {'field':'product.availability','placeholder':'available'}
                    ,{'field':'product.name','placeholder':'title_multilang'},
                    {'field':'product.url','placeholder':'link_multilang'},
                    {'field':'product.image','placeholder':'image'},
                    {'field':'product.categories','placeholder':'category_multilang'},
                    {'field':'product.price','placeholder':'price_multilang'},
                    {'field':'product.brand','placeholder':'c_braand'}]),
                exportType: 'variations'
            }
        }
    },
    'EmarsysDBLoadConfig': {
        'dbloadConfig': {
            custom: {
                mappedFields: JSON.stringify([
                    {"field":"3","placeholder":"email"},
                    {"field":"2","placeholder":"lastName"},
                    {"field":"5","placeholder":"gender"},
                    {"field":"1","placeholder":"firstName"},
                    {"field":"45","placeholder":"countryCode"},
                    {"field":"98","placeholder":"custom.color"}
                ])
            }
        }
    },
    'EmarsysProfileFields': {
        'profileFields': {
            custom: {
                result: JSON.stringify([{"id":0,"name":"Interests","application_type":"interests","string_id":"interests"},
                {"id":9,"name":"Title","application_type":"singlechoice","string_id":"title"},
                {"id":1,"name":"First Name","application_type":"shorttext","string_id":"first_name"},
                {"id":2,"name":"Last Name","application_type":"shorttext","string_id":"last_name"},
                {"id":3,"name":"Email","application_type":"longtext","string_id":"email"},
                {"id":5,"name":"Gender","application_type":"singlechoice","string_id":"gender"},
                {"id":4,"name":"Date of Birth","application_type":"birthdate","string_id":"birth_date"},
                {"id":8,"name":"Education","application_type":"singlechoice","string_id":"education"},
                {"id":45,"name":"country Code","application_type":"singlechoice","string_id":"country_code"},
                {"id":98,"name":"custom","application_type":"singlechoice","string_id":"custom_n"}
            ])
            }
        }
    },
    'EmarsysExternalEvents': {
        'StoredEvents': {
            custom: {
                result: JSON.stringify([{"id":"5633","name":"single"},{"id":"5634","name":"double"},
                {"id":"5636","name":"single account"},{"id":"5637","name":"double account"},
                {"id":"5638","name":"single checkout"},{"id":"5639","name":"double checkout"}])  
            },
            name: 'StoredEvents'
        }
    },
    'EmarsysTransactionalEmailsConfig': {
        'shipping': {
            custom: {
                mappedFields: JSON.stringify([{"field":"product.price.currencyCode","placeholder":"currency"},
                {"field":"product.url","placeholder":"product_url"},
                {"field":"orderRebate.display","placeholder":"order_rebate"},
                {"field":"product.rebate","placeholder":"product_rebate"},
                {"field":"billingAddress.address1","placeholder":"b_address_1"},
                {"field":"shippingAddress.postalCode","placeholder":"b_address_zip"},
                {"field":"billingAddress.city","placeholder":"b_address_city"},
                {"field":"billingAddress.countryCode.displayValue","placeholder":"b_address_country"},
                {"field":"order.orderNo","placeholder":"order_number"},
                {"field":"order.creationDate","placeholder":"order_date"},
                {"field":"deliveryMethod.display","placeholder":"delivery_method"},
                {"field":"product.productName","placeholder":"product_name"},
                {"field":"product.quantityValue","placeholder":"quantity"},
                {"field":"product.adjustedPrice","placeholder":"price"}]),
                externalEvent: 5633
            }
        }
    },
    'EmarsysSmartInsightConfiguration': {
        'emarsysSmartInsight': {
            custom: {
                mappedFields: JSON.stringify([
                    {"field":"order","placeholder":"order"},
                    {"field":"date","placeholder":"timestamp"},
                    {"field":"item","placeholder":"item"},
                    {"field":"quantity","placeholder":"quantity"},
                    {"field":"price","placeholder":"price"},
                    {"field":"custom.product.name","placeholder":"prodname"},
                    {"field":"custom.lineItem.shipment.shippingAddress.address1","placeholder":"address"},
                    {"field":"custom.order.customerName","placeholder":"customername"},
                    {"field":"customer","placeholder":"customeremail"},
                    {"field":"masterid","placeholder":"masterproductid"},
                    {"field":"variantid","placeholder":"productid"}
                ])
            }
        }
    },
    'EmarsysNewsletterSubscription': {
        'checkout': {
            custom: {
                EmarsysSubscriptionType: 'checkout',
                optInStrategy: '1',
                optInExternalEvent: '5633',
                optInExternalEventAfterConfirmation: '5633'
            }
        },
        'footer': {
            custom: {
                EmarsysSubscriptionType: 'footer',
                optInStrategy: '1',
                optInExternalEvent: '11884',
                optInExternalEventAfterConfirmation: '11884'
            }
        },
        'account': {
            custom: {
                EmarsysSubscriptionType: 'account',
                optInStrategy: '2',
                optInExternalEvent: '11883',
                optInExternalEventAfterConfirmation: '11884'
            }
        }
    }
};
class CustomObjectMgr {
    createCustomObject(type, key) {
        var newObject = objects[type][key];

        return newObject;
    }

    getCustomObject(type, key) {
        var creator = objects[type];
        var newObject = creator[key];
        return newObject;
    }

    queryCustomObjects(type) {
        var index = 0;
        return {
            items: items,
            iterator: function () {
                return {
                    items: items,
                    hasNext: function () {
                        return index < items.length;
                    },
                    next: function () {
                        return items[index++];
                    }
                };
            },
            toArray: function () {
                return items;
            },
            next: function () {
                return items[index++];
            },
            hasNext: function () {
                return index < items.length;
            }
        };
    }

    remove() {
        return true;
    }
}

module.exports = new CustomObjectMgr;
