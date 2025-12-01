using System.Diagnostics;
using System.Text;
using Microsoft.AspNetCore.Http;
using TaskManagerDAL;
using TaskManagerDAL.Models;

namespace TaskManagerWebServices.Middleware
{
    public class ApiLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;

        public ApiLoggingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async System.Threading.Tasks.Task Invoke(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            // Read Request Body
            context.Request.EnableBuffering();
            string requestBody = "";
            if (context.Request.ContentLength > 0)
            {
                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                requestBody = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;
            }

            // Capture Response Body
            var originalBody = context.Response.Body;
            using var newBody = new MemoryStream();
            context.Response.Body = newBody;

            await _next(context);

            stopwatch.Stop();

            newBody.Seek(0, SeekOrigin.Begin);
            string responseBody = await new StreamReader(newBody).ReadToEndAsync();
            newBody.Seek(0, SeekOrigin.Begin);
            await newBody.CopyToAsync(originalBody);

            var log = new ApiLog
            {
                HttpMethod = context.Request.Method,
                Path = context.Request.Path,
                QueryString = context.Request.QueryString.ToString(),
                RequestBody = requestBody,
                ResponseBody = responseBody,
                StatusCode = context.Response.StatusCode,
                DurationMs = stopwatch.ElapsedMilliseconds,
                IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                Timestamp = DateTime.Now
            };

            // ❗ Resolve Scoped Repo inside a Scope
            using (var scope = _scopeFactory.CreateScope())
            {
                var repo = scope.ServiceProvider.GetRequiredService<TaskManagerRepository>();
                repo.InsertApiLog(log);
            }
        }
    }
}

