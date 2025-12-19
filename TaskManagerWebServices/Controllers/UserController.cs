using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Security.Claims;
using TaskManagerDAL;
using TaskManagerDAL.Models;
using TaskManagerWebServices.Models;
using TaskManagerWebServices.Utilities;

namespace TaskManagerWebServices.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly TaskManagerRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AdminActivitiesController> _logger;
        public UserController(TaskManagerRepository repo, IHttpContextAccessor httpContextAccessor, ITokenService token, ILogger<AdminActivitiesController> logger)
        {
            _repository = repo;
            _httpContextAccessor = httpContextAccessor;
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

        [Authorize]
        [HttpGet]
        public IActionResult GetCurrentUser()
        {
            int userId = GetUserIdFromClaims();
            try
            {
                var user = _repository.GetUser(userId);
                UserModel userModel = new UserModel();
                if (user != null)
                {
                    userModel.FirstName = user.FirstName;
                    userModel.LastName = user.LastName;
                    userModel.Email = user.Email;
                    userModel.Role = user.Role;
                    userModel.DateOfBirth = user.DateOfBirth;
                }
                return Ok(userModel);

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize]
        [HttpPatch]
        public IActionResult UpdateProfile(UserModel userModel)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    User user = new User();
                    user.UserId = GetUserIdFromClaims();
                    user.FirstName = userModel.FirstName;
                    user.LastName = userModel.LastName;
                    user.DateOfBirth= userModel.DateOfBirth;
                    int val = _repository.UpdateProfile(user);
                    if (val == 1)
                    {
                        return Ok();
                    }
                    else
                    {
                        return NotFound();
                    }
                }
                else
                {
                    return BadRequest();
                }
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
