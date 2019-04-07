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
function createPlayer() {
    let that = {};

    let position = {
        x: random.nextDouble(),
        y: random.nextDouble()
    };
    let directionVector = {
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
    let laserArray = [];

    Object.defineProperty(that, 'laserArray', {
        get: () => laserArray
    });
    Object.defineProperty(that, 'maxSpeed', {
        get: () => maxSpeed
    });
    Object.defineProperty(that, 'thrust', {
        get: () => thrust
    });
    Object.defineProperty(that, 'directionVector', {
        get: () => directionVector,
    });

    Object.defineProperty(that, 'direction', {
        get: () => direction
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed
    })

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate
    });

    Object.defineProperty(that, 'reportUpdate', {
        get: () => reportUpdate,
        set: value => reportUpdate = value
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    that.move = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

        directionVector.x += (vectorX * thrust * elapsedTime/100);
        if(directionVector.x > maxSpeed)
        {
            directionVector.x = maxSpeed;
        }
        if(directionVector.x < 0-maxSpeed)
        {
            directionVector.x = maxSpeed;
        }
        directionVector.y += (vectorY * thrust * elapsedTime/100);
        if(directionVector.y > maxSpeed)
        {
            directionVector.y = maxSpeed;
        }
        if(directionVector.y < 0-maxSpeed)
        {
            directionVector.y = maxSpeed;
        }

    };

     //------------------------------------------------------------------
    //
    // Fires a laser
    //
    //------------------------------------------------------------------
    that.shoot = function(){

    }
    //------------------------------------------------------------------
    //
    // Rotates the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        reportUpdate = true;
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotates the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        reportUpdate = true;
        direction -= (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        reportUpdate = true;
        position.x += directionVector.x * elapsedTime/100;
        position.y += directionVector.y * elapsedTime/100;
       
    };

    return that;
}

module.exports.create = () => createPlayer();
