function Canvas(name,width,height){
  this.canvas = document.createElement('canvas');
  this.canvas.id = name;
  this.canvas.width = width;
  this.canvas.height = height;
  this.context = this.canvas.getContext("2d");

}
// Convert the object
Canvas.prototype.convertToPercent=function (pixelSet){
  var newPixelSet= new Array(256);
  newPixelSet.fill(0);
  var maxPixel = Math.max.apply(null,pixelSet);
  for(var i =0 ; i<256;i++){
    newPixelSet[i]=pixelSet[i]/maxPixel;
  }
  return newPixelSet;
}
// Set the Histogram Text on the histogram
Canvas.prototype.setHistText=function(text,font,x,y){
  this.context.font = font;
  this.context.fillText(text,x,y);
  this.context.stroke();
}
//Draw the pixel Histogram
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
//Draw the coordinate system on histogram
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
// ImageFrame object
function ImageFrame(context,width,height){
  this.context = context;
  this.imgdata=context.getImageData(0,0,width,height);
  this.width= width;
  this.height= height;
  this.r = this.arr_init();
  this.g = this.arr_init();
  this.b = this.arr_init();
  this.gray = this.arr_init();
  this.image2Darray = new Array(this.height);
  for (var i=0;i<this.height;i++){
    this.image2Darray[i]=new Array(this.width);
    for(var j=0;j<this.image2Darray[i].length;j++){
      this.image2Darray[i][j]=new Array(4);
      this.image2Darray[i][j][0]=0;
      this.image2Darray[i][j][1]=0;
      this.image2Darray[i][j][2]=0;
      this.image2Darray[i][j][3]=0;

    }
  }
}
ImageFrame.prototype.arr_init = function(){
  var array = new Array(256);
  array.fill(0);
  return array;
}
//colect the image dataframe
ImageFrame.prototype.collectRGBData = function(){
  for(var i=0;i<this.imgdata.data.length;i+=4){
    this.r[this.imgdata.data[i]]++;
    this.g[this.imgdata.data[i+1]]++;
    this.b[this.imgdata.data[i+2]]++;
  }
}
ImageFrame.prototype.convertToImgArray = function(){
  for (var i=0;i<this.height;i++){
    for(var j=0;j<this.width;j++){
      var currentPixel = this.width*i*4+j*4;
      this.image2Darray[i][j][0]=this.imgdata.data[currentPixel];
      this.image2Darray[i][j][1]=this.imgdata.data[currentPixel+1];
      this.image2Darray[i][j][2]=this.imgdata.data[currentPixel+2];
      this.image2Darray[i][j][3]=this.imgdata.data[currentPixel+3];
    }
  }
}
ImageFrame.prototype.collectGrayData = function(){
  for(var i=0;i<this.imgdata.data.length;i+=4){
    this.gray[this.imgdata.data[i]]++;
  }
}
// set the gray pixel in the image data
ImageFrame.prototype.setGrayPixel =function(imageData){
  for (var i=0;i<imageData.data.length;i+=4){
    var gray_pix_val= Math.round((29.9*imageData.data[i]+58.7*imageData.data[i+1]+11.4*imageData.data[i+2])/100);
    this.imgdata.data[i]=gray_pix_val;
    this.imgdata.data[i+1]=gray_pix_val;
    this.imgdata.data[i+2]=gray_pix_val;
    this.imgdata.data[i+3]=255;
  }
}
// convert the color image data to gray scale and return the new ImageFrame
ImageFrame.prototype.convertToGrayScale = function(context,width,hieght){
  var grayFrame = new ImageFrame(context,width,hieght);
  grayFrame.setGrayPixel(this.imgdata);
  grayFrame.collectGrayData();
  return grayFrame;
}
ImageFrame.prototype.setBinaryPixel = function(imageData,threshold){
    var black = 0;
    var white =0;
    for(var i=0;i<imageData.data.length;i+=4){
      if(imageData.data[i]>threshold){
        this.imgdata.data[i]=255;
        this.imgdata.data[i+1]=255;
        this.imgdata.data[i+2]=255;
        white++;
      }else{
        this.imgdata.data[i]=0;
        this.imgdata.data[i+1]=0;
        this.imgdata.data[i+2]=0;
        black++;
      }
      this.imgdata.data[i+3]=255;
    }
}
ImageFrame.prototype.grayToBinary = function(context,threshold,width,height){
  var binaryFrame = new ImageFrame(context,width,height);
  binaryFrame.setBinaryPixel(this.imgdata,threshold);
  binaryFrame.collectGrayData();// the binary Picture same as grayscale picture;
  return binaryFrame;
}
ImageFrame.prototype.maskCal = function(mask,x,y){
  this.image2Darray[x][y][0] = this.image2Darray[x-1][y-1][0]*mask[0][0]+this.image2Darray[x][y-1][0]*mask[0][1]+this.image2Darray[x+1][y-1][0]*mask[0][2]
  + this.image2Darray[x-1][y][0]*mask[1][0]+this.image2Darray[x][y][0]*mask[1][1]+this.image2Darray[x+1][y][0]*mask[1][2]
  +this.image2Darray[x-1][y+1][0]*mask[2][0]+this.image2Darray[x][y+1][0]*mask[2][1]+this.image2Darray[x+1][y+1][0]*mask[2][2];
  this.image2Darray[x][y][1]=this.image2Darray[x][y][0];
  this.image2Darray[x][y][2]=this.image2Darray[x][y][0];

}
ImageFrame.prototype.convolutionCal = function(mask,filter){
  var max=0;
  var min=0;
  var newImage2Darray = new Array(this.height);
  for (var i=0;i<this.height;i++){
    newImage2Darray[i]=new Array(this.width);
    for(var j=0;j<this.image2Darray[i].length;j++){
      newImage2Darray[i][j]=new Array(4);
      newImage2Darray[i][j][0]=0;
      newImage2Darray[i][j][1]=0;
      newImage2Darray[i][j][2]=0;
      newImage2Darray[i][j][3]=255;
    }
  }
  
  for(var i =1; i<this.height-1;i++){
    for(var j= 1 ;j<this.width-1;j++){
      newImage2Darray[i][j][0]=this.image2Darray[i-1][j-1][0]*mask[0][0]+this.image2Darray[i-1][j][0]*mask[0][1]+this.image2Darray[i-1][j+1][0]*mask[0][2]
      +this.image2Darray[i][j-1][0]*mask[1][0]+this.image2Darray[i][j][0]*mask[1][1]+this.image2Darray[i][j+1][0]*mask[1][2]
      +this.image2Darray[i+1][j-1][0]*mask[2][0]+this.image2Darray[i+1][j][0]*mask[2][1]+this.image2Darray[i+1][j+1][0]*mask[2][2];
      newImage2Darray[i][j][1]=newImage2Darray[i][j][0];
      newImage2Darray[i][j][2]=newImage2Darray[i][j][0];

      if(newImage2Darray[i][j][0]>max){
        max=newImage2Darray[i][j][0];
      }else if (newImage2Darray[i][j][0]<=min){
        min=newImage2Darray[i][j][0];
      }
    }
  }
  if(filter==1){
    console.log(max,min);
    for(var i =1; i<this.height-1;i++){
      for(var j= 1 ;j<this.width-1;j++){
        this.image2Darray[i][j][0]=(newImage2Darray[i][j][0]-min)*255/(max-min)
        if(this.image2Darray[i][j][0]>128){
          this.image2Darray[i][j][0]=255;
        }else{
          this.image2Darray[i][j][0]=0
        }
        this.image2Darray[i][j][1]=this.image2Darray[i][j][0];
        this.image2Darray[i][j][2]=this.image2Darray[i][j][0];
        this.imgdata.data[(i*this.width+j)*4]=this.image2Darray[i][j][0];
        this.imgdata.data[(i*this.width+j)*4+1]=this.image2Darray[i][j][0];
        this.imgdata.data[(i*this.width+j)*4+2]=this.image2Darray[i][j][0];
      }
    }
  }else{
    for(var i =1; i<this.height-1;i++){
      for(var j= 1 ;j<this.width-1;j++){
        this.image2Darray[i][j][0]=newImage2Darray[i][j][0]
        this.image2Darray[i][j][1]=this.image2Darray[i][j][0];
        this.image2Darray[i][j][2]=this.image2Darray[i][j][0];

        this.imgdata.data[(i*this.width+j)*4]=this.image2Darray[i][j][0];
        this.imgdata.data[(i*this.width+j)*4+1]=this.image2Darray[i][j][0];
        this.imgdata.data[(i*this.width+j)*4+2]=this.image2Darray[i][j][0];
      }
    }
  }
}

ImageFrame.prototype.edgeDetection = function(mask){
  var cv_result = this;
  cv_result.convolutionCal(mask);
  return cv_result;
}
//Return the imagedata in dataframe
ImageFrame.prototype.getImageData = function(){
  return this.imgdata;
}
ImageFrame.prototype.getGrayPixelData = function(){
  return this.gray;
}
ImageFrame.prototype.getRedPixelData = function(){
  return this.r;
}
ImageFrame.prototype.getGreenPixelData = function(){
  return this.g;
}
ImageFrame.prototype.getBluePixelData = function(){
  return this.b;
}
