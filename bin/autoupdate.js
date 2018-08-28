'use strict';
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const ds = app.datasources.mysqlDS;

ds.autoupdate(null, function(err) {
  if (err) {
    ds.disconnect();
    throw err;
  }

  console.log(`Autoupdate completed.`);
  ds.disconnect();
});
