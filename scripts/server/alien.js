//------------------------------------------------------------------
//
// Model for each alien in the game.
//
//------------------------------------------------------------------
'use strict';

let random = require('./random');
let present = require('present'); 

function createAlien(spec) {
    let alien = {};
    let size = {
        width: 0.1,
        height: 0.1
    };
    let state = {
        direction: Math.PI / 4,  
        position: {
            x: random.nextDouble() * spec.worldSize.width,
            y: random.nextDouble() * spec.worldSize.height
        },
        momentum: {
            x: 0.00003,
            y: 0.00003
        }
    };
    
    let lastLaserTime = present(); 

    Object.defineProperty(alien, 'state', {
        get: () => state
    });

    Object.defineProperty(alien, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Update of the remote alien depends upon whether or not there is
    // a current goal or if the ship is just floating along.  If a current
    // goal, update is a simpler progression/interpolation from the previous 
    // state to the goal (new) state.  If it is floating along, then use
    // the momentum to update the position.
    //
    //------------------------------------------------------------------
    alien.update = function(elapsedTime) {
        // Ship is only floating along, only need to update its position
        state.position.x += (state.momentum.x * elapsedTime);
        state.position.y += (state.momentum.y * elapsedTime);
        state.direction += ((Math.PI / 400) * elapsedTime); 

        let worldSize = spec.worldSize; 

        if(state.position.x < 0 - size.width) {
            state.position.x = worldSize.width; // + size.width
        }
        if(state.position.y < 0 - size.height) {
            state.position.y = worldSize.height; //+ size.height
        }
        if(state.position.x > worldSize.width + size.width) {
            state.position.x = 0; // - size.width
        }
        if(state.position.y > worldSize.height + size.height) {
            state.position.y = 0; // - size.height
        }

        if(present() - lastLaserTime > spec.interval) {
            spec.alienLasers.generateNewLaser(state.position.x, state.position.y, state.direction, 1); 
            lastLaserTime = present(); 
        }
    };

    return alien;
};

module.exports.create = (worldSize) => createAlien(worldSize); 
