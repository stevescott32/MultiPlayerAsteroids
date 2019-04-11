// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let present = require('present');
// module for creating players
let Player = require('./player');
let AsteroidManager = require('./asteroidManager'); 

// the setting for how large the world is
const WORLDSIZE = {
    height: 5,
    width: 5 // the world is 5 X times as big as the viewport size 
}

let asteroidManager = AsteroidManager.create({
    imageSrc: '',
    audioSrc: '', 
    maxSize: 180,
    minSize: 60, 
    maxSpeed: 100,
    minSpeed: 50,
    interval: 1, // seconds
    maxAsteroids: 25,
    initialAsteroids: 8, 
    worldSize: WORLDSIZE
}); 

const UPDATE_RATE_MS = 250;
let quit = false;
let activeClients = {};
let inputQueue = [];

//------------------------------------------------------------------
//
// Process the network inputs we have received since the last time
// the game loop was processed.
//
//------------------------------------------------------------------
function processInput() {
    //
    // Double buffering on the queue so we don't asynchronously receive inputs
    // while processing.
    let processMe = inputQueue;
    inputQueue = [];

    // loop through all the inputs to be processed
    for (let inputIndex in processMe) {
        let input = processMe[inputIndex];
        // get the client associated with this input 
        let client = activeClients[input.clientId];
        // update the lastMessageId to be the message id we are currently processing
        client.lastMessageId = input.message.id;
        // perform the action associated with the input type 
        switch (input.message.type) {
            case 'move':
                client.player.move(input.message.elapsedTime);
                break;
            case 'rotate-left':
                client.player.rotateLeft(input.message.elapsedTime);
                break;
            case 'rotate-right':
                client.player.rotateRight(input.message.elapsedTime);
                break;
        }
    }
}

function updateAsteroids(elapsedTime) {
    if(!asteroidManager.asteroids) {
        console.log('No asteroids on the server'); 
    }
    else {
        asteroidManager.update(elapsedTime); 
        let update = {
            asteroids: asteroidManager.asteroids,
        }
        for (let clientId in activeClients) {
            activeClients[clientId].socket.emit('update-asteroid', update);
        }
    }
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    for (let clientId in activeClients) {
        activeClients[clientId].player.update(elapsedTime);
    }
    updateAsteroids(elapsedTime); 
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients(elapsedTime) {
    // iterate through all active clients 
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        // update object that will be sent to client, 
        // containing the information needed for update
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            position: client.player.position,
            updateWindow: elapsedTime
        };
        if (client.player.reportUpdate) {
            client.socket.emit('update-self', update);

            //
            // Notify all other connected clients about every
            // other connected client status...but only if they are updated.
            for (let otherId in activeClients) {
                if (otherId !== clientId) {
                    activeClients[otherId].socket.emit('update-other', update);
                }
            }
        }
    }

    // all clients are updated, change reportUpdate to false
    for (let clientId in activeClients) {
        activeClients[clientId].player.reportUpdate = false;
    }
}

//------------------------------------------------------------------
//
// Server side game loop
//
//------------------------------------------------------------------
function gameLoop(currentTime, elapsedTime) {
    processInput();
    update(elapsedTime, currentTime);
    updateClients(elapsedTime);

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, UPDATE_RATE_MS);
    }
}

//------------------------------------------------------------------
//
// Get the socket.io server up and running so it can begin
// collecting inputs from the connected clients.
//
//------------------------------------------------------------------
function initializeSocketIO(httpServer) {
    let io = require('socket.io')(httpServer);

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the arrival of this
    // new client.  Plus, tell the newly connected client about the
    // other players already connected.
    //
    //------------------------------------------------------------------
    function notifyConnect(socket, newPlayer) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                //
                // Tell existing about the newly connected player
                client.socket.emit('connect-other', {
                    clientId: newPlayer.clientId,
                    direction: newPlayer.direction,
                    position: newPlayer.position,
                    rotateRate: newPlayer.rotateRate,
                    speed: newPlayer.speed,
                    size: newPlayer.size
                });

                //
                // Tell the new player about the already connected player
                socket.emit('connect-other', {
                    clientId: client.player.clientId,
                    direction: client.player.direction,
                    position: client.player.position,
                    rotateRate: client.player.rotateRate,
                    speed: client.player.speed,
                    size: client.player.size
                });
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the disconnect of
    // another client.
    //
    //------------------------------------------------------------------
    function notifyDisconnect(playerId) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (playerId !== clientId) {
                client.socket.emit('disconnect-other', {
                    clientId: playerId
                });
            }
        }
    }
    
    //------------------------------------------------------------------
    //
    // Sends the data needed for a client to start the game
    //
    //------------------------------------------------------------------
    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        let newPlayer = Player.create(WORLDSIZE)
        newPlayer.clientId = socket.id;
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        // the third step (acknowledge) in the TCP 3-step handshake process
        // (syn, syn-ack, ack)
        socket.emit('connect-ack', {
            direction: newPlayer.direction,
            position: newPlayer.position,
            size: newPlayer.size,
            rotateRate: newPlayer.rotateRate,
            speed: newPlayer.speed,
            worldSize: WORLDSIZE,
        });

        // push any new inputs into the input queue 
        socket.on('input', data => {
            inputQueue.push({
                clientId: socket.id,
                message: data
            });
        });

        // when a player disconnects, remove them from the list of
        // active clients 
        socket.on('disconnect', function() {
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        // tell the players that the newPlayer is connected 
        notifyConnect(socket, newPlayer);
    });
}

//------------------------------------------------------------------
//
// Entry point to get the game started.
//
//------------------------------------------------------------------
function initialize(httpServer) {
    initializeSocketIO(httpServer);
    asteroidManager.startGame(); 
    gameLoop(present(), 0);
}

//------------------------------------------------------------------
//
// Public function that allows the game simulation and processing to
// be terminated.
//
//------------------------------------------------------------------
function terminate() {
    this.quit = true;
}

module.exports.initialize = initialize;
module.exports.terminate = terminate; 
