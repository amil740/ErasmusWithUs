namespace ErasmusWithUs.Api.Models;

public sealed class CommunityBlockEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BlockedUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
