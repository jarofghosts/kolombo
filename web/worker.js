let useLightIcon = false

self.addEventListener("message", ev => {
  if (ev.data.type === "mode") {
    useLightIcon = ev.data.mode === "dark"
  }
})

self.addEventListener("push", ev => {
  let title = "kolombo"
  let body = "message from kolombo"
  let icon = `https://raw.githubusercontent.com/jarofghosts/kolombo/master/web/noun-dove${
    useLightIcon ? "-inverse" : ""
  }.png`
  if (ev.data) {
    const data = ev.data.json()
    if (data.title) title = data.title
    if (data.message) body = data.message
    if (data.icon) icon = data.icon
  } else {
    console.log("no data :(")
    return
  }

  self.registration.showNotification(title, {
    body,
    icon,
  })
})
