import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import thunk from 'redux-thunk';

import reducers from '../reducers';

const config = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: []
};

const reducer = persistCombineReducers(config, reducers);

export default function configureStore(initialState = {}) {
  const store = createStore(reducer, initialState, applyMiddleware(thunk));

  const persistor = persistStore(store);
  // dev purposes only - purge persisted data
//   const persistor = persistStore(store).purge();

  return { persistor, store };
}
