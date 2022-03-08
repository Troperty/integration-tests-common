const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import relevantHeaders from '../../fixtures/relevant-headers.json'

import { commonHeaderPattern } from "../../fixtures/common-header-pattern.js"

import allHeaders from '../fixtures/all-headers.json'
import strippedHeaders from '../fixtures/stripped-headers.json'
import { ignoreKeysAndCookies } from "../../common/common-compare"
import { getAndCompareCanonical } from "../../common/common-compare"

let e
before(() => {
    e = Cypress.env()
})

describe('Examples for writing tests using common helper functions', () => {

     it('Helper function for ignoring keys and cookies in array should work', () => {
        const actual = JSON.stringify(allHeaders, ignoreKeysAndCookies(['date', 'content-length', 'content-type', 'content-encoding', 'transfer-encoding'], ['correlationId']))
        const expected = JSON.stringify(strippedHeaders)
        // Compare JSON as strings and ignoring the complication that json keys sometimes appear in
        // different order (we do use the canonical JSON technique in the actual enpoint tests)
        expect(actual, 'Keys or cookies differ!!!').to.equal(expected)
    })

    it('Verify headers using pattern', () => {
        cy.fixture('all-headers.json').then(allHeaders => {
            expect(allHeaders).to.matchPattern(commonHeaderPattern)
        })
    })

    it.only('Tracks: Get All Tracks using compare canonical', () => {
        // Note that the first two parameters are usually enough as the default parameters are
        // set to match the more common scenario where we call with auth (and not null as we do here) 
        getAndCompareCanonical('https://qa.api.danskhv.dk/webapi/trot/tracks', 'tracks.json', false, relevantHeaders, null)
    })

    it.only('Reads env varables', () => {
        console.log("Env variable compareHeaders: " + e.compareHeaders)
    })

})
