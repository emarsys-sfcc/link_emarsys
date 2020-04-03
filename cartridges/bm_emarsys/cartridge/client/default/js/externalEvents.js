'use strict';

var showStatus = require('./components/showStatus');
var dialogPopup = require('./components/dialogPopup');

/**
 * Event name formatter for Emarsys side
 * @param {string} eventName - BM side event name
 * @return {string} - Emarsys side event name
 */
function eventNameFormatter(eventName) {
    var formattedName = '';
    formattedName = eventName.replace(/[-\s]+/g, '_');
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1_$2');
    return 'SFCC_' + formattedName.toUpperCase();
}

/**
 * 
 * @param {Object} $select - jQuery wrap for select which should be replaced
 * @param {string} eventType - neded to find appropriate select for replacement
 * @param {string} selectedName - value of option which should be selected after replacement
 */
function replaceEmarsysNameSelect($select, eventType, selectedName) {
    var $newSelect = $('.js-page-data-block .js-' + eventType + '-events .js-emarsys-name-select').clone();
    $newSelect.find('[value="' + selectedName + '"]').prop('selected', true);
    // remove option with title
    $newSelect.children().first().remove();
    $select.replaceWith($newSelect);
}

module.exports = {
    initDialogs: function () {
        dialogPopup.init({
            dialogSelector: '.js-page-data-block .js-create-event-dialog',
            openCallback: function () {
                var $dialog = this.dialog;
                var $sfccNamesSelect = $(
                    '.js-page-data-block .js-' + this.eventType + '-events .js-sfcc-name-select'
                ).clone();
                $dialog.find('.js-sfcc-name-select').replaceWith($sfccNamesSelect);

                var $emarsysNamesSelect = $(
                    '.js-page-data-block .js-' + this.eventType + '-events .js-emarsys-name-select'
                ).clone();
                $dialog.find('.js-emarsys-name-select').replaceWith($emarsysNamesSelect);

                dialogPopup.applyReplacementsList($dialog, this.replaceList);
                dialogPopup.open($dialog);
            },
            closeCallback: function () {
                var $dialog = this.dialog;
                dialogPopup.close($dialog);
                return {
                    emarsysId: $dialog.find('.js-emarsys-name-select option').filter(':selected').attr('data-emarsys-id'),
                    emarsysName: $dialog.find('.js-emarsys-name-select option').filter(':selected').attr('value'),
                    sfccName: $dialog.find('.js-sfcc-name-select option').filter(':selected').attr('value')
                };
            }
        });
    },
    initAddEventButtons: function () {
        $('.js-add-subscription-event-button').on('click', { addEvent: addEvent }, function (e) {
            e.data.addEvent('subscription');
        });
        $('.js-add-other-event-button').on('click', { addEvent: addEvent }, function (e) {
            e.data.addEvent('other');
        });
        async function addEvent (eventType) {
            var warning = '';

            var response = await dialogPopup.GetUserAction({
                dialogSelector: '.js-create-event-dialog',
                eventType: eventType,
                replaceList: [
                    {
                        selector: '.js-dialog-title',
                        text: $('.js-page-data-block .js-dialog-messages').data('add-' + eventType)
                    }
                ]
            });

            if (!response || response.status === 'cancel') { return; }

            var sfccName = response.data.sfccName;
            if (!sfccName) {
                // Warning message: Name of new event is not specified
                warning = $('.js-notification-messages').data('empty-name-error');
                showStatus('error', warning);
                return;
            }

            var requestData = {
                eventType: eventType,
                sfccName: sfccName
            };

            if (response.data.emarsysId && response.data.emarsysName) {
                requestData.emarsysId = response.data.emarsysId;
                requestData.emarsysName = response.data.emarsysName;
            } else {
                // try to find description with such name among all emarsys events descriptions
                var allEmarsysEvents = $('.js-all-emarsys-events').data('all-emarsys-events');
                var simularEventDescription = allEmarsysEvents.filter(function(event) {
                    return event.name === this.newEventName;
                }, { newEventName: eventNameFormatter(sfccName) })[0];

                if (simularEventDescription) {
                    requestData.emarsysId = simularEventDescription.id;
                    requestData.emarsysName = simularEventDescription.name;
                }
            }

            $.ajax({
                url: $('.js-page-links').data('create-event'),
                type: 'post',
                dataType: 'json',
                data: requestData,
                context: { eventType: eventType },
                success: function (data) {
                    var message = '';
                    if (data.response && data.response.status === 'OK') {
                        var event = data.response.result;
                        var eventType = this.eventType;

                        // refresh emarsys event name select elements
                        if (event.emarsysEventStatus === 'unique' || event.emarsysEventStatus === 'new') {
                            var $option = $('<option>', {
                                value: event.emarsysName,
                                'data-emarsys-id': event.emarsysId,
                                text: event.emarsysName
                            });
                            $('.js-page-data-block .js-' + eventType + '-events .js-emarsys-name-select').append($option);
                            $('.js-' + eventType + '-events-table .js-emarsys-name-select').each(function () {
                                var selectedName = $(this).children().first().attr('value');
                                replaceEmarsysNameSelect($(this), eventType, selectedName);
                            });
                        }

                        // modify Emarsys events list
                        if (event.emarsysEventStatus === 'new') {
                            var allEmarsysEvents = $('.js-all-emarsys-events').data('all-emarsys-events');
                            allEmarsysEvents.push({
                                id: event.emarsysId,
                                name: event.emarsysName
                            });
                        }

                        // remove sfcc event from not mapped events select
                        var $sfccNamesSelect = $('.js-page-data-block .js-' + eventType + '-events .js-sfcc-name-select');
                        $sfccNamesSelect.find('[value="' + event.sfccName + '"]').remove();

                        // prepare row for mapped event and place it to appropriate table
                        var $newRow = $('.js-page-data-block .js-external-events-row').clone();
                        $newRow.attr('data-emarsys-id', event.emarsysId);
                        $newRow.attr('data-emarsys-name', event.emarsysName);
                        $newRow.attr('data-sfcc-name', event.sfccName);
                        $newRow.find('.js-sfcc-name-span').text(event.sfccName);
                        var $selectToReplace = $newRow.find('.js-emarsys-name-select');
                        replaceEmarsysNameSelect($selectToReplace, eventType, event.emarsysName);
                        $('.js-' + eventType + '-events-table').append($newRow);

                        // Success message: Event ${event.sfccName} was successfully created
                        var $messagesBlock = $('.js-notification-messages');
                        message = $messagesBlock.data('success-event') +
                            event.sfccName + $messagesBlock.data('success-created');
                        showStatus('success', message);
                    } else if (data.response && data.response.status === 'ERROR') {
                        if (data.response.replyCode) {
                            // Request error: ${message} (reply code: ${code})
                            message = $('.js-notification-messages').data('request-error') +
                                data.response.replyMessage + ' (reply code: ' + data.response.replyCode + ')';
                        } else {
                            // Emarsys error: ${message} (response code: ${code})
                            message = $('.js-notification-messages').data('emarsys-error') +
                                data.response.responseMessage + ' (response code: ' + data.response.responseCode + ')';
                        }
                        showStatus('error', message);
                    }
                },
                error: function () {
                    // Server error
                    var message = $('.js-notification-messages').data('server-error');
                    showStatus('error', message);
                }
            });
        }
    },
    initEmarsysSelectors: function () {
        $('.js-subscription-events-table .js-emarsys-name-select').each(function () {
            var selectedName = $(this).children().first().attr('value');
            replaceEmarsysNameSelect($(this), 'subscription', selectedName);
        });
        $('.js-other-events-table .js-emarsys-name-select').each(function () {
            var selectedName = $(this).children().first().attr('value');
            replaceEmarsysNameSelect($(this), 'other', selectedName);
        });
    }
};
