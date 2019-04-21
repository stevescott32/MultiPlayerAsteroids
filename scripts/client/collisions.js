
MyGame.utilities.Collisions = (function () {

    // detect whether two circles overlap
    // each object must have a radius and a position
    function detectCircleCollision(object1, object2) {
        // check to make sure the given objects are actually valid collision objects
        if (!object1 || !object2 || !object1.position || !object2.position) {
            console.log('Error! Invalid object for collision detection');
            console.log(object1);
            console.log(object2);
            return false;
        }
        let radius1 = 1; 
        let radius2 = 1; 
        // not all object have radius. if they don't, use width / 2
        if(object1.radius) { 
            radius1 = object1.radius; 
        } else { 
            radius1 = object1.size.width / 2; 
        }
        if(object2.radius) { 
            radius2 = object2.radius; 
        } else { 
            radius2 = object2.size.width / 2; 
        }

        let distanceSquared = Math.pow(object1.position.x - object2.position.x, 2) +
            Math.pow(object1.position.y - object2.position.y, 2);
        let radiusSum = radius1 + radius2;
        if (radiusSum * radiusSum > distanceSquared) {
            return true;
        }
        else {
            return false;
        }
    }

    // detect whether a point is within the radius of the circle
    // circle object must have a radius and a position
    function detectCirclePointCollision(circle, point) {
        let distanceSquared = Math.pow(circle.position.x - point.position.x, 2) +
            Math.pow(circle.position.y - point.position.y, 2);
        if (circle.radius * circle.radius > distanceSquared) {
            return true;
        }
        else {
            return false;
        }
    }
    let api = {
        detectCircleCollision: detectCircleCollision,
        detectCirclePointCollision: detectCirclePointCollision
    }

    return api;
})(); 
