using ErasmusWithUs.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ErasmusWithUs.Api.Data;

public sealed class ErasmusDbContext(DbContextOptions<ErasmusDbContext> options) : DbContext(options)
{
    public DbSet<ErasmusOpportunityEntity> Opportunities => Set<ErasmusOpportunityEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<StudentPlanEntity> StudentPlans => Set<StudentPlanEntity>();
    public DbSet<ConversationEntity> Conversations => Set<ConversationEntity>();
    public DbSet<MessageEntity> Messages => Set<MessageEntity>();
    public DbSet<DeadlineReminderEntity> DeadlineReminders => Set<DeadlineReminderEntity>();
    public DbSet<CommunityBlockEntity> CommunityBlocks => Set<CommunityBlockEntity>();
    public DbSet<CommunityReportEntity> CommunityReports => Set<CommunityReportEntity>();
    public DbSet<ConversationReadStateEntity> ConversationReadStates => Set<ConversationReadStateEntity>();
    public DbSet<StudentExperienceEntity> StudentExperiences => Set<StudentExperienceEntity>();
    public DbSet<CatalogCorrectionEntity> CatalogCorrections => Set<CatalogCorrectionEntity>();
    public DbSet<OpportunityQuestionEntity> OpportunityQuestions => Set<OpportunityQuestionEntity>();
    public DbSet<OpportunityAnswerEntity> OpportunityAnswers => Set<OpportunityAnswerEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<StudentPlanEntity>()
            .HasIndex(item => new { item.UserId, item.OpportunityId, item.Intake })
            .IsUnique();
        modelBuilder.Entity<StudentPlanEntity>()
            .HasIndex(item => new { item.OpportunityId, item.Intake });
        modelBuilder.Entity<ConversationEntity>()
            .HasIndex(item => new { item.UserAId, item.UserBId, item.OpportunityId, item.Intake })
            .IsUnique();
        modelBuilder.Entity<MessageEntity>()
            .HasIndex(item => new { item.ConversationId, item.Id });
        modelBuilder.Entity<DeadlineReminderEntity>()
            .HasIndex(item => new { item.UserId, item.OpportunityId })
            .IsUnique();
        modelBuilder.Entity<CommunityBlockEntity>()
            .HasIndex(item => new { item.UserId, item.BlockedUserId })
            .IsUnique();
        modelBuilder.Entity<ConversationReadStateEntity>()
            .HasIndex(item => new { item.ConversationId, item.UserId })
            .IsUnique();
        modelBuilder.Entity<StudentExperienceEntity>()
            .HasIndex(item => new { item.UserId, item.OpportunityId })
            .IsUnique();
        modelBuilder.Entity<OpportunityAnswerEntity>()
            .HasIndex(item => new { item.QuestionId, item.UserId })
            .IsUnique();
        modelBuilder.Entity<OpportunityQuestionEntity>()
            .HasIndex(item => new { item.OpportunityId, item.CreatedAt });
        modelBuilder.Entity<CatalogCorrectionEntity>()
            .HasIndex(item => new { item.Status, item.CreatedAt });
    }
}
