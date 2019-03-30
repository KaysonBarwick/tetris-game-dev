/// <reference path="../graphics/graphics.ts" />
import settings from '../settings';

export enum BlockTypes {
    L,
    I,
    O,
    T,
    S,
    J,
    Z
}

export default class Block {
    constructor(private type: BlockTypes, private index: {x: number, y: number}){}

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

    public Index(): {x: number, y: number} {
        return this.index;
    }
}