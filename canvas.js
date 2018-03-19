function Canvas(name,width,height){
  this.canvas = document.createElement('canvas');
  this.canvas.id = name;
  this.canvas.width = width;
  this.canvas.height = height;
  this.context = this.canvas.getContext("2d");

}

Canvas.prototype.convertToPercent=function (pixelSet){
  var newPixelSet= new Array(256);
  newPixelSet.fill(0);
  var maxPixel = Math.max.apply(null,pixelSet);
  for(var i =0 ; i<256;i++){
    newPixelSet[i]=pixelSet[i]/maxPixel;
  }
  return newPixelSet;
}
Canvas.prototype.setHistText=function(text,font,x,y){
  this.context.font = font;
  this.context.fillText(text,x,y);
  this.context.stroke();
}
Canvas.prototype.drawImgHist=function (pixelSet,colorCode,y){
  this.context.beginPath();
  var transformedPixelSet = this.convertToPercent(pixelSet);
  for(var i=0;i<256;i++){
    this.context.moveTo(10+i,y);
    this.context.lineTo(10+i,y-transformedPixelSet[i]*100);
  }
  this.context.strokeStyle=colorCode;
  this.context.stroke();
}
Canvas.prototype.drawCoordinateLine = function(x,y,width,length){
  this.context.moveTo(x,y);
  this.context.lineTo(x,y+length);
  this.context.lineTo(x+width,y+length);
  this.context.stroke();
}
Canvas.prototype.createContainer = function (className){
  var newContainer = document.createElement('div');
  newContainer.className=className;
  this.container=newContainer;
  return newContainer;
}
