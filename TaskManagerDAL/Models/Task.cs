using System;
using System.Collections.Generic;

namespace TaskManagerDAL.Models;

public partial class Task
{
    public int TaskId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string Status { get; set; }

    public string Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public int CreatedBy { get; set; }

    public int? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsDeleted { get; set; }

    public virtual User AssignedToNavigation { get; set; }

    public virtual User CreatedByNavigation { get; set; }
}
