
window.onload = function() {
    var stats = new Stats();
    stats.setMode(0);
	  stats.domElement.style.position = "absolute";
    document.body.appendChild(stats.domElement);

    var renderer = PIXI.autoDetectRenderer(600, 600, { antialias: true });
    document.body.appendChild(renderer.view);

    var container = new PIXI.Container();
    container.interactive = true;

    container.position.x = renderer.width / 2;
    container.position.y = renderer.height / 2;

    // background
    var bg = PIXI.Sprite.fromImage('ref/test-photo.jpg');
    bg.anchor.x = 0.5;
    bg.anchor.y = 0.5;

    bg.position.x = 0;  //renderer.width / 2;
    bg.position.y = 0;  //renderer.height / 2;

    container.addChild(bg);

    // let's create a moving shape
    var thing = new PIXI.Graphics();
    container.addChild(thing);
    thing.position.x = 0;
    thing.position.y = 0;
    thing.lineStyle(1);

    container.mask = thing;

    function drawGraduatedOutlineBezier(g, count) {
        var points = [
            120 + Math.sin(count) * 20, -250 + Math.cos(count) * 20,
            240 + Math.cos(count) * 40,   99 + Math.sin(count) * 50,
            201 + Math.sin(count) * 10,  129 + Math.cos(count) * 50,
            142 + Math.cos(count) * 20,  173 + Math.sin(count) * 10
        ];

        var baseBezier = new Bezier(points);
        var path = new GraduatedOutline(baseBezier);
        path.setNumDiv(6);
        path.drawOutline(
            g,
            [
                [[16, 92],  0.0],
                [[39, 36],  0.5],
                [[1, 1],  1.0]
            ]
        );
    }

    function drawRandomComplexPath(g) {
        var r = function() { return Math.random() - 0.5;},
            w = renderer.width,
            h = renderer.height;
        g.moveTo(0, 0);
        for (var i = 0; i < 400; i++) {
            g.bezierCurveTo(r() * w * 2, r() * h * 2,
                            r() * w * 2, r() * h * 2,
                            r() * w * 2, r() * h * 2);
        }
    }

    container.on('click', onClick);
    container.on('tap', onClick);

    function onClick()
    {
        if(!container.mask) {
            container.mask = thing;
        } else {
            container.mask = null;
        }
    }

    var count = 0;
    animate();

    function animate() {
        stats.begin();

        count += 1;
        count %= 628;

        thing.clear();
        thing.beginFill(0x8bc5ff, 0.4);
        drawGraduatedOutlineBezier(thing, count * 0.10001);
        //drawRandomComplexPath(thing);
        thing.endFill();
        thing.rotation = count * 0.01;

        renderer.render(container);
        requestAnimationFrame(animate);

        stats.end();
    }

}
