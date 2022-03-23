const { match } = require("node-match-path")
const fs = require("fs")
const fetch = require('sync-fetch')
const RJSON = require("relaxed-json")
const _ = require('lodash')

// The two (optional) parameters are the base url (the server to target) and the docs url to Swagger docs
// It seems to only be needed (so far) for the customer api where we have an /internaldocs suffix rather than the default /docs
// Default is to use whatever is in the cypress cfg.env.actualHost both as server target and as the swagger root (with suffix /docs)
exports.generateCoCoReport = async function ({
    baseUrl = defaultBaseUrl(),
    docsUrl = defaultDocsUrl()
} = {}) {
    
    console.log("Using baseUrl: " + baseUrl + " and docsUrl: " + docsUrl)

    const metadataPaths = await scrapeSwaggerDocsMetadata(docsUrl)

    const targetedEndpoints = await extractTargetedEndpointsFromSwagger(metadataPaths, baseUrl)
    // console.log("\nTargeted endpoints from Swagger:\n" + JSON.stringify(targetedEndpoints))

    const calledEndpoints = extractEndpointsCalledDuringSpecRuns()
    // console.log("\nEndpoints called during spec runs:\n" + JSON.stringify(calledEndpoints))

    const reportData = createReportData(targetedEndpoints, calledEndpoints)
    const table = createAsciiTable(reportData, baseUrl)

    fs.writeFileSync("cypress/reports/ascii.txt", table.toString())
    console.log(table.toString())
}

function defaultBaseUrl() {
    return JSON.parse(fs.readFileSync("cypress.json")).env.actualHost
}

function defaultDocsUrl() {
    return defaultBaseUrl() + "/docs"
}

function createReportData(targetedEndpoints, calledEndpoints) {
    return targetedEndpoints.map(e => ({
        called: hasBeenCalled(e, calledEndpoints),
        method: e.method,
        path: e.path
    }))
}

const extractTargetedEndpointsFromSwagger = async function (metadataPaths, hostAndCtxRoot) {
    const targetedEndpoints = []

    metadataPaths.forEach(s => {
        const swaggerUrl = `${hostAndCtxRoot}/${s}`
        const swaggerMetadataJson = fetch(swaggerUrl, { /* empty options */ }).json()

        for (const [path, value] of Object.entries(swaggerMetadataJson.paths)) {
            // One of GET, POST, PUT etc...
            const httpVerb = Object.entries(value)[0][0].toUpperCase()
            const nodeStylePath = convertPathParams(path)
            // path is the last part of the url from (typically what comes after <protocol>://<host>:<port>/webapi/)
            targetedEndpoints.push({ method: httpVerb, path: new URL(hostAndCtxRoot).pathname + nodeStylePath })
        }
    })

    // Since we sometimes have overlapping tags in Swagger, we do this just to not get duplicate paths
    const uniqueTargetedEndpoints = _.uniqWith(targetedEndpoints, _.isEqual)
    // console.log(uniqueTargetedEndpoints)
    return uniqueTargetedEndpoints
}

const scrapeSwaggerDocsMetadata = async function (swaggerDocsUrl) {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({})

    const page = await browser.newPage()
    await page.goto(swaggerDocsUrl)

    const options = await page.$x("//select/option")
    // Extract the values of the swagger doc dropdown (holds the paths to each respective service Swagger doc page)
    const optionTexts = await Promise.all(options.map(async (option) =>
        await page.evaluate(el => el.value.split("/").slice(2).join("/"), option)
    ))

    browser.close()

    return optionTexts
}

function extractEndpointsCalledDuringSpecRuns() {
    const calledEndpoints = []

    // Skip any other lines, we're only interested in the outgoing calls made during the spec runs
    const requests = fs.readFileSync("cypress/logs/request.log").toString().split("\n")
        .filter(s => s.includes("eventName: 'http:request'"))
    console.log("Found " + requests.length + " outgoing calls in request log")

    // JSON part is after the log ceremony: 2022-03-17T07:56:06.697Z cypress:server:socket-base backend:request { THIS IS THE JSON PART WE'RE AFTER }
    const requestsAsJson = requests.map(r => {
        const relaxedJsonString = r.split(" cypress:server:socket-base backend:request ")[1]
        const jsonString = RJSON.transform(relaxedJsonString)
        return JSON.parse(jsonString)
    })

    requestsAsJson.forEach(r => {
        r.args.forEach(a => {
            const method = a.method
            let url = new URL(a.url)
            calledEndpoints.push({ method: method, path: url.pathname })
        })
    })

    return calledEndpoints;
}

function createAsciiTable(reportData, hostAndCtxRoot) {
    const { AsciiTable3, AlignmentEnum } = require('ascii-table3')

    const data = []
    reportData.forEach(e => data.push([e.called ? "\u2713" : '', e.method, e.path]))

    const url = new URL(hostAndCtxRoot)
    const table =
        new AsciiTable3('Code Coverage Report - ' + url.protocol + "//" + url.hostname)
            .setHeading('Called', 'Method', "Path")
            .addRowMatrix(data);

    table.setStyle('unicode-double')
        .setAlign(1, AlignmentEnum.CENTER)
        .setAlign(2, AlignmentEnum.CENTER)
        .setAlign(3, AlignmentEnum.LEFT)
    return table
}

function hasBeenCalled(endpoint, calledEndpoints) {
    const matchingCall = calledEndpoints.find((request) => {
        const methodsMatch = request.method === endpoint.method // HTTP Verb GET/POST/... must match
        const matchResult = match(endpoint.path, request.path) // Path including path params must match
        return methodsMatch && matchResult.matches
    })

    return matchingCall !== undefined // Must find AT LEAST one matching request
}

function convertPathParams(path) {
    // Spring Boot vs nodejs style on path params: /raceinfo/{raceDayId}/results => /raceinfo/:raceDayId/results
    return path.replaceAll("{", ":").replaceAll("}", "")
}
