// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('./random');

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
    let velocity = {
        x: 0,
        y: 0
    };

    let size = {
        width: 0.01,
        height: 0.01
    };
    let direction = random.nextDouble() * 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond
    let speed = 0.0002;                  // unit distance per millisecond
    let reportUpdate = false;    // Indicates if this model was updated during the last update

    let thrust = 0.001;
    let maxSpeed = .1;

    // define the available methods on player object
    Object.defineProperty(player, 'maxSpeed', {
        get: () => maxSpeed
    });
    Object.defineProperty(player, 'thrust', {
        get: () => thrust
    });
    Object.defineProperty(player, 'directionVector', {
        get: () => velocity,
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

    Object.defineProperty(player, 'speed', {
        get: () => speed
    })

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
    player.move = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

        velocity.x += (vectorX * thrust * elapsedTime/100);
        if(velocity.x > maxSpeed)
        {
            velocity.x = maxSpeed;
        }
        if(velocity.x < 0-maxSpeed)
        {
            velocity.x = maxSpeed;
        }
        velocity.y += (vectorY * thrust * elapsedTime/100);
        if(velocity.y > maxSpeed)
        {
            velocity.y = maxSpeed;
        }
        if(velocity.y < 0-maxSpeed)
        {
            velocity.y = maxSpeed;
        }

    };

    //------------------------------------------------------------------
    //
    // Rotates the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    player.rotateRight = function(elapsedTime) {
        reportUpdate = true;
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotates the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    player.rotateLeft = function(elapsedTime) {
        reportUpdate = true;
        direction -= (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    player.update = function(elapsedTime) {
        reportUpdate = true;
        position.x += velocity.x * elapsedTime/100;
        position.y += velocity.y * elapsedTime/100;
       
        // if the ship would leave the edge of the world, don't let it
        if(position.x < 0) { 
            position.x = 0; 
            velocity.x = 0; 
        } 
        if(position.y < 0) { 
            position.y = 0;
            velocity.y = 0; 
        }
        if(position.x > worldSize.width) {
            position.x = worldSize.width;
            velocity.x = 0; 
        }
        if(position.y > worldSize.height) {
            position.y = worldSize.height;
            velocity.y = 0; 
        }
    };

    return player;
}

module.exports.create = (worldSize) => createPlayer(worldSize);
