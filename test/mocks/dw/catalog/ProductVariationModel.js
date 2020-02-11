'use strict';

class ProductVariationModel {
    getProductVariationAttribute(id) {
        return id;
    }
    getSelectedValue(attribute) {
        return {
            displayValue:attribute
        };

    }
}

module.exports = ProductVariationModel;