import uniqid from 'uniqid';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

export const getNodeKey = ({ node }) => node.id;
export function createNode({
  title = 'New Note',
  subtitle = new Date().toLocaleString(),
  type = 'item',
}) {
  const newNode = {
    title,
    subtitle,
    type,
    uniqid: uniqid(),
    get id() {
      return `${this.type}${ID_DELIMITER}${this.uniqid}`;
    },
  };

  if (type === 'folder') {
    newNode.children = [];
    newNode.title = title === 'New Note' ? 'New Folder' : title;
  }

  return newNode;
}
