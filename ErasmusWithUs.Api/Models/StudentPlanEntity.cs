namespace ErasmusWithUs.Api.Models;

public sealed class StudentPlanEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OpportunityId { get; set; }
    public required string Intake { get; set; }
    public string Stage { get; set; } = "Considering";
    public string ChecklistJson { get; set; } = "[]";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
