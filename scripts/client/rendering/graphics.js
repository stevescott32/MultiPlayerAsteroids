// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let minimap = document.getElementById('canvas-minimap');
    let context = canvas.getContext('2d');
    let minimapContext = minimap.getContext('2d');

    //------------------------------------------------------------------
    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    //
    //------------------------------------------------------------------
    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.clearRect(0, 0, minimap.width, minimap.height);
        this.restore();
    };

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.clear();
        minimapContext.clear(); 
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through to save the canvas context.
    //
    //------------------------------------------------------------------
    function saveContext() {
        context.save();
        minimapContext.save(); 
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through the restore the canvas context.
    //
    //------------------------------------------------------------------
    function restoreContext() {
        context.restore();
        minimapContext.restore(); 
    }

    //------------------------------------------------------------------
    //
    // Rotate the canvas to prepare it for rendering of a rotated object.
    //
    //------------------------------------------------------------------
    function rotateCanvas(center, rotation) {
        let viewportCenter = MyGame.components.Viewport.toViewport(center); 
        context.translate(viewportCenter.x * canvas.width, viewportCenter.y * canvas.width);
        context.rotate(rotation);
        context.translate(-viewportCenter.x * canvas.width, -viewportCenter.y * canvas.width);

        let worldSize = MyGame.components.Viewport.worldSize; 
        minimapContext.translate(center.x / worldSize.width * minimap.width, 
            center.y / worldSize.height * minimap.height);
        minimapContext.rotate(rotation);
        minimapContext.translate(-center.x / worldSize.width * minimap.width, 
            -center.y / worldSize.height * minimap.height);
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage(texture, center, size) {
        let localCenter = {
            x: MyGame.components.Viewport.toViewportX(center.x) * canvas.width,
            y: MyGame.components.Viewport.toViewportY(center.y) * canvas.height
        };
        let localSize = {
            width: size.width * canvas.width,
            height: size.height * canvas.height
        };

        context.drawImage(texture,
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width,
            localSize.height);

        let worldSize = MyGame.components.Viewport.worldSize; 
        let localCenterMini = {
            x: center.x / worldSize.width * minimap.width,
            y: center.y / worldSize.height * minimap.height
        };
        let localSizeMini = {
            width: size.width / worldSize.width * minimap.width,
            height: size.height / worldSize.height * minimap.height
        };

        minimapContext.drawImage(texture,
            localCenterMini.x - localSizeMini.width / 2,
            localCenterMini.y - localSizeMini.height / 2,
            localSizeMini.width,
            localSizeMini.height);
    }

    return {
        clear: clear,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        drawImage: drawImage
    };
}());
