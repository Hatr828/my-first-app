#!/bin/bash


set -e

REPO="Ennyw/flux"
DESCRIPTION="A Netflix-inspired streaming platform UI built with React, TypeScript, and Vite. Educational demonstration project showcasing modern web development, API integration, and responsive design patterns."

TOPICS=(
  "react"
  "typescript"
  "vite"
  "netflix-clone"
  "streaming-platform"
  "ui-ux"
  "educational"
  "demo-project"
  "frontend"
  "web-development"
  "tmdb-api"
  "responsive-design"
  "modern-ui"
  "react-router"
  "framer-motion"
)

echo "🚀 Updating GitHub repository settings for $REPO"
echo ""

if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed."
  echo "   Install it: brew install gh"
  echo "   Or visit: https://cli.github.com"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "⚠️  Not authenticated with GitHub CLI"
  echo "   Run: gh auth login"
  exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

echo "📝 Updating repository description..."
gh repo edit "$REPO" --description "$DESCRIPTION" || {
  echo "⚠️  Failed to update description. Continuing..."
}

echo "🏷️  Updating repository topics..."
TOPICS_STRING=$(IFS=','; echo "${TOPICS[*]}")
gh repo edit "$REPO" --add-topic "$TOPICS_STRING" || {
  echo "⚠️  Failed to update topics. Continuing..."
}

echo ""
echo "✅ Repository settings updated!"
echo ""
echo "📋 Updated:"
echo "   - Description: $DESCRIPTION"
echo "   - Topics: ${#TOPICS[@]} topics added"
echo ""
echo "🌐 View your repository: https://github.com/$REPO"

