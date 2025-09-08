# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0
# DataDog Migration - Ad Service


FROM --platform=${BUILDPLATFORM} eclipse-temurin:21-jdk AS builder
ARG _JAVA_OPTIONS
WORKDIR /usr/src/app/

COPY ./src/ad/gradlew* ./src/ad/settings.gradle* ./src/ad/build.gradle ./
COPY ./src/ad/gradle ./gradle

RUN chmod +x ./gradlew
RUN ./gradlew
RUN ./gradlew downloadRepos

COPY ./src/ad/ ./
COPY ./pb/ ./proto
RUN chmod +x ./gradlew
RUN ./gradlew installDist -PprotoSourceDir=./proto

# -----------------------------------------------------------------------------

FROM eclipse-temurin:21-jre

ARG DD_JAVA_AGENT_VERSION
ARG _JAVA_OPTIONS

WORKDIR /usr/src/app/

COPY --from=builder /usr/src/app/ ./
ADD --chmod=644 https://github.com/DataDog/dd-trace-java/releases/download/v$DD_JAVA_AGENT_VERSION/dd-java-agent.jar /usr/src/app/dd-java-agent.jar
ENV JAVA_TOOL_OPTIONS=-javaagent:/usr/src/app/dd-java-agent.jar

EXPOSE ${AD_PORT}
ENTRYPOINT [ "./build/install/opentelemetry-demo-ad/bin/Ad" ]
