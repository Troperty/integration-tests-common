const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import { commonHeaderPattern } from "../fixtures/common-header-pattern.js"

// Convenience method for HTTP GET
export function getAndMatch(url, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'GET', url: url, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

// Convenience method for HTTP POST
export function postAndMatch(url, postBody, bodyPattern, headerPattern = commonHeaderPattern, auth = { bearer: Cypress.env('token1') }, failOnStatusCode = true) {
    const request = { method: 'POST', url: url, body: postBody, auth: auth, failOnStatusCode: failOnStatusCode }
    callAndMatch(request, bodyPattern, headerPattern)
}

// TODO... Add convenience methods for HTTP PUT, DELETE etc

// Calls over the network using the given request and compares the response (and relevant headers) to the expected JSON found in the given test fixture
export function callAndMatch(request, bodyPattern, headerPattern = commonHeaderPattern) {
    cy.request(request).then(actualResponse => {
        expect(actualResponse.headers).to.matchPattern(headerPattern)
        expect(actualResponse.body).to.matchPattern(bodyPattern)
    })
}


