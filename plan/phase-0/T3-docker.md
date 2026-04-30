# T3 — Docker and docker-compose

**Phase:** Phase 0 — Project foundation

## Problem / motivation

There is no way to run access-manager-ui in a container. Developers cannot reproduce a production-like environment locally, and CI has no Docker smoke test.

## Goal

Provide a multi-stage Dockerfile that builds the Vite app and serves it with nginx, plus a docker-compose file for local end-to-end runs.

## Deliverables

- `Dockerfile` — multi-stage: `node:18-alpine` build + `nginx:alpine` serve
- `docker-compose.yml` — single `app` service; port 127.0.0.1:3000:80; `VITE_API_BASE_URL` as build arg
- `.dockerignore` — excludes node_modules, dist, .env*, .git

## Design notes

- `VITE_API_BASE_URL` is a **build-time** Vite env var (baked into the JS bundle). Pass it as a Docker `ARG` so the image can be rebuilt for different backends.
- Default `VITE_API_BASE_URL=http://host.docker.internal:8080` in docker-compose so the container can reach a locally-running access-manager instance.
- nginx config: serve `index.html` for all unmatched routes (SPA fallback via `try_files $uri /index.html`).
- Container runs as non-root (`nginx` user).

## Steps

1. Write `.dockerignore`
2. Write `Dockerfile`: two stages — build copies package files, runs `npm ci`, runs `npm run build`; serve stage copies `dist/` to nginx html dir, adds SPA fallback config, exposes port 80
3. Write `docker-compose.yml`: `app` service with build context + arg, port `127.0.0.1:3000:80`

## Files / paths

- Create: `Dockerfile`, `docker-compose.yml`, `.dockerignore`

## Acceptance criteria

- `make docker-build` completes without error
- `make docker-up` starts container; `curl http://localhost:3000` returns 200 with HTML
- `make docker-down` stops and removes containers
- All routes deep-linked (e.g. `/domains/abc`) return 200 (SPA fallback working)

## Out of scope

- Multi-service compose (prometheus, grafana) — future phase
- Kubernetes manifests — future phase

## Dependencies

T2 (Makefile targets for docker-*)

## Milestone

26Q2
