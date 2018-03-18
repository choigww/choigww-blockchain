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
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);

        // This function will handle later instances of the application
        // connecting to peers that are specified when they're started.
        // so call this.connectToPeers within the server.on 
        // and console.log of the listening function
        this.connectToPeers();
    }

    // Each of the peers within this peers constant array that we have at the top
    // 

    connectToPeers() {
        peers.forEach(peer => {
          const socket = new Websocket(peer);
          socket.on('open', () => this.connectSocket(socket));
        });
      }

    connectToPeers() {
        peers.forEach(peer => {
            // address of peer example! (peer lookes like this.)
            // ws://localhost:5001 
            // with the address, we can make a new web socket moudle
            // rather object by using the web socket class at the top
            // and then passing in that peer address into the constructor
            const socket = new Websocket(peer); // this creates a socket object 

            // once we have this socket, open another event listerner
            // for the open event for 'this'.
            // because we need to specify our peers for the application.
            
            // by doing socket.on open we can run some code
            // if that server is started later.
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);

        socket.send(JSON.stringify(this.blockchain.chain));
    }

    messageHandler(socket) {
        socket.on('message', message => {
            // transform into javascript object
            const data = JSON.parse(message);
            console.log('data', data);
        });
    };
}


module.exports = P2pServer;

