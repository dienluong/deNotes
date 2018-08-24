/**
 * @param id
 * @param dataObj
 * @return {Promise<Response | never>}
 */
export function save(id, dataObj) {
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/trees/upsertWithWhere?where={"ownerId": ${id}}`,
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
 * @param id
 * @return {Promise<Response | never>}
 */
export function load(id) {
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/trees?where={"ownerId": ${id}}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
  );
}
