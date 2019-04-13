MyGame.renderer.Laser = (function(graphics) {
    'use strict';
    let that = {};
    let canvases = ["viewport", "minimap"]; 
    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        /*console.log('Rendering asteroid at ' + model.position.x + ': ' + model.position.y + ': ' + 
            ' size ' + model.size.height + ': ' + model.size.width);*/ 
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction, canvases);
        graphics.drawImage(texture, model.position, model.size, canvases);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));