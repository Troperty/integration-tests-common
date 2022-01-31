const chaiMatchPattern = require('chai-match-pattern')
// const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

export const commonHeaderPattern = {
    "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
    "content-type": (ct) => ct === "application/json" || ct === "application/json;charset=UTF-8",
    "date": (date) => _.isOmitted(date) || _.isDateString(date),
    "expires": _.isString,
    "pragma": "no-cache",
    "set-cookie": [(cStr) => {
        return cStr.includes("Path=/; Secure; HttpOnly") && cStr.includes("correlationId=")
    }],
    "strict-transport-security": "max-age=31536000 ; includeSubDomains",
    "vary": "Accept-Encoding, Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "x-frame-options": "DENY",
    "content-length": _.isString,
    "content-encoding": (ce) => _.isOmitted(ce) || ce === "gzip",
    "transfer-encoding": (te) => _.isOmitted(te) || te === "chunked"
}