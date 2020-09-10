import { deepEqual } from '../../../../utils';
import Series from './Series';
import _ from 'lodash';

export default class Trace {
  constructor(config) {
    this.series = [];
    this.aggregation = {
      active: false,
      min: null,
      max: null,
      avg: null,
    };
    this.config = config;
    this.color = null;
    this.stroke = null;
    this.chart = null;
  }

  addSeries = (series) => {
    this.series.push(series);
    // TODO: Implement 'lazy' aggregation
    this.aggregate();
  };

  aggregate = () => {
    this.aggregation.min = this.aggregateSeries(values => _.min(values));
    this.aggregation.max = this.aggregateSeries(values => _.max(values));
    this.aggregation.avg = this.aggregateSeries(values => _.sum(values) / values.length);
  };

  aggregateSeries = (aggFunc) => {
    const trace = {
      data: [],
      num_steps: 0,
      context: null,
    };
    const metric = {
      name: null,
      traces: [trace],
    };
    const run = {
      experiment_name: null,
      run_hash: null,
      params: null,
      metrics: [metric],
    };

    // Aggregate params and configs
    const name = [];
    const experiment_name = [];
    const run_hash = [];
    const params = {};
    const context = {};
    this.series.forEach(s => {
      name.push(s.metric.name);
      experiment_name.push(s.run.experiment_name);
      run_hash.push(s.run.run_hash);
      // FIXME: Use deepmerge to merge arrays as well
      if (!!s.run.param) {
        _.merge(params, s.run.param);
      }
      if (!!s.trace.context) {
        _.merge(context, s.trace.context);
      }
    });
    trace.context = context;
    metric.name = _.uniq(name);
    run.run_hash = _.uniq(run_hash);
    run.experiment_name = _.uniq(experiment_name);
    run.params = params;

    // Aggregate data
    let idx = 0;
    while (true) {
      const values = [];
      let step = null;
      let epoch = null;
      let timestamp = null;
      this.series.forEach(s => {
        const point = s.getPoint(idx);
        if (point !== null) {
          values.push(point[0]);
          // TODO: Aggregate step(?) and relative time(!)
          step = point[1];
          epoch = point[2];
          timestamp = point[3];
        }
      });
      if (values.length > 0) {
        trace.data.push([aggFunc(values), step, epoch, timestamp]);
      } else {
        break;
      }
      idx += 1;
    }

    if (trace.data.length) {
      trace.num_steps = trace.data[trace.data.length-1][1];
    }

    return new Series(run, metric, trace);
  };

  matchConfig = (config) => {
    return deepEqual(config, this.config);
  };

  hasRun = (run_hash, metricName, traceContext) => {
    for (let i = 0; i < this.series.length; i++) {
      let series = this.series[i];
      if (
        series?.run?.run_hash === run_hash &&
        series.metric.name === metricName &&
        btoa(JSON.stringify(series.trace.context)).replace(/[\=\+\/]/g, '') === traceContext
      ) {
        return true;
      }
    }

    return false;
  }
}
