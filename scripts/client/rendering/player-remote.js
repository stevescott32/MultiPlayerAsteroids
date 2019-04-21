// ------------------------------------------------------------------
//
// Rendering function for a PlayerRemote object.
//
// ------------------------------------------------------------------
MyGame.renderer.PlayerRemote = (function(graphics) {
    'use strict';
    let that = {};
    let canvases = ["viewport", "minimap"]; 

    // ------------------------------------------------------------------
    //
    // Renders a PlayerRemote model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        graphics.saveContext();
        graphics.rotateCanvas(model.state.position, model.state.direction, canvases);
        graphics.drawImage(texture, model.state.position, model.size, canvases);
        if(model.hasShield)
        {
            graphics.drawCircle(model,canvases);
        }
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
