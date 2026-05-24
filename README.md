# ContextPRD

Portfolio-focused AI workflow for turning initiative context and uploaded documents into engineering-ready PRDs.

## Database

ContextPRD uses Neon Postgres with Drizzle ORM for workflow persistence.

Set the database connection string in `.env.local`:

```bash
DATABASE_URL=
```

Generate and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

Drizzle Studio is available with:

```bash
npm run db:studio
```

## Testing

ContextPRD uses Vitest for focused workflow and service tests.

```bash
npm run test
npm run test:coverage
```
