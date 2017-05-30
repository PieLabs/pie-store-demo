import * as _ from 'lodash';

import { buildLogger } from 'log-factory';

const logger = buildLogger();
export default class PieController {

  constructor(private config: any, private controllerMap: any) { }

  public model(session: { id: string }[], env) {
    return this.callComponentController('model', session, env);
  }

  public outcome(session: { id: string }[], env) {
    return this.callComponentController('outcome', session, env)
      .then(pies => {
        const weights = this.mkWeights();
        const summary = this.mkSummary(pies, weights);
        return { summary, pies, weights };
      });
  }

  private mkSummary(pies: any[], weights: any[]) {
    const max = _(weights).map(w => w.weight).reduce((a, b) => a + b, 0);
    const min = 0;
    const weight = (id) => (_.find(weights, w => w.id === id) || { weight: 1 }).weight;
    const rawScore = _(pies).map(p => {
      if (isNaN(p.score)) {
        throw new Error('score is not a number: ' + JSON.stringify(p));
      } else {
        return p.score * weight(p.id);
      }
    }).reduce((a, b) => a + b, 0);
    const score: number = parseFloat(rawScore.toFixed(2));
    const percentage = (score / max) * 100;
    return {
      max,
      min,
      percentage,
      score
    };
  }

  private mkWeights() {
    const configWeights = _.cloneDeep(this.config.weights || []);
    _.forEach(this.config.models, m => {
      if (!_.some(configWeights, (w: any) => w.id === m.id)) {
        configWeights.push({ id: m.id, weight: 1 });
      }
    });
    return configWeights;
  }

  private callComponentController(fnName, session, env) {

    logger.debug('session: ', JSON.stringify(session, null, '  '));

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

      logger.debug('data: ', JSON.stringify(data, null, '  '));
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
