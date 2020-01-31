'use strict';
/**
* @description The script for retrieving and storing Emarsys external events
* @output ErrorMsg : String
*/
var Status = require('dw/system/Status');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

var externalEvent = {
    logger: require('dw/system/Logger').getLogger('externalEvent', 'externalEvent'),
    execute: function () {
        try {
            this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/helpers/emarsysHelper'))();

            this.getExternalEvents();
        } catch (err) {
            this.logger.error('externalEvent: Error ' + err.message + '\n' + err.stack);

            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    },
    /**
     * @description retrieves and stores Emarsys external events
     * @returns {void} create custom object
     */
    getExternalEvents: function () {
        var UniqueObjectKey = 'StoredEvents';
        var externalEvents = this.emarsysHelper.triggerAPICall('event', null, 'GET');

        if (!empty(externalEvents) && externalEvents.status === 'OK') {
            var result = JSON.parse(externalEvents.object);

            result = JSON.stringify(result.data);
            var CheckObject = CustomObjectMgr.getCustomObject('EmarsysExternalEvents', UniqueObjectKey);

            if (CheckObject !== null) {
                CustomObjectMgr.remove(CheckObject);
            }
            var Store = CustomObjectMgr.createCustomObject('EmarsysExternalEvents', UniqueObjectKey);
            Store.custom.result = result;
            Store.custom.id = Store.custom.name = UniqueObjectKey;
        }
    }
};

exports.execute = externalEvent.execute.bind(externalEvent);
