console.log('dispatchLoad');
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
function includeLinkStyle(url) {
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}
function getLocalLanguage() {
	var language = 'en';
	if (navigator.appName == 'Netscape') {
		language = navigator.language;
	} else {
		language = navigator.browserLanguage;
	}
	if (!language || language == '' || language == 'zh') language = 'zh-CN';
	if (language != 'zh-CN') language = 'en-US';
	return language;
}
// 带地图调度台与普通调度台样式。
var dispatchType = getParaVal("dispatchType");
if ('normal' == dispatchType) {
	includeLinkStyle("dispatch/dispatch_cssNotMap.css");
	includeLinkStyle("dispatch/dispatch_cssNew.css");
	includeLinkStyle("static/css/blue.css");
} else {
	includeLinkStyle("dispatch/dispatch_css.css");
}
// 顶部一级菜单样式。
var topMenuCss = getParaVal("topMenuCss");
if ('icon' == topMenuCss) {
	window.mainTabHasWorld = false;
	includeLinkStyle("dispatch/mainTabHaveNotWorld.css");
} else {
	window.mainTabHasWorld = true;
	includeLinkStyle("dispatch/mainTabHaveWorld.css");
}
// 谷歌或百度地图加载JS。
var mapType = getParaVal("mapType");
var onLineFlag = getParaVal("mapEnv");
var gisSn = getParaVal("mapUserSn");
var imgExt = getParaVal("mapImgFileExt");
//mapType = 'google';
//onLineFlag = 'offline';
if (!imgExt || imgExt == '') imgExt = '.png';
if (!onLineFlag || onLineFlag == '') onLineFlag = 'online';
window.top.myMapType = mapType;
if (window.top.myMapType == 'google') {
	window.googleMapOverlays = window.googleMapOverlays || [];
	if (onLineFlag == "online") {
		var language = getLocalLanguage();
		var protoStr = window.location.protocol; //获取当前网页协议。
		if (!gisSn || gisSn == '' || gisSn.length <39 ) gisSn = 'AIzaSyAV7NMtW82P9ggljV0BrVz3AKkqyRCb9kQ';
		var googleJsUrl = '';
		if (protoStr.indexOf('https') != -1) {
			googleJsUrl += 'https://';
		} else {
			googleJsUrl += 'http://';
		}
		if (language == 'zh-CN') {
			googleJsUrl += 'maps.google.cn/maps/api/js?key=' + gisSn + '&language=zh-CN&libraries=drawing,places';
		} else {
			googleJsUrl += 'maps.googleapis.com/maps/api/js?key=' + gisSn + '&language=en-US&libraries=drawing,places';
		}
		document.write('<script type="text/javascript" src="' + googleJsUrl + '"></script>');
	} else {
		document.write('<script type="text/javascript" src="static/gis/google/offline/mapapi.js"></script>');
		document.write('<script type="text/javascript" src="static/gis/google/offline/api-3/16/2/drawing.js"></script>');
		document.write('<script type="text/javascript" src="static/gis/google/offline/api-3/16/2/drawing_impl.js"></script>');
		includeLinkStyle("dispatch/dispatch_google_offline.css");
	}
	document.write('<script type="text/javascript" src="static/gis/google/googleMap.js"></script>');
} else if (window.top.myMapType == 'baidu') {
	document.write('<script type="text/javascript" src="static/js/baiduMapLoad.js"></script>');
}
// 调度台触屏显示样式。
var dispShowMode = getParaVal("dispShowMode");
if (dispShowMode == 'touch') {
	includeLinkStyle("dispatch/dispatch_Touch.css");
}
