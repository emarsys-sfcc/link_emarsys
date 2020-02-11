/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.ScarabQueue = window.ScarabQueue || [];

/**
 * @description create new array for save analytics data
 */
function initScarabQueue() {
    ((function (subdomain, id) {
        if (document.getElementById(id)) {
            return;
        }
        var js = document.createElement('script');
        js.id = id;
        js.src = subdomain + '.scarabresearch.com/js/' + emarsysAnalytics.predictMerchantID + '/scarab-v2.js';
        var fs = document.getElementsByTagName('script')[0];
        fs.parentNode.insertBefore(js, fs);
    })(document.location.protocol === 'https:' ? 'https://recommender' : 'http://cdn', 'scarab-js-api'));
}

/**
 * @description Push object recommendations in ScarabQueue object
 * @param {Object} object is analytic data
 */
function setRecommendations(object) {
    if (Object.hasOwnProperty.call(object, 'logic')) {
        window.ScarabQueue.push(['recommend', {
            logic: object.logic,
            containerId: 'predict-recs'
        }]);
    }
}

/**
 * @description an overlay is applied to the button to send analytics
 */
function initQuickViewAnalytics() {
    var emarsysAnalytics = window.analyticsData && window.analyticsData.emarsysAnalytics;

    if (emarsysAnalytics && emarsysAnalytics.trackingCode) {
        $('.product-tile').on('click', '.quickview', function () {
            window.ScarabQueue.push(['view', $(this).closest('.product-tile').data('itemid')]);
            window.ScarabQueue.push(['go']);
        });
    }
}

/**
 * @description call function
 * @param {string} nameFunc  name function
 * @param {Object} customerData customer data
 */
function addData(nameFunc, customerData) {
    var emarsysAnalytics = window.analyticsData && window.analyticsData.emarsysAnalytics;

    switch (nameFunc) {
        case 'product':
        case 'orderconfirmation':
        case 'search':
            window.ScarabQueue.push([emarsysAnalytics.nameTracking, emarsysAnalytics.trackingData]);
            setRecommendations(emarsysAnalytics);
            break;
        case 'availabilityZone':
            window.ScarabQueue.push(['availabilityZone', emarsysAnalytics.locale]);
            break;
        case 'basket':
            window.ScarabQueue.push(['cart', emarsysAnalytics.currentBasket]);
            break;
        case 'cart':
        case 'storefront':
            setRecommendations(emarsysAnalytics);
            break;
        case 'customerEmail':
            window.ScarabQueue.push(['setEmail', customerData.CustomerEmail]);
            break;
        case 'customerId':
            window.ScarabQueue.push(['setCustomerId', customerData.CustomerNo]);
            break;
        case 'guestEmail':
            window.ScarabQueue.push(['setEmail', customerData.GuestEmail]);
            break;
        default:
            break;
    }
}
/**
 * @description Create analytics data
 */
function addPageData() {
    var emarsysAnalytics = window.analyticsData && window.analyticsData.emarsysAnalytics;
    if (emarsysAnalytics && emarsysAnalytics.trackingCode) {
        var customerData = emarsysAnalytics.customerData;
        addData('availabilityZone');
        addData('basket');

        if (customerData.IsCustomer) {
            if (Object.hasOwnProperty.call(customerData, 'CustomerEmail')) {
                addData('customerEmail', customerData);
            } else {
                addData('customerId', customerData);
            }
        } else if (customerData.emarsysAnalytics === 'orderconfirmation') {
            addData('guestEmail', customerData);
        }
        addData(window.analyticsData.typePage);

        window.ScarabQueue.push(['go']); // Submit all information available on page load
    }
}

/**
 * @description Insertion full informations analytics in ScarabQueue object
 * @param {Object} emarsysAnalytics page context global object, created in .isml
 */


module.exports = {
    init: function () {
        if (window.analyticsData && window.analyticsData.emarsysAnalytics.trackingCode) {
            initScarabQueue();
            addPageData();
            initQuickViewAnalytics();
        }
    }
};


/***/ })
/******/ ]);