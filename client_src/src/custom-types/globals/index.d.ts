/*
 * This 'imports' types package is a workaround for global types that rely on imported types.
 * Such global types cannot reside in the normal global.d.ts since the presence of import/export would make the file a module.
 * TypeScript 2.9 introduced import() types (see reference), but Babel 7 (used by create-react-app) does not support it at this time.
 * Reference: https://blogs.msdn.microsoft.com/typescript/2018/05/16/announcing-typescript-2-9-rc/.
 */

import * as Quill from 'quill';
import { AnyAction } from "redux";

declare global {
  type DeltaT = Quill.Delta;
  type NodeTypeT = 'folder' | 'item';
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
    tree: Array<TreeNodeT>;
    dateCreated: number;
    dateModified: number;
  }

  interface TreeNodeT {
    title: string;
    subtitle: string;
    uniqid: string;
    id: string;
    type: NodeTypeT;
    expanded?: boolean;
    children?: Array<TreeNodeT>;
  }

  type TreeNodePathT = Array<string>;

  interface ActiveNodeT {
    id: string;
    path: Array<string>;
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
