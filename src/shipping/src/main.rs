// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

use actix_web::{App, HttpServer, middleware::Logger};
use std::env;
use tracing::info;

mod datadog;
use datadog::start_metrics_collection;
mod shipping_service;
use shipping_service::{get_quote, ship_order};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    info!("Starting DataDog instrumented shipping service");

    let port: u16 = env::var("SHIPPING_PORT")
        .expect("$SHIPPING_PORT is not set")
        .parse()
        .expect("$SHIPPING_PORT is not a valid port");
    let addr = format!("0.0.0.0:{}", port);
    info!(
        name = "ServerStartedSuccessfully",
        addr = addr.as_str(),
        message = "Shipping service is running"
    );

    // Start DataDog metrics collection in background
    tokio::spawn(start_metrics_collection());

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .service(get_quote)
            .service(ship_order)
    })
    .bind(&addr)?
    .run()
    .await
}
