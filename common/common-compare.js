// The two responses should contain the exact same headers/responses except for what the respective "replacer" functions specifies
// See the documentation for JSON.stringify for further info on the "replacers", some examples here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// Unfortunately, JSON.stringify does not preserve object property order, so we perform one extra step to compare the canonical JSON.
// See: https://github.com/davidchambers/CANON

import relevantHeaders from '../fixtures/relevant-headers.json'

// Convenience method for HTTP GET
export function getAndCompareCanonical(url, expectedBodyFixtureFileName, failOnStatusCode = true, expectedHeaders = relevantHeaders, auth = { bearer: Cypress.env('token1') }) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndCompareCanonical(request, expectedBodyFixtureFileName, expectedHeaders)
}

// Convenience method for HTTP POST
export function postAndCompareCanonical(url, postBody, expectedBodyFixtureFileName, failOnStatusCode = true, expectedHeaders = relevantHeaders, auth = { bearer: Cypress.env('token1') }) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndCompareCanonical(request, expectedBodyFixtureFileName, expectedHeaders)
}

// TODO... Add convenience methods for HTTP PUT, DELETE etc

// Calls over the network using the given request and compares the response (and relevant headers) to the expected JSON found in the given test fixture
export function callAndCompareCanonical(request, expectedBodyFixtureFileName, expectedHeaders = relevantHeaders) {
    cy.fixture(expectedBodyFixtureFileName).then(expectedBody => {
        cy.request(request).then(actualResponse => {
            compareCanonical(actualResponse, { headers: expectedHeaders, body: expectedBody })
        })
    })
}


//response1 = API response  response2 = test data
export function compareCanonical(response1, response2,
    headerReplacer = ignoreKeysAndCookies(['date', 'content-length', 'transfer-encoding', 'content-type', 'content-encoding'], ['correlationId']),
    responseReplacer = replaceHrefWithPathOnly()
) {
    compareHeadersCanonical(response1.headers, response2.headers, headerReplacer)
    compareBodiesCanonical(response1.body, response2.body, responseReplacer)
}

export function compareHeadersCanonical(headers1, headers2,
    headerReplacer = ignoreKeysAndCookies(['date', 'content-length', 'transfer-encoding', 'content-type', 'content-encoding'], ['correlationId'])) {
    const headers1String = JSON.stringify(headers1, headerReplacer)
    const headers2String = JSON.stringify(headers2, headerReplacer)

    const canonicalHeaders1 = canonicalize(headers1String)
    const canonicalHeaders2 = canonicalize(headers2String)

    expect(canonicalHeaders1).to.deep.equal(canonicalHeaders2)
}

export function compareBodiesCanonical(body1, body2, responseReplacer = replaceHrefWithPathOnly()) {
    const body1String = JSON.stringify(body1, responseReplacer)
    const body2String = JSON.stringify(body2, responseReplacer)

    const canonicalBody1 = canonicalize(body1String)
    const canonicalBody2 = canonicalize(body2String)

    expect(canonicalBody1).to.deep.equal(canonicalBody2)
}

function canonicalize(o) {
    return JSON.stringify(copyObjectWithSortedKeys(JSON.parse(o)))
}

// Ignore any json keys in the ignoreKeys list when comparing headers JSON
// AND
// ignore any cookies in the ignoreCookies list when comparing headers JSON
export function ignoreKeysAndCookies(keysToIgnore, cookiesToIgnore) {

    function keepCookie(c) {
        for (let cookieName of cookiesToIgnore) {
            if (c.startsWith(cookieName + '=')) {
                return false
            }
        }

        return true
    }

    return (key, value) => {
        if (key === 'set-cookie') {
            // Cookies are in an array of length 1 in the header with key 'set-cookie'
            let cookiesToKeep = value[0].split(';')
            cookiesToKeep = cookiesToKeep.filter(keepCookie)
            return [cookiesToKeep.join(';').trim()]
        } else {
            return keysToIgnore.includes(key) ? undefined : value;
        }
    }
}

// Ignore any json keys in the ignoreKeys list when comparing JSON
export function ignoreKeys(keysToIgnore) {
    return (key, value) => keysToIgnore.includes(key) ? undefined : value;
}

// Since the href will have differing protocol, host, port etc (depending on where the service is deployed),
// we only compare the last part of the href links
export function replaceHrefWithPathOnly() {
    return (key, value) => key === 'href' ? new URL(value).pathname : value
}

// Used as a naïve implementation of a canonical JSON representation so that the order of object properties does not fail the comparison
export function copyObjectWithSortedKeys(object) {
    if (isObject(object)) {
        const newObj = {};
        const keysSorted = Object.keys(object).sort();
        let key;
        for (let i = 0, len = keysSorted.length; i < len; i++) {
            key = keysSorted[i]
            newObj[key] = copyObjectWithSortedKeys(object[key])
        }
        return newObj
    } else if (Array.isArray(object)) {
        return object.map(copyObjectWithSortedKeys)
    } else {
        return object
    }
}

function isObject(a) {
    return Object.prototype.toString.call(a) === '[object Object]'
}
