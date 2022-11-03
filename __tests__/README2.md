# Unit and Integration Testing with Jest

This project uses [JestJS](https://jestjs.io/) for automated testing. Tests are run from the repository root in the console. Jest is automatically installed with the rest of the project code when you run `npm install` after cloning the repository. Of the two test scripts, `npm run test-silent` is preferred for succintness.

## Running Tests

Tests are run from the command line, the same place you'd run `npm run dev`. You can run all the tests in the `__tests__` directory, specify a sub-directory only, or run a single test file by itself. All tests must be located in the `__test__` directory.

- All tests: `npm run test-silent`
- All tests in a single subdirectory:
  - Format: `npm run test-silent subdirectoryName/`
  - Example: `npm run test-silent models/`
- A single test file:
  - Format: `npm run test-silent subdirectoryName/fileName.test.js`
  - Example: `npm run test-silent models/pricing.test.js`
  - Without the extension: `npm run test-silent models/pricing`

## Test Interference

When all tests are run together, certain tests may interfere with others and cause failures, particularly in the `controllers/reservationController.test.js` file. Running this test file separately should result in all tests passing.

## Test Scripts

There are two test scripts defined in the `package.json` file: `test` and `test-silent`. Both will run the tests in the same way. `test` will show anything that is logged to the console, either by your code or by Sequelize or another tool. `test-silent` will hide everything and show you only which tests pass or fail. If Sequelize logging is turned on, things can get very noisy, so `test-silent` is nice when you don't expect anything to go wrong. `test` can be substituted in all examples above for `test-silent`.
