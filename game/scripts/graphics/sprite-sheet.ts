/// <reference path="./graphics.ts" />
import Settings from "../settings";

interface Model {
    center: {x: number, y: number},
    size: {width: number, height: number},
    rotation?: number,
}

export default class SpriteSheet {
    private image: Graphics.Texture;

    constructor(src: string, private spriteCount: number){
        this.image = new Graphics.Texture({
            src: src, 
            center: {x: 0, y: 0},
            subTextureIndex: 0,
            onload: () => { this.image.spec.subTextureWidth = this.image.getWidth() / this.spriteCount; }
        });
    }

    public render(model: Model, index: number) {
        this.image.spec.center = { ...model.center };
        this.image.spec.rotation = model.rotation;
        this.image.spec.size = { ...model.size };
        this.image.spec.subTextureIndex = index;
        this.image.draw();
    }

    public setTransparency(a: number): void {
        this.image.setTransparency(a);
    }
}
