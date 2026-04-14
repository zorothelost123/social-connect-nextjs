# SocialConnect Folder Structure

```text
SocialMediaAPP/
├─ .github/
│  └─ workflows/
├─ docs/
│  └─ FOLDER_STRUCTURE.md
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  ├─ feed/
│  │  │  ├─ posts/
│  │  │  └─ users/
│  │  ├─ feed/
│  │  ├─ login/
│  │  ├─ posts/
│  │  ├─ profile/
│  │  ├─ register/
│  │  └─ settings/
│  ├─ components/
│  │  ├─ feed/
│  │  ├─ layout/
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ constants/
│  │  ├─ supabase/
│  │  └─ validators/
│  ├─ actions/
│  ├─ hooks/
│  ├─ services/
│  ├─ types/
│  └─ middleware.ts
├─ .env.example
├─ .env.local
├─ supabase.sql
└─ package.json
```

## Placement Guide

- Put reusable design primitives in `src/components/ui`.
- Put feed-specific cards/modals in `src/components/feed`.
- Put layout/sidebar/header modules in `src/components/layout`.
- Keep Supabase clients/helpers in `src/lib/supabase`.
- Keep zod schemas in `src/lib/validators`.
- Keep shared constants (limits, routes) in `src/lib/constants`.
- Put shared TypeScript types/interfaces in `src/types`.
- Put server actions in `src/actions`.
- Put API wrapper services in `src/services`.
- Put custom React hooks in `src/hooks`.
