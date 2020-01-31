'use strict';

var File = require('dw/io/File');
var emarsysHelper = new (require('int_emarsys/cartridge/scripts/util/EmarsysHelper'))();
var io = require("dw/io");
var Site = require("dw/system/Site");
var Currency = require("dw/util/Currency");
var Variant = require("dw/catalog/Variant");
var ArrayList = require("dw/util/ArrayList");

var siteCustomPreferences = Site.current.preferences.custom;


/**
 * @description Check and set locale
 * @param {String} siteLocale
 * @param {String} defaultLocale
 * @return {void}
 */
function _setLocale(siteLocale, defaultLocale) {
    siteLocale === 'default' ? request.setLocale(defaultLocale) : request.setLocale(siteLocale);
}

/**
 * @description Get URL image
 * @param {Object} productInfo - Object to add data to
 * @param {Object} product - Specific product
 * @return {void}
 */
function _handleProductImage(productInfo, product) {
    var viewType = siteCustomPreferences.emarsysProductImageSize,
        productImage = product.getImage(viewType),
        parsedImage = productImage !== null ? productImage.getAbsURL().toString() : "";

    productInfo.push(parsedImage);
}

/**
 * @description Get URL product
 * @param {Object} productInfo - Object to add data to
 * @param {Object} siteLocales
 * @param {String} defaultLocale
 * @param {Object} currenciesMap
 * @param {Object} product - Specific product
 * @return {void}
 */
function _handleProductURL(productInfo, siteLocales, defaultLocale, currenciesMap, product) {
    var localeIndex = 0;
    for (; localeIndex < siteLocales.length; localeIndex++) {
        if (currenciesMap[siteLocales[localeIndex]]) {
            _setLocale(siteLocales[localeIndex], defaultLocale);
            var url = emarsysHelper.returnProductURL(product);
            productInfo.push(url.toString());
        }
    }
    request.setLocale(defaultLocale);
}

/**
 * @description Set currency on the site
 * @param {Object} productInfo - Object to add data to
 * @param {Object} siteLocales
 * @param {Object} currenciesMap
 * @param {Object} product
 * @return {void}
 */
function _handleProductPrice(productInfo, siteLocales, currenciesMap, product) {
    var localeIndex = 0,
        defaultSiteCurrency = session.currency.currencyCode,
        currency;
    for (; localeIndex < siteLocales.length; localeIndex++) {
        if (currenciesMap[siteLocales[localeIndex]]) {
            currency = Currency.getCurrency(currenciesMap[siteLocales[localeIndex]]);
            session.setCurrency(currency);

            var productPrice = product.getPriceModel().getMaxPrice();

            if (product instanceof Variant) {
                productPrice = product.getPriceModel().getPrice();
            }

            var priceValue = productPrice.getValueOrNull();

            if (!empty(priceValue)) {
                productInfo.push(priceValue.toFixed(2));
            } else {
                productInfo.push("");
            }

            currency = Currency.getCurrency(defaultSiteCurrency);
            session.setCurrency(currency);
        }
    }
}

/**
 * @description Get product name
 * @param {Object} productInfo - Object to add data to
 * @param {Object} siteLocales
 * @param {String} defaultLocale
 * @param {Object} currenciesMap
 * @param {Object} product
 * @return {void}
 */
function _handleProductName(productInfo, siteLocales, defaultLocale, currenciesMap, product) {
    var localeIndex = 0;
    for (; localeIndex < siteLocales.length; localeIndex++) {
        if (currenciesMap[siteLocales[localeIndex]]) {
            _setLocale(siteLocales[localeIndex], defaultLocale);
            productInfo.push(product.getName());
        }
    }
    request.setLocale(defaultLocale);
}

/**
 * @description Get product category
 * @param {Object} productInfo - Object to add data to
 * @param {Object} siteLocales
 * @param {String} defaultLocale
 * @param {Object} currenciesMap
 * @param {Object} product
 * @return {void}
 */
function _handleProductCategory(productInfo, siteLocales, defaultLocale, currenciesMap, product) {
    var localeIndex = 0;
    for (; localeIndex < siteLocales.length; localeIndex++) {
        if (currenciesMap[siteLocales[localeIndex]]) {
            _setLocale(siteLocales[localeIndex], defaultLocale);
            var categories = product.getOnlineCategories().toArray(),
                path = new ArrayList(),
                pathsArray = new ArrayList();

            if (product instanceof Variant) {
                categories = product.masterProduct.getOnlineCategories().toArray();
            }
            var category;

            if (categories.length > 0) {
                for (var i = 0; i < categories.length; i++) {
                    category = categories[i];
                    path = new ArrayList();
                    // find the path for each of the categories
                    while (category.parent !== null) {
                        if (category.online) {
                            path.addAt(0, category.displayName);
                        }
                        category = category.parent;
                    }
                    pathsArray.push(path.join(" > "));
                }
                // push all the categories separated by |
                productInfo.push(pathsArray.join("|"));
            } else {
                productInfo.push('');
            }
        }
    }
    request.setLocale(defaultLocale);
}

/**
 * @description Get the display value of variation attribute
 * @param {*} productInfo - Object to add data to
 * @param {*} mappedField
 * @param {*} variationAttribute
 * @param {*} product
 * @return {void}
 */
function _handleProductCustomAttributes(productInfo, mappedField, variationAttribute, product) {
    var productVariationAttributes = Site.getCurrent().getCustomPreferenceValue("emarsysPredictVariationAttributes");
   // find the variation attributes from emarsysPredictVariationAttributes site preference
    if (productVariationAttributes.indexOf(mappedField.field) !== -1) {
        var selectedAttribute = product.variationModel.getProductVariationAttribute(variationAttribute);

        if (!empty(selectedAttribute)) {
            var selectedValue = product.variationModel.getSelectedValue(selectedAttribute);
            var variantValue = selectedValue.displayValue || selectedValue.value;
            productInfo.push(variantValue);
        } else {
            productInfo.push('');
        }
    }
}

/**
 * @description Auxiliary function to getProductInfo
 * @param {Object} splitField - Object to retrieve data from
 * @param {Object} productInfo - Object to add data to
 * @param {Object} siteLocales - Object site Locales
 * @param {String} defaultLocale - default locale
 * @param {Object} currenciesMap - set of currency
 * @param {Object} mappedField - Object to retrieve data from
 * @param {Object} product - specific product
 * @return {void}
 */
function _getProductInfo(splitField, productInfo, siteLocales, defaultLocale, currenciesMap, mappedField, product) {
    if (splitField[1] === "url") {
        _handleProductURL.call(this, productInfo, siteLocales, defaultLocale, currenciesMap, product);
    } else if (splitField[1] === "image") {
        _handleProductImage(productInfo, product);
    } else if (splitField[1] === "price") {
        _handleProductPrice(productInfo, siteLocales, currenciesMap, product);
    } else if (splitField[1] === "availability") {
        productInfo.push(product.getAvailabilityModel().isOrderable());
    } else if (splitField[1] === "name") {
        _handleProductName(productInfo, siteLocales, defaultLocale, currenciesMap, product);
    } else if (splitField[1] === "categories") {
        _handleProductCategory(productInfo, siteLocales, defaultLocale, currenciesMap, product);
    // get the user friendly name of variation attribute
    } else if (product instanceof Variant && splitField[1] === "custom") {
        _handleProductCustomAttributes(productInfo, mappedField, splitField[2], product);
    } else {
        productInfo.push(emarsysHelper.getObjectAttr({product: product}, splitField));
    }
}



function jobHelper() {
      /**
     * Loads files from a given directory that match the given pattern
     * Non recursive.
     * Throws Exception if directory does not exist.
     *
     * @param {String} directoryPath (Absolute) Directory path to load from
     * @param {String} filePattern RegEx pattern that the filenames must match
     *
     * @returns {Array}
     */
    this.getFiles = function (directoryPath, filePattern) {
        var directory = new File(directoryPath);

        // We only want existing directories
        if (!directory.isDirectory()) {
            throw new Error('Source folder does not exist.');
        }

        var files = directory.list();

        return files.filter(function (filePath) {
            return empty(filePattern) || (!empty(filePattern) && filePath.match(filePattern) !== null);
        }).map(function (filePath) {
            return directoryPath + File.SEPARATOR + filePath;
        });
    };

    /**
     * Loads files from a given directory that match the given pattern
     * recursive.
     * Throws Exception if directory does not exist.
     *
     * @param {String} directoryPath (Absolute) Directory path to load from
     * @param {String} filePattern RegEx pattern that the filenames must match
     *
     * @returns {Array}
     */
    this.getFileListRecursive = function (sourceDirectory, filePattern, sourceFolder, targetFolder, recursive, doOverwrite, getTargetFile) {

        var regexp;
        if (!empty(filePattern)) {
            regexp = new RegExp(filePattern);
        }

        var filteredList = [];
        var getFileList = function getFileList(currentFile) {
            var targetFile = null;
            if (getTargetFile) {
                targetFile = new File(currentFile.getFullPath().replace(sourceFolder, targetFolder));
                if (targetFile.exists() && !doOverwrite) {
                    throw 'OverWriteWithoutPermission';
                }
            } else {
                // remove source and IMPEX folder path :
                targetFile = currentFile.getFullPath().replace(sourceFolder, '').replace(File.IMPEX, '');
                if (!currentFile.isDirectory()) {
                    // this is to avoid targetfileName + targetfileName from upload behavior
                    targetFile = targetFile.replace(currentFile.getName(), '');
                }
                // add targetFolder
                targetFile = targetFolder + (targetFile.charAt(0).equals(File.SEPARATOR) ? targetFile.substring(1) : targetFile);
            }
            if (currentFile.isDirectory() && recursive) {
                filteredList.push({
                    name: currentFile.getName(),
                    sourceFile: currentFile,
                    targetFile: targetFile,
                    createDirectory: true
                });
                currentFile.listFiles(getFileList);
            } else if (empty(filePattern) || (!empty(filePattern) && regexp.test(currentFile.getName()))) {
                filteredList.push({
                    name: currentFile.getName(),
                    sourceFile: currentFile,
                    targetFile: targetFile,
                    createDirectory: false
                });
                return true;
            }
            return false;
        };
        if (sourceDirectory instanceof File) {
            sourceDirectory.listFiles(getFileList);
        } else {
            sourceDirectory = new File(sourceDirectory);
            if (!sourceDirectory.isDirectory()) {
                throw new Error('Source folder does not exist.');
            }
            sourceDirectory.listFiles(getFileList);
        }

        return filteredList;
    };

    /**
     * Returns the file name of the file from the file path.
     *
     * @param {String} filePath A file path to extract the file name from, e.g. '/directory/file.xml'.
     *
     * @returns {String} The file name e.g. 'file.xml'.
     */
    this.getFileName = function (filePath) {
        var filePathParts = filePath.split(File.SEPARATOR);
        return filePathParts[filePathParts.length - 1];
    };

    /**
     * Create the given {directoryPath} recursively if it does not exists
     *
     * @param {String} directoryPath
     *
     * @returns {dw/io/File} The created directory instance
     */
    this.createDirectory = function (directoryPath) {
        var directory = new File(directoryPath);

        if (!directory.exists() && !directory.mkdirs()) {
            throw new Error('Cannot create the directory ' + directoryPath);
        }

        return directory;
    };

    /**
     * @description  Create SmartInsightFeed file csv
     * @return {io.File}
     */
    this.createSmartInsightExportFile = function (destinationFolder) {
        var siteID = Site.current.getID(),
            exportFolderPath = io.File.IMPEX + "/src/" + destinationFolder,
            exportFolder = new io.File(exportFolderPath);

        if (!exportFolder.exists()) {
            exportFolder.mkdirs();
        }

        return new io.File(exportFolder.fullPath + io.File.SEPARATOR + "sales_items_" + siteID + ".csv");
    };

    /**
     * @description  Create SmartInsightFeed name csv
     * @return {String}
     */
    this.createSmartInsightFeedName = function () {
        var siteID = Site.current.ID;

        var name = "sales_items_" + siteID + ".csv";
        return name;
    };

    /**
     * @description Replaces symbols
     * @param {Object} field
     * @return {String}
     */
    this.escapeCSVField = function (field) {
        field = field ? field.toString().replace(/"/g, '\"\"') : "";
        if (field.search(',') !== -1) {
            field = "\"" + field + "\"";
        }
        return field;
    };

    /**
     * @description Returns attributes from product object
     * @param {Object} productLineItem
     * @param {Object} attributes
     * @returns {*}
     */
    this.getProductValues = function (productLineItem, attributes) {

        try {
            var product = productLineItem.product;
        } catch(e) {
            return '';
        }

        switch (attributes[0]) {
            /*
             Link to product in storefront
             */
            case "url":
                return emarsysHelper.returnProductURL(productLineItem).toString();
            /*
             Product main image url
             */
            case "image":
                var viewType = siteCustomPreferences.emarsysProductImageSize;
                return productLineItem.product.getImage(viewType) !== null ? productLineItem.product.getImage(viewType).getAbsURL().toString() : "";
            /*
             Product rebate
             */
            case "rebate":
                return emarsysHelper.returnProductRebate(productLineItem);
            /*
             Other product attributes
             */
            default:
                return emarsysHelper.getObjectAttr(product, attributes);
        }
    };

    /**
     * @description Returns attributes from ProductLineItem and GiftCertificateLineItem object types
     * @param {Object} lineItem  - object of type ProductLineItem or GiftCertificateLineItem
     * @param {Object} attributes
     * @returns {*}
     */
    this.getLineItemValues = function(lineItem, attributes) {
        return emarsysHelper.getObjectAttr(lineItem, attributes);
    };

    /**
     * @description Returns attributes from order object
     * @param {Object} order
     * @param {Object} attributes
     * @returns {*}
     */
    this.getOrderValues = function (order, attributes) {
        switch (attributes[0]) {
            /*
            Order rebate
            Separate case for 'orderRebate' element only.
             */
            case 'orderRebate':
                return emarsysHelper.returnOrderRebate(order);
            /*
            List of payment methods
             */
            case 'paymentMethods':
                return this.returnOrderPaymentMethods(order);
            default:
                return emarsysHelper.getObjectAttr(order, attributes);
        }
    };

    /**
     * @description Returns string with order payment methods
     * @param {Object} order
     * @returns {string}
     */
    this.returnOrderPaymentMethods = function (order) {
        var paymentMethods = [];
        order.getPaymentInstruments().toArray().forEach(function(paymentInstrument) {
            paymentMethods.push(paymentInstrument.getPaymentMethod());
        });
        return paymentMethods.join('+');
    };

    /**
     * @description Get product info
     * @param {Object} mappedFields - Object to retrieve data from
     * @param {Object} product - specific product
     * @param {Object} dataObject - Object to add data to
     * @param {Object} siteLocales - Object site Locales
     * @param {String} defaultLocale - default locale
     * @param {Object} currenciesMap - set of currency
     * @return {Object} data object
     */
    this.getProductInfo = function (mappedFields, product, dataObject, siteLocales, defaultLocale, currenciesMap) {
        if (mappedFields && product && dataObject) {
            var productInfo = [];

            for (var i = 0; i < mappedFields.length; i++) {
                var splitField = mappedFields[i].field.split(".");

                switch (splitField[0]) {
                    case 'product':
                        _getProductInfo.call(this, splitField, productInfo, siteLocales, defaultLocale, currenciesMap, mappedFields[i], product);
                    break;
                }
            }

            dataObject.push(productInfo);
        }
    };
}

module.exports = new jobHelper();
