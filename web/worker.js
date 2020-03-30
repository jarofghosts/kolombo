console.log("Loaded service worker!")

self.addEventListener("push", ev => {
  let title = "yoyoyo"
  let body = "hello, world!"
  let icon = "http://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png"
  if (ev.data) {
    const data = ev.data.json()
    console.log(data)
    if (data.title) title = data.title
    if (data.message) body = data.message
    if (data.icon) icon = data.icon
  } else {
    console.log("no data :(")
  }

  self.registration.showNotification(title, {
    body,
    icon,
  })
})
