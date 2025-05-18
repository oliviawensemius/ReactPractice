// backend/src/types/express-session.d.ts

import 'express-session';

declare module 'express-session' {
  interface Session {
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}