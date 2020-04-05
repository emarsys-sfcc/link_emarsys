'use strict';
/**
*	Upload Profiles CSV file to WebDav
*/
var WebDAVClient = require('dw/net/WebDAVClient');
var File = require('dw/io/File');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site').getCurrent();

var UploadProfilesCSVToWebDAV = {
    logger: require('dw/system/Logger').getLogger('emarsys'),

    /* exported execute */
    execute: function (args) {
        try {
            if (args.isDisabled) {
                return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
            }

            var URL = Site.getCustomPreferenceValue('emarsysWebDAVURLString');
            var Username = Site.getCustomPreferenceValue('emarsysWebDAVUsernameString');
            var Password = Site.getCustomPreferenceValue('emarsysWebDAVPasswordString');
            var CSVFileName = Site.getCustomPreferenceValue('emarsysFileNameString');
            var CSVFolderName = Site.getCustomPreferenceValue('emarsysIMPEXFolderString');
            var CSVFilePath = File.IMPEX + '/src/' + CSVFolderName + '/' + CSVFileName + '.csv';
            var CSVFile = new File(CSVFilePath);

            var WebDAVFilePath = '/' + CSVFileName + '.csv';
            var webDAVClient = new WebDAVClient(URL, Username, Password);

            if (CSVFile.exists()) {
                webDAVClient.put(WebDAVFilePath, CSVFile);
                if (webDAVClient.succeeded()) {
                    this.logger.info('The CSV file upload successfully');
                    return new Status(Status.OK, 'OK');
                }

                this.logger.error('[UploadProfilesCSVToWebDAV.js] - ***Emarsys contact info csv upload to WebDAV error code: {0} - Error message: {1}', webDAVClient.statusCode, webDAVClient.statusText);
                this.logger.error('The CSV file upload failed. Error: An error occured with status code ' + webDAVClient.statusCode);
                return new Status(Status.ERROR, 'ERROR');
            }

            this.logger.error('[UploadProfilesCSVToWebDAV.js] - ***Emarsys contact info csv upload to WebDAV error message: CSV file was not found');
            this.logger.error('The CSV file upload failed. Error: CSV file was not found');
            return new Status(Status.ERROR, 'ERROR');
        } catch (err) {
            this.logger.error('[UploadProfilesCSVToWebDAV.js] - ***Emarsys contact info csv upload to WebDAV error message: ' + err.message + '\n' + err.stack);
            this.Logger.error('The CSV file upload failed. Error: ' + err.toString());
            return new Status(Status.ERROR, 'ERROR');
        }
    }
};

module.exports.execute = UploadProfilesCSVToWebDAV.execute.bind(UploadProfilesCSVToWebDAV);
