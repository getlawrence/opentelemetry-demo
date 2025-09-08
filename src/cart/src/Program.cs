// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
using System;

using cart.cartstore;
using cart.services;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Datadog.Trace;
using Datadog.Trace.Configuration;
using OpenFeature;
using OpenFeature.Contrib.Providers.Flagd;
using OpenFeature.Hooks;

var builder = WebApplication.CreateBuilder(args);
string valkeyAddress = builder.Configuration["VALKEY_ADDR"];
if (string.IsNullOrEmpty(valkeyAddress))
{
    Console.WriteLine("VALKEY_ADDR environment variable is required.");
    Environment.Exit(1);
}

builder.Logging
    .AddConsole();

builder.Services.AddSingleton<ICartStore>(x =>
{
    var store = new ValkeyCartStore(x.GetRequiredService<ILogger<ValkeyCartStore>>(), valkeyAddress);
    store.Initialize();
    return store;
});

builder.Services.AddOpenFeature(openFeatureBuilder =>
{
    openFeatureBuilder
        .AddHostedFeatureLifecycle()
        .AddProvider(_ => new FlagdProvider())
        .AddHook<MetricsHook>()
        .AddHook<TraceEnricherHook>();
});

builder.Services.AddSingleton(x =>
    new CartService(
        x.GetRequiredService<ICartStore>(),
        new ValkeyCartStore(x.GetRequiredService<ILogger<ValkeyCartStore>>(), "badhost:1234"),
        x.GetRequiredService<IFeatureClient>()
));


// Configure DataDog tracing
var tracerSettings = TracerSettings.FromDefaultSources();
tracerSettings.ServiceName = "cart";
tracerSettings.Environment = Environment.GetEnvironmentVariable("DD_ENV") ?? "development";
tracerSettings.ServiceVersion = Environment.GetEnvironmentVariable("DD_VERSION") ?? "latest";

// Configure DataDog agent endpoint
var agentHost = Environment.GetEnvironmentVariable("DD_AGENT_HOST") ?? "datadog-agent";
var agentPort = Environment.GetEnvironmentVariable("DD_TRACE_AGENT_PORT") ?? "8126";
tracerSettings.AgentUri = new Uri($"http://{agentHost}:{agentPort}");

// Initialize DataDog tracer
Tracer.Configure(tracerSettings);
builder.Services.AddGrpc();
builder.Services.AddGrpcHealthChecks()
    .AddCheck("Sample", () => HealthCheckResult.Healthy());

var app = builder.Build();

var ValkeyCartStore = (ValkeyCartStore)app.Services.GetRequiredService<ICartStore>();

app.MapGrpcService<CartService>();
app.MapGrpcHealthChecksService();

app.MapGet("/", async context =>
{
    await context.Response.WriteAsync("Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");
});

app.Run();
