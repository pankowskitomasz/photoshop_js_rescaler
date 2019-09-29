//config
//---------------------------------------------------------
var CHANGE_QUALITY = false;
var FILE_EXT = "jpg";
var FILE_PREFIX = "rescaled_";
var FILE_SIZE_B = 1048576;
var OPTIMIZE = false;
var OUTPUT_DIR = "output";
var OUTPUT_QUALITY = 100;
//------------------------------------------------------------------
function getDocumentType(docTypeArrA,fileExtA){
    for(var i=0;i<docTypeArrA.length;i++){
        if(docTypeArrA[i].name===fileExtA){
            return docTypeArrA[i].val;
        }
    }
}
//------------------------------------------------------------------
function getFiles(fileExtA){
    var imgFolder = Folder.selectDialog("Select a folder with images");
    var fileList = imgFolder.getFiles("*."+fileExtA);
    return fileList;
}
//------------------------------------------------------------------
function getScaleCoef(originalFileSizeA,requiredFileSizeA){
    return originalFileSizeA / requiredFileSizeA;
}
//------------------------------------------------------------------
function getSizeCoef(imgFileA){
    return imgFileA.width/imgFileA.height;
}
//------------------------------------------------------------------
function getNewImgHeight(imgFileA,fileSizeA){
    var oldImgArea = parseInt(imgFileA.width)*parseInt(imgFileA.height);
    var newImgArea = oldImgArea/(getScaleCoef(fileSizeA,FILE_SIZE_B));
    return Math.round(Math.sqrt(newImgArea/getSizeCoef(imgFileA)));
}
//------------------------------------------------------------------
function getNewImgWidth(imgFileA,fileSizeA){
    var oldImgArea = imgFileA.width*imgFileA.height;
    var newImgArea = oldImgArea/(getScaleCoef(fileSizeA,FILE_SIZE_B));
    var cf = getSizeCoef(imgFileA);
    return Math.round(Math.sqrt(newImgArea/cf)*cf);
}
//------------------------------------------------------------------
function rescaleImg(imgFileA){
    app.open(new File(imgFileA.path+"/"+imgFileA.name));
    var img = app.documents.getByName(imgFileA.name);
    var imgSize = File(img.fullName).length;
    var iHeight = parseInt(img.height);
    var iWidth = parseInt(img.width);   
    img.changeMode(ChangeMode.RGB); 
    if(iHeight>iWidth){
        img.resizeImage(null,UnitValue(getNewImgHeight(img,imgSize),"px"),null,ResampleMethod.AUTOMATIC);
    }
    else{
        img.resizeImage(UnitValue(getNewImgWidth(img,imgSize),"px"),null,null,ResampleMethod.AUTOMATIC);
    }
    var options = new ExportOptionsSaveForWeb();
    if(CHANGE_QUALITY){
        options.quality = OUTPUT_QUALITY;
    }
    if(OPTIMIZE){
        options.optimized = true;  
    }
    var newName = FILE_PREFIX  + img.name; 
    var outputFolder = new Folder(img.path+"/"+OUTPUT_DIR);
    if(!outputFolder.exists){
        outputFolder.create();
    }
    img.exportDocument(File(img.path+'/'+OUTPUT_DIR+'/'+newName),ExportType.SAVEFORWEB,options);
    img.close(SaveOptions.DONOTSAVECHANGES);
}
//------------------------------------------------------------------
var originalUnit = preferences.rulerUnits;
preferences.rulerUnits = Units.PIXELS;
var list = getFiles(FILE_EXT);
for(var i=0;i<list.length;i++){
   rescaleImg(list[i]);
}
preferences.rulerUnits = originalUnit;