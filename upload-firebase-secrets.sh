#!/bin/bash

# Script to upload google-services.json files to EAS Secrets
# This allows EAS Build to access Firebase configuration without committing sensitive files to git

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Uploading Firebase Configuration to EAS Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if files exist
if [ ! -f "shri-krishnam-app/android/app/google-services.json" ]; then
    echo "❌ Error: shri-krishnam-app/android/app/google-services.json not found"
    exit 1
fi

if [ ! -f "shri-krishnam-admin-app/android/app/google-services.json" ]; then
    echo "❌ Error: shri-krishnam-admin-app/android/app/google-services.json not found"
    exit 1
fi

echo "📱 Uploading Client App google-services.json..."
cd shri-krishnam-app
npx eas-cli secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./android/app/google-services.json --force
echo "✅ Client App secret uploaded"
echo ""

echo "📱 Uploading Admin App google-services.json..."
cd ../shri-krishnam-admin-app
npx eas-cli secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./android/app/google-services.json --force
echo "✅ Admin App secret uploaded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All secrets uploaded successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now you can build your apps:"
echo "  cd shri-krishnam-app && npx eas-cli build --profile preview --platform android"
echo "  cd shri-krishnam-admin-app && npx eas-cli build --profile preview --platform android"

