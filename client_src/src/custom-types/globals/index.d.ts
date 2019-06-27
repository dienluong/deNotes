/*
 * This 'imports' types package is a workaround for global types that rely on imported types.
 * Such global types cannot reside in the normal global.d.ts since the presence of import/export would make the file a module.
 * TypeScript 2.9 introduced import() types (see reference), but Babel 7 (used by create-react-app) does not support it at this time.
 * Reference: https://blogs.msdn.microsoft.com/typescript/2018/05/16/announcing-typescript-2-9-rc/.
 */

import * as Quill from 'quill';
import { AnyAction } from "redux";
import { nodeTypes } from '../../utils/appCONSTANTS';

declare global {
  type DeltaT = Quill.Delta;
  type NodeTypeT = typeof nodeTypes.FOLDER | typeof nodeTypes.ITEM;
  type StorageMethodNames = 'save' | 'load' | 'remove';
  type StorageMethodSignature = (params: { [key: string]: any }) => Promise<any>;
  type StorageT = {
    [key in StorageMethodNames]: StorageMethodSignature;
  }

  interface AppStateT {
    userInfo: UserInfoT;
    notesTree: NotesTreeT;
    activeNode: ActiveNodeT;
    editorContent: EditorContentT;
  }

  interface UserInfoT {
    id: string;
  }

  interface NotesTreeT {
    id: string;
    tree: TreeNodeT[];
    editMode: boolean;
    dateCreated: number;
    dateModified: number;
  }

  interface TreeNodeT {
    title: string;
    subtitle: string;
    uniqid: string;
    id: string;
    type: NodeTypeT;
    selected: boolean;
    expanded?: boolean;
    children?: TreeNodeT[];
  }

  type TreeNodePathT = (TreeNodeT['id'])[];

  interface ActiveNodeT {
    id: TreeNodeT['id'];
    path: TreeNodePathT;
  }

  interface EditorContentT {
    id: string;
    title: string;
    content: string;
    delta: DeltaT;
    dateCreated: number;
    dateModified: number;
    readOnly: boolean;
  }

  interface ActionError extends Error {
    action: AnyAction;
  }
}
