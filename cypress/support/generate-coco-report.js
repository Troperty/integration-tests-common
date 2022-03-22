const { match } = require("node-match-path")
const fs = require("fs")
const fetch = require('sync-fetch')
const RJSON = require("relaxed-json")

exports.generateCoCoReport = function () {
    const cfg = JSON.parse(fs.readFileSync(process.env.COCO_REPORT_CONFIG_FILE))
    console.log("Using CoCo cfg:\n" + JSON.stringify(cfg))

    const targetedEndpoints = extractTargetedEndpointsFromSwagger(cfg)
    // console.log("\nTargeted endpoints from Swagger:\n" + JSON.stringify(targetedEndpoints))

    const calledEndpoints = extractEndpointsCalledDuringSpecRuns()
    // console.log("\nEndpoints called during spec runs:\n" + JSON.stringify(calledEndpoints))

    const reportData = createReportData(targetedEndpoints, calledEndpoints)
    const table = createAsciiTable(reportData, cfg)

    fs.writeFileSync("cypress/reports/ascii.txt", table.toString())
    console.log(table.toString())
}

function createReportData(targetedEndpoints, calledEndpoints) {
    return targetedEndpoints.map(e => ({
        called: hasBeenCalled(e, calledEndpoints),
        method: e.method,
        path: e.path
    }))
}

// FIXME Can this be resolved somehow at runtime? Is there a top level endpoint in Swagger we can expose that just lists the others?
function extractTargetedEndpointsFromSwagger(cfg) {
    const targetedEndpoints = []

    const ctxRoot = new URL(cfg.host).pathname
    cfg.servicesUnderTest.forEach(s => {
        const swaggerUrl = `${cfg.host}${s}`
        const swaggerMetadataJson = fetch(swaggerUrl, { /* empty options */ }).json()

        for (const [path, value] of Object.entries(swaggerMetadataJson.paths)) {
            // One of GET, POST, PUT etc...
            const httpVerb = Object.entries(value)[0][0].toUpperCase()
            const nodeStylePath = convertPathParams(path)
            // path is the last part of the url from (typically what comes after <protocol>://<host>:<port>/webapi/)
            targetedEndpoints.push({ method: httpVerb, path: ctxRoot + nodeStylePath })
        }
    })

    return targetedEndpoints
}

function extractEndpointsCalledDuringSpecRuns() {
    const calledEndpoints = []

    // Skip any other lines, we're only interested in the outgoing calls made during the spec runs
    const requests = fs.readFileSync("cypress/logs/request.log").toString().split("\n")
        .filter(s => s.includes("eventName: 'http:request'"))
    console.log("### Found " + requests.length + " outgoing calls in request log")

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

function createAsciiTable(reportData, cfg) {    
    const { AsciiTable3, AlignmentEnum } = require('ascii-table3')

    const data = []
    reportData.forEach(e => data.push([e.called ? "\u2713" : '', e.method, e.path]))

    const table =
        new AsciiTable3('Code Coverage Report - ' + cfg.host)
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
