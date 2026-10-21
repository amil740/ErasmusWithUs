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
    }
}
