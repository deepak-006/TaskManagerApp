using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagerDAL;
using TaskManagerWebServices.Models;
using Serilog;

namespace TaskManagerWebServices.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AdminActivitiesController : ControllerBase
    {
        private readonly TaskManagerRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        //private readonly Serilog.ILogger _logger;
        private readonly ILogger<AdminActivitiesController> _logger;

        public AdminActivitiesController(
            TaskManagerRepository repo,
            IHttpContextAccessor accessor,
            ILogger<AdminActivitiesController> logger)
        {
            _repository = repo;
            _httpContextAccessor = accessor;
            _logger = logger;
        }


        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllUsers()
        {
            try
            {
                //_logger.LogInformation("Admin requested all users.");

                var users = _repository.GetAllUsers();
                if (users != null)
                {
                    //_logger.LogInformation($"Fetched {users.Count} users successfully.");
                    return Ok(users);
                }
                else
                {
                    _logger.LogWarning("No users found in the database.");
                    return NotFound("No users found");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in GetAllUsers: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        //[HttpGet]
        //[Authorize(Roles = "Admin")]
        //public IActionResult GetAllTasks()
        //{
        //    try
        //    {
        //        _logger.LogInformation("Admin requested all tasks.");

        //        var tasks = _repository.GetAllTasks();
        //        if (tasks != null)
        //        {
        //            _logger.LogInformation($"Fetched {tasks.Count} tasks successfully.");
        //            return Ok(tasks);
        //        }
        //        else
        //        {
        //            _logger.LogWarning("No tasks found.");
        //            return NotFound("No tasks found");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError("LogError in GetAllTasks: " + ex.Message);
        //        return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        //    }
        //}

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTasks(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                //_logger.LogInformation(
                //    "Admin requested tasks with pagination: pageNumber={PageNumber}, pageSize={PageSize}",
                //    pageNumber, pageSize);

                var tasks = await _repository.GetTasksAsync(pageNumber, pageSize);
                var totalCount = await _repository.GetTotalTaskCountAsync();

                if (tasks == null || tasks.Count == 0)
                {
                    //_logger.LogWarning("No tasks found for the given page.");
                    return NotFound("No tasks found");
                }

                // Add pagination metadata
                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page-Number", pageNumber.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                // ⭐ Mandatory for Angular to read headers
                Response.Headers.Append("Access-Control-Expose-Headers",
                                        "X-Total-Count,X-Page-Number,X-Page-Size");

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllTasks");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }



        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AssignTask(TaskModel taskModel)
        {
            try
            {
                int adminId = GetUserIdFromClaims();
                //_logger.LogInformation($"Admin {adminId} attempting to assign a task to User {taskModel.AssignedTo}");

                var task = new TaskManagerDAL.Models.Task
                {
                    Title = taskModel.Title,
                    Description = taskModel.Description,
                    Status = taskModel.Status,
                    Priority = taskModel.Priority,
                    DueDate = taskModel.DueDate,
                    CreatedBy = adminId,
                    AssignedTo = taskModel.AssignedTo,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsDeleted = false
                };

                int taskId = _repository.AddTask(task);

                if (taskId > 0)
                {
                    _logger.LogInformation($"Task '{task.Title}' assigned successfully by Admin {adminId} to user {taskModel.AssignedTo}.");
                    return Ok(new { task });
                }
                else
                {
                    _logger.LogError("Failed to assign task — database returned invalid taskId.");
                    return StatusCode(500, "Internal server error");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in AssignTask: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public IActionResult deleteUser(int userId)
        {
            try
            {
                int adminId = GetUserIdFromClaims();
                //_logger.LogInformation($"Admin {adminId} attempting to delete user with ID {userId}");

                if (adminId == -99)
                {
                    _logger.LogWarning("Invalid admin user claims while deleting user.");
                    return Unauthorized("Invalid user claims");
                }

                int result = _repository.deleteUser(userId);

                if (result == 1)
                {
                    _logger.LogInformation($"User with ID {userId} deleted successfully by Admin {adminId}.");
                    return Ok(new { UserId = "User deleted successfully with ID: " + userId });
                }
                else if (result == 0)
                {
                    _logger.LogWarning($"User with ID {userId} not found or could not be deleted.");
                    return NotFound("User not found or could not be deleted");
                }
                else
                {
                    _logger.LogError($"Unexpected deleteUser DB result ({result}) for userID {userId}.");
                    return StatusCode(500, "LogError deleting user");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in deleteUser: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateUserRole(int userId, string newRole)
        {
            try
            {
                int adminId = GetUserIdFromClaims();
                //_logger.LogInformation($"Admin {adminId} attempting to update role of User {userId} to {newRole}");

                if (adminId == -99)
                {
                    _logger.LogWarning("Invalid admin user claims while updating user role.");
                    return Unauthorized("Invalid user claims");
                }

                int result = _repository.UpdateUserRole(userId, newRole);

                if (result == 1)
                {
                    _logger.LogInformation($"Role of User {userId} updated successfully to '{newRole}' by Admin {adminId}.");
                    return Ok(new { UserId = userId, NewRole = newRole });
                }
                else
                {
                    _logger.LogWarning($"User {userId} not found or role not updated.");
                    return NotFound("User not found or role not updated");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in UpdateUserRole: " + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetSystemLogs()
        {
            try
            {
                //_logger.LogInformation("Admin requested system logs.");
                var logs = _repository.GetLogs();
                if (logs != null)
                {
                    return Ok(logs);
                }
                else
                {
                    return NotFound("No log entries found");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteUserTask(int taskId)
        {
            try
            {
                int adminId = GetUserIdFromClaims();
                //_logger.LogInformation($"Admin {adminId} attempting to delete task with ID {taskId}");
                if (adminId == -99)
                {
                    _logger.LogWarning("Invalid admin user claims while deleting task.");
                    return Unauthorized("Invalid user claims");
                }
                int result = _repository.DeleteTask(taskId);
                if (result == 1)
                {
                    _logger.LogInformation($"Task with ID {taskId} deleted successfully by Admin {adminId}.");
                    return Ok(new { TaskId = "Task deleted successfully with ID: " + taskId });
                }
                else if (result == 0)
                {
                    _logger.LogWarning($"Task with ID {taskId} not found or could not be deleted.");
                    return NotFound("Task not found or could not be deleted");
                }
                else
                {
                    _logger.LogError($"Unexpected DeleteTask DB result ({result}) for taskID {taskId}.");
                    return StatusCode(500, "LogError deleting task");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("LogError in DeleteUserTask: " + ex.Message);
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
                _logger.LogWarning("Failed to extract UserId from claims: " + ex.Message);
                return -99;
            }
        }
    }
}
