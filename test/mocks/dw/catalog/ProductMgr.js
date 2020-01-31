'use strict';

var SeekableIterator = require('./../util/SeekableIterator');

var products = [
    {
        ID: '1234567',
        name: 'test product1',
        variant: true,
        price: 45,
        availabilityModel: {
            isOrderable: {
                return: true,
                type: 'function'
            },
            inventoryRecord: {
                ATS: {
                    value: 100
                }
            }
        },
        minOrderQuantity: {
            value: 2
        },
        master: false,
        image: {
            small: {
                URL: 'testUrlSmall'
            },
            medium: {
                URL: 'testUrlMedium'
            },
            large: {
                URL: 'testUrlLarge'
            }
        }
    },
    {
        ID: '7654321',
        name: 'test product2',
        variant: true,
        price: 15,
        availabilityModel: {
            isOrderable: {
                return: true,
                type: 'function'
            },
            inventoryRecord: {
                ATS: {
                    value: 100
                }
            }
        },
        minOrderQuantity: {
            value: 2
        },
        master: false,
        image: {
            small: {
                URL: 'testUrlSmall'
            },
            medium: {
                URL: 'testUrlMedium'
            },
            large: {
                URL: 'testUrlLarge'
            }
        }
    }
];

class ProductMgr {
    queryProductsInCatalog(catalog) {
        return new SeekableIterator(products);
    }
}

module.exports = new ProductMgr;
