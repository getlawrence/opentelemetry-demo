// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Payment Service Logger

const pino = require('pino')

const logger = pino({
  mixin() {
    return {
      'service.name': process.env['DD_SERVICE'] || 'payment',
      'service.version': process.env['DD_VERSION'] || '1.0.0',
      'env': process.env['DD_ENV'] || 'development'
    }
  },
  formatters: {
    level: (label) => {
      return { 'level': label };
    },
  },
});

module.exports = logger;
