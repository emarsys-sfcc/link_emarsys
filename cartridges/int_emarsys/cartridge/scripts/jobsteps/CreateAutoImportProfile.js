'use strict';
/**
*    Create AutoImport Profile using the API
*/
var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var Status = require('dw/system/Status');
var currentSite = require('dw/system/Site').getCurrent();

var CreateAutoImportProfile = {
    logger: require('dw/system/Logger').getLogger('createAutoImportProfile', 'createAutoImportProfile'),
    /* exported execute */
    execute: function (params) {
        this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/util/EmarsysHelper'))();

        var FieldValueMapping = currentSite.getCustomPreferenceValue('emarsysSingleChoiceValueMapping');
        var FileName = currentSite.getCustomPreferenceValue('emarsysFileNameString');

        var Separator = params.csvFileColumnsDelimiter;
        var request = {};
        var response;

        FieldValueMapping = JSON.parse(FieldValueMapping);

        try {
            var FieldConfigurationCO = new CustomObjectMgr.getCustomObject("EmarsysDBLoadConfig","dbloadConfig");
            var FieldConfiguration = JSON.parse(FieldConfigurationCO.custom.mappedFields);
            var ProfileFieldsCO = new CustomObjectMgr.getCustomObject("EmarsysProfileFields","profileFields");
            var ProfileFields = JSON.parse(ProfileFieldsCO.custom.result);

            var sitePrefs = currentSite.preferences.custom;
            var language = sitePrefs['emarsysLanguage'];
            var asList = sitePrefs['emarsysAsList'];
            var newsletter = sitePrefs['emarsysNewsletter'];
            var skipEmpty = sitePrefs['emarsysSkipEmpty'];
            var updateOnly = sitePrefs['emarsysUpdateOnly'];
            var enabled = sitePrefs['emarsysAutoImportEnabled'];
            var overwrite = sitePrefs['emarsysOverwriteContacts'];

            request.separator = Separator;
            request.text_separator = '\"';
            request.date_format = 'YYYY-MM-DD';
            request.fieldnames = true;
            request.language = language;
            request.as_list = asList;
            request.userlist_name = "auto-import-" + FileName;
            request.newsletter = newsletter;
            request.skip_empty = skipEmpty;
            request.update_only = updateOnly;
            request.file_pattern = FileName + ".csv";
            request.enabled = enabled;
            request.overwrite = overwrite;
            request.fields = [];

            var index = 0;

            for (var keyConfigField in FieldConfiguration) {
                var configField = FieldConfiguration[keyConfigField];
                for (var keyProfileField in ProfileFields) {
                    var profileField = ProfileFields[keyProfileField];
                    if(+configField['field'] === +profileField['id']) {
                        var values = [];
                        if(profileField['id'] in FieldValueMapping) {
                            values = FieldValueMapping[profileField['id']];
                        }
                        request.fields.push({
                            "id": index,
                            "field_name": profileField['name'],
                            "is_key": (profileField['name'] === "E-Mail" ? true : false),
                            "element_name": profileField['name'],
                            "element_id": profileField['id'],
                            "values": values
                        });
                        break;
                    }
                }
                index++;
            }

            // add all opt-in values to the request
            var optInValues = FieldValueMapping['31'];
            request.fields.push({
                "id": index,
                "field_name": "Opt-In",
                "is_key": false,
                "element_name": "Opt-In",
                "element_id": 31,
                "values": optInValues
            });
            response = this.emarsysHelper.triggerAPICall("settings/autoimports", request, "POST");

            if (response.status !== "OK") {
                this.logger.info("[Create auto import profile: {0}] - ***Emarsys Auto import message: {1}", response.error, response.errorMessage);
                return new Status(Status.ERROR, 'info');
            }

        } catch(err) {
            this.logger.error("[CreateAutoImportProfile.js #" + err.lineNumber + "] - ***Emarsys Auto import error message: " + err);
            return new Status(Status.ERROR, 'ERROR');
        }

        return new Status(Status.OK, 'OK');
    }
};

module.exports.execute = CreateAutoImportProfile.execute.bind(CreateAutoImportProfile);

