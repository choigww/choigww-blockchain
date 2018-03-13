/**
 * Goal : to have at least 2 servers running on our blockchain
 *        at once to make sure that every time one block is added to 
 *        any of the running block chain instances, all the running 
 *        blockchain apps receive that change and update or change
 *        accordingly.
 * 
 * P2P server using WebSocket
 * npm i ws --save
 * 
 * By creating a peer-to-peer real time connected 
 * Web socket server, we can support multiple contributors
 * to our blockchain application
 * 
 */

const Websocket = require('ws');

 // by default, p2p post set to 5001
 // But our HTTP server for the blockchain app 
 // will give the user the ability to divide this port
 // specifically by overriding port 5001 
 // with an environment variable
const P2P_PORT = process.env.P2P_PORT || 5001;

// one-line if statement
// check if environment variable exists or not
// peer's environment variable present -> split up the peer's env variables(socket addresses) into an array
// peer's environment variable not present -> set it to an empty array
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2pServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = []; // a list to store the connected web socket servers
    }

    listen() {
        // statically used!
        const server = new Websocket.Server({ port: P2P_PORT });
        // Now that we have the server created
        // Let's also set up an event listener through a function on the sever object called 'on'
        //   1. listen for incoming types of messages
        //   2. send to the web socket server for the first argument of the event listener
        // By listening for the connection events, 
        // we can fire specific code whenever a new socket connects to this server
        // in order to interact at that socket we're given a callback function
        // which as its parameter is the one socket object that is created as the result of this connection.
        server.on('connection', socket => this.connectSocket(socket));
        // connectSocket --> pushing the socket to our array of sockets
        console.log(`Listening for peer-to-peer connections on: %{P2P_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');
    };
}




