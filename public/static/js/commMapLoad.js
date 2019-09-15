// 获取通用语言函数。
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
// 谷歌或百度地图加载JS。
var onLineFlag = window.top.getParaVal("mapEnv");
var gisSn = window.top.getParaVal("mapUserSn");
var imgExt = window.top.getParaVal("mapImgFileExt");
if (!imgExt || imgExt == '') imgExt = '.png';
if (!onLineFlag || onLineFlag == '') onLineFlag = 'online';
//onLineFlag = 'offline';
if (window.top.myMapType == 'google') {
	window.googleMapOverlays = window.googleMapOverlays || [];
	if (onLineFlag == "online") {
		var language = getLocalLanguage();
		var protoStr = window.location.protocol; //获取当前网页协议。
		if (!gisSn || gisSn == '' || gisSn.length < 39) gisSn = 'AIzaSyAV7NMtW82P9ggljV0BrVz3AKkqyRCb9kQ';
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
	}
	document.write('<script type="text/javascript" src="static/gis/google/googleMap.js"></script>');
} else if (window.top.myMapType == 'baidu') {
	document.write('<script type="text/javascript" src="static/js/baiduMapLoad.js"></script>');
}