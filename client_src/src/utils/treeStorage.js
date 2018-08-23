export function saveTree(tree, user) {
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/trees/upsertWithWhere?where={"ownerId": ${user}}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        'jsonStr': JSON.stringify(tree),
        'ownerId': user,
      }),
    }
  ).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`ERROR saving tree! ${response.status} - ${response.statusText}`);
    }
  });
}

/**
 * Returns a promise for an array of trees
 * @param user
 * @return {Promise<Response | never>}
 */
export function loadTree(user) {
  return fetch(
    `${process.env.REACT_APP_SERVER_URL}/api/trees?where={"ownerId": ${user}}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
  ).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`ERROR loading tree! ${response.status} - ${response.statusText}`);
    }
  });
}
