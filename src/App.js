import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import './App.css';

// Remote Query
const GET_REPOSITORIES_OF_ORGANIZATION = gql`
  {
    organization(login: "the-road-to-learn-react") {
      repositories(first: 20) {
        edges {
          node {
            id
            name
            url
            viewerHasStarred
          }
        }
      }
    }
  }
`;

// Local Query
// exported to be used in resolver to read this particular data from cache
export const GET_SELECTED_REPOSITORIES = gql`
  query {
    selectedRepositoryIds @client
  }
`;

// Remote Mutation
const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

// Local Mutation
const SELECT_REPOSITORY = gql`
  mutation($id: ID!, $isSelected: Boolean!) {
    toggleSelectRepository(id: $id, isSelected: $isSelected) @client
  }
`;

const App = () => (
  <Query query={GET_REPOSITORIES_OF_ORGANIZATION}>
    {({ data: { organization }, loading }) => {
      if (loading || !organization) {
        return <div>Loading ...</div>;
      }

      return (
        <Repositories repositories={organization.repositories} />
      );
    }}
  </Query>
);

const Repositories = ({ repositories }) => (
  <Query query={GET_SELECTED_REPOSITORIES}>
    {({ data: { selectedRepositoryIds } }) => (
      <RepositoryList
        repositories={repositories}
        selectedRepositoryIds={selectedRepositoryIds}
      />
    )}
  </Query>
);

const RepositoryList = ({ repositories, selectedRepositoryIds }) => (
  <ul>
    {repositories.edges.map(({ node }) => {
      const isSelected = selectedRepositoryIds.includes(node.id);

      const rowClassName = ['row'];

      if (isSelected) {
        rowClassName.push('row_selected');
      }

      return (
        <li className={rowClassName.join(' ')} key={node.id}>
          <Select id={node.id} isSelected={isSelected} />{' '}
          <a href={node.url}>{node.name}</a>{' '}
          {!node.viewerHasStarred && <Star id={node.id} />}
        </li>
      );
    })}
  </ul>
);

const Select = ({ id, isSelected }) => (
  <Mutation
    mutation={SELECT_REPOSITORY}
    variables={{ id, isSelected }}
  >
    {toggleSelectRepository => (
      <Fragment>
        <button type="button" onClick={toggleSelectRepository}>
          {isSelected ? 'Unselect' : 'Select'}
        </button>
      </Fragment>
    )}
  </Mutation>
);

const Star = ({ id }) => (
  <Mutation mutation={STAR_REPOSITORY} variables={{ id }}>
    {starRepository => (
      <Fragment>
        <button type="button" onClick={starRepository}>
          Star
        </button>
      </Fragment>
    )}
  </Mutation>
);

export default App;
