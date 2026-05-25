using System.Text.Json;
using Bambi.Services.Common;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Bambi.API.Middleware;

// One single place to catch everything that escapes a controller. Maps domain
// exceptions to HTTP codes and serialises an RFC 7807 ProblemDetails payload so
// the frontend always knows where to find a human-readable message.
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        int statusCode;
        string title;
        string detail;
        var fieldErrors = new Dictionary<string, List<string>>();

        if (ex is ValidationException validationEx)
        {
            statusCode = StatusCodes.Status400BadRequest;
            title = "Validation Failed";
            detail = "One or more validation errors occurred.";

            foreach (var failure in validationEx.Errors)
            {
                if (!fieldErrors.ContainsKey(failure.PropertyName))
                {
                    fieldErrors[failure.PropertyName] = new List<string>();
                }

                fieldErrors[failure.PropertyName].Add(failure.ErrorMessage);
            }
        }
        else if (ex is NotFoundException)
        {
            statusCode = StatusCodes.Status404NotFound;
            title = "Not Found";
            detail = ex.Message;
        }
        else if (ex is ForbiddenException)
        {
            statusCode = StatusCodes.Status403Forbidden;
            title = "Forbidden";
            detail = ex.Message;
        }
        else if (ex is UnauthorizedException)
        {
            statusCode = StatusCodes.Status401Unauthorized;
            title = "Unauthorized";
            detail = ex.Message;
        }
        else if (ex is ConflictException)
        {
            statusCode = StatusCodes.Status409Conflict;
            title = "Conflict";
            detail = ex.Message;
        }
        else if (ex is AppException appEx)
        {
            // Any other AppException-derived class — use its declared status.
            statusCode = appEx.StatusCode;
            title = "Bad Request";
            detail = appEx.Message;
        }
        else
        {
            // Truly unexpected — log the stack so we can debug, but don't leak
            // internals to the caller.
            _logger.LogError(ex, "Unhandled exception while processing {Path}", context.Request.Path);
            statusCode = StatusCodes.Status500InternalServerError;
            title = "Internal Server Error";
            detail = "An unexpected error occurred.";
        }

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
            Type = "https://httpstatuses.com/" + statusCode,
        };

        if (fieldErrors.Count > 0)
        {
            // Convert each list to an array so the JSON shape matches what
            // ASP.NET Core's built-in validation responses produce.
            var asArrays = new Dictionary<string, string[]>();
            foreach (var entry in fieldErrors)
            {
                asArrays[entry.Key] = entry.Value.ToArray();
            }

            problem.Extensions["errors"] = asArrays;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };
        var json = JsonSerializer.Serialize(problem, options);
        await context.Response.WriteAsync(json);
    }
}
