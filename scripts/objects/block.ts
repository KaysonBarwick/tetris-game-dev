/// <reference path="../graphics/graphics.ts" />
import Settings from '../settings';

import Object from './object'

export enum BlockTypes {
    L,
    I,
    O,
    T,
    S,
    J,
    Z
}

export default class Block extends Object {
    private active: boolean = true;

    constructor(private type: BlockTypes, private index: {x: number, y: number}, private group_id){
        super();
    }

    public getCenter() {
        let x = ((this.getIndex().x) * Settings.block_size.width) + (Settings.block_size.width / 2) + Settings.board_offset.x;
        let y = ((this.getIndex().y - 2) * Settings.block_size.height) + (Settings.block_size.height / 2) + Settings.board_offset.y;
        return {x, y};
    }

    public getSize() {
        return {height: Settings.block_size.height, width: Settings.block_size.width};
    }

    public fall(){
        if(this.index.y < Settings.board.height + 2){
            this.index.y++;
        }
    }

    public moveRight(){
        this.index.x++;
    }

    public moveLeft(){
        this.index.x--;
    }
    
    public getGroupID(){
        return this.group_id;
    }

    public rotateRight(topLeft: {x: number, y: number}){
        let x: number = this.index.x - topLeft.x;
        let y: number = this.index.y - topLeft.y;
        if(this.type == BlockTypes.J || this.type == BlockTypes.L || this.type == BlockTypes.S || this.type == BlockTypes.Z || this.type == BlockTypes.T){
            if(y == 0){ // Top row goes to right
                y = x;
                x = 2;
            }
            else if(y == 1){ // Middle to middle
                y = x;
                x = 1;
            }
            else if(y == 2){ // bottom to left
                y = x;
                x = 0;
            }
        }
        else if(this.type == BlockTypes.I){
            if(y == 0){ // Top row goes to right
                y = x;
                x = 3;
            }
            else if(y == 1){ // Middle top to middle right
                y = x;
                x = 2;
            }
            else if(y == 2){ // Middle bottom to middle left
                y = x;
                x = 1;
            }
            else if(y == 3){ // bottom to left
                y = x;
                x = 0;
            }
        }

        this.index.x = x + topLeft.x;
        this.index.y = y + topLeft.y;
    }

    public rotateLeft(topLeft: {x: number, y: number}){
        let x: number = this.index.x - topLeft.x;
        let y: number = this.index.y - topLeft.y;
        if(this.type == BlockTypes.J || this.type == BlockTypes.L || this.type == BlockTypes.S || this.type == BlockTypes.Z || this.type == BlockTypes.T){
            if(x == 0){ // Top row goes to left
                x = y;
                y = 2;
            }
            else if(x == 1){ // Middle to middle
                x = y;
                y = 1;
            }
            else if(x == 2){ // bottom to right
                x = y;
                y = 0;
            }
        }
        else if(this.type == BlockTypes.I){
            if(x == 0){ // Top row goes to right
                x = y;
                y = 3;
            }
            else if(x == 1){ // Middle top to middle right
                x = y;
                y = 2;
            }
            else if(x == 2){ // Middle bottom to middle left
                x = y;
                y = 1;
            }
            else if(x == 3){ // bottom to left
                x = y;
                y = 0;
            }
        }

        this.index.x = x + topLeft.x;
        this.index.y = y + topLeft.y;
    }


    public getType(): BlockTypes {
        return this.type;
    }

    public getIndex(): {x: number, y: number} {
        return this.index;
    }

    public setIndex(x: number, y: number){
        this.index.x = x;
        this.index.y = y;
    }

    public isActive(): boolean {
        return this.active;
    }

    public toggleActive(value: boolean = !this.active) {
        this.active = value;
    }

    public duplicate(): Block {
        return new Block(this.type, {...this.index}, this.group_id);
    }
}