'use strict';

/* eslint-disable */
var Order = require('./Order');
var Status = require('./../system/Status');
var SeekableIterator = require('./../util/SeekableIterator');

 class OrderMgr {
    getOrder() {
        return Order;
    }
    
    placeOrder(order) {
        order.status = Order.ORDER_STATUS_NEW;
        return Status.OK;
    }
    
    failOrder(order) {
        order.status = Order.ORDER_STATUS_FAILED;
        return Status.OK;
    }
    
    cancelOrder(order) {
        order.status = Order.ORDER_STATUS_CANCELLED;
        return Status.OK;
    }

    searchOrders(query, ORDER_BY, startDate, endDate) {
        // var index = 0;
        // var i = 0;
        var orders = new SeekableIterator([
            Order,
            Order
        ]);
        return orders;
        // return {
        //     iterator: function () {
        //         return {
        //             items: [Order,Order],
        //             hasNext: function () {
        //                 return index < items.length;
        //             },
        //             next: function () {
        //                 return items[index++];
        //             },
        //             hasNext: function () {
        //                 return index < items.length;
        //             }
        //         };
        //     },
        //     toArray: function () {
        //         return orders;
        //     },
        //     next: function () {
        //         return orders[i++];
        //     },
        //     hasNext: function () {
        //         return i < orders.length;
        //     },
        //     close() {
        //         return true;
        //     }
        // }
    };
}

module.exports =new OrderMgr;
