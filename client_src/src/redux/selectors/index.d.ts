import { Selector } from 'reselect';
export const selectTitlesFromActivePath: Selector<AppStateT, string[]|[]>;
export const selectChildrenOfActiveFolder: Selector<AppStateT, object[]|[]>;
