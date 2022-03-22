let e
before(() => {
    e = Cypress.env()
    cy.visit(`${e.actualHost}/docs`)
})

describe("Swagger meta data extraction", () => {

    context("Use cypress to screen scrape the swagger meta data urls", () => {

        it('Should scrape and store metadata to file', () => {
            console.log("Scraping!!!")
            const swaggerMetadataEndpoints = []

            cy.get("[id=select]").get("option").each(($o, index) => {
                const docPath = $o.get(0).value // Get value of native element
                swaggerMetadataEndpoints.push(docPath)
            })
            cy.log(swaggerMetadataEndpoints)

            cy.writeFile("cypress/logs/swagger-metadata-paths.json", swaggerMetadataEndpoints)

            console.log("Done Scraping!!!")
        })

    })

})