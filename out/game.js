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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        if (color === void 0) { color = { r: 0, g: 0, b: 0, a: 1 }; }
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
        board_offset: { x: 82, y: 20 },
        board_width: 500,
        next_block_count: 4,
        block_respawn_delay: 500,
        fall_rate: 250,
        fall_rate_per_level: 50,
        block_size: null
    };
    settings.block_size = settings.board_width / settings.board.width;
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
    function randomDouble(min, max) {
        return Math.random() * (max - min) + min;
    }
    Random.randomDouble = randomDouble;
    function randomInt(min, max) {
        return Math.floor(randomDouble(min, max));
    }
    Random.randomInt = randomInt;
    function randomCircleVector(min_angle, max_angle) {
        var _a;
        if (min_angle > max_angle) {
            _a = [max_angle, min_angle], min_angle = _a[0], max_angle = _a[1];
        }
        var angle = randomDouble(min_angle, max_angle);
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
define("objects/object", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Object = /** @class */ (function () {
        function Object() {
        }
        Object.prototype.getCenter = function () {
            return __assign({}, this.center);
        };
        Object.prototype.getSize = function () {
            return __assign({}, this.size);
        };
        Object.prototype.getRotation = function () {
            return this.rotation;
        };
        return Object;
    }());
    exports["default"] = Object;
});
define("objects/block", ["require", "exports", "settings", "objects/object"], function (require, exports, settings_1, object_1) {
    "use strict";
    exports.__esModule = true;
    var BlockTypes;
    (function (BlockTypes) {
        BlockTypes[BlockTypes["L"] = 0] = "L";
        BlockTypes[BlockTypes["I"] = 1] = "I";
        BlockTypes[BlockTypes["O"] = 2] = "O";
        BlockTypes[BlockTypes["T"] = 3] = "T";
        BlockTypes[BlockTypes["S"] = 4] = "S";
        BlockTypes[BlockTypes["J"] = 5] = "J";
        BlockTypes[BlockTypes["Z"] = 6] = "Z";
    })(BlockTypes = exports.BlockTypes || (exports.BlockTypes = {}));
    var Block = /** @class */ (function (_super) {
        __extends(Block, _super);
        function Block(type, index) {
            var _this = _super.call(this) || this;
            _this.type = type;
            _this.index = index;
            _this.active = true;
            return _this;
        }
        Block.prototype.getCenter = function () {
            var x = this.getIndex().x * settings_1["default"].block_size + settings_1["default"].board_offset.x;
            var y = (this.getIndex().y - 2) * settings_1["default"].block_size + settings_1["default"].board_offset.y;
            return { x: x, y: y };
        };
        Block.prototype.getSize = function () {
            return { height: settings_1["default"].block_size, width: settings_1["default"].block_size };
        };
        Block.prototype.fall = function () {
            this.index.y++;
        };
        Block.prototype.moveRight = function () {
            this.index.x++;
        };
        Block.prototype.moveLeft = function () {
            this.index.x--;
        };
        Block.prototype.rotateRight = function (topLeft) {
            var x = this.index.x - topLeft.x;
            var y = this.index.y - topLeft.y;
            if (this.type == BlockTypes.J || this.type == BlockTypes.L || this.type == BlockTypes.S || this.type == BlockTypes.Z || this.type == BlockTypes.T) {
                if (y == 0) { // Top row goes to right
                    y = x;
                    x = 2;
                }
                else if (y == 1) { // Middle to middle
                    y = x;
                    x = 1;
                }
                else if (y == 2) { // bottom to left
                    y = x;
                    x = 0;
                }
            }
            else if (this.type == BlockTypes.I) {
                if (y == 0) { // Top row goes to right
                    y = x;
                    x = 3;
                }
                else if (y == 1) { // Middle top to middle right
                    y = x;
                    x = 2;
                }
                else if (y == 2) { // Middle bottom to middle left
                    y = x;
                    x = 1;
                }
                else if (y == 3) { // bottom to left
                    y = x;
                    x = 0;
                }
            }
            this.index.x = x + topLeft.x;
            this.index.y = y + topLeft.y;
        };
        Block.prototype.rotateLeft = function (topLeft) {
            var x = this.index.x - topLeft.x;
            var y = this.index.y - topLeft.y;
            if (this.type == BlockTypes.J || this.type == BlockTypes.L || this.type == BlockTypes.S || this.type == BlockTypes.Z || this.type == BlockTypes.T) {
                if (x == 0) { // Top row goes to left
                    x = y;
                    y = 2;
                }
                else if (x == 1) { // Middle to middle
                    x = y;
                    y = 1;
                }
                else if (x == 2) { // bottom to right
                    x = y;
                    y = 0;
                }
            }
            else if (this.type == BlockTypes.I) {
                if (x == 0) { // Top row goes to right
                    x = y;
                    y = 3;
                }
                else if (x == 1) { // Middle top to middle right
                    x = y;
                    y = 2;
                }
                else if (x == 2) { // Middle bottom to middle left
                    x = y;
                    y = 1;
                }
                else if (x == 3) { // bottom to left
                    x = y;
                    y = 0;
                }
            }
            this.index.x = x + topLeft.x;
            this.index.y = y + topLeft.y;
        };
        Block.prototype.getType = function () {
            return this.type;
        };
        Block.prototype.getIndex = function () {
            return this.index;
        };
        Block.prototype.setIndex = function (x, y) {
            this.index.x = x;
            this.index.y = y;
        };
        Block.prototype.isActive = function () {
            return this.active;
        };
        Block.prototype.toggleActive = function (value) {
            if (value === void 0) { value = !this.active; }
            this.active = value;
        };
        return Block;
    }(object_1["default"]));
    exports["default"] = Block;
});
/// <reference path="../utils/random.ts" />
define("objects/board", ["require", "exports", "objects/block", "settings"], function (require, exports, block_1, settings_2) {
    "use strict";
    exports.__esModule = true;
    var Board = /** @class */ (function () {
        function Board(level) {
            if (level === void 0) { level = 1; }
            this.level = level;
            this.board = [];
            this.nextBlocks = [];
            this.activeBlocks = [];
            this.activeRotate = 0; // 0 = rotate 0, 1 = rotate 90, 2 = rotate 180, 3 = rotate -90
            this.fallCarryOver = 0;
            this.blockDelayCarryOver = 0;
            // board[0] and board[1] will be off screen and used to detect loss and
            // make the blocks appear to fall onto the screen.
            for (var i = 0; i <= settings_2["default"].board.height + 1; i++) {
                var row = [];
                for (var j = 0; j < settings_2["default"].board.width; j++) {
                    row.push(null);
                }
                this.board.push(row);
            }
            for (var i = 0; i < settings_2["default"].next_block_count; ++i) {
                this.nextBlocks.push(Random.randomInt(0, 6));
            }
        }
        //
        // ------------Getters------------
        Board.prototype.isActive = function () {
            return this.activeBlocks.length > 0;
        };
        Board.prototype.getBoard = function () {
            return this.board;
        };
        Board.prototype.getActiveBlocks = function () {
            return this.activeBlocks;
        };
        Board.prototype.getNextBlocks = function () {
            return this.nextBlocks;
        };
        //
        // ------------Game actions------------
        Board.prototype.update = function (elapsed_time) {
            if (this.isActive()) {
                this.fallCarryOver += elapsed_time;
                var fall_rate = settings_2["default"].fall_rate - settings_2["default"].fall_rate_per_level * this.level;
                if (this.fallCarryOver >= fall_rate) {
                    this.fallCarryOver -= fall_rate;
                    this.fall();
                }
            }
            else {
                this.blockDelayCarryOver += elapsed_time;
                if (this.blockDelayCarryOver >= settings_2["default"].block_respawn_delay) {
                    this.blockDelayCarryOver -= settings_2["default"].block_respawn_delay;
                    this.addBlock();
                }
            }
        };
        Board.prototype.nextBlock = function () {
            var next = this.nextBlocks.shift();
            this.nextBlocks.push(Random.randomInt(0, 6));
            return next;
        };
        Board.prototype.addBlock = function () {
            var type = this.nextBlock();
            var middle = Math.floor(settings_2["default"].board.width / 2);
            this.activeRotate = 0;
            this.topLeft = { x: middle - 1, y: 0 };
            switch (type) {
                case block_1.BlockTypes.L:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.L, { x: middle - 1, y: 0 }));
                    for (var i = middle - 1; i <= middle + 1; ++i) {
                        this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.L, { x: i, y: 1 }));
                    }
                    break;
                case block_1.BlockTypes.I:
                    for (var i = middle - 1; i <= middle + 2; ++i) {
                        this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.I, { x: i, y: 1 }));
                    }
                    break;
                case block_1.BlockTypes.O:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.O, { x: middle, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.O, { x: middle + 1, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.O, { x: middle, y: 1 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.O, { x: middle + 1, y: 1 }));
                    break;
                case block_1.BlockTypes.T:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.T, { x: middle, y: 0 }));
                    for (var i = middle - 1; i <= middle + 1; ++i) {
                        this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.T, { x: i, y: 1 }));
                    }
                    break;
                case block_1.BlockTypes.S:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.S, { x: middle, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.S, { x: middle + 1, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.S, { x: middle, y: 1 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.S, { x: middle - 1, y: 1 }));
                    break;
                case block_1.BlockTypes.J:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.J, { x: middle + 1, y: 0 }));
                    for (var i = middle - 1; i <= middle + 1; ++i) {
                        this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.J, { x: i, y: 1 }));
                    }
                    break;
                case block_1.BlockTypes.Z:
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.Z, { x: middle, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.Z, { x: middle - 1, y: 0 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.Z, { x: middle, y: 1 }));
                    this.activeBlocks.push(new block_1["default"](block_1.BlockTypes.Z, { x: middle + 1, y: 1 }));
                    break;
            }
        };
        Board.prototype.fall = function () {
            var _this = this;
            var active = true;
            // Check for blocks below active blocks
            this.activeBlocks.forEach(function (block) {
                var x = block.getIndex().x;
                var y = block.getIndex().y;
                if (y > settings_2["default"].board.height || _this.board[y + 1][x] != null) {
                    active = false; // Hit bottom or block beneath
                }
            });
            if (active) {
                // Make blocks fall
                this.activeBlocks.forEach(function (block) {
                    block.fall();
                });
                this.topLeft.y++;
            }
            else {
                // Deactivate blocks by moving them to board
                this.activeBlocks.forEach(function (block) {
                    _this.board[block.getIndex().y][block.getIndex().x] = block;
                });
                this.activeBlocks = [];
            }
        };
        //
        // ------------Player Actions------------
        Board.prototype.moveLeft = function () {
            var _this = this;
            var canMove = true;
            this.activeBlocks.forEach(function (block) {
                var x = block.getIndex().x;
                var y = block.getIndex().y;
                if (x < 1 || _this.board[y][x - 1] != null) {
                    canMove = false;
                }
            });
            if (canMove) {
                this.activeBlocks.forEach(function (block) {
                    block.moveLeft();
                });
                this.topLeft.x--;
            }
        };
        Board.prototype.moveRight = function () {
            var _this = this;
            var canMove = true;
            this.activeBlocks.forEach(function (block) {
                var x = block.getIndex().x;
                var y = block.getIndex().y;
                if (x >= settings_2["default"].board.width - 1 || _this.board[y][x + 1] != null) {
                    canMove = false;
                }
            });
            if (canMove) {
                this.activeBlocks.forEach(function (block) {
                    block.moveRight();
                });
                this.topLeft.x++;
            }
        };
        Board.prototype.rotateRight = function () {
            //let type = this.activeBlocks[0].getType();
            var _this = this;
            //let next_active: Block[] = this.activeBlocks.slice();
            // let next_rotate: number = this.activeRotate + 1 % 4;
            // let success: boolean = false;
            // if(type == BlockTypes.I){
            // }
            // else if(type == BlockTypes.J || type == BlockTypes.L || type == BlockTypes.S || type == BlockTypes.Z || type == BlockTypes.T){
            // }
            // else if(type == BlockTypes.O){
            //     success = true;
            // }
            // if(success){
            //     this.activeBlocks = next_active;
            //     this.activeRotate = next_rotate;
            // }
            this.activeBlocks.forEach(function (block) {
                block.rotateRight(_this.topLeft);
            });
        };
        Board.prototype.rotateLeft = function () {
            var _this = this;
            this.activeBlocks.forEach(function (block) {
                block.rotateLeft(_this.topLeft);
            });
        };
        Board.prototype.fastDrop = function (elapsed_time) {
        };
        Board.prototype.hardDrop = function () {
        };
        return Board;
    }());
    exports["default"] = Board;
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
define("render/block_renderer", ["require", "exports", "graphics/sprite-sheet"], function (require, exports, sprite_sheet_1) {
    "use strict";
    exports.__esModule = true;
    var BlockRenderer = /** @class */ (function () {
        function BlockRenderer() {
            this.sprites = new sprite_sheet_1["default"]('./assets/blocks.png', 7);
        }
        BlockRenderer.prototype.render = function (block) {
            this.sprites.render({
                center: block.getCenter(),
                size: block.getSize()
            }, block.getType());
        };
        return BlockRenderer;
    }());
    exports["default"] = BlockRenderer;
});
define("graphics/animated-model", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var AnimatedModel = /** @class */ (function () {
        function AnimatedModel(object, src, spriteCount, spriteTime, times) {
            if (times === void 0) { times = null; }
            var _this = this;
            this.object = object;
            this.spriteCount = spriteCount;
            this.spriteTime = spriteTime;
            this.times = times;
            this.animationTime = 0;
            this.subImageIndex = 0;
            this.count = 0;
            this.image = new Graphics.Texture({
                src: src,
                center: { x: 0, y: 0 },
                subTextureIndex: 0,
                onload: function () { _this.image.spec.subTextureWidth = _this.image.getWidth() / _this.spriteCount; console.log(_this.image); }
            });
        }
        AnimatedModel.prototype.isDone = function () {
            return this.count >= this.times;
        };
        AnimatedModel.prototype.update = function (elapsedTime) {
            this.animationTime += elapsedTime;
            if (this.animationTime >= this.spriteTime[this.subImageIndex]) {
                this.animationTime -= this.spriteTime[this.subImageIndex];
                this.subImageIndex += 1;
                this.subImageIndex = this.subImageIndex % this.spriteCount;
                if (this.subImageIndex == 0) {
                    this.count++;
                }
            }
        };
        AnimatedModel.prototype.render = function () {
            this.image.spec.center = this.object.getCenter();
            this.image.spec.rotation = this.object.getRotation();
            this.image.spec.size = this.object.getSize();
            this.image.spec.subTextureIndex = this.subImageIndex;
            this.image.draw();
        };
        return AnimatedModel;
    }());
    exports["default"] = AnimatedModel;
});
define("render/block_animator", ["require", "exports", "graphics/animated-model"], function (require, exports, animated_model_1) {
    "use strict";
    exports.__esModule = true;
    var BlockRenderer = /** @class */ (function () {
        function BlockRenderer() {
            this.pop_frames = 8;
            this.time_per_frame = [200, 200, 200, 200, 200, 200, 200, 250];
            this.sprites = [
                './assets/blocks/green_pop_animation.png',
                './assets/blocks/purple_pop_animation.png',
                './assets/blocks/red_pop_animation.png',
                './assets/blocks/yellow_pop_animation.png',
                './assets/blocks/blue_pop_animation.png',
                './assets/blocks/dark_blue_pop_animation.png',
                './assets/blocks/grey_pop_animation.png',
            ];
            this.popBlocks = [];
        }
        BlockRenderer.prototype.popBlock = function (block) {
            this.popBlocks.push(new animated_model_1["default"](block, this.sprites[block.getType()], this.pop_frames, this.time_per_frame, 1));
        };
        BlockRenderer.prototype.update = function (elapsed_time) {
            var _this = this;
            this.popBlocks.forEach(function (animator, index) {
                animator.update(elapsed_time);
                if (animator.isDone()) {
                    _this.popBlocks.splice(index, 1);
                    // Add pop particals here
                }
            });
        };
        BlockRenderer.prototype.render = function () {
            this.popBlocks.forEach(function (animator) {
                animator.render();
            });
        };
        return BlockRenderer;
    }());
    exports["default"] = BlockRenderer;
});
/// <reference path="../graphics/graphics.ts" />
define("render/board_renderer", ["require", "exports", "render/block_renderer"], function (require, exports, block_renderer_1) {
    "use strict";
    exports.__esModule = true;
    var BoardRenderer = /** @class */ (function () {
        function BoardRenderer() {
            this.block_renderer = new block_renderer_1["default"]();
        }
        BoardRenderer.prototype.render = function (board) {
            var _this = this;
            board.getBoard().forEach(function (row) {
                row.forEach(function (block) {
                    if (block && block.getIndex().y > 1) {
                        _this.block_renderer.render(block);
                    }
                });
            });
            board.getActiveBlocks().forEach(function (block) {
                if (block && block.getIndex().y > 1) {
                    _this.block_renderer.render(block);
                }
            });
        };
        return BoardRenderer;
    }());
    exports["default"] = BoardRenderer;
});
/// <reference path="./graphics/graphics.ts" />
/// <reference path="./utils/screens.ts" />
define("game", ["require", "exports", "utils/input", "utils/scores", "utils/timer", "graphics/particles", "objects/block", "objects/board", "render/block_renderer", "render/block_animator", "render/board_renderer"], function (require, exports, input_1, scores_1, timer_1, particles_1, block_2, board_1, block_renderer_2, block_animator_1, board_renderer_1) {
    "use strict";
    exports.__esModule = true;
    var Game;
    (function (Game) {
        var prevTime;
        var nextFrame = false;
        var elapsedTime = 0;
        var input = new input_1["default"]();
        var timer = new timer_1["default"]('div-timer');
        var block_renderer = new block_renderer_2["default"]();
        var block_animator = new block_animator_1["default"]();
        var board_renderer = new board_renderer_1["default"]();
        var board = new board_1["default"]();
        var block = new block_2["default"](block_2.BlockTypes.I, { x: 1, y: 1 });
        var block2 = new block_2["default"](block_2.BlockTypes.J, { x: 2, y: 1 });
        var block3 = new block_2["default"](block_2.BlockTypes.S, { x: 3, y: 1 });
        var block4 = new block_2["default"](block_2.BlockTypes.Z, { x: 4, y: 1 });
        var block5 = new block_2["default"](block_2.BlockTypes.L, { x: 5, y: 1 });
        var block6 = new block_2["default"](block_2.BlockTypes.O, { x: 6, y: 1 });
        var block7 = new block_2["default"](block_2.BlockTypes.T, { x: 7, y: 1 });
        block_animator.popBlock(block2);
        block_animator.popBlock(block3);
        block_animator.popBlock(block4);
        block_animator.popBlock(block5);
        block_animator.popBlock(block6);
        block_animator.popBlock(block7);
        input.register_press('ArrowUp', function () { return board.hardDrop(); });
        input.register_press('ArrowDown', function () { return board.fastDrop(elapsedTime); });
        input.register_press('ArrowLeft', function () { return board.moveLeft(); });
        input.register_press('ArrowRight', function () { return board.moveRight(); });
        input.register_press('w', function () { return board.hardDrop(); });
        input.register_press('s', function () { return board.fastDrop(elapsedTime); });
        input.register_press('a', function () { return board.moveLeft(); });
        input.register_press('d', function () { return board.moveRight(); });
        input.register_press('q', function () { return board.rotateLeft(); });
        input.register_press('e', function () { return board.rotateRight(); });
        input.register_press('Escape', function () { return pause(); });
        function init() {
            scores_1["default"].resetScore();
            timer.resetTime();
        }
        function run() {
            // (<HTMLAudioElement>document.getElementById('myMusic')).play();
            nextFrame = true;
            prevTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
        function pause() {
            nextFrame = false;
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
            board.update(elapsedTime);
            particles_1["default"].update(elapsedTime);
            block_animator.update(elapsedTime);
            timer.updateTime(elapsedTime);
        }
        function render() {
            Graphics.clear();
            block_animator.render();
            block_renderer.render(block);
            board_renderer.render(board);
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
