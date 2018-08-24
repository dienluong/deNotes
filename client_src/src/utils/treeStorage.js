import { save, load } from './loopbackREST';

export function saveTree(tree, userId) {
  return save(userId, {
    'jsonStr': JSON.stringify(tree),
    'ownerId': userId,
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`ERROR saving tree! ${response.status} - ${response.statusText}`);
    }
  });
}

/**
 * Returns a promise for an array of trees
 * @param userId
 * @return {Promise<Response | never>}
 */
export function loadTree(userId) {
  return load(userId)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`ERROR loading tree! ${response.status} - ${response.statusText}`);
      }
    });
}
