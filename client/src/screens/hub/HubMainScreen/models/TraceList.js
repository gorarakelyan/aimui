import Trace from './Trace';
import { deepEqual, getObjectValueByPath, arraysIntersection } from '../../../../utils';
import { COLORS } from '../../../../constants/colors';
import { STROKES } from '../../../../constants/strokes';
import _ from 'lodash';
import Series from './Series';

export default class TraceList {
  constructor(grouping = null) {
    this.traces = [];

    this.grouping = grouping;
    /*
      Example:
      {
        'color': ['params.hparams.learning_rate'],
        'stroke': ['params.hparams.batch_size'],
        'chart': ['params.hparams.learning_rate'],
      }
     */

    this.groupingFields = Object.values(this.grouping).flat().filter((v, i, self) => self.indexOf(v) === i);

    this.groupingConfigMap = {
      colors: [],
      strokes: [],
      charts: [],
    };
    /*
      Example:
      {
        colors: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: '#AAA',
          }, {
            ...
          }
        ],
        strokes: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: '2 2',
          }, {
            ...
          }
        ],
        charts: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: 0,
          }, {
            ...
          }
        ],
      }
     */

    this.groups = {};
    /*
      Example:
      {
        'params.hparams.learning_rate': [
          {
            value: 0.01,
            group: {
              'params.hparams.batch_size': [
                {
                  value: 32,
                  group: {},
                }, {
                  value: 64,
                  group: {},
                },
              ],
            },
          }, {
            value: 0.001,
            group: {
              'params.hparams.batch_size': [
                {
                  value: 64,
                  group: {},
                }, {
                  value: 128,
                  group: {},
                },
              ],
            },
          },
        ],
      }
     */
  }

  addTrace = (trace) => {
    this.traces.push(trace);
  };

  getRunParam = (paramName, run, metric, trace) => {
    if (paramName === 'experiment') {
      return run.experiment_name;
    } else if (paramName === 'run.hash') {
      return run.run_hash;
    } else if (paramName === 'metric') {
      return metric.name;
    } else if (paramName.startsWith('context.')) {
      const contextKey = paramName.substring(8);
      return !!trace.context && Object.keys(trace.context).indexOf(contextKey) !== -1 ? trace.context[contextKey] : 'None';
    } else if (paramName.startsWith('params.')) {
      try {
        return getObjectValueByPath(run.params, paramName.substring(7));
      } catch (e) {
        return 'None';
      }
    } else {
      try {
        return getObjectValueByPath(run.params, paramName);
      } catch (e) {
        return 'None';
      }
    }
  };

  addSeries = (run, metric, trace, alignBy = 'step') => {
    let subGroup = this.groups;
    this.groupingFields.forEach(g => {
      const groupVal = this.getRunParam(g, run, metric, trace);

      if (Object.keys(subGroup).indexOf(g) === -1) {
        subGroup[g] = [];
      }

      let valueExists = false;
      for (let i = 0; i < subGroup[g].length; i++) {
        if (subGroup[g][i].value === groupVal) {
          valueExists = true;
          subGroup = subGroup[g][i].group;
          break;
        }
      }

      if (!valueExists) {
        subGroup[g].push({
          value: groupVal,
          group: {},
        });
        subGroup = subGroup[g][subGroup[g].length - 1].group;
      }
    });

    const traceModelConfig = {};
    this.groupingFields.forEach(g => {
      traceModelConfig[g] = this.getRunParam(g, run, metric, trace);
    });

    let traceModel = null;
    for (let t = 0; t < this.traces.length; t++) {
      if (this.traces[t].matchConfig(traceModelConfig)) {
        traceModel = this.traces[t];
      }
    }

    if (traceModel === null) {
      traceModel = new Trace(traceModelConfig);
      this.addTrace(traceModel);
    }

    // Apply coloring
    if ('color' in this.grouping) {
      let color = null;
      const modelColorConfigKeys = arraysIntersection(Object.keys(traceModelConfig), this.grouping.color);
      const modelColorConfig = {};
      modelColorConfigKeys.forEach(k => {
        modelColorConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.colors.forEach(colorGroup => {
        if (color === null && deepEqual(colorGroup.config, modelColorConfig)) {
          color = colorGroup.value;
        }
      });
      if (color === null) {
        // Get new color
        const usedColors = this.groupingConfigMap.colors.map(colorGroup => colorGroup.value);
        const availableColors = _.difference(COLORS, usedColors);
        // TODO: Generate new colors
        color = availableColors.length ? availableColors[0] : COLORS[0];
        this.groupingConfigMap.colors.push({
          config: modelColorConfig,
          value: color,
        });
      }
      traceModel.color = color;
    }

    // Apply stroke styling
    if ('stroke' in this.grouping) {
      let stroke = null;
      const modelStrokeConfigKeys = arraysIntersection(Object.keys(traceModelConfig), this.grouping.stroke);
      const modelStrokeConfig = {};
      modelStrokeConfigKeys.forEach(k => {
        modelStrokeConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.strokes.forEach(strGroup => {
        if (stroke === null && deepEqual(strGroup.config, modelStrokeConfig)) {
          stroke = strGroup.value;
        }
      });
      if (stroke === null) {
        // Get new stroke style
        const usedStrokes = this.groupingConfigMap.strokes.map(strGroup => strGroup.value);
        const availableStrokes = _.difference(STROKES, usedStrokes);
        // TODO: Generate new strokes
        stroke = availableStrokes.length ? availableStrokes[0] : STROKES[0];
        this.groupingConfigMap.strokes.push({
          config: modelStrokeConfig,
          value: stroke,
        });
      }
      traceModel.stroke = stroke;
    }

    // Apply division to charts
    if ('chart' in this.grouping) {
      // FIXME: Remove code/logic duplication -> one function to handle color, stroke styling and chart division
      let chart = null;
      const modelChartConfigKeys = arraysIntersection(Object.keys(traceModelConfig), this.grouping.chart);
      const modelChartConfig = {};
      modelChartConfigKeys.forEach(k => {
        modelChartConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.charts.forEach(chartGroup => {
        if (chart === null && deepEqual(chartGroup.config, modelChartConfig)) {
          chart = chartGroup.value;
        }
      });
      if (chart === null) {
        const chartsIndices = this.groupingConfigMap.charts.map(chartGroup => chartGroup.value).sort();
        chart = chartsIndices.length ? chartsIndices[chartsIndices.length - 1] + 1 : 0;
        this.groupingConfigMap.charts.push({
          config: modelChartConfig,
          value: chart,
        });
      }
      traceModel.chart = chart;
    }

    // Add series to trace
    const seriesModel = new Series(run, metric, trace);
    traceModel.addSeries(seriesModel);
    this.setAxesValues(alignBy);
  };

  getChartsNumber = () => {
    return this.groupingConfigMap.charts.length;
  };

  setAxesValues = (alignBy) => {
    switch (alignBy) {
      case 'step':
        this.traces.forEach(traceModel => {
          traceModel.series.forEach(series => {
            const { trace } = series;
            trace.axesValues = [];
            trace.data.forEach(point => {
              trace.axesValues.push(point[1]);
            });
          })
        });
        break;
      case 'epoch':
        let trainSteps = {};
        this.traces.forEach(traceModel => {
          traceModel.series.forEach(series => {
            const { run, metric, trace } = series;
            trace.axesValues = [];
            let trainKey = metric.name + '_' + run.run_hash;
            trace.data.forEach(point => {
              if (this.grouping.chart.includes('context.subset') || trace?.context?.subset === 'train') {
                trainSteps[trainKey] = trace.data;
                trace.axesValues.push(point[1]);
              } else if (trace?.context?.subset === 'val') {
                trace.axesValues.push(_.findLast(trainSteps[trainKey], elem => elem[2] === point[2])?.[1] ?? point[1]);
              } else {
                trace.axesValues.push(point[1]);
              }
            });
          })
        });
        break;
    }
  };
}
