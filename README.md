# acousticsfx-admin

Vite + React admin dashboard for AcousticsFX. Authenticates with the backend and provides dashboard UIs for users, categories, products, testimonials, contact, blogs, case studies, events, and site content (CMS).

## Stack

- **Build**: Vite 7, TypeScript
- **UI**: React 19, React Router 7
- **Data**: TanStack React Query 5
- **No UI library**: Plain CSS (App.css); add as needed

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b` then `vite build` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Environment

- **VITE_API_URL**: Backend base URL (e.g. `http://localhost:8080`). Used by `src/lib/api.ts`. Default in code: `http://localhost:3001` if unset.

## Project layout

```
src/
├── main.tsx              # Entry, React root
├── App.tsx               # Router + AuthProvider, route definitions
├── App.css
├── api/
│   ├── auth.ts           # login(), me() — calls /api/auth/login, /api/auth/me
│   └── content.ts       # listContent(), getContentByKey(), updateContent(), deleteContent() — /api/admin/content
├── lib/
│   └── api.ts            # request<T>(), getToken(), setToken(), clearToken(), ApiError, base URL
├── context/
│   └── AuthContext.tsx   # token, isAuthenticated, setToken, logout; useAuth()
├── hooks/
│   ├── useLoginMutation.ts     # Login mutation, onSuccess sets token via AuthContext
│   ├── useMeQuery.ts          # Me query (enabled when token set), 5m staleTime
│   ├── useContentList.ts      # List content (admin)
│   ├── useContentByKey.ts     # Get one content by key
│   ├── useUpdateContentMutation.ts  # Update content (invalidates content list)
│   └── useDeleteContentMutation.ts  # Delete content (invalidates content list)
├── components/
│   ├── ProtectedRoute.tsx   # Redirects to / if not isAuthenticated; else <Outlet />
│   └── DashboardLayout.tsx # Shell for dashboard pages
└── pages/
    ├── Login.tsx
    ├── DashboardHome.tsx
    ├── Users.tsx
    ├── Categories.tsx
    ├── Products.tsx
    ├── Testimonials.tsx
    ├── Contact.tsx
    ├── Blogs.tsx
    ├── Content.tsx      # Site content: list keys, edit value/type, save via PUT /api/admin/content/:key
    ├── CaseStudies.tsx
    └── Events.tsx
```

## Routing

| Path | Component | Auth |
|------|-----------|------|
| `/` | Login | Public |
| `/dashboard` | ProtectedRoute → DashboardLayout | Required |
| `/dashboard` (index) | DashboardHome | Required |
| `/dashboard/users` | Users | Required |
| `/dashboard/categories` | Categories | Required |
| `/dashboard/products` | Products | Required |
| `/dashboard/testimonials` | Testimonials | Required |
| `/dashboard/contact` | Contact | Required |
| `/dashboard/blogs` | Blogs | Required |
| `/dashboard/content` | Content (site content CMS) | Required |
| `/dashboard/case-studies` | CaseStudies | Required |
| `/dashboard/events` | Events | Required |
| `*` | Navigate to `/` | — |

## Auth flow

1. **Token storage**: localStorage key `acousticsfx-admin-token`; read/write via `getToken()` / `setToken()` / `clearToken()` in `lib/api.ts`.
2. **AuthContext**: Holds `token`, `isAuthenticated`, `setToken`, `logout`; syncs token from storage (e.g. other tab). Wrap app in `AuthProvider`; use `useAuth()` in children.
3. **Login**: User submits credentials → `useLoginMutation` calls `login()` from `api/auth.ts` → on success, `setToken(data.token)` and typically navigate to `/dashboard`.
4. **Protected routes**: `ProtectedRoute` uses `useAuth().isAuthenticated`; if false, redirects to `/`. Dashboard routes are children of `ProtectedRoute`.
5. **API calls**: `request()` in `lib/api.ts` adds `Authorization: Bearer <token>` when token exists; throws `ApiError` on non-OK response.

## API usage

- **Auth**: Use `api/auth.ts` (`login`, `me`) and hooks `useLoginMutation`, `useMeQuery`.
- **Other endpoints**: Call `request<T>(path, init)` from `lib/api.ts`. Path is relative to `VITE_API_URL` (e.g. `/api/users`). For new domains, add modules under `src/api/` and optional hooks in `src/hooks/`.
- **Site content**: Dashboard → "Site content" lists all content keys. Edit a key to change value/type; saved via `PUT /api/admin/content/:key`. Keys must match frontend expectations (e.g. `home.hero.title`). Run backend `npm run seed:content` to add default keys if empty.

## Conventions

- **New page**: Add component in `src/pages/`, add route in `App.tsx` under the `ProtectedRoute` → `DashboardLayout` branch.
- **New API surface**: Add functions in `src/api/<domain>.ts` using `request()` from `lib/api.ts`; add React Query hooks in `src/hooks/` if needed.
- **Auth**: Use `useAuth()` for token/logout; use `useMeQuery()` for current user when token is present. Handle 401 (e.g. logout and redirect) where appropriate.
