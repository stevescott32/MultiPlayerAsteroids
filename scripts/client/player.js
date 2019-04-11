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
        position.x +=(momentum.x * elapsedTime);
        position.y += (momentum.y * elapsedTime);
      
    };

    return player;
};
