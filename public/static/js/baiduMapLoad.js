(function(){
	var retMap = null;
	$.ajax({
		type : "POST",
		url : "webservice/api/v1/comm/getParamVal",
		async : false,
		success : function(data) {
			if (data.success == 'SUCCESS') {
				retMap = data;
			}
		}
	});
	// 获取参数值。
	function getParaVal(paraCode) {
		if (!paraCode || paraCode == '' || !retMap || !retMap.paraValList || !retMap.paraValList.length)
			return '';
		var len = retMap.paraValList.length;
		for (var i = 0; i < len; i++) {
			if (retMap.paraValList[i].PARA_CODE == paraCode) {
				if (retMap.paraValList[i].DATA_TYPE == 'number') {
					return Number(retMap.paraValList[i].PARA_VALUE);
				} else {
					return retMap.paraValList[i].PARA_VALUE;
				}
			}
		}
		return '';
	}
	var onLineFlag = getParaVal("mapEnv");
	var gisSn = getParaVal("mapUserSn");
	var imgExt = getParaVal("mapImgFileExt");
	if (!imgExt || imgExt == '') imgExt = '.png';
	if (!onLineFlag || onLineFlag == '') onLineFlag = 'online';
	if (!gisSn || gisSn == '') gisSn = '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8';
	if (onLineFlag == "online") {
		var protoStr = window.location.protocol; //获取当前网页协议。
		if (protoStr.indexOf('https') != -1) {
			document.write('<script type="text/javascript" src="https://api.map.baidu.com/api?v=2.0&ak=' + gisSn + '&s=1"></script>');
		} else {
			document.write('<script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=' + gisSn + '"></script>');
		}
	} else {
		window.bdmapcfg = window.bdmapcfg || {
		  'imgext' : imgExt, 					//瓦片图的后缀 ------ 根据需要修改，一般是 .png .jpg
		  'tiles_dir' : '/baidumap/tiles', 			//普通街道瓦片图的目录，为空默认在 baidumap_v2/tiles/ 目录
		  'tiles_hybrid' : '/baidumap/tiles_hybrid', //卫星瓦片图的目录，为空默认在 baidumap_v2/tiles_hybrid/ 目录
		  'home' : 'static/gis/baidu/offline/' 	//百度离线地图API根目录。
		};
		window.BMap_loadScriptTime = (new Date).getTime();
		//加载地图API主文件
		document.write('<script type="text/javascript" src="'+bdmapcfg.home+'baidumap_offline_v2_20160822_min.js"></script>');
	}
	document.write('<script type="text/javascript" src="static/gis/baidu/MarkerClusterer.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/TextIconOverlay.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/LuShu_min.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/DistanceTool_min.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/DrawingManager_min.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/SearchInfoWindow_min.js"></script>');
	document.write('<script type="text/javascript" src="static/gis/baidu/baiduMap.js"></script>');
})();
