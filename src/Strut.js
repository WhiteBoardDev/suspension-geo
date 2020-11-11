import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';

//stuck at some constant angle from wheel assembly
export default class Strut {
    constructor(container, wheelAssembly, boundedVehiclePointProvider, angleOnKnuckle, isFront, isLeft) {
        this.isFront = isFront;
        this.isLeft = isLeft;
        this.container = container;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.angleOnKnuckle = angleOnKnuckle;
        this.wheelAssembly = wheelAssembly;
        this.measurements = []; //TODO
    }

    testConstraintsAndAdjust() {
        if(!this.constraintsMet()) {
            const angleOnKnuckle = this.angleOnKnuckle;
            const boundedVehiclePoint = this.boundedVehiclePointProvider();
            var strutAngle = geometric.lineAngle([ this.wheelAssembly.getJoints()[0], boundedVehiclePoint]) + 90;
            var expectedCamber = strutAngle - angleOnKnuckle;
            this.wheelAssembly.setCamber(expectedCamber);
            return false;
        }
        return true;
    }

    getDisplayName() {
        var result = "Strut ";
        if(this.isLeft) {
            result += "Left ";
        } else {
            result += "Right ";
        }
        if(this.isFront) {
            result += "Front ";
        }else {
            result += "Rear ";
        }

        return result;
    }

    render() {
        const container = this.container;
        const graphics = new PIXI.Graphics();
        const wheelAssembly = this.wheelAssembly;
        const boundedVehiclePoint = this.boundedVehiclePointProvider();

        if(this.graphics) {
            container.removeChild(this.graphics);      
        }
        this.graphics = graphics;

        //strut shape
        const topKnucklePoint = wheelAssembly.getJoints()[0];
        graphics.lineStyle(3, 0xFADDFF, 1);
        graphics.moveTo(boundedVehiclePoint[0], boundedVehiclePoint[1]);
        graphics.lineTo(topKnucklePoint[0], topKnucklePoint[1]);

        container.addChild(graphics);
    }

    constraintsMet() {
            const strutAngle = geometric.lineAngle([ this.wheelAssembly.getJoints()[0], this.boundedVehiclePointProvider()]) + 90;
            const expectedCamber = strutAngle - this.angleOnKnuckle;
            const actualCamber = this.wheelAssembly.getCamber();
            return expectedCamber.toFixed(3) === actualCamber.toFixed(3)
    }

}
