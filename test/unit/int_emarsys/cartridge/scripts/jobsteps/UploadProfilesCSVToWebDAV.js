var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var mockPath = './../../../../../mocks/';

var Logger = require(mockPath + 'dw/system/Logger');
var WebDAVClient = require(mockPath + 'dw/net/WebDAVClient');
var File = require(mockPath + 'dw/io/File');
var Status = require(mockPath + 'dw/system/Status');
var Site = require(mockPath + 'dw/system/Site');

var cartridgePath = '../../../../../../cartridges/int_emarsys/';

var UploadProfiles = proxyquire(cartridgePath + 'cartridge/scripts/jobsteps/UploadProfilesCSVToWebDAV.js', {
    'dw/system/Status': Status,
    'dw/system/Site': Site,
    'dw/system/Logger': Logger,
    'dw/net/WebDAVClient': WebDAVClient,
    'dw/io/File':File
});

describe('UploadProfilesCSVToWebDAV jobstep', () => {
    it('Testing method: execute', () => {
    var result = UploadProfiles.execute();
    assert.deepEqual(result, {
        code: 'OK',
        status: 2
        });
    });

});