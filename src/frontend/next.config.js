// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('next').NextConfig} */

const dotEnv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { resolve } = require('path');

const myEnv = dotEnv.config({
  path: resolve(__dirname, '../../.env'),
});
dotenvExpand.expand(myEnv);

const {
  AD_ADDR = '',
  CART_ADDR = '',
  CHECKOUT_ADDR = '',
  CURRENCY_ADDR = '',
  PRODUCT_CATALOG_ADDR = '',
  RECOMMENDATION_ADDR = '',
  SHIPPING_ADDR = '',
  ENV_PLATFORM = '',
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  OTEL_SERVICE_NAME = 'frontend',
  PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  // DataDog environment variables
  NEXT_PUBLIC_DD_APPLICATION_ID = 'test-app-id',
  NEXT_PUBLIC_DD_CLIENT_TOKEN = 'test-client-token',
  NEXT_PUBLIC_DD_SERVICE = 'frontend-web',
  NEXT_PUBLIC_DD_ENV = 'development',
  NEXT_PUBLIC_DD_VERSION = 'latest',
  NEXT_PUBLIC_DD_SITE = 'datadoghq.com',
  NEXT_PUBLIC_DD_AGENT_HOST = 'datadog-agent',
  NEXT_PUBLIC_DD_TRACE_AGENT_PORT = '8126',
} = process.env;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.http2 = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.fs = false;
    }

    return config;
  },
  env: {
    AD_ADDR,
    CART_ADDR,
    CHECKOUT_ADDR,
    CURRENCY_ADDR,
    PRODUCT_CATALOG_ADDR,
    RECOMMENDATION_ADDR,
    SHIPPING_ADDR,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    NEXT_PUBLIC_PLATFORM: ENV_PLATFORM,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: OTEL_SERVICE_NAME,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    // DataDog environment variables
    NEXT_PUBLIC_DD_APPLICATION_ID,
    NEXT_PUBLIC_DD_CLIENT_TOKEN,
    NEXT_PUBLIC_DD_SERVICE,
    NEXT_PUBLIC_DD_ENV,
    NEXT_PUBLIC_DD_VERSION,
    NEXT_PUBLIC_DD_SITE,
    NEXT_PUBLIC_DD_AGENT_HOST,
    NEXT_PUBLIC_DD_TRACE_AGENT_PORT,
  },
  images: {
    loader: "custom",
    loaderFile: "./utils/imageLoader.js"
  }
};

module.exports = nextConfig;
