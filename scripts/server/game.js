// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let Collisions = require('./collisions'); 
let present = require('present');
let Player = require('./player');
let AsteroidManager = require('./asteroidManager');
let Alien = require('./alien'); 
let LaserManager = require('./laserManager');
let PowerUpManager = require('./powerUpManager');

// the setting for how large the world is
const WORLDSIZE = {
    height: 5,
    width: 5 // the world is 5 X times as big as the viewport size 
}

const BATTLE_MODE = false; 
let powerUpManager = PowerUpManager.create({
    size: .15,
    interval: 20000, // seconds
})
let asteroidManager = AsteroidManager.create({
    imageSrc: '',
    audioSrc: '',
    maxSize: 3000,
    minSize: 1000,
    maxSpeed: 100,
    minSpeed: 50,
    interval: 1, // seconds
    maxAsteroids: 50,
    initialAsteroids: 15,
    worldSize: WORLDSIZE
});

const UPDATE_RATE_MS = 20;

let laserManager = LaserManager.create({
    size: 10,
    speed: 3,
    interval: 100,
    worldSize: WORLDSIZE
});

let alienLasers = LaserManager.create({
    size: 10,
    speed: 3,
    interval: 300,
    worldSize: WORLDSIZE
});

let alien = Alien.create({
    worldSize: WORLDSIZE,
    alienLasers: laserManager,
    interval: 1500
}); 

let quit = false;
let activeClients = {};
let inputQueue = [];
let lastUpdateTime = present();
let highScores = {}; 

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
                client.player.move(input.message.elapsedTime, input.receiveTime - lastUpdateTime);
                lastUpdateTime = input.receiveTime;
                break;
            case 'hyperspace':
                let avoid = [];
                avoid.push(asteroidManager.asteroids);
                avoid.push(laserManager.laserArray); 
                if(client.player.hyperspace(avoid, WORLDSIZE)) {
                    log(client.player.nickname + ' hyperspaced'); 
                }
            case 'rotate-left':
                client.player.rotateLeft(input.message.elapsedTime);
                break;
            case 'rotate-right':
                client.player.rotateRight(input.message.elapsedTime);
                break;
            case 'fire':
                if (present() - client.player.lastLaserTime > laserManager.fireRate) {
                    laserManager.generateNewLaser(client.player.position.x, 
                        client.player.position.y, client.player.direction, input.clientId);
                    client.player.lastLaserTime = present(); 
                }
                break;
        }
    }
}

//------------------------------------------------------------------
// function to see if asteroids have collided with anything, 
// ships have collided with anything, or if lasers have collided 
// with anything
//------------------------------------------------------------------
function detectCollisions() {
    let collisionAlien = {
            position: alien.state.position,
            size: alien.size
    }

    // asteroid collisions
    for (let a = 0; a < asteroidManager.asteroids.length; a++) {
        let asteroid = asteroidManager.asteroids[a];
        // detect if lasers have collided with asteroids
        for (let z = 0; z < laserManager.laserArray.length; z++) {
            let laser = laserManager.laserArray[z];
            if (!laser.isDead && !asteroid.isDead && laser.playerId != 1 // player id of 1 is the alien
                    && Collisions.sweptCircle(asteroid, asteroid.lastPosition, laser, laser.lastPosition)) {
                laser.isDead = true;
                asteroidManager.explode(asteroid); 
                activeClients[laser.playerId].player.score += 100; 
            }
            if(Collisions.detectCircleCollision(collisionAlien, laser)) {
                log(activeClients[laser.playerId].player.nickname + ' collided with an alien'); 
            }
        }

        // detect if player has collided with an asteroid
        for(let id in activeClients) {
            let ship = activeClients[id].player;
            if(powerUpManager.currentPowerUp.position && Collisions.detectCircleCollision(ship, powerUpManager.currentPowerUp))
                {
                    log(ship.nickname + ' got a shield');
                    ship.hasShield = true;
                    ship.gotShield = present();
                } 
            if(!asteroid.isDead && !ship.hasShield &&Collisions.detectCircleCollision(asteroid, ship)) {
                let avoid = [];
                avoid.push(asteroidManager.asteroids);
                avoid.push(laserManager.laserArray); 
                ship.crash(avoid, WORLDSIZE);
                log(ship.nickname + ' was killed by an asteroid'); 
            }
            if(Collisions.detectCircleCollision(collisionAlien, ship)) {
                let avoid = [];
                avoid.push(asteroidManager.asteroids);
                avoid.push(laserManager.laserArray); 
                ship.crash(avoid, WORLDSIZE);
                log(ship.nickname + ' collided with an alien'); 
            }
            checkForHighScore(ship); 
        }
    }

    // detect collisions between asteroid lasers and players
    if(!BATTLE_MODE) {
        for(let id in activeClients) {
        let ship = activeClients[id].player; 
            for (let z = 0; z < laserManager.laserArray.length; z++) {
                let laser = laserManager.laserArray[z];
                if(laser.playerId == 1 && Collisions.detectCircleCollision(ship, laser)) {
                    laser.isDead = true; 
                    let avoid = []; 
                    avoid.push(asteroidManager.asteroids);
                    avoid.push(laserManager.laserArray); 
                    ship.crash(avoid, WORLDSIZE); 
                    log(ship.nickname + ' was killed by alien lasers'); 
                }
            }
        }
    }
    // detect collisions between lasers and all ships if n battle mode
    else if(BATTLE_MODE) {
        for(let id in activeClients) {
        let ship = activeClients[id].player; 
            for (let z = 0; z < laserManager.laserArray.length; z++) {
                let laser = laserManager.laserArray[z];
                if(id != laser.playerId && !ship.hasShield && Collisions.detectCircleCollision(ship, laser)) {
                    laser.isDead = true; 
                    let avoid = []; 
                    avoid.push(asteroidManager.asteroids);
                    avoid.push(laserManager.laserArray); 
                    ship.crash(avoid, WORLDSIZE); 
                    if(laser.playerId != 1) { // the alien doesn't get points
                        activeClients[laser.playerId].player.score += 500; 
                    }
                    log(ship.nickname + ' was killed by enemy lasers'); 
                }
            }
        }
    }
}


//------------------------------------------------------------------
// helper function to check for high scores and potentially 
// notify clients
//------------------------------------------------------------------
function checkForHighScore(player) {
    if(!highScores[player.clientId] ) { // || !highScores[player.clientId].score) {
        highScores[player.clientId] = {
            score: player.score,
            nickname: player.nickname,
            clientId: player.clientId
        }
        updateHighScores(); 
    }
    if(player.score > highScores[player.clientId].score ) {
        highScores[player.clientId] = {
            score: player.score,
            nickname: player.nickname,
            clientId: player.clientId
        }
        updateHighScores(); 
    }
}

//------------------------------------------------------------------
// functions to send updates to the clients about various 
// objects/managers in the game 
//------------------------------------------------------------------
function updateHighScores() {
    let update = highScores; 
    for (let clientId in activeClients) {
        activeClients[clientId].socket.emit('update-highScores', update);
    }
}

function updateAsteroids(elapsedTime) {
    if (!asteroidManager.asteroids) {
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

function updateAlien(elapsedTime) {
    if(!alien || !alien.state || !alien.state.position) {return; }
    alien.update(elapsedTime); 
    let alienUpdate = {
        position: {
            x: alien.state.position.x,
            y: alien.state.position.y
        }, 
        velocity: {
            x: alien.state.momentum.x,
            y: alien.state.momentum.y
        }
    }
    let update = {
        alien: alienUpdate
    }
    for (let clientId in activeClients) {
        activeClients[clientId].socket.emit('update-alien', update);
        //console.log('Emiting', update); 
    }
}


function updateLaser(elapsedTime) {
    if (!laserManager.laserArray && !alienLasers.laserArray) {
        console.log('No Lasers on the server');
    }
    else {
        laserManager.update(elapsedTime);
        alienLasers.update(elapsedTime); 
        let update = {
            lasers: laserManager.laserArray,
            alienlasers: laserManager.laserArray
        }
        for (let clientId in activeClients) {
            activeClients[clientId].socket.emit('update-laser', update);
        }
    }
}
function updatePowerUpManager(elapsedTime){
    if(!powerUpManager.powerUpAvailable)
    {
        //console.log("No Power Ups Available")
        powerUpManager.update(elapsedTime);
    }
    else{
            powerUpManager.timeOnScreen += elapsedTime;
            let x = Math.random() * 5;
            let y = Math.random() * 5;
            let type = powerUpManager.powerUpArray[0];
            powerUpManager.accumulatedTime = 0;
            
            powerUpManager.createPowerUp(x, y,type)
            //console.log(powerUpManager);
            let update = {
                available: powerUpManager.powerUpAvailable,
                powerUp: powerUpManager.currentPowerUp
            }
            log("Power Up Available" + "X: " + powerUpManager.currentPowerUp.position.x + " Y: " + powerUpManager.currentPowerUp.position.y); 
            // console.log(powerUpManager.currentPowerUp);
            for (let clientId in activeClients) {
                activeClients[clientId].socket.emit('powerUp', update);
            }
            powerUpManager.powerUpAvailable = false;
    }
}

// function to log messages to the client's message board
function log(message) {
    for(let clientId in activeClients) {
        activeClients[clientId].socket.emit('log', message); 
    }
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    for (let clientId in activeClients) {
        activeClients[clientId].player.update(elapsedTime, false);
    }
    updateAlien(elapsedTime); 
    updatePowerUpManager(elapsedTime);
    updateAsteroids(elapsedTime);
    updateLaser(elapsedTime);
    detectCollisions(); 
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
            momentum: client.player.momentum,
            direction: client.player.direction,
            position: client.player.position,
            updateWindow: elapsedTime, 
            score: client.player.score,
            hasShield: client.player.hasShield,
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
    lastUpdateTime = present();
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
                    momentum: newPlayer.momentum,
                    position: newPlayer.position,
                    rotateRate: newPlayer.rotateRate,
                    thrustRate: newPlayer.thrustRate,
                    size: newPlayer.size,
                    hasShield: newPlayer.hasShield,
                });

                //
                // Tell the new player about the already connected player
                socket.emit('connect-other', {
                    clientId: client.player.clientId,
                    direction: client.player.direction,
                    momentum: client.player.momentum,
                    position: client.player.position,
                    rotateRate: client.player.rotateRate,
                    thrustRate: client.player.thrustRate,
                    size: client.player.size,
                    hasShield: newPlayer.hasShield,
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
    io.on('connection', function (socket) {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        let newPlayer = Player.create(WORLDSIZE); 
        let avoid = []; 
        avoid.push(laserManager.laserArray); 
        avoid.push(asteroidManager.asteroids); 
        newPlayer.hyperspace(avoid, WORLDSIZE); 
        newPlayer.clientId = socket.id;
        console.log('Client id in new player create', newPlayer.clientId); 
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
            momentum: newPlayer.momentum,
            rotateRate: newPlayer.rotateRate,
            speed: newPlayer.speed,
            worldSize: WORLDSIZE,
            thrustRate: newPlayer.thrustRate,
            playerId: newPlayer.clientId
        });

        // push any new inputs into the input queue 
        socket.on('input', data => {
            inputQueue.push({
                clientId: socket.id,
                message: data,
                receiveTime: present(),
            });
        });
        socket.on('nickname', data=> {
            activeClients[socket.id].player.nickname = data; 
            log(activeClients[socket.id].player.nickname + ' has joined the game'); 
        }); 

        updateHighScores(); 

        // when a player disconnects, remove them from the list of
        // active clients 
        socket.on('disconnect', function () {
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
