self.addEventListener("push", ev => {
  const useLightIcon = self.matchMedia("(prefers-color-scheme: dark)").matches
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
