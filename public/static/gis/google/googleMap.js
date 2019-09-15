/**
 * 地图位置计算工具(将GPS坐标转换成百度地图坐标)
 * 参考文档：http://bbs.lbsyun.baidu.com/forum.php?mod=viewthread&tid=10923&qq-pf-to=pcqq.group
 * 
 * 使用示例：批量转换坐标位置
 * 
 * var transferedData = GpsToBaiduPoints(prePoints);
 * $.each(transferedData,function(index,point){ console.log(point); });
 * 
 * -------------------以下是提供的一个简单的访问接口------------------------- 参数: points:new
 * BMap.Point(lng,lat)的集合 返回值:resultPoints:转换后 BMap.point点集 function
 * GpsToBaiduPoints(points){ var resultPoints = [];
 * $.each(points,function(index,point){ //世界大地坐标转为百度坐标 var _t =
 * wgs2bd(point.lat,point.lng); var _BPoint = new BMap.Point(_t[1], _t[0]);
 * resultPoints.push(_BPoint); }); return resultPoints; }
 */
console.log("googleMap");
// 默认提供一个接口直接调用
function GpsToBaiduPoints(points){
    var resultPoints = [];
    $.each(points,function(index,point){
        var _t = wgs2bd(point.lat,point.lng);
        var _BPoint = new BMap.Point(_t[1], _t[0]);
        resultPoints.push(_BPoint);
    });
    return resultPoints;
}

// ////////////////////////////////////////
// ////////////转换核心代码////////////////
// ////////////////////////////////////////
var pi = 3.14159265358979324;
var a = 6378245.0;
var ee = 0.00669342162296594323;
var x_pi = 3.14159265358979324*3000.0/180.0;

//以下为测距全局参数变量
//var map;  
var polyline;  
var polylinesArray = [];  
//距离标记数组  
var lenArray = [];  
//默认经纬度  22.786607, 100.977316  
var DefaultLat = 22.786607;  
var DefaultLng = 100.977316;  
//缩放级别  
var DefaultZoom = 15; //默认情况下的zoom 

/**
 * GCJ02 转换为 WGS84
 * 
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcjtowgs(lng, lat) {
	if (out_of_china(lng, lat)) {
		return [lng, lat]
	} else {
		var dlat = transformLat(lng - 105.0, lat - 35.0);
		var dlng = transformLon(lng - 105.0, lat - 35.0);
		var radlat = lat / 180.0 * pi;
		var magic = Math.sin(radlat);
		magic = 1 - ee * magic * magic;
		var sqrtmagic = Math.sqrt(magic);
		dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
		dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
		mglat = lat + dlat;
		mglng = lng + dlng;
		return [lng * 2 - mglng, lat * 2 - mglat]
	}
}

function wgs2gcj(lat,lon) {
    var dLat = transformLat(lon - 105.0, lat - 35.0);
    var dLon = transformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    var mgLat = lat + dLat;
    var mgLon = lon + dLon;
    var result = [];
    result.push(mgLat);
    result.push(mgLon);
    return result;
}

function transformLat(lat,lon) {
    var ret = -100.0 + 2.0 * lat + 3.0 * lon + 0.2 * lon * lon + 0.1 * lat * lon + 0.2 * Math.sqrt(Math.abs(lat));
    ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lon * pi) + 40.0 * Math.sin(lon / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lon / 12.0 * pi) + 320 * Math.sin(lon * pi  / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(lat,lon) {
    var ret = 300.0 + lat + 2.0 * lon + 0.1 * lat * lat + 0.1 * lat * lon + 0.1 * Math.sqrt(Math.abs(lat));
    ret += (20.0 * Math.sin(6.0 * lat * pi) + 20.0 * Math.sin(2.0 * lat * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lat / 12.0 * pi) + 300.0 * Math.sin(lat / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * 
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
	return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

var GMap = window.GMap = GMap || {};
GMap.GPoint = function(lng, lat) {
	var _t = wgs2gcj(lat,lng);
	return new google.maps.LatLng(Number(_t[0]), Number(_t[1]));
}

//紫色：#9E6B99 PC调度台
//蓝色：#145385 移动终端
//绿色：#006100 监控头
//红色：#A01A1A 车载台
//黄色：#D18315 固定话机
//浅蓝：#77ABCF GPS定位器


/*
 * -- grayscale.js --
 * Copyright (C) James Padolsey (http://james.padolsey.com)
 * Download by http://www.codefans.net
 */
var grayscale = (function(){
    var config = {
            colorProps: ['color','backgroundColor','borderBottomColor','borderTopColor','borderLeftColor','borderRightColor','backgroundImage'],
            externalImageHandler : {
                /* Grayscaling externally hosted images does not work
                   - Use these functions to handle those images as you so desire */
                /* Out of convenience these functions are also used for browsers
                   like Chrome that do not support CanvasContext.getImageData */
                init : function(el, src) {
                    if (el.nodeName.toLowerCase() === 'img') {
                        // Is IMG element...
                    } else {
                        // Is background-image element:
                        // Default - remove background images
                        data(el).backgroundImageSRC = src;
                        el.style.backgroundImage = '';
                    }
                },
                reset : function(el) {
                    if (el.nodeName.toLowerCase() === 'img') {
                        // Is IMG element...
                    } else {
                        // Is background-image element:
                        el.style.backgroundImage = 'url(' + (data(el).backgroundImageSRC || '') + ')';
                    }
                }
            }
        },
        log = function(){
            try { window.console.log.apply(console, arguments); }
            catch(e) {};
        },
        isExternal = function(url) {
            // Checks whether URL is external: 'CanvasContext.getImageData'
            // only works if the image is on the current domain.
            return (new RegExp('https?://(?!' + window.location.hostname + ')')).test(url);
        },
        data = (function(){
            
            var cache = [0],
            expando = 'data' + (+new Date());
            
            return function(elem) {
                var cacheIndex = elem[expando],
                    nextCacheIndex = cache.length;
                if(!cacheIndex) {
                    cacheIndex = elem[expando] = nextCacheIndex;
                    cache[cacheIndex] = {};
                }
                return cache[cacheIndex];
            };
            
        })(),
        desatIMG = function(img, prepare, realEl) {
            
            // realEl is only set when img is temp (for BG images)
            
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                height = img.naturalHeight || img.offsetHeight || img.height,
                width = img.naturalWidth || img.offsetWidth || img.width,
                imgData;
                
            canvas.height = height;
            canvas.width = width;
            context.drawImage(img, 0, 0);
            try {
                imgData = context.getImageData(0, 0, width, height);
            } catch(e) {}
            
            if (prepare) {
                desatIMG.preparing = true;
                // Slowly recurse through pixels for prep,
                // :: only occurs on grayscale.prepare()
                var y = 0;
                (function(){
                    
                    if (!desatIMG.preparing) { return; }
                    
                    if (y === height) {
                        // Finished!
                        context.putImageData(imgData, 0, 0, 0, 0, width, height);
                        realEl ? (data(realEl).BGdataURL = canvas.toDataURL())
                               : (data(img).dataURL = canvas.toDataURL())
                    }
                    
                    for (var x = 0; x < width; x++) {
                        var i = (y * width + x) * 4;
                        // Apply Monoschrome level across all channels:
                        imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] =
                        RGBtoGRAYSCALE(imgData.data[i], imgData.data[i+1], imgData.data[i+2]);
                    }
                    
                    y++;
                    setTimeout(arguments.callee, 0);
                    
                })();
                return;
            } else {
                // If desatIMG was called without 'prepare' flag
                // then cancel recursion and proceed with force! (below)
                desatIMG.preparing = false;
            }
            
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var i = (y * width + x) * 4;
                    // Apply Monoschrome level across all channels:
                    imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] =
                    RGBtoGRAYSCALE(imgData.data[i], imgData.data[i+1], imgData.data[i+2]);
                }
            }
            
            context.putImageData(imgData, 0, 0, 0, 0, width, height);
            return canvas;
        
        },
        getStyle = function(el, prop) {
            var style = document.defaultView && document.defaultView.getComputedStyle ? 
                        document.defaultView.getComputedStyle(el, null)[prop]
                        : el.currentStyle[prop];
            // If format is #FFFFFF: (convert to RGB)
            if (style && /^#[A-F0-9]/i.test(style)) {
                    var hex = style.match(/[A-F0-9]{2}/ig);
                    style = 'rgb(' + parseInt(hex[0], 16) + ','
                                   + parseInt(hex[1], 16) + ','
                                   + parseInt(hex[2], 16) + ')';
            }
            return style;
        },
        RGBtoGRAYSCALE = function(r,g,b) {
            // Returns single monochrome figure:
            return parseInt( (0.2125 * r) + (0.7154 * g) + (0.0721 * b), 10 );
        },
        getAllNodes = function(context) {
            var all = Array.prototype.slice.call(context.getElementsByTagName('*'));
            all.unshift(context);
            return all;
        };
        
    var init = function(context) {
        
        // Handle if a DOM collection is passed instead of a single el:
        if (context && context[0] && context.length && context[0].nodeName) {
            // Is a DOM collection:
            var allContexts = Array.prototype.slice.call(context),
                cIndex = -1, cLen = allContexts.length;
            while (++cIndex<cLen) { init.call(this, allContexts[cIndex]); }
            return;
        }
        
        context = context || document.documentElement;
        
        if (!document.createElement('canvas').getContext) {
            context.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(grayscale=1)';
            context.style.zoom = 1;
            return;
        }
        
        var all = getAllNodes(context),
            i = -1, len = all.length;
            
        while (++i<len) {
            var cur = all[i];
            
            if (cur.nodeName.toLowerCase() === 'img') {
                var src = cur.getAttribute('src');
                if(!src) { continue; }
                if (isExternal(src)) {
                    config.externalImageHandler.init(cur, src);
                } else {
                    data(cur).realSRC = src;
                    try {
                        // Within try statement just encase there's no support....
                        cur.src = data(cur).dataURL || desatIMG(cur).toDataURL();
                    } catch(e) { config.externalImageHandler.init(cur, src); }
                }
                
            } else {
                for (var pIndex = 0, pLen = config.colorProps.length; pIndex < pLen; pIndex++) {
                    var prop = config.colorProps[pIndex],
                    style = getStyle(cur, prop);
                    if (!style) {continue;}
                    if (cur.style[prop]) {
                        data(cur)[prop] = style;
                    }
                    // RGB color:
                    if (style.substring(0,4) === 'rgb(') {
                        var monoRGB = RGBtoGRAYSCALE.apply(null, style.match(/\d+/g));
                        cur.style[prop] = style = 'rgb(' + monoRGB + ',' + monoRGB + ',' + monoRGB + ')';
                        continue;
                    }
                    // Background Image:
                    if (style.indexOf('url(') > -1) {
                        var urlPatt = /\(['"]?(.+?)['"]?\)/,
                            url = style.match(urlPatt)[1];
                        if (isExternal(url)) {
                            config.externalImageHandler.init(cur, url);
                            data(cur).externalBG = true;
                            continue;
                        }
                        // data(cur).BGdataURL refers to caches URL (from preparation)
                        try {
                            var imgSRC = data(cur).BGdataURL || (function(){
                                    var temp = document.createElement('img');
                                    temp.src = url;
                                    return desatIMG(temp).toDataURL();
                                })();
                            
                            cur.style[prop] = style.replace(urlPatt, function(_, url){
                                return '(' + imgSRC + ')';
                            });
                        } catch(e) { config.externalImageHandler.init(cur, url); }
                    }
                }
            }
        }
        
    };
    
    init.reset = function(context) {
        // Handle if a DOM collection is passed instead of a single el:
        if (context && context[0] && context.length && context[0].nodeName) {
            // Is a DOM collection:
            var allContexts = Array.prototype.slice.call(context),
                cIndex = -1, cLen = allContexts.length;
            while (++cIndex<cLen) { init.reset.call(this, allContexts[cIndex]); }
            return;
        }
        context = context || document.documentElement;
        if (!document.createElement('canvas').getContext) {
            context.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(grayscale=0)';
            return;
        }
        var all = getAllNodes(context),
            i = -1, len = all.length;
        while (++i<len) {
            var cur = all[i];
            if (cur.nodeName.toLowerCase() === 'img') {
                var src = cur.getAttribute('src');
                if (isExternal(src)) {
                    config.externalImageHandler.reset(cur, src);
                }
                cur.src = data(cur).realSRC || src;
            } else {
                for (var pIndex = 0, pLen = config.colorProps.length; pIndex < pLen; pIndex++) {
                    if (data(cur).externalBG) {
                        config.externalImageHandler.reset(cur);
                    }
                    var prop = config.colorProps[pIndex];
                    cur.style[prop] = data(cur)[prop] || '';
                }
            }
        }
    };
    
    init.prepare = function(context) {
        
        // Handle if a DOM collection is passed instead of a single el:
        if (context && context[0] && context.length && context[0].nodeName) {
            // Is a DOM collection:
            var allContexts = Array.prototype.slice.call(context),
                cIndex = -1, cLen = allContexts.length;
            while (++cIndex<cLen) { init.prepare.call(null, allContexts[cIndex]); }
            return;
        }
        
        // Slowly recurses through all elements
        // so as not to lock up on the user.
        
        context = context || document.documentElement;
        
        if (!document.createElement('canvas').getContext) { return; }
        
        var all = getAllNodes(context),
            i = -1, len = all.length;
        
        while (++i<len) {
            var cur = all[i];
            if (data(cur).skip) { return; }
            if (cur.nodeName.toLowerCase() === 'img') {
                if (cur.getAttribute('src') && !isExternal(cur.src)) {
                    desatIMG(cur, true);
                }
            } else {
                var style = getStyle(cur, 'backgroundImage');
                if (style.indexOf('url(') > -1) {
                    var urlPatt = /\(['"]?(.+?)['"]?\)/,
                        url = style.match(urlPatt)[1];
                    if (!isExternal(url)) {
                        var temp = document.createElement('img');
                        temp.src = url;
                        desatIMG(temp, true, cur);
                    }
                }
            }
        }
    };
    return init;
})();

//电子围栏警报地图对人员的标注
//参数说明
//pmap：标注点的位置
//warnText：警告内容
//showMillisecond：警告时间 单位：毫秒
function addEleFenceMapWarn(pmap, warnText, showMillisecond) {
	map.setCenter(pmap);
	var point = new google.maps.LatLng(pmap.lat, pmap.lng);
	var myCompOverlay = new ComplexCustomOverlay(point, warnText);
	var myCompOverlay2 = new ComplexCustomOverlay2(point);
	myCompOverlay.setMap(window.map);
	myCompOverlay2.setMap(window.map);
	if (warnText && warnText == '违规进入电子围栏') {
		fn_ringOnceAutoStop('railAlarmIn.mp3');
	} else {
		fn_ringOnceAutoStop('railAlarmOut.mp3');
	}
	setTimeout(function() {
		myCompOverlay.setMap(null);
		myCompOverlay2.setMap(null);
	}, showMillisecond);
}

function ComplexCustomOverlay(point, warnText) {  
	this._point = point;
	this.warnText = warnText;
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.position = "absolute";
	div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
	div.className = "break-rules";
	var arrowDiv = this._arrowDiv = document.createElement("div");
	arrowDiv.className = "img-wrap";
	var arrowDiv2 = this._arrowDiv2 = document.createElement("div");
	arrowDiv2.className = "text";
	arrowDiv2.appendChild(document.createTextNode(this.warnText));
	var img = this._img = document.createElement("img");
	img.src ="static/img/eleWarn.gif" ;
	arrowDiv.appendChild(img);
	div.appendChild(arrowDiv);
	div.appendChild(arrowDiv2);
	this.div_ = div;
	this.setMap(map);
}  
ComplexCustomOverlay.prototype = new google.maps.OverlayView();
ComplexCustomOverlay.prototype.onAdd = function() {  
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this.div_);
}  
ComplexCustomOverlay.prototype.draw = function() {  
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this.div_;
	div.style.left = (pixel.x + 20) + 'px';
	div.style.top = (pixel.y - 40) + 'px';
}

// 复杂的自定义覆盖物
function ComplexCustomOverlay2(point) {  
	this._point = point;
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.position = "absolute";
	div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
	div.className = "round";
	this.div_ = div;
	this.setMap(map);
}  
ComplexCustomOverlay2.prototype = new google.maps.OverlayView();  
ComplexCustomOverlay2.prototype.onAdd = function() {
 	var panes = this.getPanes();
 	panes.overlayMouseTarget.appendChild(this.div_);
}
ComplexCustomOverlay2.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this.div_;
	div.style.left = (pixel.x -17 ) + 'px';
	div.style.top = (pixel.y - 5) + 'px';
}

//=============================== 以下是谷歌地图轨迹播放功能代码  自己实现       ================================
function LuShu(my_trip) {
	window.lushu_my_trip = my_trip;
	window.lushu_marker_count = 1;
}
function lushuStart() {
	//初始化箭头显示的数组
	let marker0 = new google.maps.Marker({
		position: window.lushu_my_trip[0],
		icon: 'static/img/car.png'
	});
	marker0.setMap(map);
	window.lushu_marker = marker0;
	window.lushu_marker_arr = [marker0];
	//时间循环控制速度，go_marker函数每次绘制marker生成对应图片，200为一秒五次，可以使用一个变量来控制速度
    window.lushu_begin_marker= setInterval(lushuGoMarker, Number(2000/window.mapVarRate));
}
function lushuStop() {
	//暂定时间循环
	clearInterval(window.lushu_begin_marker);
	window.lushu = null;
}
//控制箭头根据角度变化来显示不同的图片
window.lushuGoMarker = function() {
	if (window.lushu_my_trip.length && window.lushu_marker_count && (window.lushu_marker_count == window.lushu_my_trip.length)) {
		lushuStop();
	} else {
		//根据实际行走方向的角度判断显示不同方向的箭头图片
		let img = 'static/img/car.png';
		//新增一个当前的marker，推入数组以后，进行绘画
		let marker1 = new google.maps.Marker({
			position: window.lushu_my_trip[window.lushu_marker_count],
			icon: img
		});
		window.lushu_marker_arr.push(marker1);
		window.lushu_marker_arr[1].setMap(map);
		window.lushu_marker = window.lushu_marker_arr[1];
		//对上一个marker删除，延迟20ms防止箭头闪动
		setTimeout(function() {
			window.lushu_marker_arr[0].setMap(null);
			//对已经删除了的marker从数组中删除
			window.lushu_marker_arr.shift();
		}, 20);
		//marker计数加一
		window.lushu_marker_count++;
	}
}

//=============================== 以下是谷歌地图测距功能  自己实现    ===============================
//创建标记  
function CreateMarker(lat, lng, MyGoToCommunityZoom) {             
    var singapoerCenter = new google.maps.LatLng(lat, lng);  
    var myOptions = {  
        zoom: MyGoToCommunityZoom,  
        center: singapoerCenter,  
        navigationControl: true,  
        scaleControl: true,  
        streetViewControl: true,  
        mapTypeId: google.maps.MapTypeId.ROADMAP  
    }  
    map.setOptions(myOptions);  
}  
//距离  
function getDistanceCJ() {
    window.ceClickAction = google.maps.event.addListener(map,"click",function(event) {
        addMarker(event.latLng);
    });
}
//添加新标记  
function addMarker(location) {
	if (lenArray.length == 0) {
		var icon = "http://www.google.com/mapfiles/dd-start.png";
	} else {
		if (lenArray.length >= 2) {
			marker.setMap(null);
		}
		var icon = "http://labs.google.com/ridefinder/images/mm_20_red.png";
	}
	//标记选项 
	var myOptions = {
		position: location,
		draggable: true,
		map: map,
		icon: icon
	};
    marker = new google.maps.Marker(myOptions);
    if (lenArray.length != 0) {
    	window.distanceMarkerCate = marker;
    	google.maps.event.addListener(marker, 'click', function() {
    		//放入marker  
    		lenArray.push(marker);
    		drawOverlay();
    	});
    	//拖动结束事件  
    	google.maps.event.addListener(marker, 'dragend', function() {
    		lenArray.push(marker);
    		drawOverlay();
    	});
    } else {
    	window.firstMarkerCate = marker;
    	google.maps.event.addListener(marker, 'click', function() {
    		deleteOverlays();
    		window.ceClickAction.remove();
    	});
    }
    lenArray.push(marker);
    drawOverlay();
}  

//画出路径覆盖层  
function drawOverlay(){  
	//路线数组  
	var flightPlanCoordinates = [];  
	//将坐标压入路线数组  
	if (lenArray) {
		for (i in lenArray) {  
			flightPlanCoordinates.push(lenArray[i].getPosition());  
		}  
	}  
	//路径选项  
	var myOptions = {  
		path: flightPlanCoordinates,
		map: map,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2
	};
	polyline = new google.maps.Polyline(myOptions);  
	//清除原有折线路径  
	if (polylinesArray) {
		for (i in polylinesArray) {
			polylinesArray[i].setMap(null);
		}
		polylinesArray = [];
	}
	polyline.setMap(map);  
	window.distanceMarkerCate.setLabel(polylineGetLength(polyline) + 'm');
	window.firstMarkerCate.setLabel('取消');
	document.getElementById("sRes").innerHTML =(polylineGetLength(polyline)/1000).toFixed(3);  
	polylinesArray.push(polyline);  
}  
//距离算法  
function distanceFrom(thislatlng, latlng) {
	var lat = [thislatlng.lat(), latlng.lat()];
	var lng = [thislatlng.lng(), latlng.lng()]; //var R = 6371; // km (change this constant to get miles)
	var R = 6378137; // In meters
	var dLat = (lat[1] - lat[0]) * Math.PI / 180;
	var dLng = (lng[1] - lng[0]) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return Math.round(d);
}   
function polylineGetLength(polyline) {
	var d = 0;
	var path = polyline.getPath();
	var latlng;
	for (var i = 0; i < path.getLength() - 1; i++) {
		latlng = [path.getAt(i), path.getAt(i + 1)];
		d += distanceFrom(latlng[0] , latlng[1]);
	}
	return d;
}

// 删除所有叠加物   
function deleteOverlays() {
	if (lenArray) {
		for (i in lenArray) {
			lenArray[i].setMap(null);  
		}
		lenArray.length = 0;
	}
	//清除原有折线路径  
	if (polylinesArray) {
		  for (i in polylinesArray) {
			  polylinesArray[i].setMap(null);
		  }
		  polylinesArray = [];
	}
	lenArray = [];
	polylinesArray = [];
	document.getElementById("sRes").innerHTML = "0.000";
}
 
//=============================== 以下为谷歌地图自定义标注部分    ===============================
var image_;
var map_;
var text_;
var latLon_;
var div_;
var marker;
function myOverlay(point, num, name, imgSrc, isStatic, color, onLineFlag, mapTailFlag) {
 	this._point = point;
 	this._num = num;
 	this._name = name;
 	this._imgSrc = imgSrc;
 	if (!isStatic) {
 		this._static = false;
 	} else {
 		this._static = isStatic;
 	}
 	if (!color) {
 		this._color = '#145385';
 	} else {
 		this._color = color;
 	}
 	if (onLineFlag && (onLineFlag == '1' || onLineFlag == true)) {
 		this._onLineFlag = true;
 	} else {
 		this._onLineFlag = false;
 	}
 	if (mapTailFlag && (mapTailFlag == '1' || mapTailFlag == true)) {
 		this._mapTailFlag = true;
 	} else {
 		this._mapTailFlag = false;
 	}
 	var mainDiv = this._mainDiv = document.createElement("div");
 	mainDiv.id = this._num;
 	mainDiv.className = "endUser";
 	if (this._onLineFlag == false) mainDiv.className += " leave";
 	if (this._mapTailFlag == true) mainDiv.className += " concern";
 	mainDiv.style.position = "absolute";
 	mainDiv.style.border = "1px solid " + this._color;
 	mainDiv.style.zIndex = 999999;
 	mainDiv.setAttribute("endUserName",this._name);
 	mainDiv.setAttribute("endUserImgSrc",this._imgSrc);
 	mainDiv.setAttribute("endUserPoint",this._point.lng() + "," + this._point.lat());
 	
 	var arrowDiv = this._arrowDiv = document.createElement("div");
 	arrowDiv.className = "endUserAfter";
 	arrowDiv.style['border-left'] = "4px solid " + this._color;
 	arrowDiv.style['border-bottom'] = "4px solid " + this._color;
 	var whiteDiv = this._whiteDiv = document.createElement("div");
 	whiteDiv.className = "white";
 	arrowDiv.appendChild(whiteDiv);
 	mainDiv.appendChild(arrowDiv);
 	
 	var labelDiv = this._labelDiv = document.createElement("div");
 	labelDiv.className = "name";
 	labelDiv.style['background-color'] = this._color;
 	mainDiv.appendChild(labelDiv);
 	labelDiv.appendChild(document.createTextNode(this._name));

 	var img = this._img = document.createElement("img");
 	img.src = this._imgSrc;
 	mainDiv.appendChild(img);
 	this.div_ = mainDiv;
 	this.className = "EndUserOverlay";
 	this.setMap(map);
}
myOverlay.prototype = new google.maps.OverlayView();
myOverlay.prototype.onAdd = function() {
 	var panes = this.getPanes();
 	panes.overlayMouseTarget.appendChild(this.div_);
}
myOverlay.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this.div_;
	div.style.left = (pixel.x-17) + 'px';
	div.style.top = (pixel.y-40) + 'px';
}
myOverlay.prototype.move = function(newPoint) {
	this._point = newPoint;
	this.div_.setAttribute("endUserPoint",this._point.lng() + "," + this._point.lat());
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this.div_;
	div.style.left = (pixel.x - 17) + 'px';
	div.style.top = (pixel.y - 40) + 'px';
}
myOverlay.prototype.addCallGif = function(gifType) {
	if (!gifType || gifType == '') return;
	var $mainDiv = $(this.div_);
	var htmlStr = '<img class="gif" src="static/img/' + gifType + '.gif" alt=""/>';
	$mainDiv.append(htmlStr);
}
myOverlay.prototype.delCallGif = function() {
	var $mainDiv = $(this.div_);
	$mainDiv.find('.gif').remove();
}
myOverlay.prototype.setOnLineFlag = function(onLineFlag) {
	var $mainDiv = $(this.div_);
	if (onLineFlag && (onLineFlag == '1' || onLineFlag == true)) {
		this._onLineFlag = true;
		$mainDiv.removeClass('leave');
	} else {
		this._onLineFlag = false;
		$mainDiv.addClass('leave');
	}
}
myOverlay.prototype.setMapTailFlag = function(mapTailFlag) {
	var $mainDiv = $(this.div_);
	if (mapTailFlag && (mapTailFlag == '1' || mapTailFlag == true)) {
		this._mapTailFlag = true;
		$mainDiv.addClass('concern');
	} else {
		this._mapTailFlag = false;
		$mainDiv.removeClass('concern');
	}
}
myOverlay.prototype.addIMInfo = function(IMInfo) {
	if (!IMInfo || IMInfo == '') return;
	var $mainDiv = $(this.div_);
	var htmlStr = '<div class="message" title="' + IMInfo + '">' + IMInfo + '</div><div class="corner"></div>';
	$mainDiv.append(htmlStr);
	setTimeout(function() {
		var $IM = $mainDiv.find('.message');
		$IM.fadeOut(200, function () {
			$IM.remove();
			$mainDiv.find('.corner').remove();
		});
	}, 15000);
}
myOverlay.prototype.onRemove = function() {  
	this.div_.parentNode.removeChild(this.div_);  
	this.div_ = null;  
}

//Note that the visibility property must be a string enclosed in quotes  
myOverlay.prototype.hide = function() {  
	if (this.div_) {  
		this.div_.style.visibility = "hidden";  
	}  
}
myOverlay.prototype.show = function() {  
	if (this.div_) {  
		this.div_.style.visibility = "visible";  
	}  
}
myOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.div_.style.visibility == "hidden") {
			this.show();
		} else {
			this.hide();
		}
	}
}
myOverlay.prototype.toggleDOM = function() {
	if (this.getMap()) {
		this.setMap(null);
	} else {
		this.setMap(this.map_);
	}
}
myOverlay.prototype.setIsStatic = function(isStatic) {
 	this._static = isStatic;
}
myOverlay.prototype.showTop = function() {
	var $mainDiv = $(this.div_);
	$('.endUser').css('z-index', '');
	$mainDiv.css('z-index', '10');
}
myOverlay.prototype.addEventListener = function(event, fun) {
	this.div_['on'+event] = fun;
	this.event = this.event || {};
	this.event['on' + event] = fun;
}
window.addGoogleOverlay = function(addOverlay) {
	var oveylays = window.googleMapOverlays;
	for (var i = 0; i < oveylays.length; i++) {
		var overlay = oveylays[i];
		if (overlay == addOverlay) return;
	}
	window.googleMapOverlays.push(addOverlay);
}
window.removeGoogleOverlay = function(removeOverlay) {
	var oveylays = window.googleMapOverlays;
	for (var i = 0; i < oveylays.length; i++) {
		var overlay = oveylays[i];
		if (overlay == removeOverlay) window.googleMapOverlays.splice(i, 1);
	}
}

//下面为关注相关方法
function hasAttention(num) {
 	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
 	var oveylays = window.baiduAttentionPoints;
  	for (var i = 0; oveylays && i < oveylays.length; i++) {
  		var overlay = oveylays[i];
  		if (overlay.num == num) return true;
  	}
  	return false;
}
function removeFromAttentionList(num) {
 	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
 	var oveylays = window.baiduAttentionPoints;
  	for (var i = 0; oveylays && i < oveylays.length; i++) {
  		var overlay = oveylays[i];
  		if (overlay.num == num) window.baiduAttentionPoints.splice(i, 1);
  	}
}
function addToAttentionList(num, latLng) {
 	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
  	var oveylays = window.baiduAttentionPoints;
  	for (var i = 0; oveylays && i < oveylays.length; i++) {
  		var overlay = oveylays[i];
  		if (overlay.num == num) return;
  	}
  	var addOverlay = {};
  	addOverlay.num = num;
  	addOverlay.attentionTime = getNowFormatDate();
  	addOverlay.latLng = latLng;
  	addOverlay.hisLatLng = [latLng];
  	window.baiduAttentionPoints.push(addOverlay);
}
function updateAttentionList(num , latLng){
 	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
 	var oveylays = window.baiduAttentionPoints;
 	for (var i = 0; oveylays && i < oveylays.length; i++) {
 		var overlay = oveylays[i];
 		if (overlay.num == num) {
 			overlay.latLng = latLng;
 			overlay.hisLatLng[overlay.hisLatLng.length] = latLng;
 		}
 	}
}
function panToAttentionList() {
 	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
 	var oveylays = window.baiduAttentionPoints;
 	var arrPois = [];
  	for (var k = 0; oveylays && k < oveylays.length; k++) {
  		var overlay = oveylays[k];
  		arrPois[k] = BMap.BPoint(Number(overlay.latLng.lng),Number(overlay.latLng.lat));
  		var linePoint = [];
  		for (var i = 0; overlay.hisLatLng && i < overlay.hisLatLng.length; i++) {
  	 		var hispoint = overlay.hisLatLng[i];
  	 		linePoint[i] = BMap.BPoint(Number(hispoint.lng),Number(hispoint.lat));
  	 	}
  		if(window.attentionPolyLine) window.map.removeOverlay(window.attentionPolyLine);
  		var mapVarPolyline = new BMap.Polyline(linePoint, {strokeColor: '#111'});
  		window.map.addOverlay(mapVarPolyline);
  		window.attentionPolyLine = mapVarPolyline;
  	}
  	//地图设置关注
  	window.map.setViewport(arrPois);
}
function panToAttentionListOfGoogle() {
	if (!window.baiduAttentionPoints) window.baiduAttentionPoints = [];
	var oveylays = window.baiduAttentionPoints;
	var arrPois = [];
 	for (var i = 0; oveylays && i < oveylays.length; i++) {
 		var overlay = oveylays[i];
 	}
}

//SOS求注信息在地图上的标注
//参数说明
//num：SOS求注人员的号码
//point：SOS求注点的位置
function addSOSMapWarn(num, nowLng, nowLat, alarmTime, alarmUUID) {
	if (!window.map) return;
	window.mapSosObj = window.mapSosObj || {};
	if (window.mapSosObj[num]) return;
	if (!alarmUUID) alarmUUID = '';
	var warnText = num + '&nbsp;&nbsp;SOS</br>' + alarmTime;
	var glatlng = wgs2gcj(Number(nowLat), Number(nowLng));
	var lat = glatlng[0];
	var lng = glatlng[1];
	var point = new google.maps.LatLng(Number(lat), Number(lng));
	// 地图定位到当前选中用户。
	setTimeout(function() {
		// 将界面定位到地图展示界面。
		if ($('#interface>.header .tab ul #menu_001001').length > 0  && $('#interface>.content>#panel_001001').length > 0) {
			$('#interface>.header .tab ul li').removeClass('active');
			$('#interface>.content>div').removeClass('active');
			$('#interface>.header .tab ul #menu_001001').addClass('active');
			$('#interface>.content>#panel_001001').addClass('active');
		}
		window.map.panTo(point);
	}, 500);
	//添加报警人员的地图覆盖物。
	var retObj = fn_addOneOverLay(num);
	//添加SOS的地图覆盖物。
	var myCompOverlay = new ComplexCustomOverlayOfSos(num, point, warnText, alarmUUID);
	myCompOverlay.setMap(window.map);
	myCompOverlay.addEventListener('contextmenu',function(event) {
		var num = $(this).attr("id");
		var alarmUUID = $(this).attr("alarmUUID");
		fn_showSOSContextMenu(num, alarmUUID, event);
	});
	var myCompOverlayPos = new ComplexCustomOverlayOfSosPos(num, point, alarmUUID);
	myCompOverlayPos.setMap(window.map);
	myCompOverlayPos.addEventListener('contextmenu',function(event) {
		var num = $(this).attr("id");
		var alarmUUID = $(this).attr("alarmUUID");
		fn_showSOSContextMenu(num, alarmUUID, event);
	});
	window.mapSosObj[num] = [myCompOverlay,myCompOverlayPos,retObj];
	var js = {};
	js.fromDesc = window.top.userInfo.userInfo.num;
	js.fromNumber = window.top.userInfo.userInfo.num;
	js.messageId = new Date();
	var subPara = {};
	subPara.type = 5;
	js.subPara = JSON.stringify(subPara);
	js.toDesc = "GPS反馈";
	js.toNumber = num;
	js.type = 6;
	var infoAtr = JSON.stringify(js);
	window.top.m_IdtApi.IMSend(fn_genSn(), IDT.IM_TYPE_CONF, num, infoAtr, null, null);
}
function removeSosMapWarn(num) {
	window.mapSosObj = window.mapSosObj || {};
	if (window.mapSosObj && window.mapSosObj[num]) {
		if (window.mapSosObj[num][0]) {
			window.mapSosObj[num][0].setMap(null);
			window.mapSosObj[num][0] = null;
		}
		if (window.mapSosObj[num][1]) {
			window.mapSosObj[num][1].setMap(null);
			window.mapSosObj[num][1] = null;
		}
		if (window.mapSosObj[num][2].flag == true) {
			fn_delOneOverLay(num);
			window.mapSosObj[num][2] = null;
		}
 	 	delete window.mapSosObj[num];
	}
}

//谷歌地图API功能
//SOS警告信息覆盖物
function ComplexCustomOverlayOfSos(num, point, warnText, alarmUUID) {
	this._num = num;
	this._point = point;
	this.warnText = warnText;
	if (!alarmUUID) alarmUUID = '';
	this._alarmUUID = alarmUUID;
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.zIndex = 999999;
	div.className = "sosPanel";
	div.id = this._num;
	div.setAttribute("alarmUUID",this._alarmUUID);
	var infoDiv = this._infoDiv = document.createElement("div");
	infoDiv.className = "sosInfo";
	var imgDiv = this._imgDiv = document.createElement("div");
	imgDiv.className = "img-wrap";
	infoDiv.appendChild(imgDiv);
	var img = this._img = document.createElement("img");
	img.src ="static/img/eleWarn.gif";
	imgDiv.appendChild(img);
	var textDiv = this._textDiv = document.createElement("div");
	textDiv.className = "text";
	textDiv.innerHTML = this.warnText;
	infoDiv.appendChild(textDiv);
	div.appendChild(infoDiv);
	this.setMap(map);
}
ComplexCustomOverlayOfSos.prototype = new google.maps.OverlayView();
ComplexCustomOverlayOfSos.prototype.onAdd = function() {
 	var panes = this.getPanes();
 	panes.overlayMouseTarget.appendChild(this._div);
}
ComplexCustomOverlayOfSos.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this._div;
	div.style.left = (pixel.x - 90) + 'px';
	div.style.top = (pixel.y - 100) + 'px';
}
ComplexCustomOverlayOfSos.prototype.onRemove = function() {  
	this._div.parentNode.removeChild(this._div);  
	this._div = null;  
}
ComplexCustomOverlayOfSos.prototype.move = function(newPoint) {
	this._point = newPoint;
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this._div;
	div.style.left = (pixel.x - 90) + 'px';
	div.style.top = (pixel.y - 100) + 'px';
}
ComplexCustomOverlayOfSos.prototype.addEventListener = function(event, fun) {
	this._div['on'+event] = fun;
	this.event = this.event || {};
	this.event['on' + event] = fun;
}

//SOS地图定位覆盖物。
function ComplexCustomOverlayOfSosPos(num, point, alarmUUID) {
	this._num = num;
	this._point = point;
	if (!alarmUUID) alarmUUID = '';
	this._alarmUUID = alarmUUID;
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.zIndex = 999999;
	div.className = "sosPos";
	div.id = this._num;
	div.setAttribute("alarmUUID",this._alarmUUID);
	this.setMap(map);
}
ComplexCustomOverlayOfSosPos.prototype = new google.maps.OverlayView();
ComplexCustomOverlayOfSosPos.prototype.onAdd = function() {
 	var panes = this.getPanes();
 	panes.overlayMouseTarget.appendChild(this._div);
}
ComplexCustomOverlayOfSosPos.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this._div;
	div.style.left = (pixel.x - 17) + 'px';
	div.style.top = (pixel.y - 5) + 'px';
}
ComplexCustomOverlayOfSosPos.prototype.onRemove = function() {
	this._div.parentNode.removeChild(this._div);  
	this._div = null;  
}
ComplexCustomOverlayOfSosPos.prototype.move = function(newPoint) {
	this._point = newPoint;
	var overlayProjection = this.getProjection();
	var pixel = overlayProjection.fromLatLngToDivPixel(this._point);
	var div = this._div;
	div.style.left = (pixel.x - 17) + 'px';
	div.style.top = (pixel.y - 5) + 'px';
}
ComplexCustomOverlayOfSosPos.prototype.addEventListener = function(event, fun) {
	this._div['on'+event] = fun;
	this.event = this.event || {};
	this.event['on' + event] = fun;
}