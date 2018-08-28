import { saveTree } from '../utils/notesTreeStorage';

export default (user) => {
  const observer = function observer(tree) {
    console.log('************* Tree *************\n');
    console.log(JSON.stringify(tree, null, 4));
    // Save only if tree was not from initial load or if it changed afterwards
    if (observer.prevTree !== null && observer.prevTree !== tree) {
      saveTree({ userId: user, tree })
        .then(responseObj => {
          console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch(() => window.alert('Failed to save tree'));
    } else {
      console.log('############### Tree did not change. Skip saving.');
    }
    observer.prevTree = tree;
  };

  observer.prevTree = null;
  return observer;
};
