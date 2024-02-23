## E2E Tests

The provided tests should be run before submitting your challenge.

The tests will check:
 - The checkout flow and a test payment.
 - The API flow of scheduling lessons.
 - The API flow of charging for an scheduled lessons.
 - The API flow of refunding a charged lessons.

# How to run:

1. Install dependencies
```
  npm install
```

2. Run all e2e tests on cli
```
  node_modules/.bin/cypress run --headless --browser chrome
```

3. Run e2e tests for a single integration spec on cli
```
  node_modules/.bin/cypress run --headless --browser chrome --spec cypress/integration/lessons_courses.js 
```

4. Run all e2e tests on a browser
```
  node_modules/.bin/cypress run --headed --browser chrome
```

5. Run e2e tests for a single integration spec on a browser
```
  node_modules/.bin/cypress run --headed --browser chrome --spec cypress/integration/lessons_courses.js
```

**Notes**: 

If you are not using the react client, change the base url to point to port `4242` as shown below

```
  node_modules/.bin/cypress run --headless --browser chrome --config baseUrl=http://localhost:4242/
```
