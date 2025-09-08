// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { NextApiHandler } from 'next';

const InstrumentationMiddleware = (handler: NextApiHandler): NextApiHandler => {
	return async (request, response) => {
		return handler(request, response);
	};
};

export default InstrumentationMiddleware;
