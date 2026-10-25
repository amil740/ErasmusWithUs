namespace ErasmusWithUs.Api.Models;

public sealed class CatalogCorrectionEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OpportunityId { get; set; }
    public required string FieldsJson { get; set; }
    public string? SourceUrl { get; set; }
    public required string Note { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ReviewerNote { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ReviewedAt { get; set; }
}
