using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

namespace Backend.src.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.Username).HasColumnName("username");
            builder.Property(x => x.Email).HasColumnName("email");
            builder.Property(x => x.Password).HasColumnName("password");

            builder.Property(x => x.Role).HasColumnName("role");
            builder.Property(x => x.Provider).HasColumnName("provider");

            builder.Property(x => x.Token).HasColumnName("token");
            builder.Property(x => x.IsVerified).HasColumnName("is_verified");
            builder.Property(x => x.IsPremium).HasColumnName("is_premium");

            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

            builder.HasIndex(x => x.Email).IsUnique();
        }
    }
}

