import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { InMemoryCache } from 'apollo-cache-inmemory';

import App, { GET_SELECTED_REPOSITORIES } from './App';

import registerServiceWorker from './registerServiceWorker';

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

const initialState = {
  selectedRepositoryIds: [],
};

const toggleSelectRepository = (_, { id, isSelected }, { cache }) => {
  let { selectedRepositoryIds } = cache.readQuery({
    query: GET_SELECTED_REPOSITORIES,
  });

  selectedRepositoryIds = isSelected
    ? selectedRepositoryIds.filter(itemId => itemId !== id)
    : selectedRepositoryIds.concat(id);

  cache.writeQuery({
    query: GET_SELECTED_REPOSITORIES,
    data: { selectedRepositoryIds },
  });

  // mutation result if needed
  // otherwise return null if not needed
  // in this case: not used, because mutation result is not used in Mutation component
  return { id, isSelected: !isSelected };
};

const stateLink = withClientState({
  cache,
  defaults: initialState,
  resolvers: {
    Mutation: {
      toggleSelectRepository,
    },
  },
});

const link = ApolloLink.from([stateLink, httpLink]);

const client = new ApolloClient({
  link,
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

registerServiceWorker();
