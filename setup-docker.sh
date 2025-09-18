#!/bin/bash

# IntelliSSH Docker Setup Script
# This script helps generate secure configuration for Docker deployment

echo "🚀 IntelliSSH Docker Setup"
echo "=========================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backup and remove it first if you want to regenerate."
    echo "   Backup: cp .env .env.backup"
    echo "   Remove: rm .env"
    exit 1
fi

# Copy template
if [ -f ".env.docker.example" ]; then
    cp .env.docker.example .env
    echo "✅ Copied .env.docker.example to .env"
else
    echo "❌ .env.docker.example not found. Please run this script from the project root."
    exit 1
fi

# Generate secure JWT secret
echo "🔑 Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
if [ $? -eq 0 ]; then
    # Replace the JWT_SECRET in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS sed
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        # Linux sed
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    echo "✅ JWT secret generated and configured"
else
    echo "⚠️  Could not generate JWT secret automatically. Please set it manually in .env"
fi

# Generate secure encryption key
echo "🔐 Generating secure encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)
if [ $? -eq 0 ]; then
    # Replace the ENCRYPTION_KEY in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS sed
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    else
        # Linux sed
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    fi
    echo "✅ Encryption key generated and configured"
else
    echo "⚠️  Could not generate encryption key automatically. Please set it manually in .env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file to configure OIDC (if needed) and other settings"
echo "2. Run: docker-compose up -d"
echo "3. Access IntelliSSH at http://localhost:8080"
echo ""
echo "📝 Important notes:"
echo "   - Default admin credentials will be shown in docker logs on first startup"
echo "   - Run 'docker logs intellissh' to see the generated admin password"
echo "   - Configure OIDC settings in .env if you want single sign-on"
echo ""