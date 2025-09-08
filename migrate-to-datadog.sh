#!/bin/bash

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0
# DataDog Migration Script

set -e

echo "🚀 Starting OpenTelemetry to DataDog Migration"
echo "=============================================="

# Check if DataDog API key is set
if [ -z "$DD_API_KEY" ]; then
    echo "❌ Error: DD_API_KEY environment variable is not set"
    echo "Please set your DataDog API key:"
    echo "export DD_API_KEY=your_datadog_api_key_here"
    exit 1
fi

echo "✅ DataDog API key is configured"

# Create backup of original docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo "📦 Creating backup of original docker-compose.yml"
    cp docker-compose.yml docker-compose.yml.backup
fi

# Copy DataDog configuration
echo "📋 Setting up DataDog configuration"
cp docker-compose-datadog.yml docker-compose.yml

# Set up environment variables
echo "🔧 Setting up environment variables"
if [ ! -f ".env" ]; then
    cp datadog.env .env
    echo "📝 Created .env file from datadog.env template"
    echo "⚠️  Please update .env with your DataDog credentials"
fi

# Install DataDog dependencies for each service
echo "📦 Installing DataDog dependencies..."

# Frontend service
echo "  - Frontend service"
cd src/frontend
if [ -f "package.json" ]; then
    npm install @datadog/browser-rum @datadog/browser-logs
    npm uninstall @opentelemetry/auto-instrumentations-web @opentelemetry/exporter-trace-otlp-http @opentelemetry/sdk-trace-web
fi
cd ../..

# Payment service
echo "  - Payment service"
cd src/payment
if [ -f "package.json" ]; then
    npm install dd-trace
    npm uninstall @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
fi
cd ../..

# Recommendation service
echo "  - Recommendation service"
cd src/recommendation
if [ -f "requirements.txt" ]; then
    pip3 install ddtrace
    pip3 uninstall opentelemetry-distro opentelemetry-exporter-otlp-proto-grpc openfeature-hooks-opentelemetry
fi
cd ../..

# Checkout service
echo "  - Checkout service"
cd src/checkout
if [ -f "go.mod" ]; then
    go mod tidy
fi
cd ../..

# Email service
echo "  - Email service"
cd src/email
if [ -f "Gemfile" ]; then
    bundle install
fi
cd ../..

# Ad service
echo "  - Ad service"
cd src/ad
if [ -f "build.gradle" ]; then
    ./gradlew build
fi
cd ../..

# Quote service
echo "  - Quote service"
cd src/quote
if [ -f "composer.json" ]; then
    composer install
fi
cd ../..

# Shipping service
echo "  - Shipping service"
cd src/shipping
if [ -f "Cargo.toml" ]; then
    cargo build
fi
cd ../..

# Currency service
echo "  - Currency service"
cd src/currency
if [ -f "CMakeLists.txt" ]; then
    mkdir -p build && cd build
    cmake .. && make
fi
cd ../..

echo "✅ DataDog dependencies installed"

# Build services with DataDog configuration
echo "🔨 Building services with DataDog configuration"
docker-compose build

echo ""
echo "🎉 Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with DataDog credentials"
echo "2. Start the services: docker-compose up -d"
echo "3. Verify DataDog integration in your DataDog dashboard"
echo "4. Monitor the migration progress"
echo ""
echo "To rollback to OpenTelemetry:"
echo "1. cp docker-compose.yml.backup docker-compose.yml"
echo "2. Restore original package.json files"
echo "3. docker-compose up -d"
echo ""
echo "📊 Check your DataDog dashboard for traces, logs, and metrics!"
