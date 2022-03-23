# PUBLIC REPO!!!
# integration-tests-common

Holds commonly used test functions for comparing JSON canonically etc. Check the tests under /cypress/integration/XYZ.spec.js for some example code on how to use the common helper functions. Many more examples (live code) can be found in the actual integration test repos, such as: webapi-sg-integration-tests.

## Usage
Add to your package.json:
```
{
  "name": "webapi-integration-denmark-tests",
  "version": "1.0.0",
  "devDependencies": {
    "cypress": "9.0.0",
    "integration-tests-common": "github:Troperty/integration-tests-common" <==
  }
}
```
...and run
```
npm install
```

Use in your test specification:
```
const { login } = require("../support/common/common-login")
import { getAndMatchArrayWithOptions, getAndMatchWithOptions } from "integration-tests-common/common/common-compare-with-patterns"
import { statisticsPattern } from "../fixtures/sportactors/statisticsPattern"

const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

let e
before(() => {
    e = Cypress.env()
    login(e.actualUserId, e.actualPassword, `${e.actualHost}/authenticate/credentials`, 'token1') // Default token
    login("sjufem9131", "test9999", `${e.actualHost}/authenticate/credentials`, 'token759131') // Custom token
})

describe('Trot', () => {
    
  it('Get all registered race days that driver has registered to ride on', () => {
    getAndMatchArrayWithOptions(`${e.actualHost}/licenseholders/759131/mountings`,
        {
            "id": _.isInteger,
            "name": _.isString,
            "enrolled": _.isBoolean,
            "startBan": _.isBoolean
        },
        {
            allowEmpty: true, // Allowing empty array
            auth: { bearer: Cypress.env('token759131') } // Custom token
        }
    )
  })
    .
    .
    .
```

## Updates
Whenever this project is updated via a git push, run:
```
npm install https://github.com/Troperty/integration-tests-common
```
...in order to pull the latest version. We could create tags later on if we really want, but for now latest and greatest is enough.


# Code Coverage Report
A poor man's code coverage report node script can be found under cypress/support/generate-coco-report.js.
It is not intended to solve the whole problem of code coverage with branching if statements etc as that would require some instrumentation/agent installed on the server. The CoCo report simply takes Swagger endpoints that we intend to cover with tests as a parameter (via a cfg file) and compares those endpoints with what was actually called during the spec runs. In order to generate the spec run request log (to have some truth to compare with) the cypress run must export the request log to disk.
## 1. Export request log to disk
```
DEBUG=cypress:server:socket-base npx cypress run 2> cypress/logs/request.log
```
Explanation:
```
DEBUG=cypress:server:socket-base
```
...will generate verbose logging of outgoing requests to **stderr**.
```
2> cypress/logs/request.log
```
...will send **stderr** to file.

## 2. Generate report from request log
```
node -e 'require(\"./node_modules/integration-tests-common/cypress/support/generate-coco-report.js\").generateCoCoReport()'
```
There might be better ways to call a node script, but this is what we're currently doing... The report generator function accepts two optional parameters (currently only needed for customer-api where we have a non-default Swagger docs url) that can be passed in an options object like so: 
```
node -e 'require(\"./node_modules/integration-tests-common/cypress/support/generate-coco-report.js\").generateCoCoReport({baseUrl: \"https://ci.api.travsport.se/customerapi\", docsUrl: \"https://ci.api.travsport.se/customerapi/internaldocs\"})'
```

