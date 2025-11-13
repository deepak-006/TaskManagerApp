using System;
using System.Collections.Generic;

namespace TaskManagerDAL.Models;

public partial class User
{
    public int UserId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public string Role { get; set; }

    public DateTime? LastLogin { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Task> TaskAssignedToNavigations { get; set; } = new List<Task>();

    public virtual ICollection<Task> TaskCreatedByNavigations { get; set; } = new List<Task>();
}
