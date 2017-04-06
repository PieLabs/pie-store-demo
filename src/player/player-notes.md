

[api docs](https://pielabs.github.io/pie-docs/using/pie-player-api.html) 

## Notes 


#### Method: `getOutcome(): Promise<Outcome>` 

 ```js
  /**
   * Calculate the outcome for the current session.  
   * @returns The method returns a Promise with the outcome 
   */
   function getOutcome() 
  ```

##### Example 

  ```js
 player.getOutcome().then(outcome => console.log(outcome));
  
 //output
 {
    summary: { maxPoints: 7, points: 7, percentage: 100 },
    pies: [
       {id: "01", score: {scaled: 1, min: 0, max:7, raw: 7}}
    ] 
 }
 ```

##### Call path

```js

  client  
    /** 
     * Get the outcome.
     * > the answers in the ui are what is used to generate the outcome 
     *   
     */
    > player.getOutcome() 
    /**
     * questions and answers have been retrieved 
     */
    > controller.getOutcome(questions[], sessions[], env)  
    > element.getOutcome(question, session, env)

```
* current session - should it be `answers`?
* `getOutcome` is a security sensitive call 


`getOutcome() : Promise<Outcome>`

* call `controller.getOutcome`

#### getSessionStatus?
#### isComplete?
#### reset?
#### resetResponse?
#### getLanguages?
#### completeResponse?
#### pie-player-ready
#### response-change
