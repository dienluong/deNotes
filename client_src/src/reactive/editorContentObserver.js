export default ({ user, storage }) => {
  const observer = function observer(editorContent) {
    // Save only if 1) content was not from initial load, 2) if content changed, 3) content is for the same note (i.e. not content of newly loaded note),
    if (observer.prevContent !== editorContent && editorContent.id === observer.contentId) {
      storage.save({ userId: user, editorContent })
        .then(responseObj => {
          observer.prevContent = editorContent;
          console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch(() => window.alert('Failed to save editor content'));// TODO: Failed save should retry
    } else {
      observer.prevContent = editorContent;
      observer.contentId = editorContent.id;
      console.log('############### Content did not change. Skip saving.');
    }
    // console.log('************* CONTENT *************\n');
    // console.log(JSON.stringify(editorContent, null, 4));
  };

  observer.prevContent = null;
  observer.contentId = null;
  return observer;
};
