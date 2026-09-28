# Music Streaming Platform

*Read this in [Vietnamese](README.vi.md)*

A full-stack music streaming platform built with ASP.NET Core, React, and Go.

## Architecture

This project is divided into three main components:
- **[Backend](./backend/README.md)**: ASP.NET Core Web API providing RESTful endpoints, real-time Chat via SignalR, PostgreSQL for data, and MinIO for object storage.
- **[Frontend](./frontend/README.md)**: React 19 Single Page Application bundled with Vite, using Redux for state management.
- **[Mock Data Generator](./mock/README.md)**: A robust Go-based tool for generating realistic user, artist, and track data.

## Prerequisites

- .NET 10.0 SDK
- Node.js (v18+)
- Go (1.20+)
- PostgreSQL
- MinIO (Local or Docker)

## Getting Started

1. **Backend**: Navigate to `backend/` and follow the [Backend README](./backend/README.md) for database migrations and starting the server.
2. **Frontend**: Navigate to `frontend/` and follow the [Frontend README](./frontend/README.md) to install dependencies and start the Vite dev server.
3. **Mock Data**: Use the [Mock tool](./mock/README.md) to seed your database with initial data for testing.
