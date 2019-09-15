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


// 世界大地坐标转为百度坐标
function wgs2bd(lat,lon) {
    var wgs2gcjR = wgs2gcj(lat, lon);
    var gcj2bdR = gcj2bd(wgs2gcjR[0], wgs2gcjR[1]);
    return gcj2bdR;
}

function gcj2bd(lat,lon) {
    var x = lon, y = lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    var result = [];
    result.push(bd_lat);
    result.push(bd_lon);
    return result;
}

function bd2gcj(lat,lon) {
    var x = lon - 0.0065, y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lon = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    var result = [];
    result.push(gg_lat);
    result.push(gg_lon);
    return result;
}

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

function bd2wgs(lng,lat){
	var gcjData = bd2gcj(lat,lng);
	var wgsData = gcjtowgs(gcjData[1],gcjData[0]);
	return wgsData[0].toFixed(6)+","+wgsData[1].toFixed(6);
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

var BMap = window.BMap = BMap || {};
BMap.BPoint = function(lng, lat) {
	var _t = wgs2bd(lat,lng);
	return new BMap.Point(_t[1], _t[0]);
}

//紫色：#9E6B99 PC调度台
//蓝色：#145385 移动终端
//绿色：#006100 监控头
//红色：#A01A1A 车载台
//黄色：#D18315 固定话机
//浅蓝：#77ABCF GPS定位器

// 终端用户的自定义覆盖物
function EndUserOverlay(point, num, name, imgSrc, isStatic, color, onLineFlag, mapTailFlag, guardObj, noBorder) {
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
	if (noBorder && (noBorder == '1' || noBorder == true)) {
		this._noBorderr = true;
	} else {
		this._noBorder = false;
	}
	if (guardObj) this.guardObj = guardObj;
	this.className = "EndUserOverlay";
}
EndUserOverlay.prototype = new BMap.Overlay();
EndUserOverlay.prototype.getPosition = function() {
	return this._point;
}
EndUserOverlay.prototype.getMap = function() {
	return this._map;
}
EndUserOverlay.prototype.getConvHtml = function() {
	var htmlStr = "";
	htmlStr += '<li id="' + this._num + '" endUserName="' + this._name + '" endUserImgSrc="' + this._imgSrc + '" endUserPoint="' + this._point.lng + ',' + this._point.lat + '">';
	if (this._onLineFlag == false) {
		htmlStr += '<div class="lableDiv leave" style="background-color:' + this._color + ';" title="' + this._name + '">' + this._name + '</div>';
		htmlStr += '<div class="imgDiv leave" style="border-color:' + this._color + ';"><img src="' + this._imgSrc + '" alt="无图片"></div></li>';
	} else {
		htmlStr += '<div class="lableDiv" style="background-color:' + this._color + ';" title="' + this._name + '">' + this._name + '</div>';
		htmlStr += '<div class="imgDiv" style="border-color:' + this._color + ';"><img src="' + this._imgSrc + '" alt="无图片"></div></li>';
	}
	return htmlStr;
}
EndUserOverlay.prototype.initialize = function(map) {
	this._map = map;
	var mainDiv = this._mainDiv = document.createElement("div");
	mainDiv.id = this._num;
	mainDiv.className = "endUser";
	if (this._onLineFlag == false) mainDiv.className += " leave";
	if (this._mapTailFlag == true) mainDiv.className += " concern";
	mainDiv.style.position = "absolute";
	if (this._noBorder == false) {
		mainDiv.style.border = "1px solid " + this._color;
	} else {
		mainDiv.style.border = "0px solid " + this._color;
//		mainDiv.style.opacity = "0.6";
	}
	mainDiv.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
	mainDiv.setAttribute("endUserName",this._name);
	mainDiv.setAttribute("endUserImgSrc",this._imgSrc);
	mainDiv.setAttribute("endUserPoint",this._point.lng + "," + this._point.lat);
	if (this.guardObj) mainDiv.setAttribute("guardData", JSON.stringify(this.guardObj));
	var arrowDiv = this._arrowDiv = document.createElement("div");
	arrowDiv.className = "endUserAfter";
	if (this._noBorder == false) {
		arrowDiv.style['border-left'] = "4px solid " + this._color;
		arrowDiv.style['border-bottom'] = "4px solid " + this._color;
	} else {
		arrowDiv.style.border = "0px solid " + this._color;
	}
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
	
	this._map.getPanes().labelPane.appendChild(mainDiv);
	
	//添加相关事件。
	if (this.event) {
		for (var e in this.event) {
			this._mainDiv[e] = this.event[e];
		}
	}
	return mainDiv;
}
EndUserOverlay.prototype.draw = function() {
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	this._mainDiv.style.left = pixel.x - 17 + "px";
	this._mainDiv.style.top = pixel.y - 40 + "px";
//	if (this._onLineFlag == false && window.top.bIsIe == true) grayscale($(this._img));
}
EndUserOverlay.prototype.move = function(newPoint) {
	var map = this._map;
	this._point = newPoint;
	this._mainDiv.setAttribute("endUserPoint",this._point.lng + "," + this._point.lat);
	var pixel = map.pointToOverlayPixel(this._point);
	this._mainDiv.style.left = pixel.x - 17 + "px";
	this._mainDiv.style.top = pixel.y - 40 + "px";
}
EndUserOverlay.prototype.setIsStatic = function(isStatic) {
	this._static = isStatic;
}
EndUserOverlay.prototype.setOnLineFlag = function(onLineFlag) {
	var $mainDiv = $(this._mainDiv);
	if (onLineFlag && (onLineFlag == '1' || onLineFlag == true)) {
		this._onLineFlag = true;
		$mainDiv.removeClass('leave');
	} else {
		this._onLineFlag = false;
		$mainDiv.addClass('leave');
	}
}
EndUserOverlay.prototype.setMapTailFlag = function(mapTailFlag) {
	var $mainDiv = $(this._mainDiv);
	if (mapTailFlag && (mapTailFlag == '1' || mapTailFlag == true)) {
		this._mapTailFlag = true;
		$mainDiv.addClass('concern');
	} else {
		this._mapTailFlag = false;
		$mainDiv.removeClass('concern');
	}
}
EndUserOverlay.prototype.addCallGif = function(gifType) {
	if (!gifType || gifType == '') return;
	var $mainDiv = $(this._mainDiv);
	var htmlStr = '<img class="gif" src="static/img/' + gifType + '.gif" alt=""/>';
	$mainDiv.append(htmlStr);
}
EndUserOverlay.prototype.delCallGif = function() {
	var $mainDiv = $(this._mainDiv);
	$mainDiv.find('.gif').remove();
}
EndUserOverlay.prototype.addIMInfo = function(IMInfo) {
	if (!IMInfo || IMInfo == '') return;
	var $mainDiv = $(this._mainDiv);
	var htmlStr = '<div class="message" title="' + IMInfo + '">' + IMInfo + '</div><div class="corner"></div>';
	$mainDiv.append(htmlStr);
	setTimeout(function () {
		var $IM = $mainDiv.find('.message');
		$IM.fadeOut(200,function () {
			$IM.remove();
			$mainDiv.find('.corner').remove();
        })
    }, 15000);
}
EndUserOverlay.prototype.showTop = function() {
	var $mainDiv = $(this._mainDiv);
	$('.endUser').css('z-index','');
	$mainDiv.css('z-index','10');
}
EndUserOverlay.prototype.addEventListener = function(event,fun) {
    this._mainDiv['on'+event] = fun;
    this.event = this.event || {};
    this.event['on'+event] = fun;
}
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
//point：标注点的位置
//warnText：警告内容
//showMillisecond：警告时间 单位：毫秒
function addEleFenceMapWarn(point , warnText , showMillisecond){
	map.panTo(point);
	var myCompOverlay = new ComplexCustomOverlay(point , warnText);
	var myCompOverlay2 = new ComplexCustomOverlay2(point);
	map.addOverlay(myCompOverlay);
	map.addOverlay(myCompOverlay2);
//	addBGM();  //添加背景音乐
	if(warnText && warnText == lang.dispatch.IllegalElectronicFence){
		fn_ringOnceAutoStop('railAlarmIn.mp3');
	}else{
		fn_ringOnceAutoStop('railAlarmOut.mp3');
	}
	setTimeout(function(){
		map.removeOverlay(myCompOverlay);	
		map.removeOverlay(myCompOverlay2);	
//		killBGM();  //移除背景音乐
	},showMillisecond)
}
// 百度地图API功能
// 复杂的自定义覆盖物
function ComplexCustomOverlay(point , warnText){
  this._point = point;
  this.warnText = warnText;
}
ComplexCustomOverlay.prototype = new BMap.Overlay();
ComplexCustomOverlay.prototype.initialize = function(map){
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
	map.getPanes().labelPane.appendChild(div);
	return div;
}
ComplexCustomOverlay.prototype.draw = function(){
  var map = this._map;
  var pixel = map.pointToOverlayPixel(this._point);
  this._div.style.left = pixel.x + 20 + "px";
  this._div.style.top  = pixel.y - 40 + "px";
}
// 百度地图API功能
// 复杂的自定义覆盖物
function ComplexCustomOverlay2(point){
	this._point = point;
}
ComplexCustomOverlay2.prototype = new BMap.Overlay();
ComplexCustomOverlay2.prototype.initialize = function(map){
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.position = "absolute";
	div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
	div.className = "round";
	
	map.getPanes().labelPane.appendChild(div);
	return div;
}
ComplexCustomOverlay2.prototype.draw = function(){
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	this._div.style.left = pixel.x - 17 + "px";
	this._div.style.top  = pixel.y - 5 + "px";
}
function addBGM(){
	var audio = document.createElement('audio');
	audio.src = 'static/voice/eleFenceWarnMusic.mp3';
	audio.id = "eleWarnBackGround";
	document.body.appendChild(audio);
	audio.loop = true;
	audio.play();
}
function killBGM(){
	$('#eleWarnBackGround').stop();
	$('#eleWarnBackGround').remove();
}

//SOS求注信息在地图上的标注
//参数说明
//num：SOS求注人员的号码
//point：SOS求注点的位置
function addSOSMapWarn(num, nowLng, nowLat, alarmTime, alarmUUID) {
	if (!window.top.map) return;
	window.mapSosObj = window.mapSosObj || {};
	if (window.mapSosObj[num]) return;
	if (!alarmUUID) alarmUUID = '';
	var warnText = num + '&nbsp;&nbsp;SOS</br>' + alarmTime;
	var point = BMap.BPoint(nowLng, nowLat);
	// 地图定位到当前选中用户。
	setTimeout(function() {
		// 将界面定位到地图展示界面。
		if ($('#interface>.header .tab ul #menu_001001').length > 0  && $('#interface>.content>#panel_001001').length > 0) {
			$('#interface>.header .tab ul li').removeClass('active');
			$('#interface>.content>div').removeClass('active');
			$('#interface>.header .tab ul #menu_001001').addClass('active');
			$('#interface>.content>#panel_001001').addClass('active');
		}
		window.top.map.panTo(point);
	}, 500);
	//添加报警人员的地图覆盖物。
	var retObj = fn_addOneOverLay(num);
	//添加SOS的地图覆盖物。
	var myCompOverlay = new ComplexCustomOverlayOfSos(num, point, warnText, alarmUUID);
	var myCompOverlayPos = new ComplexCustomOverlayOfSosPos(num, point, alarmUUID);
	window.top.map.addOverlay(myCompOverlay);
	window.top.map.addOverlay(myCompOverlayPos);
	myCompOverlay.addEventListener('contextmenu',function(event) {
		var num = $(this).attr("id");
		var alarmUUID = $(this).attr("alarmUUID");
		fn_showSOSContextMenu(num, alarmUUID, event);
	});
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
			window.top.map.removeOverlay(window.mapSosObj[num][0]);
			window.mapSosObj[num][0] = null;
		}
		if (window.mapSosObj[num][1]) {
			window.top.map.removeOverlay(window.mapSosObj[num][1]);
			window.mapSosObj[num][1] = null;
		}
		if (window.mapSosObj[num][2] && window.mapSosObj[num][2].flag && window.mapSosObj[num][2].flag == true) {
			fn_delOneOverLay(num);
			window.mapSosObj[num][2] = null;
		}
 	 	delete window.mapSosObj[num];
	}
}

//百度地图API功能
//SOS警告信息覆盖物
function ComplexCustomOverlayOfSos(num, point, warnText, alarmUUID) {
	this._num = num;
	this._point = point;
	this.warnText = warnText;
	if (!alarmUUID) alarmUUID = '';
	this._alarmUUID = alarmUUID;
}
ComplexCustomOverlayOfSos.prototype = new BMap.Overlay();
ComplexCustomOverlayOfSos.prototype.initialize = function(map) {
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
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
	map.getPanes().labelPane.appendChild(div);
	return div;
}
ComplexCustomOverlayOfSos.prototype.draw = function() {
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	this._div.style.left = (pixel.x - 90) + 'px';
	this._div.style.top  = (pixel.y - 100) + 'px';
}
ComplexCustomOverlayOfSos.prototype.move = function(newPoint) {
	var map = this._map;
	this._point = newPoint;
	var pixel = map.pointToOverlayPixel(this._point);
	this._div.style.left = (pixel.x - 90) + 'px';
	this._div.style.top  = (pixel.y - 100) + 'px';
}
ComplexCustomOverlayOfSos.prototype.addEventListener = function(event,fun) {
    this._div['on'+event] = fun;
    this.event = this.event || {};
    this.event['on'+event] = fun;
}
//SOS地图定位覆盖物。
function ComplexCustomOverlayOfSosPos(num, point, alarmUUID) {
	this._num = num;
	this._point = point;
	if (!alarmUUID) alarmUUID = '';
	this._alarmUUID = alarmUUID;
}
ComplexCustomOverlayOfSosPos.prototype = new BMap.Overlay();
ComplexCustomOverlayOfSosPos.prototype.initialize = function(map) {
	this._map = map;
	var div = this._div = document.createElement("div");
	div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
	div.className = "sosPos";
	div.id = this._num;
	div.setAttribute("alarmUUID",this._alarmUUID);
	map.getPanes().labelPane.appendChild(div);
	return div;
}
ComplexCustomOverlayOfSosPos.prototype.draw = function() {
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	this._div.style.left = (pixel.x - 17) + 'px';
	this._div.style.top  = (pixel.y - 5) + 'px';
}
ComplexCustomOverlayOfSosPos.prototype.move = function(newPoint) {
	var map = this._map;
	this._point = newPoint;
	var pixel = map.pointToOverlayPixel(this._point);
	this._div.style.left = (pixel.x - 17) + 'px';
	this._div.style.top  = (pixel.y - 5) + 'px';
}
ComplexCustomOverlayOfSosPos.prototype.addEventListener = function(event,fun) {
    this._div['on'+event] = fun;
    this.event = this.event || {};
    this.event['on'+event] = fun;
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
function updateAttentionList(num, latLng) {
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
        if (window.attentionPolyLine) window.map.removeOverlay(window.attentionPolyLine);
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