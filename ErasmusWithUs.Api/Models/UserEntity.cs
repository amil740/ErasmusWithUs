namespace ErasmusWithUs.Api.Models;

public sealed class UserEntity
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public required string PasswordHash { get; set; }
    public bool EmailVerified { get; set; }
    public string? EmailVerificationToken { get; set; }
    public DateTimeOffset? EmailVerificationTokenExpiresAt { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTimeOffset? PasswordResetTokenExpiresAt { get; set; }
    public string? Country { get; set; }
    public string? StudyField { get; set; }
    public string? Level { get; set; }
    public double? Gpa { get; set; }
    public string? HomeUniversity { get; set; }
    public string? Intake { get; set; }
    public string? Bio { get; set; }
    public bool CommunityVisible { get; set; }
    public bool RoommateSearch { get; set; }
    public string? ProfilePhotoDataUrl { get; set; }
    public string PreferredCountriesJson { get; set; } = "[]";
    public string LanguagesJson { get; set; } = "[]";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
