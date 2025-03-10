import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: any; // Tu peux remplacer `any` par un type spécifique si besoin
  }
}
