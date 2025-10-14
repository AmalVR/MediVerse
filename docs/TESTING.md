# Testing Guide

This document outlines the testing strategy and setup for the MediVerse project.

## E2E Testing with Playwright

We use Playwright for end-to-end testing across different browsers and devices.

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Running Tests

- Run all tests:

  ```bash
  npm test
  ```

- Run with UI mode:

  ```bash
  npm run test:ui
  ```

- Run in headed mode:

  ```bash
  npm run test:headed
  ```

- Debug tests:

  ```bash
  npm run test:debug
  ```

- Run specific test files:

  ```bash
  npm run test:e2e        # All E2E tests
  npm run test:mobile     # Mobile-specific tests
  ```

- View test report:
  ```bash
  npm run test:report
  ```

### Test Structure

- `tests/e2e/teacher.spec.ts`: Teacher dashboard functionality

  - Session creation
  - Unity viewer loading
  - Controls panel
  - Fullscreen mode
  - Session management

- `tests/e2e/student.spec.ts`: Student view functionality

  - Session joining
  - State synchronization
  - Session end handling

- `tests/e2e/mobile.spec.ts`: Mobile-specific features
  - Mobile UI controls
  - Touch interactions
  - Responsive design
  - Mobile Unity build

### Test Coverage

The E2E tests cover:

1. Core user flows
2. Device compatibility
3. Real-time features
4. Error handling
5. Mobile optimization

### Best Practices

1. **Test Organization**

   - Group related tests using `test.describe`
   - Use clear, descriptive test names
   - Keep tests focused and atomic

2. **Assertions**

   - Use explicit assertions with timeouts
   - Check both positive and negative cases
   - Verify visual and functional aspects

3. **Device Testing**

   - Test across different viewport sizes
   - Verify touch interactions
   - Check device-specific features

4. **Performance**

   - Set appropriate timeouts for Unity loading
   - Test network synchronization
   - Verify smooth animations

5. **Error Handling**
   - Test error states
   - Verify error messages
   - Check recovery flows

### CI/CD Integration

Tests run automatically:

- On pull requests
- Before deployment
- Nightly for regression testing

### Debugging Tips

1. Use `test:debug` for step-by-step debugging
2. Check test videos for failures
3. Use trace viewer for detailed analysis
4. Enable headed mode for visual debugging

### Known Limitations

1. Fullscreen API testing limitations in headless mode
2. WebGL context variations across browsers
3. Unity loading time variations

### Future Improvements

1. Add visual regression testing
2. Implement API mocking
3. Add performance benchmarks
4. Expand device coverage
