// admin-backend/src/index.ts - Fixed version
import "reflect-metadata";
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { AdminResolver } from './resolvers';
import { SubscriptionResolver } from './resolvers/subscription';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

async function startServer() {
  try {
    console.log('🚀 Starting TeachTeam Admin Backend with GraphQL Subscriptions...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const app: Application = express();
    const httpServer = createServer(app);
    const pubSub = new PubSub();

    app.use(session({
      secret: process.env.SESSION_SECRET || 'admin-super-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      }
    }));

    app.use(cors({
      origin: [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
    }));

    // Build GraphQL schema - FIXED: Remove pubSub from here
    const schema = await buildSchema({
      resolvers: [AdminResolver, SubscriptionResolver],
      validate: false,
      // Don't pass pubSub here - pass it in context instead
    });

    const server = new ApolloServer({
      schema,
      context: ({ req, res }) => ({
        req,
        res,
        user: req.session?.user,
        pubSub // Pass pubSub in context
      }),
      introspection: true,
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });

    await server.start();

    server.applyMiddleware({ 
      app: app as any, 
      path: '/graphql',
      cors: false
    });

    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
        onConnect: (connectionParams: any) => {
          console.log('🔄 Client connected to GraphQL subscriptions');
          return { pubSub };
        },
        onDisconnect: () => {
          console.log('🔌 Client disconnected from GraphQL subscriptions');
        },
      },
      {
        server: httpServer,
        path: '/graphql',
      }
    );

    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'TeachTeam Admin API with GraphQL Subscriptions is running',
        timestamp: new Date().toISOString(),
        graphql: server.graphqlPath,
        subscriptions: 'ws://localhost:4000/graphql'
      });
    });

    const PORT = process.env.PORT || 4000;

    httpServer.listen(PORT, () => {
      console.log(`🎯 Admin Server running on http://localhost:${PORT}`);
      console.log(`🔍 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🔄 GraphQL Subscriptions: ws://localhost:${PORT}/graphql`);
      console.log('🚨 HD Feature: Real-time candidate unavailability notifications');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();