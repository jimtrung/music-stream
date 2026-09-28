# Backend - Music Streaming

*Read this in [Vietnamese](README.vi.md)*

This is the backend service for the Music Streaming platform, built with ASP.NET Core 10.0.

## Features

- **RESTful API**: Manage users, artists, tracks, and playlists.
- **Real-time Chat**: Powered by SignalR for real-time messaging.
- **Storage**: MinIO integration for storing audio files and images.
- **Database**: PostgreSQL with Entity Framework Core (EF Core).
- **Authentication**: JWT Bearer Auth and Google OAuth integration.

## Tech Stack

- **Framework**: .NET 10.0 ASP.NET Core Web API
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Object Storage**: MinIO
- **Real-time**: SignalR
- **Testing**: xUnit / custom test-runner

## Setup Instructions

1. Ensure PostgreSQL and MinIO are running.
2. Update the connection strings and MinIO credentials in `appsettings.json`.
3. Restore packages:
   ```bash
   make restore
   ```
4. Run migrations:
   ```bash
   dotnet ef database update
   ```
5. Run the application:
   ```bash
   make run
   ```

## Testing

Run tests using the included Makefile:
- `make test` (Formatted output)
- `make test-api` (Integration tests)
- `make test-unit` (Unit tests)
