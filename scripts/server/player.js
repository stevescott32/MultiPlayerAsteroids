// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require('./random');
let present = require('present');
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
    let lastHyperspaceTime = present();
    let lastLaserTime = 0;
    let score = 0;
    let inGame = true;
    let nickname = 'unknown';
    let hasShield = true;
    let gotShield = present();
    // let currentPowerUp = "";

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

    Object.defineProperty(player, 'nickname', {
        get: () => nickname,
        set: value => nickname = value
    });

    Object.defineProperty(player, 'hasShield', {
        get: () => hasShield,
        set: value => hasShield = value
    });
    Object.defineProperty(player, 'gotShield', {
        get: () => gotShield,
        set: value => gotShield = value
    });

    // Object.defineProperty(currentPowerUp, 'currentPowerUp', {
    //     get: () => currentPowerUp,
    //     set: value => currentPowerUp = value
    // });

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

    player.crash = function (allObjectsToAvoid, worldSize) {
        score -= 500;
        hyperspaceHelper(allObjectsToAvoid, worldSize); 
    }

    // function to determine if the player should be allowed to hyperspace
    player.hyperspace = function (allObjectsToAvoid, worldSize) {
        if ((present() - lastHyperspaceTime) > 5000) {
            hyperspaceHelper(allObjectsToAvoid, worldSize)
            lastHyperspaceTime = present();
            return true; 
        } else {
//            console.log('Last hyperspace time: ', lastHyperspaceTime, ' Present: ', present(),
//            ' diff: ' + (present() - lastHyperspaceTime));
            return false; 
        }
    }

    // ------------------------------------------------------------------
    // function to help perform hyperspace on both player collisions and 
    // user chosen hyperspace 
    // ------------------------------------------------------------------ 
    let safetyFactor = 10;
    let hyperspaceHelper = function (allObjectsToAvoid, worldSize) {
        player.inGame = false;
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
            // console.log('Successful hyperspace!');
            // console.log(position);
            momentum.x = 0;
            momentum.y = 0;
            safetyFactor = 10;
            player.inGame = true;
            player.reportUpdate = true;
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
        if(present()-gotShield > 10000)
        {
            gotShield = 0;
            hasShield = false;
        }
        if (intraUpdate === false) {
            elapsedTime -= lastUpdateDiff;
            lastUpdateDiff = 0;
        }

        position.x += (momentum.x * elapsedTime);
        position.y += (momentum.y * elapsedTime);

        // if the ship would leave the edge of the world, don't let it
        if (position.x - (size.width / 2) < 0) {
            position.x = size.width / 2;
            momentum.x = 0;
        }
        if (position.y - (size.height / 2) < 0) {
            position.y = (size.height / 2);
            momentum.y = 0;
        }
        if (position.x + (size.width / 2) > worldSize.width) {
            position.x = worldSize.width - (size.width / 2);
            momentum.x = 0;
        }
        if (position.y + (size.height / 2) > worldSize.height) {
            position.y = worldSize.height - (size.height / 2);
            momentum.y = 0;
        }
    };

    return player;
}

module.exports.create = (worldSize) => createPlayer(worldSize);
