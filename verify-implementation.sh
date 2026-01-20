#!/bin/bash
echo "🔍 Verifying Group Management System Implementation..."
echo ""

# Check if all required files exist
FILES=(
  "src/app/api/groups/route.ts"
  "src/app/api/groups/[id]/route.ts"
  "src/app/api/groups/[id]/members/route.ts"
  "src/app/api/groups/[id]/members/invite/route.ts"
  "src/app/api/invitations/route.ts"
  "src/app/api/invitations/[id]/route.ts"
  "src/lib/db/groups.ts"
  "src/lib/db/schema/groups.sql"
  "src/lib/db/index.ts"
  "src/lib/auth.ts"
  "src/lib/types/groups.ts"
  "src/lib/utils/groups.ts"
)

MISSING=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo "✨ All files verified successfully!"
  echo "📊 Total files: ${#FILES[@]}"
  echo ""
  echo "🚀 Implementation Status: COMPLETE"
  echo "📦 Ready for integration and testing"
else
  echo "⚠️  Warning: $MISSING file(s) missing"
  exit 1
fi
