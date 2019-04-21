// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function () {
    'use strict';

    let viewport = document.getElementById('canvas-main');
    let minimap = document.getElementById('canvas-minimap');
    let viewportContext = viewport.getContext('2d');
    let minimapContext = minimap.getContext('2d');

    //------------------------------------------------------------------
    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    //
    //------------------------------------------------------------------
    CanvasRenderingContext2D.prototype.clear = function () {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, viewport.width, viewport.height);
        this.clearRect(0, 0, minimap.width, minimap.height);
        this.restore();
    };

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        viewportContext.clear();
        minimapContext.clear();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through to save the canvas context.
    //
    //------------------------------------------------------------------
    function saveContext() {
        viewportContext.save();
        minimapContext.save();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through the restore the canvas context.
    //
    //------------------------------------------------------------------
    function restoreContext() {
        viewportContext.restore();
        minimapContext.restore();
    }

    //------------------------------------------------------------------
    //
    // Rotate the canvas to prepare it for rendering of a rotated object.
    //
    //------------------------------------------------------------------
    function rotateCanvas(center, rotation, canvases) {
        if (canvases.includes("viewport")) {
            let viewportCenter = MyGame.components.Viewport.toViewport(center);
            viewportContext.translate(viewportCenter.x * viewport.width, viewportCenter.y * viewport.width);
            viewportContext.rotate(rotation);
            viewportContext.translate(-viewportCenter.x * viewport.width, -viewportCenter.y * viewport.width);
        }

        if (canvases.includes("minimap")) {
            let worldSize = MyGame.components.Viewport.worldSize;
            minimapContext.translate(center.x / worldSize.width * minimap.width,
                center.y / worldSize.height * minimap.height);
            minimapContext.rotate(rotation);
            minimapContext.translate(-center.x / worldSize.width * minimap.width,
                -center.y / worldSize.height * minimap.height);
        }
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage(texture, center, size, canvases) {
        if (canvases.includes("viewport")) {
            let localCenter = {
                x: MyGame.components.Viewport.toViewportX(center.x) * viewport.width,
                y: MyGame.components.Viewport.toViewportY(center.y) * viewport.height
            };
            let localSize = {
                width: size.width * viewport.width,
                height: size.height * viewport.height
            };

            viewportContext.drawImage(texture,
                localCenter.x - localSize.width / 2,
                localCenter.y - localSize.height / 2,
                localSize.width,
                localSize.height);
        }

        if (canvases.includes("minimap")) {
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
    }

    function drawCircle(model, canvases)
    {
        if (canvases.includes("viewport")) {
            let localCenter = {
                x: MyGame.components.Viewport.toViewportX(model.position.x) * viewport.width,
                y: MyGame.components.Viewport.toViewportY(model.position.y) * viewport.height
            };
            let localSize = {
                width: model.size.width * viewport.width,
                height: model.size.height * viewport.height
            };
            viewportContext.beginPath();
            viewportContext.arc(localCenter.x,localCenter.y,localSize.width,0, 2 * Math.PI);
            viewportContext.strokeStyle = 'green'            
            viewportContext.stroke();
        }
        if(canvases.includes("minimap")){
            let localCenter = {
                x: MyGame.components.Viewport.toViewportX(model.position.x) * viewport.width,
                y: MyGame.components.Viewport.toViewportY(model.position.y) * viewport.height
            };
            let localSize = {
                width: model.size.width * viewport.width,
                height: model.size.height * viewport.height
            };
            minimapContext.beginPath();
            minimapContext.arc(localCenter.x,model.localCenter,localSize.width,0, 2 * Math.PI);
            minimapContext.strokeStyle = 'green'            
            minimapContext.stroke();
        }
       
    }

    function drawSubTexture(texture, index, subTextureWidth, center, size, canvases) {

        if (canvases.includes("viewport")) {
            let localCenter = {
                x: MyGame.components.Viewport.toViewportX(center.x) * viewport.width,
                y: MyGame.components.Viewport.toViewportY(center.y) * viewport.height
            };
            let localSize = {
                width: size.width * viewport.width,
                height: size.height * viewport.height
            };
            viewportContext.drawImage(
                texture,
                (subTextureWidth * index), 0,      // Which sub-texture to pick out
                subTextureWidth, texture.height,   // The size of the sub-texture
                localCenter.x - localSize.width / 2,
                localCenter.y - localSize.height / 2,
                localSize.width,
                localSize.height);
        }
      

        if (canvases.includes("minimap")) {
            let worldSize = MyGame.components.Viewport.worldSize;
            let localCenterMini = {
                x: center.x / worldSize.width * minimap.width,
                y: center.y / worldSize.height * minimap.height
            };
            let localSizeMini = {
                width: size.width / worldSize.width * minimap.width,
                height: size.height / worldSize.height * minimap.height
            };

            minimapContext.drawImage(
                texture,
                (subTextureWidth * index), 0,      // Which sub-texture to pick out
                subTextureWidth, texture.height,   // The size of the sub-texture
                localCenterMini.x - localSizeMini.width / 2,
                localCenterMini.y - localSizeMini.height / 2,
                localSizeMini.width,
                localSizeMini.height);
        }

        // minimapContext.translate(center.x, center.y);
        // minimapContext.translate(-center.x, -center.y);

        
        // Pick the selected sprite from the sprite sheet to render
       

        minimapContext.restore();
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawTileImage(texture, center, size, canvases) {
        if (canvases.includes("viewport")) {
            let localCenter = {
                x: MyGame.components.Viewport.toViewportX(center.x) * viewport.width,
                y: MyGame.components.Viewport.toViewportY(center.y) * viewport.height
            };
            let localSize = {
                width: size.width * viewport.width,
                height: size.height * viewport.height
            };

            viewportContext.drawImage(texture,
                localCenter.x - localSize.width / 2,
                localCenter.y - localSize.height / 2,
                1 + localSize.width,
                1 + localSize.height);
        }
    }


    return {
        clear: clear,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        drawImage: drawImage,
        drawTileImage: drawTileImage,
        drawSubTexture: drawSubTexture,
        drawCircle: drawCircle,

    };
}());
