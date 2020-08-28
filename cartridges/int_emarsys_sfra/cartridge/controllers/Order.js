'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Confirm', function (req, res, next) {
    var isEmarsysEnable = require('dw/system/Site').getCurrent().getCustomPreferenceValue('emarsysEnabled');
    if (isEmarsysEnable) {
        var OrderMgr = require('dw/order/OrderMgr');
        var emarsysAnalyticsHelper = new (require('int_emarsys/cartridge/scripts/helpers/emarsysAnalyticsHelper'))();
        var viewData = res.getViewData();

        var order = OrderMgr.getOrder(req.querystring.ID);
        viewData.analyticsData = emarsysAnalyticsHelper.setPageData('orderconfirmation', { order: order });
        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
