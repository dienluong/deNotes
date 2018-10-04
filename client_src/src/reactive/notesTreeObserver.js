export default ({ user, storage }) => {
  const observer = function observer(notesTree) {
    // TODO: remove
    // console.log(observer.lastSavedDate, notesTree.dateCreated, notesTree.dateModified);

    const mostRecentDate = notesTree.dateModified > notesTree.dateCreated ? notesTree.dateModified : notesTree.dateCreated;
    // Save only if tree was not from initial load and if it changed afterwards
    if (mostRecentDate > observer.lastSavedDate) {
      storage.save({ userId: user, notesTree })
        .then(responseObj => {
          observer.lastSavedDate = mostRecentDate;
          console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        })
        .catch((err) => window.alert('Failed to save notes list. ' + err.message));// TODO: Failed save should retry.
    } else {
      console.log('############### Tree did not change. Skip saving.');
    }
    // console.log('************* Tree *************\n');
    // console.log(JSON.stringify(tree, null, 4));
  };

  observer.lastSavedDate = Date.now();
  return observer;
};
