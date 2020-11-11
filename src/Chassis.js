import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';

export default class Chassis {
    constructor(container) {
        const vehHeight = 400
        const vehWidthTop = 400
        const vehWidthBottom = 225
        this.angle = 0;
        this.container = container;
        this.vehOrigin = [350, 300];
        this.measurements = []; //TODO
        const thisRef = this;

        
        this.joints = [
            // 0 - top left
            [ this.vehOrigin[0], this.vehOrigin[1]]
           
        ];
        // 1 - top right
        this.joints.push([this.joints[0][0] + vehWidthTop, this.joints[0][1]]);
        // 2 - lower left
        this.joints.push([this.joints[0][0] + ((vehWidthTop - vehWidthBottom) /2), this.joints[0][1] + vehHeight]);
         // 3 - lower right   
        this.joints.push( [this.joints[2][0] + vehWidthBottom, this.joints[2][1]]);

        this.joints.forEach( function(value, index, array) {
            const rotated = geometric.pointRotate(value, thisRef.angle, thisRef.vehOrigin)
            array[index] = rotated;
        });        
    }

    testConstraintsAndAdjust() { return true; }
    getDisplayName() { return "Chassis"; }
    getJoints() {
        return this.joints;
    }

    render() {
        const graphics = new PIXI.Graphics();
        if(this.graphics) {
            this.container.removeChild(this.graphics);
        }
        this.graphics = graphics;
        graphics.beginFill(0xFF3300);
        graphics.lineStyle(4, 0xffd900, 1);
        graphics.moveTo(this.joints[0][0], this.joints[0][1]);
        graphics.lineTo(this.joints[1][0], this.joints[1][1]);
        graphics.lineTo(this.joints[3][0], this.joints[3][1]);
        graphics.lineTo(this.joints[2][0], this.joints[2][1]);
        graphics.closePath();
        graphics.endFill();
        this.container.addChild(graphics)
    }
}
