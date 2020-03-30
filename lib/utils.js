"use strict";
exports.__esModule = true;
function encodeSubscription(subscription) {
    return Buffer.from(JSON.stringify(subscription)).toString("base64");
}
exports.encodeSubscription = encodeSubscription;
function decodeSubscription(subscriptionString) {
    try {
        var obj = JSON.parse(Buffer.from(subscriptionString, "base64").toString("ascii"));
        if (!isSubscription(obj)) {
            throw new Error("Invalid Push Subscription object");
        }
        return obj;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
exports.decodeSubscription = decodeSubscription;
function isSubscription(obj) {
    if (!obj || typeof obj !== "object")
        return false;
    if ((obj === null || obj === void 0 ? void 0 : obj.hasOwnProperty("endpoint")) && (obj === null || obj === void 0 ? void 0 : obj.hasOwnProperty("keys"))) {
        return true;
    }
    return false;
}
exports.isSubscription = isSubscription;
