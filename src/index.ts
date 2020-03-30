import * as path from "path"
import {writeFileSync, readFileSync} from "fs"
import {resolve} from "url"

import * as express from "express"
import * as webpush from "web-push"
import {json as parseBodyAsJson} from "body-parser"
import {config as setupDotEnv} from "dotenv"
import {address} from "ip"

import {
  encodeSubscription,
  decodeSubscription,
  isSubscription,
  Env,
} from "./utils"

setupDotEnv()

const vapidContact = "https://github.com/jarofghosts/kolombo"
const vapidPublicKey = process.env[Env.VapidPublicKey]
const vapidPrivateKey = process.env[Env.VapidPrivateKey]
const subscription = process.env[Env.Subscription]

if (!vapidPrivateKey || !vapidPublicKey) {
  console.error(`${Env.VapidPublicKey} & ${Env.VapidPublicKey} must be set :(`)
  const keys = webpush.generateVAPIDKeys()
  console.error("here're some keys if you need them:")
  console.error(
    `Public key: ${keys.publicKey}\nPrivate key: ${keys.privateKey}`
  )
  process.exit(1)
}

const clientScript = readFileSync(path.join(__dirname, "../web/client.js"))
  .toString()
  .replace("@MAGIC@", vapidPublicKey)

webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey)

let subscriptionObject = decodeSubscription(subscription || "")

const app = express()

app.use(parseBodyAsJson())

// Intercept request for client file to use our version with the public key.
app.get("/client.js", (req, res) => {
  res.status(200).setHeader("Content-Type", "application/javascript")
  res.send(clientScript)
})

app.use(express.static(path.resolve(__dirname, "../web")))

app.post("/subscribe", (req, res) => {
  const subscription = req.body.subscription

  if (isSubscription(subscription)) {
    const id = encodeSubscription(subscription)
    subscriptionObject = subscription

    let testNotification: undefined | string = undefined

    if (req.body.sendTest) {
      testNotification = JSON.stringify({
        title: "kolombo test notification",
        message: "Hello from kolombo!",
      })
    }

    webpush
      .sendNotification(subscriptionObject, testNotification)
      .then(() => res.status(201).json({ok: true, id}))
      .catch(err =>
        res.status(500).json({
          ok: false,
          error: `Error sending test message: ${err.message}`,
        })
      )
  } else {
    res.status(400).json({ok: false, error: "Invalid subscription object"})
  }
})

app.post("/notification", (req, res) => {
  if (!subscriptionObject) {
    return res.status(500).json({ok: false, error: "Subscription not set up"})
  }

  const notification: {title: string; message: string; icon?: string} = {
    title: req.body.title,
    message: req.body.message,
  }

  if (req.body.icon) {
    writeFileSync(
      path.join(__dirname, `../web/images/${req.body.iconFilename}`),
      Buffer.from(req.body.icon, "base64"),
      {flag: "w"}
    )
    notification.icon = resolve(
      req.body.server,
      `images/${req.body.iconFilename}`
    )
  }

  webpush
    .sendNotification(subscriptionObject, JSON.stringify(notification))
    .then(() => res.status(200).json({ok: true}))
    .catch(err => res.status(500).json({ok: false, error: err.message}))
})

app.listen(3000, () => {
  console.log(`kolombo-server started on http://${address()}:3000/`)
})
