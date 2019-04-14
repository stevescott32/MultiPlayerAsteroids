MyGame.renderer.ParticleSystemManager = (function(graphics) {
    'use strict';
    let canvases = ["viewport", "minimap"]; 

    let logs = 0; 
    function renderSingleEffect(effect) {
        function render() {
            if(effect.isDead && logs < 10) { console.log('Dead effect'); }
            if (effect.isReady /*&& !effect.isDead()*/) {
                Object.getOwnPropertyNames(effect.particles).forEach(function (value) {
                    let particle = effect.particles[value];
                    graphics.drawImage(effect.image, particle.position, particle.size, canvases);
                    if(logs < 10) {
                        //console.log('Just rendered a particle, ol chap'); 
                        //console.log('Rendered effect: ', effect); 
                        console.log('Rendered particle: ', particle); 
                        logs++; 
                    }
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
//        console.log('Effects length: ' + effects.length); 
        for(let e = 0; e < effects.length; e++) {
            let effect = effects[e]; 
            renderSingleEffect(effect).render(); 
        }
    }

    return {
        render: render
    };
}(MyGame.graphics))
