'use strict';

/**
 * Shows dialog popup
 * @param {Object} $dialog - jQuery wrap for dialog node
 */
function open($dialog) {
    $dialog.parent().removeClass('hidden-block');
}

/**
 * Hide dialog popup
 * @param {Object} $dialog - jQuery wrap for dialog node
 */
function close($dialog) {
    $dialog.parent().addClass('hidden-block');
}

/**
 * Make initial text replacements in specified block
 * @param {Object} initParams - parameters for dialog initialization
 */
function init(initParams) {
    var $dialog = null;
    var params = initParams;
    if (params.dialog) {
        if (params.dialog instanceof jQuery) {
            $dialog = params.dialog;
        } else if (params.dialog instanceof HTMLElement) {
            $dialog = params.dialog = $(params.dialog);
        }
    } else if (params.dialogSelector) {
        $dialog = params.dialog = $(params.dialogSelector).first().clone();
    }

    if (!$dialog.length) { return; }

    if (params.replaceList) {
        params.replaceList.forEach(function (replaceObj) {
            this.find(replaceObj.selector).text(replaceObj.text);
        }, $dialog);
    }

    var $wrapper = $('<div>', { class: 'js-dialog-wrapper dialog-wrapper hidden-block' });
    $wrapper.append($dialog);

    $wrapper.data(params);

    var $container = $('.js-dialog-container').first();
    if (!$container.length) {
        $container = $('<div>', { class: 'js-dialog-container dialog-container' });
        $(document.body).append($container);
    }

    $container.append($wrapper);
}

/**
 * Extends arguments object with initialization parameters
 * @param {Object} $dialog - jQuery wrap for dialog node
 * @param {Object} args - open dialog arguments object
 * @return {Object} - extended arguments object
 */
function extendArguments($dialog, args) {
    var $wrapper = $dialog.parent();
    var initParams = $wrapper.data();
    var extendedArgs = Object.create(initParams);

    $.extend(extendedArgs, args);
    return extendedArgs;
}

/**
 * Closes dialog and resolves promise
 * @param {Object} event - event details object
 */
function closeDialogClickHandler(event) {
    var data = event.data;
    var args = data.arguments;
    var response = null;
    if (!args.closeCallback) {
        close(args.dialog);
    } else {
        response = args.closeCallback(data);
    }

    data.promiseResolve({
        status: data.status,
        data: response
    });
}

/**
 * Closes dialog when button pressed
 * @param {Object} data - parameters neded to close dialog
 */
function closeDialogPressHandler(data) {
    var args = data.arguments;
    var response = null;
    if (!args.closeCallback) {
        close(args.dialog);
    } else {
        response = args.closeCallback(data);
    }

    data.promiseResolve({
        status: data.status,
        data: response
    });
}

/**
 * Provides keyboard shortcuts
 * @param {Object} event - event details object
 */
function keyboardShortcuts(event) {
    var data = event.data;
    if (event.code === 'Enter') {
        closeDialogPressHandler({
            status: 'confirm',
            promiseResolve: data.promiseResolve,
            arguments: data.arguments
        });
    } else if (event.code === 'Escape') {
        closeDialogPressHandler({
            status: 'cancel',
            promiseResolve: data.promiseResolve,
            arguments: data.arguments
        });
    }
    event.preventDefault();
}

/**
 * Set or refresh events handlers
 * @param {Object} $dialog - jQuery wrap for dialog node
 * @param {Object} basicContextObj - object with common data for event handlers
 */
function setEventsHandlers($dialog, basicContextObj) {
    var $wrapper = $dialog.parent();

    // remove dialog handlers
    $dialog.off('click');
    $wrapper.off('click');
    $(document.body).off('keyup', keyboardShortcuts);

    // confirm button handler
    $dialog.on('click', '.js-confirm-button',
        $.extend({}, basicContextObj, { status: 'confirm' }),
        closeDialogClickHandler);

    // cancel buttons handler
    $dialog.on('click', '.js-cancel-button,.js-close-button',
        $.extend({}, basicContextObj, { status: 'cancel' }),
        closeDialogClickHandler);

    // make close button from wrapper
    $wrapper.on('click',
        $.extend({}, basicContextObj, { status: 'cancel' }),
        closeDialogClickHandler);
    $dialog.on('click', function (event) {
        event.stopPropagation();
    });

    // keyboard shortcuts handler
    $(document.body).on('keyup',
        $.extend({}, basicContextObj),
        keyboardShortcuts);
}

/**
 * Show dialog popup and prepare promise to get user input
 * @param {Object} args - dialog popup arguments
 * @return {Object} - promise to get user action (on resolve)
 */
function GetUserAction(args) {
    var $container = $('.js-dialog-container').first();
    var $dialog = null;
    if (args.dialog) {
        if (args.dialog instanceof jQuery) {
            $dialog = args.dialog;
        } else if (args.dialog instanceof HTMLElement) {
            $dialog = $(args.dialog);
        }
    } else if (args.dialogSelector) {
        $dialog = $container.find(args.dialogSelector);
    }
    if (!$dialog.length) { return; }

    // extend arguments with init parameters object
    var extendedArgs = extendArguments($dialog, args);

    var userActionPromise = new Promise(function (resolve) {

        var basicContextObj = {
            arguments: extendedArgs,
            promiseResolve: resolve
        };

        // open dialog
        if (!extendedArgs.openCallback) {
            open($dialog);
        } else {
            extendedArgs.openCallback(basicContextObj);
        }

        setEventsHandlers($dialog, basicContextObj);
    });

    return userActionPromise;
}

/**
 * Process text replacements
 * @param {Object} $dialog - jQuery wrap for dialog node
 * @param {Array} replaceList - text replacements list
 */
function applyReplacementsList($dialog, replaceList) {
    if (!replaceList) { return; }
    replaceList.forEach(function (replaceObj) {
        this.find(replaceObj.selector).text(replaceObj.text);
    }, $dialog);
}

module.exports = {
    init: init,
    GetUserAction: GetUserAction,
    open: open,
    close: close,
    applyReplacementsList: applyReplacementsList
};
