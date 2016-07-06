
function WatercolorOval(w, h, numOval, alpha) {
    this.w = w / 2;
    this.h = h / 2;

    this.alpha = (alpha !== undefined) ? alpha: 0.01;
    this.numOval = numOval;

    this.graphics = new PIXI.Graphics();
    this.container = new PIXI.Container();
    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0xff0000);
    this.mask.drawEllipse(0, 0, this.w, this.h);
    this.mask.endFill();

    this.container.addChild(this.mask);
    this.container.addChild(this.graphics);
    this.container.mask = this.mask;

    this.fadeImg;
}

function distance(dx, dy) {
    return Math.max(
        1 - 3 * Math.pow(Math.hypot(dx * 2, dy), 1.2),
        0
    );
}

function frand(min_, max_) {
    return Math.random() * (max_ - min_) + min_;
}


WatercolorOval.prototype.draw = function(renderer) {

    this.graphics.clear();
    var r, g, b,
        dx, dy, x, y,
        q,
        ow, oh;
    var w = this.w,
        h = this.h;

    for (var i = 0; i < this.numOval; i++) {
        r = frand(0.1, 0.4);
        g = frand(0.6, 0.7);
        b = frand(0.8, 1.0);
        this.graphics.beginFill(PIXI.utils.rgb2hex([r, g, b]), this.alpha);

        dx = frand(-0.2, 0.2);
        dy = frand(-0.2, 0.2);
        q = distance(dx, dy);

        x = w * dx;
        y = h * dx;

        if (q <= 0.0) {
            continue;
        }
        ow = w * g * q * 2.5;
        oh = h * g * q * 2.5;

        this.graphics.drawEllipse(x, y, ow, oh);
        this.graphics.endFill();
    }

    // this.fadeImg = new PIXI.Sprite(this.container.generateTexture(renderer));
};





window.onload = function() {

    var stats = new Stats();
    stats.setMode(0);
	  stats.domElement.style.position = "absolute";
    document.body.appendChild(stats.domElement);

    var w = 480, h = 480;
    var I = 6, J = 4;
    var renderer = PIXI.autoDetectRenderer(
        w, h,
        {
            antialias: true,
            backgroundColor: 0xfafafa,
            resolution: window.devicePixelRatio,
            autoResize: true
        }
    );
    document.body.appendChild(renderer.view);

    var container = new PIXI.Container();
    container.interactive = true;

    container.position.x = 0;
    container.position.y = 0;

    var numOval, oval, index, oval_list = [];
    for (var j = 0; j < J; j++) {
        for (var i = 0; i < I; i++) {
            numOval = 6 + 4 * (i + j * I + 1);
            oval = new WatercolorOval(w / I * 0.95, h / J * 0.95, numOval);
            oval.container.position.x = (i + 0.5) * w / I;
            oval.container.position.y = (j + 0.5) * h / J;
            container.addChild(oval.container);
            oval_list.push(oval);
        }
    }

    animate();

    function animate() {
        stats.begin();

        for (var i = 0; i < oval_list.length; i++) {
            oval_list[i].draw(renderer);
        }
        //var img = new PIXI.Sprite(container.generateTexture(renderer));
        renderer.render(container);
        requestAnimationFrame(animate);
        stats.end();
    }

}
