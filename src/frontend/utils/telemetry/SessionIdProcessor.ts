// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import SessionGateway from "../../gateways/Session.gateway";

const { userId } = SessionGateway.getSession();

export class SessionIdProcessor {
	// No-op placeholders to match expected shape where imported
	forceFlush(): Promise<void> {
		return Promise.resolve();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onStart(): void {
		// no-op
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	onEnd(): void {}

	shutdown(): Promise<void> {
		return Promise.resolve();
	}
}
