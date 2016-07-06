

function HiddenPaperJS() {
    this.canvas = document.createElement('canvas');

    // [FIXME] How to set element size?
    this.canvas.width = 300;
    this.canvas.height = 500;

    this.context = this.canvas.getContext('2d');
    this._paper = new paper.PaperScope();
    this._paper.setup(this.canvas);

    var texture = PIXI.Texture.fromCanvas(this.canvas);
    this.texture = texture;

    this.resolution = 1;
    this.dirty = false;
}


HiddenPaperJS.prototype.drawCircle = function() {
    // Using multiple canvases via Paper.js
    // See http://jsfiddle.net/94RTX/2/
    paper = this._paper;   // `paper` is a global variable
    var circle = new paper.Path.Circle([53, 53], 50);
    circle.style = {
        fillColor: new paper.Color(0.1, 0.1, Math.random(), 0.34),
        strokeColor: new paper.Color(Math.random(), Math.random(), 1, 0.4)
    };
    this._paper.view.draw();

};
HiddenPaperJS.prototype.drawPath = function() {
    count = 0.01;
    var points = [
        20,    50 + Math.random() * 20,
        140,  399 + Math.random() * 50,
        101,  429 + Math.random() * 50,
        42,   473 + Math.random() * 10
    ];

    var baseBezier = new Bezier(points);
    var path = new GraduatedOutline(baseBezier);
    path.setNumDiv(23);
    var paperjs_path = path.drawOutline(
        this._paper,
        [
            [[1, 1],  0.0],
            [[16, 32],  0.03 + Math.random() * 0.2],
            [[39, 26],  0.60 + Math.random() * 0.2],
            [[1, 1],  1.0]
        ]
    );
    var f = Math.random() * 0.6 + 0.3;
    paperjs_path.style = {
        fillColor: new paper.Color(f, f, f, 0.76),
        strokeColor: new paper.Color(Math.random(), f, f, 0.6),
        strokeWidth: 4
    };

    this._paper.view.draw();
};

/*
HiddenPaperJS.prototype.updateTexture = function() {
    // https://github.com/pixijs/pixi.js/blob/81dd0c8f8b736412a478e236ca6fff7dee531a2d/src/core/text/Text.js#L427
    var texture = this._texture;
    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.crop.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.crop.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = 0;
    texture.trim.y = 0;

    texture.trim.width = texture._frame.width;
    texture.trim.height = texture._frame.height;

    texture.baseTexture.emit('update',  texture.baseTexture);
}*/


function HairStrand() {
    var numPoints = 15;
    this.points = [];
    this.ropeLength = 400 / numPoints;
    for (var i = 0; i < numPoints; i++)
    {
        this.points.push(new PIXI.Point(i * this.ropeLength, 0));
    }

    this.paper = new HiddenPaperJS();
    PIXI.mesh.Rope.call(this, this.paper.texture, this.points);

}
HairStrand.constructor = HairStrand;
HairStrand.prototype = Object.create(PIXI.mesh.Rope.prototype);

HairStrand.prototype.movePoints = function(count) {
    var p;
    for (var i = 0; i < this.points.length; i++) {
        this.points[i] = new PIXI.Point(
            i * this.ropeLength + Math.sin(count + i * 0.1) * 21,
                             Math.cos(count + i * 0.1) * 11
        );
    }
};

HairStrand.prototype.updateTransform = function(){
    PIXI.mesh.Rope.prototype.updateTransform.call(this);
};

HairStrand.prototype.renderWebGL = function (renderer)
{
    PIXI.mesh.Rope.prototype.renderWebGL.call(this, renderer);
};
HairStrand.prototype._renderCanvas = function (renderer)
{
    PIXI.mesh.Rope.prototype._renderCanvas.call(this, renderer);
};


function CharacterConfig() {
    // https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    this.numPathDiv = 6;
    this.numRotationSpeed = 15;
    this.bool = true;
    this.func = function() {
        console.log(arguments.length);
    };
    this.color = [73, 233, 255, 0.9];
}


PIXI.loader
    //.add({url: 'ref/test.svg'}, function () { console.log('test.svg');})
    .add({url: 'ref/test-photo.jpg'})
    .load(setup);


function setup() {

    // console.log("devicePixelRatio:", window.devicePixelRatio);

    // controller
    var config = new CharacterConfig();
    var gui = new dat.GUI({width: 320});
    var c1 = gui.addFolder('Test');
    var changeNumPathDiv = c1.add(config, 'numPathDiv', 2, 16).step(1);
    c1.add(config, 'numRotationSpeed', 1, 100).step(1);
    c1.add(config, 'bool', false);
    c1.add(config, 'func');
    c1.addColor(config, 'color');
    c1.open();
    gui.remember(config);

    changeNumPathDiv.onChange(function(value) {});
    changeNumPathDiv.onFinishChange(function(value) {});

    var bgSprite = new PIXI.Sprite(
        PIXI.loader.resources["ref/test-photo.jpg"].texture
    );

    // bgSprite.x = 32; bgSprite.y = 32;
    // bgSprite.anchor.set(0.5, 0.5);   // center
    bgSprite.position.set(300, 300);
    bgSprite.pivot.set(300, 300);   // center

    var stats = new Stats();
    stats.setMode(0);
	  stats.domElement.style.position = "absolute";
    document.body.appendChild(stats.domElement);

    var hairStrandArray = [], strand;
    var numHairStrands = 7;
    for (var i = 0; i < numHairStrands; i++) {
        strand = new HairStrand();
        strand.paper.drawPath();
        //strand.paper.drawCircle();
        strand.position.x = 20 + i * 70;
        strand.position.y = 260;
        strand.scale.set(1.0 / window.devicePixelRatio, 1.0 / window.devicePixelRatio);

        hairStrandArray.push(strand);
    }


    // PIXI
    var renderer = PIXI.autoDetectRenderer(
        600, 600,
        {
            antialias: true,
            backgroundColor: 0xfafafa,
            resolution: window.devicePixelRatio,
            autoResize: true
        });
    document.body.appendChild(renderer.view);

    var root = new PIXI.Container();

    /*
    var blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 2;
    bgSprite.filters = [blurFilter];
     */
    root.addChild(bgSprite);

    var text = new PIXI.Text(
        '+',
        { font: 'bold 92px Arvo',
          fill: '#f73322',
          align: 'center',
          stroke: '#ffffff',
          strokeThickness: 7 }
    );
    text.position.set(100, 550);
    text.scale.set(1.0 / window.devicePixelRatio, 1.0 / window.devicePixelRatio);
    root.addChild(text);


    for (var i = 0; i < numHairStrands; i++) {
        //root.addChild(hairStrandArray[i].paper);
        root.addChild(hairStrandArray[i]);
    }

    //console.log(bgSprite.parent.toGlobal(bgSprite.position));
    console.log(bgSprite.getGlobalPosition());

    /*
     tiger.toLocal(tiger.position, hedgehog).x
     tiger.toLocal(tiger.position, hedgehog).y
     */

    renderer.render(root);

    var count = 0.0;

    animate();

    function animate() {
        stats.begin();

        count += config.numRotationSpeed / 100.0;
        text.rotation = count / 10.0;
        //blurFilter.blur = 1 + Math.sin(3.141592 * count / 10.0) * 1;

        for (var i = 0; i < numHairStrands; i++) {
            hairStrandArray[i].movePoints(count + i * 1.3);
        }

        // var img = new PIXI.Sprite(container.generateTexture(renderer));
        renderer.render(root);
        requestAnimationFrame(animate);
        stats.end();
    }

}


window.onload = function() {
}
