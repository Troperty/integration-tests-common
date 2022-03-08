# PUBLIC REPO!!!
# integration-tests-common

Holds commonly used test functions for comparing JSON canonically etc. Check the tests under /cypress/integration/XYZ.spec.js for some example code on how to use the common helper functions.

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
````
...in order to pull the latest version. We could create tags later on if we really want, but for now latest and greatest if enough.
