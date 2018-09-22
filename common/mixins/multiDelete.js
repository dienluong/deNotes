'use strict';
module.exports = function MultiDelete(Model) {
  Model.MultiDelete = function(ids, cb) {
    if (!ids || !Array.isArray(ids)) {
      if (typeof cb !== 'function') {
        return;
      }
      return cb('Invalid IDs argument.');
    }

    Model.destroyAll({
      id: {inq: ids},
    }, cb);
  };

  Model.remoteMethod('MultiDelete', {
    description: 'Delete multiple model instances by IDs from the data source.',
    accepts: [
      {
        'arg': 'ids',
        'type': ['string'],
        'description': 'Array of IDs',
        required: true,
      },
    ],
    returns: {
      type: 'object',
      root: true,
    },
    http: {
      path: '/multidelete',
      verb: 'del',
    },
  });
};
