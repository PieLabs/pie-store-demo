import { jsonHeaders as headers, json, status } from '../../client-common/fetch-helpers';

export default class SessionClient {
  constructor(endpoints) {
    this.endpoints = endpoints;
  }

  submit(session) {
    let { submit } = this.endpoints;
    let opts = {
      method: submit.method,
      headers,
      body: JSON.stringify({ session })
    }

    return fetch(submit.url, opts)
      .then(status)
      .then(json);
  }
}