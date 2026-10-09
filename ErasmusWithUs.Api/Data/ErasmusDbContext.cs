using ErasmusWithUs.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ErasmusWithUs.Api.Data;

public sealed class ErasmusDbContext(DbContextOptions<ErasmusDbContext> options) : DbContext(options)
{
    public DbSet<ErasmusOpportunityEntity> Opportunities => Set<ErasmusOpportunityEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
}
