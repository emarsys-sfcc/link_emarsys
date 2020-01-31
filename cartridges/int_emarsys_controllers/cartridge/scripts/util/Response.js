'use strict';

/**
 * This module provides often-needed helper methods for sending responses.
 *
 * @module util/Response
 */

/**
 * Transforms the provided object into JSON format and sends it as JSON response to the client.
 */
exports.renderJSON = function (data) {
    response.setContentType('application/json');

    var jsonString = JSON.stringify(data);
    response.writer.print(jsonString);
};
