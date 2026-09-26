namespace Backend.src.Api.DTOs.Admin;

public record DashboardStatsDTO(
    int TotalUsers,
    int TotalArtists,
    int TotalTracks,
    long TotalRevenue,
    double RevenueGrowth,
    double UserGrowth,
    List<RevenueChartItemDTO> MonthlyRevenue
);

public record RevenueChartItemDTO(string Month, long Amount);

public record UpdateUserRoleRequestDTO(
    string Role,
    bool IsVerified
);
