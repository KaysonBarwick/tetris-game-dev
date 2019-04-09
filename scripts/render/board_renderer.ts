/// <reference path="../graphics/graphics.ts" />

import BlockRenderer from "./block_renderer";
import Board from "../objects/board";

export default class BoardRenderer {
    private block_renderer = new BlockRenderer();

    public render(board: Board) {
        board.getBoard().forEach(row => {
            row.forEach(block => {
                if(block && block.getIndex().y > 1){
                    this.block_renderer.render(block);
                }
            });
        });

        board.getActiveBlocks().forEach(block => {
            if(block && block.getIndex().y > 1){
                this.block_renderer.render(block);
            }
        });

        let shadowBlocks = board.getShadowBlocks();
        // Check for blocks below active blocks
        shadowBlocks.forEach(block => {
            if(block && block.getIndex().y > 1){
                this.block_renderer.render(block, true);
            }
        });

        board.getBlockAnimator().render();
    }
}
