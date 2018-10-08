import { MutationObserver } from './test/mutationObserver';
global.MutationObserver = MutationObserver;
const fault = 10 / 0;
