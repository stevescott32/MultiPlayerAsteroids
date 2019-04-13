// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require('./random');
let Collisions = require('./collisions'); 

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createPlayer(worldSize) {
    let player = {};

    let position = {
        x: random.nextDouble(),
        y: random.nextDouble()
    };
    let momentum = {
        x: 0,
        y: 0
    };

    let size = {
        width: 0.01,
        height: 0.01
    };
    let direction = random.nextDouble() * 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond


    let thrustRate = 0.0000004;         // unit acceleration per millisecond
    let reportUpdate = false;           // Indicates if this model was updated during the last update
    let lastUpdateDiff = 0;

    // define the available methods on player object

    Object.defineProperty(player, 'thrustRate', {
        get: () => thrustRate
    });
    Object.defineProperty(player, 'momentum', {
        get: () => momentum,
    });

    Object.defineProperty(player, 'direction', {
        get: () => direction
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

    Object.defineProperty(player, 'rotateRate', {
        get: () => rotateRate
    });

    Object.defineProperty(player, 'reportUpdate', {
        get: () => reportUpdate,
        set: value => reportUpdate = value
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    player.move = function (elapsedTime, updateDiff) {
        lastUpdateDiff += updateDiff;
        player.update(updateDiff, true);
        reportUpdate = true;
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
                if (Collisions.detectCircleCollision(avoid, potentialLocation)) {
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
    player.hyperspace = function (allObjectsToAvoid, worldSize) {
        let possibleLocations = [];
        // calculate the danger of each space ship location
        for (let x = 2 * size.width; x < worldSize.width - (2 * size.width); x += 2 * size.width) {
            for (let y = 2 * size.height; y < worldSize.height - (2 * size.height); y += 2 * size.height) {
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
        }
        else {
            safetyFactor--;
            if (safetyFactor > 2) {
                hyperspace(allObjectsToAvoid);
            } else {
                console.log('ERROR: No safe locations for hyperspace');
                position.x = undefined;
                position.y = undefined;

                throw 'hyperspace error';
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Rotates the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    player.rotateRight = function (elapsedTime) {
        reportUpdate = true;
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotates the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    player.rotateLeft = function (elapsedTime) {
        reportUpdate = true;
        direction -= (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    player.update = function (elapsedTime, intraUpdate) {
        if (intraUpdate === false) {
            elapsedTime -= lastUpdateDiff;
            lastUpdateDiff = 0;
        }

        position.x += (momentum.x * elapsedTime);
        position.y += (momentum.y * elapsedTime);

        console.log('Remote player updated to ' + position.x + ': ' + position.y);
        console.log('Elapsed time: ' + elapsedTime); 
        // if the ship would leave the edge of the world, don't let it
        if (position.x < 0) {
            position.x = 0;
            momentum.x = 0;
        }
        if (position.y < 0) {
            position.y = 0;
            momentum.y = 0;
        }
        if (position.x > worldSize.width) {
            position.x = worldSize.width;
            momentum.x = 0;
        }
        if (position.y > worldSize.height) {
            position.y = worldSize.height;
            momentum.y = 0;
        }
    };

    return player;
}

module.exports.create = (worldSize) => createPlayer(worldSize);
