# PUBLIC REPO!!!
# integration-tests-common

Holds commonly used test functions for comparing JSON canonically etc.

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

Use in your test specification:
```
import { getAndCompareCanonical, compareHeadersCanonical } from "integration-tests-common"

describe('Trot', () => {
    it('Tracks: Get All Tracks', () => {
        getAndCompareCanonical(e.actualHost + '/trot/tracks', 'trot/tracks.json')
    }),
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