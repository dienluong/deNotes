/** Update entry or create new one if none exists.
 * @param collectionName {string} Name of the table or collection
 * @param id
 * @param dataObj
 * @return {Promise<Response | never>}
 */
export function save({ collectionName, id, dataObj }) {
  // TODO: Need to modify this to support selection by id and ownerId, i.e. similar to load().
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}/upsertWithWhere?where={"ownerId": ${id}}`,
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
 * @param id
 * @param ownerId
 * @return {Promise<Response | never>}
 */
export function load({ collectionName = '', id = null, ownerId = null }) {
  const where = ownerId ? `?where={"ownerId": ${ownerId}}` : '';
  const idFilter = id ? `/${id}` : '';
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/${collectionName}${idFilter}${where}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
  );
}
