import { saveEditorContent } from '../utils/editorContentStorage';

export default (user) => {
  const observer = function observer(editorContent) {
    console.log('************* CONTENT *************\n');
    console.log(JSON.stringify(editorContent, null, 4));
    // Save only if content was not from initial load or if it changed
    if (observer.prevContent !== null && observer.prevContent !== editorContent) {
      saveEditorContent(editorContent, user)
        .then(responseObj => {
          console.log(`$$$$$$$$$$$$$$$ Content saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
          observer.prevContent = editorContent;
        })
        .catch(err => window.alert(err.message));
    } else {
      console.log('############### Content did not change. Skip saving.');
      observer.prevContent = editorContent;
    }
  };

  observer.prevContent = null;
  return observer;
};
