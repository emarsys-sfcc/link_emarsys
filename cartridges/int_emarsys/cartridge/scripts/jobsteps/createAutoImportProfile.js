'use strict';
/**
* Create AutoImport Profile using the API
*/
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Status = require('dw/system/Status');
var currentSite = require('dw/system/Site').getCurrent();

var CreateAutoImportProfile = {
    logger: require('dw/system/Logger').getLogger('createAutoImportProfile', 'createAutoImportProfile'),
    /* exported execute */
    execute: function (params) {
        this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/helpers/emarsysHelper'))();

        if (params.isDisabled) {
            return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
        }

        var FieldValueMapping = currentSite.getCustomPreferenceValue('emarsysSingleChoiceValueMapping');
        var FileName = currentSite.getCustomPreferenceValue('emarsysFileNameString');

        var Separator = params.csvFileColumnsDelimiter;
        var keyField = params.keyField ? params.keyField : 'E-Mail';
        var request = {};
        var response;

        FieldValueMapping = JSON.parse(FieldValueMapping);

        try {
            var FieldConfigurationCO = CustomObjectMgr.getCustomObject('EmarsysDBLoadConfig', 'dbloadConfig');
            var FieldConfiguration = JSON.parse(FieldConfigurationCO.custom.mappedFields);
            var ProfileFieldsCO = CustomObjectMgr.getCustomObject('EmarsysProfileFields', 'profileFields');
            var ProfileFields = JSON.parse(ProfileFieldsCO.custom.result);

            var language = currentSite.getCustomPreferenceValue('emarsysLanguage');
            var asList = currentSite.getCustomPreferenceValue('emarsysAsList');
            var newsletter = currentSite.getCustomPreferenceValue('emarsysNewsletter');
            var skipEmpty = currentSite.getCustomPreferenceValue('emarsysSkipEmpty');
            var updateOnly = currentSite.getCustomPreferenceValue('emarsysUpdateOnly');
            var enabled = currentSite.getCustomPreferenceValue('emarsysAutoImportEnabled');
            var overwrite = currentSite.getCustomPreferenceValue('emarsysOverwriteContacts');

            request.separator = Separator;
            request.text_separator = '"';
            request.date_format = 'YYYY-MM-DD';
            request.fieldnames = true;
            request.language = language;
            request.as_list = asList;
            request.userlist_name = 'auto-import-' + FileName;
            request.newsletter = newsletter;
            request.skip_empty = skipEmpty;
            request.update_only = updateOnly;
            request.file_pattern = FileName + '.csv';
            request.enabled = enabled;
            request.overwrite = overwrite;
            request.fields = [];

            var index = 0;

            Object.keys(FieldConfiguration).forEach(function (keyConfigField) {
                var configField = FieldConfiguration[keyConfigField];

                Object.keys(ProfileFields).forEach(function (keyProfileField) {
                    var profileField = ProfileFields[keyProfileField];
                    if (+configField.field === +profileField.id) {
                        var values = [];
                        if (profileField.id in FieldValueMapping) {
                            values = FieldValueMapping[profileField.id];
                        }
                        var newObject = {};
                        newObject.id = index;
                        newObject.field_name = profileField.name;
                        newObject.is_key = (profileField.name === keyField);
                        newObject.element_name = profileField.name;
                        newObject.element_id = profileField.id;
                        newObject.values = values;

                        request.fields.push(newObject);
                    }
                }, this);
                index++;
            }, this);

            // add all opt-in values to the request
            var optInValues = FieldValueMapping['31'];
            request.fields.push({
                id: index,
                field_name: 'Opt-In',
                is_key: false,
                element_name: 'Opt-In',
                element_id: 31,
                values: optInValues
            });
            response = this.emarsysHelper.triggerAPICall('settings/autoimports', request, 'POST');

            if (response.status !== 'OK') {
                this.logger.info('[Create auto import profile: {0}] - ***Emarsys Auto import message: {1}', response.error, response.errorMessage);
                return new Status(Status.ERROR, 'info');
            }
        } catch (err) {
            this.logger.error('[Emarsys CreateAutoImportProfile.js] - ***Emarsys Auto import error message: ' + err.message + '\n' + err.stack);
            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    }
};

module.exports.execute = CreateAutoImportProfile.execute.bind(CreateAutoImportProfile);
