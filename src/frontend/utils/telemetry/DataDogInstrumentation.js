// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Frontend Instrumentation

const { datadogRum } = require('@datadog/browser-rum');
const { datadogLogs } = require('@datadog/browser-logs');

// DataDog configuration
const DD_CONFIG = {
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID || '',
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || '',
  site: process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com',
  service: process.env.NEXT_PUBLIC_DD_SERVICE || 'frontend',
  env: process.env.NEXT_PUBLIC_DD_ENV || 'development',
  version: process.env.NEXT_PUBLIC_DD_VERSION || 'latest',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
};

// Initialize DataDog RUM
if (typeof window !== 'undefined' && DD_CONFIG.applicationId && DD_CONFIG.clientToken) {
  datadogRum.init(DD_CONFIG);
  
  // Initialize DataDog Logs
  datadogLogs.init({
    clientToken: DD_CONFIG.clientToken,
    site: DD_CONFIG.site,
    service: DD_CONFIG.service,
    env: DD_CONFIG.env,
    version: DD_CONFIG.version,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  });

  // Set global context
  datadogRum.setGlobalContextProperty('service', DD_CONFIG.service);
  datadogRum.setGlobalContextProperty('version', DD_CONFIG.version);
  datadogRum.setGlobalContextProperty('env', DD_CONFIG.env);

  // Track page views
  datadogRum.startView('homepage');

  console.log('DataDog RUM and Logs initialized for frontend');
}

// Export for use in other modules
module.exports = {
  datadogRum,
  datadogLogs,
};
