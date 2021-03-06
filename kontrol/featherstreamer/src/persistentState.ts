import { Dictionary, Static, InstanceOf, String, Number as RuntypesNumber, Union, Boolean, Null } from 'runtypes';
import * as fs from 'fs';
import logger from './logger';
import { getConfig } from './config';

const StoredObject = Union(
  InstanceOf(Object),
  String,
  RuntypesNumber,
  Boolean,
  Null,
);
type StoredObject = Static<typeof StoredObject>;

const State = Dictionary(StoredObject, 'string');
type State = Static<typeof State>;

/**
 * Simple persistent key/value store.
 */
export class PersistentState {
  private state: {
    [key: string]: StoredObject,
  } | undefined;

  constructor(private readonly filename: fs.PathLike) { }

  get(key: string): StoredObject|undefined {
    const state = this.getState();
    return (key in state) ? state[key] : undefined;
  }

  set(key: string, value: StoredObject) {
    const state = this.getState();
    state[key] = value;
    fs.writeFileSync(this.filename, JSON.stringify(state), {
      encoding: 'utf8',
    });
  }


  private getState(): State {
    if (!this.state) {
      try {
        const contents: string = fs.readFileSync(this.filename, {
          encoding: 'utf8'
        });
        this.state = State.check(JSON.parse(contents));
      } catch (e) {
        logger.warn(`Could not read existing state, starting from scratch.`);
        this.state = {};
      }
    }
    return this.state;
  }
}

const persistentState = new PersistentState(getConfig().stateFile);
export default persistentState;