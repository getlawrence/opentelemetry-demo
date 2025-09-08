#!/usr/bin/python

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0
# DataDog Migration - Recommendation Service Instrumentation

import os
import ddtrace
from ddtrace import config, patch_all
from ddtrace.contrib.grpc import patch as grpc_patch
from ddtrace.contrib.logging import patch as logging_patch

# Configure DataDog tracing
ddtrace.config.service = 'recommendation'
ddtrace.config.env = os.getenv('DD_ENV', 'development')
ddtrace.config.version = os.getenv('DD_VERSION', 'latest')
ddtrace.config.agent.hostname = os.getenv('DD_AGENT_HOST', 'datadog-agent')
ddtrace.config.agent.port = int(os.getenv('DD_TRACE_AGENT_PORT', '8126'))

# Configure gRPC tracing
config.grpc['service_name'] = 'recommendation'
config.grpc['analytics_enabled'] = True

# Configure logging
config.logging['service_name'] = 'recommendation'

# Patch all modules for automatic instrumentation
patch_all()

# Set global tags
ddtrace.tracer.set_tags({
    'service': 'recommendation',
    'env': os.getenv('DD_ENV', 'development'),
    'version': os.getenv('DD_VERSION', 'latest')
})

print('DataDog tracing initialized for recommendation service')
