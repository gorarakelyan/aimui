export default class Series {
  constructor(run, metric, trace) {
    this.run = run;
    this.metric = metric;
    this.trace = trace;
  }

  get params() {
    return this.run.params;
  }

  get experimentName() {
    return this.run.experiment_name;
  }

  get runHash() {
    return this.run.run_hash;
  }

  get metricInfo() {
    return this.metric;
  }

  get traceInfo() {
    return this.trace;
  }

  get maxStep() {
    return this.trace.data[this.trace.data.length - 1][1];
  }

  get maxEpoch() {
    return this.trace.data[this.trace.data.length - 1][2];
  }

  get maxTime() {
    return this.trace.data[this.trace.data.length - 1][3];
  }

  get minTime() {
    return this.trace.data[0][3];
  }

  getPoint = (index) => {
    if (index >= 0 && !!this.trace.data && this.trace.data.length > index) {
      return this.trace.data[index];
    }
    return null;
  };

  getValue = (index) => {
    const point = this.getPoint(index);
    return point !== null ? point[0] : null;
  };
}
