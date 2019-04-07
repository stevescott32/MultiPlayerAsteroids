// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Asteroid = (function(graphics) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function(model, texture) {
        /*console.log('Rendering asteroid at ' + model.position.x + ': ' + model.position.y + ': ' + 
            ' size ' + model.size.height + ': ' + model.size.width);*/ 
        graphics.saveContext();
        graphics.rotateCanvas(model.position, model.direction);
        graphics.drawImage(texture, model.position, model.size);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
