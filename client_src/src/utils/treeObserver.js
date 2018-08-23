export default (user) => {
  const observer = function observer(tree) {
    console.log('*********************** Tree *********************\n');
    console.log(JSON.stringify(tree, null, 4));
    if (observer.prevTree !== tree) {
      fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/trees/upsertWithWhere?where={"ownerId":1}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            'jsonStr': JSON.stringify(tree),
            'ownerId': user,
          }),
        }
      ).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Save response NOT OK: ${response.status} - ${response.statusText}`);
        }
      }).then(responseObj => {
        console.log(`$$$$$$$$$$$$$$$ Tree saved!!!\n${JSON.stringify(responseObj, null, 2)}`);
        observer.prevTree = tree;
      }).catch(err => console.log(err.message));
    } else {
      console.log('!!!!!!!!!!!!!!! Tree did not change. Skip saving.');
    }
  };

  observer.prevTree = null;
  return observer;
};
