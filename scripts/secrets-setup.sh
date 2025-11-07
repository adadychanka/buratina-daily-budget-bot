#!/bin/bash
# Setup git-secrets patterns for the project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

# Check if git-secrets is installed
"$SCRIPT_DIR/secrets-check.sh" || exit 1

# Register AWS patterns (ignore errors if already registered)
git secrets --register-aws || true

# Add custom patterns for Telegram bot tokens
git secrets --add '.*[Bb][Oo][Tt][_ ]?[Tt][Oo][Kk][Ee][Nn].*' || true

# Add patterns for Google API keys
git secrets --add '.*[Gg][Oo][Oo][Gg][Ll][Ee][_ ]?[Aa][Pp][Ii][_ ]?[Kk][Ee][Yy].*' || true

# Add patterns for private keys
git secrets --add '.*[Pp][Rr][Ii][Vv][Aa][Tt][Ee][_ ]?[Kk][Ee][Yy].*' || true

echo "✅ git-secrets patterns configured successfully"

