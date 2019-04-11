// ------------------------------------------------------------------
//
// Rendering function for a Player object.
//
// ------------------------------------------------------------------
MyGame.renderer.Tiles = (function (graphics) {
    'use strict';
    let that = {};
    let canvases = ["viewport"];

    // ------------------------------------------------------------------
    //
    // Renders a Player model.
    //
    // ------------------------------------------------------------------
    that.render = function (tile, texture) {
        console.log('Rendering a tile'); 
        graphics.saveContext();
        graphics.drawImage(texture, tile.position, tile.size, canvases);
        graphics.restoreContext();
    };

    return that;

}(MyGame.graphics));
