export default ({ user, storage }) => {
  const observer = function observer(editorContent) {
    // console.log('************* CONTENT *************\n');
    // console.log(JSON.stringify(editorContent, null, 4));
    // Save only if content was not from initial load or if it changed afterwards
    if (observer.prevContent !== null && observer.prevContent !== editorContent) {
      storage.save({ userId: user, editorContent })
        .then(responseObj => {
          observer.prevContent = editorContent;
          console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch(() => window.alert('Failed to save editor content'));// TODO: Failed save should retry
    } else {
      observer.prevContent = editorContent;
      console.log('############### Content did not change. Skip saving.');
    }
  };

  observer.prevContent = null;
  return observer;
};
