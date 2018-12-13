let _save: Function = () => Promise.reject(new Error('Save aborted. Cause: No Storage implementation provided.'));
let _load: Function = () => Promise.reject(new Error('Load aborted. Cause: No Storage implementation provided.'));
let _remove: Function = () => Promise.reject(new Error('Delete aborted. Cause: No Storage implementation provided.'));

export function inject({ save = _save, load = _load, remove = _remove }: { save: Function, load: Function, remove: Function })
  : void {
  _save = typeof save === 'function' ? save : _save;
  _load = typeof load === 'function' ? load : _load;
  _remove = typeof remove === 'function' ? remove : _remove;
}

export function save({ userId, editorContent }: { userId: string, editorContent: EditorContentT })
  : Promise<any> {
  if (!editorContent || !editorContent.content || !editorContent.delta || !editorContent.id) {
    return Promise.reject(new Error('invalid content.'));
  }

  if (!userId || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid userId.'));
  }

  return _save({
    collectionName: 'notes',
    id: editorContent.id,
    ownerId: userId,
    dataObj: {
      'id': editorContent.id,
      'title': editorContent.title || '',
      'body': editorContent.content,
      'delta': editorContent.delta,
      'dateCreated': editorContent.dateCreated || 0,
      'dateModified': editorContent.dateModified || 0,
      'ownerId': userId,
    },
  });
}

/**
 * Returns a promise for an array of content
 * @param noteId
 * @return {Promise<Response | never>}
 */
export function load({ id = '', userId = '' }: { id: string, userId: string })
  : Promise<EditorContentT> {
  if (!id || !userId || typeof id !== 'string' || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid parameters.'));
  }

  return _load({
    collectionName: 'notes',
    id,
    ownerId: userId,
  }).then((content: any) => {
    const propList = ['id', 'title', 'body', 'delta', 'dateCreated', 'dateModified'];
    if (content && (typeof content.hasOwnProperty === 'function') && propList.every(prop => content.hasOwnProperty(prop))) {
      // Note: We convert the retreived dates to milliseconds since Unix epoch.
      return {
        id,
        title: content.title,
        content: content.body,
        delta: typeof content.delta === 'string' ? JSON.parse(content.delta) : content.delta,
        dateModified: new Date(content.dateModified).getTime(),
        dateCreated: new Date(content.dateCreated).getTime(),
      };
    } else {
      const message = `Unrecognized data fetched. ID: ${id}`;
      return Promise.reject(new Error(message));
    }
  });
}

export function remove({ ids = '', userId = '' }: { ids: string, userId: string })
  : Promise<{ results: string|string[], count: number }> {
  if (!ids || !userId || (typeof ids !== 'string' && !Array.isArray(ids)) || (Array.isArray(ids) && !ids.length) || typeof userId !== 'string') {
    return Promise.reject(new Error('invalid parameters.'));
  } else {
    return _remove({
      collectionName: 'notes',
      ids,
      ownerId: userId,
    });
  }
}

