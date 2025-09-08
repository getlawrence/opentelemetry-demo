// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Frontend Tracer Configuration

import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

// DataDog configuration with fallback values
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined' && window.ENV && (window.ENV as any)[key]) {
    return (window.ENV as any)[key];
  }
  return defaultValue;
};

const NEXT_PUBLIC_DD_APPLICATION_ID = getEnvVar('NEXT_PUBLIC_DD_APPLICATION_ID', 'test-app-id');
const NEXT_PUBLIC_DD_CLIENT_TOKEN = getEnvVar('NEXT_PUBLIC_DD_CLIENT_TOKEN', 'test-client-token');
const NEXT_PUBLIC_DD_SERVICE = getEnvVar('NEXT_PUBLIC_DD_SERVICE', 'frontend-web');
const NEXT_PUBLIC_DD_ENV = getEnvVar('NEXT_PUBLIC_DD_ENV', 'development');
const NEXT_PUBLIC_DD_VERSION = getEnvVar('NEXT_PUBLIC_DD_VERSION', 'latest');
const NEXT_PUBLIC_DD_SITE = getEnvVar('NEXT_PUBLIC_DD_SITE', 'datadoghq.com');
const NEXT_PUBLIC_DD_AGENT_HOST = getEnvVar('NEXT_PUBLIC_DD_AGENT_HOST', 'datadog-agent');
const NEXT_PUBLIC_DD_TRACE_AGENT_PORT = getEnvVar('NEXT_PUBLIC_DD_TRACE_AGENT_PORT', '8126');
const IS_SYNTHETIC_REQUEST = getEnvVar('IS_SYNTHETIC_REQUEST', '');

const DataDogTracer = async () => {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }

  // Initialize DataDog RUM (Real User Monitoring)
  datadogRum.init({
    applicationId: NEXT_PUBLIC_DD_APPLICATION_ID,
    clientToken: NEXT_PUBLIC_DD_CLIENT_TOKEN,
    site: NEXT_PUBLIC_DD_SITE,
    service: NEXT_PUBLIC_DD_SERVICE,
    env: NEXT_PUBLIC_DD_ENV,
    version: NEXT_PUBLIC_DD_VERSION,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    beforeSend: (event) => {
      // Add custom attributes
      if (event.view) {
        event.view.custom = {
          ...(event.view.custom || {}),
          synthetic_request: IS_SYNTHETIC_REQUEST,
        };
      }
      return true; // Allow the event to be sent
    },
  });

  // Initialize DataDog Logs
  datadogLogs.init({
    clientToken: NEXT_PUBLIC_DD_CLIENT_TOKEN,
    site: NEXT_PUBLIC_DD_SITE,
    service: NEXT_PUBLIC_DD_SERVICE,
    env: NEXT_PUBLIC_DD_ENV,
    version: NEXT_PUBLIC_DD_VERSION,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
    beforeSend: (log) => {
      // Add custom attributes
      log.context = {
        ...(log.context || {}),
        synthetic_request: IS_SYNTHETIC_REQUEST,
      };
      return true; // Allow the log to be sent
    },
  });

  // Set user context if available
  const userId = localStorage.getItem('userId');
  if (userId) {
    datadogRum.setUser({
      id: userId,
    });
  }

  // Set global context
  datadogRum.setGlobalContextProperty('synthetic_request', IS_SYNTHETIC_REQUEST);
  datadogRum.setGlobalContextProperty('service', NEXT_PUBLIC_DD_SERVICE);
  datadogRum.setGlobalContextProperty('version', NEXT_PUBLIC_DD_VERSION);

  // Add custom action tracking
  datadogRum.addAction('page_load', {
    synthetic_request: IS_SYNTHETIC_REQUEST,
  });

  console.log('DataDog RUM and Logs initialized for frontend');
};

export default DataDogTracer;
