# Test Execution Guide

This guide provides exact commands for running the comprehensive E2E test suite.

## Prerequisites

- Docker installed and running
- Java 21+ 
- Node.js 18+
- PostgreSQL (for local development)

## Backend Integration Tests

### Run All Integration Tests
```bash
./gradlew test --tests "*IntegrationTest"
```

### Run Specific Test Suites
```bash
# Authentication tests
./gradlew test --tests "AuthIntegrationTest"

# Inventory API tests  
./gradlew test --tests "InventoryIntegrationTest"

# Production workflow tests
./gradlew test --tests "ProductionIntegrationTest"
```

### Run with Coverage Report
```bash
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

## Frontend E2E Tests (Playwright)

### Setup E2E Tests
```bash
cd e2e-tests
npm install
npx playwright install
```

### Run E2E Tests (with backend running)

#### Start Backend Server
```bash
# Terminal 1: Start Spring Boot backend
./gradlew bootRun
# Wait for startup at http://localhost:8080
```

#### Start Frontend Server  
```bash
# Terminal 2: Start React frontend
cd frontend
npm start
# Wait for startup at http://localhost:3000
```

#### Execute Playwright Tests
```bash
# Terminal 3: Run E2E tests
cd e2e-tests
npm run test
```

### Alternative: Run Tests with Auto-Start Servers
```bash
cd e2e-tests
npm run test:with-servers
```

### Run Specific E2E Test Suites
```bash
cd e2e-tests

# Authentication tests
npm run test -- tests/01-authentication.spec.ts

# Inventory management tests
npm run test -- tests/02-inventory-management.spec.ts

# Production workflow tests  
npm run test -- tests/03-production-workflow.spec.ts

# Inventory sessions tests
npm run test -- tests/04-inventory-sessions.spec.ts

# Dashboard integration tests
npm run test -- tests/05-dashboard-integration.spec.ts

# Mobile responsive tests
npm run test -- tests/06-mobile-responsive.spec.ts
```

### Debug Mode and Development
```bash
cd e2e-tests

# Run with headed browsers for debugging
npm run test:debug

# Run specific test in debug mode
npm run test:debug -- tests/01-authentication.spec.ts

# Generate test report  
npm run test:report
```

### Mobile Testing
```bash
cd e2e-tests
# Run tests on mobile viewports
npm run test -- --project="Mobile Chrome" --project="Mobile Safari"
```

## Full Test Suite (All Tests)

### Local Development
```bash
# 1. Start backend
./gradlew bootRun &
BACKEND_PID=$!

# 2. Start frontend  
cd frontend && npm start &
FRONTEND_PID=$!

# 3. Wait for services to start
sleep 30

# 4. Run backend integration tests
./gradlew test --tests "*IntegrationTest"

# 5. Run E2E tests
cd e2e-tests && npm run test

# 6. Cleanup
kill $BACKEND_PID $FRONTEND_PID
```

### CI/CD Pipeline
The GitHub Actions workflow automatically runs:
1. Backend integration tests with Testcontainers
2. Frontend E2E tests with full application stack
3. Generates test reports and coverage

```bash
# Trigger CI pipeline
git push origin feature-branch

# View results in GitHub Actions tab
```

## Test Data Management

### Backend Test Data
- Uses Testcontainers PostgreSQL with automatic cleanup
- Seed data loaded from `/src/test/resources/test-data/seed-data.sql`
- Cleanup script runs after each test: `/src/test/resources/test-data/cleanup.sql`

### E2E Test Data
- Frontend tests use API client to create/cleanup test data
- Consistent test users across all tests (defined in `fixtures/test-users.ts`)
- Database reset between test suites for isolation

## Debugging Test Failures

### Backend Test Failures
```bash
# Run with verbose output
./gradlew test --tests "*IntegrationTest" --info

# Check logs
tail -f logs/application.log

# Debug specific test with IDE breakpoints
./gradlew test --tests "InventoryIntegrationTest.adminCanCreateInventoryItem" --debug-jvm
```

### E2E Test Failures  
```bash
cd e2e-tests

# Run with trace collection
npm run test -- --trace on

# Run in headed mode for visual debugging
npm run test:debug

# View test report with screenshots/videos
npm run test:report
```

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 8080 are available
2. **Database connection**: Check PostgreSQL is running and accessible
3. **Testcontainers**: Ensure Docker is running and has sufficient resources
4. **Network timeouts**: Increase wait times in CI environments

## Test Configuration

### Backend Test Profile
Tests run with `test` profile by default:
- Uses H2 in-memory database for fast execution
- Testcontainers PostgreSQL for integration scenarios requiring full DB features
- Test data isolation through cleanup scripts

### E2E Test Configuration
Configure via `/e2e-tests/playwright.config.ts`:
- Base URLs: Frontend (3000), Backend (8080)
- Browser matrix: Chromium, Firefox, WebKit + Mobile variants
- Parallel execution with test isolation
- Automatic retry on failure in CI

## Performance Optimization

### Backend Tests
- Testcontainer reuse enabled for faster runs
- Database cleanup instead of recreation between tests
- Parallel test execution where safe

### E2E Tests  
- Page Object Model for maintainable test code
- Shared authentication state where possible
- Optimized locator strategies for reliable element interaction
- Selective test execution for quick feedback loops

## Continuous Integration

The CI pipeline runs automatically on:
- Push to `master`/`main` branches
- Pull requests
- Manual workflow dispatch

Pipeline includes:
- Backend integration tests with coverage reports
- Frontend E2E tests across multiple browsers
- Test artifacts upload (results, screenshots, videos)
- Parallel execution for faster feedback