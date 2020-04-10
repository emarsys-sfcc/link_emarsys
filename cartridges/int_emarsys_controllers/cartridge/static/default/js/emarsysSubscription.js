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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/***/ (function(module, exports) {

function createSubscription() {
    $(document).ready(function() {
        /**
         * @description Handles the result of the subscription call
         * @param {Object} response, result of the subscription call
         */
        function handleSubscriptionResponse(response) {
            if (response && response.success) {
                switch (response.accountStatus) {
                    case "accountexists":
                        window.location.href = EmarsysUrls.alreadyRegisteredPage;
                        break;
                    case "accountcreated":
                        window.location.href = EmarsysUrls.thankYouPage;
                        break;
                    case "submitted":
                        window.location.href = EmarsysUrls.dataSubmittedPage;
                        break;
                    case "error":
                        window.location.href = EmarsysUrls.errorPage;
                        break;
                    case "disabled":
                        window.location.href = EmarsysUrls.emarsysDisabledPage;
                        break;
                    case "signup":
                        window.location.href = EmarsysUrls.emarsysSignup;
                        break;
                    default:
                        break;
                }
            } else {
                window.location.href = EmarsysUrls.errorPage;
            }
        }

        /**
         * @description Does a subscription call
         * @param {Strin} email , subscriber email
         */
        function sendSubscriptionRequest(email) {
            $.ajax({
                type: 'POST',
                url: EmarsysUrls.footerSubscription,
                data: {emailAddress: email, formatajax: true},
                success: function (response) {
                    handleSubscriptionResponse(response);
                },
                error: function() {
                    window.location.href = EmarsysUrls.errorPage;
                }
            });
        }

        $('#emarsys-newsletter-subscription button').on('click', function (e) {
            e.preventDefault();
            var email = $('#emarsys-newsletter-subscription #email-alert-address').val();
            if (email.length > 0) {
                sendSubscriptionRequest(email);
            } else {
                window.location.href = EmarsysUrls.emarsysSignup;
            }
        });

        //Add a checkbox for privacy policy if Emarsys is enabled
        if(window.EmarsysPreferences.enabled &&  window.EmarsysPreferences.enabled !== false) {
            var elementBefore = '<input type="checkbox" class="input-checkbox privacy-checkbox" value="false" /> ' + window.EmarsysResources.privacyBeforeLink + ' ',
                elementAfter  = ' ' + window.EmarsysResources.privacyAfterLink;

            $('a.privacy-policy').parent().prepend(elementBefore).append(elementAfter);

            $("#dwfrm_billing").on("submit", function(event) {
                if ($(this).find('input.privacy-checkbox').prop("checked") === false) {
                    event.preventDefault();
                    $('input.privacy-checkbox').parent().addClass("error-privacy");
                } else {
                    $('input.privacy-checkbox').parent().removeClass("error-privacy");
                }
            });
            $('#account_subscribe').on('click', function(event) {
                event.preventDefault();
                $('.email-signup-wrapper').slideDown(800);
            });
        }
    });
}

module.exports = createSubscription;

/***/ })

/******/ });