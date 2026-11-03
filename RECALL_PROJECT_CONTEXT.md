# Recall --- Project Context for AI Coding Agents

> This document is the shared source of truth for Codex and other AI
> coding agents working on Recall. Read it before making changes. Update
> it when an architectural decision is explicitly changed.

## 1. Product overview

**Recall** is a lightweight personal knowledge hub: one place to
capture, organize, and quickly retrieve frequently used knowledge and
references.

It is not intended to be another general-purpose notes or
project-management application. Its central value is:

-   Make saving useful information effortless.
-   Make finding previously saved information fast.
-   Keep different kinds of knowledge organized in one place.
-   Add small, useful automations without building an elaborate workflow
    engine.

Examples of information users may save:

-   Documentation links and useful websites.
-   Personal notes.
-   Code snippets and commands.
-   Reference material and, in a later phase, uploaded documents such as
    PDFs.

## 2. Product principles

1.  **Retrieval first:** search is a core product capability, not an
    afterthought.
2.  **Low-friction capture:** users should be able to add resources from
    anywhere in the app, without returning to the dashboard.
3.  **Simple by default:** prefer a small, understandable implementation
    over premature infrastructure.
4.  **One resource model:** different kinds of saved knowledge should
    share a common resource model where practical.
5.  **Incremental delivery:** finish and test the MVP before adding
    advanced features.
6.  **Cost-conscious:** prefer free tiers and open-source dependencies.
    Do not introduce paid services or APIs without approval.
7.  **Multi-user-ready:** even if initially used personally, data must
    be scoped securely to its owner.

## 3. Decisions made so far

Treat these as the current product decisions unless the user explicitly
changes them.

  -----------------------------------------------------------------------
  Area                                Current decision
  ----------------------------------- -----------------------------------
  Product                             Personal knowledge hub named Recall

  Resource model                      One central `Resource` concept for
                                      links, notes, snippets, and later
                                      documents

  Collections                         A resource belongs to at most one
                                      collection

  Inbox                               A resource may have no collection;
                                      this is the unorganized Inbox state

  Tags                                Independent of collections;
                                      many-to-many between resources and
                                      tags

  External links                      Initially save URL and metadata;
                                      fetching/indexing webpage content
                                      is a later enhancement

  Users                               Multi-user-ready architecture, with
                                      user ownership and data isolation

  Attachments                         Later phase; metadata in
                                      PostgreSQL, file bytes in
                                      file/object storage

  Automation                          Later phase; start with a few
                                      predefined rules, not a generic
                                      workflow engine

  Search                              PostgreSQL full-text search for the
                                      MVP

  Neon region                         Singapore was selected because
                                      Mumbai was not available in the
                                      region list shown during project
                                      creation
  -----------------------------------------------------------------------

### Important status note about the stack

The following is the proposed working stack from the discussion. The
user has not yet explicitly confirmed every item in a final stack
checklist. Treat it as the default plan, but ask before making a costly
or difficult-to-reverse substitution.

-   Frontend: React + TypeScript + Vite.
-   Styling: Tailwind CSS, shadcn/ui, Lucide icons.
-   Client routing: React Router.
-   Server-state/data fetching: TanStack Query.
-   Backend: Python + FastAPI.
-   Validation: Pydantic.
-   ORM: SQLAlchemy 2.x.
-   Migrations: Alembic.
-   Database: PostgreSQL hosted on Neon, Singapore region.
-   Search: PostgreSQL Full-Text Search.
-   Scheduling: APScheduler for simple scheduled jobs.
-   Authentication proposal: JWT access token and HTTP-only
    refresh-token cookie; Argon2 password hashing.
-   Testing: Pytest for backend; Vitest for frontend.

Do not add Redis, Celery, Kafka, Elasticsearch, a vector database, or a
separate search service for the MVP without a demonstrated need.

## 4. MVP scope

Build the following first:

1.  User registration, login, and logout.
2.  Create, view, edit, and delete resources.
3.  Resource types: `link`, `note`, and `snippet`.
4.  Collections: create, rename, list, and delete.
5.  Tags: create/use tags and assign multiple tags to a resource.
6.  Inbox: resources with no collection.
7.  Global search across resource title, description, content, and tags
    where feasible.
8.  Dashboard with recently added and recently accessed resources.
9.  Quick capture available throughout the application, not only on the
    dashboard.

### Explicitly out of scope for the initial MVP

-   AI chat over saved content.
-   Vector/semantic search.
-   Browser extension.
-   Collaborative workspaces and sharing.
-   Full webpage crawling and indexing.
-   PDF/DOCX upload and text extraction.
-   Generic user-configurable workflow engine.
-   Complex analytics.
-   Microservices or distributed infrastructure.

These may be considered after the MVP is usable.

## 5. Resource model

A resource is the central saved item.

Initial resource types:

-   `link`: external URL and metadata.
-   `note`: user-authored text.
-   `snippet`: code or command text.

A later `document` type may represent an uploaded file, with one or more
attachment records.

Suggested resource fields (refine during schema design):

-   `id`: UUID primary key.
-   `user_id`: owner, required.
-   `collection_id`: nullable foreign key; null means Inbox.
-   `title`: required, bounded string.
-   `description`: optional text.
-   `type`: validated enum/string (`link`, `note`, `snippet`; later
    `document`).
-   `url`: nullable; relevant to links.
-   `content`: nullable text; relevant to notes/snippets.
-   `is_favorite`: boolean.
-   `is_archived`: boolean.
-   `created_at`, `updated_at`: timezone-aware timestamps.
-   `last_accessed_at`: nullable timezone-aware timestamp.
-   Search vector/index fields as appropriate for PostgreSQL.

Use database constraints to prevent invalid combinations where
practical. For example, validate resource types and ensure a link has a
URL. Keep validation in both API schemas and the database where
feasible.

## 6. Main entities and relationships

### Users

Own resources, collections, tags, and automations.

### Resources

Belong to exactly one user and optionally one collection. A resource can
have many tags and, in a later phase, multiple attachments.

### Collections

Belong to one user. A resource can belong to zero or one collection.
Collection membership must be checked against the resource owner.

### Tags

Belong to one user. Tag names should be unique per user, preferably
case-insensitively.

### ResourceTags

Join table implementing the many-to-many relationship between resources
and tags.

### Attachments (later)

Store metadata such as original filename, MIME type, file size, storage
key/path, and extracted text. Store file bytes outside PostgreSQL. Do
not implement uploads until the user approves the storage approach.

### Automations (later)

Store a small number of predefined automation configurations. For the
first automation iteration, prefer application-level rule types over an
arbitrary executable workflow language.

## 7. Search requirements

Search is one of Recall's defining features.

MVP search should:

-   Search resource titles, descriptions, and text content.
-   Include tags in matching or filtering.
-   Support filtering by resource type, collection, tag, favorite, and
    archive status as appropriate.
-   Return ranked results, not merely arbitrary substring matches.
-   Be scoped to the authenticated user.
-   Support pagination.
-   Be accessible from a global search UI, ideally with `Ctrl+K`.

Use PostgreSQL Full-Text Search (`tsvector`, `tsquery`, ranking
functions, and a GIN index) as the initial implementation. Consider
weighted fields, with title weighted above description and content. Do
not introduce semantic search until there is a clear use case.

If maintaining a stored search vector, choose and document a reliable
update strategy (generated column, trigger, or application-managed
update). Avoid having the index silently become stale.

## 8. UX and navigation direction

Keep the interface simple and retrieval-oriented.

The approved visual direction uses graphite and silver with electric amber
actions in dark mode, and porcelain and ink with bronze accents in light
mode. The interface uses a sidebar shell, SVG branding and illustrations,
Lucide icons (no emojis), Space Grotesk headings, and Inter body text.
Theme and resource grid/list preferences are stored locally. Motion should
remain restrained and respect reduced-motion preferences.

Suggested primary navigation:

-   Home
-   Inbox
-   All resources
-   Collections
-   Tags
-   Automations (later)
-   Settings

The app should provide a persistent quick-add action on all relevant
pages. Quick capture should support the resource types in the MVP and
avoid forcing a collection selection. If no collection is selected, the
resource enters the Inbox.

A global search shortcut (`Ctrl+K`) is desirable. Search and quick
capture are separate actions.

Resource detail/edit views should expose title, description, content or
URL, collection, tags, favorite/archive state, and timestamps where
useful.

## 9. API direction

Use REST endpoints initially. Keep routes resource-oriented and
versioning can be introduced if needed.

Likely endpoint groups:

-   `/auth/*`
-   `/resources`
-   `/resources/{resource_id}`
-   `/search`
-   `/collections`
-   `/collections/{collection_id}`
-   `/tags`
-   `/tags/{tag_id}`

Use Pydantic request/response schemas. Do not expose password hashes,
refresh tokens, internal storage paths, or other sensitive
implementation details.

Every read and mutation must enforce ownership at the query/service
layer. Never rely only on the frontend to hide another user's data.

## 10. Security and data integrity

-   Hash passwords with Argon2 (if the proposed auth stack is retained).
-   Use secure cookie settings in production: `HttpOnly`, `Secure`, and
    an appropriate `SameSite` policy.
-   Protect state-changing cookie-authenticated requests against CSRF as
    appropriate to the chosen auth design.
-   Validate and normalize URLs; do not fetch arbitrary URLs from the
    backend without SSRF protections.
-   Enforce per-user ownership for every resource, collection, and tag
    operation.
-   Use foreign keys and appropriate deletion behavior.
-   Avoid cascading deletion across ownership boundaries.
-   Keep secrets in environment variables; never commit `.env` files or
    credentials.
-   Provide `.env.example` with placeholder values only.
-   Do not log passwords, tokens, or sensitive user content
    unnecessarily.

## 11. Repository structure (suggested)

``` text
recall/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   ├── pyproject.toml
│   └── ...
├── docs/
│   ├── PROJECT.md
│   ├── DATABASE.md
│   └── API.md
├── AGENTS.md
├── README.md
└── .gitignore
```

This is a suggested structure, not a mandate. Inspect the existing
repository before creating or moving files. Adapt to existing
conventions where sensible.

## 12. Development workflow for AI agents

Before coding:

1.  Inspect the repository and report its current state.
2.  Read this document and any existing `AGENTS.md`, README, and
    relevant docs.
3.  Identify the smallest next implementation milestone.
4.  State the files and behavior you intend to change.
5.  Ask the user when a decision is ambiguous or would materially change
    architecture, cost, security, or scope.

While coding:

-   Work in small, reviewable increments.
-   Do not generate the entire application in one pass.
-   Do not silently change the chosen stack or product decisions.
-   Prefer straightforward, readable code over abstractions without a
    demonstrated need.
-   Add tests for meaningful backend behavior, especially ownership
    isolation and search.
-   Run relevant tests, linting, and type checks after changes.
-   Do not claim tests passed unless they were actually run.
-   Keep API contracts and frontend types aligned.
-   Update documentation when behavior or architecture changes.
-   Avoid unrelated refactors.

Before finishing a task, report:

1.  What changed.
2.  Important implementation decisions.
3.  Commands/tests run and their actual results.
4.  Any known limitations or follow-up work.

## 13. Suggested implementation milestones

### Milestone 0 --- Repository and architecture setup

-   Inspect repository.
-   Confirm final stack.
-   Create project documentation.
-   Set up frontend and backend skeletons.
-   Configure environment variables and local development instructions.

### Milestone 1 --- Database foundation

-   Finalize relational schema.
-   Add SQLAlchemy models.
-   Configure Alembic.
-   Create initial migration.
-   Add database constraints and indexes.
-   Verify migrations against a local PostgreSQL database and Neon.

### Milestone 2 --- Authentication and ownership

-   Registration/login/logout.
-   Password hashing and token/session handling.
-   Authenticated-user dependency.
-   Tests for cross-user data isolation.

### Milestone 3 --- Resource management

-   Resource CRUD.
-   Resource type validation.
-   Inbox behavior.
-   Favorites and archive state.

### Milestone 4 --- Collections and tags

-   Collection CRUD.
-   Tag creation and assignment.
-   Ownership validation and deletion behavior.

### Milestone 5 --- Search

-   PostgreSQL full-text search.
-   Ranking and filtering.
-   Pagination.
-   Search tests.

### Milestone 6 --- Frontend experience

-   App shell and navigation.
-   Dashboard.
-   Resource list/detail/editor.
-   Quick capture.
-   Global search.

### Milestone 7 --- Polish and deployment

-   Integration tests.
-   Accessibility and responsive behavior.
-   Deployment and environment configuration.
-   Documentation and demo data.

### Later phases

-   Attachments and document text extraction.
-   Link checking and other predefined automations.
-   Browser extension.
-   Semantic search if justified by real usage.

## 14. Initial prompt for a new AI coding agent

Use this prompt when starting a new Codex or other agent session:

> You are contributing to Recall, a lightweight personal knowledge hub.
> First read `RECALL_PROJECT_CONTEXT.md` and any `AGENTS.md` files. Inspect the
> existing repository before editing anything. Do not assume the project
> is empty.
>
> Recall's core purpose is low-friction capture and fast retrieval of
> links, notes, and code snippets. The MVP uses a unified Resource
> model, optional one-to-one collection membership (a null collection
> means Inbox), many-to-many tags, multi-user ownership, and PostgreSQL
> full-text search.
>
> The proposed stack is React + TypeScript + Vite, Tailwind CSS,
> FastAPI, Pydantic, SQLAlchemy 2.x, Alembic, and Neon PostgreSQL in
> Singapore. Treat this as the working plan, but note that the user has
> not explicitly confirmed every stack choice. Do not substitute
> technologies without asking.
>
> Work only on the milestone or task the user requests. Before making
> changes, summarize the current repository state and propose a small
> implementation plan. Keep changes incremental, test them, and report
> exactly what was changed and which checks were run. Do not add paid
> services, unnecessary infrastructure, AI features, browser extensions,
> file uploads, or a generic automation engine to the MVP without
> explicit approval.
