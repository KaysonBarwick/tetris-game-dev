let settings = {
    board: { height: 20, width: 10 },
    board_offset: {x: 82, y: 20},
    board_width: 450,
    next_block_count: 4,
    block_respawn_delay: 500,
    fall_rate: 250,
    fall_rate_per_level: 50,

    block_size: null
};

settings.block_size = settings.board_width / settings.board.width
export default settings;