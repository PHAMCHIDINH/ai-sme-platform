# Feature-Based Module Structure Design (`ai-sme-platform`)

Date: 2026-03-21  
Status: Approved Draft for Planning  
Scope: Internal architecture refactor (no intentional runtime feature change)

## 1. Context

Current codebase has improved domain separation (`lib/services`, `lib/repos`, `lib/domain`) but still keeps:
- Business logic spread across `app/*` pages/actions/routes
- Cross-cutting helpers mixed under `lib/*` with weak ownership boundaries
- Repeated contracts and presentation rules across features

The target is to reorganize by bounded context using feature-based modules, while preserving release stability.

## 2. Objectives

- Move to `src/modules` as the primary architecture unit.
- Keep `src/app` as thin route/page entrypoints (orchestration only).
- Enforce module boundaries so cross-feature coupling is explicit.
- Support a big-bang migration executed by bounded context batches.
- Keep existing runtime behavior and public API contracts stable unless explicitly noted.

## 3. Non-Goals

- No redesign of business rules in this migration.
- No product-level feature expansion.
- No broad UI redesign.
- No schema redesign beyond previously approved remediation items.

## 4. Chosen Architecture

Chosen strategy:
- Big-bang migration by bounded context
- Root structure: `src/modules`
- Route layer pattern: `src/app` thin entrypoints importing from modules
- Module internal style: feature-first pragmatic

### 4.1 Target Directory Layout

```txt
src/
  app/
    ... route/page/layout/handlers (thin orchestration only)

  modules/
    auth/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    project/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    application/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    progress/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    ai/
      model/
      services/
      api/
      types/
      public.ts

    matching/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    shared/
      kernel/
      errors/
      http/
      ui/
      public.ts
```

## 5. Dependency Rules

### 5.1 Directional Rules

- `src/app/*` may import only:
  - `src/modules/<feature>/public.ts`
  - `src/modules/shared/public.ts` (or explicit shared public exports)
- Inside a module:
  - `ui -> services -> repo -> model/types`
- `repo` must not import `ui`.
- `api` adapters call module services; they do not contain business logic.

### 5.2 Cross-Module Access

- Cross-module imports must go through target module `public.ts`.
- Direct deep imports into another module internals are forbidden.

### 5.3 Shared Constraints

- `shared` contains only cross-feature primitives.
- Feature-specific business logic must remain in its module.

## 6. Bounded Context Mapping (Current -> Target)

### 6.1 Auth

- From: `lib/auth/*`, `app/actions/auth.ts`, `app/(auth)/*`
- To: `src/modules/auth/*`

### 6.2 Application Lifecycle

- From: `app/actions/application.ts`, `lib/services/application-lifecycle.ts`, `lib/repos/application-repo.ts`, related lifecycle rules
- To: `src/modules/application/*`

### 6.3 Project

- From: `app/api/projects/*`, `lib/repos/project-repo.ts`, `lib/validators/project.ts`, project presenters
- To: `src/modules/project/*`

### 6.4 Progress + Evaluation

- From: `lib/services/progress/*`, `lib/repos/progress-repo.ts`, related student/SME progress pages
- To: `src/modules/progress/*`

### 6.5 AI

- From: `app/api/ai/*`, `lib/services/chat-brief/*`, `lib/services/ai-embedding.ts`, `lib/openai.ts`
- To: `src/modules/ai/*`

### 6.6 Matching

- From: `app/api/matching/*`, matching helpers, candidate suggestion flows
- To: `src/modules/matching/*`

### 6.7 Shared

- From: `lib/types/*`, `lib/http/*`, shared errors/helpers, common UI primitives
- To: `src/modules/shared/*`

## 7. Big-Bang Execution Plan

### Batch A: Foundation

- Create `src/modules/*` skeleton + `public.ts` per module.
- Create `src/modules/shared/*` and base exports.
- Prepare tsconfig path aliases for `@/modules/*`.

### Batch B: Move by Bounded Context

- Relocate files via `git mv` to preserve history.
- Keep behavior unchanged while relocating.
- Stabilize each module internal imports.

### Batch C: Thin App Layer Cutover

- Convert `src/app` pages/routes/actions to module-driven entrypoints.
- Replace deep `lib/*` imports with module public imports.

### Batch D: Enforcement and Cleanup

- Enable architecture guard checks (import boundary rules).
- Remove temporary compatibility exports if any.
- Final consistency cleanup and dead code removal.

## 8. Error Handling and Contracts

- Preserve public runtime contracts unless explicitly documented.
- Normalize unauthorized/forbidden and common action result contracts through shared module primitives.
- Keep API response semantics stable for client compatibility during migration.

## 9. Quality Gates (Mandatory)

All must pass before migration is considered done:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:architecture`
- `npm run check:ui-imports`

## 10. Rollback Strategy

- Create checkpoint commits per batch (`A`, `B`, `C`, `D`).
- If Batch C import graph breaks broadly, rollback to Batch B checkpoint.
- Avoid partial-file rollback across modules; rollback by checkpoint.

## 11. Risks and Mitigations

- Risk: Mass import breakage during cutover
  - Mitigation: public.ts boundary contract + scripted import rewrites + batch checkpoints

- Risk: Hidden cross-module coupling
  - Mitigation: architecture checks + strict no-deep-import rule

- Risk: Behavior regression during relocation
  - Mitigation: no-logic-change policy in move phase + full gate suite

## 12. Acceptance Criteria

- No `app` business logic heavy paths; route layer is orchestration-only.
- No direct deep import across module internals.
- Feature logic discoverable by bounded context under `src/modules`.
- Full quality gates pass.
- Team can add new feature code by module without touching unrelated modules.

