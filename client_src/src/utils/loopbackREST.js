/** Update matching record or create new one if none exists. If both id and ownerId provided, ownerId is ignored.
 * @param collectionName {string} Name of the table or collection
 * @param id {string}
 * @param ownerId {string}
 * @param dataObj
 * @return {Promise<Response | never>}
 */
export function save({ collectionName = '', id = '', ownerId = '', dataObj }) {
  if (!collectionName) {
    return Promise.reject('Save aborted: invalid collection name.');
  }
  if (!id && !ownerId) {
    return Promise.reject('Save aborted: no valid ID provided.');
  }

  let filter = '';
  if (id) {
    filter = '?where=' + encodeURIComponent(`{"id":"${id}"}`);
  } else if (ownerId) {
    filter = '?where=' + encodeURIComponent(`{"ownerId":"${ownerId}"}`);
  }

  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}/upsertWithWhere${filter}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dataObj),
    }
  ).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR saving data to remote storage! ${response.status} - ${response.statusText}`));
    }
  });
}

/**
 * If multiple items match, results are returned in an array.
 * @param collectionName {string} Name of the table or collection
 * @param id {string}
 * @param ownerId {string}
 * @return {Promise<Response | never>}
 */
export function load({ collectionName = '', id = '', ownerId = '' }) {
  if (!collectionName) {
    return Promise.reject('Load aborted: invalid collection name.');
  }
  const ownerFilter = ownerId ? '?where=' + encodeURIComponent(`{"ownerId": "${ownerId}"}`) : '';
  const idFilter = id ? `/${id}` : '';
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}${idFilter}${ownerFilter}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    },
  ).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR loading data from remote storage! ${response.status} - ${response.statusText}`));
    }
  });
}

export function remove({ collectionName = '', ids = '' }) {
  if (!collectionName) {
    return Promise.reject('Delete aborted: invalid collection name.');
  }

  let idFilter;
  if (ids && typeof ids === 'string') {
    idFilter = `/${ids}`;
  } else if (Array.isArray(ids) && ids.length) {
    idFilter = `/multidelete?ids=${encodeURIComponent(JSON.stringify(ids))}`;
  } else {
    return Promise.reject('Delete aborted: invalid filter');
  }

  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}${idFilter}`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    },
  ).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(new Error(`ERROR deleting item from remote storage! ${response.status} - ${response.statusText}`));
    }
  });
}

// TODO: remove
// export function removeMultiple({ collectionName = '', ids = [] }) {
//   if (!collectionName) {
//     return Promise.reject('Delete aborted: invalid collection name.');
//   }
//   const idFilter = Array.isArray(ids) && ids.length ? `?ids=${encodeURIComponent(JSON.stringify(ids))}` : '?ids=[]';
//   return fetch(
//     `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}/multidelete${idFilter}`,
//     {
//       method: 'DELETE',
//       headers: {
//         'Accept': 'application/json',
//       },
//     },
//   );
// }
