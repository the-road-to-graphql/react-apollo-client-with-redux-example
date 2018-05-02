import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './App';

import registerServiceWorker from './registerServiceWorker';

// Apollo Client Setup

const cache = new InMemoryCache();

const GITHUB_BASE_URL = 'https://api.github.com/graphql';

const httpLink = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`,
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache,
});

// Redux Store Setup

const initialState = {
  selectedRepositoryIds: [],
};

function repositoryReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SELECT_REPOSITORY': {
      return applyToggleSelectRepository(state, action);
    }
    default:
      return state;
  }
}

function applyToggleSelectRepository(state, action) {
  const { id, isSelected } = action;

  const selectedRepositoryIds = isSelected
    ? state.selectedRepositoryIds.filter(itemId => itemId !== id)
    : state.selectedRepositoryIds.concat(id);

  return { ...state, selectedRepositoryIds };
}

const store = createStore(repositoryReducer, initialState);

// Render

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <App />
    </Provider>
  </ApolloProvider>,
  document.getElementById('root'),
);

registerServiceWorker();
