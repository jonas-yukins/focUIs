# focUIs App - Transform Your Smartphone

This is a modern TypeScript monorepo featuring a minimalist mobile app that helps users reduce screen time by transforming their smartphones into "focUIs" devices. The app replaces colorful app icons with monochrome widgets displaying plain-text app names.

## Features

- **Minimalist Interface**: Replace colorful app icons with clean, text-based widgets
- **Customizable App Selection**: Choose exactly which apps to display on your home screen
- **Cross-Platform**: Works on both iOS and Android devices
- **Privacy Focused**: No tracking, no ads, no data collection
- **Real-time Sync**: Your app preferences sync across all devices
- **Customizable Themes**: Multiple themes and font sizes to match your preferences

## Tech Stack

- **Turborepo**: Monorepo management
- **React 19**: Latest React with concurrent features
- **Next.js 15**: Web app & marketing page with App Router
- **Tailwind CSS v4**: Modern CSS-first configuration
- **React Native [Expo](https://expo.dev/)**: Mobile/native app with New Architecture
- **[Convex](https://convex.dev)**: Backend, database, server functions
- **[Clerk](https://clerk.dev)**: User authentication

## Project Structure

This monorepo template includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js 15](https://nextjs.org/) marketing website with Tailwind CSS and Clerk
- `native`: a [React Native](https://reactnative.dev/) app built with [expo](https://docs.expo.dev/)
- `packages/backend`: a [Convex](https://www.convex.dev/) folder with the database schema and shared functions

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Getting Started

### 1. Install dependencies

If you don't have `pnpm` installed, run `npm install --global pnpm`.

Run `pnpm install`.

### 2. Configure Convex

```sh
npm run setup --workspace packages/backend
```

The script will log you into Convex if you aren't already and prompt you to create a project (free). It will then wait to deploy your code until you set the environment variables in the dashboard.

Configure Clerk with [this guide](https://docs.convex.dev/auth/clerk). Then add the `CLERK_ISSUER_URL` found in the "convex" template [here](https://dashboard.clerk.com/last-active?path=jwt-templates), to your Convex environment variables [here](https://dashboard.convex.dev/deployment/settings/environment-variables&var=CLERK_ISSUER_URL).

Make sure to enable **Google and Apple** as possible Social Connection providers, as these are used by the React Native login implementation.

### 3. Configure both apps

In each app directory (`apps/web`, `apps/native`) create a `.env.local` file using the `.example.env` as a template and fill out your Convex and Clerk environment variables.

- Use the `CONVEX_URL` from `packages/backend/.env.local` for `{NEXT,EXPO}_PUBLIC_CONVEX_URL`.
- The Clerk publishable & secret keys can be found [here](https://dashboard.clerk.com/last-active?path=api-keys).

### 4. Run both apps

Run the following command to run both the web and mobile apps:

```sh
npm run dev
```

This will allow you to use the ⬆ and ⬇ keyboard keys to see logs for each of the Convex backend, web app, and mobile app separately.

## Mobile App Features

### App Selection
- Show list of all installed apps on the device
- Allow users to select which apps to display
- Fallback to manual entry for iOS (due to platform restrictions)

### Widget Interface
- Minimal in-app screen that mimics a widget interface
- Clean, text-only app names
- Customizable layout (grid or list)

### Permissions
- Android: Can access installed apps with proper permissions
- iOS: Gracefully handles platform-specific limitations

## Design Guidelines

The app follows a minimalist design philosophy:

### Color Palette
- Primary Light Gray: #E1E1E1
- Primary Deep Navy: #172F50
- Extra Light Gray: #F7F7F7
- Medium Gray: #B3B3B3
- Dark Gray: #7A7A7A
- Extra Dark Gray: #3D3D3D
- Lightest Blue: #C8D2E0
- Lighter Blue: #6D8AAF
- Dark Blue: #0F1E35
- Deepest Blue: #0A1424

### Typography
- Clean, sans-serif fonts
- Legible and consistently spaced
- No gradients, icons, or flashy visuals

## Deploying

In order to both deploy the frontend and Convex, run this as the build command from the apps/web directory:

```sh
cd ../../packages/backend && npx convex deploy --cmd 'cd ../../apps/web && turbo run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

There is a vercel.json file in the apps/web directory with this configuration for Vercel.

## What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a built-in reactive database that lets you write your [database schema](https://docs.convex.dev/database/schemas) and [server functions](https://docs.convex.dev/functions) in [TypeScript](https://docs.convex.dev/typescript). Server-side database [queries](https://docs.convex.dev/functions/query-functions) automatically [cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and [subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a [realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our [React client](https://docs.convex.dev/client/react).

Everything scales automatically, and it's [free to start](https://www.convex.dev/plans).
