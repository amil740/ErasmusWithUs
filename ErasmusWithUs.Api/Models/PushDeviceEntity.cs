namespace ErasmusWithUs.Api.Models;

public sealed class PushDeviceEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string ExpoPushToken { get; set; }
    public string Platform { get; set; } = "unknown";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
