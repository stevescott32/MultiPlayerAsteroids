// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Player = (function(graphics) {
    'use strict';
    let that = {};
    let canvases = ["viewport", "minimap"]; 

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction, canvases);
        graphics.drawImage(texture, model.position, model.size, canvases);
        if(model.hasShield)
        {
            graphics.drawCircle(model, canvases)
        }
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
