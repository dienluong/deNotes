import { saveTree } from '../utils/treeStorage';

export default (user) => {
  const observer = function observer(tree) {
    console.log('************* Tree *************\n');
    console.log(JSON.stringify(tree, null, 4));
    // Save only if tree is not the initially loaded one or if it changed
    if (observer.prevTree !== null && observer.prevTree !== tree) {
      saveTree(tree, user)
        .then(responseObj => {
          console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
          observer.prevTree = tree;
        })
        .catch(err => window.alert(err.message));
    } else {
      console.log('############### Tree did not change. Skip saving.');
      observer.prevTree = tree;
    }
  };

  observer.prevTree = null;
  return observer;
};
