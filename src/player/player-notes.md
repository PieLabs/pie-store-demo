This application is an example of using `pie` within a larger context. 
The application has it's own business constraints (loosely modelled on the CoreSpring player app).
This is to allow us to tease out the `pie` api and check that it's methods are useful in a testing context.

[here are the pie api docs.](https://pielabs.github.io/pie-docs/using/pie-player-api.html) 

# The App

The app simulates a test environment, where a question is rendered to the user. The controller logic resides on the server so that it is inaccessible to the user. The app adds some additional constraints that protect access to inappropriate data.  

The ui also provides a way of making raw changes without constraints to assist with fleshing out the api.

## Model 

* items - a set of `pie` items with config and markup.
* sessions - a set of sessions that represent a user's interaction with a `pie` item

## Constraints 

* a user may only make changes when `session.isComplete` is `false`.
* a user may only save changes when `session.isComplete` is `false`.
* a user may only submit (save & set `session.isComplete` to `true`) when `session.isComplete` is `false`.
* a user may change modes to `view` and `evaluate` mode if `session.isComplete` is `true` but not to `gather`.


## app <=> pie api 

# pie element

## setters 

* model - the model that (along with session) drives the ui.
* session - the users session with the element. must contain `id` and store user input in `response`, after that anything else may be stored in the object. 

### Events 

* [pie.register](https://pielabs.github.io/pie-docs/developing/custom-element.html) - used by `pie-player`.
* [pie.responseChanged](https://pielabs.github.io/pie-docs/developing/custom-element.html) - not in use - TODO - add.
* [pie.responseCompleted](https://pielabs.github.io/pie-docs/developing/custom-element.html) - not in use - TODO - add.


# pie-player 


## setters 
* session :   move to `set sessions : [{id, stash,  ...}, ...]` - TODO
* env : `{ mode: 'gather|view|evaluate, ...}`
* controller : an object that exposes `model(session, env) : Promise<{}>` and `outcome(session, env) : Promise<{}>`.

> Setting `env` and `session` will trigger a call to `controller.model` the result of which is set on each `pie` element.

## Events 
* [pie-player-ready](https://pielabs.github.io/pie-docs/using/pie-player-api.html) - not used.
* [response-change](https://pielabs.github.io/pie-docs/using/pie-player-api.html) - for when the 'status' changes? - not implemented in pie-player.
* [pie.model-updated]() - Dispatched when the player has received a successful response from `controller.model`. Not documented, but implemented in `pie-player`.
* [pie.model-update.error]() - Dispatched when the player received an error from `controller.model`. Not documented, but implemented in `pie-player`.


## Methods

#### `getOutcome(): Promise<Outcome>` 

Calculate the outcome for the sessions array in the player. Will call `controller.outcome(sessions, env) : Promise<Outcome>`.

App constraints:

* loading the outcome will fail if the current app-session is not complete
* loading the outcome will fail if the user is not in evaluate

> There will probably be a need to get outcomes outside of the scope of a `pie-player`.

#### getSessionStatus() : {...} -> sessionsStatus() : [{id, complete}, ...]
get `responseStatus()` instead? `{count: {total: 2, completed: 1}, allCompleted: false}`
> remove `isComplete` which is bound to a `session` concept.


#### isComplete? 
remove this.

#### reset : Promise<void>

delete all properties in each object in the sessions array except for `id`.
 
> Note: does not persist the changes. save the object yourself with your own constraints once the promise has resolved.

#### resetResponse : Promise<void>

delete `response` field in each object in the sessions array. so if it was `{id, x, y, response}` it'll become `{id, x, y}`. 

> Note: does not persist the changes. save the object yourself with your own constraints once the promise has resolved.

#### getLanguages : Promise<string[]> ??

This is a property on the root of the item model. The player doesn't have access to this, but maybe it's something we init the player with?

#### completeResponse?
remove - to do with a session object that i consider to be outside of the scope of `pie`.


