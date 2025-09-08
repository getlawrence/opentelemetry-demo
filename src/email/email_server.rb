# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

require "ostruct"
require "pony"
require "sinatra"

require "ddtrace"

# Configure DataDog tracing
Datadog.configure do |c|
  c.service = "email"
  c.env = ENV["DD_ENV"] || "development"
  c.version = ENV["DD_VERSION"] || "latest"
  c.agent.host = ENV["DD_AGENT_HOST"] || "datadog-agent"
  c.agent.port = ENV["DD_TRACE_AGENT_PORT"] || 8126
  c.tracing.analytics.enabled = true
  c.tracing.instrument :sinatra
end

set :port, ENV["EMAIL_PORT"]

post "/send_order_confirmation" do
  data = JSON.parse(request.body.read, object_class: OpenStruct)

  # get the current auto-instrumented span
  current_span = Datadog::Tracing.active_span
  if current_span
    current_span.set_tag("app.order.id", data.order.order_id)
  end

  send_email(data)

end

error do
  current_span = Datadog::Tracing.active_span
  if current_span
    current_span.set_error(env['sinatra.error'])
  end
end

def send_email(data)
  # create and start a manual span
  Datadog::Tracing.trace("send_email", service: "email") do |span|
    Pony.mail(
      to:       data.email,
      from:     "noreply@example.com",
      subject:  "Your confirmation email",
      body:     erb(:confirmation, locals: { order: data.order }),
      via:      :test
    )
    span.set_tag("app.email.recipient", data.email)
    puts "Order confirmation email sent to: #{data.email}"
  end
  # check out the OpenTelemetry Ruby docs at: 
  # https://opentelemetry.io/docs/instrumentation/ruby/manual/#creating-new-spans 
end
