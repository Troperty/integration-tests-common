const chaiMatchPattern = require('chai-match-pattern')
// const { expect } = require("chai").use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

export const commonHeaderPattern = {
    "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
    "content-type": (ct) => ct === "application/json" || ct === "application/json;charset=UTF-8",
    "date": (date) => _.isOmitted(date) || _.isDateString(date),
    "expires": _.isString,
    "pragma": "no-cache",
    "set-cookie": (cookies) => {
        // Accept 1 or 2 cookies during gcp-logging upgrade rollout (SCPMA-578/SCPMA-580)
        if (!Array.isArray(cookies)) return false;
        if (cookies.length < 1 || cookies.length > 2) return false;
        return cookies.every(cStr =>
            cStr.includes("Path=/; Secure; HttpOnly") && cStr.includes("correlationId=")
        );
    },
    "strict-transport-security": "max-age=31536000 ; includeSubDomains",
    "vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "0",
    "x-frame-options": "DENY",
    "content-length": cl => _.isOmitted(cl) || _.isString(cl),
    "content-encoding": (ce) => _.isOmitted(ce) || ce === "gzip",
    "transfer-encoding": (te) => _.isOmitted(te) || te === "chunked"
}