// Re-export everything
export * from './shared/types';
export * from './shared/config';

// Client-side API (use in 'use client' components)
export * from './client';

// Re-export the server API (use in Server Components)
export * from './server';

// Main API object is not exported by default
// Import specific API based on your component type:
//
// For client components:
// import clientApi from '@/lib/api/client';
//
// For server components:
// import { serverApi } from '@/lib/api/server';