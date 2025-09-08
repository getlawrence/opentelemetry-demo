// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Shipping Service Instrumentation

use reqwest::Client;
use serde_json::json;
use std::env;
use std::time::Duration;
use tokio::time::interval;

pub struct DataDogClient {
    client: Client,
    agent_host: String,
    agent_port: u16,
    service_name: String,
    env: String,
    version: String,
}

impl DataDogClient {
    pub fn new() -> Self {
        let client = Client::new();
        let agent_host = env::var("DD_AGENT_HOST").unwrap_or_else(|_| "datadog-agent".to_string());
        let agent_port = env::var("DD_DOGSTATSD_PORT")
            .unwrap_or_else(|_| "8125".to_string())
            .parse()
            .unwrap_or(8125);
        let service_name = "shipping".to_string();
        let env = env::var("DD_ENV").unwrap_or_else(|_| "development".to_string());
        let version = env::var("DD_VERSION").unwrap_or_else(|_| "latest".to_string());

        Self {
            client,
            agent_host,
            agent_port,
            service_name,
            env,
            version,
        }
    }

    pub async fn send_metric(&self, name: &str, value: f64, tags: Vec<&str>) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("http://{}:{}/api/v1/series", self.agent_host, self.agent_port);
        
        let mut all_tags = vec![
            format!("service:{}", self.service_name),
            format!("env:{}", self.env),
            format!("version:{}", self.version),
        ];
        all_tags.extend(tags.iter().map(|t| t.to_string()));

        let payload = json!({
            "series": [{
                "metric": name,
                "points": [[std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() as i64, value]],
                "tags": all_tags,
                "type": "gauge"
            }]
        });

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            eprintln!("Failed to send metric to DataDog: {}", response.status());
        }

        Ok(())
    }

    pub async fn increment_counter(&self, name: &str, tags: Vec<&str>) -> Result<(), Box<dyn std::error::Error>> {
        self.send_metric(name, 1.0, tags).await
    }

    pub async fn track_timing(&self, name: &str, duration: Duration, tags: Vec<&str>) -> Result<(), Box<dyn std::error::Error>> {
        let duration_ms = duration.as_millis() as f64;
        self.send_metric(name, duration_ms, tags).await
    }
}

pub async fn start_metrics_collection() {
    let datadog = DataDogClient::new();
    let mut interval = interval(Duration::from_secs(30));

    loop {
        interval.tick().await;
        
        // Send service health metrics
        if let Err(e) = datadog.send_metric("shipping.service.health", 1.0, vec![]).await {
            eprintln!("Failed to send health metric: {}", e);
        }
    }
}
