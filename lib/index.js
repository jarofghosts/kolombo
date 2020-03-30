"use strict";
exports.__esModule = true;
var path = require("path");
var fs_1 = require("fs");
var url_1 = require("url");
var express = require("express");
var webpush = require("web-push");
var body_parser_1 = require("body-parser");
var dotenv_1 = require("dotenv");
var utils_1 = require("./utils");
dotenv_1.config();
var Env;
(function (Env) {
    Env["VapidPublicKey"] = "KOLOMBO_VAPID_PUBLIC_KEY";
    Env["VapidPrivateKey"] = "KOLOMBO_VAPID_PRIVATE_KEY";
    Env["Subscription"] = "KOLOMBO_SUBSCRIPTION";
})(Env || (Env = {}));
var vapidEmail = "https://github.com/jarofghosts";
var vapidPublicKey = process.env[Env.VapidPublicKey];
var vapidPrivateKey = process.env[Env.VapidPrivateKey];
var subscription = process.env[Env.Subscription];
if (!vapidPrivateKey || !vapidPublicKey) {
    console.error(Env.VapidPublicKey + " & " + Env.VapidPublicKey + " must be set :(");
    var keys = webpush.generateVAPIDKeys();
    console.error("here're some keys if you need them:");
    console.error("Public key: " + keys.publicKey + "\nPrivate key: " + keys.privateKey);
    process.exit(1);
}
var clientScript = fs_1.readFileSync(path.join(__dirname, "../web/client.js"))
    .toString()
    .replace("@MAGIC@", vapidPublicKey);
webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
var subscriptionObject = utils_1.decodeSubscription(subscription || "");
var app = express();
app.use(body_parser_1.json());
// Intercept request for client file to use our version with the public key.
app.get("/client.js", function (req, res) {
    res.status(200).setHeader("Content-Type", "application/javascript");
    res.send(clientScript);
});
app.use(express.static(path.resolve(__dirname, "../web")));
app.post("/subscribe", function (req, res) {
    var subscription = req.body;
    if (utils_1.isSubscription(subscription)) {
        var id = utils_1.encodeSubscription(subscription);
        subscriptionObject = subscription;
        res.status(201).json({ ok: true, id: id });
    }
    else {
        res.status(400).json({ ok: false, error: "bad request" });
    }
});
app.post("/notification", function (req, res) {
    if (!subscriptionObject) {
        return res.status(500).json({ ok: false, error: "Subscription not set up" });
    }
    var notification = {
        title: req.body.title,
        message: req.body.message
    };
    if (req.body.icon) {
        fs_1.writeFileSync(path.join(__dirname, "../web/images/" + req.body.iconFilename), Buffer.from(req.body.icon, "base64"), { flag: "w" });
        notification.icon = url_1.resolve(req.body.server, "images/" + req.body.iconFilename);
    }
    webpush.sendNotification(subscriptionObject, JSON.stringify(notification));
    res.status(200).json({ ok: true });
});
app.listen(3000);
console.log("Kolombo start on port 3000");
