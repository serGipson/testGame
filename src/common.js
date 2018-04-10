window.onload = function() {
    
    //Tile
    function Tile(obj) {
        PIXI.Container.call(this);
        this.conf = obj || {};
        this.create();
        this.drawElement();
        this.drawSprite();
        this.setInteractive(true);
    };
    Tile.prototype.__proto__ = PIXI.Container.prototype;
    
    Tile.prototype.create = function() {
        this.grBack = new PIXI.Graphics();
        this.gr = new PIXI.Graphics();
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.5);
        this.addChild(this.grBack);
        this.addChild(this.gr);
        this.addChild(this.sprite);
    };
    
    Tile.prototype.drawElement = function() {
        var w = this.conf.width,
            h = this.conf.height;
        this.grBack.lineStyle(0, 0x7e7e7e, 0);
        this.grBack.beginFill(0x009806, 1);
        this.grBack.drawRect(- w / 2, - h / 2, w, h);
        this.grBack.alpha = 0;
        this.grBack.normalAlpha = 0;
        this.gr.lineStyle(2, 0x7e7e7e, 1);
        this.gr.beginFill(0x000000, 0);
        this.gr.drawRect(- w / 2, - h / 2, w, h);
    };
    
    Tile.prototype.drawSprite = function() {
        if(this.conf.image) {
            var w = this.conf.width * 0.8,
                h = this.conf.height * 0.8,
                iw = this.conf.image.data.width,
                ih = this.conf.image.data.height,
                f = Math.min.apply(Math, [1, w / iw, h / ih]);
            this.sprite.scale.set(f, f);
            this.sprite.texture = this.conf.image.texture;
        } else {
            this.removeChild(this.sprite);
            this.sprite = new PIXI.Sprite();
            this.sprite.anchor.set(0.5, 0.5);
            this.addChild(this.sprite);
        }
    };
    
    Tile.prototype.setImage = function(image) {
        this.conf.image = image;
        this.drawSprite();
    };
    
    Tile.prototype.select = function() {
        this.grBack.normalAlpha = 0.4;
        this.onOut();
    };
    
    Tile.prototype.letGo = function() {
        this.grBack.normalAlpha = 0;
        this.onOut();
    };
    
    Tile.prototype.onHover = function() {
        this.grBack.alpha = 0.6;
        this.conf.callbackFunctions.pointerover(this);
    };
    
    Tile.prototype.onOut = function() {
        this.grBack.alpha = this.grBack.normalAlpha;
    };
    
    Tile.prototype.onDown = function() {
        this.conf.callbackFunctions.pointerdown(this);
    };
    
    Tile.prototype.setInteractive = function(value) {
		this.interactive = value;
		this.buttonMode = value;

		if (value) {
			this.on('pointerdown', this.onDown.bind(this))
				.on('pointerover', this.onHover.bind(this))
				.on('pointerout', this.onOut.bind(this));

		} else {
			this.removeAllListeners();
		}
	};
    
    //Game
    function Game(canvas) {
        this.canvas = canvas;
        this.sizeElements = {width: 40, height: 40};
        this.row = 10;
        this.col = 15;
        this.count = this.row * this.col;
        this.elements = [];
        this.dataElements = [];
        this.screenWidth = 800;
        this.screenHeight = 600;
        this.overElement = null;
        this.selectElements = {};
        this.types = {
            0: {},
            1: {image: "diamonds"},
            2: {image: "clubs"},
            3: {image: "hearts"},
            4: {image: "spades"}
        };
        this.countTypes = 5;
        
        this.create();
        this.loadSprite();
    };
    
    Game.prototype.create = function() {
        this.application = new PIXI.Application({
            view: this.canvas, 
            width: this.screenWidth, 
            height: this.screenHeight, 
            transparent: true
        });
        this.stage = this.application.stage;
        this.mainWrap = new PIXI.Container();
        this.mainWrap.position.set(this.screenWidth / 2, this.screenHeight / 2);
        this.stage.addChild(this.mainWrap);
    };
    
    Game.prototype.createRestartButton = function() {
        this.restartButton = new PIXI.Container();
        this.restartButton.gr = new PIXI.Graphics();
        this.restartButton.text = new PIXI.Text("RESTART");
        
        this.restartButton.text.anchor.set(0.5, 0.5);
        this.restartButton.text.style.fill = "0xffffff";
        
        this.restartButton.gr.lineStyle(0, 0x7e7e7e, 0);
        this.restartButton.gr.beginFill(0x009806, 1);
        this.restartButton.gr.drawRect(- 70, - 25, 140, 50);
        
        this.restartButton.addChild(this.restartButton.gr);
        this.restartButton.addChild(this.restartButton.text);
        this.stage.addChild(this.restartButton);
        
        this.restartButton.interactive = true;
		this.restartButton.buttonMode = true;
        this.restartButton.on('pointerdown', this.restart.bind(this));
        
        this.restartButton.position.set(this.screenWidth / 2, this.screenHeight - 50);
    };
    
    Game.prototype.loadSprite = function() {
        this.application.loader.add("diamonds", "./res/diamonds.png")
            .add("clubs", "./res/clubs.png")
            .add("hearts", "./res/hearts.png")
            .add("spades", "./res/spades.png");
        this.application.loader.load((function(e, a){
            this.start();
        }).bind(this));
    };

    Game.prototype.createElements = function(x,y) {
        var w = this.sizeElements.width,
            h = this.sizeElements.height,
            dx = - w * this.col / 2,
            dy = - h * this.row / 2;
        for(var i = 0, l = this.col; i < l; i+=1) {
            this.elements.push([]);
            for(var j = 0, k = this.row, arr = this.elements[i]; j < k; j+=1) {
                var type = this.getRandomType(),
                    elem = new Tile({
                        game: this, 
                        type: type, 
                        width: w, 
                        height: h, 
                        image: this.application.loader.resources[this.types[type].image], 
                        type: type, 
                        id: this.pointToNumber([i, j]),
                        point: [i, j],
                        callbackFunctions: {
                            pointerdown: this.clearBlock.bind(this),
                            pointerover: this.searchElemnts.bind(this)
                        }
                    });
                elem.position.set(dx + h * (i + 0.5), dy + w * (j + 0.5));
                arr.push(elem);
                this.mainWrap.addChild(elem);
            }
        }
    };
    
    Game.prototype.getRandomType = function() {
        return Math.round(Math.random() * (this.countTypes - 2) + 1);
    };

    //-----------search-----------------------------
    Game.prototype.searchElemnts = function(elem) {
        this.overElement = elem;
        
        if(!this.selectElements.hasOwnProperty(elem.conf.id)) {
            
            for(var key in this.selectElements) {
                this.selectElements[key].letGo();
            }
            this.selectElements = {};

            var elements = this.elements,
                type = elem.conf.type,
                id = elem.conf.id,
                col = this.col,
                row = this.row,
                point = elem.point,
                search = {},
                countSearch = 0,
                res = this.selectElements,
                addToSearch = function(x, y, id, path) {
                    if(x > -1 && y > -1 && x < col && y < row && elements[x][y].conf.type == type && (!res.hasOwnProperty(id))) { 
                        res[id] = elements[x][y];
                        if(!search.hasOwnProperty(id)) {
                            search[id] = {};
                            countSearch+=1;
                        }
                        search[id][path] = true;
                    }
                };

            
            countSearch+=1;
            res[id] = elem;
            search[id] = {};

            while(countSearch > 0) {
                for(var key in search) {
                    var elem = search[key],
                        id = Number(key),
                        point = this.numberToPoint(key),
                        arr = [
                            [point[0], point[1] - 1], //top
                            [point[0] + 1, point[1]], //left
                            [point[0], point[1] + 1], //bottom
                            [point[0] - 1, point[1]]  //right
                        ];
                    
                    for(var i = 0; i < 4; i+=1) {
                        if(!elem[i]) {
                            addToSearch(arr[i][0], arr[i][1], this.pointToNumber([arr[i][0], arr[i][1]]), (i + 2) % 4);
                        }
                    }
                    
                    delete search[key];
                    countSearch-=1;
                }
            }
            
            for(var key in res) {
                res[key].select();
            }
        }
    };
    //----------------------------------------------
    
    Game.prototype.clearBlock = function(elem) {
        this.searchElemnts(elem);
        for(var key in this.selectElements) {
            this.selectElements[key].letGo();
            this.selectElements[key].setImage();
            this.selectElements[key].conf.type = 0;
            this.selectElements[key].setInteractive(false);
        }
    };

    Game.prototype.numberToPoint = function(num) {
        return [Math.floor(num / this.row), num % this.row];
    };

    Game.prototype.pointToNumber = function(arr) {
        return arr[0] * this.row + arr[1];
    };

    Game.prototype.start = function() {
        this.createElements();
        
        this.createRestartButton();
    };

    Game.prototype.restart = function() {
        for(var i = 0, l = this.elements.length; i < l; i+=1) {
            for(var j = 0, arr = this.elements[i], k = arr.length; j < k; j+=1) {
                var type = this.getRandomType(),
                    elem = arr[j];
                elem.conf.type = type;
                elem.setImage(this.application.loader.resources[this.types[type].image]);
            }
        }
    };

    //code
    var game = new Game(document.getElementById("myCanvas"));
};