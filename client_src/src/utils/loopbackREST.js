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
    filter = `?where={"id":"${id}"}`;
  } else if (ownerId) {
    filter = `?where={"ownerId":"${ownerId}"}`;
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
  );
}

/**
 * If multiple items match, results are returned in an array.
 * @param collectionName {string} Name of the table or collection
 * @param id {string}
 * @param ownerId {string}
 * @return {Promise<Response | never>}
 */
export function load({ collectionName = '', id = '', ownerId = '' }) {
  const ownerFilter = ownerId ? `?where={"ownerId": "${ownerId}"}` : '';
  const idFilter = id ? `/${id}` : '';
  if (!collectionName) {
    return Promise.reject('Load aborted: invalid collection name.');
  }
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}${idFilter}${ownerFilter}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
  );
}
