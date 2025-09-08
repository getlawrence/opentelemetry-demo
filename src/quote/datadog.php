<?php
// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Quote Service Configuration

use DataDog\DogStatsd;

// Configure DataDog StatsD client
$statsd = new DogStatsd([
    'host' => getenv('DD_AGENT_HOST') ?: 'datadog-agent',
    'port' => getenv('DD_DOGSTATSD_PORT') ?: 8125,
    'global_tags' => [
        'service' => 'quote',
        'env' => getenv('DD_ENV') ?: 'development',
        'version' => getenv('DD_VERSION') ?: 'latest',
    ]
]);

// Set global configuration
$statsd->setGlobalTags([
    'service' => 'quote',
    'env' => getenv('DD_ENV') ?: 'development',
    'version' => getenv('DD_VERSION') ?: 'latest',
]);

// Make statsd available globally
$GLOBALS['statsd'] = $statsd;

// Helper function to get statsd instance
function getStatsd(): DogStatsd {
    return $GLOBALS['statsd'];
}

// Helper function to track custom metrics
function trackMetric(string $name, float $value, array $tags = []): void {
    getStatsd()->gauge($name, $value, $tags);
}

// Helper function to increment counters
function incrementCounter(string $name, array $tags = []): void {
    getStatsd()->increment($name, 1, $tags);
}

// Helper function to track timing
function trackTiming(string $name, float $duration, array $tags = []): void {
    getStatsd()->timing($name, $duration, $tags);
}

echo "DataDog StatsD initialized for quote service\n";
