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


var showStatus = __webpack_require__(1);


/**
 * @description create new select document element
 * @param {array} optionParams params for option
 * @param {string} divClasses slasses for div
 * @param {string} selectClasses  slasses for select element
 * @param {string} labelTypeClass type slass for label
 * @param {string} labelText label text
 * @returns {string} return new select element
 */
function createSelectElement(optionParams, divClasses, selectClasses, labelTypeClass, labelText) {
    var wrapperAboveSelects = '<div class="' + divClasses + '">';
    var select = '<select class="' + selectClasses + '">';
    var selectLabel = '<label class="js-error-message-' + labelTypeClass + ' hide-content">' + labelText + '</label>';
    var firstOptionValue = $('.js-page-params').attr('data-first-option');
    var options = '<option value="">' + firstOptionValue + '</option>';
    var selectEnd = '</select>';
    var divEnd = '</div>';

    optionParams.forEach(function (elem) {
        var value;

        if (Object.prototype.hasOwnProperty.call(elem, 'value')) {
            value = elem.value;
        } else if (Object.prototype.hasOwnProperty.call(elem, 'id')) {
            value = elem.id;
        } else {
            value = elem;
        }

        var showValue = (typeof elem) === 'object' ? elem.name : elem;

        options += '<option value="'
        + value
        + '">'
        + showValue
        + '</option>';
    });

    return wrapperAboveSelects
            + select
            + firstOptionValue
            + options
            + selectEnd
            + selectLabel
            + divEnd;
}
/**
 *@description create new document element
 *@returns {string} new element
 */
function createFieldElement() {
    var optionValues = JSON.parse($('.js-page-params').attr('data-general-attrs'));
    var selectPlaceholderValue = JSON.parse($('.js-page-params').attr('data-select-placeholder'));

    var fieldElement = '<div class="js-fild-configuration fild-configuration text-position">';
    var divEnd = '</div>';

    var classesForFieldDiv = 'selects-attr available-col';
    var classesForPlaceholderDiv = 'js-mappedFilds mappedFilds placeholder-col';

    var classesForFieldSelect = 'js-fields select-fields';
    var classesForPlaceholderSelect = 'js-placeholder select-fields';

    var selectErrorLabelText = $('.js-page-params').attr('data-error-select-field');
    var inputErrorLabelText = $('.js-page-params').attr('data-error-placeholder-message');

    var selectField = createSelectElement(optionValues,
                                            classesForFieldDiv,
                                            classesForFieldSelect,
                                            'select',
                                            selectErrorLabelText);
    var placeholderElement;

    if (selectPlaceholderValue) {
        placeholderElement = createSelectElement(selectPlaceholderValue,
                                                    classesForPlaceholderDiv,
                                                    classesForPlaceholderSelect,
                                                    'input',
                                                    selectErrorLabelText);
    } else {
        var mappedFild = '<div class="' + classesForPlaceholderDiv + '">';
        var input = '<input type="text" class="js-placeholder input-placeholder" value="" />';
        var inputLabel = '<label class="js-error-message-input hide-content">' + inputErrorLabelText + '</label>';

        placeholderElement = mappedFild + input + inputLabel + divEnd;
    }

    var removDiv = '<div class="remove-col">'
                    + '<input class="js-remove-check-box remove-check-box" type="checkbox" />'
                    + '</div>';

    return fieldElement
                + selectField
                + placeholderElement
                + removDiv
            + divEnd;
}

/**
 *@description checks whether the limit is exceeded fields
 *@param {Object} targetTeg target teg
 *@returns {boolean} returns a boolean value
 */
function checkMaxNumFields(targetTeg) {
    var lengthAttrs = JSON.parse($('.js-page-params').attr('data-general-attrs')).length;
    var lengthFields = $(targetTeg).find('.js-fild-configuration').length;

    return lengthAttrs > lengthFields;
}

/**
 * @description remove all fields with cheched true
 * @param {Object} target current event
 */
function removeFields(target) {
    $(target).find('.js-fild-configuration').each(function (i, field) {
        if ($(field).find('.js-remove-check-box').is(':checked')) {
            $(field).remove();
        }
    });
}

/**
 * @description create object request for ajax
 * @param {Object} target object target teg
 * @param {Object} event click event
 * @returns {Object} request for ajax
 */
function createRequest(target, event) {
    var request = {};
    var arrFields = [];
    var $tabContent = $(event.currentTarget).closest('.js-tabcontent');

    $(target).find('.js-fild-configuration').each(function (i, field) {
        if (!$(field).find('.js-remove-check-box').is(':checked')) {
            arrFields.push({
                field: $(field).find('.js-fields').val(),
                placeholder: $(field).find('.js-placeholder').val()
            });
        }
    });

    request.fields = arrFields;

    if ($tabContent.find('.js-additional-value').length) {
        request.additionalValue = $tabContent.find('.js-additional-value').val();
    }

    request.typeCustomObject = $tabContent.attr('id');

    return request;
}

/**
 * @description check data
 * @param {Object} target object target teg
 * @returns {Object} validation status
 */
function validationData(target) {
    var isValid = true;
    $(target).find('.js-fild-configuration').each(function (i, field) {
        var selectElem = $(field).find('.js-fields');
        var inputElem = $(field).find('.js-placeholder');
        var selectLabel = $(field).find('.js-error-message-select');
        var inputLabel = $(field).find('.js-error-message-input');

        if (!$(field).find('.js-remove-check-box').is(':checked')) {
            var isValidSelect = selectElem.val() === '';

            $(selectElem).toggleClass('select-input-error', isValidSelect);
            $(selectLabel).toggleClass('show-label', isValidSelect);

            $(inputElem).toggleClass('input-error', !inputElem.val());
            $(inputLabel).toggleClass('show-label', !inputElem.val());

            if (isValidSelect || !inputElem.val()) {
                isValid = false;
            }
        } else {
            $(selectElem).removeClass('select-input-error');
            $(selectLabel).removeClass('show-label');

            $(inputElem).removeClass('input-error');
            $(inputLabel).removeClass('show-label');
        }
    });

    return isValid;
}

module.exports = {
    addNewFields: function () {
        $(document).on('click', '.js-add-fields', function (event) {
            var target = $(event.currentTarget).closest('.js-tabcontent').find('.js-filds-configuration');

            if (checkMaxNumFields(target)) {
                $(target).append(createFieldElement());
                showStatus();
            } else {
                showStatus('error', $('.js-body-error-message').attr('data-max-fields'));
            }
        });
    },
    saveCustomObject: function () {
        $(document).on('click', '.js-apply-button', function (event) {
            var target = $(event.currentTarget).closest('.js-tabcontent').find('.js-filds-configuration');
            if (validationData(target)) {
                var request = createRequest(target, event);

                $.ajax({
                    url: $('.js-page-params').attr('data-controller-url'),
                    type: 'post',
                    dataType: 'json',
                    data: { data: JSON.stringify(request) },
                    success: function (data) {
                        if (data.success) {
                            removeFields(target);
                            showStatus('success');
                        } else {
                            showStatus('error', data.responseText);
                        }
                    },
                    error: function () {
                        showStatus('error', $('.js-body-error-message').attr('data-check-logs'));
                    }
                });
            }
        });
    }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @description show status for user
 * @param {string} typeNotify type notification
 * @param {string} responseText response message
 */
module.exports = function (typeNotify, responseText) {
    var notifications = $('.js-notification-message');

    if (typeNotify) {
        var notifyElement = $('.js-' + typeNotify + '-message');

        notifications.removeClass('js-d-flex');
        $(notifyElement).addClass('js-d-flex');

        if (responseText) {
            notifications.find('.js-body-' + typeNotify + '-message').text('');
            $(notifyElement).find('.js-body-' + typeNotify + '-message').text(responseText);
        }

        $('body,html').animate({ scrollTop: 0 }, 250);
    } else {
        notifications.removeClass('js-d-flex');
        notifications.find('.js-body-' + typeNotify + '-message').text('');
    }
};


/***/ })
/******/ ]);