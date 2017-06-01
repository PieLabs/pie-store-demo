# class diagram 

## pie-player 

* `model-update-error` event is removed. Use the `Promise.catch` that you get from calling `set sessions`, or `set env`.
* `model-updated` event is deprecated. Use the `Promise.then` that you get from calling `set sessions`, or `set env`.

* `sessions-changed` event object contains: `{ detail: { statuses: [] }}`.

* the `pie-player` does not set `env` on child pie instances.

* calling `sessions([])` should be mandatory, because right now the client of the player has no other way of accessing the session array. however you can pass in an empty array instance and the player will populate it with session objects.

## pie element

* only needs to have `set model` and `set session`. `set env` not needed (env is passed to `controller.model` where the appropriate model can be created for the ui).

# Controller 

It may be worth renaming `PieClientSideController` to just `PieController`, because it is not specific to the client side (it may run server side too).

`outcome` returns `{ summary, pies: [], weights: []}` - [see  here](https://pielabs.github.io/pie-website/docs/using/pie-player-api/#outcome--codeobjectcode)

# Config 
* `correctResponse` is not mandatory. it's in the 'model' box.

