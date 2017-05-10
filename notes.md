I've been looking at the documented `pie` element and `pie-player` api and I'd like to propose a few changes. 

## `pie-player`

* As a rule of thumb, the `pie-player` does not 'save' any data itself. Some of it's api may make modifications but saving is something that should happen elsewhere. 
* rename `set session( s: [{id, ...}, ...]` to `set sessions( s: [{id, ...}, ...])` - note the extra 's', we set an array of session objects for each element instance.
* remove `completeResponse()` and `isComplete()` - 'completeness' is something that is outside of the scope of the pie player and it's sessions array. should be handled at a higher layer.
* `reset()` - retain. Update the docs to say: 'delete all properties in each object in the sessions array except for `id`.' * Does not update the pie elements - you have to do that yourself *
* `resetResponse()` - retain. Update the docs to say: 'delete `response` field in each object in the sessions array. * Does not update the pie elements - you have to do that yourself * (you may have additional steps, like saving that you want to successfully perform, before updating the ui.)
* rename `getSessionStatus()` to either `status()` or `sessionsStatus()` that returns an array that mirrors what's in `sessions`: `[{id, complete}, ...]`. We can add an `responsesComplete()` method at a later point that does `sessions().find(s => !s.complete) === undefined`.

* rename `set env` -> `env(e) : Promise<env>` - this triggers a call to `controller.model` which can fail. However we have no way to handle that failure that came as a result to setting the env. With the function, we can know that the env wasn't set. 
* rename `set sessions` -> `sessions(s) : Promise<sessions>` - as above this can cause a failure, that a client may want to handle.

## make event names consistent. 
* pick camel or kebab case , i'm suggesting kebab.
* remove namespaces
* `pie-player-ready` -> `ready`
* `pie.model-updated` -> `model-updated` - fired when the call to `controller.model` succeeded
* NEW: `model-update-failed` - when an error is caught calling `controller.model`. `{detail: { error}}` - if the new set functions are in place this may no longer be needed.
* Note: no need for events for `getOutcome` because it returns a promise.

## `pie` element
* `session` - define `response` and `id`  as required fields.

### events

* `response-changed` - fired by a pie instance when a response changes 
* `pie.responseComplete` & `pie.responseChanged` -> `response-changed` w/ `{detail: {complete: true|false, id: pie-id}}`. triggered when the `session` is set and when the user changes the response.
* keep `pie.register`? or rename to `register-pie` or even `pie-element-connected` closer to what has actually happened for the pie element instance?
* `model-set` - dispatch when `model` is set. event detail contains: `{hasModel, complete}`.


# pie element controller changes

## outcome
[docs](https://github.com/PieLabs/pie-docs/blob/master/developing/controller.md#function-outcomeconfig-session-env)


return: 

```javascript
{
  score: 0.0 <-> 1.0
  completed: true|false
  extensions?: {}
}

```

* remove `success` - what does this mean?
* remove `duration` - this is out of scope (will add to demo)
* change `score` to value between `0.0` and `1.0` instead of an object


# pie controller changes

`controller.outcome` returns: 

```javascript

//Note: id is added to each pie elements outcome object.

{
  summary: { percentage: 100, min: 0, max: 10, outcome: 10},
  pies: [
    {id: 1, score: 1.0}
  ],
  weights: [
    {id: 1, weight: 10}
  ]
}
```