namespace ErasmusWithUs.Api.Models;

public sealed class ConversationEntity
{
    public int Id { get; set; }
    public int UserAId { get; set; }
    public int UserBId { get; set; }
    public int OpportunityId { get; set; }
    public required string Intake { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
