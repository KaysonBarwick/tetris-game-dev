/// <reference path="./graphics.ts" />
import Settings from "../settings";

interface Model {
    center: {x: number, y: number},
    size: {width: number, height: number},
    rotation?: number,
}

export default class AnimatedModel {
    private animationTime: number = 0;
    private subImageIndex: number = 0;
    private image: Graphics.Texture;

    constructor(src: string, private spriteCount: number, private spriteTime: number[]){
        this.image = new Graphics.Texture({
            src: src,
            center: {x: 0, y: 0},
            subTextureIndex: 0,
            onload: () => { this.image.spec.subTextureWidth = this.image.getWidth() / this.spriteCount; console.log(this.image) }
        });
    }

    public update(elapsedTime) {
        this.animationTime += elapsedTime;

        if (this.animationTime >= this.spriteTime[this.subImageIndex]) {
            this.animationTime -= this.spriteTime[this.subImageIndex];
            this.subImageIndex += 1;

            this.subImageIndex = this.subImageIndex % this.spriteCount;
        }
    }

    public render(model: Model) {
        this.image.spec.center = { ...model.center };
        this.image.spec.rotation = model.rotation;
        this.image.spec.size = { ...model.size };
        this.image.spec.subTextureIndex = this.subImageIndex;
        this.image.draw();
    }
}
