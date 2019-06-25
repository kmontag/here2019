import { Record, Static } from 'runtypes';
declare const State: Record<{}, false>;
declare type State = Static<typeof State>;
export { State };
