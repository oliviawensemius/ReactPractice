// frontend/lib/apollo-websocket-client.ts - For main TT website
'use client';

import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

// HTTP Link for queries and mutations (to your main backend)
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/api/graphql', // Your main REST API
});

// WebSocket Link for subscriptions (to admin backend)
const wsLink = typeof window !== 'undefined' ? new WebSocketLink({
  uri: 'ws://localhost:4000/graphql', // Admin backend WebSocket
  options: {
    reconnect: true,
    connectionParams: () => {
      // Add auth token if needed
      const token = localStorage.getItem('authToken');
      return token ? { authorization: `Bearer ${token}` } : {};
    },
  },
}) : null;

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Split link - WebSocket for subscriptions, HTTP for everything else
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});