# Overview

This is a full-stack restaurant ordering application built with React and Express. The system allows customers to scan QR codes at restaurant tables, browse an interactive menu with categories, add items to their cart, place orders, and track order status in real-time. The application also includes an admin dashboard for restaurant staff to manage orders and view analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing with pages for landing, menu, checkout, order status, and admin dashboard
- **State Management**: React Context for cart management and TanStack Query for server state
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **API Design**: RESTful endpoints for categories, menu items, orders, and analytics
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

## Database Schema
- **Users**: Basic user management with email, names, and profile images
- **Categories**: Menu organization with slugs and display ordering
- **Menu Items**: Products with pricing, descriptions, images, and 3D model URLs
- **Orders**: Order tracking with table numbers, status progression, and totals
- **Order Items**: Line items linking orders to menu items with quantities and pricing

## Development Workflow
- **Development**: Hot module replacement with Vite dev server
- **Production Build**: Vite for frontend bundling and esbuild for backend compilation
- **Database Migrations**: Drizzle Kit for schema management with push commands
- **Type Safety**: Shared TypeScript schemas between frontend and backend

## Authentication & Authorization
- Session-based authentication using PostgreSQL-backed sessions
- No complex user roles - simple admin vs customer distinction
- Table number validation for order placement

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form state management with validation

## UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette and search interface

## Payment Integration
- **@stripe/stripe-js**: Stripe payment processing for card transactions
- **@stripe/react-stripe-js**: React components for Stripe integration

## Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay