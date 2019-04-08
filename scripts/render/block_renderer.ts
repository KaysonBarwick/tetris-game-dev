/// <reference path="../graphics/graphics.ts" />
import Settings from "../settings";

import Block from '../objects/block';
import SpriteSheet from "../graphics/sprite-sheet";

export default class BlockRenderer {
    private sprites = new SpriteSheet('./assets/blocks.png', 7);

    public render(block: Block, shadow: boolean = false) {
        if(shadow){
            this.sprites.setTransparency(0.5);
        }
        else {
            this.sprites.setTransparency(1);
        }
        this.sprites.render({
            center: block.getCenter(),
            size: block.getSize()
        },
        block.getType());
    }
}
