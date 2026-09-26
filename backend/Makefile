.PHONY: test test-verbose clean restore build run

# Chạy test với output đẹp (Jest-like)
test:
	@node test-runner.js

# Chỉ chạy API integration tests
test-api:
	@node test-runner.js --filter AuthApiIntegrationTests

# Chỉ chạy unit tests
test-unit:
	@node test-runner.js --filter AuthServiceSignInTests

# Chạy test (raw dotnet output)
test-raw:
	dotnet test MusicStreaming.Tests --verbosity normal

# Chạy test với output chi tiết
test-verbose:
	dotnet test MusicStreaming.Tests --verbosity normal

# Clean build artifacts
clean:
	dotnet clean

# Restore packages
restore:
	dotnet restore

# Build project
build:
	dotnet build

# Chạy server
run:
	dotnet run
