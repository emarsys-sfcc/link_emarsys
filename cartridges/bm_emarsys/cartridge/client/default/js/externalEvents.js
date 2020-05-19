'use strict';

var showStatus = require('./components/showStatus');
var dialogPopup = require('./components/dialogPopup');

/**
 * Event name formatter for Emarsys side
 * @param {string} sfccName - BM side event name
 * @return {string} - Emarsys side event name
 */
function eventNameFormatter(sfccName) {
    var formattedName = '';
    formattedName = sfccName.replace(/[-\s]+/g, '_');
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1_$2');
    return 'SFCC_' + formattedName.toUpperCase();
}

/**
 * Prepare select with allowed emarsys events options for replacement
 * @param {string} eventType - neded to find appropriate select for replacement
 * @param {string} currentName - name of Emarsys event, that should be in the first option
 * @return {Object} - select with Emarsys name options
 */
function prepareEmarsysNameSelect(eventType, currentName) {
    var $select = $('.js-page-data-block .js-' + eventType + '-events .js-emarsys-name-select').clone();
    if (currentName != null) {
        // put option with currently selected name on the first position
        var currentOption = $select.find('[value="' + currentName + '"]');
        $select.prepend(currentOption);
        // mark it as selected
        currentOption.prop('selected', true);
    }
    return $select;
}

/**
 * Request error handler
 */
function requestErrorHandler() {
    // Server error
    var message = $('.js-notification-messages').data('server-error');
    showStatus('error', message);
    setTimeout(function () { showStatus(); }, 5000);
}

/**
 * Refresh option of created Emarsys event
 * @param {Object} event - all data about mapping of the event
 * @param {string} eventType - neded to separate work with different types of events
 */
function refreshCreatedEventOption(event, eventType) {
    // refresh id-attribute of created Emarsys event
    var $emarsysSelect = $('.js-page-data-block .js-' + eventType + '-events .js-emarsys-name-select');
    var $option = $emarsysSelect.children('[value="' + event.emarsysName + '"]');
    $option.attr('data-emarsys-id', event.emarsysId);

    // refresh active select nodes
    var $activeSelectNodes = $('.js-' + eventType + '-events-table .js-emarsys-name-select').filter(':not(:disabled)');
    $activeSelectNodes.each(function () {
        var appropreateName = $(this).children(':first').attr('value');
        var $emarsysSelectTemplate = prepareEmarsysNameSelect(eventType, appropreateName);
        // Show cancel option
        var cancelOptionTitle = $('.js-emarsys-select-data').data('option-cancel-title');
        $emarsysSelectTemplate.children(':first').text(cancelOptionTitle);
        // Choose currently selected option
        $emarsysSelectTemplate.val($(this).val());
        $(this).replaceWith($emarsysSelectTemplate);
    });
}

module.exports = {
    processEmptyTableNotifications: function () {
        /**
         * Shows messige if table with events of specified type is empty
         * @param {string} eventType - neded to separate work with different types of events
         */
        function checkTableContent(eventType) {
            var tableRowsCounter = $('.js-' + eventType + '-events-table .js-external-events-row').length;
            if (tableRowsCounter === 0) {
                $('.js-' + eventType + '-events-table .js-empty-table-notification').removeClass('hide-content');
            }
        }

        checkTableContent('subscription');
        checkTableContent('other');
    },
    initAddEventDialog: function () {
        /**
         * Custom function to open add event dialog
         */
        function openAddEventDialog() {
            var $dialog = this.dialog;

            // refresh sfcc names select
            var $sfccSelectTemplate = $(
                '.js-' + this.eventType + '-events .js-sfcc-name-select'
            ).clone();
            var $sfccSelect = $dialog.find('.js-sfcc-name-select');
            $sfccSelect.children(':first').insertBefore($sfccSelectTemplate.children(':first'));
            $sfccSelectTemplate.children(':first').prop('selected', true);
            $sfccSelect.replaceWith($sfccSelectTemplate);

            var $emarsysSelect = $dialog.find('.js-emarsys-name-select');
            if (this.eventType === 'subscription') {
                // refresh Emarsys names select
                var $emarsysSelectTemplate = prepareEmarsysNameSelect(this.eventType);
                $emarsysSelectTemplate.prepend($emarsysSelect.children(':first'));
                $emarsysSelectTemplate.children('[value=""]').remove();
                $emarsysSelectTemplate.children(':first').prop('selected', true);
                $emarsysSelect.replaceWith($emarsysSelectTemplate);
            } else {
                // hide Emarsys names select
                $dialog.find('.js-emarsys-name-select').addClass('hide-content');
            }

            dialogPopup.applyReplacementsList($dialog, this.replaceList);
            dialogPopup.open($dialog);
        }
        /**
         * Custom function to close add event dialog
         * @return {Object} - user response data to add new event
         */
        function closeAddEventDialog() {
            var $dialog = this.dialog;
            dialogPopup.close($dialog);

            // hide old notifications
            showStatus();

            // get and return user response data
            var $emarsysOption = $dialog.find('.js-emarsys-name-select option').filter(':selected');
            var $sfccOption = $dialog.find('.js-sfcc-name-select option').filter(':selected');
            return {
                eventType: this.eventType,
                event: {
                    emarsysId: $emarsysOption.attr('data-emarsys-id'),
                    emarsysName: $emarsysOption.attr('value'),
                    sfccName: $sfccOption.attr('value')
                }
            };
        }

        // init add event button
        dialogPopup.init({
            dialogSelector: '.js-page-data-block .js-add-event-dialog',
            openCallback: openAddEventDialog,
            closeCallback: closeAddEventDialog
        });
    },
    initAddEventButtons: function () {
        /**
         * Check if there are sfcc events allowed to map (listed in source field but not mapped)
         * @param {string} eventType - neded to separate work with different types of events
         * @return {boolean} - flag for open dialog permission
         */
        function checkSfccNameOptions(eventType) {
            var openDialogPermission = true;
            var $sfccNamesSelect = $('.js-page-data-block .js-' + eventType + '-events .js-sfcc-name-select');
            if ($sfccNamesSelect.find('option[value]').length === 0) {
                // Warning message: There are no more sfcc events, allowed to map ...
                var warning = $('.js-notification-messages').data('empty-source-error');
                showStatus('error', warning);
                setTimeout(function () { showStatus(); }, 10000);
                openDialogPermission = false;
            }
            return openDialogPermission;
        }
        /**
         * Prepare row with mapped event data
         * @param {string} eventType - neded to separate work with different types of events
         * @param {Object} event - all data about mapping of the event
         * @return {Object} - row node to put into events table
         */
        function prepareRow(eventType, event) {
            var $row = $('.js-page-data-block .js-external-events-row').clone();
            // fill row data attributes
            $row.attr('data-emarsys-id', event.emarsysId);
            $row.attr('data-emarsys-name', event.emarsysName);
            $row.attr('data-sfcc-name', event.sfccName);
            // set event sfcc name
            $row.find('.js-sfcc-name-span').text(event.sfccName);
            // replace empty emarsys name select
            var $emarsysSelect = $row.find('.js-emarsys-name-select');
            var $emarsysSelectTemplate = prepareEmarsysNameSelect(eventType, event.emarsysName);
            $emarsysSelectTemplate.prop('disabled', true);
            // only "approrpeate" and "none" options allowed for other events mapping
            if (eventType === 'other') {
                $emarsysSelectTemplate.children(
                    ':not([value="' + eventNameFormatter(event.sfccName) + '"],[value=""])'
                ).remove();
            }
            $emarsysSelect.replaceWith($emarsysSelectTemplate);
            return $row;
        }
        /**
         * Add event request success handler
         * @param {Object} data - response data
         */
        function addEventSuccessHandler(data) {
            if (data.response && data.response.status === 'OK') {
                var event = data.response.result;
                var message = '';
                var eventType = this.eventType;

                if (event.emarsysStatus === 'new' && eventType !== 'other') {
                    refreshCreatedEventOption(event, eventType);
                }

                // remove sfcc event from select with not mapped sfcc event options
                var $sfccNamesSelect = $('.js-page-data-block .js-' + eventType + '-events .js-sfcc-name-select');
                $sfccNamesSelect.children('[value="' + event.sfccName + '"]').remove();

                // hide block with empty table message (if exist)
                $('.js-' + eventType + '-events-table .js-empty-table-notification').addClass('hide-content');

                // prepare row with mapped event data
                var $newRow = prepareRow(eventType, event);
                // put the row into appropriate table
                $newRow.insertBefore($('.js-' + eventType + '-events-table .js-empty-table-notification'));

                // Success message: Event ${event.sfccName} was successfully created
                var $messagesBlock = $('.js-notification-messages');
                message = $messagesBlock.data('success-event') +
                    event.sfccName + $messagesBlock.data('success-created');
                showStatus('success', message);
            } else if (data.response && data.response.status === 'ERROR') {
                // Emarsys error
                showStatus('error', data.response.message);
            }
        }
        /**
         * Add event button click handler
         * @param {Object} result - user response data from dialog
         */
        function userResponseHandler(result) {
            if (!result || result.status === 'cancel') { return; }

            var warning = '';
            var eventType = result.data.eventType;
            var event = result.data.event;

            if (!event.sfccName) {
                // Warning message: Name of new event is not specified
                warning = $('.js-notification-messages').data('empty-name-error');
                showStatus('error', warning);
                setTimeout(function () { showStatus(); }, 5000);
                return;
            }

            if (event.emarsysName === 'appropriate') {
                event.emarsysName = eventNameFormatter(event.sfccName);
                var $emarsysNamesSelect = $('.js-page-data-block .js-' + eventType + '-events .js-emarsys-name-select');
                var $appropriateOption = $emarsysNamesSelect.children('[value="' + event.emarsysName + '"]');
                event.emarsysId = $appropriateOption.attr('data-emarsys-id');
            }

            var requestData = {
                type: eventType,
                sfccName: event.sfccName,
                emarsysId: event.emarsysId,
                emarsysName: event.emarsysName
            };

            $.ajax({
                url: $('.js-page-links').data('add-event'),
                type: 'post',
                dataType: 'json',
                data: requestData,
                context: { eventType: eventType },
                success: addEventSuccessHandler,
                error: requestErrorHandler
            });
        }

        $('.js-add-subscription-event-button').on('click', {
            dialogPopup: dialogPopup,
            userResponseHandler: userResponseHandler,
            checkSfccNameOptions: checkSfccNameOptions
        }, function (e) {
            var context = e.data;
            var openDialogPermission = context.checkSfccNameOptions('subscription');
            if (!openDialogPermission) { return; }

            dialogPopup.getUserResponse({
                dialogSelector: '.js-add-event-dialog',
                eventType: 'subscription',
                replaceList: [
                    {
                        selector: '.js-dialog-title',
                        text: $('.js-dialog-messages').data('add-subscription')
                    }
                ]
            }).then(
                context.userResponseHandler
            );
        });
        $('.js-add-other-event-button').on('click', {
            dialogPopup: dialogPopup,
            userResponseHandler: userResponseHandler,
            checkSfccNameOptions: checkSfccNameOptions
        }, function (e) {
            var context = e.data;
            var openDialogPermission = context.checkSfccNameOptions('other');
            if (!openDialogPermission) { return; }

            dialogPopup.getUserResponse({
                dialogSelector: '.js-add-event-dialog',
                eventType: 'other',
                replaceList: [
                    {
                        selector: '.js-dialog-title',
                        text: $('.js-dialog-messages').data('add-other')
                    }
                ]
            }).then(
                context.userResponseHandler
            );
        });
    },
    initChangeButtons: function () {
        /**
         * Change event button click handler
         * @param {string} eventType - neded to separate work with different types of events
         * @param {Object} $updateButton - change/apply button node
         */
        function changeEvent(eventType, $updateButton) {
            // switch the button to apply mode
            var applyLabel = $('.js-button-labels').data('apply');
            $updateButton.text(applyLabel);
            $updateButton.removeClass('js-change-button');
            $updateButton.addClass('js-apply-changes-button');

            // prepare actual Emarsys name select
            var $row = $updateButton.closest('.js-external-events-row');
            var $emarsysNameSelect = $row.find('.js-emarsys-name-select');
            var selectedName = $emarsysNameSelect.children(':selected').attr('value');
            var $emarsysSelectTemplate = prepareEmarsysNameSelect(eventType, selectedName);
            // only "approrpeate" and "none" options allowed for other events mapping
            if (eventType === 'other') {
                var appropreateName = eventNameFormatter($row.attr('data-sfcc-name'));
                $emarsysSelectTemplate.children(
                    ':not([value="' + appropreateName + '"],[value=""])'
                ).remove();
            }

            // Show cancel option
            var cancelOptionTitle = $('.js-emarsys-select-data').data('option-cancel-title');
            $emarsysSelectTemplate.children(':first').text(cancelOptionTitle);

            // replace select
            $emarsysNameSelect.replaceWith($emarsysSelectTemplate);

            // hide old notifications
            showStatus();
        }

        $('.js-subscription-events-table').on(
            'click', '.js-change-button', { changeEvent: changeEvent }, function (e) {
                e.data.changeEvent('subscription', $(e.target));
            }
        );
        $('.js-other-events-table').on(
            'click', '.js-change-button', { changeEvent: changeEvent }, function (e) {
                e.data.changeEvent('other', $(e.target));
            }
        );
    },
    initApplyButton: function () {
        /**
         * Should be colled when event change process is finished
         */
        function finishChangeMode() {
            // switch the button to change mode
            var changeLabel = $('.js-button-labels').data('change');
            this.updateButton.text(changeLabel);
            this.updateButton.removeClass('js-apply-changes-button');
            this.updateButton.addClass('js-change-button');

            // Replace cancel option
            var $emarsysSelect = this.row.find('.js-emarsys-name-select');
            var $cancelOption = $emarsysSelect.children(':first');
            var $cancelOptionTemplate = $(
                '.js-page-data-block .js-' + this.eventType + '-events .js-emarsys-name-select'
            ).children(
                'option[value="' + this.prevEmarsysName + '"]'
            ).clone();

            var currentEmarsysName = $emarsysSelect.children(':selected').attr('value');
            $cancelOption.replaceWith($cancelOptionTemplate);
            $emarsysSelect.val(currentEmarsysName);

            // lock select
            $emarsysSelect.prop('disabled', true);

            // unlock update button
            this.updateButton.prop('disabled', false);
        }
        /**
         * Update request success handler
         * @param {Object} data - response data
         */
        function updateSuccessHandler(data) {
            if (data.response && data.response.status === 'OK') {
                var event = data.response.result;
                var message = '';

                if (event.emarsysStatus === 'new' && this.eventType !== 'other') {
                    refreshCreatedEventOption(event, this.eventType);
                }

                // choose appropriate option (if user changes it in meantime)
                var $emarsysNamesSelect = this.row.find('.js-emarsys-name-select');
                $emarsysNamesSelect.children('[value="' + event.emarsysName + '"]').prop('selected', true);

                // change data properties
                this.row.attr('data-emarsys-id', event.emarsysId);
                this.row.attr('data-emarsys-name', event.emarsysName);

                // Success message: Event ${event.sfccName} was successfully changed
                var $messagesBlock = $('.js-notification-messages');
                message = $messagesBlock.data('success-event') +
                    event.sfccName + $messagesBlock.data('success-changed');
                showStatus('success', message);
            } else if (data.response && data.response.status === 'ERROR') {
                // Emarsys error
                showStatus('error', data.response.message);
            }
        }
        /**
         * Apply changes button click handler
         * @param {string} eventType - neded to separate work with different types of events
         * @param {Object} $updateButton - change/apply button node
         */
        function applyChanges(eventType, $updateButton) {
            var $row = $updateButton.closest('.js-external-events-row');
            var $chosenOption = $row.find('.js-emarsys-name-select').find('option').filter(':selected');

            var emarsysName = $chosenOption.attr('value');
            var prevEmarsysName = $row.attr('data-emarsys-name');

            var context = {
                eventType: eventType,
                row: $row,
                updateButton: $updateButton,
                prevEmarsysName: prevEmarsysName
            };

            // cancel option is chosen
            if (emarsysName === prevEmarsysName) {
                finishChangeMode.call(context);
                return;
            }

            var requestData = {
                type: eventType,
                sfccName: $row.attr('data-sfcc-name'),
                emarsysId: $chosenOption.attr('data-emarsys-id'),
                emarsysName: emarsysName
            };

            $updateButton.prop('disabled', true);

            $.ajax({
                url: $('.js-page-links').data('update-event'),
                type: 'post',
                dataType: 'json',
                data: requestData,
                context: context,
                success: updateSuccessHandler,
                error: requestErrorHandler,
                complete: finishChangeMode
            });
        }

        $('.js-subscription-events-table').on(
            'click', '.js-apply-changes-button', { applyChanges: applyChanges }, function (e) {
                e.data.applyChanges('subscription', $(e.target));
            }
        );
        $('.js-other-events-table').on(
            'click', '.js-apply-changes-button', { applyChanges: applyChanges }, function (e) {
                e.data.applyChanges('other', $(e.target));
            }
        );
    },
    initRequestBodyExampleDialog: function () {
        /**
         * Custom function to open request body example dialog
         */
        function openExampleDialog() {
            var $dialog = this.dialog;

            var supportedEventsData = $('.js-page-data-block .js-supported-events-data').data('additional-data');
            var additionalEventData = supportedEventsData[this.eventType][this.sfccEventName];
            var exampleObject = additionalEventData && additionalEventData.requestBodyExample;

            var message = '';
            if (exampleObject) {
                message = JSON.stringify(exampleObject, null, 2);
            } else {
                message = $('.js-page-data-block .js-dialog-messages').data('unsupported-event');
            }
            $dialog.find('.js-content-block pre').text(message);

            dialogPopup.applyReplacementsList($dialog, this.replaceList);
            dialogPopup.open($dialog);
        }

        // init add event button
        dialogPopup.init({
            dialogSelector: '.js-page-data-block .js-request-body-example',
            openCallback: openExampleDialog
        });
    },
    initRequestBodyExampleButton: function () {
        /**
         * Click handler for request body example button
         * @param {string} eventType - neded to separate work with different types of events
         * @param {Object} $exampleButton - example button node
         */
        function showRequestBodyExample(eventType, $exampleButton) {
            var $row = $exampleButton.closest('.js-external-events-row');
            var sfccEventName = $row.attr('data-sfcc-name');

            dialogPopup.getUserResponse({
                dialogSelector: '.js-request-body-example',
                eventType: eventType,
                sfccEventName: sfccEventName,
                replaceList: [
                    {
                        selector: '.js-dialog-title',
                        text: $('.js-dialog-messages').data('show-example') + ' "' + sfccEventName + '"'
                    }
                ]
            });

            // hide old notifications
            showStatus();
        }

        $('.js-subscription-events-table .js-example-button').on('click', {
            showRequestBodyExample: showRequestBodyExample
        }, function (e) {
            e.data.showRequestBodyExample('subscription', $(e.target));
        });
        $('.js-other-events-table .js-example-button').on('click', {
            showRequestBodyExample: showRequestBodyExample
        }, function (e) {
            e.data.showRequestBodyExample('other', $(e.target));
        });
    },
    initTriggerEventDialog: function () {
        /**
         * Function to prepare html structure for the trigger event form
         * @param {Object} fieldsDescription - fields description for trigger event form
         * @return {jQuery} - trigger event form node
         */
        function prepareTriggerEventForm(fieldsDescription) {
            return $('.js-page-data-block .trigger-event-form').clone();
        }
        /**
         * Custom function to open trigger event dialog
         */
        function openTriggerDialog() {
            var $dialog = this.dialog;

            var form = prepareTriggerEventForm();
            var contentBlock = $dialog.find('.dialog-content-block');
            contentBlock.children().remove();
            contentBlock.append(form);

            dialogPopup.applyReplacementsList($dialog, this.replaceList);
            dialogPopup.open($dialog);
        }
        /**
         * Custom function to close trigger event dialog
         * @return {Object} - user response data
         */
        function closeTriggerDialog() {
            var $dialog = this.dialog;
            dialogPopup.close($dialog);

            // hide old notifications
            showStatus();

            var triggerEventForm = $dialog.find('.js-content-block form');

            return {
                eventType: this.eventType,
                serializedForm: triggerEventForm.serializeArray(),
                event: this.event
            };
        }

        // init add event button
        dialogPopup.init({
            dialogSelector: '.js-page-data-block .js-trigger-event',
            openCallback: openTriggerDialog,
            closeCallback: closeTriggerDialog
        });
    },
    initTriggerEventButton: function () {
        /**
         * Trigger event request success handler
         * @param {Object} data - response data
         */
        function triggerEventSuccessHandler(data) {
            if (data.response && data.response.status === 'OK') {
                showStatus('success', 'The event was successfully triggered');
            } else if (data.response && data.response.status === 'ERROR') {
                // Emarsys error
                showStatus('error', data.response.message);
            }
        }
        /**
         * Send request to trigger event
         * @param {Object} result - user response data from dialog
         */
        function sendRequest(result) {
            if (!result || result.status === 'cancel') { return; }

            var warning = '';
            var eventType = result.data.eventType;
            var serializedForm = result.data.serializedForm;
            var event = result.data.event;

            // if (!event.sfccName) {
            //     // Warning message: Name of new event is not specified
            //     warning = $('.js-notification-messages').data('empty-name-error');
            //     showStatus('error', warning);
            //     setTimeout(function () { showStatus(); }, 5000);
            //     return;
            // }

            var requestData = {
                type: eventType,
                sfccName: event.sfccName,
                emarsysId: event.emarsysId,
                emarsysName: event.emarsysName,
                serializedForm: serializedForm
            };

            $.ajax({
                url: $('.js-page-links').data('add-event'),
                type: 'post',
                dataType: 'json',
                data: requestData,
                context: { eventType: eventType },
                success: triggerEventSuccessHandler,
                error: requestErrorHandler
            });
        }
        /**
         * Click handler for trigger event button
         * @param {string} eventType - neded to separate work with different types of events
         * @param {Object} $triggerButton - trigger event button node
         */
        function triggerEvent(eventType, $triggerButton) {
            var $row = $triggerButton.closest('.js-external-events-row');
            var event = {
                emarsysId: $row.attr('data-emarsys-id'),
                emarsysName: $row.attr('data-emarsys-name'),
                sfccName: $row.attr('data-sfcc-name')
            };

            var supportedEventsData = $('.js-page-data-block .js-supported-events-data').data('additional-data');
            var additionalEventData = supportedEventsData[eventType][event.sfccName];
            var exampleObject = additionalEventData && additionalEventData.requestBodyExample;
            if (!exampleObject) { return; }

            dialogPopup.getUserResponse({
                dialogSelector: '.js-trigger-event',
                eventType: eventType,
                event: event,
                replaceList: [
                    {
                        selector: '.js-dialog-title',
                        text: $('.js-dialog-messages').data('trigger-event') + ' "' + event.sfccName + '"'
                    }
                ]
            }).then(
                sendRequest
            );

            // hide old notifications
            showStatus();
        }

        $('.js-subscription-events-table .js-trigger-button').on('click', {
            triggerEvent: triggerEvent
        }, function (e) {
            e.data.triggerEvent('subscription', $(e.target));
        });
        $('.js-other-events-table .js-trigger-button').on('click', {
            triggerEvent: triggerEvent
        }, function (e) {
            e.data.triggerEvent('other', $(e.target));
        });
    }
};
