namespace ErasmusWithUs.Api.Models;

public sealed class OpportunityAnswerEntity
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public int UserId { get; set; }
    public required string Content { get; set; }
    public required string ExperienceType { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
