//------------------------------------------------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function() {
    'use strict';
    let that = {};
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
    let speed = 0;
    let thrust = 0.001;
    let directionVector = {
        x: 0,
        y: 0
    }
    let maxSpeed = .1;

    Object.defineProperty(that, 'thrust', {
        get: () => thrust
    });
    Object.defineProperty(that, 'maxSpeed', {
        get: () => maxSpeed
    });
    Object.defineProperty(that, 'directionVector', {
        get: () => directionVector,
    });
    Object.defineProperty(that, 'direction', {
        get: () => direction,
        set: (value) => { direction = value }
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed,
        set: value => { speed = value; }
    });

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate,
        set: value => { rotateRate = value; }
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    that.move = function(elapsedTime) {
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
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        direction -= (rotateRate * elapsedTime);
    };

    that.update = function(elapsedTime) {
        position.x +=directionVector.x * elapsedTime/100;
        position.y += directionVector.y * elapsedTime/100;
      
    };

    return that;
};
