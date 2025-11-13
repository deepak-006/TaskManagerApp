namespace TaskManagerWebServices.Models
{
    public class TaskModel
    {
        public int TaskId { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        public string Status { get; set; }

        public string Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public int? AssignedTo { get; set; }
    }
}