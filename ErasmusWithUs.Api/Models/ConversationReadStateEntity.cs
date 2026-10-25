namespace ErasmusWithUs.Api.Models;

public sealed class ConversationReadStateEntity
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public int UserId { get; set; }
    public int LastReadMessageId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
