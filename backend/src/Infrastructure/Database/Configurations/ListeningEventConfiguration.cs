using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class ListeningEventConfiguration : IEntityTypeConfiguration<ListeningEvent>
{
    public void Configure(EntityTypeBuilder<ListeningEvent> builder)
    {
        builder.ToTable("listening_events");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ListenDuration).HasColumnName("listen_duration");
        builder.Property(x => x.ListenedAt).HasColumnName("listened_at");
    }
}

