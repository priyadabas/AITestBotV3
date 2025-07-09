# UAT Testing AI Bot

## Overview

This is a full-stack web application that provides AI-powered User Acceptance Testing (UAT) for product development. The system allows users to upload Product Requirements Documents (PRDs), Figma designs, and code to automatically generate comprehensive test scenarios and execute them using AI-powered bots.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
- **Frontend**: React with TypeScript, built with Vite
- **Backend**: Express.js with TypeScript (ESM)
- **Database**: PostgreSQL with Drizzle ORM
- **Shared**: Common schema and types between frontend and backend
- **Build System**: Vite for frontend, esbuild for backend

### Key Architectural Decisions

**Monorepo with Shared Types**: The application uses a monorepo structure with a shared folder containing database schemas and types. This ensures type safety across the entire application and eliminates duplication between frontend and backend.

**AI Service Integration**: The system integrates with both Google Gemini and OpenAI APIs for AI-powered analysis and test generation. Gemini is the primary service used, with OpenAI as an available alternative.

**TypeScript with ESM**: The entire application uses TypeScript with ES modules, providing modern JavaScript features and better type safety.

## Key Components

### Database Schema
- **Projects**: Core project entity with name, description, and timestamps
- **Uploads**: File upload tracking with metadata (PRD, Figma, code)
- **Analysis Results**: AI analysis results with progress tracking and insights
- **Test Scenarios**: Generated test cases with priority, type, and execution status
- **Bot Executions**: Test execution results and status tracking

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation

### Backend Services
- **File Processing**: Handles PRD (text/PDF), Figma URL, and code uploads
- **AI Services**: Gemini and OpenAI integration for content analysis
- **Storage Layer**: Database abstraction with Drizzle ORM
- **API Routes**: RESTful endpoints for all application features

## Data Flow

1. **Upload Phase**: Users upload PRD documents, Figma designs, and code
2. **Analysis Phase**: AI services analyze uploaded content to extract requirements and insights
3. **Test Generation**: AI generates comprehensive test scenarios based on analysis
4. **Execution Phase**: AI bots execute test scenarios (planned feature)
5. **Results Dashboard**: Users view test results and recommendations

## External Dependencies

### AI Services
- **Google Gemini**: Primary AI service for content analysis and test generation
- **OpenAI**: Alternative AI service (GPT-4o model configured)

### Database
- **Neon Database**: PostgreSQL database service
- **Drizzle ORM**: Type-safe database queries and migrations

### File Storage
- **Local Storage**: Files stored in uploads directory
- **Multer**: File upload middleware with 50MB limit

### UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library for UI elements

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend development
- **TSX**: TypeScript execution for backend development
- **Environment Variables**: Configuration through .env files

### Production Build
- **Frontend**: Vite build outputs to dist/public
- **Backend**: esbuild bundles server to dist/index.js
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **GEMINI_API_KEY**: Google Gemini API key (required)
- **OPENAI_API_KEY**: OpenAI API key (optional)

The application is designed to be deployed on platforms like Replit, with proper configuration for both development and production environments.