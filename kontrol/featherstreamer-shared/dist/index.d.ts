import { Record, Static } from 'runtypes';
declare const ServerState: Record<{}, false>;
declare type ServerState = Static<typeof ServerState>;
export { ServerState };
