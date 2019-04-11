// ------------------------------------------------------------------
//
// A component to keep track of the square where the ship can see 
// within the world. Provides ccoordinate conversions 
//
// ------------------------------------------------------------------
MyGame.components.Viewport = (function() {
    // default world size. The server should set these to different 
    // values once the game begins
    let worldSize = {
        height: 1,
        width: 1
    }

    // the x and y coordinate of the upper left corner of the viewpoint 
    // window. Defaulted to (0, 0), will change and adjust as the player
    // moves
    let viewport = {
        x: 0,
        y: 0
    }
    
    function toViewport(vector) {
        let viewportVector = {
            x: vector.x - viewport.x,
            y: vector.y - viewport.y
        }
        return viewportVector; 
    }

    function toViewportX(x) {
        return x - viewport.x; 
    }

    function toViewportY(y) {
        return y - viewport.y; 
    }

    function shiftX(value) {
        viewport.x += value; 
    }

    function shiftY(value) {
        viewport.y += value; 
    }

    let api = {
        toViewport: toViewport,
        toViewportX: toViewportX,
        toViewportY: toViewportY,
        shiftX: shiftX,
        shiftY: shiftY,
        get worldSize() { return worldSize; },
        set worldSize(inWorldSize) { 
            console.log('Worldsize set to ' + worldSize.x + ': ' + worldSize.y);  
            worldSize = inWorldSize; 
        },
        get viewport() { return viewport; },
    }

    return api; 
})(); 
