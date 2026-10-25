namespace ErasmusWithUs.Api.Models;

public sealed class CommunityReportEntity
{
    public int Id { get; set; }
    public int ReporterUserId { get; set; }
    public int ReportedUserId { get; set; }
    public int? ConversationId { get; set; }
    public required string Reason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
