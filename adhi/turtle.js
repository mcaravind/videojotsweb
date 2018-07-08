function drawLine(x1,y1,x2,y2){
    var ctx = getContext();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function setColor(html5color){
    var ctx = getContext();
    ctx.strokeStyle=html5color;
}

function setStrokeWidth(width){
    var ctx = getContext();
    ctx.lineWidth = width;
}

function doAction(response){
    var action = response.result.action;
    var params = response.result.parameters;
    if (action === 'draw.line'){
        var x1 = params['positionx']['number-integer'];
        var y1 = params['positiony']['number-integer'];
        var x2 = params['positionx1']['number-integer'];
        var y2 = params['positiony1']['number-integer'];
        drawLine(x1, y1, x2, y2);
    }
    else if (action === 'set.stroke.color'){
        var html5color = params['htmlcolor'];
        setColor(html5color);
    }
    else if (action === 'set.stroke.width'){
        var lineWidth = params['number'];
        setStrokeWidth(lineWidth);
    }
}

function getContext(){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    return ctx;
}