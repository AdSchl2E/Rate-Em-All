# Rate 'Em All

![Rate 'Em All Logo](frontend/public/images/logo.webp)

**Rate 'Em All** is a full-stack web application that lets you explore, rate, and collect your favorite Pokémon! Discover the complete Pokémon database, share your ratings, and see which Pokémon are most popular in the community.

## [Live Demo](https://rate-em-all.vercel.app/)

Visit [https://rate-em-all.vercel.app/](https://rate-em-all.vercel.app/) to try it out!

## Features

- **Explore Pokémon**: Browse through the complete Pokémon database with detailed information
- **Rate Pokémon**: Give your favorite Pokémon ratings from 1 to 5 stars
- **Favorites**: Create your personal collection of favorite Pokémon
- **User Profiles**: Customize your profile and see your rating history
- **Top Rated**: Discover which Pokémon are the community's favorites
- **Responsive Design**: Optimized for both desktop and mobile devices

## Technologies

### Frontend
- **Next.js 14** - React framework with server and client components
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **NextAuth.js** - Authentication solution

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication

### Deployment
- **Railway** - Platform for Postgres DB and NestJS backend
- **Vercel** - Platform for Next.js frontend

## Project Structure

```
Rate-Em-All/
├── frontend/          # Next.js application
│   ├── src/           # Source code
│   │   ├── app/       # Next.js app router
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities and API client
│   │   └── types/     # TypeScript type definitions
│   └── public/        # Static assets
└── backend/           # NestJS application
    └── src/           # Source code
        ├── auth/      # Authentication module
        ├── pokemon/   # Pokemon module
        └── user/      # User module

```

## Credits

- Developed by AdSchl2E
- All Pokémon rights belong to Nintendo
- Pokémon data provided by [PokéAPI](https://pokeapi.co/)

---

© 2025 Rate 'Em All. All rights reserved.
