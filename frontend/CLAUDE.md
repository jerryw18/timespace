# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` - Starts Vite dev server with HMR
- **Build for production**: `npm run build` - TypeScript compile + Vite build
- **Lint code**: `npm run lint` - Run ESLint on all files
- **Preview production build**: `npm run preview` - Preview built application

## Tech Stack & Architecture

This is a React + TypeScript frontend application built with Vite. Key technologies:

- **Build Tool**: Vite with React plugin and Tailwind CSS Vite plugin
- **Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS 4.x (using new Vite plugin)
- **HTTP Client**: Axios for API requests
- **Linting**: ESLint with TypeScript, React hooks, and React refresh plugins

## Project Structure

- `src/main.tsx` - Application entry point with React root
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles with Tailwind imports and custom CSS
- `public/` - Static assets
- TypeScript configuration uses project references (app + node configs)

## Key Configuration

- Vite config includes React and Tailwind CSS plugins
- ESLint configured for TypeScript + React with recommended rules
- Tailwind CSS imported via `@import "tailwindcss"` in index.css
- Dark/light mode support built into base CSS
