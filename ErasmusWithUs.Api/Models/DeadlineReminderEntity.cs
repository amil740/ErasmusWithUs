namespace ErasmusWithUs.Api.Models;

public sealed class DeadlineReminderEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OpportunityId { get; set; }
    public int DaysBefore { get; set; } = 7;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SentAt { get; set; }
}
