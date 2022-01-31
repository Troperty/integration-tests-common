const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import { commonHeaderPattern } from "../../fixtures/common-header-pattern.js"
import { getAndMatch } from "../../common/common-compare-with-patterns"

describe('Examples for writing tests using common helper functions', () => {

    it('Verify headers using pattern', () => {
        cy.fixture('all-headers.json').then(allHeaders => {
            expect(allHeaders).to.matchPattern(commonHeaderPattern)
        })
    })

    it('Verify body using explicit hardcoded JSON pattern', () => {
        getAndMatch("https://ci.api.svenskgalopp.se/webapi/tracks?licenseTracks=true",
        [
            {
              "id": "229",
              "code": "BP",
              "name": "Bro Park"
            },
            {
              "id": "1400",
              "code": "GG",
              "name": "Göteborg Galopp"
            },
            {
              "id": "221",
              "code": "JÄ",
              "name": "Jägersro Galopp"
            }
        ],
          commonHeaderPattern,
          null // No auth
        )
    })

    it.only('Verify elements in body JSON array using custom JSON pattern', () => {
        cy.request("https://ci.api.svenskgalopp.se/webapi/tracks?licenseTracks=true").then(actualResponse => {
            expect(actualResponse.headers).to.matchPattern(commonHeaderPattern)
            actualResponse.body.every(t => expect(t).to.matchPattern(
                {
                    "id": (id) => _.isString(id) && !isNaN(id),
                    "code": _.isString,
                    "name": _.isString
                }
            ))
        })
    })

})
