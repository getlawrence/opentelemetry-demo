// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
// DataDog Migration - Currency Service Client

#pragma once

#include <string>
#include <vector>
#include <chrono>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

class DataDogClient {
public:
    DataDogClient();
    ~DataDogClient();
    
    void sendMetric(const std::string& name, double value, const std::vector<std::string>& tags = {});
    void incrementCounter(const std::string& name, const std::vector<std::string>& tags = {});
    void trackTiming(const std::string& name, std::chrono::milliseconds duration, const std::vector<std::string>& tags = {});

private:
    std::string agentHost_;
    int agentPort_;
    std::string serviceName_;
    std::string env_;
    std::string version_;
    CURL* curl_;
    
    void initializeCurl();
    void sendToDataDog(const nlohmann::json& payload);
    std::string getEnvVar(const std::string& name, const std::string& defaultValue);
};
