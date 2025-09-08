// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Payment Service Instrumentation

const tracer = require('dd-trace');

// Configure DataDog tracing
tracer.init({
  service: 'payment',
  env: process.env.DD_ENV || 'development',
  version: process.env.DD_VERSION || 'latest',
  hostname: process.env.DD_AGENT_HOST || 'datadog-agent',
  port: process.env.DD_TRACE_AGENT_PORT || 8126,
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  appsec: false,
  plugins: {
    'http': {
      enabled: true,
      blacklist: ['/health', '/metrics']
    },
    'grpc': {
      enabled: true
    },
    'redis': {
      enabled: true
    },
    'fs': {
      enabled: false // Disable to reduce noise
    }
  },
  tags: {
    'service': 'payment',
    'env': process.env.DD_ENV || 'development',
    'version': process.env.DD_VERSION || 'latest'
  }
});

// Set global tags
tracer.setTag('service', 'payment');
tracer.setTag('env', process.env.DD_ENV || 'development');
tracer.setTag('version', process.env.DD_VERSION || 'latest');

console.log('DataDog tracing initialized for payment service');

module.exports = tracer;
