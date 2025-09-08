// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const health = require('grpc-js-health-check')

// Initialize DataDog tracing
const tracer = require('dd-trace');
tracer.init({
  service: 'payment',
  env: process.env.DD_ENV || 'development',
  version: process.env.DD_VERSION || 'latest',
  hostname: process.env.DD_AGENT_HOST || 'datadog-agent',
  port: process.env.DD_TRACE_AGENT_PORT || 8126,
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  appsec: false
});

const charge = require('./charge')
const logger = require('./logger')

async function chargeServiceHandler(call, callback) {
  const tracer = require('dd-trace');
  const span = tracer.scope().active();

  try {
    const amount = call.request.amount
    if (span) {
      span.setTag('app.payment.amount', parseFloat(`${amount.units}.${amount.nanos}`).toFixed(2))
    }
    logger.info({ request: call.request }, "Charge request received.")

    const response = await charge.charge(call.request)
    callback(null, response)

  } catch (err) {
    logger.warn({ err })

    if (span) {
      span.setTag('error', true);
      span.setTag('error.message', err.message);
      span.setTag('error.stack', err.stack);
    }
    callback(err)
  }
}

async function closeGracefully(signal) {
  server.forceShutdown()
  process.kill(process.pid, signal)
}

const otelDemoPackage = grpc.loadPackageDefinition(protoLoader.loadSync('demo.proto'))
const server = new grpc.Server()

server.addService(health.service, new health.Implementation({
  '': health.servingStatus.SERVING
}))

server.addService(otelDemoPackage.oteldemo.PaymentService.service, { charge: chargeServiceHandler })

server.bindAsync(`0.0.0.0:${process.env['PAYMENT_PORT']}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    return logger.error({ err })
  }

  logger.info(`payment gRPC server started on port ${port}`)
})

process.once('SIGINT', closeGracefully)
process.once('SIGTERM', closeGracefully)
