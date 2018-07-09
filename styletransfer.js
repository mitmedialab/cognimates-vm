const remix = function(){
    var stage = document.createElement('image');
    var ctx = stage.getContext('2d');
    var image = document.getElementById('source');

    ctx.drawImage(image, 33, 71, 104, 124, 21, 20, 87, 105);
}

export{
    remix
};