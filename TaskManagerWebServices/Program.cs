
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using System.Text;
using TaskManagerDAL;
using TaskManagerDAL.Models;
using TaskManagerWebServices.Controllers;
using TaskManagerWebServices.Middleware;
using TaskManagerWebServices.Utilities;

namespace TaskManagerWebServices
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddScoped<TaskManagerRepository>();
            builder.Services.AddScoped<ITokenService, TokenService>();
           

            builder.Services.AddControllers();
            builder.Services.AddDbContext<TaskManagerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TaskManagerDBConnectionString")));
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            var config = builder.Configuration;

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = config["Jwt:Issuer"],
                        ValidAudience = config["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
                    };
                });

            builder.Services.AddAuthorization();

            builder.Services.AddHttpContextAccessor();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:4200", "http://localhost:8091", "http://10.59.221.74:8091") 
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials()
                          .WithExposedHeaders("X-Total-Count", "X-Page-Number", "X-Page-Size")); //ADD THIS
            });

            Serilog.Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()   // Only Information and above globally
                .MinimumLevel.Override("Microsoft", LogEventLevel.Error)   // Ignore Microsoft logs
                .MinimumLevel.Override("System", LogEventLevel.Error)      // Ignore system logs
                .Filter.ByIncludingOnly(e =>
                    e.Properties.ContainsKey("SourceContext") &&            // Only log sources that have a namespace
                    e.Properties["SourceContext"].ToString()
                        .Contains("TaskManagerWebServices.Controllers")      //  ONLY YOUR CONTROLLERS LOGS
                )
                .WriteTo.File("Log.txt", rollingInterval: RollingInterval.Day)
                .WriteTo.MSSqlServer(
                    connectionString: builder.Configuration.GetConnectionString("TaskManagerDBConnectionString"),
                    sinkOptions: new Serilog.Sinks.MSSqlServer.MSSqlServerSinkOptions
                    {
                        TableName = "Logs",
                        AutoCreateSqlTable = true
                    }
                )
                .CreateLogger();


            builder.Host.UseSerilog();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
         
            app.UseSwagger();
            app.UseSwaggerUI();
            

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");
            app.UseMiddleware<ApiLoggingMiddleware>();

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseSerilogRequestLogging();

            app.MapControllers();

            app.Run();
        }
    }
}
