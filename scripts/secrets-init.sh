#!/bin/bash
# Initialize git-secrets in the repository

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

# Check if git-secrets is installed
"$SCRIPT_DIR/secrets-check.sh" || exit 1

# Install git hooks
git secrets --install

