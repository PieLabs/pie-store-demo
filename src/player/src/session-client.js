import { jsonHeaders as headers, json, status } from '../../client-common/fetch-helpers';

export default class SessionClient {
  constructor(endpoints) {
    this.endpoints = endpoints;
  }

  updateSession(session) {
    let { update: { url, method } } = this.endpoints;
    let opts = {
      method,
      headers,
      body: JSON.stringify({ session })
    }

    return fetch(url, opts)
      .then(status)
      .then(json);
  }

  submit(answers) {
    let { submit: { method, url } } = this.endpoints;
    let opts = {
      method: method,
      headers,
      body: JSON.stringify({ answers })
    }

    return fetch(url, opts)
      .then(status)
      .then(json);
  }

  model(answers, env) {
    let { model: { method, url } } = this.endpoints;

    let opts = {
      method: method,
      headers,
      // need to rename answers to session 
      body: JSON.stringify({ session: answers, env })
    }

    return fetch(url, opts)
      .then(status)
      .then(json);

  }
}