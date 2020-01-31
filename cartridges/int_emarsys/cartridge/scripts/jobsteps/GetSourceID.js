'use strict';
/**
 * @description to create a source, get its id and store it in custom sute pref
 * @output ErrorMsg : String
 */
var Site = require('dw/system/Site');
var Status = require('dw/system/Status');

var SourceID = {
    /** @type {dw.system.Log} */
    logger: require('dw/system/Logger').getLogger('SourceID', 'SourceID'),
    execute: function() {
        try {
           this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/util/EmarsysHelper'))();

           this.getSourceId();
        } catch (err) {
            this.logger.error('SourceID: Error ' + err.message + '\n' + err.stack);

            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    },
    /**
     * @description creates a source, gets id source and store it in custom preference
     * @returns {void} set custom preference value
     */
    getSourceId: function() {
        var sourceName = Site.current.preferences.custom.emarsysSourceName;
        var createSource;
        var sourceId;
        var request = {
            'name': sourceName
        };
        var getAllSources = this.emarsysHelper.triggerAPICall('source', {}, 'GET');

        if (getAllSources.status === 'OK') {
            // if source exists the id will be returned
            sourceId = this.emarsysHelper.getSourceId(getAllSources, sourceName);
        }

        if (!sourceId) {
            // create a source
            createSource = this.emarsysHelper.triggerAPICall('source/create', request, 'POST');

            if (createSource.status === 'OK') {
                // if source exists the id will be returned
                getAllSources = this.emarsysHelper.triggerAPICall('source', {}, 'GET');

                if (getAllSources.status === 'OK') {
                    // if source exists the id will be returned
                    sourceId = this.emarsysHelper.getSourceId(getAllSources, sourceName);
                }
            }
        }

        Site.current.setCustomPreferenceValue('emarsysSourceID', sourceId);

     }

};

exports.execute = SourceID.execute.bind(SourceID);
