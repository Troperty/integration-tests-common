const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import { commonHeaderPattern } from "../fixtures/common-header-pattern.js"

// Convenience method for HTTP GET
export function getAndMatch(url, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

// Convenience method for HTTP GET
export function getAndMatchArray(url, bodyPattern, subpath = null, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, bodyPattern, headerPattern, subpath)
}

// Convenience method for HTTP POST
export function postAndMatch(url, postBody, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

// Convenience method for HTTP POST
export function postAndMatchArray(url, postBody, bodyPattern, subpath = null, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatchArray(request, bodyPattern, headerPattern, subpath)
}

// TODO... Add convenience methods for HTTP PUT, DELETE etc

// Calls over the network using the given request and compares the response (and relevant headers) to the expected pattern
// If subpath is used then the response's body is (deep) navigated down to the given subpath.
// Example: getAndMatch(`${e.actualHost}/school/123`, addressPattern, "address")
// ...will expect that the object under the school body's address key should match the given address pattern
export function callAndMatch(request, bodyPattern, headerPattern = commonHeaderPattern, subpath = null) {
    cy.request(request).then(actualResponse => {
        expect(actualResponse.headers).to.matchPattern(headerPattern)
        if (subpath != null) {
            expect(_.get(actualResponse.body, subpath)).to.matchPattern(bodyPattern)
        } else {
            expect(actualResponse.body).to.matchPattern(bodyPattern)
        }
    })
}

// Calls over the network using the given request and compares the response (and relevant headers) to the expected pattern
// If subpath is used then the response's body is (deep) navigated down to the given subpath.
// Example: getAndMatchArray(`${e.actualHost}/schools`, schoolPattern, "_embedded.schoolResources")
// ...will expect that the array under the body's _embedded.schoolResources key should match the given school pattern
export function callAndMatchArray(request, bodyPattern, headerPattern = commonHeaderPattern, subpath = null) {
    cy.request(request).then(actualResponse => {
        expect(actualResponse.headers).to.matchPattern(headerPattern)
        if (subpath != null) {
            _.get(actualResponse.body, subpath).every(e => expect(e).to.matchPattern(bodyPattern))
        } else {
            actualResponse.body.every(e => expect(e).to.matchPattern(bodyPattern))
        }
    })
}


