// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Currency Service Client Implementation

#include "datadog_client.h"
#include <iostream>
#include <sstream>

DataDogClient::DataDogClient() 
    : agentHost_(getEnvVar("DD_AGENT_HOST", "datadog-agent"))
    , agentPort_(std::stoi(getEnvVar("DD_DOGSTATSD_PORT", "8125")))
    , serviceName_("currency")
    , env_(getEnvVar("DD_ENV", "development"))
    , version_(getEnvVar("DD_VERSION", "latest"))
    , curl_(nullptr) {
    initializeCurl();
}

DataDogClient::~DataDogClient() {
    if (curl_) {
        curl_easy_cleanup(curl_);
    }
    curl_global_cleanup();
}

void DataDogClient::initializeCurl() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl_ = curl_easy_init();
    if (!curl_) {
        std::cerr << "Failed to initialize CURL" << std::endl;
    }
}

void DataDogClient::sendMetric(const std::string& name, double value, const std::vector<std::string>& tags) {
    nlohmann::json payload;
    nlohmann::json series = nlohmann::json::array();
    nlohmann::json metric = nlohmann::json::object();
    
    // Add default tags
    std::vector<std::string> allTags = {
        "service:" + serviceName_,
        "env:" + env_,
        "version:" + version_
    };
    allTags.insert(allTags.end(), tags.begin(), tags.end());
    
    metric["metric"] = name;
    metric["points"] = nlohmann::json::array({nlohmann::json::array({
        std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count(),
        value
    })});
    metric["tags"] = allTags;
    metric["type"] = "gauge";
    
    series.push_back(metric);
    payload["series"] = series;
    
    sendToDataDog(payload);
}

void DataDogClient::incrementCounter(const std::string& name, const std::vector<std::string>& tags) {
    sendMetric(name, 1.0, tags);
}

void DataDogClient::trackTiming(const std::string& name, std::chrono::milliseconds duration, const std::vector<std::string>& tags) {
    sendMetric(name, duration.count(), tags);
}

void DataDogClient::sendToDataDog(const nlohmann::json& payload) {
    if (!curl_) {
        std::cerr << "CURL not initialized" << std::endl;
        return;
    }
    
    std::string url = "http://" + agentHost_ + ":" + std::to_string(agentPort_) + "/api/v1/series";
    std::string jsonStr = payload.dump();
    
    curl_easy_setopt(curl_, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl_, CURLOPT_POSTFIELDS, jsonStr.c_str());
    curl_easy_setopt(curl_, CURLOPT_HTTPHEADER, curl_slist_append(nullptr, "Content-Type: application/json"));
    curl_easy_setopt(curl_, CURLOPT_WRITEFUNCTION, [](void* contents, size_t size, size_t nmemb, void* userp) -> size_t {
        return size * nmemb;
    });
    
    CURLcode res = curl_easy_perform(curl_);
    if (res != CURLE_OK) {
        std::cerr << "Failed to send metric to DataDog: " << curl_easy_strerror(res) << std::endl;
    }
}

std::string DataDogClient::getEnvVar(const std::string& name, const std::string& defaultValue) {
    const char* value = std::getenv(name.c_str());
    return value ? std::string(value) : defaultValue;
}
