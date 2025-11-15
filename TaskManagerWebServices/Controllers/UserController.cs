using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManagerDAL;
using TaskManagerDAL.Models;
using TaskManagerWebServices.Models;
using TaskManagerWebServices.Utilities;
using Serilog;

namespace TaskManagerWebServices.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly TaskManagerRepository _repository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AdminActivitiesController> _logger;
        public UserController(TaskManagerRepository repo, ITokenService token, ILogger<AdminActivitiesController> logger)
        {
            _repository = repo;
            _tokenService = token;
            _logger = logger;
        }

        [HttpPost]
        public IActionResult Login(LoginModel loginModel)
        {
            try
            {
                User user = _repository.Login(loginModel.email);
                if (user != null && user.IsDeleted != true && PasswordHasher.Verify(loginModel.password, user.PasswordHash))
                {
                    var token = _tokenService.CreateToken(user);
                    _logger.LogInformation($"User logged in successfully with emailId: {user.Email}.");
                    return Ok(new { token, role = user.Role, name = user.FirstName + " " +user.LastName });
                }
                else
                {
                    _logger.LogWarning($"User not found for {loginModel.email}.");
                    return NotFound("Invalid email or password");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Error occured while logging in" + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }


        [HttpPost]
        public IActionResult Signup(UserModel userModel)
        {
            try
            {
                User user = new User
                {
                    FirstName = userModel.FirstName,
                    LastName = userModel.LastName,
                    DateOfBirth = userModel.DateOfBirth,
                    Email = userModel.Email,
                    PasswordHash = PasswordHasher.Hash(userModel.Password),
                    Role = userModel.Role,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsDeleted = false
                };
                int userId = _repository.Signup(user);
                if (userId > 0)
                {
                    _logger.LogInformation($"User User successfully created with emailId: {userModel.Email}.");
                    return Ok(new { message = "User successfully created", userId = userId });
                }
                else
                {
                    _logger.LogWarning($"User could not be created for: {userModel}.");
                    return BadRequest("User could not be created");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Error occured while creating account" + ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
