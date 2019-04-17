let canvas = {height: 920, width: 1080};
let bg = {height: 224, width: 256};

let pixel = {width: canvas.width / bg.width, height: canvas.height / bg.height};
let board_size = { height: 192 * pixel.height, width: 96 * pixel.width};

let controls = JSON.parse(localStorage.getItem('tetris-controls'));
if(controls == null){
    controls = {
        left: 'ArrowLeft',
        right: 'ArrowRight',
        rotate_right: 'PageUp',
        rotate_left: 'Home',
        hard_drop: 'ArrowUp',
        fast_drop: 'ArrowDown',
        pause: 'Escape'
    }
}

function setControls(action: string, key: string){
    controls[action] = key;
    localStorage.setItem('tetris-controls', JSON.stringify(controls)); 
}


let settings = {
    pixel,
    board: { height: 20, width: 10 },

    board_offset: {x: 88 * pixel.width, y: 23 * pixel.height},
    info_box: {x: 16 * pixel.width, y: 23 * pixel.height},
    next_box: {x: 192 * pixel.width, y: 31 * pixel.height },


    next_block_count: 4,
    block_respawn_delay: 500,

    fall_rate: 500,
    fall_rate_per_level: 15,
    max_level: 25,
    rows_per_level: 5,

    fast_drop_rate: 7, //extra milliseconds per millisecond

    block_size: {width: 0, height: 0},

    controls,
    setControls
};

settings.block_size.width = board_size.width / settings.board.width
settings.block_size.height = board_size.height / settings.board.height
export default settings;