# raptor-query

Simple API to generate an InfluxQB query for Raptor data

### Installation

`npm install --save raptor-query`

### Usage

```js
var query = require('raptor-query/lib');

query({
  measurement: 'measure',
  context: 'clock.gaiamobile.org',
  metric: 'visuallyLoaded',
  branch: 'master',
  device: 'flame-kk',
  memory: '319',
  test: 'cold-launch',
  timeFilter: 'time > now() - 7d'
});

// SELECT MEAN(value) as value FROM "measure" WHERE "metric" = 'visuallyLoaded' AND "context" = 'clock.gaiamobile.org' AND "branch" = 'master' AND "device" = 'flame-kk' AND "memory" = '319' AND "test" = 'cold-launch' AND time > now() - 7d GROUP BY "revisionId" fill(none)
```

### Measurements

Common options:

- `branch`: git branch, e.g. `master`, `v2.5`
- `device`: physically-tested device, e.g. `flame-kk`, `aries`
- `memory`: configured device memory in MB, e.g. `319`, `512`, `2048`
- `timeFilter`: InfluxDB-compatible time clause, e.g. `time > now() - 7d`, `time = 2015-10-01`
- `database`: InfluxDB database name
- `host`: InfluxDB database hostname
- `port`: InfluxDB database port
- `username`: InfluxDB database username
- `password`: InfluxDB database password
- `protocol`: InfluxDB database protocol

---

`measurement: 'measure'` options:

- `context`: application context, e.g. `clock.gaiamobile.org`, `communications.gaiamobile.org@contacts`
- `metric`: performance measurement, e.g. `visuallyLoaded`, `fullyLoaded`
- `test`: performance test, e.g. `cold-launch`, `reboot`

---

`measurement: 'memory'` options:

- `context`: application context, e.g. `clock.gaiamobile.org`, `communications.gaiamobile.org@contacts`
- `metric`: performance memory, e.g. `uss`, `pss`
- `test`: performance test, e.g. `cold-launch`, `reboot`

---

`measurement: 'power'` options:

- `context`: application context, e.g. `clock.gaiamobile.org`, `communications.gaiamobile.org@contacts`
- `test`: power test, e.g. `camera_video`, `video_playback`

---

`measurement: 'mtbf'` options:

- `node`: lab environment, e.g. `moztwlab01`, `mozmtv01`
