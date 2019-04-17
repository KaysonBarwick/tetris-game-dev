/// <reference path="../graphics/graphics.ts" />

import Block from '../objects/block';
import Animator from "../graphics/animated-model";
import Particles from "../graphics/particles";
import Audio from "../utils/audio";
import settings from '../settings';

export default class BlockAnimator {
    private pop_frames: number = 8;
    private time_per_frame: number[] = [200,200,200,200,200,200,200,500];
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
        let time_frames = this.time_per_frame.slice();
        time_frames[this.time_per_frame.length - 1] -= Math.abs(block.getIndex().x - settings.board.width / 2) * 90; // pop twoards middle
        if(block.getIndex().x > settings.board.width / 2){
            time_frames[this.time_per_frame.length - 1] += 45; // stagger left and right
        }
        time_frames[this.time_per_frame.length - 1] += (block.getIndex().y % 4) * 50; // stagger rows

        this.popBlocks.push(new Animator(block, this.sprites[block.getType()], this.pop_frames, time_frames, 1));
    }

    public isPopping(): boolean{
        return this.popBlocks.length > 0;
    }

    public update(elapsed_time: DOMHighResTimeStamp){
        this.popBlocks.forEach((animator, index) => {
            animator.update(elapsed_time);
            if(animator.isDone()){
                Particles.addBlockPop([<Block>animator.getObject()]);
                this.popBlocks.splice(index, 1);
                Audio.popped();
            }
        });
    }

    public render() {
        this.popBlocks.forEach((animator) => {
            animator.render();
        });
    }
}
