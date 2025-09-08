// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Product Catalog Service Instrumentation

package main

import (
	"os"

	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gopkg.in/DataDog/dd-trace-go.v1/profiler"
)

func initDataDog() {
	// Configure DataDog tracing
	tracer.Start(
		tracer.WithService("product-catalog"),
		tracer.WithEnv(getEnv("DD_ENV", "development")),
		tracer.WithServiceVersion(getEnv("DD_VERSION", "latest")),
		tracer.WithAgentAddr(getEnv("DD_AGENT_HOST", "datadog-agent")+":"+getEnv("DD_TRACE_AGENT_PORT", "8126")),
		tracer.WithRuntimeMetrics(),
		tracer.WithAnalytics(true),
	)

	// Configure DataDog profiling
	profiler.Start(
		profiler.WithService("product-catalog"),
		profiler.WithEnv(getEnv("DD_ENV", "development")),
		profiler.WithVersion(getEnv("DD_VERSION", "latest")),
		profiler.WithAgentAddr(getEnv("DD_AGENT_HOST", "datadog-agent")+":"+getEnv("DD_TRACE_AGENT_PORT", "8126")),
		profiler.WithProfileTypes(
			profiler.CPUProfile,
			profiler.HeapProfile,
			profiler.GoroutineProfile,
		),
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
