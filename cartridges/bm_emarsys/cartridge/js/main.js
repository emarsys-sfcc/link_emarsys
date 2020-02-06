/**
 * Injecting new form elements
 */

var uniqueId = 1;
var insertedFieldsCount = 1;

if (totalFields && totalFields > 0) {
    insertedFieldsCount = totalFields;
    uniqueId = insertedFieldsCount;
}

window.Emarsys = {

    addField: function (args, selectOptions) {
        var selectBox;
        if (args && selectOptions) {
            uniqueId++;

            if (insertedFieldsCount < args.elementsCount) {
                insertedFieldsCount++;

                if (!args.thirdParam || !args.thirdParamValues) {
                    // Placeholder input
                    jQuery('<div/>')
                        .attr({
                            class: 'dynamic-field',
                            id: 'r',
                            'data-id': uniqueId
                        })
                        .appendTo(args.placeholderParent);
                    jQuery('<input/>')
                        .attr({
                            name: args.placeholder_name,
                            id: args.placeholder_name,
                            type: 'text',
                            class: 'inputfield_en w100',
                            placeholder: args.placeholder_placeholder
                        })
                        .appendTo('#r[data-id="' + uniqueId + '"]');
                    jQuery('<p/>')
                        .attr({ class: 'red error' })
                        .appendTo('#r[data-id="' + uniqueId + '"]');
                } else {
                    // Add select box instead of input field for initial db load
                    jQuery('<div/>')
                        .attr({
                            class: 'dynamic-field attribute',
                            id: 'r',
                            'data-id': uniqueId
                        })
                        .appendTo(args.placeholderParent);
                    selectBox = jQuery('<select/>')
                        .attr({
                            name: args.placeholder_name,
                            id: args.placeholder_name
                        })
                        .appendTo('#r[data-id="' + uniqueId + '"]');
                    selectBox.append(jQuery('<option/>').text(args.placeholder_placeholder));
                    jQuery(args.thirdParamValues.selectOptions).each(function (key, value) {
                        selectBox
                            .append(jQuery('<option/>')
                                .attr('value', value.value)
                                .text(value.name));
                    });
                    jQuery('<p/>')
                        .attr({ class: 'red error' })
                        .appendTo('#r[data-id="' + uniqueId + '"]');
                }

                // Select box
                jQuery('<div/>')
                    .attr({
                        class: 'dynamic-field',
                        id: 'l',
                        'data-id': uniqueId
                    })
                    .appendTo(args.mappedFieldParent);
                selectBox = jQuery('<select/>')
                    .attr({
                        name: args.mappedField_name,
                        id: args.mappedField_name
                    })
                    .appendTo('#l[data-id="' + uniqueId + '"]');
                selectBox.append(jQuery('<option/>').text(args.mappedField_placeholder));
                jQuery(selectOptions.selectOptions).each(function (key, value) {
                    if (!args.thirdParam || !args.thirdParamValues) {
                        selectBox
                            .append(jQuery('<option/>')
                                .attr('value', value.value)
                                .text(value.name));
                    } else {
                        selectBox
                            .append(jQuery('<option/>')
                                .attr('value', value.id)
                                .text(value.name));
                    }
                });

                // Field removal anchor
                jQuery('#l[data-id="' + uniqueId + '"]').append('&nbsp; ');
                jQuery('<a/>')
                    .attr({
                        href: '#',
                        id: 'removeField',
                        onClick: 'Emarsys.removeField(\'' + uniqueId + '\')'
                    })
                    .text(args.removeFields_placeholder)
                    .appendTo('#l[data-id="' + uniqueId + '"]');
                jQuery('<p/>')
                    .attr({ class: 'red error' })
                    .appendTo('#l[data-id="' + uniqueId + '"]');
            } else {
                jQuery('#oversizedCount').show().delay(5000).fadeOut();
            }
        }
    },

    removeField: function (id) {
        if (id) {
            jQuery('[data-id="' + id + '"]').remove();
            insertedFieldsCount--;
        }
    },

    add: function (args, options) {
        jQuery('#addField').on('click', function (event) {
            event.preventDefault();
            window.Emarsys.addField(args, options);
        });
    },

    addError: function (elementParent, errorText) {
        if (elementParent && errorText) {
            jQuery(elementParent).find('.error').text(errorText);
        }
    },

    addErrorClass: function (element, className) {
        if (element && className) {
            if (!jQuery(element).hasClass(className)) {
                jQuery(element).addClass(className);
            }
        }
    },

    removeError: function (element, parent, className) {
        if (element && parent && className) {
            jQuery(element).change(function () {
                jQuery(this).removeClass(className);
                jQuery(parent).find('.error').text('');
            });
        }
    },

    validate: function (form, args) {
        jQuery(form).submit(function () {
            jQuery('p.error').text('');

            var rows = jQuery('[data-id]');
            var fieldsValues = [];
            var evtParent;
            var evtValue;
            var placeholdersValues = [];
            var removedFields = [];
            var errors = 0;

            /**
             * @description validate mapped fields
             * @param {Array} row - array of id
             */
            function validateMappedFields(row) {
                var mappedField = jQuery(row).find('select');
                var mappedFieldValue = mappedField.find('option:selected').text();
                var checkbox = jQuery(row).find('input[name$=_removeField]').prop('checked');
                var mappedFieldParent = jQuery(row);
                if (!checkbox) {
                    if (!mappedFieldValue || mappedFieldValue.length <= 0 || mappedFieldValue.toString() === args.mappedField_placeholder) {
                        window.Emarsys.addError(mappedFieldParent, Resources.SELECT_ELEMENT_ERROR);
                        window.Emarsys.addErrorClass(mappedField, 'red');
                        window.Emarsys.removeError(mappedField, mappedFieldParent, 'red');
                        errors = 1;
                    } else if (fieldsValues.indexOf(mappedFieldValue) >= 0) {
                        window.Emarsys.addError(mappedFieldParent, Resources.SAME_ELEMENT_ERROR);
                        window.Emarsys.addErrorClass(mappedField, 'red');
                        window.Emarsys.removeError(mappedField, mappedFieldParent, 'red');
                        errors = 1;
                    } else {
                        fieldsValues.push(mappedFieldValue);
                        mappedField.removeClass('red');
                    }
                } else {
                    mappedField.removeClass('red');
                }
            }

            /**
             * @description validate Placeholders
             * @param {Array} row - array of id
             * @param {string} currentDataId - current data id
             */
            function validatePlaceholders(row, currentDataId) {
                var placeholder;
                var placeholderValue;
                if (args.thirdParam && args.thirdParam === 'ignore') {
                    placeholder = jQuery(row).find('select#' + args.placeholder_name);
                    placeholderValue = placeholder.find('option:selected').text();
                } else {
                    placeholder = jQuery(row).find('input');
                    placeholderValue = placeholder.val();
                }
                var placeholderParent = jQuery(row);

                // Validate placeholders
                if (removedFields.indexOf(currentDataId) < 0) {
                    var errorMsg;
                    if (!placeholderValue || placeholderValue.length <= 0) {
                        window.Emarsys.addError(placeholderParent, Resources.EMPTY_PLACEHOLDER_ERROR);
                        window.Emarsys.addErrorClass(placeholder, 'red');
                        window.Emarsys.removeError(placeholder, placeholderParent, 'red');
                        errors = 1;
                    } else if (args.thirdParam && args.thirdParam === 'ignore' && placeholderValue === args.placeholder_placeholder) {
                        errorMsg = window.Emarsys.selectErrorMessage(placeholderParent, Resources.EMPTY_PLACEHOLDER_ERROR, Resources.EMPTY_ATTRIBUTE_ERROR);
                        window.Emarsys.addError(placeholderParent, errorMsg);
                        window.Emarsys.addErrorClass(placeholder, 'red');
                        window.Emarsys.removeError(placeholder, placeholderParent, 'red');
                        errors = 1;
                    } else if (placeholdersValues.indexOf(placeholderValue) >= 0) {
                        errorMsg = window.Emarsys.selectErrorMessage(placeholderParent, Resources.SAME_PLACEHOLDER_ERROR, Resources.SAME_ATTRIBUTE_ERROR);
                        window.Emarsys.addError(placeholderParent, errorMsg);
                        window.Emarsys.addErrorClass(placeholder, 'red');
                        window.Emarsys.removeError(placeholder, placeholderParent, 'red');
                        errors = 1;
                    } else {
                        placeholdersValues.push(placeholderValue);
                        placeholder.removeClass('red');
                    }
                } else {
                    placeholder.removeClass('red');
                }
            }

            if (args.thirdParam && args.thirdParam === 'button') {
                evtParent = jQuery('input[name$=' + args.thirdParamName + ']:checked');
                evtValue = jQuery('input[name$=' + args.thirdParamName + ']:checked').val();
            } else {
                evtParent = jQuery('select[name$=_externalEvent]');
                evtValue = evtParent.find('option:selected').text();
            }

            // Validate dynamic fields
            for (var i = 0; i < rows.length; i++) {
                var currentDiv = jQuery(rows[i]).attr('id');
                var currentDataId = jQuery(rows[i]).attr('data-id');

                switch (currentDiv) {
                    case 'l':
                        var checkbox = jQuery(rows[i]).find('input[name$=_removeField]').prop('checked');

                        if (checkbox) {
                            removedFields.push(currentDataId);
                        }

                        // Validate mapped fields(elements)
                        validateMappedFields(rows[i]);

                        break;

                    case 'r':
                        validatePlaceholders(rows[i], currentDataId);
                        break;
                    default:
                }
            }

            // Validate external event
            if (!args.thirdParam && args.thirdParam !== 'ignore') {
                if ((!evtValue && evtValue.length <= 0) || (evtValue === args.externalEvents_placeholder)) {
                    window.Emarsys.addError(evtParent.parent(), Resources.SELECT_EVENT_ERROR);
                    window.Emarsys.addErrorClass(evtParent, 'red');
                    window.Emarsys.removeError(evtParent, evtParent.parent(), 'red');
                    errors = 1;
                }
            }

            if (errors > 0) {
                return false;
            }

            return true;
        });
    },

    selectErrorMessage: function (element, initialMsg, newMsg) {
        var message = initialMsg;
        if (element.hasClass('attribute')) {
            message = newMsg;
        }
        return message;
    },
    validateMappedFields: function (args) {
        jQuery('p.error').text('');

        var rows = jQuery('[data-id]');
        var fieldsValues = [];
        var placeholdersValues = [];
        var errors = 0;

        /**
         * @description validate fields
         * @param {Array} row - array of id
         */
        function validateFields(row) {
            var mappedFieldParent = jQuery(row);
            var mappedField = mappedFieldParent.find('select');
            var mappedFieldValue = mappedField.find('option:selected').text();
            var removeRow = mappedFieldParent.find('input[name$=_removeField]').prop('checked');

            if (!removeRow) {
                if (!mappedFieldValue || mappedFieldValue.length <= 0 || mappedFieldValue.toString() === args.mappedField_placeholder) {
                    window.Emarsys.addError(mappedFieldParent, Resources.SELECT_ELEMENT_ERROR);
                    window.Emarsys.addErrorClass(mappedField, 'red');
                    window.Emarsys.removeError(mappedField, mappedFieldParent, 'red');
                    errors = 1;
                } else if (fieldsValues.indexOf(mappedFieldValue) >= 0) {
                    window.Emarsys.addError(mappedFieldParent, Resources.SAME_ELEMENT_ERROR);
                    window.Emarsys.addErrorClass(mappedField, 'red');
                    window.Emarsys.removeError(mappedField, mappedFieldParent, 'red');
                    errors = 1;
                } else {
                    fieldsValues.push(mappedFieldValue);
                    mappedField.removeClass('red');
                }
            }
        }
        // Validate dynamic fields
        for (var i = 0; i < rows.length; i++) {
            var currentDiv = jQuery(rows[i]).attr('id');
            var removeRow;

            switch (currentDiv) {
                case 'l':
                    // Validate mapped fields(elements)
                    validateFields(rows[i]);
                    break;

                case 'r':
                    var placeholder = jQuery(rows[i]).find('input');
                    var placeholderValue = placeholder.val();
                    var placeholderParent = jQuery(rows[i]);
                    var id = placeholder.parent().data('id');
                    var filter = '[data-id=' + id + ']';
                    var leftbox = jQuery('div#l').filter(filter);

                    removeRow = jQuery(leftbox).find('input[name$=_removeField]').prop('checked');

                    // Validate placeholders
                    if (!removeRow) {
                        if (!placeholderValue || placeholderValue.length <= 0) {
                            window.Emarsys.addError(placeholderParent, Resources.EMPTY_PLACEHOLDER_ERROR);
                            window.Emarsys.addErrorClass(placeholder, 'red');
                            window.Emarsys.removeError(placeholder, placeholderParent, 'red');
                            errors = 1;
                        } else if (placeholdersValues.indexOf(placeholderValue) >= 0) {
                            window.Emarsys.addError(placeholderParent, Resources.SAME_PLACEHOLDER_ERROR);
                            window.Emarsys.addErrorClass(placeholder, 'red');
                            window.Emarsys.removeError(placeholder, placeholderParent, 'red');
                            errors = 1;
                        } else {
                            placeholdersValues.push(placeholderValue);
                            placeholder.removeClass('red');
                        }
                    }
                    break;
                default:
            }
        }
        return errors;
    },

    validateShipping: function (form, args) {
        jQuery(form).submit(function () {
            jQuery('p.error').text('');

            var evtParent = jQuery('select[name$=_externalEvent]');
            var evtValue = evtParent.find('option:selected').text();
            var errors = 0;

            errors = window.Emarsys.validateMappedFields(args);

            // Validate external event
            if ((!evtValue && evtValue.length <= 0) || (evtValue === args.externalEvents_placeholder)) {
                window.Emarsys.addError(evtParent.parent(), Resources.SELECT_EVENT_ERROR);
                window.Emarsys.addErrorClass(evtParent, 'red');
                window.Emarsys.removeError(evtParent, evtParent.parent(), 'red');
                errors = 1;
            }

            if (errors > 0) {
                return false;
            }

            return true;
        });
    },

    validateSubscription: function () {
        var strategy = jQuery('select.subscriptionStrategy');
        var optInEventContainer = strategy.closest('tr').siblings()[0];
        var star = jQuery(optInEventContainer).find('span.star');

        if (strategy.val() === '2') {
            star.removeClass('hide');
        }

        var form = jQuery(strategy).closest('form');
        var selectedOptInEvent = form.find('select.externalEventOptin');

        jQuery(strategy).on('change', function () {
            jQuery(star).toggleClass('hide');

            if (strategy.val() === '1') {
                selectedOptInEvent.removeClass('red');
                selectedOptInEvent.parent().find('.error').text('');
            }
        });

        jQuery(form).submit(function () {
            var result = false;
            if (strategy.val() && strategy.val() === '2') {
                if (selectedOptInEvent.val()) {
                    result = true;
                } else {
                    window.Emarsys.addErrorClass(selectedOptInEvent, 'red');
                    window.Emarsys.addError(selectedOptInEvent.parent(), Resources.SELECT_EVENT_ERROR);
                    window.Emarsys.removeError(selectedOptInEvent, selectedOptInEvent.parent(), 'red');
                }
            } else if (strategy.val() && strategy.val() === '1') {
                result = true;
            }

            return result;
        });
    },

    validateSmartInsight: function (form, args) {
        jQuery(form).submit(function () {
            jQuery('p.error').text('');
            var errors = 0;

            errors = window.Emarsys.validateMappedFields(args);

            if (errors > 0) {
                return false;
            }

            return true;
        });
    },

    validateSendEmailConfirmationEmail: function () {
        var form = jQuery('#sendOrderConfirmationEmail');
        var inputOrderNumber = form.find('input[type=text]');
        var errorContainer = form.find('.error');

        form.submit(function () {
            if (!inputOrderNumber.val()) {
                errorContainer.html(Resources.ORDER_NUMBER_ERROR);
                return false;
            }
            errorContainer.html('');
            return true;
        });
    }
};
