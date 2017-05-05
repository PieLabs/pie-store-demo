I've been looking at the documented `pie` element and `pie-player` api and I'd like to propose a few changes. 

## `pie-player`

* As a rule of thumb, the `pie-player` does not 'save' any data itself. Some of it's api may make modifications but saving is something that should happen elsewhere. 
* rename `set session( s: [{id, ...}, ...]` to `set sessions( s: [{id, ...}, ...])` - note the extra 's', we set an array of session objects for each element instance.
* remove `completeResponse()` and `isComplete()` - 'completeness' is something that is outside of the scope of the pie player and it's sessions array. should be handled at a higher layer.
* `reset()` - retain. Update the docs to say: 'delete all properties in each object in the sessions array except for `id`.' 
* `resetResponse()` - retain. Update the docs to say: 'delete `response` field in each object in the sessions array.
* rename `getSessionStatus()` to either `status()` or `sessionsStatus()` that returns an array that mirrors what's in `sessions`: `[{id, complete}, ...]`. We can add an `responsesComplete()` method at a later point that does `sessions().find(s => !s.complete) === undefined`.
 
## make event names consistent. 
* pick camel or kebab case , i'm suggesting kebab.
* remove namespaces
* `pie-player-ready` -> `ready`
* `response-change` -> `status-changed` (return same as `status()` above as the detail).
* `pie.model-updated` -> `model-updated`
* NEW: `model-update-failed` - when an error is caught calling `controller.model`. `{detail: { error}}`
* Note: no need for events for `getOutcome` because it returns a promise.

## `pie` element
* `session` - define `response` and `id`  as required fields.

### events

* `pie.responseComplete` & `pie.responseChanged` -> `response-changed` w/ `{detail: {complete: true|false, id: pie-id}}`
* keep `pie.register`? or rename to `register-pie` or even `pie-element-connected` closer to what has actually happened for the pie element instance?
