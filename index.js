/*
Primary file for the API
 */

////////// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')

////////// Create server
const server = http.createServer((req, res) => {

// get URL and parse it
    let parsedUrl = url.parse(req.url, true)

// get path
    let path = parsedUrl.pathname
    // this line remove "/" from start and end path
    let trimmedPath = path.replace(/^\/+|\/+$/g,'')

// get the parameters form request
    let queryStringObject = parsedUrl.query

// get HTTP method
    let method = req.method.toLocaleLowerCase()

// headers
    let headers = req.headers

// get payload
    let decoder = new StringDecoder('utf-8')
    let buffer = ''

    req.on('data',(data)=> {
        buffer += decoder.write(data)
    })

    req.on('end', ()=>{
        buffer += decoder.end()

        // choose handler this request, if not found usr notFound handler
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        //construct the data object to send in the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        // route request to chosen handler
        chosenHandler(data,(statusCode,payload)=>{
            // use code from handler or use default 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200
            // use payload from handler or use default {}
            payload = typeof (payload) === 'object' ? payload : {}
            // convert payload to string
            let payloadString = JSON.stringify(payload)

            // set headers (Content-type)
            res.setHeader('Content-type', 'application/json')
            // return response
            res.writeHead(statusCode)
            res.end(payloadString)

            console.log(`Returning response: statusCode ${statusCode} and payload ${payloadString}`)

        })
    })
})

////////// start listening
server.listen(config.port, ()=>{
    console.log(`Server is listening ${config.port} port`)
})

////////// define the handlers
let handlers = {}

//sample handler
handlers.sample = (data, callback) => {
// callback HTTP status code and payload object
    callback(406,{'name': 'sample handler'})
}

// define notFound handler
handlers.notFound = (data, callback) => {
callback(404)
}

////////// define a request router
let router = {
    'sample': handlers.sample
}