export default function RemoteController(endpoints) {

  const status = (response) => {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
  }

  const json = (response) => response.json();

  this.model = function (session, env) {

    let { model } = endpoints;

    let opts = {
      method: model.method,
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify({
        session: session,
        env: env
      })
    }

    return fetch(model.url, opts).then(json);
  }
}