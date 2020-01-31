'use strict';
/**
*	Upload Profiles CSV file to WebDav
*/
var webDAVClient = require('dw/net/WebDAVClient');
var File = require('dw/io/File');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site').getCurrent();

var UploadProfilesCSVToWebDAV = {
    logger: require('dw/system/Logger').getLogger('emarsys'),

    /* exported execute */
   execute: function () {
    try {
        var URL = Site.getCustomPreferenceValue('emarsysWebDAVURLString');
        var Username = Site.getCustomPreferenceValue('emarsysWebDAVUsernameString');
        var Password = Site.getCustomPreferenceValue('emarsysWebDAVPasswordString');
        var CSVFileName = Site.getCustomPreferenceValue('emarsysFileNameString');
        var CSVFolderName = Site.getCustomPreferenceValue('emarsysIMPEXFolderString');
        var CSVFilePath = File.IMPEX + '/src/' + CSVFolderName + '/' + CSVFileName + '.csv';
        var CSVFile = new File(CSVFilePath);

        var WebDAVFilePath = '/' + CSVFileName + '.csv';
        var WebDAVClient   = new webDAVClient(URL, Username, Password);

        if (CSVFile.exists()) {
            WebDAVClient.put(WebDAVFilePath, CSVFile);
            if (WebDAVClient.succeeded()) {
                this.logger.info('The CSV file upload successfully');
                return new Status(Status.OK, 'OK');
            } else {
                this.logger.error('[UploadProfilesCSVToWebDAV.js] - ***Emarsys contact info csv upload to WebDAV error code: {0} - Error message: {1}', WebDAVClient.statusCode, WebDAVClient.statusText);
                this.logger.error('The CSV file upload failed. Error: An error occured with status code ' + WebDAVClient.statusCode);
                return new Status(Status.ERROR, 'ERROR');
            }
        } else {
            this.logger.error('[UploadProfilesCSVToWebDAV.js] - ***Emarsys contact info csv upload to WebDAV error message: CSV file was not found');
            this.logger.error('The CSV file upload failed. Error: CSV file was not found');
            return new Status(Status.ERROR, 'ERROR');
        }
    } catch (err) {
        this.logger.error('[UploadProfilesCSVToWebDAV.js #' + err.lineNumber + '] - ***Emarsys contact info csv upload to WebDAV error message: ' + err);
        this.Logger.error('The CSV file upload failed. Error: ' + err.toString());
        return new Status(Status.ERROR, 'ERROR');
    }
    }
};

module.exports.execute = UploadProfilesCSVToWebDAV.execute.bind(UploadProfilesCSVToWebDAV);
