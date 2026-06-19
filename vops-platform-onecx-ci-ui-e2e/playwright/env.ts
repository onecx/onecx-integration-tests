/**
 * Playwright Konfiguration für OneCX E2E Tests
 *
 * Environment Variables:
 * - BASE_URL: Ziel-URL der Anwendung
 * - TEST_URL: Optionale Ziel-URL nur für Haupttests (fallback: BASE_URL)
 * - ROUTER_HOST: Host-Header für Shell-Routing über Traefik (default: onecx.localhost)
 * - KEYCLOAK_ROUTER_HOST: Host-Header für Keycloak-Routing über Traefik (default: keycloak-app.localhost)
 * - USERNAME: Benutzername für Keycloak Login (default: onecx)
 * - PASSWORD: Passwort für Keycloak Login (default: onecx)
 * - OUTPUT_DIR: Verzeichnis für Test-Ergebnisse (default: ./e2e-results)
 */

/// <reference types="node" />

import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function ensureOutDir(dir: string): string {
  const resolvedDir = resolve(dir)
  mkdirSync(resolvedDir, { recursive: true })
  return resolvedDir
}

export const baseURL =
  process.env.BASE_URL || 'http://onecx.localhost/onecx-shell/admin/vops-platform-onecx-ci/applications'
// Keep test URL on the same origin as auth setup unless explicitly overridden.
export const testURL = process.env.TEST_URL || baseURL

export const routerHost = process.env.ROUTER_HOST || 'onecx.localhost'
export const keycloakRouterHost = process.env.KEYCLOAK_ROUTER_HOST || 'keycloak-app.localhost'

export const isTraefikBase = (() => {
  try {
    return new URL(baseURL).hostname === 'traefik'
  } catch {
    return false
  }
})()

export const outputDir = ensureOutDir(process.env.OUTPUT_DIR || './e2e-results')

export const username = process.env.USERNAME || 'test' //TODO: should it be set here or in the dockerfile? Right now the one from dockerfile doesn't work
export const password = process.env.PASSWORD || 'test'
