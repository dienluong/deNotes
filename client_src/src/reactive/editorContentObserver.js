export default ({ user, storage }) => {
  const observer = function observer(editorContent) {
    // TODO: remove
    // Save only if 1) content was not from initial load, 2) if content changed, 3) content is for the same note (i.e. not content of newly loaded note)

    // Save 1) if newly created note -OR- 2) if content of already opened note changed.
    if (editorContent.dateCreated > observer.lastSavedDate || (editorContent.id === observer.lastContentId && editorContent.dateModified > observer.lastSavedDate)) {
      storage.save({ userId: user, editorContent })
        .then(responseObj => {
          observer.lastSavedDate = editorContent.dateModified > editorContent.dateCreated ? editorContent.dateModified : editorContent.dateCreated;
          console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch((err) => window.alert('Failed to save editor content.' + err.message));// TODO: Failed save should retry
    } else {
      console.log('############### Content did not change. Skip saving.');
    }

    observer.lastContentId = editorContent.id;

    // TODO: remove
    // console.log('************* CONTENT *************\n');
    // console.log(JSON.stringify(editorContent, null, 4));

    // if (observer.prevContent !== editorContent && editorContent.id === observer.lastContentId) {
    //   storage.save({ userId: user, editorContent })
    //     .then(responseObj => {
    //       observer.prevContent = editorContent;
    //       console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
    //     })
    //     .catch(() => window.alert('Failed to save editor content'));// TODO: Failed save should retry
    // } else {
    //   observer.prevContent = editorContent;
    //   observer.lastContentId = editorContent.id;
    //   console.log('############### Content did not change. Skip saving.');
    // }
    // console.log('************* CONTENT *************\n');
    // console.log(JSON.stringify(editorContent, null, 4));
  };
  // observer.prevContent = null;

  observer.lastSavedDate = Date.now(); // ???
  observer.lastContentId = null;
  return observer;
};
