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
    constructor(private type: BlockTypes, private index: {x: number, y: number}){
        super();
    }

    public getCenter() {
        return {x: this.getIndex().x * Settings.block_size, y: this.getIndex().y * Settings.block_size};
    }

    public getSize() {
        return {height: Settings.block_size, width: Settings.block_size};
    }

    public fall(): boolean {
        this.index.y--;
        return true;
    }

    public moveRight(): boolean {
        this.index.x++;
        return true;
    }

    public moveLeft(): boolean {
        this.index.x--;
        return true;
    }

    public getType(): BlockTypes {
        return this.type;
    }

    public getIndex(): {x: number, y: number} {
        return this.index;
    }
}