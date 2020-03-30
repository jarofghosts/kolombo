<div align="center">
  <img width="200" height="200" src="https://raw.githubusercontent.com/jarofghosts/kolombo/master/web/noun-dove.png" alt="kolombo logo">
  <h1>kolombo</h1>
</div>

Provides a [Web Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) interface to
system notifications within Docker.

## How to use it

### Generate a VAPID keypair

```shell
npx web-push generate-vapid-keys
```

### Create a file to store your credentials in

(you can skip this if you are using kolombo inside of docker-compose, just provide the environment variables
there)

```plaintext
# kolombo.env
KOLOMBO_VAPID_PUBLIC_KEY=<Your generated public key>
KOLOMBO_VAPID_PRIVATE_KEY=<Your generated private key>
```

### Run the kolombo server

(again, you can skip this if you're using docker-compose)

```shell
docker run --env-file kolombo.env -p 9999:3000 -d --rm jarofghosts/kolombo
```

Docker should return you a container ID, let's verify everything started up okay:

```shell
docker logs <kolombo container ID>
```

It will probably warn you that you don't have a subscription object, but that's okay! We will get that
sorted in the next step.

At this point you can copy the server address from the container's logs to use later to configure
[kolombo-notify-send](https://github.com/jarofghosts/kolombo-notify-send).

### Subscribe to updates

Open your browser to the kolombo-server web interface. In our previous example we had it run on `localhost:9999`,
if you're following along, then, open: <a href="http://localhost:9999" target="_blank">http://localhost:9999/</a>

Once opened, click the "Subscribe" button. If all goes well, you should get a test notification and a subscription
ID. If you wish to not have to re-subscribe every time you start the kolombo-server, you should add it to your
`kolombo.env` file (or to your docker-compose yaml file) under the environment variable `KOLOMBO_SUBSCRIPTION`.

### Install [kolombo-notify-send](https://github.com/jarofghosts/kolombo-notify-send) in any containers you wish to receive notifications from

Follow [kolombo-notify-send's usage guide](https://github.com/jarofghosts/kolombo-notify-send#usage), setting
`KOLOMBO_SERVER` to `http://<IP>:3000/` where `<IP>` is the IP (or service name if you're using docker-compose
or a user-created network) of the `kolombo-server` container. The `kolombo-server` container should log its
address on successful startup if you want to copy it from there (`docker logs <kolombo container ID>`).

## What does the name mean?

It's "dove" (or "pigeon") in Esperanto

## License

MIT
