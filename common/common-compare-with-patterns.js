const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import { commonHeaderPattern } from "../fixtures/common-header-pattern.js"

export function getAndMatchWithOptions(url, pattern,
    { // Optional parameters passed in an (unnamed) destructured last parameter
        headerPattern = commonHeaderPattern,
        auth = { bearer: Cypress.env('token1') },
        failOnStatusCode = true
    } = {}) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, pattern, headerPattern)
}

export function getAndMatchArrayWithOptions(url, elementPattern,
    { // Optional parameters passed in an (unnamed) destructured last parameter
        subpath = null, 
        headerPattern = commonHeaderPattern, 
        auth = { bearer: Cypress.env('token1') }, 
        failOnStatusCode = true,
        allowEmpty = false
    } = {}) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, elementPattern, headerPattern, subpath, allowEmpty)
}

 export function postAndMatchWithOptions(url, postBody, pattern, 
    { // Optional parameters passed in an (unnamed) destructured last parameter
        headerPattern = commonHeaderPattern,
        auth = { bearer: Cypress.env('token1') },
        failOnStatusCode = true
    } = {}) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, pattern, headerPattern)
}

 export function postAndMatchArrayWithOptions(url, postBody, elementPattern,
    { // Optional parameters passed in an (unnamed) destructured last parameter
        subpath = null, 
        headerPattern = commonHeaderPattern, 
        auth = { bearer: Cypress.env('token1') }, 
        failOnStatusCode = true,
        allowEmpty = false
    } = {}) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, elementPattern, headerPattern, subpath, allowEmpty)
}

/**
 * Convenience method for HTTP GET
 * @deprecated Use getAndMatchWithOptions with optional last parameter object instead:
 * getAndMatchWithOptions(url, bodyPattern, {failOnStatusCode = false})
 */
export function getAndMatch(url, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

/**
 * Convenience method for HTTP GET
 * @deprecated Use getAndMatchArrayWithOptions with optional last parameter object instead:
 * getAndMatchArrayWithOptions(url, bodyPattern, {subpath = "a.b.c", failOnStatusCode = false})
 */export function getAndMatchArray(url, bodyPattern, subpath = null, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, bodyPattern, headerPattern, subpath)
}

/**
 * Convenience method for HTTP POST
 * @deprecated Use postAndMatchWithOptions with optional last parameter object instead:
 * postAndMatchWithOptions(url, postBody, bodyPattern, {failOnStatusCode = false})
 */
 export function postAndMatch(url, postBody, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

/**
 * Convenience method for HTTP POST
 * @deprecated Use postAndMatchArrayWithOptions with optional last parameter object instead:
 * postAndMatchArrayWithOptions(url, postBody, bodyPattern, {subpath = "a.b.c", failOnStatusCode = false})
 */
 export function postAndMatchArray(url, postBody, bodyPattern, subpath = null, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, bodyPattern, headerPattern, subpath)
}

// TODO... Add convenience methods for HTTP PUT, DELETE etc

// Calls over the network using the given request and compares the response (and relevant headers) to the expected pattern
// If subpath is used then the response's body is (deep) navigated down to the given subpath.
// Example: getAndMatch(`${e.actualHost}/school/123`, addressPattern, "address")
// ...will expect that the object under the school body's address key should match the given address pattern
export function callAndMatch(request, pattern, headerPattern = commonHeaderPattern, subpath = null) {
    cy.request(request).then(actualResponse => {
        expect(actualResponse.headers).to.matchPattern(headerPattern)
        getOrRoot(actualResponse.body, subpath).every(e => expect(e).to.matchPattern(pattern))
    })
}

// Calls over the network using the given request and compares the response (and relevant headers) to the expected pattern
// If subpath is used then the response's body is (deep) navigated down to the given subpath.
// Example: getAndMatchArray(`${e.actualHost}/schools`, schoolPattern, "_embedded.schoolResources")
// ...will expect that the array under the body's _embedded.schoolResources key should match the given school pattern
export function callAndMatchArray(request, elementPattern, headerPattern = commonHeaderPattern, subpath = null, allowEmpty = true) {
    cy.request(request).then(actualResponse => {
        expect(actualResponse.headers).to.matchPattern(headerPattern)

        const jsonArray = getOrRoot(actualResponse.body, subpath)
        if (!allowEmpty) expect(jsonArray).to.not.be.empty
        jsonArray.every(e => expect(e).to.matchPattern(elementPattern))
    })
}

function getOrRoot(o, subpath) {
    return subpath != null ? _.get(o, subpath) : o
}


