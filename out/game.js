var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Graphics;
(function (Graphics) {
    Graphics.canvas = document.getElementById('canvas-game');
    var context = Graphics.canvas.getContext('2d');
    function getBoardDim() {
        return { width: Graphics.canvas.width, height: Graphics.canvas.height };
    }
    Graphics.getBoardDim = getBoardDim;
    function clear() {
        context.clearRect(0, 0, Graphics.canvas.width, Graphics.canvas.height);
    }
    Graphics.clear = clear;
    function drawRectangle(dim, color) {
        context.save();
        context.fillStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
        context.strokeStyle = 'rgba(0, 0, 0, 1)';
        context.lineWidth = 1;
        context.fillRect(dim.x, dim.y, dim.width, dim.height);
        context.strokeRect(dim.x + 0.5, dim.y + 0.5, dim.width, dim.height);
        context.restore();
    }
    Graphics.drawRectangle = drawRectangle;
    function drawLine(start, end) {
        context.save();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
        context.restore();
    }
    Graphics.drawLine = drawLine;
    function drawTexture(image, index, subTextureWidth, center, rotation, size) {
        context.save();
        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);
        //
        // Pick the selected sprite from the sprite sheet to render
        context.drawImage(image, subTextureWidth * index, 0, // Which sub-texture to pick out
        subTextureWidth, image.height, // The size of the sub-texture
        center.x - size.x / 2, center.y - size.y / 2, size.x, size.y);
        context.restore();
    }
    Graphics.drawTexture = drawTexture;
    var Texture = /** @class */ (function () {
        function Texture(spec) {
            var _this = this;
            this.spec = spec;
            this.ready = false;
            this.image = new Image();
            this.image.src = spec.src;
            this.image.onload = function () {
                _this.ready = true;
                _this.spec.onload();
            };
        }
        Texture.prototype.getWidth = function () {
            return this.image.width;
        };
        Texture.prototype.getHeight = function () {
            return this.image.height;
        };
        Texture.prototype.draw = function () {
            if (this.ready) {
                context.save();
                var x = this.spec.center.x;
                var y = this.spec.center.y;
                var h = this.image.height;
                var w = this.image.width;
                if (this.spec.size) {
                    h = this.spec.size.height;
                    w = this.spec.size.width;
                }
                if (!this.spec.rotation) {
                    this.spec.rotation = 0;
                }
                if (this.spec.subTextureIndex == null || this.spec.subTextureWidth == null) {
                    this.spec.subTextureIndex = 0;
                    this.spec.subTextureWidth = this.spec.size.width;
                }
                context.translate(x, y);
                context.rotate(this.spec.rotation);
                context.translate(-x, -y);
                context.drawImage(this.image, this.spec.subTextureWidth * this.spec.subTextureIndex, 0, this.spec.subTextureWidth, this.getHeight(), x - w / 2, y - h / 2, h, w);
                context.restore();
            }
        };
        return Texture;
    }());
    Graphics.Texture = Texture;
    var zoomFactor = 1;
    function zoom(zoom) {
        context.scale(zoom, zoom);
        zoomFactor *= zoom;
    }
    Graphics.zoom = zoom;
    function unzoom() {
        context.scale(1 / zoomFactor, 1 / zoomFactor);
        zoomFactor = 1;
    }
    Graphics.unzoom = unzoom;
    var panX = 0;
    var panY = 0;
    function pan(x, y) {
        panX += x;
        panY += y;
        context.translate(x, y);
    }
    Graphics.pan = pan;
    function unpan() {
        context.translate(-panX, -panY);
        panX = 0;
        panY = 0;
    }
    Graphics.unpan = unpan;
    function drawCircle(pos, radius) {
        context.save();
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        context.stroke();
        context.stroke;
        context.restore();
    }
    Graphics.drawCircle = drawCircle;
})(Graphics || (Graphics = {}));
var Screens;
(function (Screens) {
    var screens = {};
    function showSubScreen(id) {
        var screen = screens[id];
        if (screen) {
            document.getElementById(id).classList.add('sub-active');
        }
    }
    Screens.showSubScreen = showSubScreen;
    function showScreen(id) {
        for (var screen_1 in screens) {
            var div = document.getElementById(screens[screen_1].id);
            div.classList.remove('sub-active');
            div.classList.remove('active');
        }
        var screen = screens[id];
        if (screen) {
            document.getElementById(id).classList.add('active');
            if (screen.run) {
                screen.run();
            }
        }
    }
    Screens.showScreen = showScreen;
    function addScreen(screen) {
        if (document.getElementById(screen.id) == null) {
            console.warn("Screen div not found. id: ", screen.id);
        }
        screens[screen.id] = screen;
        if (screen.init) {
            screen.init();
        }
    }
    Screens.addScreen = addScreen;
    Screens.addScreen({ id: 'screen-options', init: function () { }, run: function () { } });
    document.getElementById('button-options').addEventListener('click', function () { return Screens.showScreen('screen-options'); });
    document.getElementById('button-back-options').addEventListener('click', function () { return Screens.showScreen('screen-main-menu'); });
    Screens.addScreen({ id: 'screen-credits', init: function () { }, run: function () { } });
    document.getElementById('button-credits').addEventListener('click', function () { return Screens.showScreen('screen-credits'); });
    document.getElementById('button-back-credits').addEventListener('click', function () { return Screens.showScreen('screen-main-menu'); });
    Screens.addScreen({ id: 'screen-main-menu' });
    Screens.showScreen('screen-main-menu');
})(Screens || (Screens = {}));
define("settings", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var settings = {
        board: { height: 20, width: 10 },
        board_offset: 82,
        block_size: 10
    };
    exports["default"] = settings;
});
define("utils/input", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Input = /** @class */ (function () {
        function Input() {
            var _this = this;
            this.my_keys = {};
            this.handlers = {};
            this.press_handlers = {};
            window.addEventListener('keydown', function (e) { return _this.onKeydown(e); });
            window.addEventListener('keyup', function (e) { return _this.onKeyup(e); });
        }
        Input.prototype.onKeydown = function (e) {
            this.my_keys[e.key] = e.timeStamp;
        };
        Input.prototype.onKeyup = function (e) {
            delete this.my_keys[e.key];
        };
        Input.prototype.register_hold = function (key, handler) {
            this.handlers[key] = handler;
        };
        Input.prototype.register_press = function (key, handler) {
            this.press_handlers[key] = handler;
        };
        Input.prototype.update = function (elapsed_time) {
            // Update held buttons
            for (var key in this.my_keys) {
                if (this.my_keys.hasOwnProperty(key)) {
                    if (this.handlers[key]) {
                        this.handlers[key](elapsed_time);
                    }
                    if (this.press_handlers[key]) {
                        this.press_handlers[key](elapsed_time);
                        delete this.my_keys[key];
                    }
                }
            }
        };
        Input.prototype.getHandlers = function () {
            return this.handlers;
        };
        Input.prototype.getKeys = function () {
            return this.my_keys;
        };
        return Input;
    }());
    exports["default"] = Input;
});
/// <reference path="screens.ts" />
define("utils/scores", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Score = /** @class */ (function () {
        function Score(id) {
            this.id = id;
            this.score = 0;
            this.highscores = [];
            var item = JSON.parse(localStorage.getItem(this.id));
            if (item) {
                this.highscores = item;
            }
            this.scoreLabel = document.getElementById(this.id);
            if (this.scoreLabel == null) {
                console.warn("No score div found for id:", this.id);
            }
            this.scoreLabel.innerHTML = '0';
        }
        Score.prototype.addScore = function (points) {
            this.score += points;
            this.scoreLabel.innerHTML = this.score.toString();
        };
        Score.prototype.saveScore = function (score) {
            if (score === void 0) { score = this.score; }
            var position = 0;
            while (score < this.highscores[position] && position < this.highscores.length) {
                position++;
            }
            this.highscores.splice(position, 0, score);
            this.highscores = this.highscores.slice(0, 5);
            localStorage.setItem(this.id, JSON.stringify(this.highscores));
            return position + 1;
        };
        Score.prototype.resetScore = function () {
            this.score = 0;
            this.scoreLabel.innerHTML = this.score.toString();
        };
        Score.prototype.getScore = function () {
            return this.score;
        };
        Score.prototype.getHighscores = function () {
            return this.highscores;
        };
        Score.prototype.updateHighscore = function (id) {
            var highScoreContainer = document.getElementById(id);
            if (highScoreContainer == null) {
                console.warn("No highscore div found for id:", id);
            }
            highScoreContainer.innerHTML = '';
            for (var i = 1; i <= 5; ++i) {
                var highScore = document.createElement('div');
                var currScore = 0;
                if (this.highscores[i - 1]) {
                    currScore = this.highscores[i - 1];
                }
                highScore.innerHTML = i.toString() + ": " + currScore;
                highScoreContainer.appendChild(highScore);
            }
        };
        return Score;
    }());
    exports.Score = Score;
    var score = new Score('div-score');
    Screens.addScreen({ id: 'screen-highscores', init: function () { }, run: function () { score.updateHighscore('highscores'); } });
    document.getElementById('button-highscores').addEventListener('click', function () { return Screens.showScreen('screen-highscores'); });
    document.getElementById('button-back-highscores').addEventListener('click', function () { return Screens.showScreen('screen-main-menu'); });
    exports["default"] = score;
});
define("utils/timer", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Timer = /** @class */ (function () {
        function Timer(id) {
            this.time = 0;
            this.passed_time = 0;
            this.timeLabel = document.getElementById(id);
            if (this.timeLabel == null) {
                console.warn("Time div not found with id:", id);
            }
            this.timeLabel.innerHTML = '0';
        }
        Timer.prototype.updateTime = function (elapsedTime) {
            this.passed_time += elapsedTime;
            if (this.passed_time >= 1000) {
                this.passed_time -= 1000;
                this.time++;
                this.timeLabel.innerHTML = this.time.toString();
            }
        };
        Timer.prototype.resetTime = function () {
            this.time = 0;
            this.passed_time = 0;
            this.timeLabel.innerHTML = this.time.toString();
        };
        return Timer;
    }());
    exports["default"] = Timer;
});
var Random;
(function (Random) {
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
    Random.random = random;
    function randomCircleVector(min_angle, max_angle) {
        var _a;
        if (min_angle > max_angle) {
            _a = [max_angle, min_angle], min_angle = _a[0], max_angle = _a[1];
        }
        var angle = random(min_angle, max_angle);
        return {
            x: Math.sin(angle),
            y: -Math.cos(angle)
        };
    }
    Random.randomCircleVector = randomCircleVector;
    // ~~~~~ Provided by Dean Methias ~~~~~
    //
    // This is used to give a small performance optimization in generating gaussian random numbers.
    var usePrevious = false;
    var y2;
    //
    // Generate a normally distributed random number.
    //
    // NOTE: This code is adapted from a wiki reference I found a long time ago.  I originally
    // wrote the code in C# and am now converting it over to JavaScript.
    //
    function nextGaussian(mean, stdDev) {
        var x1 = 0;
        var x2 = 0;
        var y1 = 0;
        var z = 0;
        if (usePrevious) {
            usePrevious = false;
            return mean + y2 * stdDev;
        }
        usePrevious = true;
        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            z = (x1 * x1) + (x2 * x2);
        } while (z >= 1);
        z = Math.sqrt((-2 * Math.log(z)) / z);
        y1 = x1 * z;
        y2 = x2 * z;
        return mean + y1 * stdDev;
    }
    Random.nextGaussian = nextGaussian;
})(Random || (Random = {}));
/// <reference path="../utils/random.ts" />
/// <reference path="graphics.ts" />
define("graphics/particle-system", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ParticalSystem = /** @class */ (function () {
        function ParticalSystem(spec) {
            this.spec = spec;
            this.particles = [];
            this.carry_over = 0;
            this.life = 0;
            this.finish = false;
            this.spec.spawn_rate = 1 / this.spec.spawn_rate;
            this.image = new Graphics.Texture({
                src: this.spec.src,
                center: this.spec.center,
                size: { height: 0, width: 0 }
            });
        }
        ParticalSystem.prototype.create = function () {
            var size = Random.nextGaussian(this.spec.size.mean, this.spec.size.stdev);
            var p = {
                center: { x: this.spec.center.x, y: this.spec.center.y },
                size: { width: size, height: size },
                direction: Random.randomCircleVector(this.spec.angle.min, this.spec.angle.max),
                speed: Random.nextGaussian(this.spec.speed.mean, this.spec.speed.stdev),
                rotation: 0,
                lifetime: Random.nextGaussian(this.spec.lifetime.mean, this.spec.lifetime.stdev),
                alive: 0
            };
            return p;
        };
        ParticalSystem.prototype.update = function (elapsedTime) {
            var _this = this;
            elapsedTime = elapsedTime / 1000;
            this.life += elapsedTime;
            if (this.life >= this.spec.duration) {
                this.finish = true;
            }
            this.carry_over += elapsedTime;
            while (!this.finish && this.carry_over >= this.spec.spawn_rate) {
                this.carry_over -= this.spec.spawn_rate;
                this.particles.push(this.create());
            }
            this.particles.forEach(function (particle, index) {
                particle.alive += elapsedTime;
                particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
                particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
                particle.rotation += particle.speed / 500;
                if (particle.alive > particle.lifetime) {
                    _this.particles.splice(index, 1);
                }
            });
            if (this.particles.length == 0 && this.finish) {
                return false;
            }
            return true;
        };
        ParticalSystem.prototype.render = function () {
            var _this = this;
            this.particles.forEach(function (particle) {
                _this.image.spec.size = particle.size;
                _this.image.spec.rotation = particle.rotation;
                _this.image.spec.center = particle.center;
                _this.image.draw();
            });
        };
        return ParticalSystem;
    }());
    exports["default"] = ParticalSystem;
});
define("graphics/particles", ["require", "exports", "graphics/particle-system"], function (require, exports, particle_system_1) {
    "use strict";
    exports.__esModule = true;
    var Particles = /** @class */ (function () {
        function Particles() {
            this.systems = [];
        }
        Particles.prototype.addExplosion = function (center) {
            this.systems.push(new particle_system_1["default"]({
                size: { mean: 30, stdev: 10 },
                center: __assign({}, center),
                speed: { mean: 100, stdev: 30 },
                lifetime: { mean: 0.5, stdev: 0.2 },
                angle: { min: 0, max: 2 * Math.PI },
                src: './assets/fire.png',
                spawn_rate: 100,
                duration: 0.3
            }));
        };
        Particles.prototype.addThrust = function (center, angle) {
            angle += Math.PI;
            this.systems.push(new particle_system_1["default"]({
                size: { mean: 30, stdev: 10 },
                center: __assign({}, center),
                speed: { mean: 300, stdev: 100 },
                lifetime: { mean: 0.5, stdev: 0.1 },
                angle: { min: angle + Math.PI / 16, max: angle - Math.PI / 16 },
                src: './assets/fire.png',
                spawn_rate: 10,
                duration: 0.2 // seconds
            }));
        };
        Particles.prototype.addHyper = function () {
            this.systems.push(new particle_system_1["default"]({
                size: { mean: 30, stdev: 10 },
                center: { x: Graphics.canvas.width / 2, y: Graphics.canvas.height / 2 },
                speed: { mean: 100, stdev: 30 },
                lifetime: { mean: 1000, stdev: 500 },
                angle: { min: 0, max: 2 * Math.PI },
                src: './assets/fire.png',
                spawn_rate: 1 / 10,
                duration: 10 // seconds
            }));
        };
        Particles.prototype.update = function (elapsed_time) {
            var _this = this;
            this.systems.forEach(function (system, index) {
                var living = system.update(elapsed_time);
                if (!living) {
                    _this.systems.splice(index, 1);
                }
            });
        };
        Particles.prototype.render = function () {
            this.systems.forEach(function (system) { return system.render(); });
        };
        return Particles;
    }());
    exports.Particles = Particles;
    var particles = new Particles();
    exports["default"] = particles;
});
define("graphics/sprite-sheet", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var SpriteSheet = /** @class */ (function () {
        function SpriteSheet(src, spriteCount) {
            var _this = this;
            this.spriteCount = spriteCount;
            this.image = new Graphics.Texture({
                src: src,
                center: { x: 0, y: 0 },
                subTextureIndex: 0,
                onload: function () { _this.image.spec.subTextureWidth = _this.image.getWidth() / _this.spriteCount; }
            });
        }
        SpriteSheet.prototype.render = function (model, index) {
            this.image.spec.center = __assign({}, model.center);
            this.image.spec.rotation = model.rotation;
            this.image.spec.size = __assign({}, model.size);
            this.image.spec.subTextureIndex = index;
            this.image.draw();
        };
        return SpriteSheet;
    }());
    exports["default"] = SpriteSheet;
});
define("graphics/animated-model", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var AnimatedModel = /** @class */ (function () {
        function AnimatedModel(src, spriteCount, spriteTime) {
            var _this = this;
            this.spriteCount = spriteCount;
            this.spriteTime = spriteTime;
            this.animationTime = 0;
            this.subImageIndex = 0;
            this.image = new Graphics.Texture({
                src: src,
                center: { x: 0, y: 0 },
                subTextureIndex: 0,
                onload: function () { _this.image.spec.subTextureWidth = _this.image.getWidth() / _this.spriteCount; console.log(_this.image); }
            });
        }
        AnimatedModel.prototype.update = function (elapsedTime) {
            this.animationTime += elapsedTime;
            if (this.animationTime >= this.spriteTime[this.subImageIndex]) {
                this.animationTime -= this.spriteTime[this.subImageIndex];
                this.subImageIndex += 1;
                this.subImageIndex = this.subImageIndex % this.spriteCount;
            }
        };
        AnimatedModel.prototype.render = function (model) {
            this.image.spec.center = __assign({}, model.center);
            this.image.spec.rotation = model.rotation;
            this.image.spec.size = __assign({}, model.size);
            this.image.spec.subTextureIndex = this.subImageIndex;
            this.image.draw();
        };
        return AnimatedModel;
    }());
    exports["default"] = AnimatedModel;
});
/// <reference path="./graphics/graphics.ts" />
/// <reference path="./utils/screens.ts" />
define("game", ["require", "exports", "utils/input", "utils/scores", "utils/timer", "graphics/particles", "graphics/sprite-sheet", "graphics/animated-model"], function (require, exports, input_1, scores_1, timer_1, particles_1, sprite_sheet_1, animated_model_1) {
    "use strict";
    exports.__esModule = true;
    var Game;
    (function (Game) {
        var prevTime;
        var nextFrame = false;
        var elapsedTime = 0;
        var input = new input_1["default"]();
        var timer = new timer_1["default"]('div-timer');
        var sprite = new sprite_sheet_1["default"]('./assets/blocks.png', 7);
        var animation = new animated_model_1["default"]('./assets/blocks/green_pop_animation.png', 8, [200, 200, 200, 200, 200, 200, 200, 10000]);
        //input.register_hold('ArrowUp', () => player.thrust(elapsedTime));
        //input.register_hold('ArrowLeft', () => player.turnLeft(elapsedTime));
        //input.register_hold('ArrowRight', () => player.turnRight(elapsedTime));
        input.register_press('Escape', function () { return pause(); });
        function init() {
            scores_1["default"].resetScore();
            timer.resetTime();
        }
        function run() {
            // (<HTMLAudioElement>document.getElementById('myMusic')).play();
            // (<HTMLVideoElement>document.getElementById('myVideo')).play();
            nextFrame = true;
            prevTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
        function pause() {
            nextFrame = false;
            document.getElementById('myVideo').pause();
            Screens.showSubScreen('sub-screen-pause');
        }
        function quit() {
            init();
            Screens.showScreen('screen-main-menu');
        }
        function updateInput(elapsedTime) {
            input.update(elapsedTime);
        }
        function update(elapsedTime) {
            // Update Objects
            particles_1["default"].update(elapsedTime);
            timer.updateTime(elapsedTime);
            animation.update(elapsedTime);
        }
        function render() {
            Graphics.clear();
            sprite.render({ center: { x: 10, y: 10 }, size: { width: 10, height: 10 } }, 0);
            sprite.render({ center: { x: 20, y: 20 }, size: { width: 10, height: 10 } }, 1);
            sprite.render({ center: { x: 30, y: 30 }, size: { width: 10, height: 10 } }, 2);
            sprite.render({ center: { x: 40, y: 40 }, size: { width: 10, height: 10 } }, 3);
            sprite.render({ center: { x: 50, y: 50 }, size: { width: 10, height: 10 } }, 4);
            sprite.render({ center: { x: 60, y: 60 }, size: { width: 10, height: 10 } }, 5);
            sprite.render({ center: { x: 500, y: 500 }, size: { width: 100, height: 100 } }, 6);
            animation.render({ center: { x: 80, y: 80 }, size: { width: 20, height: 20 } });
            particles_1["default"].render();
        }
        function gameLoop(currTime) {
            elapsedTime = currTime - prevTime;
            updateInput(elapsedTime);
            update(elapsedTime);
            render();
            prevTime = currTime;
            if (nextFrame) {
                requestAnimationFrame(gameLoop);
            }
        }
        function gameOver() {
            scores_1["default"].saveScore();
            document.getElementById('score-final').innerHTML = 'Your score was: ' + scores_1["default"].getScore().toString();
            Screens.showSubScreen('sub-screen-gameover');
        }
        Screens.addScreen({ id: 'screen-game', init: function () { return init(); }, run: function () { return run(); } });
        document.getElementById('button-start').addEventListener('click', function () { return Screens.showScreen('screen-game'); });
        Screens.addScreen({ id: 'sub-screen-pause' });
        document.getElementById('button-resume').addEventListener('click', function () { return Screens.showScreen('screen-game'); });
        document.getElementById('button-quit').addEventListener('click', function () { return quit(); });
        Screens.addScreen({ id: 'sub-screen-gameover' });
        document.getElementById('button-replay').addEventListener('click', function () { init(); Screens.showScreen('screen-game'); });
        document.getElementById('button-highscores2').addEventListener('click', function () { Screens.showScreen('screen-highscores'); });
    })(Game || (Game = {}));
});
