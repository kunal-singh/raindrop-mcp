#!/usr/bin/env bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)

EXEMPT_PATTERN="^(main|master|dev|develop|staging|release/.+)$"
VALID_PATTERN="^(feat|fix|chore|docs|refactor|test|perf|ci|build)\/[0-9]+-[a-z0-9-]+$"

if [[ "$BRANCH" =~ $EXEMPT_PATTERN ]]; then
  echo "✅ Branch '$BRANCH' is exempt from naming convention checks."
  exit 0
fi

if [[ "$BRANCH" =~ $VALID_PATTERN ]]; then
  echo "✅ Branch name valid: '$BRANCH'"
  exit 0
fi

echo "❌ Invalid branch name: '$BRANCH'"
echo ""
echo "Branch names must follow the pattern:"
echo "  <type>/<issue-number>-<short-description>"
echo ""
echo "  Valid types: feat, fix, chore, docs, refactor, test, perf, ci, build"
echo "  Example:     feat/3-integrate-commitlint"
exit 1
