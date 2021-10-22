(function(){

    var parentEl = document.body,
        newCanvas = document.createElement('canvas'),
        winWidth = document.documentElement.clientWidth,
        winHeight = document.documentElement.clientHeight;

    newCanvas.setAttribute('width', winWidth);
    newCanvas.setAttribute('height', winHeight);
    newCanvas.setAttribute('id', 'canvas');
    newCanvas.getContext('2d');
    parentEl.appendChild(newCanvas);

    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),

        side = winWidth / 10,       // side
        steps = 50,                 // animation steps
        x = winWidth / 2,           // start X
        y = 40,                     // start Y

        R = side * Math.sqrt(3)/3,  // circle radius
        m = 1.29,                   // amendment to Beziers curves
        deltaM = 2 * 0.435 / steps, // increment for Bezier curves, range 1.29 - 0.84

        startColor = randomColor(),
        endColor = randomColor(),
        startColorStep = 0,
        currentScroll = window.pageYOffset || document.documentElement.scrollTop,
        startTouchScroll = 0,
        currentTouchScroll = 0,
        endTouchScroll = 0;

    draw(x, y, side, steps, currentScroll);

    document.addEventListener('scroll', function(){
        var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        draw(x, y, side, steps, currentScroll);
    }, false);


    document.addEventListener('touchstart', function(e) {
        var touchObj = e.changedTouches[0];

        startTouchScroll = parseInt(touchObj.clientY) + endTouchScroll;
        e.preventDefault();
    }, false);

    document.addEventListener('touchmove', function(e) {
        var touchObj = e.changedTouches[0];

        currentTouchScroll = startTouchScroll - parseInt(touchObj.clientY);
        if (currentTouchScroll >= 0 && currentTouchScroll <= document.documentElement.scrollHeight - document.documentElement.clientHeight) {
            draw(x, y, side, steps, currentTouchScroll);
            endTouchScroll = currentTouchScroll;
        }
        e.preventDefault();
    }, false);

    function draw(x, y, side, steps, currentScroll){

        var maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight,
            dh = maxScroll / steps,
            step = Math.round(currentScroll/dh),
            dy = y + Math.round((winHeight - y - 2*side) * step / steps),

            square = {
                X0 : x,
                Y0 : dy,
                X1 : x + side / Math.sqrt(2),
                Y1 : dy + side / Math.sqrt(2),
                X2 : x,
                Y2 : dy + 2 * side / Math.sqrt(2),
                X3 : x - side / Math.sqrt(2),
                Y3 : dy + side / Math.sqrt(2)
            },

            triangle = {
                X0 : x,
                Y0 : dy,
                X1 : x + side / 2,
                Y1 : dy + side * Math.sqrt(3) / 2,
                X2 : x,
                Y2 : dy + side * Math.sqrt(3) / 2,
                X3 : x - side / 2,
                Y3 : dy + side * Math.sqrt(3) / 2
            },

            delta = createDelta(square, triangle, steps);

        colorMixer(step);

        if ( step <= steps / 2 ) {
            squareToTriangle( square, delta, 2 * step );
        }
        else {
            triangleToCircle( dy, step - steps / 2 );
        }

    }

    function createDelta(square, triangle, steps) {

        var obj = {};

        for (var key in square) {
            obj[key] = (triangle[key] - square[key]) / steps;
        }
        return obj;
    }

    function makeSquare(square) {
        context.beginPath();
        context.moveTo( square.X0, square.Y0 );
        context.lineTo( square.X1, square.Y1 );
        context.lineTo( square.X2, square.Y2 );
        context.lineTo( square.X3, square.Y3 );
        context.closePath();
        context.stroke();
        context.fill();
    }

    function makeSpline(x, y, R, k, m) {
        context.beginPath();
        context.moveTo(x,y);
        context.bezierCurveTo(
            x + Math.cos( Math.PI/180*50 )* (R + k * ( 1 - m)),
            y + R - Math.sin( Math.PI/180*50 )* (R + k * ( 1 - m)),

            x + Math.cos( Math.PI/180*10 )* (R + k * ( 1 - m)),
            y + R - Math.sin( Math.PI/180*10 )* (R + k * ( 1 - m)),

            x + k/2,
            y + k * Math.sqrt(3)/2
        );

        context.bezierCurveTo(
            x + Math.cos( Math.PI/180*70 )* (R + k * ( 1 - m)),
            y + R + Math.sin( Math.PI/180*70 )* (R + k * ( 1 - m)),

            x - Math.cos( Math.PI/180*70 )* (R + k * ( 1 - m)),
            y + R + Math.sin( Math.PI/180*70 )* (R + k * ( 1 - m)),

            x - k/2,
            y + k * Math.sqrt(3)/2
        );

        context.bezierCurveTo(
            x - Math.cos( Math.PI/180*10 )* (R + k * ( 1 - m)),
            y + R - Math.sin( Math.PI/180*10 )* (R + k * ( 1 - m)),

            x - Math.cos( Math.PI/180*50 )* (R + k * ( 1 - m)),
            y + R - Math.sin( Math.PI/180*50 )* (R + k * ( 1 - m)),

            x,
            y
        );
        context.stroke();
        context.fill();
        // context.fillStyle = colorMixer();
    }

    function squareToTriangle(square, delta, step) {

        var newSquare = {};
        context.clearRect(0,0,winWidth,winHeight);

        for (var key in square) {
            newSquare[key] = square[key] + delta[key]* step;
        }

        makeSquare(newSquare);

    }

    function triangleToCircle(dy, step) {

        var newM;

        context.clearRect(0,0,winWidth,winHeight);
        newM = m - deltaM * step;

        makeSpline(x, dy, R, side, newM);

    }

    function colorMixer(step) {

        if ( Math.abs(startColorStep - step) == steps ) {

            for (var i = 0; i < 3; i++) {
                startColor[i] = endColor[i];
            }

            endColor = randomColor();
            startColorStep = step;
        }

        context.fillStyle = setInterColor(startColor, endColor, step, steps, startColorStep);

    }

    function randomColor() {
        return [Math.round( Math.random()*255 ), Math.round( Math.random()*255 ), Math.round( Math.random()*255 )];
    }

    function setInterColor(color1, color2, step, steps, startColorStep) {
        var delta = '#';

        for (var i = 0; i < 3; i++) {

            if (color1[i] >= color2[i]) {
                delta += ( color1[i] - Math.round( (color1[i] - color2[i]) * Math.abs(startColorStep - step) / steps ) ).toString(16);
            }
            else {
                delta += ( color1[i] + Math.round( (color2[i] - color1[i]) * Math.abs(startColorStep - step) / steps ) ).toString(16);
            }
        }

        return delta;
    }

})();