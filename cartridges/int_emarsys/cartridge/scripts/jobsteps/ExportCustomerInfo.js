'use strict';
/**
*    Export Profile atributes as CSV
*/

var system = require('dw/system');
var io = require('dw/io');
var File = require('dw/io/File');
var customerMgr = require('dw/customer/CustomerMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Site = system.Site.getCurrent();
var Status = require('dw/system/Status');

var ExportCustomerInfo = {
    logger: require('dw/system/Logger').getLogger('ExportCustomerInfo', 'ExportCustomerInfo'),

    /* exported execute */
    execute: function (params) {
        this.exportStatus();

        this.emarsysHelper = new (require('int_emarsys/cartridge/scripts/helpers/emarsysHelper'))();

        var enableCustomTimeFrame = params.enableCustomTimeFrame;
        var timeframeStart = params.timeframeStart;
        var timeframeEnd = params.timeframeEnd;
        var day = 24 * 60 * 60 * 1000;// 24hrs in millis
        var today = new Date();
        var yesterday = new Date(today);
        // subtract number of milliseconds in 24h from today presentation im millis as well and create a new date with it
        yesterday = new Date(yesterday.setTime(yesterday.getTime() - day));

        var Separator = params.csvFileColumnsDelimiter;
        var FileName = this.createFileName();
        var FolderName = Site.getCustomPreferenceValue('emarsysIMPEXFolderString');

        Site.setCustomPreferenceValue('emarsysFileNameString', FileName);

        var folderPath = File.IMPEX + '/src/' + FolderName;
        var filePath = folderPath + '/' + FileName + '.csv';
        var folder = new File(folderPath);
        var currentSiteId = Site.getID();
        var Profiles;
        var exportFileWriter;
        var exportCSVStreamWriter;

        try {
            var FieldConfigurationCO = CustomObjectMgr.getCustomObject('EmarsysDBLoadConfig', 'dbloadConfig');
            var FieldConfiguration = JSON.parse(FieldConfigurationCO.custom.mappedFields);
            var ProfileFieldsCO = CustomObjectMgr.getCustomObject('EmarsysProfileFields', 'profileFields');
            var ProfileFields = JSON.parse(ProfileFieldsCO.custom.result);
            var OptInStatus = params.optInStatus;
            var OptInStatusAttribute = params.customAttributeId;
            var CountryValueCodes = JSON.parse(Site.getCustomPreferenceValue('emarsysCountryCodes'));
            var GenderValueCodes = JSON.parse(Site.getCustomPreferenceValue('emarsysGenderCodes'));
            var FieldValueMapping = JSON.parse(Site.getCustomPreferenceValue('emarsysSingleChoiceValueMapping'));
            if (!folder.exists()) {
                folder.mkdirs();
            }

            var exportFile = new File(filePath);
            exportFileWriter = new io.FileWriter(exportFile);
            exportCSVStreamWriter = new io.CSVStreamWriter(exportFileWriter, Separator, '"');

            var ProfileInfoHeader = this.makeCSVHeader(FieldConfiguration, ProfileFields);
            if (ProfileInfoHeader.indexOf('Opt-In') === -1) {
                ProfileInfoHeader.push('Opt-In');
            }
            exportCSVStreamWriter.writeNext(ProfileInfoHeader);

            var ProfilesExportThreshold = params.profilesExportThreshold;

            var ExportedProfiles = 0;

            // start date for export timeframe
            var startDate = enableCustomTimeFrame ? timeframeStart : yesterday;
            // end date for export timeframe
            var endDate = enableCustomTimeFrame ? timeframeEnd : today;

            var customExportAttribute = 'emarsysExportedProfileFlag' + currentSiteId;
            var customExportFlag = 'custom.emarsysExportedProfileFlag' + currentSiteId;
            var query = '(NOT ' + customExportFlag + ' = true)';
            var PROFILE_BY = 'creationDate desc';
            if (enableCustomTimeFrame && startDate && endDate) {
                query += ' AND (creationDate >= {0} AND creationDate <= {1})';
                Profiles = customerMgr.searchProfiles(query, PROFILE_BY, startDate, endDate);
            } else {
                Profiles = customerMgr.searchProfiles(query, PROFILE_BY);
            }
            var ProfileInfo = [];
            var Address;
            var Profile;

            var writeLine = function (indexField) {
                var Field = FieldConfiguration[indexField];
                if (Field.field !== '31') {
                    ProfileInfo.push(this.getAttributeValue(Address, Profile, Field, CountryValueCodes, GenderValueCodes, FieldValueMapping));
                }
            };

            while (Profiles.hasNext()) {
                Profile = Profiles.next();

                if (Profile.addressBook.preferredAddress !== null) {
                    Address = Profile.addressBook.preferredAddress;
                } else if (Profile.addressBook.addresses.length > 0) {
                    Address = Profile.addressBook.addresses[0];
                } else {
                    Address = {};
                }

                Object.keys(FieldConfiguration).forEach(writeLine, this);

                this.selectOptInStatus(Profile, OptInStatus, OptInStatusAttribute, ProfileInfo);

                exportCSVStreamWriter.writeNext(ProfileInfo);
                ExportedProfiles++;
                Profile.custom[customExportAttribute] = true;

                if (ExportedProfiles === ProfilesExportThreshold) {
                    break;
                }
            }

            if (ExportedProfiles < ProfilesExportThreshold) {
                Site.setCustomPreferenceValue('emarsysDBLoadExportStatus', true);
            }

            this.sendEmail(params);

            return new Status(Status.OK, 'OK');
        } catch (err) {
            this.logger.error('[ExportProfilesAsCSV.js #' + err.lineNumber + '] - ***Emarsys CSV profile data export error message: ' + err);
            return new Status(Status.ERROR, 'ERROR');
        } finally {
            exportCSVStreamWriter.close();
            exportFileWriter.close();
            Profiles.close();
        }
    },

    /**
     * @description send email
     * @param {Object} params params
     * @returns {void}
     */
    sendEmail: function (params) {
        if (params.fromEmail === null) {
            this.logger.info('The Customer Export successfully finished');
        } else {
            var MailFrom = params.fromEmail;
            var MailTo = params.mailTo;
            var MailSubject = params.mailSubject;
            var MainTemplate = 'email/dbload_notification';
            var template = new dw.util.Template(MainTemplate);

            var o = new dw.util.HashMap();
            o.put('MailSubject', MailSubject);

            var content = template.render(o);
            var mail = new dw.net.Mail();
            mail.addTo(MailTo)
                .setFrom(MailFrom)
                .setSubject(MailSubject)
                .setContent(content);

            mail.send();

            this.logger.info('The Customer Export successfully finished');
        }
    },
    /**
     * @description create file name
     * @return {void}
     */
    createFileName: function () {
        var currentDate = this.emarsysHelper.formatDate(new Date());

        return 'initial_' + currentDate;
    },

    /**
     * @description exits the steppe if the export status is true
     * @return {string} status
     */
    exportStatus: function () {
        var ExportStatus = Site.getCustomPreferenceValue('emarsysDBLoadExportStatus');
        if (!ExportStatus) {
            this.logger.error('[ExportProfilesAsCSV.js] - ***emarsysDBLoadExportStatus is: ' + ExportStatus);
            return new Status(Status.ERROR, 'ERROR');
        }
        return new Status(Status.OK, 'OK');
    },
    /**
     * @description create CSV header
     * @param {Array} FieldConfiguration array placeholders
     * @param {Array} ProfileFields array profile fields
     * @return {Array} header
     */
    makeCSVHeader: function (FieldConfiguration, ProfileFields) {
        var header = [];
        var configFields = FieldConfiguration; // Array
        var profileFields = ProfileFields; // Array
        var arrayConfigFields = Object.keys(configFields);
        var arrayProfileFields = Object.keys(profileFields);

        for (var i = 0; i < arrayConfigFields.length; i++) {
            var configField = configFields[arrayConfigFields[i]];
            for (var j = 0; j < arrayProfileFields.length; j++) {
                var profileField = profileFields[arrayProfileFields[j]];
                if (+configField.field === +profileField.id && profileField.name !== 'Opt-In') {
                    header.push(profileField.name);
                    profileFields.splice(arrayProfileFields[j], 1);
                    break;
                }
            }
        }

        return header;
    },

    /**
     * @description get SingleChoiceFieldValue
     * @param {Object} FieldValueMapping Object to retrieve data from
     * @param {Object} Field Field
     * @param {string} assignedValue assignedValue
     * @return {string} value
     */
    getSingleChoiceFieldValue: function (FieldValueMapping, Field, assignedValue) {
        var attributeValue = '';
        if (assignedValue) {
            var listOfValues = [];    // list of all possible values for specified field

            if (FieldValueMapping[Field.field]) {
                listOfValues = FieldValueMapping[Field.field];
            }

            var hasOtherValue = false;  // flag to find if 'Other' value is present among all possible values
            var otherValue = '';
            if (listOfValues.length > 0) {
                Object.keys(listOfValues).forEach(function (key) {
                    var value = listOfValues[key];
                    if (assignedValue.toLowerCase() === value.choice.toLowerCase()) {
                        attributeValue = value.choice;
                    } else if (value.choice.toLowerCase() === 'other') {
                        hasOtherValue = true;
                        otherValue = value.choice;
                    }
                }, this);
            } else {
                return assignedValue;
            }

            if (!attributeValue && hasOtherValue) {
                attributeValue = otherValue;
            }
        }

        return attributeValue;
    },

    /**
     * @description Get country name
     * @param {Object} CountryValueCodes Country value codes
     * @param {Object} Address address
     * @param {Object} FieldValueMapping Object to retrieve data from
     * @param {string} attributeId attribute Id
     * @return {string} name country
     */
    getCountryName: function (CountryValueCodes, Address, FieldValueMapping, attributeId) {
        if ('countryCode' in Address && !empty(Address.countryCode.displayValue) && Address.countryCode.displayValue in CountryValueCodes) {
            var countryCode = CountryValueCodes[Address.countryCode.displayValue];
            var countryValue = '';

            Object.keys(FieldValueMapping[attributeId]).forEach(function (key) {
                var country = FieldValueMapping[attributeId][key];
                if (country.value === countryCode) {
                    countryValue = country.choice;
                }
            }, this);
            return countryValue;
        }
        return '';
    },

    /**
     * @description Get gender name
     * @param {*} GenderValueCodes Gender value codes
     * @param {*} Profile current profile
     * @param {Object} FieldValueMapping Object to retrieve data from
     * @param {string} attributeId attribute Id
     * @return {string} name gender
     */
    getGenderName: function (GenderValueCodes, Profile, FieldValueMapping, attributeId) {
        if ('gender' in Profile && !empty(Profile.gender.displayValue) && Profile.gender.displayValue.toLowerCase() in GenderValueCodes) {
            var genderCode = GenderValueCodes[Profile.gender.displayValue.toLowerCase()];
            var genderValue = '';

            Object.keys(FieldValueMapping[attributeId]).forEach(function (keyGender) {
                var gender = FieldValueMapping[attributeId][keyGender];
                if (gender.value === genderCode) {
                    genderValue = gender.choice;
                }
            }, this);

            return genderValue;
        }
        return '';
    },

    /**
     * @description Get attribute value
     * @param {Object} Address address
     * @param {Object} Profile current profile
     * @param {Object} Field field
     * @param {Object} CountryValueCodes Country value codes
     * @param {Object} GenderValueCodes Gender value codes
     * @param {Object} FieldValueMapping Object to retrieve data from
     * @return {string} attribute value
     */
    getAttributeValue: function (Address, Profile, Field, CountryValueCodes, GenderValueCodes, FieldValueMapping) {
        var attributeName = Field.placeholder;
        var attributeValue = '';
        var attributeId = Field.field;
        if (attributeName === 'gender') {
            attributeValue = this.getGenderName(GenderValueCodes, Profile, FieldValueMapping, attributeId);
        } else if (attributeName === 'countryCode') {
            attributeValue = this.getCountryName(CountryValueCodes, Address, FieldValueMapping, attributeId);
        } else if (attributeName.split('.')[0] === 'custom') {
            var assignedValue = this.emarsysHelper.getValues(attributeName, Profile, 0);
            attributeValue = this.getSingleChoiceFieldValue(FieldValueMapping, Field, assignedValue);
        } else if (attributeName in Address && !empty(Address[attributeName])) {
            if (attributeName === 'address1') {
                attributeValue = Address[attributeName] + (Address.address2 !== null ? ' ' + Address.address2 : '');
            } else {
                attributeValue = Address[attributeName];
            }
        } else if (attributeName in Profile && !empty(Profile[attributeName])) {
            if (attributeName === 'birthday') {
                var birthday = Profile[attributeName].getFullYear().toFixed() + '-' +
                (Profile[attributeName].getMonth() + 1).toFixed() + '-' +
                Profile[attributeName].getDate().toFixed();

                attributeValue = birthday;
            } else {
                attributeValue = Profile[attributeName];
            }
        }

        return attributeValue;
    },

    /**
     * @description select OptInStatus
     * @param {Object} Profile current profile
     * @param {string} OptInStatus OptInStatus
     * @param {string} OptInStatusAttribute OptInStatusAttribute
     * @param {Object} ProfileInfo ProfileInfo
     * @return {void}
     */
    selectOptInStatus: function (Profile, OptInStatus, OptInStatusAttribute, ProfileInfo) {
        switch (OptInStatus) {
            case 0 : // All users empty
                ProfileInfo.push('');
                break;
            case 1 : // All users true
                ProfileInfo.push(1);
                break;
            case 2 : // Depending on attribute
                if (Profile.custom[OptInStatusAttribute] !== null && Profile.custom[OptInStatusAttribute]) {
                    ProfileInfo.push(1);
                } else {
                    ProfileInfo.push(1);
                }
                break;
            default :
                ProfileInfo.push('');
                break;
        }
    }
};

module.exports.execute = ExportCustomerInfo.execute.bind(ExportCustomerInfo);
