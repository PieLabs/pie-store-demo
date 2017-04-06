import { jsonHeaders as headers, json, status } from '../../client-common/fetch-helpers';

export default function RemoteController(endpoints) {


  this.model = function (session, env) {

    let { model: { method, url } } = endpoints;

    let opts = {
      method,
      headers,
      body: JSON.stringify({ session, env })
    }
    return fetch(url, opts).then(json);
  }

  this.submit = function (session) {
    let { submit: { url, method } } = endpoints;

    let opts = {
      method,
      headers,
      body: JSON.stringify({ session })
    }

    return fetch(url, opts)
      .then(status)
      .then(json);
  };

  this.outcome = function () {
    let { outcome: { method, url } } = endpoints;

    let opts = {
      method,
      headers
    }

    return fetch(url)
      .then(status)
      .then(json);
  }
}