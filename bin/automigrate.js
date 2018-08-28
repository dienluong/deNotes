'use strict';
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const ds = app.datasources.mysqlDS;

ds.automigrate(null, function(err) {
  if (err) {
    ds.disconnect();
    throw err;
  }

  console.log(`Automigrate completed.`);
  ds.disconnect();
});
