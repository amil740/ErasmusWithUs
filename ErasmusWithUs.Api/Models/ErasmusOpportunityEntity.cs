using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace ErasmusWithUs.Api.Models;

public sealed class ErasmusOpportunityEntity
{
    public int Id { get; set; }
    public required string University { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }
    public string StudyFieldsJson { get; set; } = "[]";
    public string LevelsJson { get; set; } = "[]";
    public string LanguagesJson { get; set; } = "[]";
    public double MinimumGpa { get; set; }
    public required string Deadline { get; set; }
    public int MonthlyGrant { get; set; }
    public required string SourceUrl { get; set; }
    public required string LastVerifiedAt { get; set; }
    public required string VerificationStatus { get; set; }

    [NotMapped]
    public string[] StudyFields
    {
        get => JsonSerializer.Deserialize<string[]>(StudyFieldsJson) ?? [];
        set => StudyFieldsJson = JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public string[] Levels
    {
        get => JsonSerializer.Deserialize<string[]>(LevelsJson) ?? [];
        set => LevelsJson = JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public string[] Languages
    {
        get => JsonSerializer.Deserialize<string[]>(LanguagesJson) ?? [];
        set => LanguagesJson = JsonSerializer.Serialize(value);
    }
}
