import rp from 'request-promise';

const URI = "http://192.168.0.59:4000/channels/mychannel/chaincodes/hackathon";
const AUTH = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDY4NDgzNTksInVzZXJuYW1lIjoibWFsbGlrIiwib3JnTmFtZSI6Im9yZzIiLCJpYXQiOjE1MDY4MTIzNTl9.9gQLVfYWo5q7faScclT0-PLSDZdhLEGPQgTOWTFNWgQ";

const getUserDetails = name => {
    let options = {
        uri: URI,
        qs: {
            peer: "peer1",
            fcn: "query",
            args: `["${name}"]`
        },
        headers : {
            "Content-Type": "application/json",
            authorization: AUTH
        }
    }
    return rp(options);
}

const buyShares = shareDetails => {
    
    let options = {
        uri: URI,
        headers : {
            "Content-Type": "application/json",
            authorization: AUTH
        },
        body: {
            fcn: "buyShares",
            args: [ `${shareDetails.buyer}`, "probit", `${shareDetails.shareName}`,`${shareDetails.validPoints}`,`${shareDetails.validShareAmount}`]
        },
        json: true
    }
    console.log({"BLOCKCHAIN OPTIONS": JSON.stringify(options)})
    return rp.post(options)
}

const sellShares = shareDetails => {

    let options = {
        uri: URI,
        headers : {
            "Content-Type": "application/json",
            authorization: AUTH
        },
        body: {
            fcn: "sellShares",
            args: [ `${shareDetails.seller}`, "probit", `${shareDetails.shareName}`,`${shareDetails.validPoints}`,`${shareDetails.validShareAmount}`]
        },
        json: true
    }
    console.log({"BLOCKCHAIN SELL OPTIONS": options})
    return rp.post(options)
}

export default { getUserDetails, buyShares, sellShares }

// getUserDetails("arjun")