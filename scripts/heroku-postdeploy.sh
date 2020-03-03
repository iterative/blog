#!/bin/bash

# This script runs after each heroku deploy. If the deploy is the
# production heroku app (the only one with the below variables)
# the cache gets cleared.
#
# To clear the cache yourself, you can use the button in the
# cloudflare dashboard ("Caching tab > Purge everything"), or run
# this script with the required environment variables:
#
# - CLOUDFLARE_TOKEN: a token with the "Zone.Cache Purge" permission.
# You can generate this token in "My Profile > API Tokens"
#
# - CLOUDFLARE_ZONE_ID: The zone ID to purge. You can find it in the
# sidebar of the "overview" tab for dvc.org

set -euo pipefail

if [ -z "${CLOUDFLARE_TOKEN:-}" ]; then
  exit 0
fi

curl --fail \
  --request POST \
  --url "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  --header "authorization: Bearer ${CLOUDFLARE_TOKEN}" \
  --header "content-type: application/json" \
  --data '{ "purge_everything": true }'

# The response to the above is not newline-terminated, add some newlines for spacing.
echo "

postdeploy script: Cloudflare cache purged successfully!"
