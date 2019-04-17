/// <reference path="./graphics/graphics.ts" />
/// <reference path="./utils/screens.ts" />

import Settings from './settings';
import Input from './utils/input';
import Score from './utils/scores';
import Timer from './utils/timer';
import Particles from './graphics/particles';

import Board from './objects/board';
import BoardRenderer from './render/board_renderer';

import NextBlockRenderer from './render/next_block_renderer';

import score from './utils/scores';
import AI from './ai';

namespace Game {
    let character: string;
    let characters = [
        'yoshi',
        'poochy',
        'lakitu',
        'raven',
        'blargg',
        'froggy'
    ];

    let prevTime: DOMHighResTimeStamp;
    let nextFrame: boolean = false;
    let elapsedTime: DOMHighResTimeStamp = 0;
    let speedUp: number = 1;

    let input = new Input();
    let timer = new Timer('div-timer');

    let board_renderer = new BoardRenderer();
    let nextBlockRenderer = new NextBlockRenderer();

    let board = new Board();
    let ai: AI;

    let demoFlash = 1500;
    let demoFlashCarryOver = 0;

    let audioGameover = new Audio('./assets/music/gameover.mp3');
    audioGameover.addEventListener('ended', function() { //https://stackoverflow.com/questions/3273552/html5-audio-looping
        this.currentTime = 0;
        this.play();
    }, false);

    let music = new Audio('./assets/music/mainMenu.mp3');
    music.addEventListener('ended', function() { //https://stackoverflow.com/questions/3273552/html5-audio-looping
        this.currentTime = 0;
        this.play();
    }, false);

    let audio = null;
    let audioCritical = null;
    let critical = false;


    function enableInput(){
        input.register_press(Settings.controls['hard_drop'], () => board.hardDrop());
        input.register_hold(Settings.controls['fast_drop'], () => board.fastDrop(elapsedTime));
        input.register_press(Settings.controls['left'], () => board.moveLeft());
        input.register_press(Settings.controls['right'], () => board.moveRight());
        input.register_press(Settings.controls['rotate_left'], () => board.rotateLeft());
        input.register_press(Settings.controls['rotate_right'], () => board.rotateRight());
    
        input.register_press(Settings.controls['pause'], () => pause());
    }

    function disableInput(){
        input.unRegisterKey(Settings.controls['hard_drop']);
        input.unRegisterKey(Settings.controls['fast_drop']);
        input.unRegisterKey(Settings.controls['left']);
        input.unRegisterKey(Settings.controls['right']);
        input.unRegisterKey(Settings.controls['rotate_left']);
        input.unRegisterKey(Settings.controls['rotate_right']);
    
        input.unRegisterKey(Settings.controls['pause']);
    }



    let backgroundImage: Graphics.Texture;

    function interaction(){
        window.removeEventListener('keypress', interaction);
        window.removeEventListener('mousemove', interaction);
        quit();
    }

    function init(char = 'yoshi', demo = false, speed = 1){
        Score.resetScore();
        timer.resetTime();
        board = new Board();

        speedUp = speed;

        if(demo){
            ai = new AI(board);
            char = characters[Random.randomInt(0,5)];
            disableInput();

            window.addEventListener('keypress', interaction);
            window.addEventListener('mousemove', interaction);

        }
        else {
            ai  = null;
            enableInput();
        }

        character = char;
        backgroundImage = new Graphics.Texture({
            src: 'assets/player_backgrounds/' + character + '.png',
            center: {x: Graphics.canvas.width / 2, y: Graphics.canvas.height / 2},
            size: {height: Graphics.canvas.height, width: Graphics.canvas.width}
        });

        if(audio){
            audio.pause()
            audioCritical.pause();
        }
        audio = new Audio('./assets/music/' + character + '.mp3');
        audioCritical = new Audio('./assets/music/' + character + '_critical.mp3');
        audio.addEventListener('ended', function() { //https://stackoverflow.com/questions/3273552/html5-audio-looping
            this.currentTime = 0;
            this.play();
        }, false);
        audioCritical.addEventListener('ended', function() { //https://stackoverflow.com/questions/3273552/html5-audio-looping
            this.currentTime = 0;
            this.play();
        }, false);
        critical = false;
        audio.play();
    }

    function run(params: {char: string, init?: boolean, demo?: boolean, speed?: number} = {char: 'yoshi', init: false, demo: false, speed: 1}){
        music.pause();
        music.currentTime = 0;
        if(params.init){
            init(params.char, params.demo, params.speed);
        }

        nextFrame = true;
        prevTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function pause(){
        nextFrame = false;
        Screens.showSubScreen('sub-screen-pause');
    }

    function quit(){
        nextFrame = false;
        Screens.showScreen('screen-main-menu');
    }

    function leave(){
        audio.pause();
        audioCritical.pause();
    }

    function updateInput(elapsedTime: DOMHighResTimeStamp){
        if(!ai){
            input.update(elapsedTime);
        }
        if(ai){
            ai.update(elapsedTime);
        }
    }

    function update(elapsedTime: DOMHighResTimeStamp){
        // Update Objects
        demoFlashCarryOver += elapsedTime;
        demoFlashCarryOver %= demoFlash * 2;
        board.update(elapsedTime);
        Particles.update(elapsedTime);
        timer.updateTime(elapsedTime);

        if(board.isGameOver()){
            score.addScore(board.getScore());
            gameOver();
        }
    }

    function render(){
        Graphics.clear();
        backgroundImage.draw();

        let level: number | string = board.getLevel();
        if(level == Settings.max_level){
            level = 'MAX';
        }
        Graphics.writeText("Level: " + level, {x: Settings.info_box.x + Settings.pixel.width * 2, y: Settings.info_box.y + Settings.pixel.height * 6});
        Graphics.writeText("Time: " + timer.getTime(), {x: Settings.info_box.x + Settings.pixel.width * 31, y: Settings.info_box.y + Settings.pixel.height * 6});
        Graphics.writeText("Score: " + board.getScore(), {x: Settings.info_box.x + Settings.pixel.width * 2, y: Settings.info_box.y + Settings.pixel.height * 14});
        Graphics.writeText("Rows Cleared: " + board.getRowsCleared(), {x: Settings.info_box.x + Settings.pixel.width * 2, y: Settings.info_box.y + Settings.pixel.height * 22});


        nextBlockRenderer.render(board.getNextBlocks());
        board_renderer.render(board);
        Particles.render();

        if(ai && demoFlashCarryOver > demoFlash){
            Graphics.writeText("Press any key to continue", {x: Graphics.canvas.width / 2.5, y: Graphics.canvas.width / 2});
        }

        //Switch music
        if(!board.isPopping() && !board.isGameOver()){ // Make sure the board isn't popping so the switch point isn't compromised while blocks are falling.
            if(!board.isCritical()){
                critical = false;
                audioCritical.pause();
                audioCritical.currentTime = 0;;
                audio.play();
            }
            else if(board.isCritical()){
                critical = true;
                audio.pause();
                audio.currentTime = 0;
                audioCritical.play();
            }
        }
    }

    function gameLoop(currTime: DOMHighResTimeStamp){
        elapsedTime = currTime - prevTime;
        elapsedTime *= speedUp;

        updateInput(elapsedTime);
        update(elapsedTime)
        render();

        prevTime = currTime;
        if(nextFrame){
            requestAnimationFrame(gameLoop);
        }
    }

    function gameOver(){
        nextFrame = false;
        audio.pause();
        audioCritical.pause();

        (<HTMLDivElement>document.getElementById('score-final')).innerHTML = 'Your score was: ' + Score.getScore().toString();
        Screens.showSubScreen('sub-screen-gameover');
        if(ai){
            setTimeout(() => {Screens.showScreen('screen-game', {init: true, demo: true, speed: speedUp});}, 2500)
            return;
        }
        Score.saveScore();
    }

    Screens.addScreen({id: 'screen-game', init: null, run: (params) => run(params), leave: () => leave()});
    //(<HTMLDivElement>document.getElementById('button-start')).addEventListener('click', () => Screens.showScreen('screen-game'));
    (<HTMLDivElement>document.getElementById('button-demo')).addEventListener('click', () => Screens.showScreen('screen-game', {char: character, init: true, demo: true}));
    (<HTMLDivElement>document.getElementById('button-demo-speed')).addEventListener('click', () => Screens.showScreen('screen-game', {char: character, init: true, demo: true, speed: 5}));

    Screens.addScreen({id: 'sub-screen-pause'});
    (<HTMLDivElement>document.getElementById('button-resume')).addEventListener('click', () => Screens.showScreen('screen-game', {char: character, init: false}));
    (<HTMLDivElement>document.getElementById('button-quit')).addEventListener('click', () => quit());

    Screens.addScreen({id: 'sub-screen-gameover', run: () => {audioGameover.currentTime = 0; audioGameover.play()}, leave: () => audioGameover.pause() });
    (<HTMLDivElement>document.getElementById('button-replay')).addEventListener('click', () => {
        audioGameover.pause();
        audioGameover.currentTime = 0;
        Screens.showScreen('screen-game', {char: character, init: true});
    });
    (<HTMLDivElement>document.getElementById('button-highscores2')).addEventListener('click', () => {
        Screens.showScreen('screen-highscores');
        audioGameover.pause();
        audioGameover.currentTime = 0;
    });


    Screens.addScreen({id: 'screen-options', init: () => {}, run: () => {
        (<HTMLDivElement>document.getElementById('button-left')).innerHTML = 'Left: ' + Settings.controls['left'];
        (<HTMLDivElement>document.getElementById('button-right')).innerHTML = 'Right: ' + Settings.controls['right'];
        (<HTMLDivElement>document.getElementById('button-rotate-right')).innerHTML = 'Rotate Right: ' + Settings.controls['rotate_right'];
        (<HTMLDivElement>document.getElementById('button-rotate-left')).innerHTML = 'Rotate Left: ' + Settings.controls['rotate_left'];
        (<HTMLDivElement>document.getElementById('button-fast-drop')).innerHTML = 'Fast Drop: ' + Settings.controls['fast_drop'];
        (<HTMLDivElement>document.getElementById('button-hard-drop')).innerHTML = 'Hard Drop: ' + Settings.controls['hard_drop'];
        (<HTMLDivElement>document.getElementById('button-pause')).innerHTML = 'Pause: ' + Settings.controls['pause'];
    }});
    (<HTMLDivElement>document.getElementById('button-options')).addEventListener('click', () => Screens.showScreen('screen-options'));
    (<HTMLDivElement>document.getElementById('button-right')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'right'));
    (<HTMLDivElement>document.getElementById('button-left')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'left'));
    (<HTMLDivElement>document.getElementById('button-rotate-right')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'rotate_right'));
    (<HTMLDivElement>document.getElementById('button-rotate-left')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'rotate_left'));
    (<HTMLDivElement>document.getElementById('button-fast-drop')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'fast_drop'));
    (<HTMLDivElement>document.getElementById('button-hard-drop')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'hard_drop'));
    (<HTMLDivElement>document.getElementById('button-pause')).addEventListener('click', () => Screens.showScreen('sub-screen-control', 'pause'));
    (<HTMLDivElement>document.getElementById('button-back-options')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));


    function timeOut(){ Screens.showScreen('screen-game', {char: character, init: true, demo: true}); }
    let time;
    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(timeOut, 10000)
    }

    Screens.addScreen({id: 'screen-main-menu', init: () => resetTimer(), run: () => {
        music.play();
        document.onmousemove = resetTimer;
        document.onkeypress = resetTimer;
    }, leave: () => {
        document.onmousemove = null;
        document.onkeypress = null;  
        clearTimeout(time);
    }});
    Screens.showScreen('screen-main-menu');

    let control = null;
    Screens.addScreen({id: 'sub-screen-control', init: () => {}, run: (ctrl) => {
        control = ctrl;
        window.addEventListener('keyup', setKey);
    }});

    function setKey(e){
        disableInput();
        Settings.setControls(control, e.key);
        window.removeEventListener('keyup', setKey);
        Screens.showScreen('screen-options');
    }
}
