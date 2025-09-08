// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Frontend Provider Component

import React, { useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

interface DataDogProviderProps {
  children: React.ReactNode;
}

const DataDogProvider: React.FC<DataDogProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize DataDog RUM and Logs on client side
    if (typeof window !== 'undefined') {
      const config = {
        applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID || '',
        clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || '',
        site: process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com',
        service: process.env.NEXT_PUBLIC_DD_SERVICE || 'frontend-web',
        env: process.env.NEXT_PUBLIC_DD_ENV || 'development',
        version: process.env.NEXT_PUBLIC_DD_VERSION || 'latest',
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input' as const,
      };

      if (config.applicationId && config.clientToken) {
        // Initialize RUM
        datadogRum.init(config);
        
        // Initialize Logs
        datadogLogs.init({
          clientToken: config.clientToken,
          site: config.site,
          service: config.service,
          env: config.env,
          version: config.version,
          forwardErrorsToLogs: true,
          sessionSampleRate: 100,
        });

        // Set global context
        datadogRum.setGlobalContextProperty('service', config.service);
        datadogRum.setGlobalContextProperty('version', config.version);
        datadogRum.setGlobalContextProperty('env', config.env);

        // Track page load
        datadogRum.startView('homepage');

        console.log('DataDog RUM and Logs initialized');
      }
    }
  }, []);

  return <>{children}</>;
};

export default DataDogProvider;
