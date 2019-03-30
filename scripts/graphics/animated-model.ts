/// <reference path="./graphics.ts" />
import Settings from "../settings";
import Object from "../objects/object";

export default class AnimatedModel {
    private animationTime: number = 0;
    private subImageIndex: number = 0;
    private image: Graphics.Texture;
    private count: number = 0;

    constructor(private object: Object, src: string, private spriteCount: number, private spriteTime: number[], private times = null){
        this.image = new Graphics.Texture({
            src: src,
            center: {x: 0, y: 0},
            subTextureIndex: 0,
            onload: () => { this.image.spec.subTextureWidth = this.image.getWidth() / this.spriteCount; console.log(this.image) }
        });
    }

    public isDone(): boolean {
        return this.count >= this.times;
    }

    public update(elapsedTime) {
        this.animationTime += elapsedTime;

        if (this.animationTime >= this.spriteTime[this.subImageIndex]) {
            this.animationTime -= this.spriteTime[this.subImageIndex];
            this.subImageIndex += 1;

            this.subImageIndex = this.subImageIndex % this.spriteCount;

            if(this.subImageIndex == 0) {
                this.count++;
            }
        }
    }

    public render() {
        this.image.spec.center = this.object.getCenter();
        this.image.spec.rotation = this.object.getRotation();
        this.image.spec.size = this.object.getSize();
        this.image.spec.subTextureIndex = this.subImageIndex;
        this.image.draw();
    }
}
