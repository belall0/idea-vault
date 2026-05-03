# Idea Vault Architecture

## System Goals and Constraints
- **Production-Grade Architecture**: The codebase is designed for long-term scalability and maintainability.
- **Separation of Concerns**: Strict boundaries between UI rendering, data fetching, routing, and global state.
- **Render-As-You-Fetch**: Utilizing TanStack Router loaders alongside TanStack Query to eliminate waterfall requests and loading spinners on navigation.
- **Modularity**: Organizing code by domain (feature) rather than by technical role.

## High-Level Architecture
The system employs a **Feature-Based (Modular) Architecture**. Code is grouped by business domains (e.g., `ideas`) into self-contained modules. Cross-domain infrastructure and generic UI components are kept in global directories (`lib/`, `components/`, `pages/`). The file-based routing layer (`routes/`) acts purely as a "glue" layer that binds data pre-fetching to UI components without containing implementation details.

## Folder Structure
```text
src/
├── components/          # Shared, generic UI components
│   ├── feedback/        # (e.g., ErrorFallback, LoadingSpinner)
│   └── layout/          # (e.g., Header, RootLayout)
├── lib/                 # Global infrastructure and configuration
│   ├── api-client.ts    # Axios instance
│   └── query-client.ts  # TanStack QueryClient singleton
├── modules/             # Domain-specific logic
│   └── ideas/           # The "Ideas" domain
│       ├── components/  # Domain UI (e.g., IdeaCard, IdeaForm)
│       ├── hooks/       # Custom React Query hooks (e.g., useIdeas, useIdea)
│       ├── pages/       # Full page views (e.g., IdeasPage, IdeaDetailsPage)
│       ├── types/       # Domain TypeScript interfaces
│       ├── ideas.api.ts # Pure network request functions
│       ├── ideas.queries.ts # Query keys and query option factories
│       └── index.ts     # Barrel export defining the module's public API
├── pages/               # Generic, global, or cross-domain pages
│   ├── HomePage.tsx
│   └── NotFoundPage.tsx
├── routes/              # TanStack Router file-based route definitions
│   ├── __root.tsx
│   ├── index.tsx
│   └── ideas/
├── main.tsx             # Application entry point
└── router.ts            # Router instantiation and type registration
```

## Key Components and Responsibilities

- **Feature Modules (`src/modules/`)**: The core of the business logic. A module owns its entire vertical slice (API, types, caching rules, custom hooks, and UI pages). External files only communicate with a module through its barrel export (`index.ts`).
- **Routing Layer (`src/routes/`)**: Files in this directory define the URL hierarchy via TanStack Router. These files are incredibly thin—they only export a `Route` configuration object, handle the `loader` function for data pre-fetching, and bind a component imported from a module's `pages/` directory.
- **Generic Pages (`src/pages/`)**: Home to UI pages that do not belong to a specific business domain, such as `HomePage` or system-wide pages like `NotFoundPage`.
- **Infrastructure (`src/lib/`)**: Contains singletons like the configured Axios `apiClient` and the TanStack `queryClient`.

## Data Flow
1. **Navigation Event**: The user triggers a navigation (e.g., clicking a link to `/ideas`).
2. **Pre-fetching (Loader Phase)**: TanStack Router intercepts the navigation and executes the route's `loader` function.
3. **Cache Check**: The loader calls `queryClient.ensureQueryData(ideasQueryOptions())`. The QueryClient checks the cache. If data is fresh, it resolves immediately. If stale or missing, it triggers the API call.
4. **API Request**: `ideasQueryOptions` delegates to `getIdeas` (in `ideas.api.ts`), which performs the HTTP request via the shared `apiClient`.
5. **Rendering Phase**: Once the loader resolves, the router renders the target component (e.g., `IdeasPage`).
6. **Data Consumption**: The `IdeasPage` component invokes a custom hook (`useIdeas()`), which calls `useSuspenseQuery(ideasQueryOptions())`. Because the cache was populated during the loader phase, the component renders synchronously without suspending.

## State Management
- **Server State (TanStack Query)**: Server state is the primary source of truth. 
  - **Caching Strategy**: The `QueryClient` has a global default `staleTime` of 1 minute and a `gcTime` of 5 minutes. Domain-specific queries can override this (e.g., Ideas list: 2 minutes, Idea details: 5 minutes).
  - **Cache Invalidation**: Mutations perform surgical cache invalidation. For example, successful creation of a new idea via `useCreateIdea()` automatically invalidates the `ideaKeys.all` cache, forcing background refetches.
- **Client State**: Local React state (`useState`) is kept minimal and restricted to UI-specific transient state, such as form inputs in `IdeaForm`.
- **URL State**: Managed entirely by TanStack Router via route params (e.g., `$ideaid`).

## External Integrations
- **Backend API**: The application communicates with a backend REST API via Axios. The `apiClient` is globally configured with a `/api` baseURL and `withCredentials: true` for eventual authentication handling.

## Design Decisions and Rationale

1. **Feature-Based Modularity over Flat Structure**:
   Organizing files by domain (`modules/ideas`) rather than technical concern (e.g., putting all APIs in `src/api`, all components in `src/components`) prevents the codebase from becoming a tangled monolith. Modifying the "Ideas" feature only requires navigating one isolated directory.

2. **Thin Routing Layer**:
   Extracting the actual UI layouts into `pages/` (e.g., `IdeasPage`, `RootLayout`) keeps the `src/routes/` files laser-focused on configuration and data-loading logic. This separation ensures routing logic doesn't mix with DOM rendering.

3. **Custom Hook Layer**:
   Components consume data via abstracted hooks like `useIdeas()` rather than calling `useSuspenseQuery` directly. This decouples the UI from React Query's internal concepts (like query keys and stale times), making the UI components cleaner and easier to test.

4. **Shared Query Options**:
   Both the custom hooks (e.g., `useIdeas`) and the route loaders import the same `queryOptions` factory (e.g., `ideasQueryOptions()`). This ensures that cache keys and `staleTime` configurations are perfectly synchronized across the application, avoiding bugs where a loader fetches data but a component considers it stale immediately.

## Trade-offs and Alternatives Considered

- **Hook Layer vs. Pure Loaders**: 
  In some pure feature-sliced architectures, the routing loaders manually construct queries using `queryClient.ensureQueryData` to completely hide query configurations from the outside world. 
  *Decision*: We adopted a hybrid approach. The module exposes a `queryOptions` factory. While this slightly increases the module's public API surface, it drastically reduces boilerplate and ensures the DRY principle, keeping cache timing flawlessly synchronized between pre-fetching and rendering.

- **Global ApiError Infrastructure**:
  We considered implementing a custom `ApiError` class with Axios interceptors to globally catch specific HTTP statuses (e.g., 404) and automatically render the `NotFoundPage`.
  *Decision*: This was skipped to avoid premature optimization and over-engineering. The system currently relies on TanStack Router's built-in `notFoundComponent` and global `errorComponent` fallbacks, which provide sufficient resilience without the added complexity.
