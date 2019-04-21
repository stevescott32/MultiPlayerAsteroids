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
        height: 5,
        width: 5
    }

    // the x and y coordinate of the upper left corner of the viewpoint 
    // window. Defaulted to (0, 0), will change and adjust as the player
    // moves
    let viewport = {
        x: 0,
        y: 0
    }

    let boundary = 0.33; 
    let slideFactor = 1; 
    
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

    // check if the given position is within the viewport 
    function inViewport(position) {
        if(position.x > viewport.x && position.y > viewport.y &&
            position.x < viewport.x + 1 && position.y < viewport.y + 1) {
                return true; 
        } else { return false; }
    }

    function inBoundary(position) {
        if(position.x > viewport.x + boundary && position.y > viewport.y + boundary &&
            position.x < viewport.x + 1 - boundary && position.y < viewport.y + 1 - boundary) {
                return true; 
        } else { return false; }
    }

    function adjustViewport(position) {
        let playerVectorViewport = toViewport(position); 
        let boundary = MyGame.components.Viewport.boundary; 
        if(slideFactor > 1 && inBoundary(position)) { slideFactor = 1; }
        if(!inViewport(position)) { slideFactor = 18; }

        if(playerVectorViewport.x > (1 - boundary) && position.x < worldSize.width - (0 * boundary)) {
            shiftX((playerVectorViewport.x - (1 - boundary)) / slideFactor); 
        }
        if(playerVectorViewport.y > (1 - boundary) && position.y < worldSize.height - 0 * boundary) {
            shiftY((playerVectorViewport.y - (1 - boundary)) / slideFactor); 
        }
        if(playerVectorViewport.x < boundary && position.x > 0 * boundary) {
            shiftX((-1 * (boundary - playerVectorViewport.x)) / slideFactor); 
        }
        if(playerVectorViewport.y < boundary && position.y > 0 * boundary) {
            shiftY((-1 * (boundary - playerVectorViewport.y)) / slideFactor); 
        }
    }

    let api = {
        toViewport: toViewport,
        toViewportX: toViewportX,
        toViewportY: toViewportY,
        shiftX: shiftX,
        shiftY: shiftY,
        inViewport: inViewport, 
        adjustViewport: adjustViewport, 
        get worldSize() { return worldSize; },
        set worldSize(inWorldSize) { 
            console.log('Worldsize set to ' + worldSize.x + ': ' + worldSize.y);  
            worldSize = inWorldSize; 
        },
        get viewport() { return viewport; },
        get boundary() { return boundary; }
    }

    return api; 
})(); 
