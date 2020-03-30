const publicVapidKey = "@MAGIC@"

// This `urlBase64ToUint8Array()` function copied from:
// https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

let feedbackElement

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    feedbackElement = document.getElementById("feedback")
    run().catch(error => {
      feedbackElement.classList.remove("d-hide")
      feedbackElement.classList.add("toast-error")
      feedbackElement.innerHTML = `Error: ${error.message}`
    })
  })
}

async function run() {
  const registration = await navigator.serviceWorker.register("/worker.js", {
    scope: "/",
  })

  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    })
  }

  const subscriptionButton = document.getElementById("toggle-subscription")
  subscriptionButton.classList.remove("loading")

  if (!subscription) {
    return unsubscribe()
  }

  const result = await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  })
  const {ok, id, error} = await result.json()

  if (ok) {
    feedbackElement.classList.remove("d-hide")
    feedbackElement.classList.add("toast-info")
    feedbackElement.innerHTML = `
      <h4>Subscription ID</h4>
      <input id="subscription-id" readonly autofocus="autofocus" onfocus="this.select()" type="text" value="${id}" class="form-input" />
      `
  } else {
    throw new Error(error || "Error subscribing")
  }

  subscriptionButton.disabled = false
  subscriptionButton.addEventListener("click", unsubscribe)

  function unsubscribe() {
    feedbackElement.classList.add("d-hide")
    subscriptionButton.removeEventListener("click", unsubscribe)
    if (subscription) {
      subscription.unsubscribe()
    }
    subscriptionButton.innerHTML = '<i class="icon icon-plus"></i> Subscribe'
    subscriptionButton.addEventListener("click", subscribe)
    subscriptionButton.classList.add("btn-primary")
    subscriptionButton.disabled = false
  }

  function subscribe() {
    // reloading the page should request subscription
    location.reload()
  }
}
