// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const health = require('grpc-js-health-check')

const add = require('./add')
const logger = require('./logger')

async function addToWishlistServiceHandler(call, callback) {
    try {
        const productId = call.request.productId
        logger.info({ request: call.request }, "Add to wishlist request received.")
        const response = await add.add(productId)
        callback(null, response)

    } catch (err) {
        logger.warn({ err })
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

server.addService(otelDemoPackage.oteldemo.WishlistService.service, { add: addToWishlistServiceHandler })

server.bindAsync(`0.0.0.0:${process.env['WISHLIST_PORT']}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        return logger.error({ err })
    }

    logger.info(`wishlist gRPC server started on port ${port}`)
})

process.once('SIGINT', closeGracefully)
process.once('SIGTERM', closeGracefully)
