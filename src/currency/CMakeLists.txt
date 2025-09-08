cmake_minimum_required(VERSION 3.26)
project(currency)

find_package(Protobuf REQUIRED)
find_package(gRPC CONFIG REQUIRED)
find_package(CURL REQUIRED)
find_package(nlohmann_json REQUIRED)

set(GENERATED_PROTOBUF_PATH "${CMAKE_BINARY_DIR}/generated/proto")

add_subdirectory(genproto)

include_directories("${GENERATED_PROTOBUF_PATH}")

add_executable(currency src/server.cpp src/datadog_client.cpp)
add_dependencies(currency demo-proto)
target_link_libraries(
    currency demo-proto protobuf::libprotobuf
     CURL::libcurl nlohmann_json::nlohmann_json gRPC::grpc++)

install(TARGETS currency DESTINATION bin)
