const DOCKER_REPO = 'ghcr.io/onecx'
const DEFAULT_TAG_SVC_BFF = 'main-native'
const DEFAULT_TAG = 'main'

// External Images
export const POSTGRES = 'docker.io/library/postgres:17.9'
export const KEYCLOAK = 'quay.io/keycloak/keycloak:26.2.0'
export const IMPORT_MANAGER_BASE = 'docker.io/library/node:20'

export enum OnecxService {
  IAM_KC_SVC = `${DOCKER_REPO}/onecx-iam-kc-svc:${DEFAULT_TAG_SVC_BFF}`,
  PARAMETER_SVC = `${DOCKER_REPO}/onecx-parameter-svc:${DEFAULT_TAG_SVC_BFF}`,
  PERMISSION_SVC = `${DOCKER_REPO}/onecx-permission-svc:${DEFAULT_TAG_SVC_BFF}`,
  PRODUCT_STORE_SVC = `${DOCKER_REPO}/onecx-product-store-svc:${DEFAULT_TAG_SVC_BFF}`,
  TENANT_SVC = `${DOCKER_REPO}/onecx-tenant-svc:${DEFAULT_TAG_SVC_BFF}`,
  THEME_SVC = `${DOCKER_REPO}/onecx-theme-svc:${DEFAULT_TAG_SVC_BFF}`,
  WORKSPACE_SVC = `${DOCKER_REPO}/onecx-workspace-svc:${DEFAULT_TAG_SVC_BFF}`,
  USER_PROFILE_SVC = `${DOCKER_REPO}/onecx-user-profile-svc:${DEFAULT_TAG_SVC_BFF}`,
}

export enum OnecxBff {
  PARAMETER_BFF = `${DOCKER_REPO}/onecx-parameter-bff:${DEFAULT_TAG_SVC_BFF}`,
  SHELL_BFF = `${DOCKER_REPO}/onecx-shell-bff:${DEFAULT_TAG_SVC_BFF}`,
  WORKSPACE_BFF = `${DOCKER_REPO}/onecx-workspace-bff:${DEFAULT_TAG_SVC_BFF}`,
}

export enum OnecxUi {
  SHELL_UI = `${DOCKER_REPO}/onecx-shell-ui:3.6.0`,
  WORKSPACE_UI = `${DOCKER_REPO}/onecx-workspace-ui:${DEFAULT_TAG}`,
}
