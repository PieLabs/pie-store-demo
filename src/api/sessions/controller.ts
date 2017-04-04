import * as _ from 'lodash';

export default class PieController {

  constructor(private config: any, private controllerMap: any) { }

  public model(session: { id: string }[], env) {
    return this.callComponentController('model', session, env)
  }

  private callComponentController(fnName, session, env) {
    const toData = (model) => {

      if (!model.element || !model.id) {
        throw new Error(`This model is missing either an 'element' or 'id' property: ${JSON.stringify(model)}`);
      }

      return {
        element: model.element,
        id: model.id,
        model,
        session: _.find(session, { id: model.id })
      };
    };

    const toPromise = (data) => {
      const failed = () => Promise.reject(new Error(`Can't find function for ${data.element}`));

      const modelFn = this.controllerMap[data.element][fnName] || failed;

      return modelFn(data.model, data.session, env)
        .then(result => {
          result.id = data.id;
          return result;
        });
    };

    const promises = _(this.config.models)
      .map(toData)
      .map(toPromise)
      .value();

    return Promise.all(promises);
  }
}