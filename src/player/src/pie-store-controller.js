import { jsonHeaders as headers, json, status } from '../../client-common/fetch-helpers';

export default function RemoteController(endpoints) {


  this.model = function (session, env) {

    let { model } = endpoints;

    let opts = {
      method: model.method,
      headers,
      body: JSON.stringify({ session, env })
    }

    return fetch(model.url, opts).then(json);
  }

  this.submit = function (session) {
    let { submit } = endpoints;
    let opts = {
      method: submit.method,
      headers,
      body: JSON.stringify({ session })
    }

    return fetch(submit.url, opts)
      .then(status)
      .then(json);
  };
}