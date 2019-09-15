console.log('load comm.js');
window.m_IdtApi = window.m_IdtApi || new CIdtApi();
window.IDT = IDT;
window.top.treeInfo = window.top.treeInfo || {};
window.top.TPPUInfo = null;
window.top.activeCallInfo = false; //当前是否有活动的话权抢占通讯。默认为false.
window.top.isNumLockOddPress = false; //numlock键奇偶次按键状态。
window.top.baseUrl = window.top.baseUrl || fn_getUploadUrl();
window.top.groupTreeData = {}; //用户树带单位节点的数据信息。
window.top.VehicledevList = [];
window.top.VmsLogin = false;
window.top.ExtraFunc = {
	userNum: 0,
	vmsParams: undefined,
};
window.top.CameraList = [];
window.top.oWebControl = undefined;
window.top.videoParam = {};

/**
 * begin: vms code
 */
function VMS_Login() {
	if (window.isTerm && !window.top.VmsLogin && window.top.ExtraFunc.vmsParams) {
		//console.log(window.devInfo);
		var vms = window.top.ExtraFunc.vmsParams;
		window.VehiclePlatLogin(vms.ip, vms.port, vms.epid, vms.uid, vms.pwd);
		window.top.VmsLogin = true;
	}
}

function ProcessVehicleData(res) {
	var objRes = JSON.parse(res);
	if (objRes.RetCode === '10001') {
		console.log('VMS error:', objRes.RetDesc);
		return;
	}
	if (objRes.Event === 'QUERYOBJSTATUS') {
		window.top.VehicledevList = objRes.VehicledevList;
		for(var Vehicle of objRes.VehicledevList) {
			if ( fn_IsVehicleOnMap(Vehicle.Devid) ) {
				fn_ShowHideVehicle(Vehicle.Devid, true);
			}
		}
	}
}

function checkVehicleListLoop() {
	VMS_Login();
	fn_freshVehicleList();
}
/**
 * end: vms code
 */

// 通讯开始。
function fn_wsstart(userData) {
	var CallBack = {
		onRecvMsgHook : fn_onRecvMsgHook,
		onSendMsgHook : fn_onSendMsgHook,
		onStatusInd : fn_onStatusInd,
		onGInfoInd : fn_onGInfoInd,
		onIMRecv : fn_onIMRecv,
		onGUOamInd : fn_onGUOamInd,
		onGUStatusInd : fn_onGUStatusInd,
		onGpsRecInd : fn_onGpsRecInd,
		onGpsHisQueryInd : fn_onGpsHisQueryInd,
		onCallInd : fn_onCallInd
	};
	window.m_IdtApi = window.m_IdtApi || new CIdtApi();
	window.userInfo = userData;
	var wsUrl = '', gpsUrl = '';
	if (fn_getNetWorkType() == 'inner') {
		wsUrl = getParaVal('ws_url');
		gpsUrl = getParaVal('gps_url');
	} else {
		wsUrl = getParaVal('wwws_url');
		if (wsUrl == '') wsUrl = getParaVal('ws_url');
		gpsUrl = getParaVal('wwgps_url');
		if (gpsUrl == '') gpsUrl = getParaVal('gps_url');
	}
	if (!gpsUrl || gpsUrl == '') { //未配GPSURL地址，则根据WSURL地址，自动产生该地址。
		var preProtocol = wsUrl.split(':')[0];
		if (preProtocol == 'ws') {
			gpsUrl = wsUrl.replace('10004','10005');
		} else if (preProtocol == 'wss') {
			gpsUrl = wsUrl.replace('mc_wss','gs_wss');
		}
	}
	var wsUser = userData.userInfo.num;
	var wsPwd = userData.userInfo.pwd;
	var iMaxTrans = getParaVal('iMaxTrans');
	var iMaxCall = getParaVal('iMaxCall');
	var iMaxStatueSubs = getParaVal('iMaxStatueSubs');
	var iMaxGpsSubs = getParaVal('iMaxGpsSubs');
	window.m_IdtApi.RUN_MODE = window.m_IdtApi.RUN_MODE_RELEASE;
	var bIsIe = isIe();
	window.top.bIsIe = bIsIe;
	window.m_IdtApi.Start(wsUrl, gpsUrl, wsUser, wsPwd, iMaxTrans, iMaxCall, iMaxStatueSubs, iMaxGpsSubs, CallBack, bIsIe);
}

// 获取当前URL网络环境。
function fn_getNetWorkType() {
	var netType = 'inner';
	var hostName = window.location.hostname;
	var hostArr = hostName.split('.');
	if (hostArr[0] == 'localhost' || hostArr[0] == '10' || hostArr[0] == '127' ||
		hostArr[0] == '172' || hostArr[0] == '192') {
		netType = 'inner';
	} else {
		netType = 'outer';
	}
	return netType;
}

// 获取参数值。
function getParaVal(paraCode) {
	if (!paraCode || paraCode == '' || !window.userInfo || !window.userInfo.paraValList || !window.userInfo.paraValList.length)
		return '';
	var len = window.userInfo.paraValList.length;
	for (var i = 0; i < len; i++) {
		if (window.userInfo.paraValList[i].PARA_CODE == paraCode) {
			if (window.userInfo.paraValList[i].DATA_TYPE == 'number') {
				return Number(window.userInfo.paraValList[i].PARA_VALUE);
			} else {
				return window.userInfo.paraValList[i].PARA_VALUE;
			}
		}
	}
	return '';
}

// 保存参数值。
function saveParaVal(paraCode, paraVal) {
	$.ajax({
		type : "POST",
		url : "webservice/api/v1/comm/SysParam/update",
		data : {
			PARA_CODE : paraCode,
			PARA_VALUE : paraVal
		},
		dataType : "json",
		success : function(data) {
			if (data == true) {
				if (!paraCode || paraCode == '' || !window.userInfo ||
					!window.userInfo.paraValList || !window.userInfo.paraValList.length)
					return;
				var len = window.userInfo.paraValList.length;
				for (var i = 0; i < len; i++) {
					if (window.userInfo.paraValList[i].PARA_CODE == paraCode) {
						if (window.userInfo.paraValList[i].DATA_TYPE == 'number') {
							window.userInfo.paraValList[i].PARA_VALUE = Number(paraVal);
						} else {
							window.userInfo.paraValList[i].PARA_VALUE = paraVal;
						}
					}
				}
			}
		}
	});
}

// 通讯断开退出。
function fn_wsexit() {
	if (window.m_IdtApi) window.m_IdtApi.Exit();
}

// 通用的上报GPS的函数。
function fn_GpsReport(num, pointX, pointY) {
	if (!window.top.m_IdtApi) return false;
	if (!num || !pointX) return false;
	var lng, lat;
	if (!pointY) { // 只有两个参数，表示第二个参数传入的是经纬度合成的字符串或数组。
		if (typeof(pointX) == 'object') { // 表示是数组。
			if ((pointX instanceof Array)) {
				if (pointX.length && pointX.length == 2) {
					lng = Number(pointX[0]);
					lat = Number(pointX[1]);
				} else {
					return false;
				}
			} else if (pointX.lng && pointX.lat) {
				lng = Number(pointX.lng);
				lat = Number(pointX.lat);
			}
		} else if (typeof(pointX) == 'string') {
			var point = pointX.split(',');
			if (point.length && point.length == 2) {
				lng = Number(point[0]);
				lat = Number(point[1]);
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else {
		lng = Number(pointX);
		lat = Number(pointY);
	}
	if ((!lng && lng!=0) || (!lat && lat!=0)) return false;
	var curTime = new Date();
	curTime = curTime.Format('yyyy-MM-dd HH:mm:ss');
	window.top.m_IdtApi.GpsReport(num, lng.toFixed(6), lat.toFixed(6), 0, 0, curTime);
	return true;
}

// 收到消息的钩子函数
function fn_onRecvMsgHook() {

}

// 发送消息的钩子函数
function fn_onSendMsgHook() {

}

// 登录状态指示
function fn_onStatusInd(status, usCause) {
	console.log("fn_onStatusInd", status, usCause);
	fn_InitPopWrap();
	if (status == 0) {
		if (usCause == 33) { //33:用户重复登陆，后用户踢掉当前用户。14
			$.messager.alert(lang.dispatch.prompt,lang.dispatch.systemWillWithdrawn,'warning',function(){
				fn_wsexit();
				window.top.location.href = 'logout?logoutFlag=1';
			});
			$(".panel-tool-close").css("display","none");
		} else if (usCause == 0) { //正常系统退出，无需做任何处理。
			return;
		} else {
			cuttingWarn();
			$('#interface .header .user .photo').css('border','2px solid red');
		}
	} else if (status == 1) {
		// success login and connect to WS server
		window.top.logintime = (new Date).getTime();
		//console.log('userInfo', window.top.userInfo.userInfo.num)
		var userNum = Number(window.top.userInfo.userInfo.num);
		window.top.ExtraFunc.userNum = userNum;
		window.onbeforeunload= function(event) {
			if(window.top.oWebControl) {
				oWebControl.JS_RequestInterface({
					funcName: "stopAllPreview"
				}).then(function (oData) {
					window.top.oWebControl.JS_RequestInterface({
						funcName: "uninit"
					}).then(function (oData) {
						window.top.oWebControl.JS_RequestInterface({
							funcName: "destroyWnd"
						}).then(function (oData) {
						});
					});
				});
			}
		};

		// 衡阳
		if (userNum >= 9000 && userNum < 10000) {
			window.top.ExtraFunc.vmsParams = undefined;
			$('.workOrderWrap>div').css('display', 'none');
			$('.cameraWrap>div').css('display', 'none');
			$('.vehicleWrap>div').css('display', 'none');
		}
		// 开发
        else if ((userNum >= 6000 && userNum < 7000) || (userNum >= 7000 && userNum < 8000)) {
			window.top.ExtraFunc.vmsParams = {
				ip: '183.215.100.6',
				port: '9988',
				epid: 'system',
				uid: 'admin',
				pwd: ''
			};
			setInterval(checkVehicleListLoop,5000);
			if (window.isTerm) {
				$('.workOrderWrap>div').css('display', 'block');
				$('.cameraWrap>div').css('display', 'block');
				// $('.vehicleWrap>div').css('display', 'block');
			}
			window.top.CameraList = [
                { cameraName: '研发二部',   cameraIndexCode: '2c805fa0685048ac8a47e634d9e90dfb' },
                { cameraName: '公司阳台侧走廊',   cameraIndexCode: 'a2e05afe231f42079462411c42ce62e0' },
                { cameraName: '实验室2',   cameraIndexCode: 'eb28db4c6379486f89b4822187b0d512' },
			];
			window.top.videoParam = {
				appkey: '22456842',
				secret: 'OTbcyOwQBOTDHEO09CCm',
				ip: '111.22.211.59',
				port: 81,
				snapDir: 'D:\\SnapDir',
				layout: '2x2',
				streamMode: 0,	// 0-main stream, 1-sub stream
				transMode: 1,	// 0-UDP, 1-TCP
				gpuMode: 0		// 0-disable gpu decoder, 1-enable gpu decorder
			};
		}
		// 安江
		else if (userNum >= 100000 && userNum < 200000) {
			window.top.ExtraFunc.vmsParams = {
				ip: '111.22.211.58',
				port: '9988',
				epid: 'anjiang',
				uid: 'anjiang',
				pwd: 'Vistek2017'
			};
			setInterval(checkVehicleListLoop,5000);
			if (window.isTerm) {
				$('.workOrderWrap>div').css('display', 'block');
				$('.cameraWrap>div').css('display', 'block');
				// $('.vehicleWrap>div').css('display', 'block');
			}
			window.top.CameraList = [
				{ cameraName: '布控球1',   cameraIndexCode: 'f2a67a96841c4799bb0e2038f3052ddc' },
				{ cameraName: '布控球2',   cameraIndexCode: 'c3dfef5549da4ae7907ff7ff41be4fda' },
				{ cameraName: '云台半球1', cameraIndexCode: 'c2735f9539c64455b70f91979063b2fa' },
				{ cameraName: '施工监控1', cameraIndexCode: '073161d9ee66465eb05c2aed3e5311f3' },
				{ cameraName: '施工监控2', cameraIndexCode: 'ee659bc23a494a18bd98ff97161a7a4f' },
				{ cameraName: '施工监控3', cameraIndexCode: '6713951fc23a45f58c674518ecd3ac82' },
				{ cameraName: '施工监控4', cameraIndexCode: 'cbd7be4994254b73bce8ad5d40f90fe7' },
				{ cameraName: '施工监控5', cameraIndexCode: '7ec103e4e3b74b8d9586b76db0a664e3' },
				{ cameraName: '施工监控6', cameraIndexCode: 'feb55abd867741f0b2ff61058c0c4ecd' },
			];
			window.top.videoParam = {
				appkey: '22456842',
				secret: 'OTbcyOwQBOTDHEO09CCm',
				ip: '111.22.211.59',
				port: 81,
				snapDir: 'D:\\SnapDir',
				layout: '2x2',
				streamMode: 0,	// 0-main stream, 1-sub stream
				transMode: 1,	// 0-UDP, 1-TCP
				gpuMode: 0		// 0-disable gpu decoder, 1-enable gpu decorder
			};
		}
		// others
		else {
			window.top.ExtraFunc.vmsParams = undefined;
			$('.workOrderWrap>div').css('display', 'none');
			$('.cameraWrap>div').css('display', 'none');
			$('.vehicleWrap>div').css('display', 'none');
		}

		removeCutWarn();
		$('#interface .header .user .photo').css('border','2px solid #FFF');
		window.m_IdtApi.StatusSubs(IDT.GU_STATUSSUBS_STR_CLEARALL, IDT.GU_STATUSSUBS_DETAIL1);
		if (fn_getTreeType() == 'all') {
			window.m_IdtApi.StatusSubs(IDT.GU_STATUSSUBS_STR_ALL, IDT.GU_STATUSSUBS_DETAIL1);
		} else if (fn_getTreeType() == 'own') {
			window.m_IdtApi.StatusSubs(IDT.GU_STATUSSUBS_STR_GROUP, IDT.GU_STATUSSUBS_DETAIL1);
		}
		//console.log('fn_gTreeInit')
		//fn_gTreeInit('.dispatch > .left .ulWrap .treeWrap .tree');
	}
}

// 组信息指示,指示用户在哪些组里面
function fn_onGInfoInd(gInfo) {}

// 小组树相关信息初始化获取。
function fn_treeInfoInit() {
	window.top.treeInfo = {};
	// 用户所在组信息。
	fn_getUserGroup();
	// 用户所属单位信息。
	window.top.treeInfo.orgInfo = window.top.treeInfo.orgInfo || window.top.userInfo.orgInfoMap;
	window.top.treeInfo.orgFlag = true;
	// 小组树的类型。
	window.top.treeInfo.treeType = window.top.treeInfo.treeType || fn_getTreeType();
	// 单位的所有组信息。
	fn_getGroupAll();
	// 单位的所有张端用户信息。
	fn_getEndUserAll();
	// 如果第三方平台的信息为空，则检索第三方平台的信息。
	if (!window.top.TPPUInfo) fn_getThirdPartyPlatUser('0');
}

//获取视频码流与分辨率等信息。
function getResolutionListOptions(resolutions){
	var results = [];
	for(var i = 0 ; i < resolutions.length ; i++){
        var textValue = '';
		var resolution = resolutions[i];
        if(resolutionHasIt(resolution , '240') && resolutionHasIt(resolution , '320')) textValue = resolution + '*300kbps';
        if(resolutionHasIt(resolution , '480') && resolutionHasIt(resolution , '640')) textValue = resolution + '*800kbps';
        if(resolutionHasIt(resolution , '720') && resolutionHasIt(resolution , '1280')) textValue = resolution + '*2000kbps';
        if(resolutionHasIt(resolution , '1080') && resolutionHasIt(resolution , '1920')) textValue = resolution + '*3000kbps';
        if(resolutionHasIt(resolution , '480') && resolutionHasIt(resolution , '720')) textValue = resolution + '*1200kbps';
        while(textValue.indexOf('*') != -1 ){
        	textValue = textValue.replace('*' , 'x');
        }
		results[results.length] = '<option value="'+ resolution +'">' + textValue + '</option>';
	}
	return results;
}

// 短信接收指示
function fn_onIMRecv(pucSn, dwType, pcFrom, pcFromName, pcTo, pcOriTo, pcTxt, pcFileName, pcSourceFileName, pcTime) {
	if (dwType == '18') return; // 1文本、2位置信息、3图片、4录音、5录像、6文件、17会议链接、18组呼录音上传。
	if (dwType == '17' && pcTxt.type == 3 && pcTxt.subPara.type == 0) { // 有人员做了头像变更。
		// 刷新指挥调度中的小组树。
		//fn_gTreeInit('.dispatch > .left .ulWrap .treeWrap .tree');
		return;
	}
	if (dwType == '17' && pcTxt.messageId) { // messageId：视频查询 视频设置的Id meetId:会议链接的Id
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 2 && pcTxt.fromDesc == "视频查询") {
			console.log(pcTxt);
			var resolution = pcTxt.subPara.resolution; // 当前分辨率
			var resolutions = pcTxt.subPara.videoPara.resolutionList; // 所有分辨率
			var resolutionsOptions = getResolutionListOptions(resolutions);
			$('#setResolution').html("");
			for(var i = 0 ; i < resolutionsOptions.length ; i++){
				var resolutionsOption = resolutionsOptions[i];
				$('#setResolution').append(resolutionsOption);
			}
			var bitrate = pcTxt.subPara.bitrate; // 码率
			var framerate = pcTxt.subPara.framerate; // 帧率
			var maxBitrate = pcTxt.subPara.videoPara.maxBitrate;   // 最大码率
			var minBitrate = pcTxt.subPara.videoPara.minBitrate;   // 最小码率
			var maxFramerate = pcTxt.subPara.videoPara.maxFramerate;   // 最大帧率
			var minFramerate = pcTxt.subPara.videoPara.minFramerate;   // 最小帧率
			var resolutionList = pcTxt.subPara.videoPara.resolutionList;   // 所有分辨率
			$('#setResolution').find("option[value='" + resolution + "']").prop("selected", true);
			$('#setFramerate').find("option[value='" + framerate + "']").prop("selected", true);
			return;
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 2 && pcTxt.fromDesc == "视频设置") {
			console.log(pcTxt);
			return;
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 4) { //收到视频转发请求。
			var viewNum = pcTxt.subPara.toNum;
			var userInfo = fn_getUserInfoDetail(viewNum);
			var viewName = userInfo.Name;
			fn_videoView(viewNum, viewName);
			return;
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 7) { //视频截图。
			if (!pcTxt.subPara || !pcTxt.subPara.type ) return;
			if (pcTxt.subPara.type == 1) { //收到视频截图请求。

			} else if (pcTxt.subPara.type == 2) { //收到视频截图成功的截图文件信息。
				var baseUrl = window.top.baseUrl;
				var imgSrc = baseUrl + pcTxt.subPara.imageFilePath + '/' + pcTxt.subPara.imageFileName;
				fn_openCutImgDlg(imgSrc);
			}
			return;
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 1 && pcTxt.fromDesc == "GPS查询") {
			console.log(pcTxt);
			var isopen = pcTxt.subPara.open;
			if(isopen){
				$('#gpskg').prop('checked',true);
			}else{
				$('#gpskg').prop('checked',false);
			}
			var frequencyTime = pcTxt.subPara.frequencyTime;  //单位：秒
            $('#gpsscpl').find("option[value='" + frequencyTime + "']").prop("selected", true);
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 1 && pcTxt.fromDesc == "GPS设置") {
			console.log(pcTxt);
			return;
		}
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 6 && pcTxt.fromDesc == "SOS查询") {
			console.log(pcTxt);
			var isopen = pcTxt.subPara.open;
			if (isopen) {
				$('#soskg').prop('checked',true);
			} else {
				$('#soskg').prop('checked',false);
			}
		}
		//SOS报警
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 6 && pcTxt.fromDesc == "SOS报警") {
			var nowLat = pcTxt.subPara.latitude;
			var nowLng = pcTxt.subPara.longitude;
			var alarmTime = pcTxt.subPara.time;
			var alarmUUID = pcTxt.subPara.uuid;
			var num = pcTxt.fromNumber;
			if (pcTxt.subPara.type == 8) { //终端主动退出SOS，需清除掉地图上的相关SOS报警信息。
				removeSosMapWarn(num);
				fn_stopRingVoice('SOS' + num);
			} else { //终端SOS报警，需在地图上展示出相关SOS报警信息。
				fn_startRingVoice('alarm.mp3','SOS' + num);
				addSOSMapWarn(num, nowLng, nowLat, alarmTime, alarmUUID);
			}
		}
		//警情上报情况
		if (pcTxt && pcTxt.fromDesc && pcTxt.type && pcTxt.type == 10) {
			console.log(pcTxt);
			var param = [];
			param.push(pucSn);
			param.push(dwType);
			param.push(pcFrom);
			param.push(pcTo);
			param.push(pcOriTo);
			param.push(pcTxt);
			param.push(pcFileName);
			param.push(pcSourceFileName);
			param.push(pcTime);
			param.push(pcFromName);
			var CAS_CODE = pcTxt.subPara.CAS_CODE;
			fn_insPerNotAnswerLog("caseMessage",param);
			fn_noticeCallIn('caseMessage',param,function(){
				caseDetailShow( null , CAS_CODE);
			});
		}
	} else {
		if (pcOriTo.indexOf("9999910") > 0 && pcOriTo.length!=pcFrom.length) {
			$.ajax({
				type : "POST",
				url : 'webservice/api/v1/comm/sysCommSaverec/insertMsg',
				data : {
					NUM: pcFrom,
					PEERNUM:  window.top.userInfo.userInfo.num,
					STARTTIME: pcTime,
					ENDTIME: pcTime,
					OT: "1",
					SRVTYPE: "80",
					MEDIATYPE: "17",
					TEXT: JSON.stringify(pcTxt),
					ISANSWER: "0",
					ANSWERTIME: pcTime
				},
				dataType : "json",
				success : function(data) {
					var param = [];
					param.push(pucSn);
					param.push(dwType);
					param.push(pcFrom);
					param.push(window.top.userInfo.userInfo.num);
					param.push(window.top.userInfo.userInfo.num);
					param.push(pcTxt);
					param.push(pcFileName);
					param.push(pcSourceFileName);
					param.push(pcTime);
					param.push(pcFromName);
					console.log(pcFromName);
					fn_insPerNotAnswerLog("message",param);
//					fn_ringOnceAutoStop('IMIn.mp3');
					fn_noticeCallIn('message',param);
				}
			});
		} else {
			var param = [];
			param.push(pucSn);
			param.push(dwType);
			param.push(pcFrom);
			param.push(pcTo);
			param.push(pcOriTo);
			param.push(pcTxt);
			param.push(pcFileName);
			param.push(pcSourceFileName);
			param.push(pcTime);
			param.push(pcFromName);
			fn_insPerNotAnswerLog("message",param);
//			fn_ringOnceAutoStop('IMIn.mp3');
			fn_noticeCallIn('message',param);
		}
	}
}

// 用户/组OAM操作指示
function fn_onGUOamInd(dwOptCode, pucGNum, pucGName, pucUNum, pucUName, ucUAttr) {
	// 刷新指挥调度中的小组树。
	//fn_gTreeInit('.dispatch > .left .ulWrap .treeWrap .tree');
	// 刷新系统开户中的小组树。
	if ($("#iframe_001002").contents().find("#GUOamIndRefreshTree").length > 0 && $("#iframe_001002")[0].contentWindow.treeRefresh) { // 树存在才刷新。
		$("#iframe_001002")[0].contentWindow.treeRefresh();
	}
	// 刷新地图中的覆盖物。
	fn_initMapEndUser();
}

// 用户/组状态指示
function fn_onGUStatusInd(GMemberStatus) {
	if (!GMemberStatus || !GMemberStatus.length) return;
	window.top.callStatus = window.top.callStatus || {};
	var numArr = [];
	for (var i = 0; i <GMemberStatus.length; i++) {
		var num = GMemberStatus[i].Num;
		var status = GMemberStatus[i].Status;
		var endUser = fn_getEndUserOverlay(num);
		if (GMemberStatus[i].CallDetail.length > 0) { // 通讯中。
			var gifType = 'scall';
			for (var j = 0; j < GMemberStatus[i].CallDetail.length; j++) { // 对端用户状态变更。
				var callDetail = GMemberStatus[i].CallDetail[j];
				var callType = callDetail.CallType;
				var callStatus = callDetail.CallStatus;
				var peerNum = callDetail.PeerNum;
				if (callType == 16 || callType == 19 || callType == 20) {
					gifType = 'scall';
				} else if (callType == 17 || callType == 18) {
					gifType = 'gcall';
				} else if (callType == 21 || callType == 22) {
					gifType = 'vview';
				}
				window.top.callStatus[peerNum] = gifType;
				var peerUser = fn_getEndUserOverlay(peerNum);
				if (peerUser) peerUser.addCallGif(gifType);
				fn_userListAddGif(peerNum, gifType);
			}
			// 本端用户状态变更。
			window.top.callStatus[num] = gifType;
			if (endUser) endUser.addCallGif(gifType);
			fn_userListAddGif(num, gifType);
		} else {
			// 本端用户状态变更。
			window.top.callStatus[num] = null;
			delete window.top.callStatus[num];
			if (endUser) endUser.delCallGif();
			fn_userListAddGif(num);
		}

		numArr.push({
			Num : num,
			Status : status
		});
		// 如果是第三方平台的用户账号，则变更相关用户账号的状态。
		if (num.indexOf('*') != -1) {
			var minPos = 0, maxPos = window.top.TPPUInfo.orgTPPUList.length - 1;
			while (minPos <= maxPos) {
				var midPos = Math.floor((minPos + maxPos) / 2);
				var midObj = window.top.TPPUInfo.orgTPPUList[midPos];
				if (num == midObj.Num) { //找到了相关人员。
					window.top.TPPUInfo.orgTPPUList[midPos].Status = status;
					break;
				} else if (num < midObj.Num) {
					maxPos = midPos - 1;
				} else {
					minPos = midPos + 1;
				}
			}
		}
	}

	// 刷新小组树以及人员列表。
	fn_gTreeRefresh(numArr);

	/**
	 * start: vistek alex 2019-06-30
	 */
	if (!window.top.userStatus) {
		window.top.userStatus = {
			online: new Set(),
			offLine: new Set()
		}
	}
	if ( window.top.groupTreeData &&
		window.top.groupTreeData.attributes &&
		window.top.groupTreeData.attributes.onLine &&
		window.top.groupTreeData.attributes.offLine) {
		var device_list = [], online_list = window.top.groupTreeData.attributes.onLine, offline_list = window.top.groupTreeData.attributes.offLine;
		device_list = device_list.concat(offline_list);
		device_list = device_list.concat(online_list);
		function getNameByNum(num) {
			var resName = num.toString();
			for(var index in device_list) {
				var objItem = device_list[index]
				if ( objItem && objItem.Num.toString() == num.toString()) {
					resName = objItem.Name.toString();
					break;
				}
			}
			return resName;
		}
		for (var i = 0; i <GMemberStatus.length; i++) {
			var objStat = GMemberStatus[i];
			if (objStat.CallDetail.length == 0 && objStat.CallNum == 0 && objStat.Type == 1) {
				var num = objStat.Num.toString();
				var name = getNameByNum(num);
				var status = objStat.Status.toString();
				if (status == "0" )
					status = "2";
				//console.log("fn_onGUStatusInd: updating", {status, num, name}, objStat);
				if (objStat.Status == 1 && !window.top.userStatus.online.has(num) ||
					objStat.Status == 0 && !window.top.userStatus.offLine.has(num)) {
					console.log("fn_onGUStatusInd: update", {status, num, name});
					if (window.DealObjONOFF && typeof window.DealObjONOFF == "function")
						window.DealObjONOFF(status, num, name);
				} else {
					//console.log("fn_onGUStatusInd: no need update", window.top.userStatus);
					//console.log("fn_onGUStatusInd: ignore update", {status, num, name});
				}
			}
		}
	}

	for (var i = 0; i <GMemberStatus.length; i++) {
		var objStat = GMemberStatus[i];
		if (objStat.CallDetail.length == 0 && objStat.CallNum == 0 && objStat.Type == 1) {
			var usrNum = objStat.Num.toString();
			//console.log("fn_onGUStatusInd: record status", objStat);
			if (objStat.Status == 1) {
				window.top.userStatus.online.add(usrNum);
				if (window.top.userStatus.offLine.has(usrNum))
					window.top.userStatus.offLine.delete(usrNum);
			} else {
				window.top.userStatus.offLine.add(usrNum);
				if (window.top.userStatus.online.has(usrNum))
					window.top.userStatus.online.delete(usrNum);
			}
		}
	}
	/**
	 * end
	 */
}

// 用户列表中的终端添加通讯状态动画。
function fn_userListAddGif(num, gifType) {
	if (!num || num == '') return;
	var $obj = $(".dispatch>.left>.group>.groupUl>ul>li[endUserId='" + num + "']");
	if ($obj.length <= 0) return;
	//删除旧动画。
	$obj.find('.callGif').remove();
	if (gifType && gifType !='') { //添加新动画。
		var htmlStr = "<div class='callGif'><img src='static/img/" + gifType + ".gif' alt='"+lang.dispatch.noPicture+"'/></div>";
		$obj.append(htmlStr);
	}
}

// 获取上传URL地址以及运行模式。
function fn_getUploadUrl() {
	var uploadUrl = '/upload/';
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/SysParam/getRunModeInfo',
		async : false,
		data : {},
		dataType : "json",
		success : function(data) {
			if (data && data.run_mode && data.run_mode == 'develop') {
				uploadUrl = data.uploadUrl;
			}
		}
	});
	return uploadUrl;
}

// 刷新小组树以及人员列表。
function fn_gTreeRefresh(numArr) {
	if (!numArr || !numArr.length || numArr.length <= 0 || !window.top.treeInitFlag) return;
	var $jqTree = $('.dispatch > .left .ulWrap .treeWrap .tree');
	var roots = $jqTree.tree('getRoots');
	if (roots && roots.length && roots.length > 0) {
		window.top.groupTreeData.children = [];
		for (var i = 0; i < roots.length; i ++) {
			var rootData = $jqTree.tree('getData', roots[i].target);
			freshNodeData(rootData);
			window.top.groupTreeData.children.push(rootData);
		}
	}
	refreshOnOrOffLine(window.top.groupTreeData);

	function refreshOnOrOffLine(nodeData) {
		var nodeName 	= nodeData.attributes.nodeName;
		var onLineArr 	= nodeData.attributes.onLine;
		var offLineArr 	= nodeData.attributes.offLine;
		// 变更节点的在线与离线人员列表数据。
		var userArr = fn_joinArray(onLineArr, offLineArr);
		onLineArr = [];
		offLineArr = [];
		for (var i = 0; i < userArr.length; i++) {
			for (var j = 0; j < numArr.length; j++) {
				if (numArr[j].Num == userArr[i].Num) {
					userArr[i].Status = numArr[j].Status;
					break;
				}
				if (numArr[j].Num == userArr[i].Num.split('*')[0]) {
					if (numArr[j].Status == '0') {
						userArr[i].Status = '0'
					} else {
						userArr[i].Status = userArr[i]['OriStatus'] || '0';
					}
					break;
				}
			}
			if (userArr[i].Status == '1') {
				onLineArr.push(userArr[i]);
			} else {
				offLineArr.push(userArr[i]);
			}
		}
		nodeData.attributes.onLine = onLineArr;
		nodeData.attributes.offLine = offLineArr;
		nodeData.text = nodeName + "（" + onLineArr.length + "/" + (onLineArr.length + offLineArr.length) + "）";
	}


	function freshNodeData(nodeData) {
		// 取出当前节点信息。
		var nodeId 		= nodeData.attributes.nodeId;
		var nodeName 	= nodeData.attributes.nodeName;
		var nodeType 	= nodeData.attributes.nodeType;
		var nodeAgnum	= nodeData.attributes.nodeAgnum;
		var nodePrio	= nodeData.attributes.nodePrio;
		var nodeIsTPPU	= nodeData.attributes.nodeIsTPPU;
		var onLineArr 	= nodeData.attributes.onLine;
		var offLineArr 	= nodeData.attributes.offLine;

		// 变更在线与离线人员列表数据。
		var userArr = fn_joinArray(onLineArr, offLineArr);
		onLineArr = [];
		offLineArr = [];
		for (var i = 0; i < userArr.length; i++) {
			for (var j = 0; j < numArr.length; j++) {
				if (numArr[j].Num == userArr[i].Num) {
					userArr[i].Status = numArr[j].Status;
					break;
				}
				if (numArr[j].Num == userArr[i].Num.split('*')[0]) {
					if (numArr[j].Status == '0') {
						userArr[i].Status = '0'
					} else {
						userArr[i].Status = userArr[i]['OriStatus'] || '0';
					}
					break;
				}
			}
			if (userArr[i].Status == '1') {
				onLineArr.push(userArr[i]);
			} else {
				offLineArr.push(userArr[i]);
			}
		}

		// 修改当前树节点信息。
		$jqTree.tree('update', {
			target: nodeData.target,
			text: nodeName + "（" + onLineArr.length + "/" + (onLineArr.length + offLineArr.length) + "）",
			attributes: {
				nodeId: nodeId,
				nodeName: nodeName,
				nodeType: nodeType,
				nodeAgnum: nodeAgnum,
				nodePrio: nodePrio,
				nodeIsTPPU: nodeIsTPPU,
				onLine: onLineArr,
				offLine: offLineArr
			}
		});

		// 判断是否有子节点，如果有子节点，则对子节点进行相关操作。
		if (nodeData.children && nodeData.children.length && nodeData.children.length > 0) {
			for (var i = 0; i < nodeData.children.length; i ++) {
				freshNodeData(nodeData.children[i]);
			}
		}
	}

	// 刷新人员列表。
	var condition = $("#searchGroupNum").val();
	var nodeStr = $("#searchGroupNum").attr('groupObj');
	if (nodeStr && nodeStr != '') {
		// 首先判断相关人员在线状态是否有变化，如有变化，刷新列表，如无变化，则不刷新列表。
		var curUserListObj = JSON.parse(nodeStr);
		var userArr = fn_joinArray(curUserListObj.attributes.onLine, curUserListObj.attributes.offLine);
		var isNeedRefresh = false;
		for (var i = 0; i < numArr.length; i++) {
			var curNum = numArr[i].Num;
			var curStatus = numArr[i].Status;
			for (var j = 0; j < userArr.length; j++) {
				if (userArr[j].Num == curNum || userArr[j].Num.split('*')[0] == curNum) {
					if (userArr[j].Status != curStatus) {
						isNeedRefresh = true;
					}
					break;
				}
			}
			if (isNeedRefresh == true) break;
		}
		if (isNeedRefresh == true) {
			var node = $jqTree.tree('find', curUserListObj.id);
			showUserList(node, condition);
		}
	}
}

// 获取小组树的类型。
function fn_getTreeType() {
	var userRoleList = window.top.userInfo.userRolelist;
	var dataRight = '';
	for (i = 0; i < userRoleList.length; i++) {
		var roleDataRight = userRoleList[i].data_right;
		if (roleDataRight > dataRight) dataRight = roleDataRight;
	}
	var treeType = '';
	if (dataRight == '3' || dataRight == '2' ) { //全部或单位级数据权限。
		treeType = 'all';
	} else if (dataRight == '1') { //小组级数据权限。
		treeType = 'own';
	} else { //个人级数据权限。
		treeType = 'none';
	}
	return treeType;
}

// 检索所有小组信息。
function fn_getUserGroup() {
	window.top.m_IdtApi.UQueryG(window.top.userInfo.userInfo.num, function(bRes, cause, strCause, QueryRes) {
		if (bRes == true) {
			window.top.treeInfo.uGroupInfo = window.top.treeInfo.uGroupInfo || [];
			window.top.treeInfo.uGroupInfo = window.top.treeInfo.uGroupInfo.concat(QueryRes.UsrGInfo);
			window.top.treeInfo.uGroupFlag = true;
		}
	});
}

// 检索所有小组信息。
function fn_getGroupAll(pageNum) {
	// 查询参数。
	if (!pageNum || pageNum < 0) pageNum = 0;
	var obj = {
		GNum : '0',
		QueryExt : {
			All 	: 0,        // 是否所有用户/组,同"0"
			Group 	: 1,    	// 是否查询组,0不查询,1查询
			User  	: 0,      	// 是否查询用户,0不查询,1查询
			Order   : 0,
			Page    : pageNum,
			Count   : 1024,
			TotalCount : 0
		}
	};
	window.top.m_IdtApi.GQueryU(obj, function(bRes, cause, strCause, QueryRes) {
		if (bRes == true) {
			window.top.treeInfo.groupInfo = window.top.treeInfo.groupInfo || [];
			window.top.treeInfo.groupInfo = window.top.treeInfo.groupInfo.concat(QueryRes.GMember);
			if (QueryRes.QueryExt.Count * (QueryRes.QueryExt.Page + 1) >= QueryRes.QueryExt.TotalCount) {
				window.top.treeInfo.groupFlag = true;
			} else {
				fn_getGroupAll(QueryRes.QueryExt.Page + 1);
			}
		}
	});
}

// 检索所有人员、终端信息。
function fn_getEndUserAll(pageNum) {
	// 查询参数。
	if (!pageNum || pageNum < 0) pageNum = 0;
	var obj = {
		GNum : '0',
		QueryExt : {
			All 	: 0,        // 是否所有用户/组,同"0"
			Group 	: 0,    	// 是否查询组,0不查询,1查询
			User  	: 1,      	// 是否查询用户,0不查询,1查询
			Order   : 0,
			Page    : pageNum,
			Count   : 1024,
			TotalCount : 0
		}
	};
	window.top.m_IdtApi.GQueryU(obj, function(bRes, cause, strCause, QueryRes) {
		if (bRes == true) {
			window.top.treeInfo.endUserInfo = window.top.treeInfo.endUserInfo || [];
			window.top.treeInfo.endUserInfo = window.top.treeInfo.endUserInfo.concat(QueryRes.GMember);
			if (QueryRes.QueryExt.Count * (QueryRes.QueryExt.Page + 1) >= QueryRes.QueryExt.TotalCount) {
				window.top.treeInfo.endUserFlag = true;
			} else {
				fn_getEndUserAll(QueryRes.QueryExt.Page + 1);
			}
		}
	});
}

// 获取第三方平台终端信息。如监控、GPS定位器等。
function fn_getThirdPartyPlatUser(isSync) {
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/SysThirdPartyPlatUser/queryTPPUInfo',
		timeout : 300000,
		data : {
			'isSync' : isSync
		},
		dataType : "json",
		error : function (XMLHttpRequest, textStatus, errorThrown) {
			window.top.TPPUInfo = window.top.TPPUInfo || {
				localNumList : [],
				orgTPPUList : []
			};
		},
		success : function(data) {
			if (data && data.localNumList && data.orgTPPUList) { //第三方平台信息获取成功。
				window.top.TPPUInfo = data;
				// 如果是同时执行了与第三方平台的同步操作，则直接刷新小组树。
				//if (isSync == '1') fn_gTreeInit('.dispatch > .left .ulWrap .treeWrap .tree');
			} else { //第三方平台信息获取失败。
				window.top.TPPUInfo = window.top.TPPUInfo || {
					localNumList : [],
					orgTPPUList : []
				};
			}
		}
	});
}

// 将检索到的小组与终端数据与第三方平台数据进行混合处理。
function fn_dealTPPUAndGEData() {
	var TPPURoot = getParaVal('TPPURoot');
	var TPPUObjStatus = [];
	// 1、将需同步本端用户变为小组。
	for (var i = 0; i < window.top.TPPUInfo.localNumList.length; i++) {
		var curNum = window.top.TPPUInfo.localNumList[i].NUM;
		var minPos = 0, maxPos = window.top.treeInfo.endUserInfo.length - 1;
		while (minPos <= maxPos) {
			var midPos = Math.floor((minPos + maxPos) / 2);
			var midObj = window.top.treeInfo.endUserInfo[midPos];
			if (curNum == midObj.Num) { //找到了相关人员。
				TPPUObjStatus[curNum] = {Status: midObj['Status']};
				window.top.treeInfo.endUserInfo.splice(midPos,1);
				midObj.isTPPU = '1';
				if (TPPURoot != 'root') window.top.treeInfo.groupInfo.push(midObj);
				break;
			} else if (curNum < midObj.Num) {
				maxPos = midPos - 1;
			} else {
				minPos = midPos + 1;
			}
		}
	}
	// 2、将第三方平台的数据载入。
	var nowNum = '',pos;
	for (var i = 0; i <  window.top.TPPUInfo.orgTPPUList.length; i++) {
		var TPPUObj = window.top.TPPUInfo.orgTPPUList[i];
		TPPUObj['OriStatus'] = TPPUObj['Status']; //添加属性，记录下原始的状态值。
		if (TPPUObj.Type == 2) { // 将第三方平台的目录数据加入到小组中。
			if (TPPURoot == 'root' && TPPUObj.FGNum.indexOf('*') == -1) {
				TPPUObj.FGNum='';
			}
			window.top.treeInfo.groupInfo.push(TPPUObj);
			nowNum = '';
		} else { // 将第三方平台的用户数据加入到人员中。
			var TPPUNum = TPPUObj.Num.split('*')[0];
			if (TPPUObjStatus[TPPUNum] && TPPUObjStatus[TPPUNum]['Status'] == '0') TPPUObj['Status'] = '0'; //如果对接的账号离线，则所有相关终端状态全变为离线。
			if (TPPUNum == nowNum) {
				window.top.treeInfo.endUserInfo.splice(pos, 0, TPPUObj);
				pos ++;
			} else {
				nowNum = TPPUNum;
				pos = null;
				for (var j = 0; j < window.top.treeInfo.endUserInfo.length; j++) {
					if (TPPUNum < window.top.treeInfo.endUserInfo[j].Num) {
						pos = j;
						break;
					}
				}
				if (!pos && pos != 0) pos = window.top.treeInfo.endUserInfo.length;
				window.top.treeInfo.endUserInfo.splice(pos, 0, TPPUObj);
				pos ++;
			}
		}
	}
}

// 产生小组树中的相关数据。
function fn_genTreeData() {
	// 处理第三方平台的终端与目录数据。
	fn_dealTPPUAndGEData();

	var treeData 	= [];
	var orgData 	= window.top.treeInfo.orgInfo;
	var groupData 	= window.top.treeInfo.groupInfo;
	var uGroupData	= window.top.treeInfo.uGroupInfo;
	var endUserData = window.top.treeInfo.endUserInfo.concat();
	var treeType 	= window.top.treeInfo.treeType; // all, own, none
	var onLineArr 	= [];
	var offLineArr 	= [];

	// 取消所有GPS订阅消息。
	window.top.m_IdtApi.GpsSubs("##0",0);
	for (var i = 0; i < endUserData.length; i ++) {
		if (endUserData[i].Status == '1') {
			onLineArr.push(endUserData[i]);
		} else {
			offLineArr.push(endUserData[i]);
		}
		// 循环对所有用户的GPS添加订阅。
		window.top.m_IdtApi.GpsSubs(endUserData[i].Num.split('*')[0], 4);
	}
	// 产生树的根结点。
	var root = {
		id: orgData.NUM,
		text: orgData.NAME + "（" + onLineArr.length + "/" + (onLineArr.length + offLineArr.length) + "）",
		state: 'open',
		checked: false,
		children: [],
		attributes: {
			nodeId: orgData.NUM,
			nodeName: orgData.NAME,
			nodeType: 0,
			nodeAgnum: '',
			nodePrio: '1',
			nodeIsTPPU: '0',
			onLine: onLineArr,
			offLine: offLineArr
		}
	}

	// 递归循环产生各下级结点的相关数据。
	function genChildNode(node, groupDataTemp, endUserData) {
		if (treeType == 'none') return;
		var rootFlag = false;
		if (node.id == window.top.treeInfo.orgInfo.NUM) rootFlag = true;
		var onLineArr 	= [];
		var offLineArr 	= [];

		// 计算并产生本小组的在线与离线人员数组信息。
		if (rootFlag == false) {
			for (var i = 0; i < endUserData.length; i++) {
				var FGNum = endUserData[i].FGNum;
				var gArr = FGNum.split(',');
				if ($.inArray(node.id, gArr) != "-1") { // 是本小组的成员。
					var stat = endUserData[i].Status;
					if (stat == '1') {
						onLineArr.push(endUserData[i]);
					} else {
						offLineArr.push(endUserData[i]);
					}
				}
			}
		}

		// 计算并产生本小组的子小组信息，并将子小组的人员信息添加到当前小组。
		for (var i = 0; i < groupDataTemp.length; i++) {
			var gNum = groupDataTemp[i].Num;
			if (gNum.length != window.top.treeInfo.orgInfo.GSEG_START.length && gNum.endWith('9999910')) continue; // 视频会商产生的临时组不出现在小组树中。
			if (gNum.length != window.top.treeInfo.orgInfo.GSEG_START.length && gNum.endWith('8888810')) continue; // 视频会商产生的临时组不出现在小组树中。
			var pid = groupDataTemp[i].FGNum;
			var pidArr = pid.split(',');
			if ($.inArray(node.id, pidArr) != "-1" || (rootFlag == true && pid=='')) {
				var childNode = {
					id: groupDataTemp[i].Num,
					text: groupDataTemp[i].Name,
					state: 'closed',
					checked: false,
					attributes: {
						nodeId: groupDataTemp[i].Num,
						nodeName: groupDataTemp[i].Name,
						nodeType: groupDataTemp[i].GType,
						nodeAgnum: groupDataTemp[i].AGNum,
						nodePrio: groupDataTemp[i].Prio,
						nodeIsTPPU: groupDataTemp[i].isTPPU?groupDataTemp[i].isTPPU:'0'
					}
				};
				node.children = node.children || [];
				node.children.push(childNode);
				genChildNode(childNode, groupDataTemp, endUserData);
				// 将子小组的人员信息添加到当前小组。
				var k = 0;
				for (var j = 0; j < childNode.attributes.onLine.length; j++) {
					for (; k < onLineArr.length; k++) {
						// 人员存在，不添加。
						if (onLineArr[k].Num == childNode.attributes.onLine[j].Num) break;
						if (onLineArr[k].Num < childNode.attributes.onLine[j].Num) continue;
						if (onLineArr[k].Num > childNode.attributes.onLine[j].Num) {
							onLineArr.splice(k,0,childNode.attributes.onLine[j]);
							k ++;
							break;
						}
					}
					if (k == onLineArr.length) {
						onLineArr.push(childNode.attributes.onLine[j]);
						k ++;
					}
				}
				// 将子小组的人员信息添加到当前小组。
				k = 0;
				for (var j = 0; j < childNode.attributes.offLine.length; j++) {
					for (; k < offLineArr.length; k++) {
						// 人员存在，不添加。
						if (offLineArr[k].Num == childNode.attributes.offLine[j].Num) break;
						if (offLineArr[k].Num < childNode.attributes.offLine[j].Num) continue;
						if (offLineArr[k].Num > childNode.attributes.offLine[j].Num) {
							offLineArr.splice(k,0,childNode.attributes.offLine[j]);
							k ++;
							break;
						}
					}
					if (k == offLineArr.length) {
						offLineArr.push(childNode.attributes.offLine[j]);
						k ++;
					}
				}
			}
		}
		if (!node.children || !node.children.length || node.children.length <= 0) node.state = null;
		// 计算小组的人员数量信息。
		if (rootFlag == false) {
			node.attributes.onLine = onLineArr;
			node.attributes.offLine = offLineArr;
			node.text +=  "（" + node.attributes.onLine.length + "/" + (node.attributes.onLine.length + node.attributes.offLine.length) + "）";
		}
	}
	genChildNode(root, groupData, endUserData);
	if (treeType == 'all') { // 高级调度员或单位管理员，需产生未分配成员节点。
		var onLineArrTmp 	= [];
		var offLineArrTmp 	= [];
		for (var i = 0; i < endUserData.length; i ++) {
			if (!endUserData[i].FGNum || endUserData[i].FGNum == '') {
				if (endUserData[i].Status == '1') {
					onLineArrTmp.push(endUserData[i]);
				} else {
					offLineArrTmp.push(endUserData[i]);
				}
			}
		}
		var childNode = {
			id: '-1',
			text: lang.dispatch.Otherusers + '（' + onLineArrTmp.length + '/' + (onLineArrTmp.length + offLineArrTmp.length) + '）',
			checked: false,
			attributes: {
				nodeId: '-1',
				nodeName: lang.dispatch.Otherusers,
				nodeType: 0,
				nodeAgnum: '',
				nodePrio: '1',
				nodeIsTPPU: '0',
				onLine: onLineArrTmp,
				offLine: offLineArrTmp
			}
		};
		root.children = root.children || [];
		root.children.push(childNode);
	} else if (treeType == 'own') { // 一般调度员，需删除本调度员不在的小组。
		(function del_Invalid_Group(node) {
			// 判断是否是用户所在组。
			function checkNode(node) {
				for (var i = 0; i < uGroupData.length; i++) {
					var AGNum = uGroupData[i].AGNum;
					var AGNumArr = AGNum.split(',');
					if (uGroupData[i].Num == node.id || $.inArray(node.id,AGNumArr) != "-1") {
						return true;
					}
				}
				return false;
			}
			// 判断是否叶子结点。
			function isLeaf(node) {
				if (node.children && node.children.length && node.children.length > 0) {
					return false;
				} else {
					return true;
				}
			}
			if (checkNode(node) == false) {
				if (isLeaf(node) == false) {
					for (var i = 0; i < node.children.length; i++) {
						if (checkNode(node.children[i]) == false) {
							if (isLeaf(node.children[i]) == true) {
								node.children.splice(i, 1);
								i --;
							} else {
								del_Invalid_Group(node.children[i]);
								if (isLeaf(node.children[i]) == true) {
									node.children.splice(i, 1);
									i --;
								}
							}
						}
					}
				}
			}
		})(root);
	}
	// 判断是否开启分布式通讯功能。
	var openDistCommVal = window.top.getParaVal('openDistComm');
	if (openDistCommVal == 'true') {
		var otherCompArr = fn_getCommApiData('CommApi/array', 'getOrgGroupTree');
		for (var item in otherCompArr) {
			var node = otherCompArr[item];
			node.parentId = root.id;
			root.children.push(node);
		}
	}
	// 判断是否显示单位根节点。
	var isShowCompRoot = window.top.getParaVal('isShowCompRoot');
	if (isShowCompRoot != 'false') {
		treeData.push(root);
		window.top.groupTreeData = root;
		return treeData;
	} else {
		window.top.groupTreeData = root;
		return root.children;
	}
}

// 根据传入的DOM结点等相关参数，初始化小组树。
function fn_gTreeInit(jqObj) {
	window.top.treeInfo = window.top.treeInfo || {};
	if (!window.top.treeTimer && window.top.treeTimer!=0) {
		fn_treeInfoInit();
		window.top.treeTimer = setInterval(treeTimeIntv, 1000, jqObj);
	}
	function treeTimeIntv(jqObj) {
		// 如果相关的树信息未检索成功，树形控件元素如尚未展现,则直接返回。
		if ($(jqObj).length <= 0 ||
			!window.groupFade ||
			!window.treeClick ||
			!window.showUserList ||
			!window.getUserInfo ||
			!window.top.TPPUInfo ||
			!window.top.treeInfo.endUserFlag || window.top.treeInfo.endUserFlag != true ||
			!window.top.treeInfo.groupFlag || window.top.treeInfo.groupFlag != true ||
			!window.top.treeInfo.orgFlag || window.top.treeInfo.orgFlag != true ||
			!window.top.treeInfo.uGroupFlag || window.top.treeInfo.uGroupFlag != true )
		return;

		window.top.treeInitFlag = true;
		// 树形控件加载显示完毕后，清除相关形加载定时器。
		if (window.top.treeTimer) {
			clearInterval(window.top.treeTimer);
			window.top.treeTimer = null;
		}

		// 当相关控件元素或信息均检索成功后，直接加载显示相关树。
		$(jqObj).tree({
	        animate: true,
	        cascadeCheck: false,
	        checkbox: false,
			data: fn_genTreeData(),
	        onLoadSuccess: function (node, data) {
                console.log("onLoadSuccess")

                // 文本超出省略号-----------------------------------------------------
	            $.each($('.dispatch>.left .treeWrap .tree-node'), function () {
	                if ($(this).find('span').length === 3) {
	                    $(this).find('.tree-title').css('width', 185);
	                } else if ($(this).find('span').length === 4) {
	                    $(this).find('.tree-title').css('width', 177);
	                } else if ($(this).find('span').length === 5) {
	                    $(this).find('.tree-title').css('width', 161);
	                } else if ($(this).find('span').length === 6) {
	                    $(this).find('.tree-title').css('width', 144);
	                } else if ($(this).find('span').length === 7) {
	                    $(this).find('.tree-title').css('width', 128);
	                } else if ($(this).find('span').length === 8) {
	                    $(this).find('.tree-title').css('width', 112);
	                }
	            });
	            if (window.top.getParaVal('dispatchType') == 'haveMap') fn_initTreeNodeChecked();
				groupFade();
	            treeClick();
	            // 如果原来已有选中节点，则选中原来的节点，否则默认选中第一个节点。
	            if (data.length > 0) {
					// 找到第一个元素
	            	var curId = $("#hiddenCurGroupId").val();
	            	if (!curId || curId == '') {
	            		curId = data[0].id;
	            		$("#hiddenCurGroupId").val(curId);
	            	}
					var n = $(this).tree('find', curId);
					if (!n) n = $(this).tree('find', data[0].id);
					if (n && n.text) {
						// 调用选中事件
						var nodeName = n.text;
                        if (nodeName.indexOf("（") >= 0)
                            nodeName = nodeName.substring(0, nodeName.lastIndexOf("（"));
						$(".titleDiv .title").html(nodeName);
						$("#"+n.target.id).addClass("active");
						if (window.top.getParaVal('dispatchType') == 'normal') showUserList(n);
					}
					if (!window.firstFlash && window.top.getParaVal('dispatchType') == 'normal') {
		            	getUserInfo(window.top.userInfo.userInfo.num);
		            	window.firstFlash = true;
		            }
				}
	        },
	        onContextMenu: function(e, node) {
	        	e.preventDefault();
	    		// 选中当前结点。
	        	$(this).tree('select', node.target);
	    		// 显示快捷菜单
	        	fn_showGroupContextMenu(node,e);
	        }
	    });
	}
}

// 根据传入的DOM结点等相关参数，初始化小组树。
async function fn_gTreeInit2(jqObj) {
    //var treeData = await fn_genTreeDataNew();
    var treeData = [window.top.userInfo.sessionUser.GroupTree];
    $(jqObj).tree({
        animate: true,
        cascadeCheck: false,
        checkbox: false,
        data: treeData,
        onLoadSuccess: function (node, data) {
            console.log('onLoadSuccess', node, data)
            // 文本超出省略号-----------------------------------------------------
            $.each($('.dispatch>.left .treeWrap .tree-node'), function () {
                if ($(this).find('span').length === 3) {
                    $(this).find('.tree-title').css('width', 185);
                } else if ($(this).find('span').length === 4) {
                    $(this).find('.tree-title').css('width', 177);
                } else if ($(this).find('span').length === 5) {
                    $(this).find('.tree-title').css('width', 161);
                } else if ($(this).find('span').length === 6) {
                    $(this).find('.tree-title').css('width', 144);
                } else if ($(this).find('span').length === 7) {
                    $(this).find('.tree-title').css('width', 128);
                } else if ($(this).find('span').length === 8) {
                    $(this).find('.tree-title').css('width', 112);
                }
            });
            if (window.top.getParaVal('dispatchType') === 'haveMap') fn_initTreeNodeChecked();
            groupFade();
            treeClick();

            // 如果原来已有选中节点，则选中原来的节点，否则默认选中第一个节点。
            if (data.length > 0) {
                // 找到第一个元素
                var curId = $("#hiddenCurGroupId").val();
                if (!curId || curId === '') {
                    curId = data[0].id;
                    $("#hiddenCurGroupId").val(curId);
                }
                var n = $(this).tree('find', curId);
                if (!n) n = $(this).tree('find', data[0].id);
                if (n && n.text) {
                    // 调用选中事件
                    var nodeName = n.text;
                    if (nodeName.indexOf("（") >= 0)
                        nodeName = nodeName.substring(0, nodeName.lastIndexOf("（"));
                    $(".titleDiv .title").html(nodeName);
                    $("#"+n.target.id).addClass("active");
                    if (window.top.getParaVal('dispatchType') === 'normal') showUserList(n);
                }
                if (!window.firstFlash && window.top.getParaVal('dispatchType') === 'normal') {
                    getUserInfo(window.top.userInfo.userInfo.num);
                    window.firstFlash = true;
                }
            }
        },
        onContextMenu: function(e, node) {
            e.preventDefault();
            // 选中当前结点。
            $(this).tree('select', node.target);
            // 显示快捷菜单
            fn_showGroupContextMenu(node,e);
        }
    });
}

// 检索所有人员、终端信息(通用人员选择框使用)。
function fn_getEndUserAllForCommSel() {
//	var root = $('.dispatch > .left .ulWrap .treeWrap .tree').tree('getRoots')[0];
//	var treeData = $('.dispatch > .left .ulWrap .treeWrap .tree').tree('getData', root.target);
	var treeData = window.top.groupTreeData;
	if (!treeData.attributes || !treeData.attributes.onLine || !treeData.attributes.offLine) {
		prompt('warn', '人员小组信息尚未成功加载，请稍后再试。', 1000);
		return [];
	}
	var personArr = fn_joinArray(treeData.attributes.onLine, treeData.attributes.offLine);
	for (var i = 0; i < personArr.length; i++) { //剔除第三方平台的终端。
		if (personArr[i].isTPPU &&　personArr[i].isTPPU　=='1') {
			personArr.splice(i, 1);
			i --;
		}
	}
	return personArr;
}

// 获取所有小组信息(通用人员选择框使用)。
function fn_getGroupAllForCommSel() {
//	var root = $('.dispatch > .left .ulWrap .treeWrap .tree').tree('getRoots')[0];
//	var treeData = $('.dispatch > .left .ulWrap .treeWrap .tree').tree('getData', root.target);
	var treeData = window.top.groupTreeData;
	var groupArr = [];
	var treeData = window.top.groupTreeData;
	if (!treeData.attributes || !treeData.attributes.onLine || !treeData.attributes.offLine) {
		prompt('warn', '人员小组信息尚未成功加载，请稍后再试。', 1000);
		return groupArr;
	}
	(function genGroupData(nodeData) {
		// 把当前结点放入数组中。
		if (nodeData.attributes.nodeId != window.top.userInfo.orgInfoMap.NUM && nodeData.attributes.nodeIsTPPU != '1') {
			if (isArrayExist(nodeData.attributes.nodeId, groupArr) == false) {
				groupArr.push({
					num : nodeData.attributes.nodeId,
					name : nodeData.attributes.nodeName,
					gtype : nodeData.attributes.nodeType,
					member : fn_joinArray(nodeData.attributes.onLine, nodeData.attributes.offLine)
				});
			}
		}
		// 判断是否有子节点，如果有子节点，则对子结点进行相关操作。
		if (nodeData.children && nodeData.children.length && nodeData.children.length > 0) {
			for (var i = 0; i < nodeData.children.length; i ++) {
				genGroupData(nodeData.children[i]);
			}
		}
	})(treeData);
	return groupArr;
}

// 根据小组编码，获取小组信息：包括名称，类型等信息。
function fn_getGroupInfoDetail(gNum) {
	if (!gNum || gNum == '') return null;
	var groupArr = fn_getGroupAllForCommSel();
	if (!groupArr || !groupArr.length || groupArr.length <= 0) return null;
	for (var i = 0; i < groupArr.length; i++) {
		if (groupArr[i].num == gNum) return groupArr[i];
	}
	return null;
}

// 根据用户编码，获取用户信息：包括名称，优先级等信息。
function fn_getUserInfoDetail(userNum) {
	if (!userNum || userNum == '') return null;
	var userArr = fn_getEndUserAllForCommSel();
	if (!userArr || !userArr.length || userArr.length <= 0) return null;
	var minPos = 0, maxPos = userArr.length - 1;
	while (minPos <= maxPos) {
		var midPos = Math.floor((minPos + maxPos) / 2);
		var midObj = userArr[midPos];
		if (userNum == midObj.Num) { //找到了相关人员。
			return midObj;
		} else if (userNum < midObj.Num) {
			maxPos = midPos - 1;
		} else {
			minPos = midPos + 1;
		}
	}
	return null;
}

// 两个人员数组合并(按号码顺序排序)。
function fn_joinArray(firstArr, secondArr) {
	var resultArr = [];
	if (!firstArr || !Array.isArray(firstArr)) firstArr = [];
	if (!secondArr || !Array.isArray(secondArr)) secondArr = [];
	var i = 0, j = 0;
	while (i < firstArr.length || j < secondArr.length) {
		// 如果第一个数组的当前记录号码小于第二个数组的当前记录号码或者第二个数组记录已全部合并到目标数组中。
		if ((j >= secondArr.length && i < firstArr.length) ||
			(i < firstArr.length && j < secondArr.length &&
			firstArr[i].Num < secondArr[j].Num)) {
			resultArr.push(firstArr[i]);
			i ++;
		} else if ((i >= firstArr.length && j < secondArr.length) ||
			(i < firstArr.length && j < secondArr.length &&
			firstArr[i].Num > secondArr[j].Num)) {
			// 如果第一个数组的当前记录号码大于第二个数组的当前记录号码或第一个数组记录已全部合并到目标数组中。
			resultArr.push(secondArr[j]);
			j ++;
		} else if (firstArr[i].Num == secondArr[j].Num) {
			// 两个号码相同，则添加一条数据到数组中。
			resultArr.push(firstArr[i]);
			i ++;
			j ++;
		}
	}
	return resultArr;
}

// 刷新树的选中状态。
function fn_initTreeNodeChecked() {
    //console.log('fn_initTreeNodeChecked', window.top.userInfo.mbrChooseList)
	var chooseList = window.top.userInfo.mbrChooseList;
	var roots = $('.dispatch > .left .ulWrap .treeWrap .tree').tree('getRoots');
	if (roots && roots.length && roots.length > 0) {
		for (var i = 0; i < roots.length; i ++) {
			getTreeNodeChecked(roots[i], 'indeterminate', chooseList);
		}
	}
	//判断一个树结点是全选、半选、不选的通用函数。
	function getTreeNodeChecked(node, pChecked, chooseList) { //checked,unchecked,indeterminate
	    //console.log(node, pChecked, chooseList)
		var myChecked = pChecked;
		if (true || pChecked == 'indeterminate') {
			var onLineArr = node.attributes.onLine || [];
			var offLineArr = node.attributes.offLine || [];

            //console.log(onLineArr, offLineArr)

            if (chooseList.length <= 0
					|| ((onLineArr.length <= 0 || onLineArr[0] > chooseList[chooseList.length -1])
							&& (offLineArr.length <= 0 || offLineArr[0] > chooseList[chooseList.length -1]))
					|| ((onLineArr.length <= 0 ||onLineArr[onLineArr.length -1] < chooseList[0])
							&& (offLineArr.length <= 0 || offLineArr[offLineArr.length -1] < chooseList[0]))) {
				myChecked = 'unchecked';
			} else {
				var i = 0, j = 0, k = 0, checkCount = 0, noCheckCount = 0;
				if ((onLineArr.length + offLineArr.length) > chooseList.length)
					noCheckCount = onLineArr.length + offLineArr.length - chooseList.length;
				while ((i < onLineArr.length || j < offLineArr.length) && k < chooseList.length) {
					if (i < onLineArr.length && onLineArr[i].Id == chooseList[k].ID) {
						checkCount ++;
						i ++;
						k ++;
					} else if (j < offLineArr.length && offLineArr[j].Id == chooseList[k].ID) {
						checkCount ++;
						j ++;
						k ++;
					} else if (i < onLineArr.length && onLineArr[i].Id < chooseList[k].ID) {
						noCheckCount ++;
						i ++;
					} else if (j < offLineArr.length && offLineArr[j].Id < chooseList[k].ID) {
						noCheckCount ++;
						j ++;
					} else {
						k ++;
					}
					if (checkCount > 0 && noCheckCount > 0) break;
				}
				if (checkCount > 0 && noCheckCount == 0) {
					myChecked = 'checked';
				} else if (checkCount > 0 && noCheckCount > 0) {
					myChecked = 'indeterminate';
				} else {
					myChecked = 'unchecked';
				}
			}
		}
		var checkBoxHtml = '';
		if (myChecked == 'checked') {
			checkBoxHtml = 'tree-checkbox1';
		} else if (myChecked == 'unchecked') {
			checkBoxHtml = 'tree-checkbox0';
		} else {
			checkBoxHtml = 'tree-checkbox2';
		}
		if ($('.dispatch > .left .ulWrap .treeWrap .tree #' + node.domId + '>.tree-checkbox').length > 0) {
			$('.dispatch > .left .ulWrap .treeWrap .tree #' + node.domId + '>.tree-checkbox').removeClass().addClass('tree-checkbox ' + checkBoxHtml);
		} else {
			$('.dispatch > .left .ulWrap .treeWrap .tree #' + node.domId).append('<span class="tree-checkbox ' + checkBoxHtml + '"></span>')
		}
		if (node.children && node.children.length && node.children.length > 0) {
			for (var i = 0; i < node.children.length; i ++) {
				getTreeNodeChecked(node.children[i], myChecked, chooseList);
			}
		}
	}
}

// 在地图中展示已选中终端与人员的自定义覆盖物信息。
function fn_initMapEndUser(userList) {
	if (!window.top.map) return;
	if (!userList) {
		$.ajax({
			type : "POST",
			url : 'webservice/api/v1/comm/sysMemberChoose/query',
			async : false,
			data : {},
			dataType : "json",
			success : function(data) {
                console.log('fn_initMapEndUser', data)

                userList = data;
			}
		});
	}
	var map = window.top.map;
	var data = userList;
	// 在地图上加载显示普通终端覆盖物。
	var mapInitPoint = getParaVal('mapInitPoint');
	var mapInitPointArr = mapInitPoint.split(',');
	// 清空现有地图覆盖物。
	if (window.top.myMapType == 'baidu') {
		map.clearOverlays();
	} else if(window.top.myMapType == 'google') {
		var oveylays = window.googleMapOverlays.concat();
		for (var i = 0; i < oveylays.length; i++) {
			var overlay = oveylays[i];
			if (overlay.className == 'EndUserOverlay') {
				overlay.setMap(null);
				removeGoogleOverlay(overlay);
			}
		}
	}
	fn_otherPlatUserMapShow.endUser = {};
	if (data && data.length && data.length > 0) {
		for (var i = 0; i < data.length; i++) {
			if (window.top.myMapType == 'baidu') {
				var point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
				if (data[i].LONGITUDE && data[i].LATITUDE && !isNaN(data[i].LONGITUDE) && !isNaN(data[i].LATITUDE)) {
					point = BMap.BPoint(Number(data[i].LONGITUDE),Number(data[i].LATITUDE));
				}
				var imgNum = data[i].NUM.split('*')[0];
				var imgSrc = '/upload/headicon/' + imgNum + '.png';
				if (imgNum === '')
                    imgSrc = '/upload/headicon/user_default_online.png';
				var statusVal = data[i].STATUS;
				if (data[i].NUM == window.top.userInfo.userInfo.num) statusVal = '1';
				var endUserMarker = new EndUserOverlay(point,data[i].NUM,data[i].NAME,imgSrc,true,data[i].BGCOLOR,statusVal);
				map.addOverlay(endUserMarker);
				endUserMarker.addEventListener('click',function(event) {
					var num = $(this).attr("id");
					getUserInfo(num);
					var points = $(this).attr("endUserPoint");
					var poi = points.split(",");
					var curPoi = new BMap.Point(Number(poi[0]),Number(poi[1]));
					var infoWinDom = $('.personal-data').clone();
					infoWinDom.css("display", "block");
					infoWinDom.find('.personal-data-setting').removeClass('active');
					var infoWindow = new BMap.InfoWindow(infoWinDom[0],{width:494,height:340,enableAutoPan:false});
					window.curPoiOfUser = curPoi;
					map.openInfoWindow(infoWindow,curPoi);
					fn_mapPan(curPoi);
				});
				endUserMarker.addEventListener('contextmenu',function(event) {
					var num = $(this).attr("id");
					fn_showContextMenu(num,event);
				});
			}
			if (window.top.myMapType == 'google') {
				var glatlng = wgs2gcj(Number(mapInitPointArr[1]) , Number(mapInitPointArr[0]));
				var lat = glatlng[0];
				var lng = glatlng[1];
				var point = new google.maps.LatLng(Number(lat), Number(lng));
				if (data[i].LONGITUDE && data[i].LATITUDE && !isNaN(data[i].LONGITUDE) && !isNaN(data[i].LATITUDE)) {
					var glatlng2 = wgs2gcj(Number(data[i].LATITUDE) , Number(data[i].LONGITUDE));
					var lat2 = glatlng2[0];
					var lng2 = glatlng2[1];
					point = new google.maps.LatLng(Number(lat2), Number(lng2));
				}
				var imgNum = data[i].NUM.split('*')[0];
				var imgSrc = '/upload/headicon/' + imgNum + '.png';
                if (imgNum === '')
                    imgSrc = '/upload/headicon/user_default_online.png';
				var statusVal = data[i].STATUS;
				if (data[i].NUM == window.top.userInfo.userInfo.num) statusVal = '1';
				var overlay = new myOverlay(point,data[i].NUM,data[i].NAME,imgSrc,true,data[i].BGCOLOR,statusVal);
				addGoogleOverlay(overlay);
				overlay.addEventListener('click', function(event){
					if(window.curPoiOfUserOpeningInfowindow) window.curPoiOfUserOpeningInfowindow.close();
					var num = $(this).attr("id");
					getUserInfo(num);
					var points = $(this).attr("endUserPoint");
					var poi = points.split(",");
					var curPoi = new google.maps.LatLng(Number(poi[1]), Number(poi[0]));
					var infoWinDom = $('.personal-data').clone();
					infoWinDom.css("display", "contents");
					infoWinDom.find('.personal-data-setting').removeClass('active');
					var contentStr = $(infoWinDom).prop("outerHTML") + '';
					var infowindow = new google.maps.InfoWindow({
				          content: contentStr,
				          position : curPoi,
				          pixelOffset: new google.maps.Size(0, -60)
				        });
					window.curPoiOfUser = curPoi;
					infowindow.open(window.map);
					window.curPoiOfUserOpeningInfowindow = infowindow;
					event.stopPropagation();
				});
				//下面是鼠标右键的事件
				overlay.addEventListener('contextmenu',function(event) {
					var num = $(this).attr("id");
					fn_showContextMenu(num,event);
				});
			}
		}
	}

	// 检索并在地图上展示哨位信息。
	var guardPosList = null;
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/SysGuard/queryPos',
		async : false,
		data : {},
		dataType : "json",
		success : function(data) {
			guardPosList = data;
		}
	});
	if (guardPosList && guardPosList.length && guardPosList.length > 0) {
		for (var i = 0; i < guardPosList.length; i++) {
			if (window.top.myMapType == 'baidu') { //百度地图哨位信息展示。
				var point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
				if (guardPosList[i].longitude && guardPosList[i].latitude && !isNaN(guardPosList[i].longitude) && !isNaN(guardPosList[i].latitude)) {
					point = BMap.BPoint(Number(guardPosList[i].longitude),Number(guardPosList[i].latitude));
				}
				var guardNo = guardPosList[i].guard_no;
				var imgSrc = 'static/img/guard.png';
				var bgColor = '#FF0000';
				var noBorder = false;
				if (guardPosList[i].guard_icon && guardPosList[i].guard_icon != '') imgSrc = guardPosList[i].guard_icon;
				if (guardPosList[i].guard_status && guardPosList[i].guard_status == '1') bgColor = '#006217';
//				if (guardPosList[i].guard_type && guardPosList[i].guard_type == '1') noBorder = true;
				var endUserMarker = new EndUserOverlay(point, guardNo, guardPosList[i].guard_name, imgSrc, true, bgColor, true, true, guardPosList[i], noBorder);
				map.addOverlay(endUserMarker);
				endUserMarker.addEventListener('click',function(event) {
					var guardObjStr = $(this).attr("guardData");
					if (guardObjStr && guardObjStr != '')  {
						var guardObj = JSON.parse(guardObjStr);
						fn_openGuardInfoW(guardObj.id);
					}
				});
				endUserMarker.addEventListener('contextmenu',function(event) {
					var guardObjStr = $(this).attr("guardData");
					if (guardObjStr && guardObjStr != '')  {
						var guardObj = JSON.parse(guardObjStr);
						fn_showGuardContextMenu(guardObj.id, event);
					}
				});
			} else if (window.top.myMapType == 'google') { //谷歌地图哨位信息展示。
				// 暂时不加载哨位信息。
			}
		}
	}
	// 设置离线显示状态。
	var cat = $('#offLineShow').attr('cat'); //0:显示离线 1：隐藏离线
	if (cat == '1') {
		$('.endUser.leave').css('display','block');
	} else {
		$('.endUser.leave').css('display','none');
	}
}

//添加单个地图覆盖物：SOS警告时在地图上展示覆盖物所用。
function fn_addOneOverLay(num) {
	//定义并初始化添加地图覆盖物的操作情况。
	var addRetObj = {
		flag: false,
		overLay: null
	}
	if (!window.map) return addRetObj; //如果地图不存在，则返回添加失败。
	if (!num || num == '') return addRetObj;
	var isOverLayExsit = false, nowOverLay = null;
	if (window.top.myMapType == 'google') { //谷歌地图。
		//判断覆盖物是否存在。
		var oveylays = window.googleMapOverlays;
		for (var i = 0; i < oveylays.length; i++) {
			var overlay = oveylays[i];
			if (overlay._num == num) {
				isOverLayExsit = true;
				nowOverLay = overlay;
				break;
			};
		}
	} else if (window.top.myMapType == 'baidu') { //百度地图。
		//判断覆盖物是否存在。
		var allOverlay = map.getOverlays();
		for (var i = 0; i < allOverlay.length; i++) {
			var className = '';
			var curOver = allOverlay[i];
			if (curOver.className) className = curOver.className;
			if (className != "EndUserOverlay") continue;
			if (curOver._num == num) {
				isOverLayExsit = true;
				nowOverLay = curOver;
				break;
			}
		}
	}
	if (isOverLayExsit == true && nowOverLay) { //如果地图覆盖物已存在，则将当前覆盖物与添加失败标志返回。
		nowOverLay.showTop();
		addRetObj = {
			flag: false,
			overLay: nowOverLay
		}
		return addRetObj;
	}
	var data = null;
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/userBasic/queryUserPosOne',
		async : false,
		dataType : "json",
		data : {
			"user_num" : num
		},
		success : function(ret) {
			data = ret;
		}
	});
	if (data && data.length && data.length > 0) {
		var mapInitPoint = getParaVal('mapInitPoint');
		var mapInitPointArr = mapInitPoint.split(',');
		for (var i = 0; i < data.length; i++) {
			var imgNum = data[i].NUM.split('*')[0];
			var imgSrc = '/upload/headicon/' + imgNum + '.png?t=' + Math.random();
			var statusVal = data[i].STATUS;
			if (data[i].NUM == window.top.userInfo.userInfo.num) statusVal = '1';
			if (window.top.myMapType == 'google') { //谷歌地图。
				var glatlng = wgs2gcj(Number(mapInitPointArr[1]) , Number(mapInitPointArr[0]));
				var lat = glatlng[0];
				var lng = glatlng[1];
				var point = new google.maps.LatLng(Number(lat), Number(lng));
				if (data[i].LONGITUDE && data[i].LATITUDE && !isNaN(data[i].LONGITUDE) && !isNaN(data[i].LATITUDE)) {
					var glatlng2 = wgs2gcj(Number(data[i].LATITUDE) , Number(data[i].LONGITUDE));
					var lat2 = glatlng2[0];
					var lng2 = glatlng2[1];
					point = new google.maps.LatLng(Number(lat2), Number(lng2));
				}
				var overlay = new myOverlay(point,data[i].NUM,data[i].NAME,imgSrc,true,data[i].BGCOLOR,statusVal);
				addGoogleOverlay(overlay);
				overlay.addEventListener('click', function(event){
					if (window.curPoiOfUserOpeningInfowindow) window.curPoiOfUserOpeningInfowindow.close();
					var num = $(this).attr("id");
					getUserInfo(num);
					var points = $(this).attr("endUserPoint");
					var poi = points.split(",");
					var curPoi = new google.maps.LatLng(Number(poi[1]), Number(poi[0]));
					var infoWinDom = $('.personal-data').clone();
					infoWinDom.css("display", "contents");
					infoWinDom.find('.personal-data-setting').removeClass('active');
					var contentStr = $(infoWinDom).prop("outerHTML") + '';
					var infowindow = new google.maps.InfoWindow({
				          content: contentStr,
				          position : curPoi,
				          pixelOffset: new google.maps.Size(0, -60)
				    });
					window.curPoiOfUser = curPoi;
					infowindow.open(window.map);
					window.curPoiOfUserOpeningInfowindow = infowindow;
					event.stopPropagation();
				});
				//下面是鼠标右键的事件
				overlay.addEventListener('contextmenu',function(event) {
					var num = $(this).attr("id");
					fn_showContextMenu(num,event);
				});
				nowOverLay = overlay;
			} else if (window.top.myMapType == 'baidu') { //百度地图。
				var point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
				if (data[i].LONGITUDE && data[i].LATITUDE && !isNaN(data[i].LONGITUDE) && !isNaN(data[i].LATITUDE)) {
					point = BMap.BPoint(Number(data[i].LONGITUDE),Number(data[i].LATITUDE));
				}
				var endUserMarker = new EndUserOverlay(point,data[i].NUM,data[i].NAME,imgSrc,true,data[i].BGCOLOR,statusVal);
				map.addOverlay(endUserMarker);
				endUserMarker.addEventListener('click',function(event) {
					var num = $(this).attr("id");
					getUserInfo(num);
					var points = $(this).attr("endUserPoint");
					var poi = points.split(",");
					var curPoi = new BMap.Point(Number(poi[0]),Number(poi[1]));
					var infoWinDom = $('.personal-data').clone();
					infoWinDom.css("display", "block");
					infoWinDom.find('.personal-data-setting').removeClass('active');
					var infoWindow = new BMap.InfoWindow(infoWinDom[0],{width:494,height:340,enableAutoPan:false});
					window.curPoiOfUser = curPoi;
					window.map.openInfoWindow(infoWindow,curPoi);
					fn_mapPan(curPoi);
				});
				endUserMarker.addEventListener('contextmenu',function(event) {
					var num = $(this).attr("id");
					fn_showContextMenu(num,event);
				});
				nowOverLay = endUserMarker;
			}
		}
		nowOverLay.showTop();
		addRetObj = {
			flag: true,
			overLay: nowOverLay
		};
		return addRetObj;
	}
	addRetObj = {
		flag: false,
		overLay: null
	};
	return addRetObj;
}

//删除单个地图覆盖物：SOS警告关闭时去除地图上展示覆盖物所用。
function fn_delOneOverLay(num) {
	if (!window.map) return; //如果地图不存在，则直接返回。
	if (!num || num == '') return;
	if (window.top.myMapType == 'google') { //谷歌地图。
		//判断覆盖物是否存在。
		var oveylays = window.googleMapOverlays;
		for (var i = 0; i < oveylays.length; i++) {
			var overlay = oveylays[i];
			if (overlay._num == num) {
				overlay.setMap(null);
				removeGoogleOverlay(overlay);
				break;
			};
		}
	} else if (window.top.myMapType == 'baidu') { //百度地图。
		//判断覆盖物是否存在。
		var allOverlay = map.getOverlays();
		for (var i = 0; i < allOverlay.length; i++) {
			var className = '';
			var curOver = allOverlay[i];
			if (curOver.className) className = curOver.className;
			if (className != "EndUserOverlay") continue;
			if (curOver._num == num) {
				window.map.removeOverlay(curOver);
				break;
			}
		}
	}
}

//弹出哨位详细信息，并自动打开通话与摄像头的视频。
function fn_openGuardInfoW(posId, callId, isMonitor) {
	if (!callId && callId != 0) callId = null;
	if (!isMonitor) isMonitor = false;
	// 创建通讯序号。
	var sn = 'guard_' + fn_genSn();
	var curPosObj = null;
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/SysGuard/queryCurPosInfo',
		async : false,
		data : {
			'pos_id' : posId
		},
		dataType : "json",
		success : function(data) {
			curPosObj = data;
		}
	});
	// 检查设备数据信息，如不符合要求，则提示后直接返回。
	var voiceDev = [], videoDev = [];
	if (curPosObj && curPosObj.devInfo && curPosObj.devInfo.length && curPosObj.devInfo.length > 0) {
		var voiceNum = 0, videoNum = 0;
		for (var i = 0; i < curPosObj.devInfo.length; i ++) {
			if (curPosObj.devInfo[i].dev_type == 'voice') {
				voiceDev.push(curPosObj.devInfo[i]);
				voiceNum ++;
			} else if (curPosObj.devInfo[i].dev_type == 'video') {
				videoDev.push(curPosObj.devInfo[i]);
				videoNum ++;
			}
		}
		if (videoNum > 2) {
			prompt('warn','哨位对应的设备信息错误，最多只允许2个视频设备。',1000);
			return;
		}
	}
	var htmlStr = '';
	if (curPosObj.guard_type && curPosObj.guard_type == '1') {
		htmlStr = '<div class="shaowei-window" id="sureChat_commDlg_' + sn + '"><div class="shaowei-header">哨位详情<div class="float-right close icon">&#xe6c4;</div></div>' +
		'	<div class="shaowei-main clearfix"><div class="shaowei-main-left fl"><div class="shaowei-info">' +
		'		<ul><li class="shaowei-title"><img class="" src="static/img/guard.png">&nbsp;<span>【'+curPosObj.guard_no+'】'+curPosObj.guard_name+'</span></li>'+
		'		<li class="shaowei-content"><span class="label">哨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号：</span><div class="content" style="width:155px;">'+fn_conVal(curPosObj.class_cadre)+'</div></li>';
	} else {
		htmlStr = '<div class="shaowei-window" id="sureChat_commDlg_' + sn + '"><div class="shaowei-header">哨位详情<div class="float-right close icon">&#xe6c4;</div></div>' +
		'	<div class="shaowei-main clearfix"><div class="shaowei-main-left fl"><div class="shaowei-info">' +
		'		<ul><li class="shaowei-title"><img class="" src="static/img/guard.png">&nbsp;<span>【'+curPosObj.guard_no+'】'+curPosObj.guard_name+'</span></li>'+
		'		<li class="shaowei-content"><span class="label">带班干部：</span><div class="content" style="width:155px;">'+fn_conVal(curPosObj.class_cadre)+'</div></li>' +
		'		<li class="shaowei-content"><span class="label">领班员兼哨长：</span><div class="content" style="width:120px;">'+fn_conVal(curPosObj.class_leader)+'</div></li>';
	}
	// 添加哨兵信息。
	if (curPosObj && curPosObj.userInfo && curPosObj.userInfo.length && curPosObj.userInfo.length > 0) {
		for (var i = 0; i < curPosObj.userInfo.length; i ++) {
			if (curPosObj.userInfo[i].user_prop && curPosObj.userInfo[i].user_prop == '组长') {
				htmlStr += '<li class="shaowei-member" userPhoto="'+curPosObj.userInfo[i].user_photo+'"><img src="static/img/member.png"/>' +
				'<span class="label">组&nbsp;&nbsp;长：</span><div class="content">' + fn_conVal(curPosObj.userInfo[i].user_name) + '</div></li>';
			} else {
				htmlStr += '<li class="shaowei-member" userPhoto="'+curPosObj.userInfo[i].user_photo+'"><img src="static/img/member.png"/>' +
				'<span class="label">组&nbsp;&nbsp;员：</span><div class="content">' + fn_conVal(curPosObj.userInfo[i].user_name) + '</div></li>';
			}
		}
	}
	// 添加哨位位置、哨位性质、哨位分队等信息。
	htmlStr += '<li class="shaowei-content"><span class="label">哨位性质：</span><div class="content" style="width:155px;">'+fn_conVal(curPosObj.guard_prop)+'</div></li>';
	htmlStr += '<li class="shaowei-content"><span class="label">哨位位置：</span><div class="content" style="width:155px;">'+fn_conVal(curPosObj.guard_addr)+'</div></li>';
	htmlStr += '<li class="shaowei-content"><span class="label">哨位分队：</span><div class="content" style="width:155px;">'+fn_conVal(curPosObj.tsk_group)+'</div></li>';
    // 添加通话面板信息。
	htmlStr += '</ul></div><div class="shaowei-call">'+
				fn_genVideo('id_voice_my_' + sn,0,0,true,true) +
				fn_genVideo('id_voice_peer_' + sn,0,0,false,true) +
				'<div class="call-time"><img class="" src="static/img/time.png">&nbsp;&nbsp;<span class="time">00:00:00</span></div>' +
				'<div class="call-btn"><img class="" src="static/img/tel.png">&nbsp;&nbsp;<span id="callClose">挂断</span></div></div></div>';
	// 添加视频查看面板信息。
	htmlStr += '<div class="shaowei-main-right fl"><ul>';
	if (videoDev.length > 0) {
		for (var i = 0; i < videoDev.length; i ++) {
			var liCss = 'style="width:100%;height:100%;"';
			if (videoNum == 2) liCss = 'style="width:50%;height:100%;"';
			htmlStr += '<li class="traffic-wrap" '+liCss+'><div class="img-mask">' +
						'<img class="traffic-close" src="static/img/close-small.png"></div><div class="video"></div></li>';
		}
	} else {
		var liCss = 'style="width:100%;height:100%;"';
		htmlStr += '<li class="traffic-wrap" '+liCss+'><div class="img-mask">' +
		'<img class="traffic-close" src="static/img/close-small.png"></div><div class="video">无视频信号</div></li>';
	}

    // 添加结束标签。
	htmlStr +=  '</ul></div></div></div>';
	if ($('.shaowei-window').length == 0) {
		// 显示窗体。
		$(document.body).append(htmlStr);
		// 鼠标拖动效果
	    $('.shaowei-window .shaowei-header').off('mousedown').on('mousedown',function (event) {
            var isMove = true;
            var abs_x = event.pageX - $('.shaowei-window').offset().left;
            var abs_y = event.pageY - $('.shaowei-window').offset().top;
            $(document).off('mousemove').on('mousemove',function (event) {
                if (isMove) {
                    $('.shaowei-window').css({
                    	'left': event.pageX - abs_x,
                        'top': event.pageY - abs_y,
                        'transform': 'translate(0%, 0%)'
                    });
                }
            }).off('mouseup').on('mouseup',function () {
                isMove = false;
            });
	    });
		// 打开声音通讯。
		var myVideo = $('#id_voice_my_' + sn)[0];
		var peerVideo = $('#id_voice_peer_' + sn)[0];
		if (callId || callId == 0) { //接听应答来电。
			window.top.m_IdtApi.CallAnswer(callId, sn, myVideo, peerVideo, 1, 1, 0, 0);
			fn_setTimeCount(sn);
		} else { //发起全双工语音单呼。
			if (voiceDev && voiceDev.length > 0 && voiceDev[0].dev_num) { //存在声音设备，才发起语音通话。
				if (isMonitor == true) {
					callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 0, 0, 0, voiceDev[0].dev_num, IDT.SRV_TYPE_BASIC_CALL, "", 1, 0);
				} else {
					callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 0, 0, voiceDev[0].dev_num, IDT.SRV_TYPE_BASIC_CALL, "", 1, 0);
				}
			}
		}
		if (callId || callId == 0) {
			window.top.activeCallInfo = true;
			$('.shaowei-window .shaowei-call').attr("callId", callId);
			$('.shaowei-window .shaowei-call').attr("callSn", sn);
		}
		// 打开视频查看。
		for (var i = 0; i < videoDev.length; i ++) {
			var viewNum = videoDev[i].dev_num;
			var videoUrl = '';
			if (viewNum.indexOf('*') != -1) { // 第三方平台用户。
				// 获取该第三方平台用户的视频播放地址前缀。
				$.ajax({
					url : "webservice/api/v1/comm/userBasic/getVideoUrl",
					type : "POST",
					async : false,
					data : {
						user_num : viewNum.split('*')[0]
					},
					success : function(data) {
						if (data) {
							videoUrl = data;
						}
					}
				});
			}
			var videoPeerId = sn + '_play_peer_' + i;
			$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).attr("videoPeerId", videoPeerId);
			if (videoUrl && videoUrl != '') { //用VIDEOJS调用第三方视频查看地址。
				var fullVideoUrl = videoUrl + window.top.userInfo.userInfo.num + '**' + viewNum;
				var videoPlayHtml = fn_genVideoJsWidget(videoPeerId, fullVideoUrl);
				$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).find('.video').append(videoPlayHtml);
				$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).attr('videojs','true');
				videojs(videoPeerId, {
					autoplay : true,
					language: 'zh-CN'
				});
			} else { //如果为空，则调用普通的视频查看功能。
				var videoPlayHtml = fn_genVideo(videoPeerId, '100%', '100%', false);
				$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).find('.video').append(videoPlayHtml);
				$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).attr('videojs','false');
				var peerVideo = $('#' + videoPeerId)[0];
				var curSn = sn+'_' + i;
				var m_CallId = window.m_IdtApi.CallMakeOut(curSn, null, peerVideo, 0, 0, 1, 0, viewNum, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
				$('.shaowei-window .shaowei-main-right .traffic-wrap').eq(i).attr("callId", m_CallId);
			}
		}
		// 添加组员点击展示头像事件或者鼠标移入显示，移出隐藏。
		$('.shaowei-window .shaowei-info .shaowei-member').off('mouseenter').on('mouseenter', function(event) {//
			var photoSrc = $(this).attr('userPhoto');
			if (!photoSrc || photoSrc =='') photoSrc = 'static/img/member.png';
			var memberPhotoHtml = 	'<div class="member-photo-wrap">' +
									'	<img class="member-photo-bg" src="static/img/member-photo-bg.png"/>' +
							        '	<img class="member-photo" src="' + photoSrc + '"/>' +
							        '</div>';
			if ($('.member-photo-wrap').length == 0) {
				// 显示头像。
				$(document.body).append(memberPhotoHtml);
				$('.member-photo-wrap').css({
					left: event.pageX -56,
					top: event.pageY -125
				});
			}
		});
		$('.shaowei-window .shaowei-info .shaowei-member').off('mouseleave').on('mouseleave', function(event) {
			if ($('.member-photo-wrap').length > 0) {
				$('.member-photo-wrap').remove();
			}
		});
		// 添加声音挂断按扭点击事件。
		$('.shaowei-window #callClose').off('click').on('click', function () {
			var callId = $('.shaowei-window .shaowei-call').attr("callId");
			var sn = $('.shaowei-window .shaowei-call').attr("callSn");
			var sh = $('.shaowei-window').attr("timeIntervalSn");
			if (sh) clearInterval(sh);
			if (callId || callId == 0 && sn) {
				window.top.m_IdtApi.CallRel(callId, sn, 0);
				window.top.activeCallInfo = false;
			}
		});
		// 添加关闭窗体事件。
		$('.shaowei-window .shaowei-header .close').off('click').on('click', function () {
			// 关闭声音通话。
			var callId = $('.shaowei-window .shaowei-call').attr("callId");
			var sn = $('.shaowei-window .shaowei-call').attr("callSn");
			var sh = $('.shaowei-window').attr("timeIntervalSn");
			if (sh) clearInterval(sh);
			if (callId || callId == 0 && sn) {
				window.top.m_IdtApi.CallRel(callId, sn, 0);
				window.top.activeCallInfo = false;
			}
			// 关闭视频查看。
			var $videoLi = $('.shaowei-window .shaowei-main-right .traffic-wrap');
			for (var i = 0; i < $videoLi.length; i ++) {
				var isVideojs = $videoLi.eq(i).attr('videojs');
				var videoPeerId = $videoLi.eq(i).attr('videoPeerId');
				if (isVideojs && isVideojs == 'true') {
					videojs('#'+videoPeerId).dispose();
				} else {
					var m_CallId = $videoLi.eq(i).attr('callId');
	            	if (m_CallId || m_CallId == 0) window.top.m_IdtApi.CallRel(m_CallId, '', 0);
				}
			}
			// 关闭窗体。
			$('.shaowei-window').remove();
		});
	}
}

// 变更小组与人员选择数据。
function fn_saveMbrChooseChg(numStr, isChecked) {
	if (!isChecked) isChecked = false;
	$.ajax({
		type : "POST",
		url : 'webservice/api/v1/comm/sysMemberChoose/saveChoose',
		async : false, //true 异步, false 同步
		data : {
			users: JSON.stringify(numStr),
			check: isChecked
		},
		dataType : "json",
		success : function(data) {
			fn_initMapEndUser(data);
			window.top.userInfo.mbrChooseList = data;
		}
	});
}

// 根据用户编号，获取地图中的对应覆盖物。如未在地图中展示，则返回null。
function fn_getEndUserOverlay(num) {
	var endUser = null;
	if(window.top.myMapType == 'baidu'){
		if (!num || num == '') return endUser;
		if (!window.top.map) return endUser;
		var allOverlay = window.top.map.getOverlays();
		for (var i = 0; i < allOverlay.length; i++) {
			if (allOverlay[i].className && allOverlay[i].className == "EndUserOverlay" && allOverlay[i]._num == num) {
				endUser = allOverlay[i];
				break;
			}
		}
	}
	if(window.top.myMapType == 'google'){
		if (!num || num == '') return endUser;
		if (!window.top.map) return endUser;
		var allOverlay = window.googleMapOverlays;
		for (var i = 0; i < allOverlay.length; i++) {
			if (allOverlay[i].className && allOverlay[i].className == "EndUserOverlay" && allOverlay[i]._num == num) {
				endUser = allOverlay[i];
				break;
			}
		}
	}
	return endUser;
}

// 显示某个终端或人员的右键菜单。
function fn_showContextMenu(num, event) {
	var fn_data;
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/userBasic/getUserCommFn",
		data : {
			account : num
		},
		dataType : "json",
		async: false,
		success : function(data) {
			fn_data = data;
		}
	});
	if (!fn_data || !fn_data.NUM) return;
	var haveFn = false; //是否拥有常规的通讯功能。
	var isBusy = true;  //是否当前正在通讯中。
	var htmlStr = '<div id="rmenuWrap"><div id="rmenu_enduser" class="easyui-menu" style="width:120px;">';
	if (fn_data.SCALL 		== '1') {htmlStr += '<div id="SCALL">'+lang.dispatch.voiceCall+'</div>';	haveFn = true;}
	if (fn_data.VIDEO_CALL 	== '1') {htmlStr += '<div id="VIDEO_CALL">'+lang.dispatch.videoCall+'</div>';	haveFn = true;}
	if (fn_data.VIDEO_VIEW 	== '1') {htmlStr += '<div id="VIDEO_VIEW">'+lang.system.CheckVideo+'</div>';	haveFn = true;}
	if (fn_data.IM_FN 		== '1') {htmlStr += '<div id="IM_FN">'+lang.dispatch.IMmessage+'</div>';		haveFn = true;}
	if (fn_data.PTZ_CONTROL == '1') {htmlStr += '<div id="PTZ_CONTROL">'+lang.dispatch.ConsoleControl+'</div>';haveFn = true;}
	if (window.top.getParaVal('dispatchType') == 'haveMap') {
		if (fn_data.TRAIL_PLAY 	== '1') {htmlStr += '<div id="TRAIL_PLAY">'+lang.dispatch.hisRoute+'</div>';	haveFn = true;}
		if (fn_data.MAP_TAIL 	== '1') {htmlStr += '<div id="MAP_TAIL">'+lang.dispatch.userAttention+'</div>';	haveFn = true;}
	}
	if (fn_data.BUSINESS 	== '1') {htmlStr += '<div id="BUSINESS">'+lang.dispatch.workManagement+'</div>';	haveFn = true;}
	// 添加正在通话中人员的强插、强拆功能。
	if (haveFn == true && isBusy == true) htmlStr += '<div class="menu-sep"></div>';
	if (isBusy == true) {
		if (window.top.getParaVal('dispatchType') == 'haveMap') {
			htmlStr += '<div id="USER_LOCATION">'+lang.dispatch.Positioning+'</div>';
		}
		if (fn_data.SCALL == '1' || fn_data.VIDEO_CALL == '1') {
			htmlStr += '<div id="FORCE_INJ">'+lang.dispatch.Breakin+'</div>';
			htmlStr += '<div id="FORCE_REL">'+lang.dispatch.Forcerelease+'</div>';
		}
	}
	htmlStr += '</div></div>';
	if ($('#rmenuWrap').length >= 1) {
		$('#rmenu_enduser').menu('destroy');
		$('#rmenuWrap').remove();
	}
	$(document.body).append(htmlStr);
	// 记录当前用户数据。
	$('#rmenuWrap').attr('endUserData', JSON.stringify(fn_data));
	$.parser.parse("#rmenuWrap");
	$('#rmenu_enduser').menu({
	    onClick:function(item) {
	    	if (window.top.getParaVal('dispatchType') == 'haveMap') {
		    	if ($(event.target).parents('.group').length >= 1) {
		    		$('.dispatch>.left>.group').css('display', 'none');
		    		$('.dispatch > .left .ulWrap').stop();
		    		$('.dispatch > .left .ulWrap').css({
		    			display : 'none',
		    			height : 0
		    		});
		    		$('.dispatch > .left .titleDiv').removeClass('active');
		    	}
	    	}
	    	var endUserStr = $("#rmenuWrap").attr('endUserData');
			if (endUserStr && endUserStr != '') {
				var endUser = JSON.parse(endUserStr);
				var num = endUser.NUM;
				var name = endUser.NAME;
				switch(item.id) {
				    case "SCALL":
				    	fn_voiceCall(num, name);
						break;
				    case "VIDEO_CALL":
				    	fn_videoCall(num, name);
						break;
				    case "VIDEO_VIEW":
				    	fn_videoView(num, name);
						break;
				    case "IM_FN":
				    	window.insMsg(num, name);
						break;
				    case "PTZ_CONTROL":
				    	fn_PTZControl(num, name);
						break;
				    case "TRAIL_PLAY":
				    	fn_trailPlay(num, name);
						break;
				    case "MAP_TAIL":
				    	//暂时为空。
						break;
				    case "BUSINESS":
						//暂时为空。
						break;
				    case "USER_LOCATION":
				    	fn_userLocation(num);
						break;
				    case "FORCE_INJ":
				    	fn_ForceInj(num, name);
						break;
				    case "FORCE_REL":
				    	fn_ForceRel(num);
						break;
			    }
			}
	    }
	});
	$('#rmenu_enduser').menu('show',{
		left: event.pageX,
		top: event.pageY
	});
}

// 根据电话号码获取人员姓名。
function fn_getPersonName(num) {
	if (!num || num == '') return '';
	var name = num;
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPhoneBook/getPersonName",
		data : {
			num : num
		},
		dataType : "json",
		async: false,
		error : function (XMLHttpRequest, textStatus, errorThrown) { //调取commapi接口失败。
			name = num;
		},
		success : function(data) {
			if (data && data.personName && data.personName != '') {
				name = data.personName;
			} else {
				name = num;
			}
		}
	});
	return name;
}

// 显示哨位的右键菜单。
function fn_showGuardContextMenu(posId, event) {
	var htmlStr = '<div id="rmenuWrap"><div id="rmenu_guardPos" class="easyui-menu" style="width:120px;">';
	htmlStr += '<div id="GUARD_CALLOUT">哨位呼叫</div>';
	htmlStr += '<div id="GUARD_MONITOR">哨位监听</div>';
	htmlStr += '<div id="GUARD_MANAGE">哨位管理</div>';
	htmlStr += '</div></div>';
	if ($('#rmenuWrap').length >= 1) {
		$('#rmenu_guardPos').menu('destroy');
		$('#rmenuWrap').remove();
	}
	$(document.body).append(htmlStr);
	// 记录当前用户数据。
	$('#rmenuWrap').attr('posData', posId);
	$.parser.parse("#rmenuWrap");
	$('#rmenu_guardPos').menu({
	    onClick:function(item) {
	    	var posIdStr = $("#rmenuWrap").attr('posData');
			if (posIdStr && posIdStr != '') {
				switch(item.id) {
				    case "GUARD_CALLOUT":
				    	fn_openGuardInfoW(posIdStr, null, false);
						break;
				    case "GUARD_MONITOR":
				    	fn_openGuardInfoW(posIdStr, null, true);
						break;
				    case "GUARD_MANAGE":
				    	fn_openGuardPosDlg(posIdStr);
						break;
			    }
			}
	    }
	});
	$('#rmenu_guardPos').menu('show',{
		left: event.pageX,
		top: event.pageY
	});
}

//显示SOS的右键菜单。
function fn_showSOSContextMenu(num, alarmUUID, event) {
	var htmlStr = '<div id="rmenuSOSWrap"><div id="rmenu_SOS" class="easyui-menu" style="width:120px;">';
	htmlStr += '<div id="SOS_CLOSE">' + lang.dispatch.SOSClose + '</div>';
	htmlStr += '</div></div>';
	if ($('#rmenuSOSWrap').length >= 1) {
		$('#rmenu_SOS').menu('destroy');
		$('#rmenuSOSWrap').remove();
	}
	$(document.body).append(htmlStr);
	// 记录当前用户数据。
	if (!alarmUUID) alarmUUID = '';
	$('#rmenuSOSWrap').attr('SOSNum', num);
	$('#rmenuSOSWrap').attr('alarmUUID', alarmUUID);
	$.parser.parse("#rmenuSOSWrap");
	$('#rmenu_SOS').menu({
	    onClick:function(item) {
	    	var SOSNum = $("#rmenuSOSWrap").attr('SOSNum');
	    	var alarmUUID = $("#rmenuSOSWrap").attr('alarmUUID');
	    	if (!alarmUUID) alarmUUID = '';
			if (SOSNum && SOSNum != '') {
				switch(item.id) {
				    case "SOS_CLOSE":
				    	// 更新SOS报警记录的处置信息。
				    	var operFlag = true;
				    	if (alarmUUID != '') {
				    		$.ajax({
				    			type : "POST",
				    			url : "webservice/api/v1/comm/SysSosInfo/closeSos",
				    			data: {
				    				id: alarmUUID
				    			},
				    			timeout : 2000,
				    			async: false, //使用同步的方式,true为异步方式。
				    			dataType : "json",
				    			error : function (XMLHttpRequest, textStatus, errorThrown) { //调取ajax接口失败。
				    				operFlag = false;
				    			},
				    			success : function(data) {
				    				if (data && data.success && data.success == 'SUCCESS') {
				    					operFlag = true;
				    				} else {
				    					operFlag = false;
				    				}
				    			}
				    		});
				    	}
				    	if (operFlag == false) {
				    		prompt('error', lang.dispatch.SOSClose + lang.system.Failure, 1000);
				    		return;
				    	}
				    	//后续的其它处理。
				    	removeSosMapWarn(SOSNum);
				    	fn_stopRingVoice('SOS' + SOSNum);
				    	var js = {};
				    	js.fromDesc = window.top.userInfo.userInfo.num;
				    	js.fromNumber = window.top.userInfo.userInfo.num;
				    	js.messageId = new Date();
				    	var subPara = {};
				    	subPara.type = 6;
				    	js.subPara = JSON.stringify(subPara);
				    	js.toDesc = "GPS反馈";
				    	js.toNumber = SOSNum;
				    	js.type = 6;
				    	var infoAtr = JSON.stringify(js);
				        window.top.m_IdtApi.IMSend(fn_genSn(), IDT.IM_TYPE_CONF, SOSNum, infoAtr, null, null);
						break;
			    }
			}
	    }
	});
	$('#rmenu_SOS').menu('show',{
		left: event.pageX,
		top: event.pageY
	});
}

//打开哨位管理对话框通用函数。
function fn_openGuardPosDlg(posId) {
	if (!posId) posId = '';
	var htmlStr = '<div id="guardPosDlg" style="display:none;"></div>';
	if ($('#guardPosDlg').length == 0) $(document.body).append(htmlStr);
	$('#guardPosDlg').css('display','block');
	$('#guardPosDlg').dialog({
		title : '哨位管理',
		width : 880,
		height : 530,
		closed : false,
		cache : false,
		modal : true,
		href:'system/guardPosDlg.jsp?posId='+posId,
		onClose: function () {
			fn_initMapEndUser();
		}
	});
}

// 显示小组的右键菜单。
function fn_showGroupContextMenu(node, event) {
	var htmlStr = '';
	if (node.attributes.nodeIsTPPU == '1') {
		htmlStr = '<div id="rmenuGroupWrap"><div id="rmenu_group" class="easyui-menu" style="width:120px;">' +
		'<div id="forceRefresh">'+lang.dispatch.forceRefresh+'</div>' +
		'</div></div>';
	} else {
		htmlStr = '<div id="rmenuGroupWrap"><div id="rmenu_group" class="easyui-menu" style="width:120px;">' +
		'<div id="makeVConf">'+lang.dispatch.videoConsultation+'</div>' +
		'<div id="startIM">'+lang.dispatch.IMmessage+'</div>' +
		'<div id="delGroup">'+lang.dispatch.Ungroup+'</div>' +
		'<div id="chgGroup">'+lang.dispatch.ModifyGroup+'</div>' +
		'<div id="manageMember">'+lang.dispatch.ModifyMmeber+'</div>' +
		'</div></div>';
	}
	if ($('#rmenuGroupWrap').length >= 1) {
		$('#rmenu_group').menu('destroy');
		$('#rmenuGroupWrap').remove();
	}
	$(document.body).append(htmlStr);
	// 记录当前用户数据。
	$('#rmenuGroupWrap').attr('groupData', JSON.stringify(node.attributes));
	$.parser.parse("#rmenuGroupWrap");
	$('#rmenu_group').menu({
	    onClick:function(item) {
	    	var groupDataStr = $("#rmenuGroupWrap").attr('groupData');
			if (groupDataStr && groupDataStr != '') {
				var groupData = JSON.parse(groupDataStr);
				var gNum = groupData.nodeId;
				var gName = groupData.nodeName;
				var gType = groupData.nodeType;
				switch(item.id) {
				    case "makeVConf":
				    	fn_startVideoConf(groupData);
						break;
				    case "startIM":
				    	if (gType == '0') { //单位或未分配成员小组不允许发送即时消息。
				    		var msg = '【' + gName + '】'+lang.dispatch.noIMallowed;
				    		prompt('error', msg, 2000);
				    		return;
				    	}
				    	window.insMsg(gNum, gName, gType);
						break;
				    case "delGroup":
				    	fn_delGroup(groupData);
						break;
				    case "chgGroup":
				    	fn_chgGroup(groupData);
						break;
				    case "manageMember":
				    	fn_manageGroupMember(groupData);
						break;
				    case "forceRefresh":
				    	fn_getThirdPartyPlatUser('1');
						break;
			    }
			}
	    }
	});
	$('#rmenu_group').menu('show',{
		left: event.pageX,
		top: event.pageY
	});
}

//在地图上展示线路信息。
function fn_showLineToMap(){
	window.mapLineObj = window.mapLineObj || {};
	window.mapLineLableObj = window.mapLineLableObj || {};
	$.ajax({
		type : "POST",
		url : "webservice/api/v1/comm/basChannelLine/queryToMapShow",
		timeout : 2000,
//		async: false, //使用同步的方式,true为异步方式。
		dataType : "json",
		error : function (XMLHttpRequest, textStatus, errorThrown) { //调取ajax接口失败。
			for (var objKey in window.mapLineObj) {
			     if (window.mapLineObj[objKey]) {
			    	 if (window.top.myMapType == 'baidu') {
			    		 window.top.map.removeOverlay(window.mapLineObj[objKey]);
			    	 } else if (window.top.myMapType == 'google') {
			    		 window.mapLineObj[objKey].setMap(null);
			    	 }
			    	 window.mapLineObj[objKey] = null;
			    	 delete window.mapLineObj[objKey];
			     }
			}
			for (var objLableKey in window.mapLineLableObj) {
				if (window.window.mapLineLableObj[objLableKey]) {
					if (window.top.myMapType == 'baidu') {
						window.top.map.removeOverlay(window.mapLineLableObj[objLableKey]);
					} else if (window.top.myMapType == 'google') {
						window.window.mapLineLableObj[objLableKey].setMap(null);
					}
					window.mapLineLableObj[objLableKey] = null;
					delete window.mapLineLableObj[objLableKey];
				}
			}
		},
		success : function(data) {
			// 首先清空地图上原有的线路覆盖物对象。
			for (var objKey in window.mapLineObj) {
			     if (window.mapLineObj[objKey]) {
			    	 if (window.top.myMapType == 'baidu') {
			    		 window.top.map.removeOverlay(window.mapLineObj[objKey]);
			    	 } else if (window.top.myMapType == 'google') {
			    		 window.mapLineObj[objKey].setMap(null);
			    	 }
			    	 window.mapLineObj[objKey] = null;
			    	 delete window.mapLineObj[objKey];
			     }
			}
			for (var objKey in window.mapLineLableObj) {
				if (window.mapLineLableObj[objKey]) {
					if (window.top.myMapType == 'baidu') {
						window.top.map.removeOverlay(window.mapLineLableObj[objKey]);
					} else if (window.top.myMapType == 'google') {
						window.mapLineLableObj[objKey].setMap(null);
					}
					window.mapLineLableObj[objKey] = null;
					delete window.mapLineLableObj[objKey];
				}
			}
			// 如检索数据成功，则绘制新的线路覆盖物对象。
			if (data && data.length && data.length > 0) {
				var chanid = '', pointArr = [], chanObj = {};
				for (var i = 0; i < data.length; i ++) {
					if (data[i].CHANID != chanid) {
						if(data[i].ORG_NUM == window.top.userInfo.userInfo.org_num ){
							if (chanid != '') {
								// 绘制相关地图覆盖物。
								if (window.top.myMapType == 'baidu') {
									var chanPath = new BMap.Polyline(pointArr, {
										strokeColor: chanObj.CCOLOR, // 线条颜色 黑色
										strokeOpacity: chanObj.COPACITY, // 透明度 50%
										strokeWeight: chanObj.CLWEIGHT,
										enableMassClear: false,
										strokeStyle:'dashed',
										chanObj: chanObj
									});
									var label = new BMap.Label(chanObj.CNAME, {
										offset: new BMap.Size(23, 0),
										position:pointArr[0]
									});
									window.mapLineLableObj[chanid] = label;
									window.map.addOverlay(label);
									window.map.addOverlay(chanPath);
									chanPath.chanObj = chanObj || {};
									window.mapLineObj[chanid] = chanPath;
								}
							}
							// 重置相关保护区覆盖物对象，以便绘制下一个保护区覆盖物。
							chanid = data[i].CHANID;
							pointArr = [];
							chanObj = {
								CHANID: data[i].CHANID,
								CNAME: data[i].CNAME,
								CCOLOR:fn_conVal(data[i].CCOLOR) == '' ? '#8AB66D' : fn_conVal(data[i].CCOLOR),
								CLWEIGHT:fn_conVal(data[i].CLWEIGHT) == '' ? 5 : fn_conVal(data[i].CLWEIGHT),
								COPACITY:fn_conVal(data[i].COPACITY) == '' ? 0 : fn_conVal(data[i].COPACITY),
								MEMO: data[i].MEMO
							}
						}
					}
					if (window.top.myMapType == 'baidu') {
						var point = BMap.BPoint(Number(data[i].LONGITUDE),Number(data[i].LATITUDE));
						pointArr.push(point);
					} else if (window.top.myMapType == 'google') {
						var glatlng = wgs2gcj(Number(data[i].LATITUDE), Number(data[i].LONGITUDE));
						var lat = glatlng[0];
						var lng = glatlng[1];
						var point = new google.maps.LatLng(Number(lat), Number(lng)); //设备坐标点
						pointArr.push(point);
					}
				}
				if (window.top.myMapType == 'baidu') {
					var linePath = new BMap.Polyline(pointArr, {
						strokeColor: chanObj.CCOLOR, // 线条颜色 黑色
						strokeOpacity: chanObj.COPACITY, // 透明度 50%
						strokeWeight: chanObj.CLWEIGHT,
						enableMassClear: false,
						strokeStyle:'dashed',
						chanObj: chanObj
					});
					var label = new BMap.Label(chanObj.CNAME, {
						offset: new BMap.Size(23, 0),
						position:pointArr[0]
					});
					window.map.addOverlay(label);
					window.map.addOverlay(linePath);
					linePath.chanObj = chanObj || {};
					window.mapLineLableObj[chanObj.CHANID] = label;
					window.mapLineObj[chanObj.CHANID] = linePath;
				}
			}
		}
	});
}

// 用户在地图上定位。
function fn_userLocation(num) {
	// 隐藏小组树。
	function groupTreeCancel() {
		$('.dispatch>.left>.group').css('display', 'none');
		$('.dispatch > .left .ulWrap').stop();
		$('.dispatch > .left .ulWrap').css({
			display : 'none',
			height : 0
		});
		$('.dispatch > .left .titleDiv').removeClass('active');
	}
	groupTreeCancel();
	// 开始终端用户在地图上的定位。
	window.top.userLocation = {
		flag : true,
		userNum : num
	}
}

// 解散小组。
function fn_delGroup(groupData) {
	var gNum = groupData.nodeId;
	var gName = groupData.nodeName;
	var gType = groupData.nodeType;
	if (gType == '0') { //单位或未分配成员小组不允许解散。
		var msg = '【' + gName + '】'+lang.dispatch.dissolutionNotAllowed;
		prompt('error', msg, 2000);
		return;
	}
	var userType = fn_getTreeType();
	if (gType != '2' && userType != 'all') { //一般调度员不允许解散非临时组。
		var msg = '【' + gName + '】'+lang.dispatch.notTempGroup + lang.dispatch.noDissolveGroup;
		prompt('error', msg, 2000);
		return;
	}
	$.messager.confirm(lang.dispatch.disbandageGroup,'【' + gName + '】'+lang.dispatch.groupDissolvedDissolution,function(r) {
		if (r) {
			var ret = 0;
			var retFn = function(bRes, cause, strCause, QueryRes) {
				if (bRes == true) {
					prompt('success', '【' + gName + '】'+lang.dispatch.groupDissSucc, 1000);
				} else {
					var errMsg = window.top.IDT.GetCauseStr(cause);
					prompt('error', '【' + gName + '】'+lang.dispatch.failureGroupDiss+'，'+lang.system.Causeoferror+'：' + errMsg, 1000);
				}
			};
			ret = window.top.m_IdtApi.GDel(gNum, retFn);
			if (ret < 0) {
				prompt('error', '【' + gName + '】'+lang.dispatch.groupDisbandedFailure+'，'+lang.dispatch.unableConnectServer, 1000);
			}
		}
	});
}

// 修改小组基本信息。
function fn_chgGroup(groupData) {
	var gNum = groupData.nodeId;
	var gName = groupData.nodeName;
	var gType = groupData.nodeType;
	var gPrio = groupData.nodePrio;
	var aGnum = groupData.nodeAgnum;
	if (gType == '0') { //单位或未分配成员小组不允许修改。
		var msg = '【' + gName + '】'+lang.dispatch.noModifiyAllowed;
		prompt('error', msg, 2000);
		return;
	}
	var userType = fn_getTreeType();
	if (gType != '2' && userType != 'all') { //一般调度员不允许修改非临时组。
		var msg = '【' + gName + '】'+lang.dispatch.notTempGroup + lang.dispatch.noModifyGroup;
		prompt('error', msg, 2000);
		return;
	}

	if ($('#rmenuModifyGroupDlg').length <= 0) {
		var htmlStr = '<div class="easyui-panel" id="rmenuModifyGroupDlg" style="display:none;">' +
						'  <div style="padding:10px 20px 10px 20px">' +
						'    <form class="valfrm" method="post"><input type="hidden" class="GTYPE"/>' +
						'    	<table cellpadding="5" style="width:100%;table-layout:fixed;">' +
						'    		<tr style="height:40px;"><td style="width:45px;">'+lang.dispatch.groupNumber+':</td><td><input class="easyui-textbox GNUM" type="text" name="GNUM" style="width:168px;" data-options="disabled:true,required:true,validType:[\'checkNumber\',\'checkLen[1,15]\']"/></td></tr>' +
						'    		<tr style="height:40px;"><td>'+lang.dispatch.groupName+':</td><td><input class="easyui-textbox GNAME" type="text" name="GNAME" style="width:168px;" data-options="required:true,validType:[\'checkName\',\'checkLen[1,64]\']"/></td></tr>' +
						'    		<tr style="height:40px;"><td>'+lang.dispatch.priority+':</td><td><select class="easyui-combobox PRIORITY" name="PRIORITY" style="width:168px;" data-options="required:true,url:\'webservice/api/v1/comm/SysDictDetail/findByItemCode?DICT_CODE=priority_level\',valueField:\'ITEM_CODE\',textField:\'ITEM_NAME\',editable:false,panelHeight:\'auto\'"></select></td></tr>' +
						'    		<tr style="height:40px;"><td>'+lang.dispatch.Contactgroup+':</td><td><select class="easyui-combobox AGNUM" name="AGNUM" style="width:168px;" data-options="multiple:true,url:\'webservice/api/v1/comm/group/queryOrgGroupList\',valueField:\'GNUM\',textField:\'GNAME\',editable:false,panelHeight:\'226px\'"></select></td></tr>' +
						'    	</table>' +
						'    </form>' +
						'    <div style="text-align:right;padding:5px 10px 5px 5px;">' +
						'    	<a href="javascript:void(0)" class="easyui-linkbutton save" data-options="iconCls:\'icon-ok\'">'+lang.dispatch.save+'</a>' +
						'		<span style="width:20px;visibility:hidden;display:-moz-inline-box;display:inline-block;">x</span>' +
						'    	<a href="javascript:void(0)" class="easyui-linkbutton cancel" data-options="iconCls:\'icon-no\'">'+lang.common.cancel+'</a>' +
						'    </div>' +
						'  </div>' +
						'</div>';
		$(document.body).append(htmlStr);
		$.parser.parse("#rmenuModifyGroupDlg");
		//修改小组的保存按钮事件。
		$('#rmenuModifyGroupDlg .save').off('click').on('click',function() {
			var gnum = $('.valfrm .GNUM').textbox('getValue');
			var gname = $('.valfrm .GNAME').textbox('getValue');
			var gtype = Number($('.valfrm .GTYPE').val());
			var gprio = Number($('.valfrm .PRIORITY').combobox('getValue'));
			var agnum = $('.valfrm .AGNUM').combobox("getValues");//关联组
			agnum = agnum.toString();
			if (!agnum) agnum='';
			var jGroup = {
				GNum  : gnum,
				GName : gname,
				GType : gtype,
				Prio  : gprio,
				AGNum : agnum
			};
			var ret = 0;
			var retFn = function(bRes, cause, strCause, QueryRes) {
				if (bRes == true) {
					prompt('success', lang.dispatch.revisedGroupInfoSucc, 1000);
					$('#rmenuModifyGroupDlg').dialog('close');
				} else {
					var errMsg = window.top.IDT.GetCauseStr(cause);
					prompt('error', lang.system.saveGroupInfofailed+'，'+lang.dispatch.Causeoferror+'：' + errMsg, 1000);
				}
			};
			ret = window.top.m_IdtApi.GModify(jGroup, retFn);
			if (ret < 0) {
				prompt('error', lang.system.savetransactionopenfailed, 1000);
			}
		});
		//修改小组的取消按钮事件。
		$('#rmenuModifyGroupDlg .cancel').off('click').on('click',function() {
			$('#rmenuModifyGroupDlg').dialog('close');
		});
	}
	// 重新检索关联组的下拉列表。
	$('.valfrm .AGNUM').combobox('reload');
	// 给表单中的相关字段赋值。
	$('.valfrm .GTYPE').val(gType);
	$('.valfrm .GNUM').textbox('setValue',gNum);
	$('.valfrm .GNAME').textbox('setValue',gName);
	$('.valfrm .PRIORITY').combobox('setValue',gPrio);
	$('.valfrm .AGNUM').combobox('clear');
	if (aGnum && aGnum !='') {
		var agnumArr = aGnum.split(',');
		$('.valfrm .AGNUM').combobox('setValues',agnumArr);
	}
	$('#rmenuModifyGroupDlg').dialog({
		title : lang.dispatch.ModifyGroup,
		width : 270,
		height : 285,
		closed : false,
		cache : false,
		modal : true
	});
}

// 管理小组成员。
function fn_manageGroupMember(groupData) {
	var gNum = groupData.nodeId;
	var gName = groupData.nodeName;
	var gType = groupData.nodeType;
	var gPrio = groupData.nodePrio;
	var aGnum = groupData.nodeAgnum;
	if (gType == '0') { //单位或未分配成员小组不允许修改。
		var msg = '【' + gName + '】'+lang.dispatch.memberEditNotAllowed;
		prompt('error', msg, 2000);
		return;
	}
	var userType = fn_getTreeType();
	if (gType != '2' && userType != 'all') { //一般调度员不允许修改非临时组。
		var msg = '【' + gName + '】'+lang.dispatch.notTempGroup + lang.dispatch.noPermissionEditGroup;
		prompt('error', msg, 2000);
		return;
	}
	// 树重新加载。
	genDzwlTree();
	// 列表重新创建并加载。
	var parentDom = $('.userEdit .float-right .rightTable');
	parentDom.html('');
	parentDom.html('<table id="curTable"></table>');
	$('#curTable').datagrid({
		url : 'webservice/api/v1/comm/userBasic/queryGroupMember',
		queryParams: {
			"gnum" : gNum
		},
		columns : [ [ {
					field : 'TYPE',title : lang.common.type,width : 80,align : 'center',formatter:dgColCvt('grp_member_Type',true)
				},{ field : 'NAME', title : lang.common.num,width : 200,align : 'center',
					formatter:function(value,row,index) {
						return row.NUM + "(" + row.NAME + ")";
					}
				},{ field : 'edit',title : lang.common.Moveout,width : 80,align : 'center',
					formatter : function(value,row,index) {
						return ('<span class="icon import removeMember" onclick="deletedMemberRow('+ row.NUM + ')">&#xe606;</span>');
					}
				} ] ],
		fitColumns : true,
		scrollbarSize : 10,
		pageNumber : 10,
		singleSelect : true,
		idField : 'NUM',
		striped : true,
		fit : true,
		cache : false,
		nowrap : true,
		border : true,
		checkOnSelect : true,
		selectOnCheck : true,
		loadFilter : function(data) {
			if (!data || !data.length) return [];
			data = {
				total : data.length,
				rows : data
			};
			return data;
		},
	});
	$('.userEdit').attr('chooseType','member');
	$('.userEdit').attr('gnum',gNum);
	$('.userEdit .float-right .dicTitle').html(lang.basic.Currentgroup+' : <span style="color: #f5f5f5">' + gName + '</span>');
	$('.userEdit').dialog({
        title: lang.dispatch.ModifyMmeber,
        width: 747,
        height: 593,
        closed: false,
        cache: false,
        modal: true
    });
}

//GPS数据指示
function fn_onGpsRecInd(GpsRecStr) {
	if (window.map) {
		if (window.top.myMapType == 'baidu') {
			if (!GpsRecStr || !GpsRecStr.Num || !GpsRecStr.GpsInfo
					|| !GpsRecStr.GpsInfo.length || GpsRecStr.GpsInfo.length <= 0) return;
			var num = GpsRecStr.Num;
			var allOverlay = map.getOverlays();
			for (var j = 0; j < GpsRecStr.GpsInfo.length; j++) {
				if (!GpsRecStr.GpsInfo[j].Longitude || !GpsRecStr.GpsInfo[j].Latitude) continue;
				var lng = Number(GpsRecStr.GpsInfo[j].Longitude);
				var lat = Number(GpsRecStr.GpsInfo[j].Latitude);
				if (isNaN(lng) || isNaN(lat)) continue;
				var point = BMap.BPoint(lng, lat);
				if (hasAttention(num)) {
					setTimeout(function() {
						var uPointMap = {};
						uPointMap.lat = lat;
						uPointMap.lng = lng;
						updateAttentionList(num , uPointMap)
						panToAttentionList();
					}, 500);
				}
				for (var i = 0; i < allOverlay.length; i++) {
					if (allOverlay[i].className && allOverlay[i].className == "EndUserOverlay" && allOverlay[i]._num == num) {
						allOverlay[i].move(point);
					}
				}
				if (window.mapSosObj && window.mapSosObj[num]) {
					if (window.mapSosObj[num][0]) {
						window.mapSosObj[num][0].move(point);
					}
					if (window.mapSosObj[num][1]) {
						window.mapSosObj[num][1].move(point);
					}
				}
			}
		}
		if (window.top.myMapType == 'google') {
			if (!GpsRecStr || !GpsRecStr.Num || !GpsRecStr.GpsInfo
					|| !GpsRecStr.GpsInfo.length || GpsRecStr.GpsInfo.length <= 0) return;
			var num = GpsRecStr.Num;
			var allOverlay = window.googleMapOverlays
			for (var j = 0; j < GpsRecStr.GpsInfo.length; j++) {
				if (!GpsRecStr.GpsInfo[j].Longitude || !GpsRecStr.GpsInfo[j].Latitude) continue;
				var lngOrg = Number(GpsRecStr.GpsInfo[j].Longitude);
				var latOrg = Number(GpsRecStr.GpsInfo[j].Latitude);
				if (isNaN(lngOrg) || isNaN(latOrg)) continue;

				var glatlng = wgs2gcj(Number(latOrg), Number(lngOrg));
				var lat = glatlng[0];
				var lng = glatlng[1];

				var pmap = {lat: Number(lat), lng: Number(lng)};
				var point = new google.maps.LatLng(lat, lng);
				if (window.attentionUserId && window.attentionUserId == num) {
					setTimeout(function() {
						map.setCenter(pmap);
					}, 500);
				}
				for (var i = 0; i < allOverlay.length; i++) {
					if (allOverlay[i].className && allOverlay[i].className == "EndUserOverlay" && allOverlay[i]._num == num) {
						allOverlay[i].move(point);
					}
				}
				if (window.mapSosObj && window.mapSosObj[num]) {
					if (window.mapSosObj[num][0]) {
						window.mapSosObj[num][0].move(point);
					}
					if (window.mapSosObj[num][1]) {
						window.mapSosObj[num][1].move(point);
					}
				}
			}
		}
	}
}
function checkEles(num , nowLng , nowLat){
	var eles = window.eleFences; // 所有围栏
	if(!eles) return ;
	for(var i = 0 ; i < eles.length ; i++){
		var ele = eles[i];
		var inOrOut = ele.EF_TYPE;
		if(!checkThePeople(ele.ID , num)) continue;  // 围栏和人list
		var points = getAllPoints(ele.ID);  // 围栏和点list
		if(inOrOut == 'in'){
			if(isInEleFence(nowLng,nowLat,points)){
				var size1 = window.elefenceWarn.length;
				addElefenceWarn(ele.ID + '--' + num);
				var size2 = window.elefenceWarn.length;
				if(size1 != size2){
//					prompt('warn',"电子围栏进入告警！！！",2000);
					var point = BMap.BPoint(nowLng,nowLat);
					addEleFenceMapWarn(point,lang.dispatch.IllegalElectronicFence,10000);
					addEleFencesLog(ele , num);
				}
			}
		}
		if(inOrOut == 'out'){
			if(!isInEleFence(nowLng,nowLat,points)){
				var size1 = window.elefenceWarn.length;
				addElefenceWarn(ele.ID + '--' + num);
				var size2 = window.elefenceWarn.length;
				if(size1 != size2){
//					prompt('warn',"电子围栏出去告警！！！",2000);
					var point = BMap.BPoint(nowLng,nowLat);
					addEleFenceMapWarn(point,lang.dispatch.ViolationElectronicFence,10000);
					addEleFencesLog(ele , num);
				}
			}
		}

	}
}

function getAllPoints(EFID){
	for(var i = 0 ; window.elefenceAndArea && i < window.elefenceAndArea.length ; i++){
		 var elefence = window.elefenceAndArea[i];
		 if(elefence.ID == EFID){
			 return elefence.areaList;
		 }
	}
    return null;
}
function checkThePeople(EFID , num){
	for(var i = 0 ; window.elefenceAndMembers && i < window.elefenceAndMembers.length ; i++){
		var elefence = window.elefenceAndMembers[i];
		if(elefence.ID == EFID){
			var userList = elefence.userList;
			for(var t = 0 ; userList && t < userList.length ; t++){
				var u = userList[t];
				if(u.MEM_TYPE == '0'){   // 全体
					return true;
				}
				if(u.MEM_TYPE == '2'){ // 小组
					var checkResult = checkGroupAndPeopleIsParent(u.MEM_NUM , num);
					if(checkResult) return true;
				}
				if(u.MEM_TYPE == '1' && u.MEM_NUM == num){ // 人员
					return true;
				}

			}
		}
	}
	return false;
}

function checkGroupAndPeopleIsParent(gnum , num){
	var lists = window.allGroupAndPeople;
	for(var i = 0 ; i < lists.length ; i++){
		var list = lists[i];
		if(list.type == '2' && list.pid == gnum){
			var result = checkGroupAndPeopleIsParent(list.id , num);
			if(result) return true;
		}
		if(list.type == '1' && list.pid == gnum && list.id == num){
			return true;
		}
	}
	return false;
}
// GPS历史数据查询响应
function fn_onGpsHisQueryInd(UsrNum, SN, EndFlag, GpsRecStr) {
	if (window.map && SN == 0) {
		if(EndFlag == 0) window.gpsinfo = window.gpsinfo.concat(GpsRecStr.GpsInfo);
		if(EndFlag == 1) {
			window.gpsinfo = window.gpsinfo.concat(GpsRecStr.GpsInfo);
	        if (!window.gpsinfo || window.gpsinfo == null || window.gpsinfo.length == 0 || !window.gpsinfo[0].Longitude ||  window.gpsinfo[0].Longitude == null) {
	        	window.door = 'open';
	        	prompt('warn', lang.dispatch.noTrackData, 2000);
	            return;
	        }
	        window.gpsinfoBase = window.gpsinfo;
	        //去除偏移量大的点
//	        var resu = removePointToGpsInfo();
//	        window.gpsinfo = resu.nowDatas;
	        //补点
	        var result = addPointToGpsInfo();
	        var i = 1;
			while (result.hasAdd) {
				if(i > 0) break;
				window.gpsinfo = result.nowDatas;
				result = addPointToGpsInfo();
				i++;
			}
			if (window.top.myMapType == 'baidu') createLushu();
			if (window.top.myMapType == 'google') createLushuOfGoogle();
		}
		window.door = 'open';
	}
}

// 移除偏移量点比较大的点
function removePointToGpsInfo(){
	var result = {};
	var hasRemove = false;
	var nowDatas = [];
	for(var i = 0 ; window.gpsinfo && i < window.gpsinfo.length ; i++){
		var li = window.gpsinfo[i];
        if(i > 0 && i < (window.gpsinfo.length - 1)){
        	var liBefore = window.gpsinfo[i-1];
        	var liNext= window.gpsinfo[i+1];
        	var distance1 = getDistanceOfMile(li , liBefore);
        	var distance2 = getDistanceOfMile(li , liNext);
        	if(distance1 > 2000 && distance2 > 2000) continue;
        	nowDatas[nowDatas.length] = li;
        }else{
        	nowDatas[nowDatas.length] = li;
        }
	}
	result.hasRemove = hasRemove;
	result.nowDatas = nowDatas;
	return result;
}

function addPointToGpsInfo(){
	var result = {};
	var hasAdd = false;
	var nowDatas = [];
	for(var i = 0 ; window.gpsinfo && i < window.gpsinfo.length ; i++){
		var li = window.gpsinfo[i];
		nowDatas[nowDatas.length] = li;
		var Longitude = li.Longitude;
		var Latitude = li.Latitude;
		if(i < (window.gpsinfo.length - 1)){
             	var ret = addPointAction(i , nowDatas);
		        if(ret) hasAdd = true;
		}
	}
	result.hasAdd = hasAdd;
	result.nowDatas = nowDatas;
	return result;
}
function getDistance(li , liNext){
	var lon1 = Number(li.Longitude);
	var lat1 = Number(li.Latitude);
	var lon2 = Number(liNext.Longitude);
	var lat2 = Number(liNext.Latitude);
	var distance = (lat1 - lat2)*(lat1 - lat2) + (lon1 - lon2)*(lon1 - lon2);
	return distance;
}
function getDistanceOfMile(li , liNext){
	var lon1 = Number(li.Longitude);
	var lat1 = Number(li.Latitude);
	var lon2 = Number(liNext.Longitude);
	var lat2 = Number(liNext.Latitude);
	var pt1 = new BMap.Point(lon1, lat1);
	var pt2 = new BMap.Point(lon2, lat2);
	var distance = window.map.getDistance(pt1,pt2);
	return distance;
}
function addPointAction(i , nowDatas){
	var li = window.gpsinfo[i];
	var liNext = window.gpsinfo[i + 1];
	var distance = getDistance(li , liNext);
	if(distance > 4.4418002859722882e-8){
		var mpp = {};
		mpp.Longitude = (Number(li.Longitude) + (Number(liNext.Longitude) - Number(li.Longitude))/2).toFixed(6);
		mpp.Latitude = (Number(li.Latitude) + (Number(liNext.Latitude) - Number(li.Latitude))/2).toFixed(6);
		nowDatas[nowDatas.length] = mpp;
        return true;
	}else{
		return false;
	}
}
//百度地图的创建路书
function createLushu(){
	var arrPois=[];
	var lists = window.gpsinfo;
	for(var i = 0 ; i < lists.length ; i++){
		var li = lists[i];
		var Longitude = li.Longitude;
		var Latitude = li.Latitude;
		arrPois[i] = BMap.BPoint(Number(Longitude),Number(Latitude));
	}
	if(window.lushu && window.lushu!=null){
		window.map.removeOverlay(window.mapVarPolyline);
		window.map.removeOverlay(window.lushu._marker);
	}
	giveLuShu(arrPois);
	$(window.guijiDialog).find('.play-or-stop').html('&#xe6b2;');
	$(window.guijiDialog).find('.play-or-stop').addClass('active')
	$('#track-dg').datagrid({data: window.gpsinfoBase});
	// 实时刷新时间
	window.timer1 = window.setInterval(show, 500);
}
//百度地图的启动路书
function giveLuShu(arrPois){
	window.mapVarPolyline = new BMap.Polyline(arrPois, {strokeColor: '#111'});
	window.map.addOverlay(window.mapVarPolyline);
	window.map.setViewport(arrPois);
    window.lushu = new BMapLib.LuShu(window.map,arrPois,{
            defaultContent:"",// "从天安门到百度大厦"
            autoView:false,// 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
            icon  : new BMap.Icon('static/img/car.png', new BMap.Size(52,26),{anchor : new BMap.Size(27, 13)}),
            speed: window.mapVarRate*70,
            enableRotation:true,// 是否设置marker随着道路的走向进行旋转
            landmarkPois: [
            ]});
    window.lushu.start();
}
//google地图的创建路书
function createLushuOfGoogle(){
	var arrPois=[];
	var lists = window.gpsinfo;
	for(var i = 0 ; i < lists.length ; i++){
		var li = lists[i];
		var glatlng = wgs2gcj(Number(li.Latitude) , Number(li.Longitude));
		var lat = glatlng[0];
		var lng = glatlng[1];
		var map = {lat : Number(lat) , lng : Number(lng)}
		arrPois[i] = map;
	}
//	if(window.lushu && window.lushu!=null){
//		window.mapVarPolyline.setMap(null);
//		window.lushu._marker.setMap(null);
//	}
	if(window.lushu && window.lushu != null) lushuStop();
	if(window.mapVarPolyline && window.mapVarPolyline!=null) window.mapVarPolyline.setMap(null);
	if(window.lushu_marker && window.lushu_marker != null) window.lushu_marker.setMap(null);
	giveLuShuOfGoogle(arrPois);
	$(window.guijiDialog).find('.play-or-stop').html('&#xe6b2;');
	$(window.guijiDialog).find('.play-or-stop').addClass('active')
	$('#track-dg').datagrid({data: window.gpsinfoBase});
	// 实时刷新时间
	window.timer1 = window.setInterval(show, 500);
}
//google地图的启动路书
function giveLuShuOfGoogle(arrPois){
	var flightPath = new google.maps.Polyline({
      path: arrPois,
      geodesic: true,
      strokeColor: '#111',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    flightPath.setMap(map);
    window.mapVarPolyline = flightPath;
    window.map.panTo(arrPois[parseInt(arrPois.length/2)]);
    window.map.setZoom(18);
//	window.lushu = new BMapLib.LuShu(window.map,arrPois,{
//		defaultContent:"",// "从天安门到百度大厦"
//		autoView:false,// 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
//		icon  : new BMap.Icon('static/img/car.png', new BMap.Size(52,26),{anchor : new BMap.Size(27, 13)}),
//		speed: window.mapVarRate*70,
//		enableRotation:true,// 是否设置marker随着道路的走向进行旋转
//		landmarkPois: [
//			]});
//	window.lushu.start();
    window.lushu = new LuShu(arrPois);
    lushuStart();
}
// --------------------------------------------------------------------------------
// 呼叫信息指示
// 输入:
// event: 事件
// IDT.CALL_EVENT_Rel:event,UsrCtx,ID(IDT的呼叫ID),ucClose(IDT.CLOSE_BYUSER),usCause(IDT.CAUSE_ZERO)
// IDT.CALL_EVENT_PeerAnswer:event,UsrCtx,PeerNum,PeerName,SrvType(可能与发出时不同.例如想发起组呼(主控),但变成组呼接入)
// IDT.CALL_EVENT_In:event,ID(此时是IDT的呼叫ID,不是用户上下文),pcPeerNum,pcPeerName,SrvType,bIsGCall,ARx,ATx,VRx,VTx
// IDT.CALL_EVENT_MicInd:event,UsrCtx,ind(0听话,1讲话)
// IDT.CALL_EVENT_RecvInfo:event,UsrCtx,Info,InfoStr
// IDT.CALL_EVENT_TalkingIDInd:event,UsrCtx,TalkingNum,TalkingName
// IDT.CALL_EVENT_ConfCtrlInd:event,UsrCtx,Info{Info(IDT.SRV_INFO_MICREL),InfoStr}
// IDT.CALL_EVENT_ConfStatusRsp:event,UsrCtx(无效),MsgBody
// 返回:
// 0: 成功
// -1: 失败
// --------------------------------------------------------------------------------
function fn_onCallInd(event) {
	var params = arguments.length;
    switch (event) {
    	// event,UsrCtx,ID(IDT的呼叫ID),ucClose(IDT.CLOSE_BYUSER),usCause(IDT.CAUSE_ZERO)
    	case IDT.CALL_EVENT_Rel:
    		// console.log('IDT.CALL_EVENT_Rel');
	        if (params < 5)
	        	return -1;
	        // 挂断，需要关闭相关通讯对话框。
	        var usrCtx = arguments[1];
	        var callId = arguments[2];
	        var ucClose = arguments[3];
	        var usCause = arguments[4];
	        fn_stopRingVoice(callId);
	        if (ucClose != 1 && usCause && usCause != 0) { //对端不在线或忙等信息提示。
	        	var errMsg = window.top.IDT.GetCauseStr(usCause);
	        	prompt('warn', errMsg, 1000);
	        }
	        //判断视频会商窗口是否存在，且挂断的是否是视频会商的呼叫ID。
	        if ($('#interface-video-wrap').length > 0) {
	        	var m_CallId = $('#interface-video-wrap').attr("callId");
	        	if (m_CallId == callId) {
	        		$('#interface-video-wrap').remove();
		        	window.top.activeCallInfo = false;
		        	break;
	        	}
	        }
	        if (usrCtx && typeof(usrCtx)=='string' && usrCtx.startWith('gcall_')) { // 组呼。
	        	$('#'+usrCtx).remove();
	        	window.m_IdtApi.gcallInfo = null;
	        	window.top.activeCallInfo = false;
	        	break;
	        } else if (usrCtx && typeof(usrCtx)=='string' && usrCtx.startWith('viewvideo_')) { // 视频查看。
	        	window.videoMonitor.removeVideo(usrCtx);
	        	window.top.activeCallInfo = false;
	        	break;
	        } else if (usrCtx) { // 基本两方通话或视频已接听或云台控制。
	        	var sh = $('#sureChat_commDlg_' + usrCtx).attr("timeIntervalSn");
	        	if (sh) clearInterval(sh);
	        	if ($('#sureChat_commDlg_' + usrCtx).hasClass('big-cloud-control')) {
	        		$('#sureChat_commDlg_' + usrCtx).find('.speedInput').slider('destroy');
	        	}
	        	// 不是云台控制，则去除活动通信标志。
	        	if (!$('#sureChat_commDlg_' + usrCtx).hasClass('big-cloud-control')) window.top.activeCallInfo = false;
	        	if (typeof(usrCtx) != 'string' || usrCtx.indexOf('guard_') == -1) $('#sureChat_commDlg_' + usrCtx).remove();
	        	break;
	        }
	        if (callId || callId == 0) { // 基本两方通话或视频未接听,或者是视频查看调用未接听。
	        	var msgObj = $("#popWrap").find('.message');
	        	for (var i = 0; i < msgObj.length; i++) {
	        		var curCallId = msgObj.eq(i).attr('callId');
	        		if ((curCallId || curCallId==0) && curCallId == callId) {
	        			msgObj.eq(i).remove();
	        			fn_freshNotAnswerCount();
	        			break;
	        		}
	        	}
	        	var videoReqObj = $(".video-request");
	        	for (var i = 0; i < videoReqObj.length; i++) {
	        		var curCallId = videoReqObj.eq(i).attr('callId');
	        		if (curCallId && curCallId == callId) {
	        			var sh = videoReqObj.eq(i).attr("timeIntervalSn");
	    	        	if (sh) clearInterval(sh);
	    	        	videoReqObj.eq(i).remove();
	    	        	break;
	        		}
	        	}
	        	break;
	        }
	        break;
	    // event,UsrCtx,PeerNum,PeerName,SrvType(可能与发出时不同.例如想发起组呼(主控),但变成组呼接入)
	    case IDT.CALL_EVENT_PeerAnswer:
	    	// console.log('IDT.CALL_EVENT_PeerAnswer');
	        if (params < 5)
	            return -1;
	        // 应答，普通声音或视频双方通话，需要开始通话计时。
	        if (arguments[4]==IDT.SRV_TYPE_BASIC_CALL) fn_setTimeCount(arguments[1]);
	        // 应签，组呼，需要执行组呼的相关代码。
	        var usrCtx = arguments[1];
	        if (arguments[4]==IDT.SRV_TYPE_CONF && usrCtx && typeof(usrCtx)=='string' && usrCtx.substr(0,6)=='gcall_') { //组呼。
	        	fn_micwant();
	        } else if (arguments[4]==IDT.SRV_TYPE_CONF && usrCtx && typeof(usrCtx)=='string' && usrCtx.substr(0,9)=='videoConf') { //视频会商发起方收到回应。
	        	//视频会商开启时，自动开启自由发言。
	        	var callId = $('#interface-video-wrap').attr("callId");
	        	var callRef = arguments[2];
	        	$('#interface-video-wrap').attr('callRef', callRef);
	        	window.top.m_IdtApi.CallConfCtrlReq(callId, null, IDT.SRV_INFO_AUTOMICON, 1);
	        	$('#interface-video>.content>.video-wrap>.btn-wrap').find('.open').css('display', 'none');
	        	$('#interface-video>.content>.video-wrap>.btn-wrap').find('.stop').css('display', 'block');
	        } else if (arguments[4]==IDT.SRV_TYPE_CONF) { //半双工单呼。
	        	var callId = $('#sureChat_commDlg_' + arguments[1]).attr("callId");
	        	window.top.m_IdtApi.CallMicCtrl(callId, false);
	        	fn_setTimeCount(arguments[1]);
	        }
	        break;
	    // event,ID(此时是IDT的呼叫ID,不是用户上下文),pcPeerNum,pcPeerName,SrvType,bIsGCall,ARx,ATx,VRx,VTx
	    case IDT.CALL_EVENT_In:
	    	// console.log('IDT.CALL_EVENT_In');
	        if (params < 10)
	            return -1;
	        var callId 		= arguments[1];
	        var pcPeerNum 	= arguments[2];
	        var pcPeerName 	= arguments[3];
	        var SrvType 	= arguments[4];
	        var bIsGCall 	= arguments[5];
	        var ARx 		= arguments[6];
	        var ATx 		= arguments[7];
	        var VRx 		= arguments[8];
	        var VTx 		= arguments[9];
	        // 如果人员姓名为空，则从后台获取人员姓名。
	        if (!pcPeerName) {
	        	pcPeerName = fn_getPersonName(pcPeerNum);
	        	arguments[3] = pcPeerName;
	        }
	        // 普通两方语音、视频对讲。
	        if (SrvType == IDT.SRV_TYPE_BASIC_CALL && bIsGCall == false) {
	        	if ($('#interface-video-wrap').length > 0) return; //如果有视频会商在，则不接受任何单呼（包括单视频单呼）。
	        	if (arguments[8]=='0' && arguments[9]=='0') { //基本双向语音通话。
	        		fn_startRingVoice('voiceCall.mp3',callId);
	        		fn_voiceCallIn(arguments);
	        	} else if (arguments[8]=='1' && arguments[9]=='0') { //一键报警。
	        		fn_oneTouchAlarmIn(arguments);
	        	} else { //基本双向视频通话。
	        		fn_startRingVoice('videoCall.mp3',callId);
	        		fn_videoCallIn(arguments);
	        	}
	        	break;
	        }
	        // 视频上传。
	        if (SrvType == IDT.SRV_TYPE_WATCH_DOWN) {
	        	// 创建通讯序号。
	        	var sn = 'viewvideo_' + fn_genSn();
	        	// 创建视频通讯面板。
	        	var isVoice = '0';
	        	if (ARx == 1) isVoice = '1';
	        	//判断当前要查看的视频对象在视频查看窗口中是否已经存在，如果已存在，则提示不允许重复查看同一视频，然后直接返回。
				if (fn_isExistViewNum(pcPeerNum) == true) {
					prompt('warn', '不允许重复查看同一对象视频。', 1000);
					break;
				}
	        	fn_addVideoMonitor(sn, pcPeerNum, pcPeerName, null, isVoice);
	        	var peerVideo = $('#' + sn + '_play_peer')[0];
	        	window.top.m_IdtApi.CallAnswer(callId, sn, null, peerVideo, ARx, ATx, VRx, VTx);
	        	$('#' + sn).attr("callId", callId);
	        	break;
	        }
	        // 视频查看。
	        if (SrvType == IDT.SRV_TYPE_WATCH_UP) {
	        	if ($('#interface-video-wrap').length > 0) { //如果已经有视频会商窗口打开。
	        		var callSn = $('#interface-video-wrap').attr("callSn");
	        		var myVideo = $('#id_video_my_1_' + callSn)[0];
	        		var mySn = 'VCL_VV_' + fn_genSn();
	        		window.top.m_IdtApi.CallAnswer(callId, mySn, myVideo, null, ARx, ATx, VRx, VTx);
	        		break;
	        	} else {
	        		fn_startRingVoice('videoCall.mp3',callId);
		        	fn_videoRequestIn(arguments);
		        	break;
	        	}
	        }
	        // 组呼。
	        if (SrvType == IDT.SRV_TYPE_CONF && bIsGCall == true && !window.m_IdtApi.gcallInfo) {
	        	if ($('#interface-video-wrap').length > 0) return; //如果有视频会商在，则不接受组呼。
	        	var isLockGroup = $('.dispatch>.left>.titleDiv>#xingxing').hasClass('active');
	        	var curGroupId 	= $('#hiddenCurGroupId').val();
	        	if (isLockGroup == false || curGroupId == pcPeerNum) {
	        		fn_gCallAnswer(callId, pcPeerNum, pcPeerName);
	        	}
	        }
	        break;
	    case IDT.CALL_EVENT_MicInd: // event, UsrCtx, ind(0听话,1讲话)
	    	// console.log('IDT.CALL_EVENT_MicInd');
	        if (params < 3)
	            return -1;
	        break;
	    case IDT.CALL_EVENT_RecvInfo: // event, UsrCtx, Info, InfoStr
	    	// console.log('IDT.CALL_EVENT_RecvInfo');
	        if (params < 4)
	            return -1;
	        break;
	    case IDT.CALL_EVENT_TalkingIDInd: // event,UsrCtx,TalkingNum,TalkingName
	    	// console.log('IDT.CALL_EVENT_TalkingIDInd');
	        if (params < 4)
	            return -1;
	        var UsrCtx = arguments[1];
	        var TalkingNum = arguments[2];
	        var TalkingName = arguments[3];
	        if (UsrCtx && typeof(UsrCtx)=='string' && UsrCtx.substr(0,9)=='videoConf') { //视频会商，切换主会场。
	        	//需要改变视频会商中左边人员列表的主会场标志，以及右边视频窗口中主会场的标题。
	        	if ($('#interface-video-wrap').length <= 0) return;
	        	var callSn = $('#interface-video-wrap').attr("callSn");
	        	var confParamStr = $('#interface-video-wrap').attr('confData');
	    	    var confParam = JSON.parse(confParamStr);
	        	if (callSn && UsrCtx == callSn) {
	        		if (confParam.openType != 'main') {
	        			var $myVideoWin = $("#interface-video>.content>.video-wrap .video-window>ul>li[videoType='my']");
		        		var $peerVideoWin = $("#interface-video>.content>.video-wrap .video-window>ul>li[videoType='peer']");
			        	if (TalkingNum == window.userInfo.userInfo.num) { //本人做主会场。
			        		$myVideoWin.attr('dataid', 0);
			        		$peerVideoWin.attr('dataid', 1);
			        	} else { //其它人做主会场。
			        		$peerVideoWin.attr('dataid', 0);
			        		$myVideoWin.attr('dataid', 1);
			        	}
	        		}
		        	var $videoWin = getVideoLiIndex(0);
		        	$videoWin.attr('dataNum',TalkingNum);
		        	$videoWin.attr('dataName',TalkingName);
		        	$videoWin.find('.place .id').text(TalkingNum);
		        	$videoWin.find('.place .name').text(TalkingName);
		        	window.top.vcl_judgeHost();
		        	window.top.setAllVideoLiSize();
		        	break;
	        	}
	        }
	        if (!window.m_IdtApi.gcallInfo) break;
	        if (TalkingNum && TalkingName) {
	        	fn_startGCallVoice(TalkingNum, TalkingName);
				/*
				 * 修改：株洲华通科技
				 * 描述：对接串口通信代理程序，实现实现自己接手咪
				 * 作者：ALEX QQ：8187265
				 * 标记：开始<--------------
				*/
				console.log('IDT.CALL_EVENT_TalkingIDInd-busy', TalkingNum, window.top.userInfo.userInfo.num);
				if(window.top.Rs232WS && window.top.userInfo.userInfo.num != TalkingNum) {
					//console.log('IDT.CALL_EVENT_TalkingIDInd-busy', window.top.userInfo.userInfo.num);
					window.top.Rs232WS.send_busy();
				}
				window.top.Rs232WS_UsrCtx = UsrCtx;
				window.top.Rs232WS_TalkingNum = TalkingNum;
				/*
				 * 标记：结束-------------->
				*/
	        } else {
	        	fn_stopGCallVoice();
				/*
				 * 修改：株洲华通科技
				 * 描述：对接串口通信代理程序，实现实现自己接手咪
				 * 作者：ALEX QQ：8187265
				 * 标记：开始<--------------
				*/
				console.log('IDT.CALL_EVENT_TalkingIDInd-free', window.top.Rs232WS_UsrCtx, UsrCtx, window.top.Rs232WS_TalkingNum, window.top.userInfo.userInfo.num);
				if(window.top.Rs232WS && window.top.Rs232WS_UsrCtx && window.top.Rs232WS_UsrCtx == UsrCtx && window.top.Rs232WS_TalkingNum && window.top.Rs232WS_TalkingNum != window.top.userInfo.userInfo.num) {
					//console.log('IDT.CALL_EVENT_TalkingIDInd-free');
					window.top.Rs232WS.send_free();
				}
				/*
				 * 标记：结束-------------->
				*/
	        }
	        break;
	    // event,UsrCtx,type(1申请话权,2释放话权),usrNum,usrName 指定话权模式下，
	    case IDT.CALL_EVENT_ConfCtrlInd:
	    	fn_videoConfRequestVoice(arguments);
	        if (params < 5)
	            return -1;
	        break;
	    case IDT.CALL_EVENT_ConfStatusRsp: // event, UsrCtx(无效), MsgBody
	        if (params < 3)
	            return -1;
	        fn_refreshVideoConfUserList(arguments[2]);
	        break;
	    default:
	        break;
    }
    return 0;
}

// 创建通讯调用SN的函数。
function fn_genSn() {
	window.m_IdtApi.SN = window.m_IdtApi.SN || 0;
	window.m_IdtApi.SN = window.m_IdtApi.SN + 1;
	return window.m_IdtApi.SN;
}

// 根据浏览器类型，创建不同的视频控件类型。ie:ocx,其它：video
function fn_genVideo(objId,ow,oh,muted,hi) {
	if (!objId) return '';
	if (!ow) ow = 0;
	if (!oh) oh = 0;
	if (!muted) muted = false;
	if (!hi) hi = false;
	var bIsIe = window.top.bIsIe;
	var htmlStr = '';
	if (bIsIe == true) {
//		htmlStr = '<OBJECT id="' + objId + '" CLASSID="clsid:296408FF-B265-4E98-AE0C-22942951BF1C" CODEBASE=""' +
		htmlStr = '<OBJECT id="' + objId + '" CLASSID="clsid:C1DCB838-B5B4-4AF0-82B6-BB2FEB63ED2E" CODEBASE=""' +
					' style="width:' + ow + ';height:' + oh + ';';
		if (hi == true) htmlStr += 'display:none;';
		htmlStr +=	'align:center;hspace:0;vspace:0;border:0;">' +
						'<param name="wmode" value="transparent"></OBJECT>';
	} else {
		htmlStr = '<video style="width:'+ow+';height:'+oh+';';
		if (hi == true) htmlStr += 'display:none;';
		htmlStr += '" id="' + objId + '" autoplay';
		if (muted == true) htmlStr += ' muted';
		htmlStr += '></video>';
	}
	return htmlStr;
}

// 创建videojs播放器。
function fn_genVideoJsWidget(objId, videoUrl) {
	var htmlStr = '<video id="' + objId + '" ' +
				  '	class="video-js vjs-default-skin vjs-big-play-centered" ' +
				  '	style="width:100%;height:100%;" preload="none" ' +
				  '	poster="" x5-video-player-fullscreen="true" x5-video-player-type="h5">' +
				  ' <source src="' + videoUrl + '" type="rtmp/flv"></source>' +
				  '</video>';
	return htmlStr;
}

// 基本两方语音通信呼出。
function fn_voiceCall(callNum,callName) {
	if (callNum == window.top.userInfo.userInfo.num) {
		prompt('error', lang.dispatch.communicateyourself, 1000);
		return;
	}
	if (window.top.activeCallInfo == true) {
		prompt('warn', lang.dispatch.CurrentlyNotAllowed, 1000);
		return;
	}
	// 获取该终端用户是全双工单呼还是半双工单呼。
	var isHalfDuplex = fn_getUserWorkInfo(callNum, 'd');
	var talkRightHtml = '';
	if (isHalfDuplex == '1') talkRightHtml = '<div class="touchVoice"></div>';
	var nameInfo = '【' + callNum + '】' + callName;
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建语音通讯面板。
	var htmlStr = '<div class="calling" id="sureChat_commDlg_' + sn + '" callNum="' + callNum + '" callName="' + callName + '">' +
		fn_genVideo('id_voice_my_' + sn,0,0,true) +
		fn_genVideo('id_voice_peer_' + sn,0,0,false) +
//		'<video style="width:0;height:0;" id="id_voice_my_' + sn + '" autoplay muted></video>' +
//		'<video style="width:0;height:0;" id="id_voice_peer_' + sn + '" autoplay></video>' +
	    '<div class="header icon">&#xe628; '+lang.dispatch.voiceCall+'</div>' +
	    '<div class="content">' +
	    '    <div class="img-wrap">' +
	    '        <img src="/upload/headicon/' + callNum + '.png" alt=""/>' +
	    '    </div>' +
	    '    <div class="name" id="callName" title="' + nameInfo + '">' + nameInfo + '</div>' +
	    '    <div class="time" id="callTime">'+lang.dispatch.inDialong+'</div>' +
	    '</div>' + talkRightHtml +
	    '<div class="footer icon">' +
        '	<span class="icon callClose" title="'+lang.dispatch.hangUp+'">&#xe659;</span>' +
        '	<span class="icon viewVideo" title="'+lang.system.CheckVideo+'">&#xe62d;</span>' +
        '	<span class="icon keyDial" title="'+lang.dispatch.Dial+'">&#xe63d;</span>' +
        '</div></div>';
	$(document.body).append(htmlStr);
    $('.calling>.content,.calling>.header').off('mousedown').on('mousedown',function (event) {
        var isMove = true;
        var abs_x = event.pageX - $('.calling').offset().left;
        var abs_y = event.pageY - $('.calling').offset().top;
        $(document).off('mousemove').on('mousemove',function (event) {
            if (isMove) {
                $('.calling').css({
                    'left': event.pageX - abs_x,
                    'top': event.pageY - abs_y,
                    'margin-left': 0
                });
            }
        }).off('mouseup').on('mouseup',function () {
            isMove = false;
        });
    });
	var myVideo = $('#id_voice_my_' + sn)[0];
	var peerVideo = $('#id_voice_peer_' + sn)[0];
	var callId = null;
	if (isHalfDuplex == '1') { //发起半双工呼叫，也就是对端为个人的组呼。
		callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 0, 1, 0, 0, callNum, IDT.SRV_TYPE_CONF, "", 1, 0);
	} else { //发起全双工语音单呼。
		callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 0, 0, callNum, IDT.SRV_TYPE_BASIC_CALL, "", 1, 0);
	}
	window.top.activeCallInfo = true;
	$('#sureChat_commDlg_' + sn).attr("callId", callId);
	$('#sureChat_commDlg_' + sn).attr("callSn", sn);
	//绑定话权控制相关事件。
	if (isHalfDuplex == '1') {
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mousedown').on('mousedown', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, true);
			$(this).css('background','url(static/img/talk.png)');
		});
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseup').on('mouseup', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
			$(this).css('background','url(static/img/talkclk.png)');
		});
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseleave').on('mouseleave', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
			$(this).css('background','url(static/img/talkclk.png)');
		});
	}
	$('#sureChat_commDlg_' + sn + ' .footer').off('click').on('click', function(e) {
		var $thisObj = $(e.target);
		var $thisPanel = $(e.target).parent().parent();
		if ($thisObj.hasClass('callClose')) {
			var callId = $thisPanel.attr("callId");
			var sn = $thisPanel.attr("callSn");
			var sh = $thisPanel.attr("timeIntervalSn");
			if (sh) clearInterval(sh);
			window.top.m_IdtApi.CallRel(callId, sn, 0);
			$thisPanel.remove();
			window.top.activeCallInfo = false;
		} else if ($thisObj.hasClass('viewVideo')) {
			var callNum = $thisPanel.attr("callNum");
			var callName = $thisPanel.attr("callName");
			fn_videoView(callNum,callName);
		} else if ($thisObj.hasClass('keyDial')) {
			var callId = $thisPanel.attr("callId");
			fn_openKeyDialDlg(function(otherNum) {
				window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_NUM, otherNum, null);
			});
		}
	});
}

// 基本两方语音通信呼进。
function fn_voiceCallIn(param) {
	fn_insPerNotAnswerLog("voice",param);
	fn_noticeCallIn('voice',param,function(callId,callNum,callName) {
		fn_stopRingVoice(callId);
		if (window.top.activeCallInfo == true) {
			prompt('warn', lang.dispatch.communicationAllowed, 1000);
			return;
		}
		fn_delPerNotAnswerLog("voice");
		// 判断是否为哨位的对讲号码，如果是，则弹出哨位的通讯通话窗。如果不是，则仍调用默认的基本两方语音通话窗。
		var posId = null;
		$.ajax({
			type : "POST",
			url : 'webservice/api/v1/comm/SysGuard/getMinPosId',
			async : false,
			data : {
				'dev_num' : callNum
			},
			dataType : "json",
			success : function(data) {
				if (data && data.flag && data.flag == true) {
					posId = data.posid;
				}
				if (!posId) posId = '';
			}
		});
		if (posId && posId != '') {
			fn_openGuardInfoW(posId, callId);
			return;
		}
		// 获取该终端用户是全双工单呼还是半双工单呼。
		var isHalfDuplex = fn_getUserWorkInfo(callNum, 'd');
		isHalfDuplex = '0';
		var talkRightHtml = '';
		if (isHalfDuplex == '1') talkRightHtml = '<div class="touchVoice"></div>';
		var nameInfo = '【' + callNum + '】' + callName;
		// 创建通讯序号。
		var sn = fn_genSn();
		// 创建语音通讯面板。
		var htmlStr = '<div class="calling" id="sureChat_commDlg_' + sn + '" callNum="' + callNum + '" callName="' + callName + '">' +
			fn_genVideo('id_voice_my_' + sn,0,0,true) +
			fn_genVideo('id_voice_peer_' + sn,0,0,false) +
//			'<video style="width:0;height:0;" id="id_voice_my_' + sn + '" autoplay muted></video>' +
//			'<video style="width:0;height:0;" id="id_voice_peer_' + sn + '" autoplay></video>' +
		    '<div class="header icon">&#xe628; '+lang.dispatch.voiceCall+'</div>' +
		    '<div class="content">' +
		    '    <div class="img-wrap">' +
		    '        <img src="/upload/headicon/' + callNum + '.png" alt=""/>' +
		    '    </div>' +
		    '    <div class="name" id="callName" title="' + nameInfo + '">' + nameInfo + '</div>' +
		    '    <div class="time" id="callTime">'+lang.dispatch.inDialong+'</div>' +
		    '</div>' + talkRightHtml +
		    '<div class="footer icon">' +
	        '	<span class="icon callClose" title="'+lang.dispatch.hangUp+'">&#xe659;</span>' +
	        '	<span class="icon viewVideo" title="'+lang.dispatch.CheckVideo+'">&#xe62d;</span>' +
	        '	<span class="icon keyDial" title="'+lang.dispatch.Dial+'">&#xe63d;</span>' +
	        '</div></div>';
		$(document.body).append(htmlStr);
	    $('.calling>.content,.calling>.header').off('mousedown').on('mousedown',function (event) {
	        var isMove = true;
	        var abs_x = event.pageX - $('.calling').offset().left;
	        var abs_y = event.pageY - $('.calling').offset().top;
	        $(document).off('mousemove').on('mousemove',function (event) {
	            if (isMove) {
	                $('.calling').css({
	                    'left': event.pageX - abs_x,
	                    'top': event.pageY - abs_y,
	                    'margin-left': 0
	                });
	            }
	        }).off('mouseup').on('mouseup',function () {
	            isMove = false;
	        });
	    });
		var myVideo = $('#id_voice_my_' + sn)[0];
		var peerVideo = $('#id_voice_peer_' + sn)[0];
		window.top.m_IdtApi.CallAnswer(callId, sn, myVideo, peerVideo, 1, 1, 0, 0);
		$('#sureChat_commDlg_' + sn).attr("callId", callId);
		$('#sureChat_commDlg_' + sn).attr("callSn", sn);
		window.top.activeCallInfo = true;
		//绑定话权控制相关事件。
		if (isHalfDuplex == '1') {
			$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mousedown').on('mousedown', function(e) {
				var callId = $(this).parent().attr("callId");
				if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, true);
				$(this).css('background','url(static/img/talk.png)');
			});
			$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseup').on('mouseup', function(e) {
				var callId = $(this).parent().attr("callId");
				if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
				$(this).css('background','url(static/img/talkclk.png)');
			});
			$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseleave').on('mouseleave', function(e) {
				var callId = $(this).parent().attr("callId");
				if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
				$(this).css('background','url(static/img/talkclk.png)');
			});
		}
		$('#sureChat_commDlg_' + sn + ' .footer').off('click').on('click', function(e) {
			var $thisObj = $(e.target);
			var $thisPanel = $(e.target).parent().parent();
			if ($thisObj.hasClass('callClose')) {
				var callId = $thisPanel.attr("callId");
				var sn = $thisPanel.attr("callSn");
				var sh = $thisPanel.attr("timeIntervalSn");
				if (sh) clearInterval(sh);
				window.top.m_IdtApi.CallRel(callId, sn, 0);
				$thisPanel.remove();
				window.top.activeCallInfo = false;
			} else if ($thisObj.hasClass('viewVideo')) {
				var callNum = $thisPanel.attr("callNum");
				var callName = $thisPanel.attr("callName");
				fn_videoView(callNum,callName);
			} else if ($thisObj.hasClass('keyDial')) {
				var callId = $thisPanel.attr("callId");
				fn_openKeyDialDlg(function(otherNum) {
					window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_NUM, otherNum, null);
				});
			}
		});
		fn_setTimeCount(sn);
	},
	function(callId) {
		fn_stopRingVoice(callId);
		window.top.m_IdtApi.CallRel(callId, 0, 0);
	});
}

// 基本两方视频通信呼出。
function fn_videoCall(callNum,callName) {
	if (callNum == window.top.userInfo.userInfo.num) {
		prompt('error', lang.dispatch.communicateyourself, 1000);
		return;
	}
	if (window.top.activeCallInfo == true) {
		prompt('warn', lang.dispatch.currentlyNewVideo, 1000);
		return;
	}
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建视频通讯面板。
	var htmlStr = '<div class="video-talk" id="sureChat_commDlg_' + sn + '">' +
		'<div class="header icon">&#xe64c; '+lang.dispatch.videoCall+' · <span>【' + callNum + '】' + callName + '</span>' +
		'</div>' +
		'<div class="large-window">' +
			fn_genVideo('id_video_peer_' + sn,'100%','100%',false) +
//			'<video style="width:100%;height:100%;" id="id_video_peer_' + sn + '" autoplay></video>' +
		'</div>' +
		'<div class="zoom">' +
		'    <div class="icon switch-window">&#xe665;</div>' +
		'    <div class="icon all-window"  title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>' +
		'    <div class="icon less-window" title="'+lang.dispatch.narrow+'">&#xe698;</div>' +
		'</div>' +
		'<div class="small-window">' +
			fn_genVideo('id_video_my_' + sn,'100%','100%',true) +
//		'	 <video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
		'</div>' +
		'<div class="close">' +
		'    <div class="time">'+lang.dispatch.inDialong+'</div>' +
		'    <div class="icon" title="'+lang.dispatch.hangUp+'" onclick="videoCloseFn(this)">&#xe659;</div>' +
		'</div></div>';
	$(document.body).append(htmlStr);

	// 语音与视频通话窗口展示相关代码。
	$('.video-talk .zoom').off('click').on('click', 'div', function (event) {
		if ($(this).hasClass('all-window')) { // 全屏按钮点击事件。
			var lateTop = $('.video-talk').css('top');
        	$('.video-talk').attr('topVal', lateTop);
            $('.video-talk .zoom .all-window').css('display', 'none');
            $('.video-talk .zoom .less-window').css('display', 'block');
            $('.video-talk').css({
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                bottom: 0,
                transform: 'translate(0,0)'
            });
		} else if ($(this).hasClass('less-window')) { // 还原按钮点击事件。
			var preTop = $('.video-talk').attr('topVal');
            $('.video-talk .zoom .less-window').css('display', 'none');
            $('.video-talk .zoom .all-window').css('display', 'block');
            $('.video-talk').css({
                width: '420px',
                height: '220px',
                left: '50%',
                bottom: 20,
                top: preTop,
                transform: 'translate(-50%, 0)'
            });
		} else if ($(this).hasClass('switch-window')) { // 切换按钮点击事件。
			var $smallVideo = $('.video-talk .small-window');
			var $largeVideo = $('.video-talk .large-window');
			$smallVideo.removeClass('small-window').addClass('large-window');
			$largeVideo.removeClass('large-window').addClass('small-window');
		}
    });
    $('.video-talk').off('mousedown').on('mousedown',function (event) {
    	var allWindowed = $('.video-talk .zoom .all-window').css('display');
        if (allWindowed && allWindowed == 'block') {
            var isMove = true;
            var abs_x = event.pageX - $('.video-talk').offset().left;
            var abs_y = event.pageY - $('.video-talk').offset().top;
            $(document).off('mousemove').on('mousemove',function (event) {
                if (isMove) {
                    $('.video-talk').css({
                        'left': event.pageX - abs_x,
                        'top': event.pageY - abs_y ,
                        'transform': 'translate(0, 0)'
                    });
                }
            }).off('mouseup').on('mouseup',function () {
                isMove = false;
            });
        }
    });

	var myVideo = $('#id_video_my_' + sn)[0];
	var peerVideo = $('#id_video_peer_' + sn)[0];
	var callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 1, 1, callNum, IDT.SRV_TYPE_BASIC_CALL, "", 1, 0);
	window.top.activeCallInfo = true;
	$('#sureChat_commDlg_' + sn).attr("callId", callId);
	$('#sureChat_commDlg_' + sn).attr("callSn", sn);
	window.videoCloseFn = function(obj) {
		var callId = $(obj).parent().parent().attr("callId");
		var sn = $(obj).parent().parent().attr("callSn");
		var sh = $(obj).parent().parent().attr("timeIntervalSn");
		if (sh) clearInterval(sh);
		window.top.m_IdtApi.CallRel(callId, sn, 0);
		$(obj).parent().parent().remove();
		window.top.activeCallInfo = false;
	}
}

// 基本两方视频通信呼进。
function fn_videoCallIn(param) {
	fn_insPerNotAnswerLog("video",param);
	fn_noticeCallIn('video',param,function(callId,callNum,callName) {
		fn_delPerNotAnswerLog("video");
		fn_stopRingVoice(callId);
		if (window.top.activeCallInfo == true) {
			prompt('warn', lang.dispatch.currentlyNotNewVideo, 1000);
			return;
		}
		// 创建通讯序号。
		var sn = fn_genSn();
		// 创建视频通讯面板。
		var htmlStr = '<div class="video-talk" id="sureChat_commDlg_' + sn + '">' +
			'<div class="header icon">&#xe64c; '+lang.dispatch.videoCall+' · <span>【' + callNum + '】' + callName + '</span>' +
			'</div>' +
			'<div class="large-window">' +
				fn_genVideo('id_video_peer_' + sn,'100%','100%',false) +
//				'<video style="width:100%;height:100%;" id="id_video_peer_' + sn + '" autoplay></video>' +
			'</div>' +
			'<div class="zoom">' +
			'    <div class="icon switch-window">&#xe665;</div>' +
			'    <div class="icon all-window"  title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>' +
			'    <div class="icon less-window" title="'+lang.dispatch.narrow+'">&#xe698;</div>' +
			'</div>' +
			'<div class="small-window">' +
				fn_genVideo('id_video_my_' + sn,'100%','100%',true) +
//			'	 <video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
			'</div>' +
			'<div class="close">' +
			'    <div class="time">'+lang.dispatch.inDialong+'</div>' +
			'    <div class="icon" title="'+lang.dispatch.hangUp+'" onclick="videoCloseFn(this)">&#xe659;</div>' +
			'</div></div>';
		$(document.body).append(htmlStr);

		// 语音与视频通话窗口展示相关代码。
		$('.video-talk .zoom').off('click').on('click', 'div', function (event) {
			if ($(this).hasClass('all-window')) { // 全屏按钮点击事件。
				var lateTop = $('.video-talk').css('top');
	        	$('.video-talk').attr('topVal', lateTop);
	            $('.video-talk .zoom .all-window').css('display', 'none');
	            $('.video-talk .zoom .less-window').css('display', 'block');
	            $('.video-talk').css({
	                width: '100%',
	                height: '100%',
	                left: 0,
	                top: 0,
	                bottom: 0,
	                transform: 'translate(0,0)'
	            });
			} else if ($(this).hasClass('less-window')) { // 还原按钮点击事件。
				var preTop = $('.video-talk').attr('topVal');
	            $('.video-talk .zoom .less-window').css('display', 'none');
	            $('.video-talk .zoom .all-window').css('display', 'block');
	            $('.video-talk').css({
	                width: '420px',
	                height: '220px',
	                left: '50%',
	                bottom: 20,
	                top: preTop,
	                transform: 'translate(-50%, 0)'
	            });
			} else if ($(this).hasClass('switch-window')) { // 切换按钮点击事件。
				var $smallVideo = $('.video-talk .small-window');
				var $largeVideo = $('.video-talk .large-window');
				$smallVideo.removeClass('small-window').addClass('large-window');
				$largeVideo.removeClass('large-window').addClass('small-window');
			}
	    });
	    $('.video-talk').off('mousedown').on('mousedown',function (event) {
	    	var allWindowed = $('.video-talk .zoom .all-window').css('display');
	    	if (allWindowed && allWindowed == 'block') {
	            var isMove = true;
	            var abs_x = event.pageX - $('.video-talk').offset().left;
	            var abs_y = event.pageY - $('.video-talk').offset().top;
	            $(document).off('mousemove').on('mousemove',function (event) {
	                if (isMove) {
	                	$('.video-talk').attr('topVal', event.pageY - abs_y);
	                    $('.video-talk').css({
	                        'left': event.pageX - abs_x,
	                        'top': event.pageY - abs_y,
	                        'transform': 'translate(0, 0)'
	                    });
	                }
	            }).off('mouseup').on('mouseup',function () {
	                isMove = false;
	            });
	        }
	    });
		var myVideo = $('#id_video_my_' + sn)[0];
		var peerVideo = $('#id_video_peer_' + sn)[0];
		window.top.m_IdtApi.CallAnswer(callId, sn, myVideo, peerVideo, 1, 1, 1, 1);
		$('#sureChat_commDlg_' + sn).attr("callId", callId);
		$('#sureChat_commDlg_' + sn).attr("callSn", sn);
		window.top.activeCallInfo = true;
		window.videoCloseFn = function(obj) {
			var callId = $(obj).parent().parent().attr("callId");
			var sn = $(obj).parent().parent().attr("callSn");
			var sh = $(obj).parent().parent().attr("timeIntervalSn");
			if (sh) clearInterval(sh);
			fn_stopRingVoice(callId);
			window.top.m_IdtApi.CallRel(callId, sn, 0);
			$(obj).parent().parent().remove();
			window.top.activeCallInfo = false;
		}
		fn_setTimeCount(sn);
	},
	function(callId){
		fn_stopRingVoice(callId);
		window.top.m_IdtApi.CallRel(callId, 0, 0);
	});
}

//一键报警呼进。
function fn_oneTouchAlarmIn(param) {
	var callId 		= param[1];
    var callNum 	= param[2];
    var callName 	= param[3];
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建视频通讯面板。
	var htmlStr = '<div class="video-talk oneTouchAlarm" id="sureChat_commDlg_' + sn + '">' +
		'<div class="header icon">&#xe64c; '+lang.dispatch.videoCall+' · <span>【' + callNum + '】' + callName + '</span>' +
		'</div>' +
		'<div class="large-window">' +
			fn_genVideo('id_video_peer_' + sn,'100%','100%',false) +
//				'<video style="width:100%;height:100%;" id="id_video_peer_' + sn + '" autoplay></video>' +
		'</div>' +
		'<div class="zoom">' +
		'    <div class="icon all-window"  title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>' +
		'    <div class="icon less-window" title="'+lang.dispatch.narrow+'">&#xe698;</div>' +
		'</div>' +
		'<div class="small-window" style="display:none;">' +
			fn_genVideo('id_video_my_' + sn,'100%','100%',true) +
//			'	 <video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
		'</div>' +
		'<div class="close">' +
		'    <div class="time">'+lang.dispatch.inDialong+'</div>' +
		'    <div class="icon" title="'+lang.dispatch.hangUp+'">&#xe659;</div>' +
		'</div></div>';
	$(document.body).append(htmlStr);

	var $mainDiv = $('#sureChat_commDlg_' + sn);
	// 语音与视频通话窗口展示相关代码。
	$mainDiv.find('.zoom').off('click').on('click', 'div', function (event) {
		if ($(this).hasClass('all-window')) { // 全屏按钮点击事件。
			var lateTop = $mainDiv.css('top');
			$mainDiv.attr('topVal', lateTop);
			$mainDiv.find('.zoom .all-window').css('display', 'none');
			$mainDiv.find('.zoom .less-window').css('display', 'block');
            $mainDiv.css({
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                bottom: 0,
                transform: 'translate(0,0)'
            });
		} else if ($(this).hasClass('less-window')) { // 还原按钮点击事件。
			var preTop = $mainDiv.attr('topVal');
			$mainDiv.find('.zoom .less-window').css('display', 'none');
			$mainDiv.find('.zoom .all-window').css('display', 'block');
            $mainDiv.css({
                width: '420px',
                height: '220px',
                left: '50%',
                bottom: 20,
                top: preTop,
                transform: 'translate(-50%, 0)'
            });
		}
    });
	$mainDiv.off('mousedown').on('mousedown',function (event) {
    	var allWindowed = $mainDiv.find('.zoom .all-window').css('display');
    	if (allWindowed && allWindowed == 'block') {
            var isMove = true;
            var abs_x = event.pageX - $mainDiv.offset().left;
            var abs_y = event.pageY - $mainDiv.offset().top;
            $(document).off('mousemove').on('mousemove',function (event) {
                if (isMove) {
                	$mainDiv.attr('topVal', event.pageY - abs_y);
                	$mainDiv.css({
                        'left': event.pageX - abs_x,
                        'top': event.pageY - abs_y,
                        'transform': 'translate(0, 0)'
                    });
                }
            }).off('mouseup').on('mouseup',function () {
                isMove = false;
            });
        }
    });
	var myVideo = $('#id_video_my_' + sn)[0];
	var peerVideo = $('#id_video_peer_' + sn)[0];
	window.top.m_IdtApi.CallAnswer(callId, sn, myVideo, peerVideo, 1, 1, 1, 0);
	$mainDiv.attr("callId", callId);
	$mainDiv.attr("callSn", sn);
	$mainDiv.find('.close .icon').off('click').on('click', function(e) {
		var callId = $mainDiv.attr("callId");
		var sn = $mainDiv.attr("callSn");
		var sh = $mainDiv.attr("timeIntervalSn");
		if (sh) clearInterval(sh);
		fn_stopRingVoice(callId);
		window.top.m_IdtApi.CallRel(callId, sn, 0);
		$mainDiv.remove();
	});
	fn_setTimeCount(sn);
}

// 通讯计时方法。
function fn_setTimeCount(sn) {
	var timeIntervalSn = setInterval(timeIntevar, 1000, sn);
	$('#sureChat_commDlg_' + sn).attr("timeIntervalSn", timeIntervalSn);
	function timeIntevar(sn) {
		var curTimeStr = $('#sureChat_commDlg_' + sn).find(".time").text();
		var timeArr = curTimeStr.split(":");
		if (timeArr.length && timeArr.length == 3) {
			var hour   = Number(timeArr[0]);
			var minute = Number(timeArr[1]);
			var second = Number(timeArr[2]);
			var timeNum = hour * 3600 + minute * 60 + second + 1;
			hour   = Math.floor(timeNum / 3600);
			minute = Math.floor((timeNum % 3600) / 60);
			second = timeNum % 60;
			var timeStr = '';
			if (hour < 10) {
				timeStr = '0' + hour + ':';
			} else {
				timeStr = hour + ':';
			}
			if (minute < 10) {
				timeStr = timeStr + '0' + minute + ':';
			} else {
				timeStr = timeStr + minute + ':';
			}
			if (second < 10) {
				timeStr = timeStr + '0' + second;
			} else {
				timeStr = timeStr + second;
			}
			$('#sureChat_commDlg_' + sn).find(".time").text(timeStr);
		} else {
			$('#sureChat_commDlg_' + sn).find(".time").text('00:00:00');
		}
	}
}

// 提醒有呼叫进入的通用函数。
function fn_noticeCallIn(callType, callParam, acceptFn, refuseFn) {
	if ($('#popWrap').length == 0) {
		$(document.body).append('<div id="popWrap"></div>');
		var messageWrap =
			'    <div class="workOrderWrap">\n' +
			'        <div class="fix icon voiceCall icon-rili">\n' +
			// '            <div class="count"></div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="cameraWrap">\n' +
			'        <div class="fix icon deviceList icon-jiankong">\n' +
			// '            <div class="count"></div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="vehicleWrap">\n' +
            '        <div class="fix icon deviceList icon-qiche">\n' +
			// '            <div class="count"></div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="caseMessageWrap">\n' +
			'        <div class="fix icon case">&#xe6eb;\n' +
			'            <div class="count">0</div>\n' +
			'        </div>\n' +
			'    </div>\n'+
			'    <div class="voiceWrap">\n' +
			'        <div class="fix icon voiceCall">&#xe628;\n' +
			'            <div class="count">0</div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="videoWrap">\n' +
			'        <div class="fix icon video">&#xe64c;\n' +
			'            <div class="count">0</div>\n' +
			'        </div>\n' +
			'    </div>\n' +
			'    <div class="messageWrap">\n' +
			'        <div class="fix icon">&#xe7a8;\n' +
			'            <div class="count">0</div>\n' +
			'        </div>\n' +
			'    </div>\n'+
			'    <div class="noticeWrap">\n' +
			'        <div class="fix icon notice">&#xe6c9;\n' +
			'            <div class="count">0</div>\n' +
			'        </div>\n' +
			'    </div>';
		$('#popWrap').append(messageWrap)
	}
	messagePop(callType, callParam, acceptFn, refuseFn);
	function messagePop(type, callParam, acceptFn, refuseFn) {
		var name = lang.dispatch.IMcoming;
		$("#popWrap").css("display","block");
		var caseMessageCount= Number($("#popWrap .caseMessageWrap .fix .count").html());
		var messageCount= Number($("#popWrap .messageWrap .fix .count").html());
		var voiceCount 	= Number($("#popWrap .voiceWrap   .fix .count").html());
		var videoCount 	= Number($("#popWrap .videoWrap   .fix .count").html());
        var icon,count;
        var typeIcon = null;
        var operate = lang.dispatch.Answer;
        var refuse = '<div class="button refuse">'+lang.dispatch.refuse+'</div>';
        var wrap = $('.messageWrap');
        var imContent = '';
        if (!callParam[3]) callParam[3] = callParam[2];
        if (type === 'video') {
            icon = '&#xe64c;';
            typeIcon = 'video';
            wrap = $('.videoWrap');
            videoCount +=1;
            count = videoCount;
            name = "【"+callParam[2]+"】"+callParam[3];
        } else if (type === 'voice') {
            icon = '&#xe628;';
            typeIcon = 'voiceCall';
            wrap = $('.voiceWrap');
            voiceCount += 1;
            count = voiceCount;
            name = "【"+callParam[2]+"】"+callParam[3];
        } else if (type === 'caseMessage') {
			icon = '&#xe6eb;';
			operate = lang.common.Toview;
			refuse = '';
			caseMessageCount += 1;
			count = messageCount;
			wrap = $('.caseMessageWrap');
			name = callParam[2];
			var txtContent = callParam[5];
			var dwType = callParam[1];
			if (dwType == '1') { // 1文本、2位置信息、3图片、4录音、5录像、6文件、17会议链接、18组呼录音上传。
				txtContent = callParam[5];
			} else if (dwType == '2') {
				txtContent = lang.dispatch.positionInfo;
			} else if (dwType == '3') {
				txtContent = lang.common.picture;
			} else if (dwType == '4') {
				txtContent = lang.common.soundRecording;
			} else if (dwType == '5') {
				txtContent = lang.common.videotape;
			} else if (dwType == '6') {
				txtContent = lang.dispatch.File;
			} else if (dwType == '17') {
				txtContent = lang.dispatch.conferenceLink;
			} else if (dwType == '18') {
				txtContent = lang.dispatch.groupRecordUpload;
			}
			txtContent = lang.dispatch.newPoliceSituation;
			imContent = '<div style="font-size: 12px" title="'+txtContent+'">' + txtContent + '</div>\n';
			// 及时消息框提示
			readMSG(callType, callParam, acceptFn, refuseFn);
        } else {
            icon = '&#xe7a8;';
            operate = lang.dispatch.Reply;
            refuse = '';
            messageCount += 1;
            count = messageCount;
            wrap = $('.messageWrap');
            name = callParam[2];
            var txtContent = callParam[5];
            var dwType = callParam[1];
    		if (dwType == '1') { // 1文本、2位置信息、3图片、4录音、5录像、6文件、17会议链接、18组呼录音上传。
    			txtContent = callParam[5];
    		} else if (dwType == '2') {
    			txtContent = lang.dispatch.positionInfo;
    		} else if (dwType == '3') {
    			txtContent = lang.common.picture;
    		} else if (dwType == '4') {
    			txtContent = lang.common.soundRecording;
    		} else if (dwType == '5') {
    			txtContent = lang.common.videotape;
    		} else if (dwType == '6') {
    			txtContent = lang.dispatch.File;
    		} else if (dwType == '17') {
    			txtContent = lang.dispatch.conferenceLink;
    		} else if (dwType == '18') {
    			txtContent = lang.dispatch.groupRecordUpload;
    		}
            imContent = '<div style="font-size: 12px" title="'+txtContent+'">' + txtContent + '</div>\n';
            // 及时消息框提示
            readMSG(callType, callParam, acceptFn, refuseFn);
        }
        var content = '<div class="message">\n' +
            '        <table>\n' +
            '            <tr>\n' +
            '                <td>' +
            '                   <div class="icon ' + typeIcon + '">' + icon + '' +
// ' <div class="count">' + count + '</div>' +
            '                   </div>' +
            '                </td>\n' +
            '                <td>\n' +
            '                    <div style="font-size: 12px">' + name + '</div>\n' + imContent +
            '                </td>\n' +
            '                <td>\n' +
            '                    ' + refuse + '\n' +
            '                </td>\n' +
            '                <td>\n' +
            '                    <div class="button">' + operate + '</div>\n' +
            '                </td>\n' +
            '                <td>\n' +
            '                    <div class="close">×</div>\n' +
            '                </td>\n' +
            '            </tr>\n' +
            '        </table>\n' +
            '    </div>\n';
        wrap.find('.fix').removeClass('active');
        wrap.find('.fix').css('display','none');
        wrap.find('.message').remove();
        wrap.append(content);
        if (type === 'video' || type === 'voice') {
        	 wrap.find('.message').attr("callId", callParam[1]);
        	 wrap.find('.message').attr("callNum", callParam[2]);
        	 wrap.find('.message').attr("callName", callParam[3]);
        }
        bindClose(type, wrap, acceptFn, refuseFn);
        bindHover(type, wrap);
        // 如果是即时消息，且当前选中的用户或小组正是当前接收到的消息所属，则不用弹出信息展示条。
        if (wrap.hasClass('messageWrap') && isCurNumIM(callParam)) {
        	return;
        } else {
        	fn_ringOnceAutoStop('IMIn.mp3');
        }
        $('.message').animate({width: '333px', opacity: 0.85}, function () {
            if (type === "message") {
            	fn_freshNotAnswerCount();
            	$('#popWrap .messageWrap').find('.fix').css('display','none');
                setTimeout(function () {
                    if (!$('#popWrap .messageWrap .message').hasClass('active')) {
                        $('#popWrap .messageWrap .message').animate({
                            width: 43
                        }, function () {
                            $('#popWrap .messageWrap .message').remove();
                            $('#popWrap .messageWrap').find('.fix').addClass('active');
                            var count = Number($('#popWrap .messageWrap').find('.count').html());
                            if (count <= 0) {
                            	$('#popWrap .messageWrap').find('.fix').css('display','none');
                            } else {
                            	 $('#popWrap .messageWrap').find('.fix').css('display','block');
                            }
                        });
                    }
                }, 15000);
            } else {
                return;
            }
        });
    }
	function bindClose(type, wrap, acceptFn, refuseFn) {
		if (wrap.hasClass('messageWrap')) return;
        wrap.find('.message .close').off('click').on('click', function () {
        	var panelObj = $(this).parent().parent().parent().parent().parent();
        	var callId = panelObj.attr("callId");
        	var callNum = panelObj.attr("callNum");
        	var callName = panelObj.attr("callName");
        	if (refuseFn && (callId || callId == 0)) refuseFn(callId);
        	panelObj.fadeOut(100,function () {
                $(this).remove();
                fn_freshNotAnswerCount();
            });
        });
        wrap.find('.message .button').off('click').on('click', function () {
        	var panelObj = $(this).parent().parent().parent().parent().parent();
        	var callId = panelObj.attr("callId");
        	var callNum = panelObj.attr("callNum");
        	var callName = panelObj.attr("callName");
        	if ($(this).hasClass('refuse') == true) {
        		if (refuseFn) refuseFn(callId);
        	} else {
        		if (acceptFn) acceptFn(callId, callNum, callName);
        	}
        	panelObj.fadeOut(100,function () {
            	$(this).remove();
            	fn_freshNotAnswerCount();
            });
        });
    }
    function bindHover(type, wrap) {
        wrap.find('.message').hover(function () {
            $(this).addClass('active');
        }, function () {
            if(type === 'message'){
                var _this = $(this);
                setTimeout(function () {
                    _this.removeClass('active');
                    _this.fadeOut(200,function () {
                        _this.remove();
                        wrap.find('.fix').addClass('active');
                        var count = Number($('#popWrap .messageWrap').find('.count').html());
                        if(count <= 0) {
                        	$('#popWrap .messageWrap').find('.fix').css('display','none');
                        } else {
                        	$('#popWrap .messageWrap').find('.fix').css('display','block');
                        }
                    })
                }, 15000);
            }
        });
    }
    // 及时消息框提示
    function readMSG(callType, callParam, acceptFn, refuseFn){
    	if($('#chatDiv').hasClass("active")){
    		if($("#chatLatestSign").hasClass("active")){
    			var num = window.latestClickNum;
				console.log(num);
				ifNumAvtice(num,callParam);
    		}
    		if($("#chatPersonSign").hasClass("active")){
    			var num = window.personClickNum;
				console.log(num);
				ifNumAvtice(num,callParam);
    		}
    		if($("#chatGroupSign").hasClass("active")){
    			var num = window.groupClickNum;
				console.log(num);
				ifNumAvtice(num,callParam);
    		}
    	}else{
			$("#popWrap .messageWrap").off('click').on('click',function(e){// 点击信息提示条
				if ($(e.target).hasClass('close')) {
					$(e.target).parent().parent().parent().parent().parent().remove();
	                fn_freshNotAnswerCount();
				} else if ($(e.target).hasClass('button')) {
					window.readMsg(callParam);
				} else {
					return;
				}
    		});
    	}
    }
    function ifNumAvtice(num,callParam){
		if(callParam[3].substring(0,1)=="#"){// 带#号操作的是小组
			if(num == callParam[4]){// 符合条件的操作
				loadMsg(callParam);
				fn_delPerNotAnswerIM(num);
			}else{
				$("#popWrap .messageWrap").off('click').on('click',function(e){// 点击信息提示条
					if ($(e.target).hasClass('close')) {
						$(e.target).parent().parent().parent().parent().parent().remove();
		                fn_freshNotAnswerCount();
					} else if ($(e.target).hasClass('button')) {
						window.changePeopleChar(callParam);
					} else {
						return;
					}
	    		});
			}
		}else{
			if(num == callParam[2]){// 符合条件的操作
				loadMsg(callParam);
				fn_delPerNotAnswerIM(num);
			}else{
				$("#popWrap .messageWrap").off('click').on('click',function(e){// 点击信息提示条
					if ($(e.target).hasClass('close')) {
						$(e.target).parent().parent().parent().parent().parent().remove();
		                fn_freshNotAnswerCount();
					} else if ($(e.target).hasClass('button')) {
						window.changePeopleChar(callParam);
					} else {
						return;
					}
	    		});
			}
		}
    }
    function isCurNumIM(callParam) {
    	if ($('#chatDiv').hasClass("active")) {
    		var num = '';
    		if ($("#chatLatestSign").hasClass("active")) {
    			num = window.latestClickNum;
    		}
    		if ($("#chatPersonSign").hasClass("active")) {
    			num = window.personClickNum;
    		}
    		if ($("#chatGroupSign").hasClass("active")) {
    			num = window.groupClickNum;
    		}
    		if (callParam[3].substring(0,1)=="#") {// 带#号操作的是小组
    			if (num == callParam[4]) {// 符合条件的操作
    				return true;
    			} else {
    				return false;
    			}
    		}else{
    			if (num == callParam[2]) {// 符合条件的操作
    				return true;
    			} else {
    				return false;
    			}
    		}
    	} else {
    		return false;
    	}
    }
    function loadMsg(callParam){
    	if(callParam[1]=="1"){// 文本类型
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix group-div'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/"+callParam[2]
				+".png?t=" + Math.random()+"' alt=''/></div><div class='float-left text oppositeColor'>"+callParam[5]+"<div class='corner oppositeColor'></div></div></div>");
		}
    	if(callParam[1]=="17"){// 会议链接
    		var confPm = {
				meetId : callParam[5].subPara.meetId,
    			meetName: callParam[5].subPara.meetName,
    			meetTitle: callParam[5].subPara.meetTitle
    		};
    		var confPmStr = JSON.stringify(confPm);
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix group-div videoConf' confPm='" + confPmStr + "'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/"+callParam[2]
				+".png?t=" + Math.random()+"' alt=''/></div><div class='float-left text oppositeColor'><div class='icon'><span>"+lang.dispatch.joinMeet+"</span>&nbsp;&nbsp;&#xe64e;</div><div class='corner oppositeColor'></div></div></div>");
		}
		if(callParam[1]=="6"){// 文件类型
			var icon = "";
			if (window.checkPhotoType(callParam[6]) == true) {
				icon = "&#xe65a;";
			} else {
				icon = "&#xe620;";
			}
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix file group-div'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/"+callParam[2]
			+".png?t=" + Math.random()+"' alt=''/></div><div class='float-left text oppositeColor disdownfile' fileName='/IM/"+callParam[2]
			+"/"+callParam[6]+"' name='"+ callParam[7] + "'><div class='filename float-right'>" + callParam[7] +
			"</div><div class='float-left icon'>"+icon+"</div><div class='corner selfColor'></div></div></div>");
		}
		if(callParam[1]=="3"){// 图片类型
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix group-div'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/"+callParam[2]
			+".png?t=" + Math.random()+"' alt=''/></div><div class='float-left text oppositeColor'><div><img src='/upload/IM/"+callParam[2]
			+"/"+callParam[6]+"?t=" + Math.random()+"' class='imgClick'/ ></div><div class='corner oppositeColor'></div></div></div>");
		}
		if(callParam[1]=="4"){// 语音文件
			var time = window.computeTime(callParam[5],"O");
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix voice group-div'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/" + callParam[2] + ".png?t="
			+ Math.random() + "' alt=''/></div><div class='float-left text oppositeColor'><div class='float-left'><img src='static/img/voiceStatic.png' fileName='/IM/"+callParam[2]
			+"/"+callParam[6]+"' class='voicePlay' alt=''></div><div class='float-right'>"+time+"</div><div class='corner oppositeColor'></div></div></div>");
		}
		if (callParam[1]=="2") {// GPS定位
			var mapMsgs = callParam[5].split(",");
			var lat = mapMsgs[0];
			var lng = mapMsgs[1];
			var mapname = mapMsgs[2];
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix map'><div style='margin-left: 10px'"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'><img src='/upload/headicon/" +  callParam[2] + ".png?t="
			+ Math.random() + "' alt=''/></div><div class='float-left text oppositeColor mapShow'><img src='/upload/IM/"+callParam[2]+"/"+callParam[6]+"?t="
					+ Math.random() + "' alt='' lat='"+lat+"' lng='"+lng+"' mapname='"+mapname+"' /><div class='site-text'>"+mapname
			+"</div><div class='corner oppositeColor'></div></div></div>");
		}
		if(callParam[1]=="5"){// 视频类型
			var time = window.computeTime(callParam[5],"O");
			$("#chatDiv .chat .chatBody").append("<div class='opposite clearfix group-div'><div style='margin-left: 10px'>"+callParam[9]+"【"+callParam[2]+"】</div><div class='float-left imgWrap'>" +
			"<img src='/upload/headicon/" +callParam[2] + ".png?t="+ Math.random() + "' alt=''/>" +
			"</div><div class='float-left video-wrap text oppositeColor'><div class='video'>" +
			"<video style='max-width: 200px' src='/upload/IM/"+callParam[2]+"/"+callParam[6]+"'></video>" +
			"<div class='start-icon videoPlay'>&#xe6c1;</div>" +
			"<div class='time'>"+ time +"</div></div><div class='corner oppositeColor'></div></div></div>");
		}
// if(callParam[1]=="17"){//会议链接}
		$("#chatDiv .chat .chatBody").scrollTop($("#chatDiv .chat .chatBody")[0].scrollHeight-303);
		window.clickVoice();
		window.clickVideo();
		window.clickMapShow();
		window.disDownFile();
		window.imgView();
		window.top.joinVideoMeeting();
    }
}

// 组呼应签。
function fn_gCallAnswer(callId, groupId, groupName) {
	if (window.top.activeCallInfo == true) {
		prompt('warn', lang.dispatch.currentlyAnswerGroupCall, 1000);
		return;
	}
	// 创建通讯序号。
	var sn = 'gcall_' + fn_genSn();
	var htmlStr = '<div id="' + sn + '">'+
					fn_genVideo('id_video_peer_gcall',0,0,false) +
					fn_genVideo('id_video_my_gcall',0,0,true) +
//					'<video style="width:0;height:0;" id="id_video_peer_gcall" autoplay></video>' +
//					'<video style="width:0;height:0;" id="id_video_my_gcall" autoplay muted></video>' +
				  '</div>';
	$(document.body).append(htmlStr);
	var myVideo = $('#id_video_my_gcall')[0];
	var peerVideo = $('#id_video_peer_gcall')[0];
	window.m_IdtApi.CallAnswer(callId, sn, myVideo, peerVideo, 1, 1, 0, 0);
	window.top.activeCallInfo = true;
	window.m_IdtApi.gcallInfo = {
		callType : 'groupCall',
		gCallId : callId,
		groupId : groupId,
		groupName : groupName,
		usrCtx : sn
	};
}

// 抢夺话权或发起组呼。
function fn_makeGCallORMicCtrl(gNum,gName) {
	if (window.m_IdtApi.gcallInfo) { // 抢话权。
		fn_micwant();
	} else { // 发起组呼。
		if (window.top.activeCallInfo == true) {
			prompt('warn', lang.dispatch.currentlyCarryGroupCall, 1000);
			return;
		}
		var curGroupId 	= $('#hiddenCurGroupId').val();
		var curGroupName= $(".titleDiv .title").html();
		if (gNum && gNum != '' && gName && gName != '') {
			curGroupId = gNum;
			curGroupName = gName;
		}
		if (!curGroupId || curGroupId == '' || curGroupId == '-1'
			|| curGroupId == window.userInfo.userInfo.org_num) {
			prompt('error', "【" + curGroupName + "】"+lang.dispatch.noGroupCallLaunched, 1000);
			return;
		}
		// 创建通讯序号。
		var sn = 'gcall_' + fn_genSn();
		var htmlStr = '<div id="' + sn + '">'+
						fn_genVideo('id_video_peer_gcall',0,0,false) +
						fn_genVideo('id_video_my_gcall',0,0,true) +
//						'<video style="width:0;height:0;" id="id_video_peer_gcall" autoplay></video>' +
//						'<video style="width:0;height:0;" id="id_video_my_gcall" autoplay muted></video>'+
						'</div>';
		$(document.body).append(htmlStr);
		var myVideo = $('#id_video_my_gcall')[0];
		var peerVideo = $('#id_video_peer_gcall')[0];
		var m_CallId = window.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 0, 1, 0, 0, curGroupId, IDT.SRV_TYPE_CONF, "", 1, 0);
		if (m_CallId == -1) {
			$('#' + sn).remove();
			prompt('error',lang.dispatch.initiatingGroupFailed,2000);
			return;
		}
		window.top.activeCallInfo = true;
		window.m_IdtApi.gcallInfo = {
			callType : 'groupCall',
			gCallId : m_CallId,
			groupId : curGroupId,
			groupName : curGroupName,
			usrCtx : sn
		};
	}
}

// 组呼话权申请。
function fn_micwant() {
	if (!window.m_IdtApi.gcallInfo) return;
	window.m_IdtApi.CallMicCtrl(window.m_IdtApi.gcallInfo.gCallId, true);
}

// 组呼话权释放。
function fn_micrel() {
	if (!window.m_IdtApi.gcallInfo) return;
	window.m_IdtApi.CallMicCtrl(window.m_IdtApi.gcallInfo.gCallId, false);
}

// 创建并显示组呼说话对话框。
function fn_startGCallVoice(userNum, userName) {
	if (!window.m_IdtApi.gcallInfo) return;
	var groupNum = window.m_IdtApi.gcallInfo.groupId;
	var groupName = window.m_IdtApi.gcallInfo.groupName;
	var people = "【" + userNum + "】" + userName;
	var group = "【" + groupNum + "】" + groupName;
    var content = '<div class="group-calling-people">\n' +
        '    <div class="img-wrap float-left">\n' +
        '        <img src="/upload/headicon/'+ userNum +'.png" alt=""/>\n' +
        '    </div>\n' +
        '    <div class="float-left">\n' +
        '        <div class="people">' + people + '</div>\n' +
        '        <div class="group">' + group + '</div>\n' +
        '    </div>\n' +
        '</div>';
    $(document.body).append(content);
    $('.group-calling-people').fadeIn();
}

// 停止组呼说话对话框。
function fn_stopGCallVoice() {
    $('.group-calling-people').fadeOut(function () {
        $('.group-calling-people').remove();
    })
}

// 添加视频监控对话框。
function fn_addVideoMonitor(sn, viewNum, viewName, videoUrl, isVoice) {
	window.videoMonitor = window.videoMonitor || {
		startIndex: 0,
        endIndex: 0,
        curVideoNum: null,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
        preWidth: $('.video-task').innerWidth(),
        preHeight: $('.video-task').innerHeight(),
        liArr: [],
        // top,right,width,height
        posArr: [[[0,0,1,1]],[[0,0,0.5,1],[0,0.5,0.5,1]],[[0,0,0.5,0.5],[0,0.5,0.5,0.5],[0.5,0,0.5,0.5],[0.5,0.5,0.5,0.5]],// 1,2,4
        		[[0,0,0.75,0.75],[0,0.75,0.25,0.25],[0.25,0.75,0.25,0.25],[0.50,0.75,0.25,0.25],
        		[0.75,0,0.25,0.25],[0.75,0.25,0.25,0.25],[0.75,0.5,0.25,0.25],[0.75,0.75,0.25,0.25]],// 8
        		[[0,0.25,0.5,0.6666],[0,0,0.25,0.3333],[0.3333,0,0.25,0.3333],[0,0.75,0.25,0.3333],[0.3333,0.75,0.25,0.3333],
        		[0.6666,0,0.25,0.3333],[0.6666,0.25,0.25,0.3333],[0.6666,0.5,0.25,0.3333],[0.6666,0.75,0.25,0.3333]],// 9
        		[[0,0.25,0.5,0.5],[0,0,0.25,0.25],[0.25,0,0.25,0.25],[0,0.75,0.25,0.25],[0.25,0.75,0.25,0.25],
        		[0.5,0,0.25,0.25],[0.5,0.25,0.25,0.25],[0.5,0.5,0.25,0.25],[0.5,0.75,0.25,0.25],
        		[0.75,0,0.25,0.25],[0.75,0.25,0.25,0.25],[0.75,0.5,0.25,0.25],[0.75,0.75,0.25,0.25]]],// 13
        init: function () {
            this.minimum();               // 缩小
            this.videoTaskType();         // 根据调用视频的数目判断窗口的大小
            this.screenFullMin();         // 调用窗口全屏还原
            this.closeVideoTask();        // 关闭视频调用
            this.closeOneVideo();         // 关闭单个视频
            this.oneVideoFullScreen();    // 单个视频全屏
            this.videoDrag();             // 视频拖拽
            this.changeTimes();           // 视频大小倍数
            this.PTZControlOneVideo();	  // 云台控制单个视频窗口
            this.ResendOneVideo();		  // 转发单个视频
            this.printScreenOneVideo();	  // 单个视频截图
            this.videoSelect();			  // 单个视频点击选择事件
            this.setVoiceOneVideo();	  // 单个视频伴音开启点击事件
        },
        videoTaskType: function () {
        	var _this = this;
            var videoLength = _this.liArr.length;
            // 获取当前视频查看窗口显示倍数。
            var $times = $('.video-task>.top-bar>.times>div');
            var iTime = 1;
            if ($times.length > 0) {
            	for (var i = 0; i < $times.length; i ++) {
            		if ($times.eq(i).hasClass('active')) {
            			iTime = Math.pow(2, i);
            			break;
            		}
            	}
            }
            var iw,ih,icount;
            if (videoLength === 1) {
            	iw = 348, ih = 234, icount = 0;
            } else if (1 < videoLength && videoLength <= 2) {
            	iw = 690, ih = 432, icount = 1;
            } else if (2 < videoLength && videoLength <= 4) {
            	iw = 690, ih = 432, icount = 2;
            } else if (4 < videoLength && videoLength <= 8) {
            	iw = 690, ih = 432, icount = 3;
            } else if (8 < videoLength && videoLength <= 9) {
            	iw = 690, ih = 432, icount = 4;
            } else if (9 < videoLength && videoLength <= 13) {
            	iw = 690, ih = 432, icount = 5;
            } else if (13 < videoLength && videoLength <= 16) {
            	iw = 690, ih = 432, icount = videoLength;
            } else if (16 < videoLength && videoLength <= 25) {
            	iw = 861, ih = 531, icount = videoLength;
            }
            _this.clientWidth = document.documentElement.clientWidth;
            _this.clientHeight = document.documentElement.clientHeight;
            if (iw * iTime > _this.clientWidth || ih * iTime > _this.clientHeight) {
            	prompt('warn', lang.dispatch.currentMultiplierResolution, 1000);
            	$times.removeClass('active');
            	$times.eq(0).addClass('active');
            	_this.taskSize(iw, ih, icount);
            } else {
            	_this.taskSize(iw * iTime, ih * iTime, icount);
            }
            _this.preWidth = iw;
            _this.preHeight = ih;
        },
        screenFullMin: function () {
            var _this = this;
            $('.video-task>.top-bar>.full-screen').off("click").on('click', function () {
            	if (window.top.getParaVal('dispatchType') == 'haveMap') {
	                if (!$('.video-task>.top-bar>.full-screen').hasClass('active')) {
	                    var lateTop = $('.video-task').css('top');
	                    $('.video-task').attr('topVal', lateTop);
	                    $('.video-task').css('top',0);
	                	_this.fullScreen();
	                } else {
	                	var preTop = $('.video-task').attr('topVal');
	                	$('.video-task').css('top',preTop);
	                	_this.restore();
	                }
            	} else {
            		if (!$('.video-task>.top-bar>.full-screen').hasClass('active')) {
                        var lateBot = $('.video-task').css('bottom');
                        $('.video-task').attr('botVal', lateBot);
                        $('.video-task').css('bottom',0);
                    	_this.fullScreen();
                    } else {
                    	var preBot = $('.video-task').attr('botVal');
                    	$('.video-task').css('bottom',preBot);
                    	_this.restore();
                    }
            	}
            });
        },
        fullScreen: function () {
            $('.video-task>.top-bar>.full-screen').html("&#xe6c6;");
            $('.video-task>.top-bar>.full-screen').addClass('active');
            $('.video-task').addClass('full-active');
        },
        restore: function () {
            $('.video-task>.top-bar>.full-screen').html("&#xe6c5;");
            $('.video-task>.top-bar>.full-screen').removeClass('active');
            $('.video-task').removeClass('full-active');
        },
        minimum: function () { //有变化。
            $('.video-task-wrap .video-task .top-bar .minimum').off("click").on('click', function () {
            	$('.video-task-wrap .video-task').css('visibility','hidden');
                $('.video-task-wrap .video-gif').addClass('active');
            });
            $('.video-task-wrap .video-gif').off("click").on('click', function () {
                $('.video-task-wrap .video-gif').removeClass('active');
                $('.video-task-wrap .video-task').css('visibility','visible');
            });
        },
        changeTimes: function () {
            var _this = this;
            $('.video-task>.top-bar .times div').off("click").on('click', function () {
                if (!$('.video-task').hasClass('full-active')) {
                    _this.clientWidth = document.documentElement.clientWidth;
                    _this.clientHeight = document.documentElement.clientHeight;
                    switch ($(this).text()) {
                        case "x1":
                        	if (window.top.getParaVal('dispatchType') == 'normal') $('.video-task').css({'right':'70px','bottom':'8px'});
                        	_this.taskSize(_this.preWidth, _this.preHeight);
                            $('.video-task>.top-bar .times div').removeClass('active');
                            $(this).addClass('active');
                            break;
                        case "x2":
                        	if ((2*_this.preWidth < _this.clientWidth) && (2*_this.preHeight<_this.clientHeight)) {
                        		if (window.top.getParaVal('dispatchType') == 'normal') $('.video-task').css({'right':'70px','bottom':'8px'});
                                _this.taskSize(2*_this.preWidth, 2*_this.preHeight);
                                $('.video-task>.top-bar .times div').removeClass('active');
                                $(this).addClass('active');
                            } else {
                            	prompt('warn', lang.dispatch.currentMultiplierDisplay, 1000);
                            }
                            break;
                        case "x4":
                        	if ((4*_this.preWidth < _this.clientWidth) && (4*_this.preHeight<_this.clientHeight)) {
                        		if (window.top.getParaVal('dispatchType') == 'normal') $('.video-task').css({'right':'70px','bottom':'8px'});
                                _this.taskSize(4*_this.preWidth, 4*_this.preHeight);
                                $('.video-task>.top-bar .times div').removeClass('active');
                                $(this).addClass('active');
                            } else {
                            	prompt('warn', lang.dispatch.currentMultiplierDisplay, 1000);
                            }
                            break;
                    }
                }
            });
        },
        taskSize: function (taskWidth, taskHeight, liCount) {
        	var _this = this;
            $('.video-task').css({width: taskWidth, height: taskHeight});
            $('.video-task>ul').css({width: taskWidth-6, height: taskHeight-39});
            if (!liCount && liCount != 0) return;
            if (liCount >= _this.posArr.length) {
            	var pnum,pwidth,pheigth;
            	if (liCount > 20) {
            		pnum = 5;
            		pwidth = 20;
            		pheigth = 20;
            	} else if (liCount > 16 && liCount <= 20) {
            		pnum = 5;
            		pwidth = 20;
            		pheigth = 25;
            	} else {
            		pnum = 4;
            		pwidth = 25;
            		pheigth = 25;
            	}
            	for (var i = 0; i < _this.liArr.length; i++) {
            		_this.liArr[i].css({
            			top: parseInt(i/pnum)*pheigth+'%',
            			right: (i%pnum)*pwidth+'%',
            			width: pwidth+'%',
            			height: pheigth+'%'
            		});
            	}
            } else {
            	for (var i = 0; i < _this.liArr.length; i++) {
            		_this.liArr[i].css({
            			top: parseInt(_this.posArr[liCount][i][0]*100)+'%',
            			right: parseInt(_this.posArr[liCount][i][1]*100)+'%',
            			width: parseInt(_this.posArr[liCount][i][2]*100)+'%',
            			height: parseInt(_this.posArr[liCount][i][3]*100)+'%'
            		});
            	}
            }
        },
        closeVideoTask: function () {
        	var _this = this;
            $('.video-task>.top-bar>.close').off("click").on('click', function () {
            	var videoLength = $('.video-task>ul>li').length;
            	for (var i = 0; i < videoLength; i++) {
            		var m_callId = $('.video-task>ul>li').eq(i).attr("callId");
            		var usrCtx = $('.video-task>ul>li').eq(i).attr("id");
            		if (m_callId || m_callId == 0) window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
            		var isVideojs = $('#' + usrCtx).attr('videojs');
                	if (isVideojs && isVideojs == 'true') videojs(usrCtx + '_play_peer').dispose();
            	}
            	_this.liArr = [];
            	_this.curVideoNum = null;
            	// 删除云台控制面板。
            	$('.cloud-control').remove();
            	$('.video-task-wrap').remove();
            });
        },
        oneVideoFullScreen: function () {
        	var _this = this;
            $('.video-task>ul>li>.icon').off("click").on('click', function () {
                if($(this).parent().find('.full').hasClass('active')){ //最大化。
                    $(this).removeClass('active');
                    $(this).parent().find('.mini').addClass('active');
                    $(this).parent().css({
            			'top': '0%',
            			'right': '0%',
            			'width': '100%',
            			'height': '100%',
            			'z-index': 10
            		});
                }else if($(this).parent().find('.mini').hasClass('active')){ //还原。
                    $(this).removeClass('active');
                    $(this).parent().find('.full').addClass('active');
                    $(this).parent().css({
            			'z-index': ''
            		});
                    _this.videoTaskType();
                }
            });
        },
        closeOneVideo: function () {
            var _this = this;
            $('.video-task>ul>li>.close').off("click").on('click', function () {
            	var VTitle = $(this).parent().find('.video-name').html();
            	var vNum = VTitle.substring(VTitle.indexOf('【') + 1, VTitle.indexOf('】'));
            	if (_this.curVideoNum == vNum) _this.curVideoNum = null;
            	var m_callId = $(this).parent().attr("callId");
            	var usrCtx = $(this).parent().attr("id");
            	for (var i = 0; i < _this.liArr.length; i++) {
            		if (_this.liArr[i].attr('id') == usrCtx) {
            			_this.liArr.splice(i, 1);
            			break;
            		}
            	}
            	if (m_callId || m_callId == 0) window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
            	var isVideojs = $('#' + usrCtx).attr('videojs');
            	if (isVideojs && isVideojs == 'true') videojs(usrCtx + '_play_peer').dispose();
            	// 删除云台控制面板。
            	var dlgId = $(this).parent().attr("PTZDlgId");
            	if (dlgId && dlgId != '' && $('#'+dlgId).length > 0) $('#'+dlgId).remove();
            	// 删除当前视频查看窗口。
            	$(this).parent().remove();
            	var videoLength = $('.video-task>ul>li').length;
            	if (videoLength == 0) { // 如果已经没有视频查看窗口，则删掉整个视频查看界面。
            		$('.video-task-wrap').remove();
            	} else { // 如果仍有视频查看窗口，则
            		_this.videoTaskType();
            	}
            });
        },
        PTZControlOneVideo: function () {
            var _this = this;
            $('.video-task>ul>li>.construct').off("click").on('click', function (event) {
            	var m_callId = $(this).parent().attr("callId");
            	var PTZTitle = $(this).parent().find('.video-name').html();
            	var dlgId = fn_PTZControlOneVideo(m_callId, PTZTitle, event);
            	$(this).parent().attr("PTZDlgId", dlgId);
            });
        },
        ResendOneVideo: function () {
            var _this = this;
            $('.video-task>ul>li>.resend').off("click").on('click', function (event) {
            	var VTitle = $(this).parent().find('.video-name').html();
            	var vNum = VTitle.substring(VTitle.indexOf('【') + 1, VTitle.indexOf('】'));
            	fn_commonUserAndGroupChoose({
            		title : lang.dispatch.forWardObject,
            		okFn : function(chooseData) {
            			if (chooseData && chooseData.length && chooseData.length > 0) {
            				for (var i = 0; i < chooseData.length; i ++) {
            					var toNum = chooseData[i].NUM;
            					fn_transVideo(vNum, toNum);
            				}
            			}
            		}
            	});
            });
        },
        printScreenOneVideo: function () {
            var _this = this;
            $('.video-task>ul>li>.printscreen').off("click").on('click', function (event) {
            	var VTitle = $(this).parent().find('.video-name').html();
            	var vNum = VTitle.substring(VTitle.indexOf('【') + 1, VTitle.indexOf('】'));
            	fn_printScreenReq(vNum);
            });
        },
        setVoiceOneVideo: function () {
            var _this = this;
            $('.video-task>ul>li>.voiceVolume').off("click").on('click', function (event) {
            	var m_callId = $(this).parent().attr("callId");
            	var voiceStatus = $(this).attr("voiceStatus");
            	if (voiceStatus == '0') { //静音，点击开启声音。
            		$(this).html('&#xe660;');
            		$(this).attr("voiceStatus",'1');
            		if (m_callId || m_callId == 0) window.m_IdtApi.CallSetPeerVolume(m_callId, 1.0);
            	} else { //有声音，点击设为静音。
            		$(this).html('&#xe65f;');
            		$(this).attr("voiceStatus",'0');
            		if (m_callId || m_callId == 0) window.m_IdtApi.CallSetPeerVolume(m_callId, 0.0);
            	}
            });
        },
        videoSelect: function () {
        	var _this = this;
        	$('.video-task>ul>li').off("click").on('click', function () {
             	$('.video-task-wrap .video-task>ul>li>.video').css('border','1px dotted white');
				$(this).children('.video').css('border','2px solid #06F99D');
				var VTitle = $(this).find('.video-name').html();
            	var vNum = VTitle.substring(VTitle.indexOf('【') + 1, VTitle.indexOf('】'));
            	_this.curVideoNum = vNum;
        	 });
        },
        videoDrag: function () {
            var _this = this;
            $('.video-task>ul>li').off("mousedown").on('mousedown', function () {
            	var vid = $(this).attr('id');
            	_this.startIndex = 0;
            	for (var i = 0; i < _this.liArr.length; i++) {
            		if (_this.liArr[i].attr('id') == vid) {
            			_this.startIndex = i;
            			break;
            		}
            	}
            });
            $('.video-task>ul>li').off("mouseup").on('mouseup', function () {
            	var vid = $(this).attr('id');
            	_this.endIndex = 0;
            	for (var i = 0; i < _this.liArr.length; i++) {
            		if (_this.liArr[i].attr('id') == vid) {
            			_this.endIndex = i;
            			break;
            		}
            	}
            	if (_this.startIndex != _this.endIndex && _this.startIndex >= 0 && _this.endIndex >= 0) {
            		var $start = _this.liArr[_this.startIndex];
            		var $end = _this.liArr[_this.endIndex];
            		_this.liArr.splice(_this.startIndex, 1, $end);
            		_this.liArr.splice(_this.endIndex, 1, $start);
            		_this.videoTaskType();
            	}
            	_this.startIndex = 0;
            	_this.endIndex = 0;
            });
        },
        removeVideo : function (vid) {
        	var _this = this;
        	for (var i = 0; i < _this.liArr.length; i++) {
        		if (_this.liArr[i].attr('id') == vid) {
        			_this.liArr.splice(i, 1);
        			break;
        		}
        	}
        	// 删除云台控制面板。
        	var dlgId = $('#' + vid).attr("PTZDlgId");
        	if (dlgId && dlgId != '' && $('#'+dlgId).length > 0) {
        		$('#'+dlgId).find('.speedInput').slider('destroy');
        		$('#'+dlgId).remove();
        	}
        	var isVideojs = $('#' + vid).attr('videojs');
        	if (isVideojs && isVideojs == 'true') videojs(vid + '_play_peer').dispose();
        	// 删除当前视频查看窗口。
        	$('#' + vid).remove();
        	var videoLength = $('.video-task>ul>li').length;
        	if (videoLength == 0) { // 如果已经没有视频查看窗口，则删掉整个视频查看界面。
        		$('.video-task-wrap').remove();
        	} else { // 如果仍有视频查看窗口，则
        		_this.videoTaskType();
        	}
        },
        addVideo: function (sn, viewNum, viewName, videoUrl, isVoice) {
        	var _this = this;
        	// 判断当前查看的视频数量，如大于等于25个，则提示不允许再添加视频监控。
        	var videoLength = $('.video-task>ul>li').length;
        	if (videoLength >= 25) {
        		prompt('warn', lang.dispatch.maximum25, 2000);
        		return;
        	}
        	// 首先判断相关视频查看与监控界面面板是否存在。如不存在，则添加相关面板。
        	var isFirstVideo = false;
        	if ($('.video-task-wrap').length == 0) {
        		isFirstVideo = true;
        		var htmlStr ='<div class="video-task-wrap">' +
        		    '<div class="video-task">' +
	                '	<div class="top-bar clearfix">' +
	                '	    <div class="float-right close icon">&#xe6c4;</div>' +
	                '	    <div class="float-right full-screen icon">&#xe6c5;</div>' +
	                '	    <div class="float-right minimum icon">&#xe6c3;</div>' +
	                '	    <div class="float-left icon">&#xe62d; '+lang.dispatch.videoMonitoring+'</div>' +
	                '		<div class="times"><div>x1</div><div class="active">x2</div><div>x4</div></div>' +
	                '	</div>' +
	                '	<ul></ul>' +
	                '	<div class="drag-window"></div>' +
		            '</div>' +
		            '<div class="video-gif">' +
		            '    <img src="static/img/video.gif" alt=""/>' +
		            '</div></div>';
        		$(document.body).append(htmlStr);
        		// 鼠标拖动效果
        	    $('.video-task-wrap .top-bar').off('mousedown').on('mousedown',function (event) {
        	        if (!$('.video-task').hasClass('full-active')) {
        	            var isMove = true;
        	            var abs_x = event.pageX - $('.video-task').offset().left;
        	            var abs_y = event.pageY - $('.video-task').offset().top;
        	            $(document).off('mousemove').on('mousemove',function (event) {
        	            	if (isMove) {
	        	            	if (window.top.getParaVal('dispatchType') == 'haveMap') {
            	                    $('.video-task').css({
            	                        'right': document.documentElement.clientWidth - $('.video-task').width() - (event.pageX - abs_x),
            	                        'top': event.pageY - abs_y,
            	                        'transform': 'translate(0, 0)'
            	                    });
	        	            	} else {
            	                    $('.video-task').css({
            	                        'right': document.documentElement.clientWidth - $('.video-task').width() - (event.pageX - abs_x),
            	                        'bottom': document.documentElement.clientHeight - event.pageY -$('.video-task').height() + abs_y,
            	                        'transform': 'translate(0, 0)'
            	                    });
	        	            	}
        	            	}
        	            }).off('mouseup').on('mouseup',function () {
        	                isMove = false;
        	            });
        	        }
        	    });
        	}
        	// 添加相关视频查看窗口。
        	var videoTitle = '【' + viewNum + '】' + viewName;
        	var videoPeerId = sn + '_play_peer';
        	var videoMyId = sn + '_play_my';
        	var htmlStr = 	'<li id="' + sn + '" viewNum="' + viewNum + '">\n' +
				            '	<div class="video-name" title="' + videoTitle + '">' + videoTitle + '</div>\n' +
				            '	<div class="trans-mask"></div>\n' +
				            '	<div class="close" title="'+lang.dispatch.hangUp+'">&#xe689;</div>\n' +
				            '	<div class="icon full active" title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>\n' +
				            '	<div class="icon mini" title="'+lang.dispatch.reduction+'">&#xe698;</div>\n' +
				            '	<div class="construct" title="'+lang.dispatch.ConsoleControl+'">&#xe655;</div>\n' +
				            ' 	<div class="resend" title="'+lang.dispatch.videoForward+'">&#xe6d9;</div>\n' +
				            ' 	<div class="printscreen" title="'+lang.dispatch.videoCapture+'">&#xe63c;</div>\n';
        	if (isVoice && isVoice == '1') {
        		htmlStr += ' 	<div class="voiceVolume" title="'+lang.dispatch.videoAccompaniment+'" voiceStatus="0">&#xe65f;</div>\n';
        	}
        	htmlStr += '	<div class="video">\n';
        	if (videoUrl && videoUrl != '') {
        		htmlStr += fn_genVideoJsWidget(videoPeerId, videoUrl);
        	} else {
        		htmlStr += fn_genVideo(videoPeerId, '100%', '100%', false);
        	}
        	htmlStr +='	</div>\n</li>';
        	$('.video-task>ul').append(htmlStr);
        	_this.liArr.push($('.video-task>ul').find('#'+sn));
        	// 重载相关事件，以便对新添加的视频窗口生效。
        	_this.init();
        	if (videoUrl && videoUrl != '') {
        		videojs(videoPeerId, {
                    autoplay : true,
                    language: 'zh-CN'
                });
        		$('.video-task>ul').find('#'+sn).attr('videojs','true');
        	}
        	if (isFirstVideo == true) {
        		$('.video-task>ul #' + sn + ' .video').css('border','2px solid #06F99D');
        		_this.curVideoNum = viewNum;
        	}
        }
	};
	window.videoMonitor.addVideo(sn, viewNum, viewName, videoUrl, isVoice);
}

// 视频查看通信呼出。
function fn_videoView(viewNum, viewName) {
	if (viewNum == window.top.userInfo.userInfo.num) {
		prompt('error', lang.dispatch.communicateyourself, 1000);
		return;
	}
	var videoUrl = '';
	if (viewNum.indexOf('*') != -1) { // 第三方平台用户。
		// 获取该第三方平台用户的视频播放地址前缀。
		$.ajax({
			url : "webservice/api/v1/comm/userBasic/getVideoUrl",
			type : "POST",
			async : false,
			data : {
				user_num : viewNum.split('*')[0]
			},
			success : function(data) {
				if (data) {
					videoUrl = data;
				}
			}
		});
	}
	// 创建通讯序号。
	var sn = 'viewvideo_' + fn_genSn();
	if (videoUrl == '') { //如果为空，则调用普通的视频查看功能。
		// 获取当前用户的视频伴音参数值。
		var isVoice = fn_getUserWorkInfo(viewNum, 'c');
		var ARx = 0;
		if (isVoice && isVoice == '1') ARx = 1;
		// 创建视频通讯面板。
		var userInfoDetail = fn_getUserInfoDetail(viewNum);
		if (userInfoDetail && userInfoDetail.ChanNum && userInfoDetail.ChanNum != 0) {
			if (userInfoDetail.ChanNum == 1) { //只有一个摄像头通道，则直接查看该通道的视频。
				myVideoViewFn(1);
			} else { //当拥有多个通道时，弹出通道选择窗，查看所选择通道的视频。
				fn_openCamChanChooseDlg(viewNum, viewName, userInfoDetail.ChanNum, myVideoViewFn, null);
			}
		} else {
			myVideoViewFn();
		}
		function myVideoViewFn(myChanNum) {
			if (myChanNum) viewNum = viewNum + '*' + myChanNum;
			//判断当前要查看的视频对象在视频查看窗口中是否已经存在，如果已存在，则提示不允许重复查看同一视频，然后直接返回。
			if (fn_isExistViewNum(viewNum) == true) {
				prompt('warn', '不允许重复查看同一对象视频。', 1000);
				return;
			}
			fn_addVideoMonitor(sn, viewNum, viewName, null, isVoice);
			var peerVideo = $('#' + sn + '_play_peer')[0];
			var m_CallId = window.m_IdtApi.CallMakeOut(sn, null, peerVideo, ARx, 0, 1, 0, viewNum, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
			$('#' + sn).attr("callId", m_CallId);
		}
	} else { //否则用VIDEOJS调用第三方视频查看地址。
		var fullVideoUrl = videoUrl + window.top.userInfo.userInfo.num + '**' + viewNum;
		//判断当前要查看的视频对象在视频查看窗口中是否已经存在，如果已存在，则提示不允许重复查看同一视频，然后直接返回。
		if (fn_isExistViewNum(viewNum) == true) {
			prompt('warn', '不允许重复查看同一对象视频。', 1000);
			return;
		}
		fn_addVideoMonitor(sn, viewNum, viewName, fullVideoUrl);
	}
}

// 视频转发通用函数。
function fn_transVideo(watchNum, toNum) {
	var sn = fn_genSn();
	var myNum = window.userInfo.userInfo.num;
	var dateStr = (new Date()).Format('yyyy-MM-dd');
    //发送给strTo,让strTo查看strWatchDown的视频
    var strText = '{"fromDesc":"';
    strText += myNum;
    strText += '","fromNumber":"';
    strText += myNum;
    strText += '","messageId":"' + dateStr + '","subPara":"{';
    strText += '\\\"toNum\\\":\\\"';
    strText += watchNum;
    strText += '\\\",\\\"toNumDesc\\\":\\\"';
    strText += watchNum;
    strText += '\\\",\\\"type\\\":2,\\\"userList\\\":[]'; //0:查询 1:查询响应 2.设置 3设置响应
    strText += '}","toDesc":"';
    strText += toNum;
    strText += '","toNumber":"';
    strText += toNum;
    strText += '","type":4}'; //0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息
    window.top.m_IdtApi.IMSend(sn, IDT.IM_TYPE_CONF, toNum, strText, null, null);
}

// 请求视频截图方法。
function fn_printScreenReq(toNum) {
	var sn = fn_genSn();
	var myNum = window.userInfo.userInfo.num;
	var nowDt = new Date();
	var dateStr = nowDt.Format('yyyy-MM-dd');
	var dateVal = nowDt.valueOf();
	var subPara = {
		"messageId" : dateVal,
		"type" : 1
	};
	var subParaStr = JSON.stringify(subPara);
	var prtScreen = {
		"fromDesc" : myNum,
		"fromNumber" : myNum,
		"messageId" : dateStr,
		"subPara" : subParaStr,
		"toDesc" : toNum,
		"toNumber" : toNum,
		"type" : 7
	};
	var prtScStr = JSON.stringify(prtScreen);
	window.top.m_IdtApi.IMSend(sn, IDT.IM_TYPE_CONF, toNum, prtScStr, null, null);
}

// 视频截图下载对话框。
function fn_openCutImgDlg(imgSrc) {
	// 创建视频截图下载对话框面板。
	var htmlStr = 	'<div class="downloadCutImg-dlg">' +
				    '    <div class="content"></div>' +
				    '    <div class="footer">' +
				    '        <div class="close">'+lang.dispatch.Close+'</div>' +
				    '        <div class="load">&#xe632;'+lang.dispatch.downloadPicture+'</div>' +
				    '    </div>' +
				    '</div>';
	if ($('.downloadCutImg-dlg').length == 0) $(document.body).append(htmlStr);
	$('.downloadCutImg-dlg .content').html('');
	$('.downloadCutImg-dlg .content').append('<img src=""/>');
	$('.downloadCutImg-dlg .content>img').attr('src', imgSrc).off('load').on('load', function() {
		 var realWidth  = this.width;
         var realHeight = this.height;
         var wRate = 718 / realWidth;
         var hRate = 423 / realHeight;
         if (wRate > hRate) {
        	 $(this).css({
        		 width : realWidth * hRate,
        		 height : 423
        	 });
         } else {
        	 $(this).css({
        		 width : 718,
        		 height : realHeight * wRate
        	 });
         }
	});
	$('.downloadCutImg-dlg .footer>.close').off('click').on('click', function() {
		$('.downloadCutImg-dlg').dialog('close');
	});
	$('.downloadCutImg-dlg .footer>.load').off('click').on('click', function() {
		var imgSrc = $('.downloadCutImg-dlg .content>img').attr('src');
		if ($("#downloadCutImgFrm")) $("#downloadCutImgFrm").remove();
		$("<form id='downloadCutImgFrm'>").attr({
			"action" : "attach/downloadFile",
			"method" : "POST"
		})
		.append("<input type='hidden' name='filePath' value='" + imgSrc + "'/>")
		.appendTo(document.body).submit();
	});
	$('.downloadCutImg-dlg').dialog({
        title: lang.dispatch.videoCapture,
        width: 760,
        height: 530,
        closed: false,
        cache: false,
        modal: true
    });
	$('.downloadCutImg-dlg .content>img').off('dblclick').on('dblclick', function(){
		$(this).viewer('destroy').viewer({
			zIndex: 999999,
			navbar: false,
			hidden: function (e) {
				$(this).viewer('destroy');
		    },
		}).viewer('show');
	});
}

// 电子轨迹查看以及播放功能。
function fn_trailPlay(num, name) {
	$('#track-play').attr('userId', num);
	$('#track-play div.head').text(lang.dispatch.hisRoute+"·" + name);
	$('.appear').html('&#xe697; '+lang.dispatch.displayDetails);
	$('#track-play .details').css('display', 'none');
	$('#track-play').animate({height: 234}, function () {
		$('#track-play').removeClass('active');
	})
	$('#startTime').datetimebox('setValue', getStartTime());
	$('#endTime').datetimebox('setValue', getNowFormatDate());
	$('.speed.clearfix .multiple').first().click();
	$('#ss').slider('setValue', 0);
	$('#track-dg').datagrid({
		  data: []
	});
	$('#track-play').find('.play-or-stop').html('&#xe6b3;');
	$('#track-play').find('.play-or-stop').removeClass('active')
    window.lushu= null;
	$('.personal-data').fadeOut();
	$('#track-play').fadeIn();
}

// 强插功能函数。
function fn_ForceInj(callNum,callName) {
	if (callNum == window.top.userInfo.userInfo.num) {
		prompt('error', lang.dispatch.communicateyourself, 1000);
		return;
	}
	if (window.top.activeCallInfo == true) {
		prompt('warn', lang.dispatch.CurrentlyNotAllowed, 1000);
		return;
	}
	// 获取该终端用户是全双工单呼还是半双工单呼。
	var isHalfDuplex = fn_getUserWorkInfo(callNum, 'd');
	var talkRightHtml = '';
	if (isHalfDuplex == '1') talkRightHtml = '<div class="touchVoice"></div>';
	var nameInfo = '【' + callNum + '】' + callName;
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建语音通讯面板。
	var htmlStr = '<div class="calling" id="sureChat_commDlg_' + sn + '" callNum="' + callNum + '" callName="' + callName + '">' +
		fn_genVideo('id_voice_my_' + sn,0,0,true) +
		fn_genVideo('id_voice_peer_' + sn,0,0,false) +
//		'<video style="width:0;height:0;" id="id_voice_my_' + sn + '" autoplay muted></video>' +
//		'<video style="width:0;height:0;" id="id_voice_peer_' + sn + '" autoplay></video>' +
	    '<div class="header icon">&#xe628; '+lang.dispatch.voiceCall+'</div>' +
	    '<div class="content">' +
	    '    <div class="img-wrap">' +
	    '        <img src="/upload/headicon/' + callNum + '.png" alt=""/>' +
	    '    </div>' +
	    '    <div class="name" id="callName" title="' + nameInfo + '">' + nameInfo + '</div>' +
	    '    <div class="time" id="callTime">'+lang.dispatch.inDialong+'</div>' +
	    '</div>' + talkRightHtml +
	    '<div class="footer icon">' +
        '	<span class="icon callClose" title="'+lang.dispatch.hangUp+'">&#xe659;</span>' +
        '	<span class="icon viewVideo" title="'+lang.system.CheckVideo+'">&#xe62d;</span>' +
        '	<span class="icon keyDial" title="'+lang.dispatch.Dial+'">&#xe63d;</span>' +
        '</div></div>';
	$(document.body).append(htmlStr);
    $('.calling>.content,.calling>.header').off('mousedown').on('mousedown',function (event) {
        var isMove = true;
        var abs_x = event.pageX - $('.calling').offset().left;
        var abs_y = event.pageY - $('.calling').offset().top;
        $(document).off('mousemove').on('mousemove',function (event) {
            if (isMove) {
                $('.calling').css({
                    'left': event.pageX - abs_x,
                    'top': event.pageY - abs_y,
                    'margin-left': 0
                });
            }
        }).off('mouseup').on('mouseup',function () {
            isMove = false;
        });
    });
	var myVideo = $('#id_voice_my_' + sn)[0];
	var peerVideo = $('#id_voice_peer_' + sn)[0];
	var callId = null;
	if (isHalfDuplex == '1') { //发起半双工呼叫，也就是对端为个人的组呼。
		callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 0, 1, 0, 0, callNum, IDT.SRV_TYPE_CONF, "", 1, 0);
	} else { //发起全双工语音单呼。
		callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 0, 0, callNum, IDT.SRV_TYPE_FORCE_INJ, "", 1, 0);
	}
	window.top.activeCallInfo = true;
	$('#sureChat_commDlg_' + sn).attr("callId", callId);
	$('#sureChat_commDlg_' + sn).attr("callSn", sn);
	//绑定话权控制相关事件。
	if (isHalfDuplex == '1') {
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mousedown').on('mousedown', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, true);
			$(this).css('background','url(static/img/talk.png)');
		});
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseup').on('mouseup', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
			$(this).css('background','url(static/img/talkclk.png)');
		});
		$('#sureChat_commDlg_' + sn + ' .touchVoice').off('mouseleave').on('mouseleave', function(e) {
			var callId = $(this).parent().attr("callId");
			if (callId || callId == 0) window.top.m_IdtApi.CallMicCtrl(callId, false);
			$(this).css('background','url(static/img/talkclk.png)');
		});
	}
	$('#sureChat_commDlg_' + sn + ' .footer').off('click').on('click', function(e) {
		var $thisObj = $(e.target);
		var $thisPanel = $(e.target).parent().parent();
		if ($thisObj.hasClass('callClose')) {
			var callId = $thisPanel.attr("callId");
			var sn = $thisPanel.attr("callSn");
			var sh = $thisPanel.attr("timeIntervalSn");
			if (sh) clearInterval(sh);
			window.top.m_IdtApi.CallRel(callId, sn, 0);
			$thisPanel.remove();
			window.top.activeCallInfo = false;
		} else if ($thisObj.hasClass('viewVideo')) {
			var callNum = $thisPanel.attr("callNum");
			var callName = $thisPanel.attr("callName");
			fn_videoView(callNum,callName);
		} else if ($thisObj.hasClass('keyDial')) {
			var callId = $thisPanel.attr("callId");
			fn_openKeyDialDlg(function(otherNum) {
				window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_NUM, otherNum, null);
			});
		}
	});
}

// 强拆功能函数。
function fn_ForceRel(num) {
	window.top.m_IdtApi.ForceRel(num);
	window.top.activeCallInfo = false;
}

// 视频查看请求对话框。
function fn_videoRequestIn(param) {
	// 获取相关参数值。
	var callId 		= param[1];
	var pcPeerNum 	= param[2];
	var pcPeerName 	= param[3];
	var SrvType 	= param[4];
	var bIsGCall 	= param[5];
	var ARx 		= param[6];
	var ATx 		= param[7];
	var VRx 		= param[8];
	var VTx 		= param[9];
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建视频查看请求对话框面板。
	var htmlStr = '<div class="video-request" id="sureChat_commDlg_' + sn + '">' +
					'	<div class="header icon">' +
					'	    &#xe62d; '+lang.system.CheckVideo+' — 【' + pcPeerNum + '】' + pcPeerName + '<span id="videoReq_title_' + sn + '">'+lang.dispatch.requestViewYourVideo+'</span>' +
					'	</div>' +
					'	<div class="zoom">' +
					'	    <div class="icon all-window" title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>' +
					'	    <div class="icon less-window" title="'+lang.dispatch.narrow+'">&#xe698;</div>' +
					'	</div>' +
					'	<div class="handle">' +
					'	    <div class="icon answer" title="'+lang.dispatch.Answer+'" onclick="videoReqAnswerFn(this)">&#xe659;</div>' +
					'	    <div class="icon refuse" title="'+lang.dispatch.hangUp+'" onclick="videoReqCloseFn(this)">&#xe659;</div>' +
					'	</div>' +
					'	<div class="answered">' +
					'	    <div class="time">00:00:00</div>' +
					'	    <div class="icon refuse" title="'+lang.dispatch.hangUp+'" onclick="videoReqCloseFn(this)">&#xe659;</div>' +
					'	</div>' +
					'	<div class="video-wrap">' +
							fn_genVideo('id_video_my_'+sn,'100%','100%',true) +
//					'		<video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
					'	</div>' +
					'</div>';
	$(document.body).append(htmlStr);
	$('#sureChat_commDlg_' + sn).attr("callId", callId);
	$('#sureChat_commDlg_' + sn).attr("callSn", sn);

	// 接听。
	window.videoReqAnswerFn = function(obj) {
		$(obj).parent().css('display', 'none');
        $('.video-request>.answered').css('display', 'block');
		var callId = $(obj).parent().parent().attr("callId");
		var sn = $(obj).parent().parent().attr("callSn");
		var myVideo = $('#id_video_my_' + sn)[0];
        window.top.m_IdtApi.CallAnswer(callId, sn, myVideo, null, ARx, ATx, VRx, VTx);
        fn_stopRingVoice(callId);
        $('#videoReq_title_'+sn).text(lang.dispatch.checkYourVideo);
        fn_setTimeCount(sn);
	}
	// 挂断。
	window.videoReqCloseFn = function(obj) {
		var callId = $(obj).parent().parent().attr("callId");
		var sn = $(obj).parent().parent().attr("callSn");
		var sh = $(obj).parent().parent().attr("timeIntervalSn");
		if (sh) clearInterval(sh);
		fn_stopRingVoice(callId);
		window.top.m_IdtApi.CallRel(callId, sn, 0);
		$(obj).parent().parent().remove();
	}
    function fullScreenOrMin(wrap) {
        wrap.find(' .zoom>div').off('click').on('click', function () {
            if(wrap.find('.all-window').css('display') === 'block'){
                wrap.find('.all-window').css('display', 'none');
                wrap.find('.less-window').css('display', 'block');
                wrap.addClass('full-active');
            }else {
                wrap.find('.less-window').css('display', 'none');
                wrap.find('.all-window').css('display', 'block');
                wrap.removeClass('full-active');
            }
        });
    }
    function bindMove(wrap) {
        wrap.find('.video-wrap').off('mousedown').on('mousedown',function (event) {
            var isMove = true;
            var abs_x = event.pageX - wrap.offset().left;
            var abs_y = event.pageY - wrap.offset().top;
            $(document).off('mousemove').on('mousemove',function (event) {
                if (isMove) {
                    wrap.css({
                        'left': event.pageX - abs_x + 220,
                        'top': event.pageY - abs_y,
                        'margin-left':0
                    });
                }
            }).off('mouseup').on('mouseup',function () {
                isMove = false;
            });
        });
    }
    fullScreenOrMin($('.video-request'));
    bindMove($('.video-request'));
}

// 值检查提示。
function fn_checkVal(val, fieldNameCN, msg) {
	if (!val) val = '';
	if (!msg) msg = lang.dispatch.notEmpty;
	if (!fieldNameCN) fieldNameCN = '';
	val = val.toString();
	val = val.trim();
	if (val=='') {
		prompt('warn', '【' + fieldNameCN + '】' + msg, 1000);
		return false;
	} else {
		return true;
	}
}

// 隐藏折叠小组树。
function fn_gTreeCollapse() {
	$('.dispatch>.left>.group').css('display', 'none');
	$('.dispatch > .left .ulWrap').stop();
	$('.dispatch > .left .ulWrap').css({
		display : 'none',
		height : 0
	});
	$('.dispatch > .left .titleDiv').removeClass('active');
}

// 开始视频会商。
function fn_startVideoConf(groupData) {
	// 隐藏小组树。
	var vType = 'V';
	// 如果是带地图调度台，则缩回展开的小组树。
	if (window.top.getParaVal('dispatchType') == 'haveMap') {
		fn_gTreeCollapse();
	}

	// 视频会商表单初始化。
	$('#CONFERENCE_NAME').val('');
	$('#CONFERENCE_TITLE').val('');
	$('.video-conferencing .temporary').removeClass('active');
	$('.video-conferencing .video').addClass('active');
	$('.video-conferencing .float-right .ulTitle').text(lang.dispatch.Videomembers);

	// 清空现有人员。
	$(".video-conferencing .float-right .ulWrap>ul>li").remove();

	// 将当前登陆用户添加到人员列表中。
	var num = window.userInfo.userInfo.num;
	var name = window.userInfo.userInfo.name;
	$(".video-conferencing .float-right .ulWrap>ul").append(
			"<li title='" + name + "'><div class='imgWrap'>" + "<img src='/upload/headicon/" + num + ".png?t=" + Math.random() + "' alt=''></div>"
					+ "<div class='personInfo' num='" + num + "'>" + name + "</div><div class='icon'>&#xe606;</div></li>");

	//将小组中的人员添加到视频会商人员列表中。
	var data = fn_joinArray(groupData.onLine, groupData.offLine);
	for (var i = 0; i < data.length; i++) {
		if(data[i].Num!=num){
			$(".video-conferencing .float-right .ulWrap>ul").append(
					"<li title='" + data[i].Name + "'><div class='imgWrap'>" + "<img src='/upload/headicon/" + data[i].Num + ".png?t=" + Math.random() + "' alt=''></div>"
							+ "<div class='personInfo' num='" + data[i].Num + "'>" + data[i].Name + "</div><div class='icon'>&#xe606;</div></li>");
		}
	}

	// 添加人员鼠标移入移出事件。
	$('.video-conferencing .ulWrap li').hover(function() {
		$(this).find('.icon').addClass('active');
	}, function() {
		$(this).find('.icon').removeClass('active');
	});
	// 添加人员点击删除事件。
	$(".video-conferencing .float-right .ulWrap>ul>li").off('click').on('click',function() {
		$(this).remove();
	});

	//打开视频会商对话框。
	$('.video-conferencing').dialog({
		title : (vType == 'V') ? lang.dispatch.createVideoConferences : lang.dispatch.createTempGroup,
		width : 600,
		height : 300,
		closed : false,
		cache : false,
		modal : true
	});
}

// 视频会商界面打开。
function fn_openVideoConfDlg(confParam) {
	var self = this;
	if (window.top.activeCallInfo == true) {
		prompt('warn', lang.dispatch.notVideoConsultation, 1000);
		return;
	}
	if (!confParam) return;
	// 创建通讯序号。
	var sn = 'videoConf' + fn_genSn();
	// 发起会议：会议发起人号码、姓名。加入会议：当前登陆用户名与姓名。
	var masterNum = window.userInfo.userInfo.num;
	var masterName = window.userInfo.userInfo.name;
	// 结束或退出视频会商按钮文本。
	var btnCloseTxt = '<span class="icon">&#xe671;</span> '+lang.dispatch.endVideoConference;
    if (confParam.openType != 'main') btnCloseTxt = '<span class="icon">&#xe671;</span> '+lang.dispatch.exitVideoConference;
    var videoWinHtmlStr = '', btnHtmlStr = '', addPersonHtml = '', leftLiHtml = '';
    if (confParam.openType == 'main') {
    	videoWinHtmlStr = '<div class="video-window"><ul>' +
    						'<li dataid="0" videoType="my" id="V_' + masterNum + '" dataNum="' + masterNum + '" dataName="' + masterName + '">' +
							  '<div class="place">' +
							  '		<span class="icon">&#xe64b;</span>' +
							  '		<span class="id" style="color: white">' + masterNum + '</span>' +
							  '		<span class="name">' + masterName + '</span>' +
							  '</div>' +
							  '<div class="icon full-or-min full-screen active" title="' + lang.dispatch.fullScreen + '">&#xe69b;</div>' +
							  '<div class="icon full-or-min min-screen" title="' + lang.dispatch.reduction + '">&#xe698;</div>' +
							  '<div class="request-voice"></div>' +
							  '<div class="set">' +
							  '		<div title="' + lang.dispatch.videoParamSet + '" class="video-setting">&#xe601;</div>' +
							  '		<div class="out" title="' + lang.dispatch.moveOutMeeting + '">&#xe6b7;</div>' +
							  '		<div class="voice" title="' + lang.dispatch.Mute + '">&#xe834;</div>' +
							  '		<div class="mute" title="' + lang.dispatch.Unmute + '">&#xe66d;</div>' +
							  '</div>' +
							  '<div class="one-video-wrap">' +
							  		fn_genVideo('id_video_my_' + sn,'100%','100%',true) +
							  		fn_genVideo('id_video_my_1_' + sn,'100%','100%',true,true) +
//							  '		<video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
//							  '		<video style="width:100%;height:100%;display:none;" id="id_video_peer_' + sn + '" autoplay></video>' +
							  '</div></li>' +
							  '<li dataid="1" videoType="peer"><div class="one-video-wrap">' + fn_genVideo('id_video_peer_' + sn,'100%','100%',false) + '</div></li>' +
							  '<li dataid="2"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="3"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="4"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="5"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="6"><div class="one-video-wrap"></div></li>' +
							  '</ul></div>';
    	btnHtmlStr = '<div class="btn-wrap">' +
					  '	<div class="float-left icon">&#xe696; ' + lang.dispatch.durationMeeting + ': <span class="time">00:00:00</span></div>' +
					  '	<div class="float-right close">' + btnCloseTxt + '</div>' +
					  '	<div class="float-right sendConfIm"><span class="icon">&#xe6c9;</span> ' + lang.dispatch.sendMeetingNotice + '</div>' +
					  '	<div class="float-right open"><span class="icon">&#xe834;</span> ' + lang.dispatch.openMemberSpeak + '</div>' +
					  '	<div class="float-right stop"><span class="icon">&#xe66d;</span> ' + lang.dispatch.memberProhibitedSpeak + '</div>' +
					  '</div>';
    	leftLiHtml = '<li id="VCL_' + masterNum + '" dataNum="' + masterNum + '" dataName="' + masterName + '">' +
					  '	<div class="clearfix">' +
					  '		<div class="float-left img-wrap"><img src="/upload/headicon/' + masterNum + ".png?t=" + Math.random() + '" alt=""></div>' +
					  '		<div class="float-left">' +
					  '			<div class="name"><span class="icon"></span> ' + masterName + '</div>' +
					  '			<div class="id">' + masterNum + '</div>' +
					  '		</div>' +
					  '		<div class="float-right icon close">&#xe689;</div>' +
					  '		<div class="float-right icon hover-blue go active">&#xe6b7;</div>' +
					  '		<div class="float-right icon hover-blue video">&#xe62d;</div>' +
					  '		<div class="float-right icon hover-blue voice" iconStr="&#xe834;">&#xe834;</div>' +
					  '	</div>' +
					  '	<div class="small-video"></div></li>';
    	addPersonHtml = '<div class="icon add-people">&#xe67d;  ' + lang.dispatch.addMemberConference + '</div>';
    } else {
    	videoWinHtmlStr = '<div class="video-window"><ul>' +
					    	'<li dataid="0" videoType="peer">'+
					    	  '<div class="place">' +
					    	  '		<span class="icon">&#xe64b;</span>' +
							  '		<span class="id" style="color: white"></span>' +
							  '		<span class="name"></span>' +
							  '</div>' +
							  '<div class="icon full-or-min full-screen active" title="' + lang.dispatch.fullScreen + '">&#xe69b;</div>' +
							  '<div class="icon full-or-min min-screen" title="' + lang.dispatch.reduction + '">&#xe698;</div>' +
							  '<div class="request-voice"></div>' +
							  '<div class="set">' +
							  '		<div title="' + lang.dispatch.videoParamSet + '" class="video-setting">&#xe601;</div>' +
//							  '		<div class="out" title="' + lang.dispatch.moveOutMeeting + '">&#xe6b7;</div>' +
//							  '		<div class="voice" title="' + lang.dispatch.Mute + '">&#xe834;</div>' +
//							  '		<div class="mute" title="' + lang.dispatch.Unmute + '">&#xe66d;</div>' +
							  '</div>' +
							  '<div class="one-video-wrap">' + fn_genVideo('id_video_peer_' + sn,'100%','100%',false) + '</div></li>' +
							'<li dataid="1" videoType="my" id="V_' + masterNum + '" dataNum="' + masterNum + '" dataName="' + masterName + '">' +
							  '<div class="place">' +
							  '		<span class="icon">&#xe64b;</span>' +
							  '		<span class="id" style="color: white">' + masterNum + '</span>' +
							  '		<span class="name">' + masterName + '</span>' +
							  '</div>' +
							  '<div class="icon full-or-min full-screen active" title="' + lang.dispatch.fullScreen + '">&#xe69b;</div>' +
							  '<div class="icon full-or-min min-screen" title="' + lang.dispatch.reduction + '">&#xe698;</div>' +
							  '<div class="request-voice"></div>' +
							  '<div class="set">' +
							  '		<div title="' + lang.dispatch.videoParamSet + '" class="video-setting">&#xe601;</div>' +
//							  '		<div class="out" title="' + lang.dispatch.moveOutMeeting + '">&#xe6b7;</div>' +
//							  '		<div class="voice" title="' + lang.dispatch.Mute + '">&#xe834;</div>' +
//							  '		<div class="mute" title="' + lang.dispatch.Unmute + '">&#xe66d;</div>' +
							  '</div>' +
							  '<div class="one-video-wrap">' +
							  		fn_genVideo('id_video_my_' + sn,'100%','100%',true) +
							  		fn_genVideo('id_video_my_1_' + sn,'100%','100%',true,true) +
					//		  '		<video style="width:100%;height:100%;" id="id_video_my_' + sn + '" autoplay muted></video>' +
					//		  '		<video style="width:100%;height:100%;display:none;" id="id_video_peer_' + sn + '" autoplay></video>' +
							  '</div></li>' +
							  '<li dataid="2"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="3"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="4"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="5"><div class="one-video-wrap"></div></li>' +
							  '<li dataid="6"><div class="one-video-wrap"></div></li>' +
							  '</ul></div>';
		btnHtmlStr = '<div class="btn-wrap">' +
					  '	<div class="float-left icon">&#xe696; ' + lang.dispatch.durationMeeting + ': <span class="time">00:00:00</span></div>' +
					  '	<div class="float-right close">' + btnCloseTxt + '</div>' +
					  '	<div class="float-right shield"><span class="icon">&#xe834;</span>按住申请话权</div>' +
					  '</div>';
		leftLiHtml = '<li id="VCL_' + masterNum + '" dataNum="' + masterNum + '" dataName="' + masterName + '">' +
					  '	<div class="clearfix">' +
					  '		<div class="float-left img-wrap"><img src="/upload/headicon/' + masterNum + ".png?t=" + Math.random() + '" alt=""></div>' +
					  '		<div class="float-left">' +
					  '			<div class="name"><span class="icon"></span> ' + masterName + '</div>' +
					  '			<div class="id">' + masterNum + '</div>' +
					  '		</div>' +
					  '		<div class="float-right icon hover-blue go active">&#xe6b7;</div>' +
					  '		<div class="float-right icon hover-blue video">&#xe62d;</div>' +
					  '	</div>' +
					  '	<div class="small-video"></div></li>';
		addPersonHtml = '<div class="icon add-people"></div>';
    }
	// 创建视频会商对话框面板。
	var htmlStr = '<div id="interface-video-wrap" autoMic="on">' +
				  '  <div id="interface-video">' +
				  '      <div class="top-bar clearfix">' +
				  '	    	 <div class="float-right close icon">&#xe6c4;</div>' +
				  '	    	 <div class="float-right full-screen icon">&#xe6c5;</div>' +
	              '	    	 <div class="float-right minimum icon">&#xe6c3;</div>' +
				  '          <div class="float-left icon">&#xe64e; ' + lang.dispatch.videoConsultation + '</div>' +
				  '      </div>' +
				  '      <div class="content">' +
				  '          <div class="float-left">' +
				  '              <div class="top">' + lang.dispatch.listConferencePerson + '(<span id="memberSum">1</span>)</div>' +
				  '              <div class="ul-wrap"><ul>' + leftLiHtml + '</ul>' +
				  '              </div>' + addPersonHtml +
				  '          </div>' +
				  '          <div class="video-wrap">' + videoWinHtmlStr +
				  '              <div class="meeting-name">'+
				  '                  <div class="name">' + confParam.confName + '</div>' +
				  '                  <div class="describe">' + confParam.confTitle + '</div>' +
				  '              </div>' + btnHtmlStr +
				  '          </div></div></div>' +
				  '  <div class="video-gif"><img src="static/img/videoConfer.gif" alt=""></div></div>';
	$(document.body).append(htmlStr);
	// 设置所有视频列表的宽高与位置样式。
	window.top.setAllVideoLiSize = function () {
		var videoLiArr = $('#interface-video-wrap .video-wrap .video-window>ul>li');
		if (!videoLiArr || !videoLiArr.length || videoLiArr.length <= 0) return;
		var posSizeArr = [[0,0,0.6666,0.6666],[0,0,0,0],
			[0.6666,0,0.3333,0.3333],[0.6666,0.3333,0.3333,0.3333],
			[0.6666,0.6666,0.3333,0.3333],[0.3333,0.6666,0.3333,0.3333],
			[0,0.6666,0.3333,0.3333]]; //left,top,width,height
		for (var i = 0; i < videoLiArr.length; i ++) {
			var dataid = Number(videoLiArr.eq(i).attr('dataid'));
			if (dataid == 1) {
				videoLiArr.eq(i).css('display','none');
			} else {
				videoLiArr.eq(i).css('display','block');
			}
			videoLiArr.eq(i).css({
				left: parseInt(posSizeArr[dataid][0]*100)+'%',
    			top: parseInt(posSizeArr[dataid][1]*100)+'%',
    			width: parseInt(posSizeArr[dataid][2]*100)+'%',
    			height: parseInt(posSizeArr[dataid][3]*100)+'%'
			});
		}
	}
	setAllVideoLiSize();
	$('#interface-video-wrap').attr('confData',JSON.stringify(confParam));
	$('#interface-video-wrap').attr('startIndex',0);
	$('#interface-video-wrap').attr('endIndex',0);

	// 追加会议人员按钮点击事件。
	$('#interface-video-wrap .content .float-left .add-people').off("click").on('click', function () {
		var confParamStr = $('#interface-video-wrap').attr('confData');
	    var confParam = JSON.parse(confParamStr);
	    if (confParam.openType != 'main') return; //如果是加入视频会商，则不允许添加人员，直接返回。
		fn_commonUserAndGroupChoose({
    		title : '追加会议人员',
    		okFn : function(chooseData) {
    			if (chooseData && chooseData.length && chooseData.length > 0) {
    				for (var i = 0; i < chooseData.length; i ++) {
    					var toNum = chooseData[i].NUM;
    					//判断人员是否已在会议中，如果已在会议中，则跳过不做处理。
    					if ($("#interface-video>.content>.float-left .ul-wrap li[dataNum='" + toNum + "']").length <= 0) {
    						var m_CallRef = $('#interface-video-wrap').attr("callRef");
    						window.top.m_IdtApi.CallUserCtrl(m_CallRef, toNum, 1, 1, 0, 1, 0);
    					}
    				}
    			}
    		}
    	});
	});

	// 添加视频会商窗口标题拖拽移动功能。
	$('#interface-video .top-bar').off('mousedown').on('mousedown',function (event) {
        if (!$('#interface-video').hasClass('full-screen-active')) {
            var isMove = true;
            var abs_x = event.pageX - $('#interface-video').offset().left;
            var abs_y = event.pageY - $('#interface-video').offset().top;
            $(document).off('mousemove').on('mousemove',function (event) {
                if (isMove) {
                	$('#interface-video').css({
                        'right': document.documentElement.clientWidth - $('#interface-video').width() - (event.pageX - abs_x),
                        'top': event.pageY - abs_y,
                        'transform': 'translate(0, 0)'
                    });
                }
            }).off('mouseup').on('mouseup',function () {
                isMove = false;
            });
        }
    });

	//关闭或通出当前视频会商通用函数。
	function videoConfClose() {
		var confParamStr = $('#interface-video-wrap').attr('confData');
    	var callId = $('#interface-video-wrap').attr("callId");
    	var sn = $('#interface-video-wrap').attr("callSn");
	    var confParam = JSON.parse(confParamStr);
	    var promptMsg = lang.dispatch.sureWithdrawVideo;
	    if (confParam.openType == 'main') promptMsg = lang.dispatch.sureConcludeVideo;
    	$.messager.confirm(lang.dispatch.prompt,promptMsg,function(r) {
			if (r) {
				// 清空所有视频查看连接。
				var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
		    	for (var i = 0; i < $leftLi.length; i++) {
	    			var liObj = $leftLi.eq(i);
	    			var m_callId = liObj.attr("callId");
	             	var usrCtx = liObj.attr("sn");
	             	if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
		    	}
				var sh = $('#interface-video-wrap').attr("timeIntervalSn");
				if (sh) clearInterval(sh);
				// 解散或退出会议。
				window.top.m_IdtApi.CallRel(callId, sn, 0);
				window.top.activeCallInfo = false;
				if (confParam.openType == 'main') {
					// 删除会议组。
					window.top.m_IdtApi.GDel(confParam.groupInfo.GNum, function(bRes, cause, strCause, QueryRes) {});
				}
				$('#interface-video-wrap').remove();
			}
		});
	}
	// 左边参与视频会商人员列表的选中样式。
	window.top.vcl_leftLicLick = function () {
        var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
        $leftLi.off("click").on('click', function () {
            $leftLi.removeClass('active');
            $(this).addClass('active');
        });
    };
	// 整个视频会商窗口的全屏与还原。
    window.top.vcl_fullScreen = function () {
        $('#interface-video>.top-bar>.full-screen').off("click").on('click', function () {
            if (!$(this).hasClass('active')) {
                $('#interface-video').addClass('full-screen-active');
                $(this).html('&#xe6c6;');
                $(this).addClass('active');
            } else {
                $('#interface-video').removeClass('full-screen-active');
                $(this).html('&#xe6c5;');
                $(this).removeClass('active');
            }
        });
    };
	// 整个视频会商窗口的退出与关闭。
    window.top.vcl_close = function () {
        $('#interface-video>.top-bar>.close').off("click").on('click', function () {
        	videoConfClose();
        });
    };
    //右边视频窗口的选中样式切换。
    window.top.vcl_listExchange = function () {
    	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        $videoLi.off("click").on('click', '.one-video-wrap', function () {
            $videoLi.find('.one-video-wrap').removeClass('active');
            $(this).addClass('active');
        });
    };
    //整个视频会商窗口的最小化与还原。
    window.top.vcl_minum = function () {
        $('#interface-video .top-bar .minimum').off("click").on('click', function () {
            $('#interface-video').fadeOut(function () {
                $('#interface-video-wrap .video-gif').addClass('active');
            });
        });
        $('#interface-video-wrap .video-gif').off("click").on('click', function () {
            $('#interface-video-wrap .video-gif').removeClass('active');
            $('#interface-video').fadeIn();
        });
    };
    //右边单个视频窗口的最大化与还原。
    window.top.vcl_oneVideoFullOrMin = function () {
    	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        $videoLi.find('.full-screen').off("click").on('click', function () {
            $(this).removeClass('active');
            $(this).parent().addClass('full-active');
            $('#interface-video').addClass('full-active');
            $(this).parent().removeAttr('style');
            $(this).parent().find('.min-screen').addClass('active');
        });
        $videoLi.find('.min-screen').off("click").on('click', function () {
            $(this).removeClass('active');
            $('#interface-video').removeClass('full-active');
            $(this).parent().removeClass('full-active');
            $videoLi.find('.full-screen').addClass('active');
            setAllVideoLiSize();
        });
    };
    //右边视频会商窗口的话权控制。
    window.top.vcl_voiceMute = function () {
    	var confParamStr = $('#interface-video-wrap').attr('confData');
    	var confParam = JSON.parse(confParamStr);
    	if (confParam.openType != 'main') return; //如果是加入视频会商，则不允许进行话权控制，直接返回。
    	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        $videoLi.find('.voice').off("click").on('click', function () {
        	var $liObj = $(this).parent().parent();
        	var dataid = $liObj.attr('dataid');
        	var curNum = $liObj.attr('dataNum');
        	if (dataid == 0) {
        		prompt('warn', '主会场不允许进行话权操作。', 1000);
        		return;
        	} else {
				$(this).css('display', 'none');
				$(this).parent().find('.mute').css('display', 'block');
				var m_CallId = $('#interface-video-wrap').attr("callId");
				var sn = $('#interface-video-wrap').attr("callSn");
				window.top.m_IdtApi.CallConfCtrlReq(m_CallId, curNum, IDT.SRV_INFO_MICTAKE, 0xff);
				//同时变更左边人员列表中的话权状态。
				var $leftLiObj = $("#interface-video>.content>.float-left .ul-wrap li[dataNum='" + curNum + "']");
				if ($leftLiObj && $leftLiObj.length > 0) {
					$leftLiObj.find('.voice').html('&#xe66d;');
					$leftLiObj.find('.voice').attr('iconStr', '&#xe66d;');
				}
        	}
        });
        $videoLi.find('.mute').off("click").on('click', function () {
        	var $liObj = $(this).parent().parent();
        	var dataid = $liObj.attr('dataid');
        	var curNum = $liObj.attr('dataNum');
        	if (dataid == 0) {
        		prompt('warn', '主会场不允许进行话权操作。', 1000);
        		return;
        	} else {
        		$(this).css('display', 'none');
                $(this).parent().find('.voice').css('display', 'block');
				var m_CallId = $('#interface-video-wrap').attr("callId");
				var sn = $('#interface-video-wrap').attr("callSn");
				window.top.m_IdtApi.CallConfCtrlReq(m_CallId, curNum, IDT.SRV_INFO_MICGIVE, 1);
				//同时变更左边人员列表中的话权状态。
				var $leftLiObj = $("#interface-video>.content>.float-left .ul-wrap li[dataNum='" + curNum + "']");
				if ($leftLiObj && $leftLiObj.length > 0) {
					$leftLiObj.find('.voice').html('&#xe834;');
					$leftLiObj.find('.voice').attr('iconStr', '&#xe834;');
				}
        	}
        });
    };
    window.top.getVideoLiIndex = function (index) {
    	return $("#interface-video>.content>.video-wrap .video-window>ul>li[dataid='" + index + "']");
    }
    window.top.vcl_move = function () {
    	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
    	$videoLi.off("mousedown").on('mousedown', function () {
    		var startIndex = Number($(this).attr('dataid'));
    		$('#interface-video-wrap').attr('startIndex',startIndex);
    	});
    	$videoLi.off("mouseup").on('mouseup', function () {
    		var endIndex = Number($(this).attr('dataid'));
    		$('#interface-video-wrap').attr('endIndex',endIndex);
			var startIndex = Number($('#interface-video-wrap').attr('startIndex'));
			var endIndex = Number($('#interface-video-wrap').attr('endIndex'));
			if (startIndex == endIndex) return;
			if (startIndex >= endIndex) {
				var midIndex = startIndex;
				startIndex = endIndex;
				endIndex = midIndex;
			}
			var $start = getVideoLiIndex(startIndex);
    		var $end = getVideoLiIndex(endIndex);
    		var $second = getVideoLiIndex(1);
    		var confParamStr = $('#interface-video-wrap').attr('confData');
    		var confParam = JSON.parse(confParamStr);
    		if (confParam.openType != 'main' && startIndex == 0) return; //如果是加入视频会商，则不允许变更主会场，直接返回。
            if (startIndex === 0 && $end.find('video').length === 0) {
            	prompt('error', lang.dispatch.homeLocationNotEmpty, 1000);
            } else if (startIndex == 0 ) { // 变更主会场。
        		var m_CallId = $('#interface-video-wrap').attr("callId");
    			var sn = $('#interface-video-wrap').attr("callSn");
        		var masterNum = window.userInfo.userInfo.num;
        		var startNum = getVideoLiIndex(startIndex).attr('dataNum');
        		var startName = getVideoLiIndex(startIndex).attr('dataName');
        		var endNum = getVideoLiIndex(endIndex).attr('dataNum');
        		var endName = getVideoLiIndex(endIndex).attr('dataName');
        		var secondNum = getVideoLiIndex(1).attr('dataNum');
        		//挂断当前的视频查看窗口。
        		if (endNum != masterNum) {
        			var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
        	    	for (var i = 0; i < $leftLi.length; i++) {
        	    		var num = $leftLi.eq(i).attr('id').substring(4);
        	    		if (num == endNum) {
        	    			//关闭视频查看连接信息。
        	    			var liObj = $leftLi.eq(i);
        	    			var m_callId = liObj.attr("callId");
        	             	var usrCtx = liObj.attr("sn");
        	             	liObj.attr("callId",'');
        	             	liObj.attr("sn",'');
        	             	if ((m_callId || m_callId == 0) && (m_callId != '')) window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
        	    		}
        	    	}
        		}
        		window.top.m_IdtApi.CallConfCtrlReq(m_CallId, endNum, IDT.SRV_INFO_MICGIVE, 0);
    			if (startNum == masterNum) {
    				//添加上相关的视频操作元素。
    				var htmlStr = '<div class="place">\n' +
    				'              <span class="icon">&#xe64b;</span>\n' +
    				'              <span class="id" style="color: white">'+ endNum +'</span>\n' +
    				'              <span class="name">'+ endName +'</span>\n' +
    				'          </div>\n' +
    				'          <div class="icon full-or-min full-screen active" title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>\n' +
    				'          <div class="icon full-or-min min-screen" title="'+lang.dispatch.reduction+'">&#xe698;</div>\n' +
    				'          <div class="set">\n' +
    				'              <div title="'+lang.dispatch.videoParamSet+'" class="video-setting">&#xe601;</div>\n' +
    				'              <div class="out" title="'+lang.dispatch.moveOutMeeting+'">&#xe6b7;</div>\n' +
    				'              <div class="voice" title="'+lang.dispatch.Mute+'">&#xe834;</div>\n' +
    				'              <div class="mute" title="'+lang.dispatch.Unmute+'">&#xe66d;</div>\n' +
    				'          </div>\n';
    				$second.find('.place').remove();
    				$second.find('.set').remove();
    				$second.find('.full-or-min').remove();
    				$second.append(htmlStr);
    				$second.attr('dataNum',endNum);
    				$second.attr('dataName',endName);
    				$end.find('.place').remove();
    				$end.find('.set').remove();
    				$end.find('.full-or-min').remove();
    				$second.attr('dataid',startIndex);
    				$end.attr('dataid',1);
    				$start.attr('dataid',endIndex);
            		setAllVideoLiSize();
    			} else if (endNum == masterNum) {
    				var htmlStr = '<div class="place" title="'+lang.dispatch.mainVenue+'">\n' +
    				'              <span class="icon">&#xe64b;</span>\n' +
    				'              <span class="id" style="color: white">'+ startNum +'</span>\n' +
    				'              <span class="name">'+ startName +'</span>\n' +
    				'          </div>\n' +
    				'          <div class="icon full-or-min full-screen active" title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>\n' +
    				'          <div class="icon full-or-min min-screen" title="'+lang.dispatch.reduction+'">&#xe698;</div>\n' +
    				'          <div class="set">\n' +
    				'              <div title="'+lang.dispatch.videoParamSet+'" class="video-setting">&#xe601;</div>\n' +
    				'              <div class="out" title="'+lang.dispatch.moveOutMeeting+'">&#xe6b7;</div>\n' +
    				'              <div class="voice" title="'+lang.dispatch.Mute+'">&#xe834;</div>\n' +
    				'              <div class="mute" title="'+lang.dispatch.Unmute+'">&#xe66d;</div>\n' +
    				'          </div>\n';
    				$second.find('.place').remove();
    				$second.find('.set').remove();
    				$second.find('.full-or-min').remove();
    				$second.append(htmlStr);
    				$second.attr('dataNum',startNum);
    				$second.attr('dataName',startName);
    				$second.find('.one-video-wrap').remove();
    				// 创建视频会商面板。
    				htmlStr = '<div class="one-video-wrap">\n' +
		    							fn_genVideo('VCL_VV_'+startNum,'100%','100%',false) +
		    						//'  <video style="width:100%;height:100%;" id="VCL_VV_' + id + '" autoplay></video>\n' +
	    							'</div>';
    				$second.append(htmlStr);
                    // 发起视频查看请求到会场视频窗。
                    var peerVideo = $('#VCL_VV_' + startNum)[0];
                    // 创建通讯序号。
                	var sn = 'VCL_VV_' + fn_genSn();
                	// 发起视频查看请求。
                	var m_CallId = window.m_IdtApi.CallMakeOut(sn, null, peerVideo, 0, 0, 1, 0, startNum, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
                	var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
        	    	for (var i = 0; i < $leftLi.length; i++) {
        	    		var num = $leftLi.eq(i).attr('id').substring(4);
        	    		if (num == startNum) {
        	    			//关闭视频查看连接信息。
        	    			var liObj = $leftLi.eq(i);
        	    			liObj.find('.go').html('&#xe6b7;');
        	    			liObj.find('.go').addClass('active');
                    		liObj.attr("callId", m_CallId);
                    		liObj.attr("sn", sn);
        	    		}
        	    	}
        	    	$start.find('.place').remove();
        	    	$start.find('.set').remove();
        	    	$start.find('.full-or-min').remove();
        	    	$end.attr('dataid', startIndex);
        	    	$start.attr('dataid', 1);
        	    	$second.attr('dataid', endIndex);
    				setAllVideoLiSize();
    			} else {
    				var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
        	    	for (var i = 0; i < $leftLi.length; i++) {
        	    		var num = $leftLi.eq(i).attr('id').substring(4);
        	    		if (num == startNum) {
        	    			//关闭视频查看连接信息。
        	    			var liObj = $leftLi.eq(i);
        	    			var m_callId = liObj.attr("callId");
        	             	var usrCtx = liObj.attr("sn");
        	             	liObj.attr("callId",'');
        	             	liObj.attr("sn",'');
        	             	if ((m_callId || m_callId == 0) && (m_callId != '')) window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
        	    		}
        	    	}
    				$start.find('.place>.id').html(endNum);
    				$start.find('.place>.name').html(endName);
    				$start.attr('dataNum',endNum);
    				$start.attr('dataName',endName);
    				$end.find('.place>.id').html(startNum);
    				$end.find('.place>.name').html(startName);
    				$end.attr('dataNum',startNum);
    				$end.attr('dataName',startName);
    				$end.find('.one-video-wrap').remove();
    				// 创建视频会商面板。
    				var htmlStr = '<div class="one-video-wrap">\n' +
		    							fn_genVideo('VCL_VV_'+startNum,'100%','100%',false) +
		    						//'  <video style="width:100%;height:100%;" id="VCL_VV_' + id + '" autoplay></video>\n' +
	    							'</div>';
    				$end.append(htmlStr);
                    // 发起视频查看请求到会场视频窗。
                    var peerVideo = $('#VCL_VV_' + startNum)[0];
                    // 创建通讯序号。
                	var sn = 'VCL_VV_' + fn_genSn();
                	// 发起视频查看请求。
                	var m_CallId = window.m_IdtApi.CallMakeOut(sn, null, peerVideo, 0, 0, 1, 0, startNum, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
                	var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
        	    	for (var i = 0; i < $leftLi.length; i++) {
        	    		var num = $leftLi.eq(i).attr('id').substring(4);
        	    		if (num == startNum) {
        	    			//关闭视频查看连接信息。
        	    			var liObj = $leftLi.eq(i);
        	    			liObj.find('.go').html('&#xe6b7;');
        	    			liObj.find('.go').addClass('active');
                    		liObj.attr("callId", m_CallId);
                    		liObj.attr("sn", sn);
        	    		}
        	    	}
    			}
        	} else { // 变更视频显示顺序.
        		$end.attr('dataid', startIndex);
        		$start.attr('dataid', endIndex);
        		setAllVideoLiSize();
        	}
        	vcl_videoInterfaceInit();
			vcl_judgeHost();
    	});
    };
    // 发送会议链接。
    function sendConfIm(toUserNum) {
    	var confParamStr = $('#interface-video-wrap').attr('confData');
	    var confParam = JSON.parse(confParamStr);
        var strTo = confParam.groupInfo.GNum;
        var strFrom = window.userInfo.userInfo.num;
        if (!toUserNum || toUserNum == '') toUserNum = strTo;
        var curTime = new Date();
    	curTime = curTime.Format('yyyy-MM-dd HH:mm:ss');
        var subParaJson = {
        		"accept": false,
        		"content": '会议开始通知, 点击加入',
        		"desc": '调度员发起组会议:',
        		"meetId": strTo,
        		"number": strTo,
        		"time": curTime,
        		"title": '',
        		"type": 2,
        		"meetName": confParam.confName,
        		"meetTitle": confParam.confTitle
        }
        var imJson = {
        		"fromDesc" : strFrom,
        		"fromNumber" : strFrom,
        		"subPara" : JSON.stringify(subParaJson),
        		"toDesc" : '',
        		"toNumber" : strTo,
        		"type": 0
        }
        var strText = JSON.stringify(imJson);
        var IMSendSn = fn_genSn();
        window.top.m_IdtApi.IMSend(IMSendSn, IDT.IM_TYPE_CONF, toUserNum, strText, null, null);
    }
    window.top.vcl_btnFunction = function () {
    	var $videoBtn = $('#interface-video>.content>.video-wrap>.btn-wrap');
    	$videoBtn.find('.shield').off('mousedown').on('mousedown',function () { //申请话权。
    		var m_CallId = $('#interface-video-wrap').attr("callId");
			var sn = $('#interface-video-wrap').attr("callSn");
			$(this).addClass('active');
			window.m_IdtApi.CallMicCtrl(m_CallId, true);
    	});
    	$videoBtn.find('.shield').off('mouseup mouseleave').on('mouseup mouseleave',function () { //释放话权。
    		var m_CallId = $('#interface-video-wrap').attr("callId");
			var sn = $('#interface-video-wrap').attr("callSn");
			$(this).removeClass('active');
			window.m_IdtApi.CallMicCtrl(m_CallId, false);
    	});
		$videoBtn.find('.open').off("click").on('click', function () { // 当前禁止全员发言，点击后切换为开放全员发言(组呼抢话权模式)
			var callId = $('#interface-video-wrap').attr("callId");
	    	window.top.m_IdtApi.CallConfCtrlReq(callId, null, IDT.SRV_INFO_AUTOMICON, 1);
	    	$('#interface-video-wrap').attr("autoMic",'on');
			$(this).css('display', 'none');
			$videoBtn.find('.stop').css('display', 'block');
			//左边人员列表除了主会场之外麦均设为发言状态。
			var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
			$leftLi.find('.voice').html('&#xe834;');
			//中间视频窗口除了主会场之外麦均设为禁言状态。
			var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
			$videoLi.find('.set .voice').css('display', 'block');
			$videoLi.find('.set .mute').css('display', 'none');
		});
		$videoBtn.find('.stop').off("click").on('click', function () { // 当前开放全员发言，点击后切换为禁止全员发言(话权由会议主持人分配模式)
			var callId = $('#interface-video-wrap').attr("callId");
	    	window.top.m_IdtApi.CallConfCtrlReq(callId, null, IDT.SRV_INFO_AUTOMICOFF, 1);
	    	$('#interface-video-wrap').attr("autoMic",'off');
			$(this).css('display', 'none');
			$videoBtn.find('.open').css('display', 'block');
			//中间视频窗口除了主会场之外麦均设为禁言状态。
			var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
			$videoLi.find('.set .voice').css('display', 'none');
			$videoLi.find('.set .mute').css('display', 'block');
			var $mainPlace = getVideoLiIndex(0);
			$mainPlace.find('.set .voice').css('display', 'block');
			$mainPlace.find('.set .mute').css('display', 'none');
			var mainNum = $mainPlace.attr('dataNum');
			//左边人员列表除了主会场之外麦均设为禁言状态。
			var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
			$leftLi.find('.voice').html('&#xe66d;');
			$leftLi.find('.voice').attr('iconStr', '&#xe66d;');
	    	for (var i = 0; i < $leftLi.length; i++) {
	    		var num = $leftLi.eq(i).attr('id').substring(4);
	    		if (num == mainNum) {
	    			//关闭视频查看连接信息。
	    			var liObj = $leftLi.eq(i);
	    			liObj.find('.voice').html('&#xe834;');
	    			liObj.find('.voice').attr('iconStr', '&#xe834;');
	    		}
	    	}
		});
		$videoBtn.find('.sendConfIm').off("click").on('click', function () { // 发送会议通知
			sendConfIm();
		});
		$videoBtn.find('.close').off("click").on('click', function () { // 结束或通出视频会商
			videoConfClose();
		});
    };
    //判断右边视频窗口中是否有视频，从而切换显示样式。
    window.top.vcl_isNoVideo = function () {
        var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        $.each($videoLi, function () {
            if ($(this).find('video').length <= 0) {
                $(this).addClass('none-video');
            } else {
                $(this).removeClass('none-video');
            }
        });
    };
    //切换左边人员列表的主会场图标显示样式。
    window.top.vcl_judgeHost = function () {
        var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        //去除所有左边列表的主次视频状态。
        $('#interface-video>.content>.float-left .ul-wrap li').find('.name .icon').html('');
        $.each($videoLi, function () {
            var mainId = '', otherId = '';
            if (Number($(this).attr('dataid')) === 0) {
                $(this).find('.place .icon').html('&#xe695;');
                $(this).find('.out').css('display', 'none');
                mainId =$(this).find('.place .id').text();
                $.each($('#interface-video>.content>.float-left .ul-wrap li'), function () {
                    var thisId = $(this).find('.id').text();
                    if (thisId === mainId) {
                        $(this).find('.name .icon').html('&#xe695;');
                    }
                });
            } else {
                $(this).find('.place .icon').html('&#xe64b;');
                $(this).find('.out').css('display', 'block');
                otherId =$(this).find('.place .id').text();
                $.each($('#interface-video>.content>.float-left .ul-wrap li'), function () {
                    var thisId = $(this).find('.id').text();
                    if (thisId === otherId) {
                        $(this).find('.name .icon').html('&#xe64b;');
                    }
                });
            }
        });
    };
    //右边视频窗口中视频的移出事件。
    window.top.vcl_videoOut = function () {
        $('#interface-video>.content>.video-wrap .video-window>ul>li .set .out').off("click").on('click', function () {
            var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
            var $curLi = $(this).parent().parent();
            var curNum = $curLi.attr('dataNum');
            var dataid = $curLi.attr('dataid');
            var masterNum = window.userInfo.userInfo.num;
    		var confParamStr = $('#interface-video-wrap').attr('confData');
    	    var confParam = JSON.parse(confParamStr);
    		if (dataid == 0 || curNum == masterNum) {
    			prompt('warn', '主会场人员、会议主持人、以及当前登陆用户的视频不允许移出。', 1000);
    			return;
    		}
            var id = $curLi.find('.place .id').text();
            $curLi.empty();
            $curLi.append('<div class="one-video-wrap"></div>');
            $curLi.addClass('none-video');
            // 取消全屏样式。
            $('#interface-video').removeClass('full-active');
            $curLi.removeClass('full-active');
            setAllVideoLiSize();
            // 变更右边人员列表中的视频查看按钮状态与属性。
            $.each($('#interface-video>.content>.float-left .ul-wrap li'), function () {
                var thisId = $(this).find('.id').text();
                if (thisId === id) {
                	var liObj = $(this);
                	var m_callId = liObj.attr("callId");
                	var usrCtx = liObj.attr("sn");
                	liObj.attr("callId", '');
            		liObj.attr("sn", '');
            		if (!usrCtx) usrCtx = '';
            		if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
                    $(this).find('.name .icon').html('');
                    $(this).find('.go').html('&#xe6b8;').removeClass('active');
                }
            });
            vcl_isNoVideo();
            vcl_move();
        });
    };
    //视频分辨率配置按钮点击弹窗事件。
    window.top.vcl_videoCondfig = function () {
       $('#interface-video .video-setting').on('click',function () {
		   $('.video-setting-dialog').dialog({
	            title: lang.dispatch.videoParamSet,
	            width: 288,
	            height: 265,
	            closed: false,
	            cache: false,
	            modal: true
	        });
	    });
    };
    window.top.vcl_videoInterfaceInit = function () {
    	vcl_isNoVideo();                   // 根据调用视频的数目分出有无video的li
    	vcl_listExchange();                // 点击选择会场中的视频
    	vcl_oneVideoFullOrMin();           // 单个视频最大化还原
    	vcl_close();					   // 退出或解散整个视频会商
    	vcl_voiceMute();                   // 视频静音
    	vcl_btnFunction();                 // 会场发言模式切换、发送会议通知、退出或解散视频会商等功能按钮点击事件。
    	vcl_judgeHost();                   // 根据右边视频的主次场，判断左边列表的icon
    	vcl_videoOut();                    // 视频移出会场
    	vcl_videoCondfig();                // 视频参数设置弹窗
    	vcl_leftLicLick();                 // 左边栏li的click效果
    };
    fn_initVCLEvent();					// 左边人员列表初始化。
    vcl_move();                        	// 视频拖拽
    vcl_fullScreen();                  	// 全屏还原
    vcl_minum();                       	// 视频会商最小化
    vcl_videoInterfaceInit();
    window.top.vcl_appendVideo = function (name, id) {
//        var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
    	var confParamStr = $('#interface-video-wrap').attr('confData');
    	var confParam = JSON.parse(confParamStr);
        var noVideoLength = $("#interface-video>.content>.video-wrap .video-window>ul>.none-video").length;
        var $leftLiObj = $("#interface-video>.content>.float-left .ul-wrap li[dataNum='" + id + "']");
		if ($leftLiObj && $leftLiObj.length > 0) {
			var iconStr = $leftLiObj.find('.voice').attr('iconStr');
			var content = '<div class="place" title="'+lang.dispatch.mainVenue+'">\n' +
			'              <span class="icon">&#xe64b;</span>\n' +
			'              <span class="id" style="color: white">'+ id +'</span>\n' +
			'              <span class="name">'+ name +'</span>\n' +
			'          </div>\n' +
			'          <div class="icon full-or-min full-screen active" title="'+lang.dispatch.fullScreen+'">&#xe69b;</div>\n' +
			'          <div class="icon full-or-min min-screen" title="'+lang.dispatch.reduction+'">&#xe698;</div>\n' +
			'          <div class="set">\n' +
			'              <div title="'+lang.dispatch.videoParamSet+'" class="video-setting">&#xe601;</div>\n' +
			'              <div class="out" title="'+lang.dispatch.moveOutMeeting+'">&#xe6b7;</div>\n' +
			'              <div class="voice" title="'+lang.dispatch.Mute+'">&#xe834;</div>\n' +
			'              <div class="mute" title="'+lang.dispatch.Unmute+'">&#xe66d;</div>\n' +
			'          </div>\n' +
			'          <div class="one-video-wrap">\n' +
							fn_genVideo('VCL_VV_'+id,'100%','100%',false) +
//          '              <video style="width:100%;height:100%;" id="VCL_VV_' + id + '" autoplay></video>\n' +
			'          </div>';
			if (noVideoLength > 0) {
				for (var i = 2; i < 7; i ++) {
					var $videoLi = getVideoLiIndex(i);
					if ($videoLi.find('video').length === 0) {
						$videoLi.html(content);
						$videoLi.attr('dataNum',id);
						$videoLi.attr('dataName',name);
						if (confParam.openType != 'main') { //加入视频会商，则不允许进行话权操作。
							$videoLi.find('.voice').css('display', 'none');
							$videoLi.find('.mute').css('display', 'none');
						} else {
							if (iconStr == '&#xe66d;') { //禁言
								$videoLi.find('.voice').css('display', 'none');
								$videoLi.find('.mute').css('display', 'block');
							} else { //允许发言
								$videoLi.find('.voice').css('display', 'block');
								$videoLi.find('.mute').css('display', 'none');
							}
						}
						$('#interface-video>.content>.video-wrap .video-window>ul>li .set .out').off('click');
						vcl_videoInterfaceInit();
						break;
					}
				}
			} else {
				prompt('warn', lang.dispatch.videoAllowedSameTime, 1000);
			}
		}
    };
    // 开始会议。
    var myVideo = $('#id_video_my_' + sn)[0];
	var peerVideo = $('#id_video_peer_' + sn)[0];
	var callId;
	if (confParam.openType == 'main') { //创建视频会商。
		callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 1, 1, confParam.groupInfo.GNum, IDT.SRV_TYPE_CONF, "", 0, 0);
		sendConfIm(); //只有创建视频会商才能发出会议链接的即时消息。
    } else { //加入视频会商。
    	callId = window.top.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 1, 1, 1, confParam.groupInfo.GNum, IDT.SRV_TYPE_CONF_JOIN,  "", 0, 0);
    }
	$('#interface-video-wrap').attr("callId", callId);
	$('#interface-video-wrap').attr("callSn", sn);
	window.top.activeCallInfo = true;
    // 定时查询会议状态（已加入会议的人员）以及会议持续的时间。
	var sh = $('#interface-video-wrap').attr("timeIntervalSn");
	if (sh) clearInterval(sh);
    sh = setInterval(userAndTimeRefresh, 1000);
    $('#interface-video-wrap').attr("timeIntervalSn", sh);
	function userAndTimeRefresh() {
		var confParamStr = $('#interface-video-wrap').attr('confData');
		if (!confParamStr || confParamStr == '') return;
	    var confParam = JSON.parse(confParamStr);
		window.top.m_IdtApi.CallConfStatusReq(confParam.groupInfo.GNum, fn_genSn());
		var curTimeStr = $('#interface-video-wrap').find(".time").text();
		var timeArr = curTimeStr.split(":");
		if (timeArr.length && timeArr.length == 3) {
			var hour   = Number(timeArr[0]);
			var minute = Number(timeArr[1]);
			var second = Number(timeArr[2]);
			var timeNum = hour * 3600 + minute * 60 + second + 1;
			hour   = Math.floor(timeNum / 3600);
			minute = Math.floor((timeNum % 3600) / 60);
			second = timeNum % 60;
			var timeStr = '';
			if (hour < 10) {
				timeStr = '0' + hour + ':';
			} else {
				timeStr = hour + ':';
			}
			if (minute < 10) {
				timeStr = timeStr + '0' + minute + ':';
			} else {
				timeStr = timeStr + minute + ':';
			}
			if (second < 10) {
				timeStr = timeStr + '0' + second;
			} else {
				timeStr = timeStr + second;
			}
			$('#interface-video-wrap').find(".time").text(timeStr);
		} else {
			$('#interface-video-wrap').find(".time").text('00:00:00');
		}
	}
}

// 刷新视频会商人员列表。
function fn_refreshVideoConfUserList(resObj) {
	if ($('#interface-video-wrap').length <= 0) return;
	var confParamStr = $('#interface-video-wrap').attr('confData');
	if (!confParamStr || confParamStr == '') return;
    var confParam = JSON.parse(confParamStr);
    if (resObj && resObj.GMember && resObj.GMember.length > 0) {
    	// 变更会议成员总数量信息。
        $('#interface-video-wrap #memberSum').html(resObj.GMember.length);
    	// 删除现在没有的。
    	var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
    	for (var i = 0; i < $leftLi.length; i++) {
    		var num = $leftLi.eq(i).attr('id').substring(4);
    		if (isArrayExist(num, resObj.GMember, 'Num') == false) {
    			//关闭视频查看连接信息。
    			var liObj = $('#interface-video>.content>.float-left .ul-wrap').find('#VCL_'+num);
    			var m_callId = liObj.attr("callId");
             	var usrCtx = liObj.attr("sn");
             	if ((m_callId || m_callId == 0) && (m_callId != '')) window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
             	//去除右边视频窗口中的该终端信息。
             	$.each($('#interface-video>.content>.video-wrap .video-window>ul>li'), function () {
 					var thisId = $(this).find('.place .id').text();
 					if (thisId === num) {
 						$(this).empty();
 						$(this).append('<div class="one-video-wrap"></div>');
 						$(this).addClass('none-video');
 						// 取消全屏样式。
 			            $('#interface-video').removeClass('full-active');
 			            $(this).removeClass('full-active');
 			            setAllVideoLiSize();
 					}
                });
    			$('#interface-video>.content>.float-left .ul-wrap').find('#VCL_'+num).remove();
    			$('#interface-video>.content>.video-wrap .video-window').find('#V_'+num).remove();
    		}
    	}
    	// 添加现在多余的。
    	var autoMic = $('#interface-video-wrap').attr("autoMic");
    	var voiceHtml = '', closeHtml = '';
    	if (!autoMic || autoMic == '' || autoMic != 'off') {
    		autoMic = 'on';
    		voiceHtml = '<div class="float-right icon hover-blue voice" iconStr="xe834">&#xe834;</div>';
    	} else {
    		autoMic = 'off';
    		voiceHtml = '<div class="float-right icon hover-blue voice" iconStr="xe66d">&#xe66d;</div>';
    	}
    	//加入视频会商，则不允许进行话权操作。
    	if (confParam.openType != 'main') {
    		voiceHtml = '';
    		closeHtml = '';
    	} else {
    		closeHtml = '<div class="float-right icon close">&#xe689;</div>';
    	}
    	var htmlStr = '';
    	for (var i = 0; i < resObj.GMember.length; i ++) {
    		var num = resObj.GMember[i].Num;
    		var name = resObj.GMember[i].Name;
    		if (!name || name == '') name = getNameByNum(num, confParam.groupMember);
    		if (!name || name == '') name = num;
    		if ($('#interface-video>.content>.float-left .ul-wrap').find('#VCL_'+num).length > 0) continue;
    		htmlStr += '<li id="VCL_' + num + '" dataNum="' + num + '" dataName="' + name + '">' +
						  '  <div class="clearfix">' +
						  '  	<div class="float-left img-wrap"><img src="/upload/headicon/' + num + ".png?t=" + Math.random() + '" alt=""></div>' +
						  '  	<div class="float-left">' +
						  '  		<div class="name"><span class="icon"></span> ' + name + '</div>' +
						  '  		<div class="id">' + num + '</div>' +
						  '  	</div>' + closeHtml +
						  '  	<div class="float-right icon hover-blue go">&#xe6b8;</div>' +
						  '  	<div class="float-right icon hover-blue video">&#xe62d;</div>' + voiceHtml +
						  '  </div>' +
						  '	 <div class="small-video"></div>' +
						  '</li>';
    	}
    	$('#interface-video>.content>.float-left .ul-wrap>ul').append(htmlStr);
    	fn_initVCLEvent();
    } else {
    	// 变更会议成员总数量信息。
        $('#interface-video-wrap #memberSum').html(0);
    }
}

// 视频会商左边列表相关事件初始化。
function fn_initVCLEvent() {
	var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
  	// 左边列表的语音话权操作。
	$leftLi.find('.voice').off("click").on('click', function () {
		var confParamStr = $('#interface-video-wrap').attr('confData');
		var confParam = JSON.parse(confParamStr);
		if (confParam.openType != 'main') return; //如果是加入视频会商，则不允许进行话权操作，直接返回。
		//如果是主会场，则提示不允许变更话权。
		var $mainPlace = getVideoLiIndex(0);
		var mainNum = getVideoLiIndex(0).attr('dataNum');
		var curNum = $(this).parent().parent().attr('id').substring(4);
		if (curNum == mainNum) {
			$(this).html('&#xe834;');
            $(this).attr('iconStr', '&#xe834;');
			prompt('warn', '主会场不允许进行话权操作。', 1000);
			return;
		}
		var m_CallId = $('#interface-video-wrap').attr("callId");
		var sn = $('#interface-video-wrap').attr("callSn");
		var iconStr = $(this).attr('iconStr');
		if (!iconStr || iconStr == '') iconStr = '&#xe834;';
        if (iconStr == '&#xe66d;') { //当前是禁言，则开启发言。
            $(this).html('&#xe834;');
            $(this).attr('iconStr', '&#xe834;');
            window.top.m_IdtApi.CallConfCtrlReq(m_CallId, curNum, IDT.SRV_INFO_MICGIVE, 1);
            //变更右边视频窗口中对象的话权状态。
            var $videoLiObj = $("#interface-video>.content>.video-wrap .video-window>ul>li[dataNum='" + curNum + "']");
            if ($videoLiObj && $videoLiObj.length > 0) {
            	$videoLiObj.find('.voice').css('display','block');
            	$videoLiObj.find('.mute').css('display','none');
            }
        } else { //当前开启发言，则禁言。
            $(this).html('&#xe66d;');
            $(this).attr('iconStr', '&#xe66d;');
            window.top.m_IdtApi.CallConfCtrlReq(m_CallId, curNum, IDT.SRV_INFO_MICTAKE, 0xff);
            //变更右边视频窗口中对象的话权状态。
            var $videoLiObj = $("#interface-video>.content>.video-wrap .video-window>ul>li[dataNum='" + curNum + "']");
            if ($videoLiObj && $videoLiObj.length > 0) {
            	$videoLiObj.find('.voice').css('display','none');
            	$videoLiObj.find('.mute').css('display','block');
            }
        }
    });
	// 人员从会场中移出。
	$leftLi.find('.close').off("click").on('click', function () {
		var liObj = $(this).parent().parent();
  		// 取出当前人员号码与名称。
        var num = liObj.attr('dataNum');
        var name = liObj.attr('dataName');
        // 需判断该人员是否是主会场，如果是主会场，则不允许移出。
        var $mainPlace = getVideoLiIndex(0);
		var mainNum = getVideoLiIndex(0).attr('dataNum');
		var masterNum = window.userInfo.userInfo.num;
		var confParamStr = $('#interface-video-wrap').attr('confData');
	    var confParam = JSON.parse(confParamStr);
	    if (confParam.openType != 'main') return; //如果是加入视频会商，则不允许进行人员从会场中的踢出操作，直接返回。
		if (num == mainNum || num == masterNum) {
			prompt('warn', '主会场人员、会议主持人、以及当前登陆用户不允许踢出会场。', 1000);
			return;
		}
        // 判断该人员是否查看了其视频，如果查看了，则需要关闭相关查看的视频。
		var m_callId = liObj.attr("callId");
    	var usrCtx = liObj.attr("sn");
    	liObj.attr("callId", '');
		liObj.attr("sn", '');
		if (!usrCtx) usrCtx = '';
		if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
		// 会场中视频窗口的处理。
		var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li[dataNum="' + num + '"]');
		$videoLi.empty().append('<div class="one-video-wrap"></div>').addClass('none-video');
        // 移出该人员。
		var m_CallRef = $('#interface-video-wrap').attr("callRef");
		window.top.m_IdtApi.CallUserCtrl(m_CallRef, num, 0, 0, 0, 0, 0);
	});
	// 左边列表的视频展开收回
  	$leftLi.find('.video').off("click").on('click', function () {
  		var liObj = $(this).parent().parent();
  		// 取出当前人员号码与名称。
        var num = liObj.attr('dataNum');
        var name = liObj.attr('dataName');
        if (!$(this).hasClass('active')) {
        	var isExsitVideo = false;
        	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
        	$.each($videoLi, function () {
    			if ($(this).find('video').length != 0) {
    				if (num == $(this).attr('dataNum')) isExsitVideo = true;
    			}
    		});
        	if (isExsitVideo == true) {
        		prompt('error',"该对象已在右边视频窗口中，不允许重复查看视频。",1000);
        		return;
        	}
            $(this).addClass('active');
            liObj.animate({height: 180});
            // 创建视频查看控件。
            var videoHtmlStr = fn_genVideo('VCL_LV_'+num,'100%','100%',false);
//            var videoHtmlStr = '<video style="width:100%;height:100%;" id="VCL_LV_' + num + '" autoplay></video>';
            liObj.find('.small-video').append(videoHtmlStr);
            var peerVideo = $('#VCL_LV_' + num)[0];
            // 创建通讯序号。
        	var sn = 'VCL_LV_' + fn_genSn();
        	// 发起视频查看请求。
        	var m_CallId = window.m_IdtApi.CallMakeOut(sn, null, peerVideo, 0, 0, 1, 0, num, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
        	if (m_CallId == -1) { // 视频查看失败。
				prompt('error',"视频查看失败，请稍后再试。",1000);
				$('#VCL_LV_' + num).remove();
				liObj.animate({height: 50});
        	} else {
				liObj.attr("callId", m_CallId);
				liObj.attr("sn", sn);
        	}
        } else {
            $(this).removeClass('active');
            liObj.find('.small-video').html('');
            liObj.animate({height: 50});
            // 关闭视频查看通讯。
            var m_callId = liObj.attr("callId");
        	var usrCtx = liObj.attr("sn");
        	liObj.attr("callId", '');
    		liObj.attr("sn", '');
    		if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
        }
    });
  	// 视频的移入移出
	$leftLi.find('.go').off("click").on('click', function () {
		var liObj = $(this).parent().parent();
  		// 取出当前人员号码与名称。
        var num = liObj.attr('dataNum');
        var name = liObj.attr('dataName');
        // 主会场的视频，以及会议主持人的视频，不允许进行移入移出操作。
        var $mainPlace = getVideoLiIndex(0);
		var mainNum = getVideoLiIndex(0).attr('dataNum');
		var masterNum = window.userInfo.userInfo.num;
		var confParamStr = $('#interface-video-wrap').attr('confData');
	    var confParam = JSON.parse(confParamStr);
		if (num == mainNum || num == masterNum) {
			prompt('warn', '主会场人员、会议主持人、以及当前登陆用户的视频不允许移出。', 1000);
			return;
		}
        if (!$(this).hasClass('active')) {
            if ($("#interface-video>.content>.video-wrap .video-window>ul>.none-video").length > 0) {
                if (liObj.find('video').length > 0) {
                	liObj.find('.small-video').html('');
                    liObj.animate({height: 50});
                    // 关闭视频查看通讯。
                    var m_callId = liObj.attr("callId");
                	var usrCtx = liObj.attr("sn");
                	liObj.attr("callId", '');
            		liObj.attr("sn", '');
            		if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
            		liObj.find('.video').removeClass('active');
                }
                // 创建视频会商面板。
                vcl_appendVideo(name, num);
                vcl_judgeHost();
                // 发起视频查看请求到会场视频窗。
                var peerVideo = $('#VCL_VV_' + num)[0];
                // 创建通讯序号。
            	var sn = 'VCL_VV_' + fn_genSn();
            	// 发起视频查看请求。
            	var m_CallId = window.m_IdtApi.CallMakeOut(sn, null, peerVideo, 0, 0, 1, 0, num, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
        		$(this).html('&#xe6b7;');
                $(this).addClass('active');
        		liObj.attr("callId", m_CallId);
        		liObj.attr("sn", sn);
            } else {
            	prompt('warn', lang.dispatch.videoAllowedSameTime, 1000);
            }
        } else {
           if ($('#interface-video>.content>.video-wrap .video-window>ul video').length > 1) {
               $(this).html('&#xe6b8;');
               $(this).removeClass('active');
               var id =$(this).parent().parent().find('.id').text();
               $.each($('#interface-video>.content>.video-wrap .video-window>ul>li'), function () {
					var thisId = $(this).find('.place .id').text();
					if (thisId === id) {
						// 关闭视频查看通讯。
						var m_callId = liObj.attr("callId");
						var usrCtx = liObj.attr("sn");
						liObj.attr("callId", '');
						liObj.attr("sn", '');
						if (!usrCtx) usrCtx = '';
						if ((m_callId || m_callId == 0) && m_callId != '') window.top.m_IdtApi.CallRel(m_callId, usrCtx, 0);
						$(this).empty();
						$(this).append('<div class="one-video-wrap"></div>');
						$(this).addClass('none-video');
					}
               });
               $(this).parent().parent().find('.name .icon').html('');
               vcl_videoInterfaceInit()
           } else {
        	   prompt('warn', lang.dispatch.shouldLeastOneVideo, 1000);
           }
        }
    });
	vcl_leftLicLick();
}

// 视频会商话权申请展示。
function fn_videoConfRequestVoice(param) {
	// event,UsrCtx,type(1申请话权,2释放话权),usrNum,usrName 指定话权模式下.
	// 在主会场中显示话权申请信息。
	var usrNum = fn_conVal(param[3]);
	var operType = fn_conVal(param[2]);
	if (operType != 1) operType = 2;
	var autoMic = $('#interface-video-wrap').attr('autoMic');
	var $videoLi = $('#interface-video>.content>.video-wrap .video-window>ul>li');
	$videoLi.find('.request-voice').remove();
	if (autoMic == 'off' && operType == 1) { // 指定话权模式下申请话权。
		var $mainPlace = getVideoLiIndex(0);
		var htmlStr = '<div class="request-voice"><span class="name">' + fn_conVal(param[4]) + '</span><span>请求发言</span></div>';
		$mainPlace.append(htmlStr);
		noticeReqVoice(usrNum);
	}
	if (autoMic == 'off') { // 指定话权模式下申请或释放话权，都仍自动执行授予话权给相关人员。以避免用户误操作，无法再说话。
		var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
		var $voiceObj = null;
		for (var i = 0; i < $leftLi.length; i++) {
			var num = $leftLi.eq(i).attr('id').substring(4);
			if (num == usrNum) {
				var $voiceObj = $leftLi.eq(i).find('.voice');
				break;
			}
		}
		if ($voiceObj && $voiceObj.attr('iconStr') == '&#xe834;') {
			var m_CallId = $('#interface-video-wrap').attr("callId");
			window.top.m_IdtApi.CallConfCtrlReq(m_CallId, usrNum, IDT.SRV_INFO_MICGIVE, 1);
		}
	}
	//某某申请话权的左侧人员列表提醒闪烁方法。
	function noticeReqVoice(usrNum) {
		var $leftLi = $('#interface-video>.content>.float-left .ul-wrap li');
		var $voiceObj = null;
		for (var i = 0; i < $leftLi.length; i++) {
			var num = $leftLi.eq(i).attr('id').substring(4);
			if (num == usrNum) {
				var $voiceObj = $leftLi.eq(i).find('.voice');
				break;
			}
		}
		if ($voiceObj) {
			$voiceObj.addClass('active');
			for (var i = 0; i < 5; i ++) {
				$voiceObj.animate({opacity:'0.0'},'normal');
				if (i == 4) {
					$voiceObj.animate({opacity:'1.0'},'normal',function(){
						$voiceObj.removeClass('active');
					});
				} else {
					$voiceObj.animate({opacity:'1.0'},'normal');
				}
			}
		}
	}
}

// 加入视频会商通用方法。
function fn_joinVideoConf(gnum, confName, confTitle) {
	var jGroup = {
		GNum : gnum,
		GName : confName,
		GType : 1, // 1正式组。
		Prio : 7,
		AGNum : ''
	};
	var jMember = [];
	var confParam = {
		openType : 'join', 		// 视频会商界面打开类型
		confName : confName, 	// 会议名称
		confTitle : confTitle, 	// 会议主题
		groupInfo : jGroup, 	// 会议相关组信息
		groupMember : jMember 	// 会议参加人员信息
	};
	// 打开视频会商对话框，执行加入视频会商方法。
	fn_openVideoConfDlg(confParam);
}

// 插入未接听通讯记录。
function fn_insPerNotAnswerLog(servType,param) {
	var memo = null;
	var retId = '';
	var servType, peerNum, peerName, content;
	var servTypeDiv = '';
	if (servType == 'voice') {
		servType = '0';
		peerNum = param[2];
		peerName = param[3];
		content = lang.dispatch.voicePhone;
		servTypeDiv = '.voiceWrap';
	}else if (servType == 'caseMessage') {
		servType = '4';
		peerNum = param[2];
		peerName = param[3];
		content = lang.dispatch.newAlarm;
		servTypeDiv = '.caseMessageWrap';
		if(param[5].subPara){
			memo = param[5].subPara.CAS_CODE;
		}
	} else if (servType == 'video') {
		servType = '1';
		peerNum = param[2];
		peerName = param[3];
		content = lang.dispatch.visualTelphone;
		servTypeDiv = '.videoWrap';
	} else if (servType == 'message') {
		servType = '2';
		peerNum = param[2];
		peerName = param[9];
		servTypeDiv = '.messageWrap';
		var dwType = param[1];
		if (dwType == '1') { // 1文本、2位置信息、3图片、4录音、5录像、6文件、17会议链接、18组呼录音上传。
			content = param[5];
		} else if (dwType == '2') {
			content = lang.dispatch.positionInfo;
		} else if (dwType == '3') {
			content = lang.common.picture;
		} else if (dwType == '4') {
			content = lang.common.soundRecording;
		} else if (dwType == '5') {
			content = lang.common.videotape;
		} else if (dwType == '6') {
			content = lang.dispatch.File;
		} else if (dwType == '17') {
			content = lang.dispatch.conferenceLink;
//		} else if (dwType == '18') {
//			content = lang.dispatch.groupRecordUpload;
		}
		var endUser = fn_getEndUserOverlay(peerNum);
		if (endUser) {
			if (dwType == '1') {
				endUser.addIMInfo(content);
			} else {
				endUser.addIMInfo('【' + content + '】');
			}
		}
		var pcTo = param[3];
		var pcOriTo = param[4];
		// 判断是否为小组消息,如为小组，则取出小组的相关号码与名称，并将消息内容显示为小组内的XXX：消息内容。
		if (pcTo.indexOf('#') != -1) {
			content = peerName + '：【' + content + '】';
			peerNum = pcOriTo;
			var groupObj = fn_getGroupInfoDetail(peerNum);
			if (groupObj && groupObj.name && groupObj.name != '') {
				peerName = groupObj.name;
			} else {
				peerName = peerNum;
			}
		}
	}
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPerNotAnswerLog/insert",
		data : {
			SERVTYPE : servType,
			PEERNUM  : peerNum,
			PEERNAME : peerName,
			CONTENT  : content,
			MEMO : memo
		},
		dataType : "json",
		async: false,
		success : function(data) {
			retId = data.id;
		}
	});
	$(servTypeDiv).attr("notAnswerLogId",retId);
}

function fn_InitPopWrap() {
    if ($('#popWrap').length == 0) {
        $(document.body).append('<div id="popWrap"></div>');
        var messageWrap =
            '    <div class="workOrderWrap">\n' +
            '        <div class="fix icon voiceCall icon-rili">\n' +
            // '            <div class="count"></div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <div class="cameraWrap">\n' +
            '        <div class="fix icon deviceList icon-jiankong">\n' +
            // '            <div class="count"></div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <div class="vehicleWrap">\n' +
            '        <div class="fix icon deviceList icon-qiche">\n' +
            // '            <div class="count"></div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <div class="caseMessageWrap">\n' +
            '        <div class="fix icon case">&#xe6eb;\n' +
            '            <div class="count">0</div>\n' +
            '        </div>\n' +
            '    </div>\n'+
            '    <div class="voiceWrap">\n' +
            '        <div class="fix icon voiceCall">&#xe628;\n' +
            '            <div class="count">0</div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <div class="videoWrap">\n' +
            '        <div class="fix icon video">&#xe64c;\n' +
            '            <div class="count">0</div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <div class="messageWrap">\n' +
            '        <div class="fix icon">&#xe7a8;\n' +
            '            <div class="count">0</div>\n' +
            '        </div>\n' +
            '    </div>\n'+
            '    <div class="noticeWrap">\n' +
            '        <div class="fix icon notice">&#xe6c9;\n' +
            '            <div class="count">0</div>\n' +
            '        </div>\n' +
            '    </div>';
        $('#popWrap').append(messageWrap);
    }
    var isInit = $('#popWrap').attr('isInit');
    if (!isInit || isInit != '1') {
        // 绑定双击显示相关未接听记录弹窗。
        fn_InitOpenPerNotAnswerDlg();
        fn_InitOpenVehicleListDlg();
        fn_InitOpenCameraListDlg();
        $('#popWrap').attr('isInit','1');
    }
}

function fn_freshVehicleList() {
	var countList = [];
	countList.push({
		SERVTYPE: "5",
		notViewNum: window.top.VehicledevList.length
	});
	var notViewNum = window.top.VehicledevList.length
	function refreshVehicles() {
		var req = {
			Event: "QUERYOBJSTATUS",
			VehicledevList: []
		};
		if (typeof window.VehiclePlatReqObjStatus === "function")
			window.VehiclePlatReqObjStatus(JSON.stringify(req), 'ProcessVehicleData');
	}
	refreshVehicles();
	fn_InitPopWrap();

	$(`.vehicleWrap .count`).html((notViewNum < 100)?notViewNum:'99+');
	$(`.vehicleWrap>div`).css('display', (notViewNum > 0)?'block':'none');
}

// 初始加载时刷新相关未接听数量。
function fn_freshNotAnswerCount(curServType) {
	var countList;
	// 请求查询相关未接听数量。
	$.ajax({
		type : "post",
        url : "webservice/api/v1/comm/SysPerNotAnswerLog/queryNotViewCount",
		data : {},
		dataType : "json",
		async: false,
		success : function(data) {
			countList = data;
		}
	});

	fn_InitPopWrap();

	if (countList && countList.length && countList.length > 0) {
		var voiceFlag = false, videoFlag = false, messageFlag = false, noticeFlag = false, caseMessageFlag = false, vehicleFlag = false;
		for (var i = 0; i < countList.length; i++) {
			var servType = countList[i].SERVTYPE;
			var notViewNum = Number(countList[i].notViewNum);
			var servTypeDiv = '';
			switch(servType) {
				case '0':	// 语音电话
					voiceFlag = true;
					servTypeDiv = '.voiceWrap';
					break;
				case '1':	// 视频电话
					videoFlag = true;
					servTypeDiv = '.videoWrap';
					break;
				case '2':	// 即时消息
					messageFlag = true;
					servTypeDiv = '.messageWrap';
					break;
				case '3':	// 通知公告
					noticeFlag = true;
					servTypeDiv = '.noticeWrap';
					break;
				case '4':	// 警情
					caseMessageFlag = true;
					servTypeDiv = '.caseMessageWrap';
					break;
			}
			if (!curServType || curServType == servType) { // 如果未传类型，或当前类型等于函数传入的类型，则刷新当前传入类型的数量。
				if (servType == '3' && curServType == '3') {
					var oldNoticeNum = $(servTypeDiv+' .count').html();
					var newNoticeNum = notViewNum < 100 ? notViewNum : '99+';
					if (parseInt(newNoticeNum) > parseInt(oldNoticeNum)) fn_ringAutoStopTimeOut('noticeIn.mp3',5000);
				}
			}
			$(`${servTypeDiv} .count`).html((notViewNum < 100)?notViewNum:'99+');
			$(`${servTypeDiv}>div`).css('display', (notViewNum > 0)?'block':'none');
		}
		if ((!curServType || curServType == '' || curServType == '0') && voiceFlag == false) {
			$('.voiceWrap .count').html('0');
			$('.voiceWrap>div').css('display','none');
		}
		if ((!curServType || curServType == '' || curServType == '1') && videoFlag == false) {
			$('.videoWrap .count').html('0');
			$('.videoWrap>div').css('display','none');
		}
		if ((!curServType || curServType == '' || curServType == '2') && messageFlag == false) {
			$('.messageWrap .count').html('0');
			$('.messageWrap>div').css('display','none');
		}
		if ((!curServType || curServType == '' || curServType == '4') && caseMessageFlag == false) {
			$('.caseMessageWrap .count').html('0');
			$('.caseMessageWrap>div').css('display','none');
		}
	} else {
		$('#popWrap .fix .count').html('0');
		$('#popWrap .fix').css('display','none');
	}
}

// 已接听的话，删除相关未接听记录。
function fn_delPerNotAnswerLog(servType) {
	var servTypeDiv = '';
	if (servType == 'voice') {
		servTypeDiv = '.voiceWrap';
	} else if (servType == 'video') {
		servTypeDiv = '.videoWrap';
	} else if (servType == 'message') {
		servTypeDiv = '.messageWrap';
	}
	var strId = $(servTypeDiv).attr("notAnswerLogId");
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPerNotAnswerLog/delete",
		data : {
			id : strId
		},
		dataType : "json",
		async: false,
		success : function(data) {
		}
	});
	$(servTypeDiv).removeAttr("notAnswerLogId");
	fn_freshNotAnswerCount();
}

// 根据ID删除未应答记录。
function fn_delPerNotAnswerLogById(idStr) {
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPerNotAnswerLog/delete",
		data : {
			id : idStr
		},
		dataType : "json",
		async: false,
		success : function(data) {
		}
	});
	fn_freshNotAnswerCount();
}

// 根据ID将未应答记录状态置为已查看。
function fn_viewPerNotAnswerLogById(idStr) {
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPerNotAnswerLog/viewOne",
		data : {
			id : idStr
		},
		dataType : "json",
		async: false,
		success : function(data) {
		}
	});
	fn_freshNotAnswerCount();
}

// 已查看即时消息的话，删除与该人员相关的所有未查看即时消息日志。
function fn_delPerNotAnswerIM(userNum) {
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/SysPerNotAnswerLog/deleteByUser",
		data : {
			PEERNUM : userNum
		},
		dataType : "json",
		async: false,
		success : function(data) {
		}
	});
	fn_freshNotAnswerCount();
}

function on_VehicleViewVideo(device_id) {
	console.log('on_VehicleViewVideo', device_id);
	window.VehiclePlay(device_id,"1", "0");
	event.stopPropagation();
}

function on_VehicleVideoCall(device_id) {
	console.log('on_VehicleVideoCall', device_id);
	window.VehiclePlay(device_id,"1", "1");
	event.stopPropagation();
}

function on_VehicleVoiceCall(device_id) {
	console.log('on_VehicleVoiceCall', device_id)
	window.VehiclePlay(device_id,"0", "1");
	event.stopPropagation();
}

function on_VehicleGpsLocation() {
	// console.log('onVehicleGpsLocation', device_id)
	// var TargetVehicle = undefined;
	// for(let vehicle of window.top.VehicledevList) {
	// 	if (vehicle.Devid === device_id) {
	// 		TargetVehicle = vehicle;
	// 		break;
	// 	}
	// }
	// if (!TargetVehicle)
	// 	return;
	//
	// // 在地图中展示相关覆盖物。
	// function mapVehiclePositioning(Vehicle,isCheck=false){
	// 	// 在地图中展示相关覆盖物。
	// 	if (window.map) {
	// 		var point;
	// 		// 对现有百度地图中的覆盖物进行处理。
	// 		var allOverlay = map.getOverlays();
	// 		for (var i = 0; i < allOverlay.length; i++) {
	// 			var className = '';
	// 			var curOver = allOverlay[i];
	// 			if (curOver.className) className = curOver.className;
	// 			if (className != "EndUserOverlay") continue;
	// 			if (curOver._num == Vehicle.Devid) {
	// 				point = curOver._point;
	// 				curOver.showTop();
	// 				if (isCheck == true) curOver.setIsStatic(isCheck);
	// 				continue;
	// 			}
	// 			if (curOver._static == false) {
	// 				window.map.removeOverlay(curOver);
	// 			}
	// 		}
	// 		if (!point) {
	// 			var mapInitPoint = getParaVal('mapInitPoint');
	// 			var mapInitPointArr = mapInitPoint.split(',');
	// 			point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
	// 			if ( Vehicle.GPSinfo.Longitude
	// 				&& Vehicle.GPSinfo.Latitude
	// 				&& !isNaN(Vehicle.GPSinfo.Longitude)
	// 				&& !isNaN(Vehicle.GPSinfo.Latitude) )
	// 			{
	// 				var Longitude = Number(Vehicle.GPSinfo.Longitude);
	// 				var Latitude = Number(Vehicle.GPSinfo.Latitude);
	// 				point = BMap.BPoint(Longitude, Latitude);
	// 			}
	// 			var imgSrc = '/upload/headicon/vehicle.png?t=' + Math.random();
	// 			var endUserMarker = new EndUserOverlay(point,
	// 				Vehicle.Devid,
	// 				Vehicle.DevName,
	// 				imgSrc,
	// 				isCheck,
	// 				'#A01A1A',
	// 				Vehicle.isOnline);
	// 			map.addOverlay(endUserMarker);
	// 			endUserMarker.showTop();
	// 		}
	// 		// 地图定位到当前选中用户。
	// 		setTimeout(function() {
	// 			window.map.panTo(point);
	// 		}, 200);
	// 	}
	// }
	//
	// mapVehiclePositioning(TargetVehicle);
	//console.log($(this));
	var checked = true;
	var Devid = $(this).parent().find('.cbselect').attr('Devid');
	$(this).parent().find('.cbselect').prop('checked', checked);
	fn_ShowHideVehicle(Devid, checked, true);
	event.stopPropagation();
}

function fn_IsVehicleOnMap(device_id) {
	var result = false;
	if (window.map) {
		var allOverlay = map.getOverlays();
		for (var i = 0; i < allOverlay.length; i++) {
			var className = '';
			var curOver = allOverlay[i];
			if (curOver.className) className = curOver.className;
			if (className != "EndUserOverlay") continue;
			if (curOver._num == device_id) {
				result = true;
				break;
			}
		}
	}
	return result;
}

function fn_ShowHideVehicle(device_id, is_show, move_to=false) {
	var TargetVehicle = undefined;
	for(let vehicle of window.top.VehicledevList) {
		if (vehicle.Devid === device_id) {
			TargetVehicle = vehicle;
			break;
		}
	}
	if (!TargetVehicle)
		return;

	if (window.map) {
		var allOverlay = map.getOverlays();
		var VehicleOverlay = undefined;
		for (var i = 0; i < allOverlay.length; i++) {
			var className = '';
			var curOver = allOverlay[i];
			if (curOver.className) className = curOver.className;
			if (className != "EndUserOverlay") continue;
			if (curOver._num == device_id) {
				//window.map.removeOverlay(curOver);
				VehicleOverlay = curOver;
				break;
			}
		}

		if (is_show) {
			var mapInitPoint = getParaVal('mapInitPoint');
			var mapInitPointArr = mapInitPoint.split(',');
			var point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
			if ( TargetVehicle.GPSinfo.Longitude
				&& TargetVehicle.GPSinfo.Latitude
				&& !isNaN(TargetVehicle.GPSinfo.Longitude)
				&& !isNaN(TargetVehicle.GPSinfo.Latitude) )
			{
				var Longitude = Number(TargetVehicle.GPSinfo.Longitude);
				var Latitude = Number(TargetVehicle.GPSinfo.Latitude);
				//console.log(Longitude, Latitude)
				if (Longitude > 0 && Latitude > 0)
					point = BMap.BPoint(Longitude, Latitude);
			}

			if (VehicleOverlay) {
				//console.log('move vehicle');
				VehicleOverlay.move(point);
				if (move_to) {
					window.map.panTo(point);
					VehicleOverlay.showTop();
				}
			} else {
				var endUserMarker = new EndUserOverlay(point,
					TargetVehicle.Devid,
					TargetVehicle.DevName,
					'/upload/headicon/vehicle.png?t=' + Math.random(),
					is_show,
					'#A01A1A',
					TargetVehicle.isOnline);
				map.addOverlay(endUserMarker);
				endUserMarker.showTop();
				window.map.panTo(point);
				//console.log('show vehicle')
			}
		} else {
			if (VehicleOverlay) {
				//console.log('hide vehicle')
				window.map.removeOverlay(VehicleOverlay);
			}
		}
	}
}

function on_CheckboxClick(checkbox) {
	var checked, Devid;
	if ($(this).attr('class') === 'record stat_online') {
		checked = $(this).find('.cbselect').prop('checked');
		Devid = $(this).find('.cbselect').attr('Devid');
		checked = !checked;
		$(this).find('.cbselect').prop('checked', checked);
		fn_ShowHideVehicle(Devid, checked);
	}
}

function fn_InitOpenVehicleListDlg() {
	$('.vehicleWrap .fix').off('click').on('click', function (e) {
		openVehicleListDlg('4');
		e.stopPropagation();
	});
	function openVehicleListDlg() {
		console.log('open vehicle dlg');
		if ($('#vehicle-list').css('display') == 'block') return;
		if ($('#vehicle-list').length == 0) {
			var htmlStr = 	'<div id="vehicle-list">' +
				'	<div class="close">×</div>' +
				'	<div class="tab">' +
				'    	<div servType="0" class="active">&#xe651; 车辆清单</div>' +
				'	</div>' +
				'	<div class="content"></div>' +
				'</div>';
			$(document.body).append(htmlStr);
			// 关闭按钮点击事件。
			$('#vehicle-list .close').off('click').on('click', function () {
				$('#vehicle-list').css('display','none');
			});
			// 移动拖拽。
			$('#vehicle-list .tab').off('mousedown').on('mousedown',function (event) {
				var isMove = true;
				var abs_x = event.pageX - $('#vehicle-list').offset().left;
				var abs_y = event.pageY - $('#vehicle-list').offset().top;
				$(document).off('mousemove').on('mousemove',function (event) {
					if (isMove) {
						$('#vehicle-list').css({
							'left': event.pageX - abs_x,
							'top': event.pageY - abs_y ,
							'transform': 'translate(0, 0)'
						});
					}
				}).off('mouseup').on('mouseup',function () {
					isMove = false;
				});
			});
		}
		window.top.fn_genVehicleViewContent = function() {
			$('#vehicle-list>.content').html('');
			var VehicleListCopy = window.top.VehicledevList || []
			var VehicleList = JSON.parse(JSON.stringify(VehicleListCopy));
			VehicleList.sort(function (a, b) {
				return parseInt(b.isOnline) - parseInt(a.isOnline);
			});
			if (VehicleList && VehicleList.length > 0 ) {
				var htmlStr = '';
				for(var Vehicle of VehicleList) {
					var statStr = (Vehicle.isOnline==='1') ? `<span class="stat_online">[在线]</span>` : `<span class="stat_offline">[离线]</span>`;
					var buttons = '';
					var checked = '';
					if (fn_IsVehicleOnMap(Vehicle.Devid))
						checked = 'checked';
					if (Vehicle.isOnline==='1')
						buttons += `<div class="btn icon voicecall" onclick="on_VehicleVoiceCall('${Vehicle.Devid}')">&#xe628;</div>` +
							`<div class="btn icon videocall" onclick="on_VehicleVideoCall('${Vehicle.Devid}')">&#xe64c;</div>` +
							`<div class="btn icon viewvideo" onclick="on_VehicleViewVideo('${Vehicle.Devid}')">&#xe62d;</div>` +
							`<div class="btn icon location"">&#xe6e3;</div>`;
					else
						buttons += '	<div class="btn_disable icon">&#xe628;</div>' +
							'	<div class="btn_disable icon">&#xe64c;</div>' +
							'	<div class="btn_disable icon">&#xe62d;</div>' +
							'	<div class="btn icon location">&#xe6e3;</div>';

					htmlStr +=  '<div class="record stat_online" recId="' + Vehicle.Devid + '">' +
						`	<div class="title"><input class="cbselect" type="checkbox" ${checked} Devid="${Vehicle.Devid}"></div>` +
						'	<div class="title status">' + statStr + '</div>' +
						'	<div class="title" title="' + Vehicle.DevName + '">' + Vehicle.DevName + '</div>' +
						buttons +
						'	<div class="time">' + Vehicle.OnlineUTC + '</div>' +
						'</div>';
				}
				$('#vehicle-list>.content').html(htmlStr);
				$('.record>.location').unbind().bind('click', on_VehicleGpsLocation);
				$('#vehicle-list>.content>.record').unbind().bind('click', on_CheckboxClick)
			}
		};
		fn_genVehicleViewContent();
		$('#vehicle-list').css('display','block');
	}
}

// 视频预览
function startPreview(cameraIndexCode) {
	var wndId = -1;
	if ($('#camera-preview').css('display') == 'none') {
		if (oWebControl)
			oWebControl.JS_ShowWnd();
		$('#camera-preview').css('display', 'block');
		wndId = 1;

		var offset = $('#playWnd').offset();
		var rect = {
			left: offset.left,
			top: offset.top,
			width: $('#playWnd').width(),
			height: $('#playWnd').height(),
		};
		// console browser
		if (window.isTerm)
			oWebControl.oRequest.setWndGeometry(rect.left-11, rect.top-11, rect.width, rect.height);
		else
			oWebControl.oRequest.setWndGeometry(rect.left, rect.top, rect.width, rect.height);
	}
	window.top.oWebControl.JS_RequestInterface({
		funcName: "startPreview",
		argument: JSON.stringify({
			cameraIndexCode : cameraIndexCode ,
			streamMode: window.top.videoParam.streamMode,
			transMode: window.top.videoParam.transMode,
			gpuMode: window.top.videoParam.gpuMode,
			wndId: wndId,
		})
	}).then(function (oData) {
		//console.log(JSON.stringify(oData ? oData.responseMsg : ''));
	});
}

function fn_InitOpenCameraListDlg() {
	var oWebControl = undefined;

	console.log('fn_InitOpenCameraListDlg')
	$('.cameraWrap .fix').off('click').on('click', function (e) {
		openCameraListDlg();
		e.stopPropagation();
	});

	// 获取公钥
	function getPubKey (callback) {
		oWebControl.JS_RequestInterface({
			funcName: "getRSAPubKey",
			argument: JSON.stringify({
				keyLength: 1024
			})
		}).then(function (oData) {
			//console.log(oData)
			if (oData.responseMsg.data) {
				pubKey = oData.responseMsg.data
				callback()
			}
		})
	}
	// 设置窗口控制回调
	function setCallbacks() {
		oWebControl.JS_SetWindowControlCallback({
			cbIntegrationCallBack: cbIntegrationCallBack
		});
	}
	// 推送消息
	function cbIntegrationCallBack(oData) {
		// showCBInfo(JSON.stringify(oData.responseMsg));
		console.log(oData.responseMsg)
	}
	// RSA加密
	function setEncrypt (value) {
		var encrypt = new JSEncrypt();
		encrypt.setPublicKey(pubKey);
		return encrypt.encrypt(value);
	}
	// 初始化
	function connectServer() {
		getPubKey(function () {
			var appkey = window.top.videoParam.appkey;
			//var secret = setEncrypt(window.top.videoParam.secret);
			var secret = window.top.videoParam.secret;
			var ip = window.top.videoParam.ip;
			var port = window.top.videoParam.port;
			var snapDir = window.top.videoParam.snapDir;
			var layout = window.top.videoParam.layout;
			var encryptedFields = [];//['secret'];

			// console.log({
			// 	appkey: appkey,
			// 	secret: secret,
			// 	ip: ip,
			// 	playMode: 0, // 预览
			// 	port: port,
			// 	snapDir: snapDir,
			// 	layout: layout,
			// 	encryptedFields: encryptedFields
			// });

			oWebControl.JS_RequestInterface({
				funcName: "init",
				argument: JSON.stringify({
					appkey: appkey,
					secret: secret,
					ip: ip,
					playMode: 0, // 预览
					port: port,
					snapDir: snapDir,
					layout: layout,
					encryptedFields: encryptedFields
				})
			}).then(function (oData) {
				// showCBInfo(JSON.stringify(oData ? oData.responseMsg : ''));
				//console.log(JSON.stringify(oData ? oData.responseMsg : ''));
				//console.log(JSON.stringify(oData.responseMsg));
				console.log('Connect to video server success.')
			});
		})
	}

	function openCameraListDlg() {
		if ($('#camera-list').css('display') == 'block') return;
		if ($('#camera-list').length == 0) {
			var htmlStr = '<div id="camera-list">' +
				'	<div class="close">×</div>' +
				'	<div class="tab">' +
				'    	<div servType="0" class="active">&#xe64c; 摄像头清单</div>' +
				'	</div>' +
				'	<div class="content"></div>' +
				'</div>';
			$(document.body).append(htmlStr);

			var htmlStrPreview = '<div id="camera-preview">' +
				'	<div class="close">×</div>' +
				'	<div class="tab">' +
				'	</div>' +
				'	<div class="content"><div id="playWnd" class="playWnd"></div></div>' +
				'</div>';
			$(document.body).append(htmlStrPreview);
		}

		if (!oWebControl) {
			oWebControl = new WebControl({
				szPluginContainer: "playWnd",
				iServicePortStart: 15900,
				iServicePortEnd: 15900,
				cbConnectSuccess: function () {
					//setCallbacks();
					// var iWidth = 875 - 1;
					// var iHeight = 600 - 1;
					var iWidth = $('#playWnd').width() - 1;
					var iHeight = $('#playWnd').height() - 1;

					oWebControl.JS_StartService("window", {
						dllPath: "./VideoPluginConnect.dll"
						//dllPath: "./DllForTest-Win32.dll"
					}).then(function () {
						oWebControl.JS_CreateWnd("playWnd", iWidth, iHeight).then(function () {
							// console browser
							if (window.isTerm) {
								var offset = $('#playWnd').offset();
								var rect = {
									left: offset.left,
									top: offset.top,
									width: $('#playWnd').width(),
									height: $('#playWnd').height(),
								};
								oWebControl.oRequest.setWndGeometry(rect.left - 11, rect.top - 11, rect.width, rect.height);
							}
							connectServer();
						});
					}, function () {
					});
				},
				cbConnectError: function () {
					console.log("cbConnectError");
					oWebControl = undefined;
					window.top.oWebControl = oWebControl;
					$("#playWnd").html("插件未启动，正在尝试启动，请稍候...");
					WebControl.JS_WakeUp("VideoWebPlugin://");
					initCount++;
					if (initCount < 3) {
						setTimeout(function () {
							initPlugin();
						}, 3000)
					} else {
						$("#playWnd").html("插件启动失败，请检查插件是否安装！");
					}
				},
				cbConnectClose: function () {
					console.log("cbConnectClose");
					oWebControl = undefined;
					window.top.oWebControl = oWebControl;
				}
			});
			window.top.oWebControl = oWebControl;
		}
		else {
			oWebControl.JS_ShowWnd();
		}

		// 关闭按钮点击事件。
		$('#camera-list .close').off('click').on('click', function () {
			$('#camera-list').css('display','none');
			$('#camera-preview').css('display','none');
			if (oWebControl) {
				//oWebControl.JS_DestroyWnd();
				// oWebControl = undefined;
				// window.top.oWebControl = oWebControl;
				oWebControl.JS_RequestInterface({
					funcName: "stopAllPreview"
				}).then(function (oData) {
				});
				oWebControl.JS_HideWnd();
			}
		});
		// 列表移动拖拽。
		$('#camera-list .tab').off('mousedown').on('mousedown',function (event) {
			var isMove = true;
			var abs_x = event.pageX - $('#camera-list').offset().left;
			var abs_y = event.pageY - $('#camera-list').offset().top;
			$(document).off('mousemove').on('mousemove',function (event) {
				if (isMove) {
					$('#camera-list').css({
						'left': event.pageX - abs_x,
						'top': event.pageY - abs_y ,
						'transform': 'translate(0, 0)'
					});
					$('#camera-preview').css({
						'left': event.pageX - abs_x + 230,
						'top': event.pageY - abs_y ,
						'transform': 'translate(0, 0)'
					});
					if (oWebControl) {
						var offset = $('#playWnd').offset();
						var rect = {
							left: offset.left,
							top: offset.top,
							width: $('#playWnd').width(),
							height: $('#playWnd').height(),
						};
						// console browser
						if (window.isTerm)
							oWebControl.oRequest.setWndGeometry(rect.left-11, rect.top-11, rect.width, rect.height);
						else
							oWebControl.oRequest.setWndGeometry(rect.left, rect.top, rect.width, rect.height);
					}
				}
			}).off('mouseup').on('mouseup',function () {
				isMove = false;
			});
		});

		// 关闭按钮点击事件。
		$('#camera-preview .close').off('click').on('click', function () {
			$('#camera-preview').css('display','none');
			if (oWebControl) {
				// oWebControl.JS_DestroyWnd();
				// oWebControl = undefined;
				// window.top.oWebControl = oWebControl;
				oWebControl.JS_RequestInterface({
					funcName: "stopAllPreview"
				}).then(function (oData) {
				});
				oWebControl.JS_HideWnd();
			}
		});
		// 列表移动拖拽。
		$('#camera-preview .tab').off('mousedown').on('mousedown',function (event) {
			var isMove = true;
			var abs_x = event.pageX - $('#camera-preview').offset().left;
			var abs_y = event.pageY - $('#camera-preview').offset().top;
			$(document).off('mousemove').on('mousemove',function (event) {
				if (isMove) {
					$('#camera-list').css({
						'left': event.pageX - abs_x - 230,
						'top': event.pageY - abs_y ,
						'transform': 'translate(0, 0)'
					});
					$('#camera-preview').css({
						'left': event.pageX - abs_x,
						'top': event.pageY - abs_y ,
						'transform': 'translate(0, 0)'
					});
					if (oWebControl) {
						var offset = $('#playWnd').offset();
						var rect = {
							left: offset.left,
							top: offset.top,
							width: $('#playWnd').width(),
							height: $('#playWnd').height(),
						}
						// console browser
						if (window.isTerm)
							oWebControl.oRequest.setWndGeometry(rect.left-11, rect.top-11, rect.width, rect.height);
						else
							oWebControl.oRequest.setWndGeometry(rect.left, rect.top, rect.width, rect.height);
					}
				}
			}).off('mouseup').on('mouseup',function () {
				isMove = false;
			});
		});

		window.top.fn_genCameraViewContent = function() {
			$('#vehicle-list>.content').html('');
			var CameraListCopy = window.top.CameraList || [];
			var CameraList = JSON.parse(JSON.stringify(CameraListCopy));
			if (CameraList && CameraList.length > 0 ) {
				var htmlStr = '';
				for(var Camera of CameraList) {
					var statStr = `<span class="stat_online">[在线]</span>`;
					var buttons = '';
					buttons = `<div class="btn icon viewvideo" onclick="startPreview('${Camera.cameraIndexCode}')">&#xe62d;</div>`;
					htmlStr +=  '<div class="record stat_online" recId="' + Camera.cameraIndexCode + '">' +
						`	<div class="title"></div>` +
						'	<div class="title" style="margin-left:10px;" title="' + Camera.cameraName + '">' + Camera.cameraName + '</div>' +
						buttons +
						'</div>';
				}
				$('#camera-list>.content').html(htmlStr);
			}
		};
		fn_genCameraViewContent();
		$('#camera-list').css('display','block');
		$('#camera-preview').css('display','block');
	}
}
// 绑定双击显示相关未接听记录弹窗。
function fn_InitOpenPerNotAnswerDlg() {
	$('.voiceWrap .fix').off('click').on('click', function (e) {
		openPerNotAnswerDlg('0');
		e.stopPropagation();
	});
	$('.videoWrap .fix').off('click').on('click', function (e) {
		openPerNotAnswerDlg('1');
		e.stopPropagation();
	});
	$('.messageWrap .fix').off('click').on('click', function (e) {
		openPerNotAnswerDlg('2');
		e.stopPropagation();
	});
	$('.noticeWrap .fix').off('click').on('click', function (e) {
		openPerNotAnswerDlg('3');
		e.stopPropagation();
	});
	$('.caseMessageWrap .fix').off('click').on('click', function (e) {
		openPerNotAnswerDlg('4');
		e.stopPropagation();
	});
	function openPerNotAnswerDlg(servType) {
		if ($('#unread-message').css('display') == 'block') return;
		if ($('#unread-message').length == 0) {
			var htmlStr = 	'<div id="unread-message">' +
					        '	<div class="close">×</div>' +
					        '	<div class="tab">' +
					        '    	<div servType="0" class="call">&#xe683; '+lang.dispatch.missedCall+'</div>' +
					        '    	<div servType="1" class="call">&#xe64c; '+lang.dispatch.missedVideo+'</div>' +
					        '    	<div servType="2">&#xe7a8; '+lang.dispatch.missedMessage+'</div>' +
					        '    	<div servType="3" class="active">&#xe6c0; '+lang.basic.Notification+'</div>' +
					        '    	<div servType="4" class="active">&#xe6eb; '+lang.cases.detailsPoliceSituation+'</div>' +
					        '	</div>' +
					        '	<div class="content"></div>' +
					        '</div>';
			$(document.body).append(htmlStr);
			// 关闭按钮点击事件。
			$('#unread-message .close').off('click').on('click', function () {
				$('#unread-message').css('display','none');
			});
			// 各tab的点击切换。
			$('#unread-message .tab>div').off('click').on('click', function() {
		        $('#unread-message .tab>div').removeClass('active');
		        $(this).addClass('active');
		        if ($(this).hasClass('call')) {
		            $('#unread-message>.content').addClass('call');
		        } else {
		            $('#unread-message>.content').removeClass('call');
		        }
		        var servType = $(this).attr('servType');
		        fn_genNotViewContent(servType);
		    });
			$('#unread-message>.content').off('click').on('click', function(e) {
				if (!($(e.target).hasClass('record')) && !($(e.target).parent().hasClass('record'))) return;
				var countListStr = $('#unread-message').attr('notViewList');
	        	var countList = JSON.parse(countListStr);
	        	var recId = '';
				if ($(e.target).hasClass('record')) { //$(e.target).hasClass('btn')
		        	recId = $(e.target).attr('recId');
				} else {
					recId = $(e.target).parent().attr('recId');
				}
	        	if (countList && countList.length && countList.length > 0) {
		        	for (var i = 0; i < countList.length; i++) {
		        		if (countList[i].ID == recId) {
		        			var recObj = countList[i];
		        			if (recObj.SERVTYPE == '0' || recObj.SERVTYPE == '1' || recObj.SERVTYPE == '4') { //未接来电，未接视频，点击该行，则直接将相关未接信息置为已查看或删除。
		        				if(recObj.SERVTYPE == '4'){
		        					$.ajax({
		        	        			type : "POST",
		        	        			url : 'webservice/api/v1/comm/SysPerNotAnswerLog/findDataById',
		        	        			async : false,
		        	        			data : {
		        	        				ID : recObj.ID
		        	        			},
		        	        			dataType : "json",
		        	        			success : function(data) {
		        	        				caseDetailShow( null, data[0].MEMO);
		        	        			}
		        	        		});
		        				}
		        				fn_viewPerNotAnswerLogById(recId);
		        			}
		        			if ($(e.target).hasClass('btn')) { //如果点击的是相关按钮，则执行相关按钮功能。
		        				if (recObj.SERVTYPE == '0') { // 语音通话
					        		fn_voiceCall(recObj.PEERNUM, recObj.PEERNAME);
					        	} else if (recObj.SERVTYPE == '1') { // 视频通话
					        		fn_videoCall(recObj.PEERNUM, recObj.PEERNAME);
					        	} else if (recObj.SERVTYPE == '2') { // 即时消息
					        		var curNum='';
					        		if (recObj.TYPE == '1') { // 个人
					        			window.insMsg(recObj.PEERNUM, recObj.PEERNAME);
					        		} else { // 小组
					        			var groupObj = fn_getGroupInfoDetail(recObj.PEERNUM);
					        			if (groupObj && groupObj.gtype) {
					        				window.insMsg(recObj.PEERNUM, recObj.PEERNAME, groupObj.gtype);
					        			} else {
					        				window.insMsg(recObj.PEERNUM, recObj.PEERNAME);
					        			}
					        		}
					        	} else if (recObj.SERVTYPE == '3') { // 通知公告
					        		noticeView(recObj);
					        	}
		        			}
		        		}
		        	}
	        	}
			});
			//查看通知公告
			function noticeView(recObj){
				//赋值标题、内容
        		$.ajax({
        			type : "POST",
        			url : 'webservice/api/v1/comm/sysNotice/queryMsgById',
        			async : false,
        			data : {
        				ID : recObj.ID
        			},
        			dataType : "json",
        			success : function(data) {
        				console.log(data);
        				$("#VIEW_NOTE_TITLE").val(data[0].NOTE_TITLE);
        				$("#VIEW_NOTE_CONTENT").val(data[0].NOTE_CONTENT);
        				$("#releasePeople").html(data[0].NAME);
        				$("#releaseTime").html(data[0].PUB_TIME);
        			}
        		});
        		//赋值附件
        		$.ajax({
        			type : "POST",
        			url : 'webservice/api/v1/comm/sysNotice/findAttach',
        			async : false,
        			data : {
        				obj_id : recObj.ID,
        				att_cate : "notice_file"
        			},
        			dataType : "json",
        			success : function(data) {
        				$("#viewAttachContent").html("");
    					if(data.length>0){
    						for (var i = 0; i < data.length; i++) {
    							$("#viewAttachContent").append("<div><span class='icon'>&#xe7c0</span>&nbsp;&nbsp;<span>"+data[i].ATT_OLD_FILENAME
    									+"</span><span class='delete icon' fileUrl='"+data[i].ATT_URL+"' fileName='"+data[i].ATT_OLD_FILENAME
    									+"'>&nbsp;&nbsp;&nbsp;&nbsp;&#xe632</span></div>");
    						}
    					}
        			 }
        		 });
        		//修改公告查询状态为已查看
        		$.ajax({
     			   type : "POST",
     				url : 'webservice/api/v1/comm/sysNotice/updateView',
     				data : {
     					NOTE_ID : recObj.ID,
     					NOTE_USER : window.top.userInfo.userInfo.num
     				},
     				dataType : "json",
     				success : function(data) {
     				}
     		   	});
        		$('.see-notice-dialog').dialog({
                    title: lang.basic.viewNotice,
                    width: 800,
                    height: 504,
                    closed: false,
                    cache: false,
                    modal: true
                });
        		$("#viewAttachContent .delete").off('click').on('click',function(){
        			viewDownFile(this);
        		});
        		//附件下载
        		function viewDownFile(ts){
					var fileUrl = $(ts).attr("fileUrl");
					var fileName = $(ts).attr("fileName");
					if ($("#downloadform")) $("#downloadform").remove();
					$("<form id='downloadform'>").attr({
				   		"action" : "sysNotice/downLoad",
				   		"method" : "POST",
				   		"target" : "nm_iframe"
				   	})
				   	.append("<input type='hidden' name='fileUrl' value='"+fileUrl+"'/>")
				   	.append("<input type='hidden' name='fileName' value='"+fileName+"'/>")
				   	.appendTo(document.body).submit();
        		}
        		fn_freshNotAnswerCount("3");
			}
			// 未读消息列表移动拖拽。
		    $('#unread-message .tab').off('mousedown').on('mousedown',function (event) {
	            var isMove = true;
	            var abs_x = event.pageX - $('#unread-message').offset().left;
	            var abs_y = event.pageY - $('#unread-message').offset().top;
	            $(document).off('mousemove').on('mousemove',function (event) {
	                if (isMove) {
	                    $('#unread-message').css({
	                        'left': event.pageX - abs_x,
	                        'top': event.pageY - abs_y ,
	                        'transform': 'translate(0, 0)'
	                    });
	                }
	            }).off('mouseup').on('mouseup',function () {
	                isMove = false;
	            });
		    });
		}
		// 加载显示指定的TAB。
		$('#unread-message .tab>div').removeClass('active');
		var $curTab = $('#unread-message .tab>div[servType=' + servType + ']');
		$curTab.addClass('active');
        if ($curTab.hasClass('call')) {
            $('#unread-message>.content').addClass('call');
        } else {
            $('#unread-message>.content').removeClass('call');
        }
        $('#unread-message .tab>div').removeClass('unread'); // 去除所有未读消息的红点。
        window.top.fn_genNotViewContent = function(servType) {
        	$('#unread-message .tab>div').removeClass('unread');
        	$('#unread-message>.content').html('');
        	// 检索所有的未读信息记录,并记录入本DIV中。
    		var countList;
    		// 请求查询相关未接听数量。
    		$.ajax({
    			type : "post",
    			url : "webservice/api/v1/comm/SysPerNotAnswerLog/queryNotViewList",
    			data : {},
    			dataType : "json",
    			async: false,
    			success : function(data) {
    				countList = data;
    			}
    		});
        	if (countList && countList.length && countList.length > 0) {
        		var htmlStr = '';
        		if (servType == '2') { //即时消息。
        			var curPeerNum = ''; count = 1;
        			for (var i = 0; i < countList.length; i ++) {
                		var curServType = countList[i].SERVTYPE;
                		$('#unread-message .tab>div[servType=' + curServType + ']').addClass('unread');
                		if (curServType == servType) {
                			if (curPeerNum != countList[i].PEERNUM) {
                				htmlStr = htmlStr.replace("{count}",count);
                				var contentStr = '【' + countList[i].PEERNUM + '】' + countList[i].PEERNAME + ' : ' + countList[i].CONTENT;
                    			htmlStr +=  '<div class="record unread-msg" recId="' + countList[i].ID + '">' +
                    						'	<div class="number">{count}</div>' +
        				            		'	<div class="title" title="' + contentStr + '">' + contentStr + '</div>' +
        				            		'	<div class="btn look">'+lang.common.Toview+'</div>' +
        				            		'	<div class="btn callback">'+lang.common.back+'</div>' +
        				            		'	<div class="time">' + countList[i].HAPPENTIME + '</div>' +
        				            		'</div>';
                    			curPeerNum = countList[i].PEERNUM;
                    			count = 1;
                			} else {
                				if (count == '99+' || count >= 99) {
                					count = '99+';
                				} else {
                					count ++;
                				}
                			}
                		}
                    }
        			htmlStr = htmlStr.replace("{count}",count);
        		} else { // 其它类型：未接电话，未接视频，未查看通知公告等。
        			for (var i = 0; i < countList.length; i ++) {
                		var curServType = countList[i].SERVTYPE;
                		$('#unread-message .tab>div[servType=' + curServType + ']').addClass('unread');
                		if (curServType == servType) {
                			var contentStr = '【' + countList[i].PEERNUM + '】' + countList[i].PEERNAME + ' : ' + countList[i].CONTENT;
                			htmlStr +=  '<div class="record" recId="' + countList[i].ID + '">' +
                						'	<div class="number"></div>' +
    				            		'	<div class="title" title="' + contentStr + '">' + contentStr + '</div>' +
    				            		'	<div class="btn look">'+lang.common.Toview+'</div>' +
    				            		'	<div class="btn callback">'+lang.common.back+'</div>' +
    				            		'	<div class="time">' + countList[i].HAPPENTIME + '</div>' +
    				            		'</div>';
                		}
                    }
        		}
            	$('#unread-message>.content').html(htmlStr);
            	$('#unread-message').attr('notViewList', JSON.stringify(countList));
            }
        }
        fn_genNotViewContent(servType);
		$('#unread-message').css('display','block');
	}
}

// 云台控制相关功能函数。
function fn_PTZControl(callNum,callName) {
	if (!callNum || callNum == '') 	 callNum = $("#mapNUM").html();
	if (!callName || callName == '') callName = $("#mapNAME").html();
	$('.personal-data').css("display", "none");
	// 创建通讯序号。
	var sn = fn_genSn();
	// 创建视频通讯面板。
	var htmlStr = '<div class="big-cloud-control" id="sureChat_commDlg_' + sn + '">' +
				  '	<div class="title">' +
				  '	    <div class="text">&#xe655; '+lang.dispatch.ConsoleControl+'</div>' +
				  '	    <div class="close">&#xe6c4;</div>' +
				  '	    <div class="times"><div class="active">x1</div><div>x2</div><div>x4</div></div>' +
				  '	</div>' +
				  '	<div class="video-wrap">'+
						  fn_genVideo('id_video_peer_'+sn,'100%','100%',false) +
						  fn_genVideo('id_video_my_'+sn,'100%','100%',true) +
//				  '		<video style="width:100%;height:100%;" id="id_video_peer_' + sn + '" autoplay></video>' +
//				  '	 	<video style="width:100%;height:100%;display:none;" id="id_video_my_' + sn + '" autoplay muted></video>' +
				  ' </div>' +
				  '	<div class="content">' +
				  '	    <div class="control-wrap">' +
				  '	        <div class="control-pad">' +
				  '	            <div class="ctrlBtn up"><div>&#xe6c7;</div></div>' +
				  '	            <div class="ctrlBtn right"><div>&#xe6c7;</div></div>' +
				  '	            <div class="ctrlBtn down"><div>&#xe6c7;</div></div>' +
				  '	            <div class="ctrlBtn left"><div>&#xe6c7;</div></div>' +
				  '	        </div>'+
				  '	        <div class="btn-wrap">' +
				  '	            <div class="ctrlBtn enlarge">&#xe765; '+lang.dispatch.enlarge+'</div>' +
				  '	            <div class="ctrlBtn narrow">&#xe744; '+lang.dispatch.narrow+'</div>' +
				  '	        </div>' +
				  '			<div class="speed-wrap">' +
				  '				<div class="speed-label">'+lang.dispatch.PTZCtrlRate+'：<span class="speedVal">10</span></div>' +
				  '				<div class="speed-input"><input class="easyui-slider speedInput" value="10" style="width:200px;" data-options="min:0,max:255,step:5"/></div>' +
				  '			</div>' +
				  '	    </div>' +
				  '	</div></div>';
	$(document.body).append(htmlStr);
	$.parser.parse('#sureChat_commDlg_' + sn + ' .speed-wrap');
	$('#sureChat_commDlg_' + sn + ' .speed-wrap .speedInput').slider({
    	onChange: function(newValue, oldValue) {
    		$(this).parents('.speed-wrap').find('.speedVal').text(newValue);
    	}
    });
	// 拖拽事件。
	$('.big-cloud-control .title').off('mousedown').on('mousedown',function (event) {
        var isMove = true;
        var abs_x = event.pageX - $('.big-cloud-control').offset().left;
        var abs_y = event.pageY - $('.big-cloud-control').offset().top;
        $(document).off('mousemove').on('mousemove',function (event) {
            if (isMove) {
                $('.big-cloud-control').css({
                    'left': event.pageX - abs_x,
                    'top': event.pageY - abs_y,
                    'transform': 'translate(0, 0)'
                });
            }
        }).off('mouseup').on('mouseup',function () {
            isMove = false;
        });
    });

    // 倍数按钮点击事件。
    $('.big-cloud-control .title .times div').off('click').on('click', function () {
        var clientWidth = document.documentElement.clientWidth;
        var clientHeight = document.documentElement.clientHeight;
        switch ($(this).text()) {
            case "x1":
                $('.big-cloud-control').css({
                    width: 420,
                    height: 400
                });
                $('.big-cloud-control .title .times div').removeClass('active');
                $(this).addClass('active');
                break;
            case "x2":
                if ((840 < clientWidth) && (640 < clientHeight)) {
                    $('.big-cloud-control').css({
                        width: 840,
                        height: 640
                    });
                    $('.big-cloud-control .title .times div').removeClass('active');
                    $(this).addClass('active');
                } else {
                	prompt('warn', lang.dispatch.currentMultiplierDisplay, 1000);
                }
                break;
            case "x4":
                if ((1680 < clientWidth) && (1120 < clientHeight)) {
                    $('.big-cloud-control').css({
                        width: 1680,
                        height: 1120
                    });
                    $('.big-cloud-control .title .times div').removeClass('active');
                    $(this).addClass('active');
                } else {
                	prompt('warn', lang.dispatch.currentMultiplierDisplay, 1000);
                }
                break;
        }
    });
    var myVideo = $('#id_video_my_' + sn)[0];
	var peerVideo = $('#id_video_peer_' + sn)[0];
	var m_CallId = window.m_IdtApi.CallMakeOut(sn, myVideo, peerVideo, 1, 0, 1, 0, callNum, IDT.SRV_TYPE_WATCH_DOWN, "", 1, 0);
	$('#sureChat_commDlg_' + sn).attr("callId", m_CallId);
	$('#sureChat_commDlg_' + sn).attr("callSn", sn);
	$('#sureChat_commDlg_' + sn).attr("callNum", callNum);

    // 关闭按钮点击事件。
    $('.big-cloud-control .title .close').off('click').on('click', function () {
    	var callId = $(this).parent().parent().attr("callId");
		var sn = $(this).parent().parent().attr("callSn");
		window.top.m_IdtApi.CallRel(callId, sn, 0);
		$(this).parent().parent().find('.speedInput').slider('destroy');
		$(this).parent().parent().remove();
    });
    // 向上按钮鼠标按下事件。
    $('.big-cloud-control .content .up').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
		var callId = $mainDiv.attr("callId");
		var callNum = $mainDiv.attr("callNum");
		var ctrlVal = Number($mainDiv.find('.speedVal').text());
		window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_UP,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向右按钮鼠标按下事件。
    $('.big-cloud-control .content .right').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
		var callId = $mainDiv.attr("callId");
		var callNum = $mainDiv.attr("callNum");
		var ctrlVal = Number($mainDiv.find('.speedVal').text());
		window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_RIGHT,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向下按钮鼠标按下事件。
    $('.big-cloud-control .content .down').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_DOWN,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向左按钮鼠标按下事件。
    $('.big-cloud-control .content .left').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_LEFT,'CtrlValue' : ctrlVal}), callNum);
    });
    // 放大按钮鼠标按下事件。
    $('.big-cloud-control .content .enlarge').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMWIDE,'CtrlValue' : ctrlVal}), callNum);
    });
    // 缩小按钮鼠标按下事件。
    $('.big-cloud-control .content .narrow').off('mousedown').on('mousedown', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMTELE,'CtrlValue' : ctrlVal}), callNum);
    });
    // 鼠标移出，或者放开事件。
    $('.big-cloud-control .content .ctrlBtn').off('mouseleave mouseup').on('mouseleave mouseup', function () {
    	var $mainDiv = $(this).parent().parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_STOP,'CtrlValue' : ctrlVal}), callNum);
    });
}

// 视频查看云台控制相关功能函数。
function fn_PTZControlOneVideo(callID, PTZTitle, e) {
	if (!PTZTitle || PTZTitle == '') return;
	if (!e) return;
	// 创建云台控制序号。
	var sn = fn_genSn();
	var vNum = PTZTitle.substring(PTZTitle.indexOf('【') + 1, PTZTitle.indexOf('】'));
	var dlgId = 'sureChat_commDlg_' + sn;
	// 创建云台控制操作面板。
	var htmlStr = '<div class="cloud-control" id="sureChat_commDlg_' + sn + '">\n' +
					'    <div class="title">\n' +
					'	    <div class="text">&#xe655 '+lang.dispatch.ConsoleControl+'</div>\n' +
					'	    <div class="close">&#xe6c4</div>\n' +
					'	</div>\n' +
					'	<div class="content">\n' +
					'	    <div class="control-pad">\n' +
					'	        <div class="ctrlBtn up"><div>&#xe6c7</div></div>\n' +
					'	        <div class="ctrlBtn right"><div>&#xe6c7</div></div>\n' +
					'	        <div class="ctrlBtn down"><div>&#xe6c7</div></div>\n' +
					'	        <div class="ctrlBtn left"><div>&#xe6c7</div></div>\n' +
					'	    </div>\n' +
					'	    <div class="btn-wrap">\n' +
					'	        <div class="ctrlBtn enlarge">&#xe765 '+lang.dispatch.enlarge+'</div>\n' +
					'	        <div class="ctrlBtn narrow">&#xe744 '+lang.dispatch.narrow+'</div>\n' +
					'	    </div>\n' +
					'		<div class="speed-wrap">\n' +
					'			<div class="speed-label">'+lang.dispatch.PTZCtrlRate+'：<span class="speedVal">10</span></div>\n' +
					'			<div class="speed-input"><input class="easyui-slider speedInput" value="10" style="width:150px;" data-options="min:0,max:255,step:5"/></div>\n' +
					'		</div>\n' +
					'	</div>\n' +
					'</div>\n';
	// 永远只允许有一个云台控制窗口在前台。
	$('.cloud-control').find('.speedInput').slider('destroy');
	$('.cloud-control').remove();
	$(document.body).append(htmlStr);
	$.parser.parse('#sureChat_commDlg_' + sn + ' .speed-wrap');
	$('#sureChat_commDlg_' + sn + ' .speed-wrap .speedInput').slider({
    	onChange: function(newValue, oldValue) {
    		$(this).parents('.speed-wrap').find('.speedVal').text(newValue);
    	}
    });
	// 设置云台控制对应的通讯号。
	$('#sureChat_commDlg_' + sn).attr("callId", callID);
	$('#sureChat_commDlg_' + sn).attr("callNum", vNum);
	// 设置云台控制显示位置。
	if ((e.pageY + 10 + 170) <= $(window).height()) {
		$('#sureChat_commDlg_' + sn).css({
			'left': e.pageX - 270,
	        'top': e.pageY + 10
		});
	} else {
		$('#sureChat_commDlg_' + sn).css({
			'left': e.pageX - 270,
	        'top': e.pageY -180
		});
	}

	// 设置云台控制窗口标题。
	$('.cloud-control .title .text').html('&#xe655; '+lang.dispatch.ConsoleControl+'—' + PTZTitle);
	$('.cloud-control .title .text').attr('title',PTZTitle);
	// 拖拽事件。
	$('.cloud-control .title').off('mousedown').on('mousedown',function (event) {
	    var isMove = true;
	    var abs_x = event.pageX - $('.cloud-control').offset().left;
	    var abs_y = event.pageY - $('.cloud-control').offset().top;
	    $(document).off('mousemove').on('mousemove',function (event) {
	        if (isMove) {
	            $('.cloud-control').css({
	                'left': event.pageX - abs_x,
	                'top': event.pageY - abs_y,
	                'transform': 'translate(0, 0)'
	            });
	        }
	    }).off('mouseup').on('mouseup',function () {
	        isMove = false;
	    });
	});

    // 关闭按钮点击事件。
    $('.cloud-control .title .close').off('click').on('click', function () {
    	$(this).parent().parent().find('.speedInput').slider('destroy');
		$(this).parent().parent().remove();
    });
    // 向上按钮点击事件。
    $('.cloud-control .content .up').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_UP,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向右按钮点击事件。
    $('.cloud-control .content .right').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_RIGHT,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向下按钮点击事件。
    $('.cloud-control .content .down').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_DOWN,'CtrlValue' : ctrlVal}), callNum);
    });
    // 向左按钮点击事件。
    $('.cloud-control .content .left').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_LEFT,'CtrlValue' : ctrlVal}), callNum);
    });
    // 放大按钮点击事件。
    $('.cloud-control .content .enlarge').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMWIDE,'CtrlValue' : ctrlVal}), callNum);
    });
    // 缩小按钮点击事件。
    $('.cloud-control .content .narrow').off('mousedown').on('mousedown', function () {
    	var $mainDiv =  $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMTELE,'CtrlValue' : ctrlVal}), callNum);
    });
    // 鼠标移出，或者放开事件。
    $('.cloud-control .content .ctrlBtn').off('mouseleave mouseup').on('mouseleave mouseup', function () {
    	var $mainDiv = $(this).parent().parent().parent();
    	var callId = $mainDiv.attr("callId");
    	var callNum = $mainDiv.attr("callNum");
    	var ctrlVal = Number($mainDiv.find('.speedVal').text());
    	window.top.m_IdtApi.CallSendInfo(callId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_STOP,'CtrlValue' : ctrlVal}), callNum);
    });
    return dlgId;
}

// 相关来电、视频等的振铃提示音播放。
// 开始循环播放提示音。
function fn_startRingVoice(voice, uid) {
	var $voice = $('#ring_voice_play_' + uid);
	if ($voice.length > 0) return;
	var htmlStr = '<audio autoplay="autoplay" loop="loop" id="ring_voice_play_' + uid + '"' +
					'	style="display:none; width:0px; height:0px;">' +
		  			'	<source src="static/voice/'+ voice +'"/>'+
		  			'</audio>';
	$(document.body).append(htmlStr);
}
// 结束循环播放提示音。
function fn_stopRingVoice(uid) {
	var $voice = $('#ring_voice_play_' + uid);
	if ($voice.length > 0) {
		$voice[0].pause();
		$voice.remove();
	}
}
// 循环播放提示音指定时间后停止。
function fn_ringAutoStopTimeOut(voice, iTime) {
	var uid = 'astout_' + fn_genSn();
	fn_startRingVoice(voice, uid);
	setTimeout(function(){
		fn_stopRingVoice(uid)
	}, iTime);
}
// 循环播放一遍提示音后自动停止。
function fn_ringOnceAutoStop(voice) {
	var uid = 'astout_' + fn_genSn();
	var htmlStr = '<audio autoplay="autoplay" id="ring_voice_play_' + uid + '"' +
					'	style="display:none; width:0px; height:0px;">' +
					'	<source src="static/voice/'+ voice +'"/>'+
					'</audio>';
	$(document.body).append(htmlStr);
	var $voice = $('#ring_voice_play_' + uid);
	if ($voice.length > 0) {
		$voice[0].onended = function() {
			$voice.remove();
		};
	}
}
// 查找某个人员的workInfo信息。
function fn_getUserWorkInfo(account, infoName) {
	var retVal = '';
	$.ajax({
		type : "post",
		url : "webservice/api/v1/comm/userBasic/getUserWorkInfo",
		async: false,
		dataType : "json",
		data : {
			account : account,
			infoName : infoName
		},
		success : function(data) {
			if (data && data.flag && data.flag == true) {
				retVal = data.retVal;
			} else {
				retVal = '';
			}
		}
	});
	return retVal;
}
//开启麦克风音量检测，并自动根据音量进行组呼相关处理。
function fn_MicDetect() {
    window.top.m_MicDetect = window.top.m_MicDetect || new MicDetect();
    var micDetectVal = getParaVal('micDetectVal');
    var micDetectTime = getParaVal('micDetectTime');
    if (micDetectVal == '') micDetectVal = -15.0;
    if (micDetectTime == '') micDetectTime = 3000;
    window.top.m_MicDetect.Run(micDetectVal, micDetectTime, function(status) {
    	if (status == 0) {
    		fn_micrel();
    	} else {
    		fn_makeGCallORMicCtrl();
    	}
    });
}
//关闭麦克风音量检测功能。
function fn_MicClose() {
	fn_micrel();
	if (!window.top.m_MicDetect) return;
	window.top.m_MicDetect.Stop();
}
//开启网页全屏功能。
function fn_startFullScreen() {
    var docElm = document.documentElement;
    if (docElm.requestFullscreen) {//W3C
        docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {//FireFox
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {//Chrome等
        docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {//IE11
        docElm.msRequestFullscreen();
    }
}
//关闭网页全屏功能。
function fn_closeFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}
//计算通话时长。
function fn_computeTimeLen(value) {
	if (value) {
		var timeLong = Number(value);
		if (!timeLong || isNaN(timeLong) || timeLong<=0 ) return '';
		var h = parseInt(timeLong / 3600);
		var m = parseInt((timeLong % 3600)/60);
		var s = timeLong % 60;
		var str='';
		if (h>0) str+=h+':';
		if (m>0) str+=m+'\'';
		if (s>0) str+=s+'"';
		return str;
	} else {
		return '0\"';
	}
}
//将无效内容转换为空字符串。
function fn_conVal(val) {
	if (!val) val='';
	return val;
}
//手咪串并口通讯检测程序。
function fn_handyPressCheck() {
	var msCommListen = window.top.getParaVal('msCommListen');
	if (msCommListen == 'false' || msCommListen == '') return;
	var ws = {};
	if (!("WebSocket" in window)) ws = null;
	if (ws) {// 判断浏览器是否支持websocket协议。
		// 判断当前WEBSOCKET连接是否已建立
		if (!ws.readyState || ws.readyState == 3) {// 未建立连接，则创建连接。
//			var wsUrlStr = 'ws://10.1.1.35:10404';
			var wsUrlStr = 'ws://127.0.0.1:10404';
			ws = new SureChatWebSocket(wsUrlStr, null, {
				debug : false,
				reconnectInterval : 4000
			});
			ws.onopen = function() {};
			ws.onmessage = function(evt) {
				var received_msg = evt.data;
				if (received_msg == 'AA48FF') { //按下手咪按键
					fn_makeGCallORMicCtrl();
				} else if (received_msg == 'AA40FF') { //松开手咪按键
					fn_micrel();
				}
			};
			ws.onclose = function() {
				prompt('error',"串并口通讯的websocket连接已关闭！",1000);
			};
		} else {// 已建立连接，则提示不能重复创建连接。
			prompt('error',"串并口通讯的websocket连接已经创建，不允许重复创建！",1000);
		}
	} else {// 不支持则予以提示。
		prompt('error',"您的浏览器不支持websocket！",1000);
	}
}

//摄像头通道选择窗通用弹窗方法。
function fn_openCamChanChooseDlg(viewNum, viewName, chanNum, acceptFn, refuseFn) {
	if (!chanNum || chanNum < 1) return;
	if ($('.CamChanChoose-window').length > 0) {
		prompt('error',"只允许同时打开一个通道选择窗！",1000);
		return;
	}
	var htmlStr = '<div class="CamChanChoose-window"><div class="CamChanChoose-title">【'+viewNum+'】'+viewName+'视频查看<span class="close-window">x<span></div><ul class="CamChanChoose-list">';
	for (var i = 1; i <= chanNum; i ++ ) {
		htmlStr += '<li chanNum="' + i + '"><img src="static/img/cam.png"/><div>通道' + i + '</div></li>';
	}
	htmlStr += '</ul></div>';
	$(document.body).append(htmlStr);
	$('.CamChanChoose-window .close-window').off('click').on('click',function() {//关闭按钮点击事件。
		$('.CamChanChoose-window').remove();
		if (refuseFn && typeof(refuseFn) == 'function') refuseFn();
	});
	$('.CamChanChoose-list').off('click').on('click', 'li', function() { //点击相关通道事件。
		var myCamChanNum = $(this).attr('chanNum');
		$('.CamChanChoose-window').remove();
		if (acceptFn && typeof(acceptFn) == 'function') acceptFn(myCamChanNum);
	});
}

//检查要查看视频的对象是否已经在视频查看窗口中存在。
function fn_isExistViewNum(viewNum) {
	var existFlag = false;
	if (!viewNum) return existFlag;
	var $viewLi = $('.video-task-wrap>.video-task>ul>li');
	for (var i = 0; i < $viewLi.length; i ++) {
		var curViewNum = $viewLi.eq(i).attr('viewNum');
		if (curViewNum && curViewNum == viewNum) {
			existFlag = true;
			break;
		}
	}
	return existFlag;
}

//获取commapi接口下的其它单位树与GPS信息的接口调用通用方法。
function fn_getCommApiData(ajaxUrl, methodUrl, inParam) {
	var retData = null;
	if (!inParam) inParam = '';
	$.ajax({
		type : "POST",
		url : ajaxUrl,
		timeout : 300000,
		async: false, //使用同步的方式,true为异步方式。
		data : {
			'methodUrl' : methodUrl,
			'inParam' : inParam
		},
		dataType : "json",
		error : function (XMLHttpRequest, textStatus, errorThrown) { //调取commapi接口失败。
		},
		success : function(data) {
			if (data && data.success && data.success == 'true') { //调取commapi接口成功。
				retData = data.result;
			} else { //调取commapi接口失败。
			}
		}
	});
	return retData;
}

//定时获取commapi接口下的GPS信息，并在地图中展示出来。
function fn_otherPlatUserMapShow() {
	var self = this;
	this.maxTime = '';
	this.endUser = {};
	setInterval(gpsInfoRefresh, 5000);
	function gpsInfoRefresh() {
		if (!window.top.map) return;
		var map = window.top.map;
		var inParam = '';
		if (self.maxTime && self.maxTime != '') {
			var timeJson = {
				'curTime' : self.maxTime
			};
			inParam = JSON.stringify(timeJson);
		}
		var gpsInfoArr = fn_getCommApiData('CommApi/array', 'getUsersGps', inParam);
		var mapInitPoint = getParaVal('mapInitPoint');
		var mapInitPointArr = mapInitPoint.split(',');
		for (var i = 0; i < gpsInfoArr.length; i ++) {
			var nowTime = fn_conVal(gpsInfoArr[i].TIME);
			if (nowTime > self.maxTime) self.maxTime = nowTime;
			var attrVal = fn_conVal(gpsInfoArr[i].ATTR);
			var imgSrc = 'static/devCateImg/' + attrVal + '.png';
			if (!attrVal || !attrVal.length || attrVal.length != 3 || attrVal < '200' || attrVal > '213') {
				imgSrc = 'static/devCateImg/201.png';
			}
			var bgcolor = '#145385';
			if (attrVal == '200') {
				bgcolor = '#9E6B99';
			} else if (attrVal == '201' || attrVal == '202' || attrVal == '203') {
				bgcolor = '#145385';
			} else if (attrVal == '204' || attrVal == '205') {
				bgcolor = '#D18315';
			} else if (attrVal == '206' || attrVal == '207' || attrVal == '208') {
				bgcolor = '#006100';
			} else if (attrVal == '209') {
				bgcolor = '#77ABCF';
			} else if (attrVal == '210' || attrVal == '211' || attrVal == '213') {
				bgcolor = '#A01A1A';
			}
			if (window.top.myMapType == 'baidu') {
				var point = BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1]));
				if (gpsInfoArr[i].LONGITUDE && gpsInfoArr[i].LATITUDE && !isNaN(gpsInfoArr[i].LONGITUDE) && !isNaN(gpsInfoArr[i].LATITUDE)) {
					point = BMap.BPoint(Number(gpsInfoArr[i].LONGITUDE),Number(gpsInfoArr[i].LATITUDE));
				}
				if (self.endUser[gpsInfoArr[i].NUM]) {
					self.endUser[gpsInfoArr[i].NUM].move(point);
				} else {
					var endUserMarker = new EndUserOverlay(point,gpsInfoArr[i].NUM,gpsInfoArr[i].NAME,imgSrc,true,bgcolor,gpsInfoArr[i].STATUS);
					self.endUser[gpsInfoArr[i].NUM] = endUserMarker;
					map.addOverlay(endUserMarker);
				}
			} else if (window.top.myMapType == 'google') {
				var glatlng = wgs2gcj(Number(mapInitPointArr[1]) , Number(mapInitPointArr[0]));
				var lat = glatlng[0];
				var lng = glatlng[1];
				var point = new google.maps.LatLng(Number(lat), Number(lng));
				if (gpsInfoArr[i].LONGITUDE && gpsInfoArr[i].LATITUDE && !isNaN(gpsInfoArr[i].LONGITUDE) && !isNaN(gpsInfoArr[i].LATITUDE)) {
					var glatlng2 = wgs2gcj(Number(gpsInfoArr[i].LATITUDE) , Number(gpsInfoArr[i].LONGITUDE));
					var lat2 = glatlng2[0];
					var lng2 = glatlng2[1];
					point = new google.maps.LatLng(Number(lat2), Number(lng2));
				}
				if (self.endUser[gpsInfoArr[i].NUM]) {
					self.endUser[gpsInfoArr[i].NUM].move(point);
				} else {
					var overlay = new myOverlay(point,gpsInfoArr[i].NUM,gpsInfoArr[i].NAME,imgSrc,true,bgcolor,gpsInfoArr[i].STATUS);
					self.endUser[gpsInfoArr[i].NUM] = overlay;
					addGoogleOverlay(overlay);
				}
			}
		}
	}
}

//保持当前登陆用户会话活性的通用方法。
function fn_keepLive() {
	setInterval(keepLiveAjax, 10000);
	function keepLiveAjax() {
		$.ajax({
			type : "POST",
			url : "webservice/api/v1/comm/basic/keepLive",
			timeout : 2000,
			async: false, //使用同步的方式,true为异步方式。
			dataType : "json",
			error : function (XMLHttpRequest, textStatus, errorThrown) { //调取ajax接口失败。
			},
			success : function(data) {
			}
		});
	}
}

//自定义的信息窗自动平移方法。
function fn_mapPan(point) {
	if (!window.map || !point) return;
	var pixel = window.map.pointToOverlayPixel(point);
	pixel.x = pixel.x;
	pixel.y = pixel.y - 170;
	var newPoint = window.map.overlayPixelToPoint(pixel);
	setTimeout(function() {
		window.map.panTo(newPoint);
	}, 500);
}

// 弹出拨号盘对话框。
function fn_openKeyDialDlg(okFn) {
	var htmlStr = '<div class="keyDial-wrap">' +
						'<div class="icon title">&#xe63d;&nbsp;' + lang.dispatch.Dial + '<span class="winClose">×</span></div>' +
						'<div class="top">' +
						'	<input type="text" class="phoneNum"/>' +
						'	<div>' +
						'		<div class="icon delete">&#xe656;</div>' +
						'		<div class="icon clear">&#xe6c4;</div>' +
						'	</div>' +
						'</div>' +
						'<ul class="clearfix keyboard">' +
							'<li>1</li><li>2</li><li>3</li>' +
							'<li>4</li><li>5</li><li>6</li>' +
							'<li>7</li><li>8</li><li>9</li>' +
							'<li>*</li><li>0</li><li>#</li>' +
						'</ul>' +
						'<div class="icon footer">&#xe628;&nbsp;&nbsp;' + lang.common.confirm + '</div>' +
				  '</div>';
	if ($('.keyDial-wrap').length <= 0) {
		$(document.body).append(htmlStr);
	}
	// 弹窗拖拽事件。
	$('.keyDial-wrap>.title').off('mousedown').on('mousedown',function (event) {
        var isMove = true;
        var abs_x = event.pageX - $('.keyDial-wrap').offset().left;
        var abs_y = event.pageY - $('.keyDial-wrap').offset().top;
        $(document).off('mousemove').on('mousemove',function (event) {
            if (isMove) {
                $('.keyDial-wrap').css({
                    'left': event.pageX - abs_x,
                    'top': event.pageY - abs_y,
                    'transform': 'none'
                });
            }
        }).off('mouseup').on('mouseup',function () {
            isMove = false;
        });
    });
	// 弹窗关闭按钮点击事件。
	$('.keyDial-wrap .winClose').off('click').on('click', function(event) {
		$('.keyDial-wrap').remove();
	});
	// 退格按钮点击事件。
	$('.keyDial-wrap .top .delete').off('click').on('click', function(event) {
		var numValue = $('.keyDial-wrap .top .phoneNum').val();
		if (numValue && numValue.length && numValue.length > 0) {
			numValue = numValue.substring(0, numValue.length - 1);
			$('.keyDial-wrap .top .phoneNum').focus();
			$('.keyDial-wrap .top .phoneNum').val(numValue);
		}
	});
	// 清空按钮点击事件。
	$('.keyDial-wrap .top .clear').off('click').on('click', function(event) {
		$('.keyDial-wrap .top .phoneNum').focus();
		$('.keyDial-wrap .top .phoneNum').val('');
	});
	// 相关数据按键点击事件。
	$(".keyDial-wrap .keyboard").off('click').on("click", 'li', function(event) {
		var numValue = $('.keyDial-wrap .top .phoneNum').val();
		numValue += $(this).html();
		$('.keyDial-wrap .top .phoneNum').focus();
		$('.keyDial-wrap .top .phoneNum').val(numValue);
	});
	// 确认按钮点击事件。
	$('.keyDial-wrap .footer').off('click').on('click', function(event) {
		var numValue = $('.keyDial-wrap .top .phoneNum').val();
		$('.keyDial-wrap').remove();
		if (okFn && typeof(okFn) == 'function' && numValue != '') okFn(numValue);
	});
	// 电话号码内容变化校验代码。
	$('.keyDial-wrap .top .phoneNum').on('input', function(event) {
		var numValue = $(this).val();
		if (!numValue || !numValue.length || numValue == '') return;
		var matchStr = '0123456789*#';
		var resultStr = '';
		for (var i = 0; i < numValue.length; i ++) {
			var charStr = numValue[i];
			if (matchStr.indexOf(charStr) != -1) {
				resultStr += charStr;
			}
		}
		$(this).val(resultStr);
		$(this).textFocus(resultStr.length);
		$(this).scrollLeft($(this).scrollWidth + 50);
	});
}

function fn_Rs232_CommCheck_new(WS_Param) {
	console.log("fn_Rs232_CommCheck_new: entering");

	var ws = null;
	var wsUrlStr = 'ws://localhost:60232';

	try {
		if (typeof MozWebSocket == 'function')
			WebSocket = MozWebSocket;
		if ( ws && ws.readyState == 1 )
			ws.close();

		ws = new WebSocket( wsUrlStr );
		window.top.Rs232WS = ws;
		WS_Param.Rs232WS = ws;
		ws.onopen = function (evt) {
			console.log("fn_Rs232_CommCheck_new:", "Web socket connected - " + wsUrlStr)
			console.log( evt );
		};
		//console.log(WS_Param)

		ws.onclose = function (evt) {
			console.log("fn_Rs232_CommCheck_new:", "DISCONNECTED" );
		};

		ws.onmessage = function (evt) {
			var received_msg = evt.data;
			console.log("received data: ", received_msg);
			var cmd = eval('(' + received_msg + ')');
			//console.log(cmd);

			if (cmd.type="command") {
				if (cmd.command=="start") { //按下手咪按键
					console.log("按下手咪按键: fn_makeGCallORMicCtrl");
					fn_makeGCallORMicCtrl();
				} else if (cmd.command == 'end') { //松开手咪按键
					console.log("松开手咪按键: fn_micrel");
					fn_micrel();
				}
			}
		};

		ws.onerror = function (evt) {
			//console.log("fn_Rs232_CommCheck_new:", 'ERROR -', evt);
		};

		ws.send_busy = function() {
			ws.send( 'busy' );
			console.log("fn_Rs232_CommCheck_new:", 'busy sent');
		};

		ws.send_free = function() {
			ws.send( 'free' )
			console.log("fn_Rs232_CommCheck_new:", 'free sent');
		};
	} catch (exception) {
		console.log("fn_Rs232_CommCheck_new:", 'ERROR: ' + exception);
	}
}

function MicCallRelease() {
    // 模拟释放呼叫会话
    console.log("松开手咪按键: fn_micrel");
    fn_micrel();
}