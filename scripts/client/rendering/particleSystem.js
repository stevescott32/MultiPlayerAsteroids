MyGame.renderer.ParticleSystemManager = (function(graphics) {
    'use strict';
    let canvases = ["viewport", "minimap"]; 

    function renderSingleEffect(effect) {
        function render() {
            if (effect.isReady && !effect.isDead()) {
                Object.getOwnPropertyNames(effect.particles).forEach(function (value) {
                    let particle = effect.particles[value];
                    graphics.drawImage(effect.image, particle.position, particle.size, canvases);
                });
            }
        }

        let api = {
            render: render
        };

        return api;
    }

    function render(particleSystemManager) {
        let effects = particleSystemManager.effects; 
        for(let e = 0; e < effects.length; e++) {
            let effect = effects[e]; 
            renderSingleEffect(effect).render(); 
        }
    }

    return {
        render: render
    };
}(MyGame.graphics))
