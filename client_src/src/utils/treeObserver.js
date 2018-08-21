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
          console.log('$$$$$$$$$$$$$$$ Tree saved!!!');
          observer.prevTree = tree;
        } else {
          throw new Error(`Save response NOT OK: ${response}`);
        }
      }).catch(err => console.log(err.message));
    } else {
      console.log('!!!!!!!!!!!!!!! Tree did not changed. Skip saving.');
    }
  };

  observer.prevTree = null;
  return observer;
};
