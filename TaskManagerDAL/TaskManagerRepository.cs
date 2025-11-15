using TaskManagerDAL.Models;

namespace TaskManagerDAL
{
    public class TaskManagerRepository
    {
        public TaskManagerDbContext Context { get; set; }
        public TaskManagerRepository()
        {
            Context = new TaskManagerDbContext();
        }



        public User Login(string email)
        {
            try
            {
                var user = Context.Users.FirstOrDefault(u => u.Email == email);
                if (user != null)
                {
                    return user;
                }
                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }


        public int Signup(User user)
        {
            int userId = 0;
            try
            {
                Context.Users.Add(user);
                Context.SaveChanges();
                userId = user.UserId;
            }
            catch (Exception)
            {
                userId = -1;
            }
            return userId;
        }

        public Models.Task GetTaskById(int taskId)
        {
            Models.Task task = null;
            try
            {
                task = (from t in Context.Tasks
                        where t.TaskId == taskId && !t.IsDeleted
                        select t).FirstOrDefault();
            }
            catch (Exception)
            {
                task = null;
            }
            return task;
        }

        public List<Models.Task> GetTasks(int userId)
        {
            List<Models.Task> tasks = new List<Models.Task>();
            try
            {
                tasks = (from t in Context.Tasks
                         where t.AssignedTo == userId && !t.IsDeleted
                         select t).ToList();
            }
            catch (Exception)
            {
                tasks = null;
            }
            return tasks;
        }

        public int AddTask(Models.Task task)
        {
            int taskId = 0;
            try
            {
                Context.Tasks.Add(task);
                Context.SaveChanges();
                taskId = task.TaskId;
            }
            catch (Exception)
            {
                taskId = -1;
            }
            return taskId;
        }

        public int DeleteTask(int taskId, int userId)
        {
            int result = 0;
            try
            {
                var task = (from tasks in Context.Tasks
                            where tasks.TaskId == taskId && tasks.AssignedTo == userId && !tasks.IsDeleted
                            select tasks).FirstOrDefault();

                if (task != null)
                {
                    task.IsDeleted = true;
                    Context.SaveChanges();
                    result = 1;
                }
            }
            catch (Exception)
            {
                result = -1;
            }
            return result;
        }

        public int UpdateTask(Models.Task updatedTask, int userId)
        {
            int result = 0;
            try
            {
                var task = (from tasks in Context.Tasks
                            where tasks.TaskId == updatedTask.TaskId && tasks.AssignedTo == userId && !tasks.IsDeleted
                            select tasks).FirstOrDefault();
                if (task != null)
                {
                    task.Title = updatedTask.Title;
                    task.Description = updatedTask.Description;
                    task.Status = updatedTask.Status;
                    task.Priority = updatedTask.Priority;
                    task.DueDate = updatedTask.DueDate;
                    task.UpdatedAt = DateTime.Now;
                    Context.SaveChanges();
                    result = 1;
                }
            }
            catch (Exception)
            {
                result = -1;
            }
            return result;
        }


        public List<User> GetAllUsers()
        {
            List<User> users = new List<User>();
            try
            {
                users = (from u in Context.Users
                         where !u.IsDeleted
                         select u).ToList();
            }
            catch (Exception)
            {
                users = null;
            }
            return users;
        }

        public List<Models.Task> GetAllTasks()
        {
            List<Models.Task> tasks = new List<Models.Task>();
            try
            {
                tasks = (from t in Context.Tasks
                         where !t.IsDeleted
                         select t).ToList();
            }
            catch (Exception)
            {
                tasks = null;
            }
            return tasks;
        }

        public int deleteUser(int userId)
        {
            int deleteStatus = 0;
            try
            {
                var user = (from u in Context.Users
                            where u.UserId == userId && !u.IsDeleted
                            select u).FirstOrDefault();
                if (user != null)
                {
                    user.IsDeleted = true;
                    Context.SaveChanges();
                    deleteStatus = 1;
                }
                else
                {
                    deleteStatus = 0;
                }
            }
            catch (Exception)
            {
                deleteStatus = -1;
            }
            return deleteStatus;
        }

        public int UpdateUserRole(int userId, string newRole)
        {
            int result = 0;
            try
            {
                var user = (from u in Context.Users
                            where u.UserId == userId && !u.IsDeleted
                            select u).FirstOrDefault();
                if (user != null)
                {
                    user.Role = newRole;
                    Context.SaveChanges();
                    result = 1;
                }
            }
            catch (Exception)
            {
                result = -1;
            }
            return result;
        }
    }
}
