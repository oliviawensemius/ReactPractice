// admin-frontend/src/lib/apollo-client.ts
'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // Important for session cookies
});

// Auth link to add headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  }
});

// Error link for better error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // If it's a server connection error, log helpful info
    if ('statusCode' in networkError) {
      console.error(`HTTP Status: ${networkError.statusCode}`);
    }
    
    // Check if admin backend is running
    if (networkError.message.includes('fetch')) {
      console.error('❌ Cannot connect to admin backend. Make sure admin-backend is running on port 4000');
      console.error('💡 Run: cd admin-backend && npm run dev');
    }
  }
});

// Create a function that returns a new Apollo Client instance
function createApolloClient() {
  return new ApolloClient({
    link: from([
      errorLink,
      authLink.concat(httpLink)
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        // Add any specific cache policies here if needed
      }
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    // Disable SSR for Apollo Client to avoid context issues
    ssrMode: false,
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
}

// Export a singleton instance for client-side usage
let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient() {
  if (!apolloClient) {
    apolloClient = createApolloClient();
    console.log('✅ Apollo Client initialized for admin dashboard');
    console.log('🔗 GraphQL endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql');
  }
  return apolloClient;
}

export default getApolloClient();