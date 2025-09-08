# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM --platform=${BUILDPLATFORM} gradle:8-jdk17 AS builder

WORKDIR /usr/src/app/

COPY ./src/fraud-detection/ ./
COPY ./pb/ ./src/main/proto/

RUN gradle shadowJar

# -----------------------------------------------------------------------------

FROM gcr.io/distroless/java17-debian12:nonroot

ARG DD_JAVA_AGENT_VERSION
WORKDIR /usr/src/app/

ADD --chmod=644 https://github.com/DataDog/dd-trace-java/releases/download/v$DD_JAVA_AGENT_VERSION/dd-java-agent.jar /usr/src/app/dd-java-agent.jar
ENV JAVA_TOOL_OPTIONS=-javaagent:/usr/src/app/dd-java-agent.jar

COPY --from=builder /usr/src/app/build/libs/fraud-detection-1.0-all.jar fraud-detection-1.0-all.jar

ENTRYPOINT [ "java", "-jar", "fraud-detection-1.0-all.jar" ]
