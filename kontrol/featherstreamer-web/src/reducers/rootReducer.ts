import { combineReducers, AnyAction } from 'redux';
import { State } from 'featherstreamer-shared';

export type ApplicationAction = AnyAction;

export default combineReducers<State, ApplicationAction>({
});