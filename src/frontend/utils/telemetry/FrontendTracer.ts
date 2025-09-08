// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

// No-op tracer after migration to DataDog
// Kept for compatibility; replaced by DataDogTracer
const FrontendTracer = async (): Promise<void> => {
	return;
};

export default FrontendTracer;
