/*
Build an application around the blockchain code that we have
to support interactive functionality, we will create API
which is a collection of HTTP requetes 
that will allow users to ineteract with our running application through this API.

We are going to use express module.
npm i express --save
*/

/**
 * npm i body-parser --save
 * allows us to receive some data within post class in our express application
 * from the users who create those post requests.
 * Middleware, in terms of an express application acts like an intermediary function
 * that either transforms outgoing data into another format or it transforms incoming data.
 */

const express = require('express');
const bodyParser = require('body-parser');

// the code below will get the index.js file by default
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');

// HTTP_PORT=3002 npm run dev
// To pass the environment variable that is passed to the application
// and it's going to use insetad of 3001
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// app created from express provides a lot of functionality for us
const app = express();
const bc = new Blockchain();
const p2pServer = new P2pServer(bc);

// To use the body-parser, json middleware function
// the below code allows us to receive json within post class
app.use(bodyParser.json());


/**
 * The data we want to pass in = rec.body.data
 * because when users make a post request to this end point
 * automatically `express` creates a body object for this request
 * and then that body object contains other objects and data
 * that they send through adjacent post class to this endpoint 
 */
app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    // redirects to the blocks end point that we already have
    // which will return the updated blockchain as response
    res.redirect('/blocks');
});

// we can add the endpoint for API that interacts with the blockchain
// endpoint starts with a slash
// second parameters of `get` method -> error fuctions
// req - request / res - response
app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

// optional callback function to log a message once the server is running.
app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));


// start the web socket server in this blockchain application instance
p2pServer.listen();
