const chaiMatchPattern = require('chai-match-pattern')
const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

import { commonHeaderPattern } from "../../fixtures/common-header-pattern.js"
import { getAndMatchArrayWithOptions, getAndMatchWithOptions } from "../../common/common-compare-with-patterns"

describe('Some examples of usage', () => {

    it('Lookup horse by ID', () => {
        getAndMatchWithOptions("https://ci.api.danskhv.dk/webapi/gallop/horses/505916/basicinformation",
            {
                "id": 505916,
                "name": "LEGOLAS",
                "gender": {
                    "text": "Hingst",
                    "code": "H"
                },
                "horseBreed": "engelskt fullblod",
                "color": "brun",
                "registrationNumber": "G09497",
                "dateOfBirth": "1984-04-21",
                "dateOfBirthDisplayValue": "1984-04-21",
                "ownerName": "Ewy Alfredsson",
                "ownerHeader": "Ejer",
                "breederName": "Stutteri Toftøje",
                "breederStatus": "dansk",
                "dead": false,
                "additionalInformation": {
                    "hasOffspring": false,
                    "hasPedigree": false,
                    "hasResults": false
                }
            },
            { auth: null }
        )
    })

    it('Get offspring', () => {
        getAndMatchArrayWithOptions("https://ci.api.danskhv.dk/webapi/gallop/horses/505916/offspring",
            {
                "text": t => ["Hingst", "Vallak"].includes(t),
                "code": c => ["H", "V"].includes(c)
            },
            {
                // Matching is performed on some array appearing deep down in the response's body
                subpath: "offspringViewFilterValues.genderGroups[0].genders",
                auth: null
            }
        )
    })

})