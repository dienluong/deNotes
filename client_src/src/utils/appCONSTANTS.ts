interface nodeTypesT {
  FOLDER: Readonly<string>;
  ITEM: Readonly<string>;
}
export const nodeTypes: Readonly<nodeTypesT> = {
  FOLDER: 'FOLDER_NODE',
  ITEM: 'ITEM_NODE',
};

export const NONE_SELECTED: Readonly<string> = '<NO_NODE_SELECTED>';
