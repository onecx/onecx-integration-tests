#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://onecx-shell-ui:8080/onecx-shell/}"
WORKSPACE_SVC_HEALTH_URL="${WORKSPACE_SVC_HEALTH_URL:-http://onecx-workspace-svc:8080/q/health}"
WORKSPACE_BFF_HEALTH_URL="${WORKSPACE_BFF_HEALTH_URL:-http://onecx-workspace-bff:8080/q/health}"
OUT_DIR="/e2e-results"
OUT_FILE="$OUT_DIR/onecx-workspace-ui-e2e.json"

mkdir -p "$OUT_DIR"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

check_url() {
  name="$1"
  url="$2"
  attempts="${3:-30}"
  delay_seconds="${4:-2}"
  i=1

  while [ "$i" -le "$attempts" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[ok] $name -> $url"
      return 0
    fi

    echo "[retry $i/$attempts] $name -> $url"
    sleep "$delay_seconds"
    i=$((i + 1))
  done

  return 1
}

STATUS="success"
EXIT_CODE=0

if ! check_url "workspace-health" "$WORKSPACE_SVC_HEALTH_URL" 30 2; then
  STATUS="failure"
  EXIT_CODE=1
fi

if ! check_url "workspace-bff-health" "$WORKSPACE_BFF_HEALTH_URL" 30 2; then
  STATUS="failure"
  EXIT_CODE=1
fi

if ! check_url "shell-ui" "$BASE_URL" 30 2; then
  STATUS="failure"
  EXIT_CODE=1
fi

cat > "$OUT_FILE" <<EOF
{
  "status": "$STATUS",
  "baseUrl": "$BASE_URL",
  "workspaceHealthUrl": "$WORKSPACE_SVC_HEALTH_URL",
  "workspaceBffHealthUrl": "$WORKSPACE_BFF_HEALTH_URL",
  "timestamp": "$(timestamp)"
}
EOF

echo "Smoke result written: $OUT_FILE"
exit "$EXIT_CODE"
