!function(e){var t={};function s(a){if(t[a])return t[a].exports;var n=t[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=e,s.c=t,s.d=function(e,t,a){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(a,n,function(t){return e[t]}.bind(null,n));return a},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=2)}([function(e,t,s){"use strict";e.exports=function(e,t){var s=$(".js-notification-message");if(e){var a=$(".js-"+e+"-message");s.removeClass("js-d-flex"),$(a).addClass("js-d-flex"),t&&(s.find(".js-body-"+e+"-message").text(""),$(a).find(".js-body-"+e+"-message").text(t)),$("body,html").animate({scrollTop:0},250)}else s.removeClass("js-d-flex"),s.find(".js-body-"+e+"-message").text("")}},,function(e,t,s){"use strict";var a=s(0),n=s(3);function r(e){return"SFCC_"+e.replace(/[-\s]+/g,"_").replace(/([a-z])([A-Z])/g,"$1_$2").toUpperCase()}function o(e,t){var s=$(".js-page-data-block .js-"+e+"-events .js-emarsys-name-select").clone();if(null!=t){var a=s.find('[value="'+t+'"]');s.prepend(a),a.prop("selected",!0)}return s}function i(){var e=$(".js-notification-messages").data("server-error");a("error",e),setTimeout((function(){a()}),5e3)}function c(e,t){$(".js-page-data-block .js-"+t+"-events .js-emarsys-name-select").children('[value="'+e.emarsysName+'"]').attr("data-emarsys-id",e.emarsysId),$(".js-"+t+"-events-table .js-emarsys-name-select").filter(":not(:disabled)").each((function(){var e=$(this).children(":first").attr("value"),s=o(t,e),a=$(".js-emarsys-select-data").data("option-cancel-title");s.children(":first").text(a),s.val($(this).val()),$(this).replaceWith(s)}))}e.exports={processEmptyTableNotifications:function(){function e(e){0===$(".js-"+e+"-events-table .js-external-events-row").length&&$(".js-"+e+"-events-table .js-empty-table-notification").removeClass("hide-content")}e("subscription"),e("other")},initAddEventDialog:function(){n.init({dialogSelector:".js-page-data-block .js-add-event-dialog",openCallback:function(){var e=this.dialog,t=$(".js-"+this.eventType+"-events .js-sfcc-name-select").clone(),s=e.find(".js-sfcc-name-select");s.children(":first").insertBefore(t.children(":first")),t.children(":first").prop("selected",!0),s.replaceWith(t);var a=e.find(".js-emarsys-name-select");if("subscription"===this.eventType){var r=o(this.eventType);r.prepend(a.children(":first")),r.children('[value=""]').remove(),r.children(":first").prop("selected",!0),a.replaceWith(r)}else e.find(".js-emarsys-name-select").addClass("hide-content");n.applyReplacementsList(e,this.replaceList),n.open(e)},closeCallback:function(){var e=this.dialog;n.close(e),a();var t=e.find(".js-emarsys-name-select option").filter(":selected"),s=e.find(".js-sfcc-name-select option").filter(":selected");return{eventType:this.eventType,event:{emarsysId:t.attr("data-emarsys-id"),emarsysName:t.attr("value"),sfccName:s.attr("value")}}}})},initAddEventButtons:function(){function e(e){var t=!0;if(0===$(".js-page-data-block .js-"+e+"-events .js-sfcc-name-select").find("option[value]").length){var s=$(".js-notification-messages").data("empty-source-error");a("error",s),setTimeout((function(){a()}),1e4),t=!1}return t}function t(e){if(e.response&&"OK"===e.response.status){var t,s=e.response.result,n=this.eventType;"new"===s.emarsysStatus&&"other"!==n&&c(s,n),$(".js-page-data-block .js-"+n+"-events .js-sfcc-name-select").children('[value="'+s.sfccName+'"]').remove(),$(".js-"+n+"-events-table .js-empty-table-notification").addClass("hide-content"),function(e,t){var s=$(".js-page-data-block .js-external-events-row").clone();s.attr("data-emarsys-id",t.emarsysId),s.attr("data-emarsys-name",t.emarsysName),s.attr("data-sfcc-name",t.sfccName),s.find(".js-sfcc-name-span").text(t.sfccName);var a=s.find(".js-emarsys-name-select"),n=o(e,t.emarsysName);return n.prop("disabled",!0),"other"===e&&n.children(':not([value="'+r(t.sfccName)+'"],[value=""])').remove(),a.replaceWith(n),s}(n,s).insertBefore($(".js-"+n+"-events-table .js-empty-table-notification"));var i=$(".js-notification-messages");t=i.data("success-event")+s.sfccName+i.data("success-created"),a("success",t)}else e.response&&"ERROR"===e.response.status&&a("error",e.response.message)}function s(e){if(e&&"cancel"!==e.status){var s="",n=e.data.eventType,o=e.data.event;if(!o.sfccName)return s=$(".js-notification-messages").data("empty-name-error"),a("error",s),void setTimeout((function(){a()}),5e3);if("appropriate"===o.emarsysName){o.emarsysName=r(o.sfccName);var c=$(".js-page-data-block .js-"+n+"-events .js-emarsys-name-select").children('[value="'+o.emarsysName+'"]');o.emarsysId=c.attr("data-emarsys-id")}var l={type:n,sfccName:o.sfccName,emarsysId:o.emarsysId,emarsysName:o.emarsysName};$.ajax({url:$(".js-page-links").data("add-event"),type:"post",dataType:"json",data:l,context:{eventType:n},success:t,error:i})}}$(".js-add-subscription-event-button").on("click",{dialogPopup:n,userResponseHandler:s,checkSfccNameOptions:e},(function(e){var t=e.data;t.checkSfccNameOptions("subscription")&&n.getUserResponse({dialogSelector:".js-add-event-dialog",eventType:"subscription",replaceList:[{selector:".js-dialog-title",text:$(".js-dialog-messages").data("add-subscription")}]}).then(t.userResponseHandler)})),$(".js-add-other-event-button").on("click",{dialogPopup:n,userResponseHandler:s,checkSfccNameOptions:e},(function(e){var t=e.data;t.checkSfccNameOptions("other")&&n.getUserResponse({dialogSelector:".js-add-event-dialog",eventType:"other",replaceList:[{selector:".js-dialog-title",text:$(".js-dialog-messages").data("add-other")}]}).then(t.userResponseHandler)}))},initChangeButtons:function(){function e(e,t){var s=$(".js-button-labels").data("apply");t.text(s),t.removeClass("js-change-button"),t.addClass("js-apply-changes-button");var n=t.closest(".js-external-events-row"),i=n.find(".js-emarsys-name-select"),c=o(e,i.children(":selected").attr("value"));if("other"===e){var l=r(n.attr("data-sfcc-name"));c.children(':not([value="'+l+'"],[value=""])').remove()}var d=$(".js-emarsys-select-data").data("option-cancel-title");c.children(":first").text(d),i.replaceWith(c),a()}$(".js-subscription-events-table").on("click",".js-change-button",{changeEvent:e},(function(e){e.data.changeEvent("subscription",$(e.target))})),$(".js-other-events-table").on("click",".js-change-button",{changeEvent:e},(function(e){e.data.changeEvent("other",$(e.target))}))},initApplyButton:function(){function e(){var e=$(".js-button-labels").data("change");this.updateButton.text(e),this.updateButton.removeClass("js-apply-changes-button"),this.updateButton.addClass("js-change-button");var t=this.row.find(".js-emarsys-name-select"),s=t.children(":first"),a=$(".js-page-data-block .js-"+this.eventType+"-events .js-emarsys-name-select").children('option[value="'+this.prevEmarsysName+'"]').clone(),n=t.children(":selected").attr("value");s.replaceWith(a),t.val(n),t.prop("disabled",!0),this.updateButton.prop("disabled",!1)}function t(e){if(e.response&&"OK"===e.response.status){var t,s=e.response.result;"new"===s.emarsysStatus&&"other"!==this.eventType&&c(s,this.eventType),this.row.find(".js-emarsys-name-select").children('[value="'+s.emarsysName+'"]').prop("selected",!0),this.row.attr("data-emarsys-id",s.emarsysId),this.row.attr("data-emarsys-name",s.emarsysName);var n=$(".js-notification-messages");t=n.data("success-event")+s.sfccName+n.data("success-changed"),a("success",t)}else e.response&&"ERROR"===e.response.status&&a("error",e.response.message)}function s(s,a){var n=a.closest(".js-external-events-row"),r=n.find(".js-emarsys-name-select").find("option").filter(":selected"),o=r.attr("value"),c=n.attr("data-emarsys-name"),l={eventType:s,row:n,updateButton:a,prevEmarsysName:c};if(o!==c){var d={type:s,sfccName:n.attr("data-sfcc-name"),emarsysId:r.attr("data-emarsys-id"),emarsysName:o};a.prop("disabled",!0),$.ajax({url:$(".js-page-links").data("update-event"),type:"post",dataType:"json",data:d,context:l,success:t,error:i,complete:e})}else e.call(l)}$(".js-subscription-events-table").on("click",".js-apply-changes-button",{applyChanges:s},(function(e){e.data.applyChanges("subscription",$(e.target))})),$(".js-other-events-table").on("click",".js-apply-changes-button",{applyChanges:s},(function(e){e.data.applyChanges("other",$(e.target))}))},initRequestBodyExampleDialog:function(){n.init({dialogSelector:".js-page-data-block .js-request-body-example",openCallback:function(){var e=this.dialog,t=$(".js-page-data-block .js-supported-events-data").data("additional-data")[this.eventType][this.sfccEventName],s=t&&t.requestBodyExample,a="";a=s?JSON.stringify(s,null,2):$(".js-page-data-block .js-dialog-messages").data("unsupported-event"),e.find(".js-content-block pre").text(a),n.applyReplacementsList(e,this.replaceList),n.open(e)}})},initRequestBodyExampleButton:function(){function e(e,t){var s=t.closest(".js-external-events-row").attr("data-sfcc-name");n.getUserResponse({dialogSelector:".js-request-body-example",eventType:e,sfccEventName:s,replaceList:[{selector:".js-dialog-title",text:$(".js-dialog-messages").data("show-example")+' "'+s+'"'}]}),a()}$(".js-subscription-events-table .js-example-button").on("click",{showRequestBodyExample:e},(function(e){e.data.showRequestBodyExample("subscription",$(e.target))})),$(".js-other-events-table .js-example-button").on("click",{showRequestBodyExample:e},(function(e){e.data.showRequestBodyExample("other",$(e.target))}))},initTriggerEventDialog:function(){n.init({dialogSelector:".js-page-data-block .js-trigger-event",openCallback:function(){var e=this.dialog,t=$(".js-page-data-block .trigger-event-form").clone(),s=e.find(".dialog-content-block");s.children().remove(),s.append(t),n.applyReplacementsList(e,this.replaceList),n.open(e)},closeCallback:function(){var e=this.dialog;n.close(e),a();var t=e.find(".js-content-block form");return{eventType:this.eventType,serializedForm:t.serializeArray(),event:this.event}}})},initTriggerEventButton:function(){function e(e){e.response&&"OK"===e.response.status?a("success","The event was successfully triggered"):e.response&&"ERROR"===e.response.status&&a("error",e.response.message)}function t(t){if(t&&"cancel"!==t.status){var s=t.data.eventType,a=t.data.serializedForm,n=t.data.event,r={type:s,sfccName:n.sfccName,emarsysId:n.emarsysId,emarsysName:n.emarsysName,serializedForm:a};$.ajax({url:$(".js-page-links").data("add-event"),type:"post",dataType:"json",data:r,context:{eventType:s},success:e,error:i})}}function s(e,s){var r=s.closest(".js-external-events-row"),o={emarsysId:r.attr("data-emarsys-id"),emarsysName:r.attr("data-emarsys-name"),sfccName:r.attr("data-sfcc-name")},i=$(".js-page-data-block .js-supported-events-data").data("additional-data")[e][o.sfccName];i&&i.requestBodyExample&&(n.getUserResponse({dialogSelector:".js-trigger-event",eventType:e,event:o,replaceList:[{selector:".js-dialog-title",text:$(".js-dialog-messages").data("trigger-event")+' "'+o.sfccName+'"'}]}).then(t),a())}$(".js-subscription-events-table .js-trigger-button").on("click",{triggerEvent:s},(function(e){e.data.triggerEvent("subscription",$(e.target))})),$(".js-other-events-table .js-trigger-button").on("click",{triggerEvent:s},(function(e){e.data.triggerEvent("other",$(e.target))}))}}},function(e,t,s){"use strict";function a(e){e.parent().removeClass("hidden-block")}function n(e){e.parent().addClass("hidden-block"),l(e)}function r(e,t){var s=null;return t.dialog?t.dialog instanceof jQuery?s=t.dialog:t.dialog instanceof HTMLElement&&(s=$(t.dialog),$.extend(t,{dialog:s})):t.dialogSelector&&(s=e.find(t.dialogSelector).first()),s}function o(e){var t=e.data,s=t.arguments,a=null;s.closeCallback?a=s.closeCallback(t):n(s.dialog),t.promiseResolve({status:t.status,data:a})}function i(e){var t=e.arguments,s=null;t.closeCallback?s=t.closeCallback(e):n(t.dialog),e.promiseResolve({status:e.status,data:s})}function c(e){var t=e.data;"Enter"===e.code?i({status:"confirm",promiseResolve:t.promiseResolve,arguments:t.arguments}):"Escape"===e.code&&i({status:"cancel",promiseResolve:t.promiseResolve,arguments:t.arguments}),e.preventDefault()}function l(e){var t=e.parent();e.off("click"),t.off("click"),$(document.body).off("keyup",c)}e.exports={init:function(e){var t=r($(document.body),e);if(!t||!t.length)return null;e.dialog||(t=t.clone(),$.extend(e,{dialog:t}));var s=$("<div>",{class:"js-dialog-wrapper dialog-wrapper hidden-block"});s.append(t),s.data(e);var a=$(".js-dialog-container").first();return a.length||(a=$("<div>",{class:"js-dialog-container dialog-container"}),$(document.body).append(a)),a.append(s),t},getUserResponse:function(e){var t=r($(".js-dialog-container").first(),e);if(!t.length)return Promise.resolve();var s=function(e,t){var s=e.parent().data(),a=Object.create(s);return $.extend(a,t),a}(t,e);return new Promise((function(e){var n={arguments:s,promiseResolve:e};s.openCallback?s.openCallback(n):a(t),function(e,t){var s=e.parent();e.on("click",".js-confirm-button",$.extend({},t,{status:"confirm"}),o),e.on("click",".js-cancel-button,.js-close-button",$.extend({},t,{status:"cancel"}),o),s.on("click",$.extend({},t,{status:"cancel"}),o),e.on("click",(function(e){e.stopPropagation()})),$(document.body).on("keyup",$.extend({},t),c)}(t,n)}))},open:a,close:n,detach:function(e){return e.parent().detach()},removeEventHandlers:l,applyReplacementsList:function(e,t){t&&t.forEach((function(e){this.find(e.selector).text(e.text)}),e)}}}]);