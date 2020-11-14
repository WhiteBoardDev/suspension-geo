import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';
import { v4 as uuidv4 } from 'uuid';


export default class Ground {
    constructor(container) {
        this.container = container;
        this.groundYAxis = 900;
    }

    render() {
            
        const graphics = new PIXI.Graphics();

        if(this.graphics) {
            this.container.removeChild(this.graphics);      
        }
        this.graphics = graphics;


          //hub center
          graphics.lineStyle(4, 0xe000000, 0.3, 1);
          graphics.moveTo(-1000,this.groundYAxis );
          graphics.lineTo(4000, this.groundYAxis);

          this.container.addChild(graphics);
    }
}