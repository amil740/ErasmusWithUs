namespace ErasmusWithUs.Api.Models;

public sealed class StudentExperienceEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OpportunityId { get; set; }
    public int Rating { get; set; }
    public required string ExperienceType { get; set; }
    public required string Intake { get; set; }
    public required string Content { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
