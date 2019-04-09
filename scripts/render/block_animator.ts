/// <reference path="../graphics/graphics.ts" />
import Settings from "../settings";

import Block from '../objects/block';
import Animator from "../graphics/animated-model";

export default class BlockAnimator {
    private pop_frames: number = 8;
    private time_per_frame: number[] = [200,200,200,200,200,200,200,250];
    private sprites = [
        './assets/blocks/green_pop_animation.png',
        './assets/blocks/purple_pop_animation.png',
        './assets/blocks/red_pop_animation.png',
        './assets/blocks/yellow_pop_animation.png',
        './assets/blocks/blue_pop_animation.png',
        './assets/blocks/dark_blue_pop_animation.png',
        './assets/blocks/grey_pop_animation.png',
    ];

    private popBlocks: Animator[] = [];

    public popBlock(block: Block){
        this.popBlocks.push(new Animator(block, this.sprites[block.getType()], this.pop_frames, this.time_per_frame, 1));
    }

    public isPopping(): boolean{
        return this.popBlocks.length > 0;
    }

    public update(elapsed_time: DOMHighResTimeStamp){
        this.popBlocks.forEach((animator, index) => {
            animator.update(elapsed_time);
            if(animator.isDone()){
                this.popBlocks.splice(index, 1);
                // Add pop particals here
            }
        });
    }

    public render() {
        this.popBlocks.forEach((animator) => {
            animator.render();
        });
    }
}
