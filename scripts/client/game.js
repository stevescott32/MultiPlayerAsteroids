//------------------------------------------------------------------
//
// This function provides the "game" code.
//
//------------------------------------------------------------------
MyGame.screens['gamePlay'] = function (game, graphics, renderer, input, components, ) {
    'use strict';
    const BATTLE_MODE = true;

    let asteroidManager = {};
    let particleSystemManager = {};
    let laserManager = {};
    let messageHistory = null;
    let alien = {}; 

    let lastTimeStamp = performance.now(),
        myKeyboard = null;
    let playerSelf = {},
        playerOthers = {},
        messageId = 1,
        socket = io(),
        asteroidTexture = MyGame.assets['asteroid'],
        laserTexture = MyGame.assets['laser'],
        alienTexture = MyGame.assets['alien']; 
        

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-ack', function (data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;

        playerSelf.model.size.x = data.size.x;
        playerSelf.model.size.y = data.size.y;

        playerSelf.model.momentum.x = data.momentum.x;
        playerSelf.model.momentum.y = data.momentum.y;

        playerSelf.model.direction = data.direction;
        playerSelf.model.thrustRate = data.thrustRate;
        playerSelf.model.rotateRate = data.rotateRate;
        playerSelf.model.playerId = data.playerId;
        console.log('Ack player id: ' + playerSelf.model.playerId);

        MyGame.components.Viewport.worldSize.height = data.worldSize.height;
        MyGame.components.Viewport.worldSize.width = data.worldSize.width;
    });


    // whenever we receive a high scores update from the server,
    // write the high scores to local storage so they can be retrieved
    socket.on('update-highScores', function (data) {
        let highScoresJSON = JSON.stringify(data);
        window.localStorage.setItem('highScores', highScoresJSON);
        for (let id in data) {
            if (data[id].score % 1000 == 0 && data[id].score != 0) {
                let hs = data[id];
                MyGame.utilities.Logger.log(hs.nickname + ' reached a score of ' + hs.score);
            }
        }
    });

    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    socket.on('connect-other', function (data) {
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
    socket.on('disconnect-other', function (data) {
        delete playerOthers[data.clientId];
    });

    // set local asteroids to be the server's asteroids
    socket.on('update-asteroid', function (data) {
        if (data.asteroids) {
            try {
                asteroidManager.asteroids = (data.asteroids);
            } catch {
                console.log('Invalid asteroids received');
            }
        } else { console.log('No asteroids'); }
    });

    // update alien to be the server's alien
    socket.on('update-alien', function(data) {
        if(data.alien) {
            // console.log('Alien update on client', data.alien); 
            alien.state.position.x = data.alien.position.x; 
            alien.state.position.y = data.alien.position.y; 
            alien.state.momentum.x = data.alien.velocity.x; 
            alien.state.momentum.y = data.alien.velocity.y; 
        }
    }); 

    // set local lasers to be the server's lasers
    let log = 0; 
    socket.on('update-laser', function (data) {
        if(log < 30) {
            console.log('Update lasers ', data); 
            log++; 
        }
        if (data.lasers) {
            try {
                laserManager.laserArray = data.lasers;
            } catch {
                console.log('Error invalid lasers received');
            }
        }
        if(data.alienLasers) {
            console.log(data.alienLasers); 
            for(let a = 0; a < data.alienLasers.length; a++) {
                laserManager.laserArray.push(data.alienLasers[a]); 
                MyGame.utilities.Logger.log('Added an alien laser on client'); 
            }
        }
    });

    // if a log message has been received from the server,
    // send it to the logger
    socket.on('log', function (message) {
        MyGame.utilities.Logger.log(message);
    });

    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    socket.on('update-self', function (data) {
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
                    if (laserManager.accumulatedTime > laserManager.fireRate) {
                        laserManager.generateNewLaser(playerSelf.model.position.x, playerSelf.model.position.y,
                            playerSelf.model.direction, playerSelf.model.playerId);
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
    socket.on('update-other', function (data) {
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

    function detectCollisions() {
        for (let a = 0; a < asteroidManager.asteroids.length; a++) {
            let asteroid = asteroidManager.asteroids[a];
            for (let z = 0; z < laserManager.laserArray.length; z++) {
                let laser = laserManager.laserArray[z];
                // check collisions between lasers and asteroids
                if (!laser.isDead && MyGame.utilities.Collisions.detectCircleCollision(asteroid, laser)) {
                    laser.isDead = true;
                    asteroidManager.explode(asteroid, particleSystemManager);
                }
                // detect collisions between lasers and player if in battle mode

            }
            // detect collisions between asteroids and the player 
            if (!asteroid.isDead && MyGame.utilities.Collisions.detectCircleCollision(asteroid, playerSelf.model)) {
                particleSystemManager.createShipExplosion(playerSelf.model.position.x, playerSelf.model.position.y);
                let avoid = [];
                avoid.push(asteroidManager.asteroids);
                avoid.push(laserManager.laserArray);
                playerSelf.model.hyperspace(avoid, MyGame.components.Viewport.worldSize, particleSystemManager);
            }
        }
        if (BATTLE_MODE) {
            for (let id in playerOthers) {
                //let ship = playerOthers[id].model; 
                let ship = {
                    size: playerOthers[id].model.size,
                    position: playerOthers[id].model.state.position
                };
                for (let z = 0; z < laserManager.laserArray.length; z++) {
                    let laser = laserManager.laserArray[z];
                    if (playerSelf.model.playerId != laser.playerId &&
                        MyGame.utilities.Collisions.detectCircleCollision(ship, laser)) {
                        laser.isDead = true;
                        // particleSystemManager.createShipExplosion(playerSelf.model.position.x, playerSelf.model.position.y); 
                    }
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
        alien.update(elapsedTime); 
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
        // render each of the asteroids
        for (let a in asteroidManager.asteroids) {
            let asteroid = asteroidManager.asteroids[a];
            if (asteroid) {
                renderer.Asteroid.render(asteroid, asteroidTexture);
            }
        }
        for (let i in laserManager.laserArray) {
            let laser = laserManager.laserArray[i];
            if (laser) {
                renderer.Laser.render(laser, laserTexture);
            }
        }
        // render any ongoing particle effects
        renderer.ParticleSystemManager.render(particleSystemManager);
        // render main player
        renderer.Player.render(playerSelf.model, playerSelf.texture);
        // render all other players
        for (let id in playerOthers) {
            let player = playerOthers[id];
            renderer.PlayerRemote.render(player.model, player.texture);
        }
        renderer.PlayerRemote.render(alien, alienTexture);
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
       
        asteroidManager = components.AsteroidManager({
            maxSize: 200,
            minSize: 65,
            maxSpeed: 100,
            minSpeed: 50,
            interval: 1, // seconds
            maxAsteroids: 12,
            initialAsteroids: 8
        });

        alien = components.AlienShips(); 

        particleSystemManager = components.ParticleSystemManager({});

        laserManager = components.LaserManager({
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

        playerSelf = {
            model: components.Player(),
            texture: MyGame.assets['player-self']
        };

        messageHistory = MyGame.utilities.Queue();
        // Create the keyboard input handler and register the keyboard commands
        // Get the game loop started
    }

    function run() {
        console.log("run called");
        // clear the background so the rest of the screen is black
        let body = document.getElementById('id-body');
        body.style.background = 'none';
        body.style.backgroundColor = 'rgb(0, 0, 0)'; 

        // default settings. If the user has any settings saved to the browser, 
        // the defaults will be overridden 
        let defaultSettings = {
            move: 'ArrowUp',
            rotateRight: 'ArrowRight',
            rotateLeft: 'ArrowLeft',
            fire: ' ',
            hyperspace: 'z'
        }

        let settings = defaultSettings;
        let settingsJson = window.localStorage.getItem('asteroidSettings');
        if (settingsJson) {
            settings = JSON.parse(settingsJson);
            console.log('Player settings: ', settings);
        } else { console.log('Player settings: using defaults'); }
        if (!settings.move || !settings.rotateRight || !settings.rotateLeft || !settings.fire || !settings.hyperspace) {
            console.log('Error: invalid settings!', settings);
            console.log('Restoring default settings');
            settings = defaultSettings;
            let settingsJson = JSON.stringify(settings);
            console.log('Json', settingsJson);
            window.localStorage.setItem('asteroidSettings', settingsJson);
        }

        myKeyboard = input.Keyboard();

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
            settings.move, true);


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
            settings.rotateRight, true);

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
            settings.rotateLeft, true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'hyperspace'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
            //particleSystemManager.createHyperspaceEffect(playerSelf.model.position.x, playerSelf.model.position.y, 7); 
            if (performance.now() - playerSelf.model.lastHyperspaceTime > 5000) {
                let avoid = [];
                avoid.push(asteroidManager.asteroids);
                avoid.push(laserManager.laserArray);
                playerSelf.model.hyperspace(avoid, MyGame.components.Viewport.worldSize, particleSystemManager);
            }
        },
            settings.hyperspace, true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: 'fire'
            };
            socket.emit('input', message);
            messageHistory.enqueue(message);
            if (laserManager.accumulatedTime > laserManager.fireRate) {
                laserManager.generateNewLaser(playerSelf.model.position.x, playerSelf.model.position.y,
                    playerSelf.model.direction, playerSelf.model.playerId);
            }
        },
            settings.fire, true);

        // send the player's nickname to the server
        let storageNicknameJSON = window.localStorage.getItem('nickname'); 
        let storageNickname = 'unknown'; 
        if(storageNicknameJSON) {
            storageNickname = JSON.parse(storageNicknameJSON); 
            console.log('Nickname retrieved from storage', storageNickname); 
        } else { console.log('No nickname found in storage'); }
        socket.emit('nickname', storageNickname);
 
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize,
        run: run,
    };

}(MyGame.game, MyGame.graphics, MyGame.renderer, MyGame.input, MyGame.components);
