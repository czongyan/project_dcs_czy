(function(global){
    var __INFO__={
        plug:findFile_All,
        version:'1.0.1',
        author:"czy"
    };
    var defaults={
        fileDir:"",
        fileName:"",
    };
    var findFile_IE=function(options){
        var settings=Object.assign({},defaults,options);
        //仅适用IE浏览器下
        var fso=new ActiveXObject("Scripting.FileSystemObject");
        if(fso.FileExists(settings.fileDir))
            return true;
        else
            return false;
    }    
    var findFile_All=function(oprions){
        var settingus=Object.assign({},defaults,options);
        var result=false;
        $.ajax({
            url:settings.fileDir,
            type:'GET',
            complete:function(response){
                if(response==200)
                    result= true;
                else
                    result= false;
            }
        });    
        return result;
    }
    global[__INFO__.plug]=findFile_All;
})(typeof window!=="undefined"?window:this);

