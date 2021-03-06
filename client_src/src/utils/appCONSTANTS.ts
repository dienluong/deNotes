interface nodeTypesInt {
  FOLDER: Readonly<string>;
  ITEM: Readonly<string>;
}

export const nodeTypes: Readonly<nodeTypesInt> = {
  FOLDER: 'FOLDER_NODE',
  ITEM: 'ITEM_NODE',
};

export const NONE_SELECTED: Readonly<string> = '<NO_NODE_SELECTED>';
export const DEFAULT_ID_DELIMITER: Readonly<string> = '|^|';
