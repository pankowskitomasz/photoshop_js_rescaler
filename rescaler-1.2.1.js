//v.1.2.1
//config
//---------------------------------------------------------
var BASE_PATH = Folder.selectDialog("Select a folder with images");
var CHANGE_QUALITY = true;
var DEEP_DIR_SCAN = true;
var FILE_EXT = "jpg";
var FILE_PREFIX = "rescaled_";
var FILE_SUFFIX = "_do_1MB";
var FILE_SIZE_B = 1048576;
var OPTIMIZE = false;
var OUTPUT_DIR = "output";
var OUTPUT_QUALITY = 65;
//------------------------------------------------------------------
function getDirName(dirnameA){
    if(Folder(dirnameA).exists){
        var dt = new Date();
        dirnameA+="-"+dt.getDate()+"-"+((dt.getMonth()<10)?"0":"")+dt.getMonth()+"-"+dt.getFullYear();
        dirnameA+= "_"+dt.getHours()+dt.getMinutes()+dt.getSeconds();
    }
    return Folder.decode(dirnameA);
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
function rescaleImg(imgFileA,outputDirA){
    var filename = imgFileA.path+"/"+imgFileA.name;
    app.open(new File(filename));
    var img = app.documents.getByName(imgFileA.name);
    var imgSize = File(img.fullName).length;
    var iHeight = parseInt(img.height);
    var iWidth = parseInt(img.width);   
    img.changeMode(ChangeMode.RGB); 
    if(iHeight>iWidth){
        img.resizeImage(null,UnitValue(getNewImgHeight(img,imgSize),"px"),null,ResampleMethod.BICUBICSHARPER);
    }
    else{
        img.resizeImage(UnitValue(getNewImgWidth(img,imgSize),"px"),null,null,ResampleMethod.BICUBICSHARPER);
    }
    var options = new ExportOptionsSaveForWeb();
    options.format = SaveDocumentType.JPEG;   
    if(CHANGE_QUALITY){
        options.quality = OUTPUT_QUALITY;
    }
    if(OPTIMIZE){
        options.optimized = true;  
    }
    var newName = FILE_PREFIX+ img.name.substr(0,img.name.lastIndexOf("."));
    newName+=FILE_SUFFIX+img.name.substr(img.name.lastIndexOf("."),img.name.length-img.name.lastIndexOf(".")); 
    var outputFolder = new Folder(outputDirA);
    if(!outputFolder.exists){
        outputFolder.create();
    }
    img.exportDocument(File(outputDirA+'/'+newName),ExportType.SAVEFORWEB,options);
    img.close(SaveOptions.DONOTSAVECHANGES);
}
//------------------------------------------------------------------
function scanDir(pathA,fileListA,fileExtA){
    var list = Folder(pathA.fullName).getFiles("*.*");
    for(var i=0;i<list.length;i++){
        if(list[i] instanceof File){
            if(fileExtA=="" || list[i].fullName.split(".")[1].toLowerCase() == fileExtA){
                fileListA.push(list[i]);
            }
        }
        else{
            scanDir(Folder(list[i]),list,fileExtA);
        }
    }
    return fileListA;
}
//------------------------------------------------------------------
function main(deepScanningA,imgFolderA,fileExtA,outputFolderA){
    var originalUnit = preferences.rulerUnits;
    preferences.rulerUnits = Units.PIXELS;
    var imgList=[];
    var imgPath="";
    if(!deepScanningA){
        imgList = getFiles(FILE_EXT);
    }
    else{        
        imgList = scanDir(Folder(BASE_PATH),[],fileExtA);
    }
    for(var i=0;i<imgList.length;i++){
        imgPath = File.decode(imgList[i].path);
        imgPath = imgPath.substr(Folder.decode(imgFolderA).length,imgPath.length-Folder.decode(imgFolderA).length);
        rescaleImg(imgList[i],outputFolderA+"/"+imgPath);
    }
    preferences.rulerUnits = originalUnit;
}
//------------------------------------------------------------------
main(DEEP_DIR_SCAN,BASE_PATH,FILE_EXT,getDirName(BASE_PATH+"/"+OUTPUT_DIR));





//------------------------------------------------------------------
function canvasLog(dataToLogA){
    var originalUnit = preferences.rulerUnits;
    preferences.rulerUnits= Units.INCHES;
    var docRef = app.documents.add(10,2);
    var artLayerRef = docRef.artLayers.add();
    artLayerRef.kind = LayerKind.TEXT;
    var textItemRef = artLayerRef.textItem;
    textItemRef.contents = dataToLogA;
    docRef = null;
    artLayerRef = null;
    textItemRef = null;
    app.preferences.rulerUnits = originalUnit;
}