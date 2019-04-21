//------------------------------------------------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function() {
    'use strict';
    let player = {}; // object that will be returned 
    let position = {
        x: 0,
        y: 0
    };
    let size = {
        width: 0.05,
        height: 0.05
    };
    let direction = 0;
    let rotateRate = 0;
    let thrustRate = 0.0000004;
    let momentum = {
        x: 0,
        y: 0
    }
    let maxSpeed = .1;
    let lastHyperspaceTime = 0; 
    let lastLaserTime = 0; 
    let score = 0; 
    let inGame = true; 
    let hasShield = true;
    // let currentPowerUp = "";

    Object.defineProperty(player, 'thrustRate', {
        get: () => thrustRate,
        set: value => { thrustRate = value; }
    });
    Object.defineProperty(player, 'maxSpeed', {
        get: () => maxSpeed
    });
    Object.defineProperty(player, 'momentum', {
        get: () => momentum,
    });
    Object.defineProperty(player, 'direction', {
        get: () => direction,
        set: (value) => { direction = value }
    });

    Object.defineProperty(player, 'rotateRate', {
        get: () => rotateRate,
        set: value => { rotateRate = value; }
    });

    Object.defineProperty(player, 'position', {
        get: () => position
    });

    Object.defineProperty(player, 'size', {
        get: () => size
    });

    Object.defineProperty(player, 'radius', {
        get: () => (size.width / 2)
    });

    Object.defineProperty(player, 'lastHyperspaceTime', {
        get: () => lastHyperspaceTime,
        set: value => lastHyperspaceTime = value
    });

    Object.defineProperty(player, 'lastLaserTime', {
        get: () => lastLaserTime,
        set: value => lastLaserTime = value
    });

    Object.defineProperty(player, 'score', {
        get: () => score,
        set: value => score = value
    });

    Object.defineProperty(player, 'inGame', {
        get: () => inGame,
        set: value => inGame = value
    });

    Object.defineProperty(player, 'hasShield', {
        get: () => hasShield,
        set: value => hasShield = value
    });
    // Object.defineProperty(currentPowerUp, 'currPowerUp', {
    //     get: () => currentPowerUp,
    //     set: value => currentPowerUp = value
    // });


    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    player.move = function(elapsedTime) {
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

        momentum.x += (vectorX * thrustRate * elapsedTime);
        momentum.y += (vectorY * thrustRate * elapsedTime);
        // if(momentum.x > maxSpeed)
        // {
        //     momentum.x = maxSpeed;
        // }
        // if(momentum.x < 0-maxSpeed)
        // {
        //     momentum.x = maxSpeed;
        // }
        
        // if(momentum.y > maxSpeed)
        // {
        //     momentum.y = maxSpeed;
        // }
        // if(momentum.y < 0-maxSpeed)
        // {
        //     momentum.y = maxSpeed;
        // }
        
    };

    function calculateSafety(objectsToAvoid, xPos, yPos, safetyFactor) {
        let safetyScore = 0;

        for (let o = 0; o < objectsToAvoid.length; o++) {
            for (let i = 0; i < objectsToAvoid[0].length; i++) {
                let avoid = objectsToAvoid[o][i];
                if (!avoid) {
                    break;
                }
                let additionalSafety = Math.pow(xPos - avoid.position.x, 2) + Math.pow(yPos - avoid.position.y, 2);
                if (!isNaN(additionalSafety)) {
                    safetyScore += additionalSafety;
                }
                let potentialLocation = {
                    position: {
                        x: xPos,
                        y: yPos,
                    },
                    radius: player.radius * safetyFactor
                }
                // detect if there is an asteroid within 2 * radius of the ship and break 
                if (MyGame.utilities.Collisions.detectCircleCollision(avoid, potentialLocation)) {
                    return 0;
                }
            }
        }

        let api = {
            get xPos() { return xPos; },
            get yPos() { return yPos; },
            get safetyScore() { return safetyScore; }
        }

        return api;
    }

    // ------------------------------------------------------------------
    //
    //
    // ------------------------------------------------------------------ 
    let safetyFactor = 10;
    player.hyperspace = function (allObjectsToAvoid, worldSize, particleSystemManager) {
        console.log('Player hyperspace'); 
        particleSystemManager.createHyperspaceEffect(position.x, position.y); 
        player.inGame = false; 
        /*score
        let possibleLocations = [];
        // calculate the danger of each space ship location
        for (let x = 2 * size.width + 1; x < worldSize.width - (2 * size.width + 1); x += 2 * size.width) {
            for (let y = 2 * size.height + 1; y < worldSize.height - (2 * size.height + 1); y += 2 * size.height) {
                possibleLocations.push(calculateSafety(allObjectsToAvoid, x, y, safetyFactor));
            }
        }

        // set the location to the least dangerous spot 
        let mostSafe = { x: 1, y: 1, safetyScore: 0 };
        for (let d = 0; d < possibleLocations.length; d++) {
            if (possibleLocations[d].safetyScore > mostSafe.safetyScore) {
                mostSafe = possibleLocations[d];
            }
        }
        if (mostSafe.xPos && mostSafe.yPos) {
            position.x = mostSafe.xPos;
            position.y = mostSafe.yPos;
            console.log('Successful hyperspace!');
            console.log(position); 
            momentum.x = 0;
            momentum.y = 0;
            safetyFactor = 10;
            particleSystemManager.createHyperspaceEffect(position.x, position.y); 
        }
        else {
            safetyFactor--;
            if (safetyFactor > 2) {
                player.hyperspace(allObjectsToAvoid, worldSize, particleSystemManager);
            } else {
                console.log('ERROR: No safe locations for hyperspace');
                position.x = undefined;
                position.y = undefined;

                throw 'hyperspace error';
            }
        }
        */
    }

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    player.rotateRight = function(elapsedTime) {
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    player.rotateLeft = function(elapsedTime) {
        direction -= (rotateRate * elapsedTime);
    };

    player.update = function(elapsedTime) {
        position.x += momentum.x * elapsedTime;
        position.y += momentum.y * elapsedTime;

        // if the ship would leave the edge of the world, don't let it
        if (position.x - (size.width / 2) < 0) {
            position.x = size.width / 2;
            momentum.x = 0;
        }
        if (position.y - (size.height / 2) < 0) {
            position.y = (size.height / 2);
            momentum.y = 0;
        }
        if(position.x + (size.width / 2) > MyGame.components.Viewport.worldSize.width) {
            position.x = MyGame.components.Viewport.worldSize.width - (size.width / 2);
            momentum.x = 0; 
        }
        if(position.y + (size.height / 2) > MyGame.components.Viewport.worldSize.height) {
            position.y = MyGame.components.Viewport.worldSize.height - (size.height / 2);
            momentum.y = 0; 
        }
      
        // if the ship is going to leave its viewport soon, adjust the
        // viewport
        MyGame.components.Viewport.adjustViewport(position);  
    };

    return player;
};
