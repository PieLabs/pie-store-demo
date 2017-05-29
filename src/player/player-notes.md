This application is an example of using `pie` within a larger context. 
The application has it's own business constraints (loosely modelled on the CoreSpring player app).
This is to allow us to tease out the `pie` api and check that it's methods are useful in a testing context.

[here are the pie api docs.](https://pielabs.github.io/pie-website/docs/using/pie-player-api/) 

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
* `outcomes` will only return the outcome if `session.isComplete` is `true`.
* `outcomes` will fail if the responses passed in from the client, don't match what's saved in the session.

