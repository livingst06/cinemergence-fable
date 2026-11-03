#!/usr/bin/env bash
# Push core env vars to Vercel.
# Secrets stay on production. The public contact address is also written to preview and development.
# Prerequisite: vercel login && vercel link (from repo root)
#
# Usage:
#   cp .env.vercel.production.example .env.vercel.production
#   # fill values, then:
#   ./scripts/sync-vercel-env.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT/.env.vercel.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.vercel.production.example and fill secrets."
  exit 1
fi

VARS=(
  DATABASE_URI
  PAYLOAD_SECRET
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL
  NEXT_PUBLIC_CLERK_SIGN_UP_URL
  S3_BUCKET
  S3_REGION
  S3_ENDPOINT
  S3_ACCESS_KEY_ID
  S3_SECRET_ACCESS_KEY
  SUPABASE_STORAGE_PUBLIC_URL
  NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL
  MIGRATE_MEDIA_SECRET
  BREVO_API_KEY
  BREVO_LIST_ID
  BREVO_SMTP_LOGIN
  BREVO_SENDER_EMAIL
  BREVO_SENDER_NAME
  CONTACT_NOTIFICATION_EMAIL
  STRIPE_KHEIRON_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  CINEMERGENCE_MEASUREMENT_KEY
  CRON_SECRET
)

cd "$ROOT"

export VERCEL_TOKEN="${VERCEL_TOKEN:-$(grep '^VERCEL_TOKEN=' "$ROOT/.env.local" 2>/dev/null | cut -d= -f2- || true)}"
VERCEL_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VERCEL_ARGS=(--token "$VERCEL_TOKEN")
fi

# Adresse de contact : production, preview et development.
ALL_ENV_KEYS=(
  CONTACT_NOTIFICATION_EMAIL
  BREVO_SENDER_EMAIL
  BREVO_SENDER_NAME
)

targets_for() {
  local key="$1"
  local all
  for all in "${ALL_ENV_KEYS[@]}"; do
    if [[ "$key" == "$all" ]]; then
      echo "production preview development"
      return
    fi
  done
  echo "production"
}

for key in "${VARS[@]}"; do
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
  if [[ -z "$value" ]]; then
    echo "Skip $key (empty)"
    continue
  fi
  for target in $(targets_for "$key"); do
    printf '%s' "$value" | npx vercel env add "$key" "$target" --force "${VERCEL_ARGS[@]}"
    echo "Set $key ($target)"
  done
done

echo "Done. Redeploy Vercel for changes to apply."
