/// <reference path="../graphics/graphics.ts" />
import Settings from "../settings";

import Block from '../objects/block';
import SpriteSheet from "../graphics/sprite-sheet";

export default class NextBlockRenderer {
    private sprites = new SpriteSheet('./assets/blocks.png', 7);

    public render(blocks: Block[][]) {

        blocks.forEach((group, index) => {
            group.forEach((block) => {
                let size = block.getSize()
                let x = Settings.next_box.x + (block.getIndex().x - Math.floor(Settings.board.width / 2) + 2) * size.width;
                let y = Settings.next_box.y + (block.getIndex().y + index * 2.5) * size.height + size.height;
    
                this.sprites.render({
                    center: {x, y},
                    size: block.getSize()
                },
                block.getType());
            });
        });
    }
}
