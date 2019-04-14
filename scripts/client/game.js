//------------------------------------------------------------------
//
// This function provides the "game" code.
//
//------------------------------------------------------------------
MyGame.main = (function(graphics, renderer, input, components) {
    'use strict';
    let localAsteroids = [];
    let localLaser = []; 

    let asteroidManager = components.AsteroidManager({
        maxSize: 200,
        minSize: 65, 
        maxSpeed: 100,
        minSpeed: 50,
        interval: 1, // seconds
        maxAsteroids: 12,
        initialAsteroids: 8
    }); 

    let particleSystemManager = components.ParticleSystemManager({}); 

    let laserManager = components.LaserManager({
        size: 20,
        speed: 4,
    });

    components.TileUtils.tileSize = {
        width: 128,
        height: 128
    }

    components.TileUtils.imageSize = {
        width: 2048,
        height: 2048
    }

    let lastTimeStamp = performance.now(),
        myKeyboard = input.Keyboard(),
        playerSelf = {
            model: components.Player(),
            texture: MyGame.assets['player-self']
        },
        playerOthers = {},
        messageHistory = MyGame.utilities.Queue(),
        messageId = 1,
        socket = io(),
        asteroidTexture = MyGame.assets['asteroid'],
        laserTexture = MyGame.assets['laser'];

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-ack', function(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;

        playerSelf.model.size.x = data.size.x;
        playerSelf.model.size.y = data.size.y;

        playerSelf.model.momentum.x = data.momentum.x;
        playerSelf.model.momentum.y = data.momentum.y;
        
        playerSelf.model.direction = data.direction;
        playerSelf.model.thrustRate = data.thrustRate;
        playerSelf.model.rotateRate = data.rotateRate;
        MyGame.components.Viewport.worldSize.height = data.worldSize.height; 
        MyGame.components.Viewport.worldSize.width = data.worldSize.width; 
    });

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-other', function(data) {
        let model = components.PlayerRemote();
        model.state.position.x = data.position.x;
        model.state.position.y = data.position.y;
        model.state.momentum.x = data.momentum.x;
        model.state.momentum.y = data.momentum.y;
        model.state.direction = data.direction;
        model.state.lastUpdate = performance.now();

        model.goal.position.x = data.position.x;
        model.goal.position.y = data.position.y;
        model.goal.direction = data.direction;
        model.goal.updateWindow = 0;

        model.size.x = data.size.x;
        model.size.y = data.size.y;

        playerOthers[data.clientId] = {
            model: model,
            texture: MyGame.assets['player-other']
        };
    });

    //------------------------------------------------------------------
    //
    // Handler for when another player disconnects from the game.
    //
    //------------------------------------------------------------------
    socket.on('disconnect-other', function(data) {
        delete playerOthers[data.clientId];
    });

    // set local asteroids to be the server's asteroids
    socket.on('update-asteroid', function(data) {
        if(data.asteroids) {
            try {
                asteroidManager.asteroids = (data.asteroids); 
            } catch {
                console.log('Invalid asteroids received'); 
            }
        } else { console.log('No asteroids'); }
    });

    // set local lasers to be the server's lasers
    socket.on('update-laser', function(data) {
        if(data.lasers) {
            try {
                laserManager.laserArray = data.lasers;
            } catch {
                console.log('Error invalid lasers received'); 
            }
        } else { console.log('No Lasers'); }
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    socket.on('update-self', function(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;
        playerSelf.model.direction = data.direction;
        playerSelf.model.momentum.x = data.momentum.x;
        playerSelf.model.momentum.y = data.momentum.y;


        //
        // Remove messages from the queue up through the last one identified
        // by the server as having been processed.
        let done = false;
        while (!done && !messageHistory.empty) {
            if (messageHistory.front.id === data.lastMessageId) {
                done = true;
            }
            //console.log('dumping: ', messageHistory.front.id);
            messageHistory.dequeue();
        }

        //
        // Update the client simulation since this last server update, by
        // replaying the remaining inputs.
        let memory = MyGame.utilities.Queue();
        while (!messageHistory.empty) {
            let message = messageHistory.dequeue();
            switch (message.type) {
                case 'move':
                    playerSelf.model.move(message.elapsedTime);
                    break;
                case 'hyperspace':
                    break; 
                case 'rotate-right':
                    playerSelf.model.rotateRight(message.elapsedTime);
                    break;
                case 'rotate-left':
                    playerSelf.model.rotateLeft(message.elapsedTime);
                    break;
                case 'fire':
                    console.log("Time: " + laserManager.accumulatedTime);
                    if(laserManager.accumulatedTime > laserManager.fireRate)
                    {
                        laserManager.generateNewLaser(playerSelf.model.position.x,playerSelf.model.position.y, 
                            playerSelf.model.direction);
                    }
                    break;
            }
            memory.enqueue(message);
        }
        messageHistory = memory;
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    socket.on('update-other', function(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId].model;
            model.goal.updateWindow = data.updateWindow;

            model.state.momentum.x = data.momentum.x;
            model.state.momentum.y = data.momentum.y
            
            model.goal.position.x = data.position.x;
            model.goal.position.y = data.position.y
            model.goal.direction = data.direction;
        }
    });

    //------------------------------------------------------------------
    //
    // Process the registered input handlers here.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        myKeyboard.update(elapsedTime);
    }

    let logs = 0; 
    function detectCollisions() {
        for(let a = 0; a < asteroidManager.asteroids.length; a++) {
            let asteroid = asteroidManager.asteroids[a]; 
            for(let z = 0; z < laserManager.laserArray.length; z++) {
                let laser = laserManager.laserArray[z]; 
                if(MyGame.utilities.Collisions.detectCircleCollision(asteroid, laser)) {
                    laser.isDead = true;
//                    asteroid.isDead = true; 
                    asteroidManager.explode(asteroid, particleSystemManager); 
                    console.log('Asteroid destroyed'); 
                }
            }
            if(MyGame.utilities.Collisions.detectCircleCollision(asteroid, playerSelf.model)) {
                asteroid.isDead = true; 
                console.log('Player kill'); 
            } else if(logs < 100) {
                if(asteroid.position.x < 1 && asteroid.position.y < 1) {
                    //console.log(playerSelf.model.position.x + ': ' + playerSelf.model.position.y); 
                    //console.log(asteroid.position.x + ': ' + asteroid.position.y); 
                    logs++; 
                }
            }
        }
    }
    
    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        particleSystemManager.update(elapsedTime); 
        playerSelf.model.update(elapsedTime);
        asteroidManager.update(elapsedTime); 
        for (let id in playerOthers) {
            playerOthers[id].model.update(elapsedTime);
        }
       laserManager.update(elapsedTime);
        detectCollisions(); 
    }
    //------------------------------------------------------------------
    //
    // Render the current state of the game simulation
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        // render all tiles in the viewport
        renderer.Tiles.render(); 
        // render any ongoing particle effects
        renderer.ParticleSystemManager.render(particleSystemManager); 
        // render main player
        renderer.Player.render(playerSelf.model, playerSelf.texture);
        // render all other players
        for (let id in playerOthers) {
            let player = playerOthers[id];
            renderer.PlayerRemote.render(player.model, player.texture);
        }
        // render each of the asteroids
        for(let a in asteroidManager.asteroids) {
            let asteroid = asteroidManager.asteroids[a]; 
            if(asteroid) {
                renderer.Asteroid.render(asteroid, asteroidTexture); 
            }
        }
        for(let i in laserManager.laserArray){
            let laser = laserManager.laserArray[i];
            if(laser){
                renderer.Laser.render(laser, laserTexture);
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Client-side game loop
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    };

    //------------------------------------------------------------------
    //
    // Public function used to get the game initialized and then up
    // and running.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log('game initializing...');
        //
        // Create the keyboard input handler and register the keyboard commands
        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: 'move'
                };
                socket.emit('input', message);
                messageHistory.enqueue(message);
                playerSelf.model.move(elapsedTime);
            },
            'ArrowUp', true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: 'rotate-right'
                };
                socket.emit('input', message);
                messageHistory.enqueue(message);
                playerSelf.model.rotateRight(elapsedTime);
            },
            'ArrowRight', true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: 'rotate-left'
                };
                socket.emit('input', message);
                messageHistory.enqueue(message);
                playerSelf.model.rotateLeft(elapsedTime);
            },
            'ArrowLeft', true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'hyperspace'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
        }, 
        'z', true); 

            myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: 'fire'
                };
                socket.emit('input', message);
                messageHistory.enqueue(message);
                if(laserManager.accumulatedTime > laserManager.fireRate)
                {
                    laserManager.generateNewLaser(playerSelf.model.position.x,playerSelf.model.position.y, 
                        playerSelf.model.direction);
                }
            },
            ' ', true);

        //
        // Get the game loop started
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize
    };
 
}(MyGame.graphics, MyGame.renderer, MyGame.input, MyGame.components));
