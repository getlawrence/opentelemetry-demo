#!/usr/bin/python

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0
# DataDog Migration - Updated JSON Logger

import logging
import sys
from pythonjsonlogger import jsonlogger
import ddtrace


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        # DataDog trace context injection
        span = ddtrace.tracer.current_span()
        if span:
            log_record['dd.trace_id'] = str(span.trace_id)
            log_record['dd.span_id'] = str(span.span_id)
            log_record['dd.service'] = span.service
        else:
            log_record['dd.trace_id'] = '0'
            log_record['dd.span_id'] = '0'

def getJSONLogger(name):
    logger = logging.getLogger(name)
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter('%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] [dd.trace_id=%(dd.trace_id)s dd.span_id=%(dd.span_id)s] - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger
