export default ({ user, storage }) => {
  const observer = function observer(tree) {
    // Save only if tree was not from initial load or if it changed afterwards
    if (observer.prevTree !== null && observer.prevTree !== tree) {
      storage.save({ userId: user, tree })
        .then(responseObj => {
          observer.prevTree = tree;
          console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch((err) => window.alert('Failed to save notes list.' + err.message));// TODO: Failed save should retry.
    } else {
      observer.prevTree = tree;
      console.log('############### Tree did not change. Skip saving.');
    }
    // console.log('************* Tree *************\n');
    // console.log(JSON.stringify(tree, null, 4));
  };

  observer.prevTree = null;
  return observer;
};
