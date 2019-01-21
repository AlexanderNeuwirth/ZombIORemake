import {ZIREntity} from "./EntityBase";
import { Vector } from "../utilityObjects/Math";

export class ZIRProjectile extends ZIREntity {
    protected cooldown : number;

    constructor(velocity : Vector, position : Vector, asset : string = "rock", cooldown : number = 1) {
        super(position, asset);
        this.velocity = velocity;
        this.mass = 1;
        this.friction = 0;
        this.cooldown = cooldown;
        setTimeout(()=>{this.kill()},2000)
    }
}