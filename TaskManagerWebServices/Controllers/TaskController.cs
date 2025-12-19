using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Security.Claims;
using TaskManagerDAL;
using TaskManagerWebServices.Models;

namespace TaskManagerWebServices.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly TaskManagerRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AdminActivitiesController> _logger;

        public TaskController(TaskManagerRepository repo, IHttpContextAccessor httpContextAccessor, ILogger<AdminActivitiesController> logger)
        {
            _repository = repo;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetTasks()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                _logger.LogInformation($"User {userId} requested their tasks.");

                var tasks = _repository.GetTasks(userId);

                if (tasks != null)
                {
                    _logger.LogInformation($"Fetched {tasks.Count} tasks for user {userId}.");
                    return Ok(tasks);
                }
                else
                {
                    _logger.LogWarning($"No tasks found for user {userId}.");
                    return NotFound("No tasks found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in GetTasks: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public IActionResult CreateTask(Models.TaskModel taskModel)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                _logger.LogInformation($"User {userId} attempting to create a new task titled '{taskModel.Title}'.");

                var task = new TaskManagerDAL.Models.Task
                {
                    Title = taskModel.Title,
                    Description = taskModel.Description,
                    Status = taskModel.Status,
                    Priority = taskModel.Priority,
                    DueDate = taskModel.DueDate,
                    CreatedBy = userId,
                    AssignedTo = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsDeleted = false
                };

                int taskId = _repository.AddTask(task);

                if (taskId > 0)
                {
                    _logger.LogInformation($"Task '{task.Title}' created successfully by user {userId}.");
                    return Ok(task);
                }
                else
                {
                    _logger.LogError("Database failed to create a task.");
                    return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in CreateTask: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPatch]
        [Authorize]
        public IActionResult UpdateTask(Models.TaskModel taskModel)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                _logger.LogInformation($"User {userId} attempting to update task {taskModel.TaskId}.");

                var existingTask = _repository.GetTaskById(taskModel.TaskId);

                if (existingTask == null)
                {
                    _logger.LogWarning($"Task {taskModel.TaskId} not found for updating.");
                    return NotFound("Task not found");
                }

                existingTask.Title = taskModel.Title;
                existingTask.Description = taskModel.Description;
                existingTask.Status = taskModel.Status;
                existingTask.Priority = taskModel.Priority;
                existingTask.DueDate = taskModel.DueDate;
                existingTask.UpdatedAt = DateTime.Now;

                int isUpdated = _repository.UpdateTask(existingTask, userId);

                if (isUpdated == 1)
                {
                    _logger.LogInformation($"Task {taskModel.TaskId} updated successfully by user {userId}.");
                    return Ok(existingTask);
                }
                else
                {
                    _logger.LogError($"Database failed to update task {taskModel.TaskId}.");
                    return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in UpdateTask: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Authorize]
        public IActionResult DeleteTask(int taskId)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                _logger.LogInformation($"User {userId} attempting to delete task {taskId}.");

                int isDeleted = _repository.DeleteTask(taskId, userId);

                if (isDeleted == 1)
                {
                    _logger.LogInformation($"Task {taskId} deleted successfully by user {userId}.");
                    return Ok(new { success = true, message = "Task successfully deleted" });
                }
                else
                {
                    _logger.LogError($"Failed to delete task {taskId}. DB returned error.");
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { success = false, message = "Internal server error" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in DeleteTask: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetDeletedTasks()
        {
            int userId = GetUserIdFromClaims();
            try
            {
                var task = _repository.GetRecycleBinTasks(userId);
                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        private int GetUserIdFromClaims()
        {
            try
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null)
                    throw new Exception("User id claim missing");

                return int.Parse(userIdClaim.Value);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed to extract user id from claims: " + ex.Message);
                return -99;
            }
        }
    }
}
