
function myBrowser()
{
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera)
    {
        return "Opera"
    }; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1)
    {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1)
    {
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1)
    {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera)
    {
        return "IE";
    }; //判断是否IE浏览器

    if (!!window.ActiveXObject || "ActiveXObject" in window)
    {
        return "IE";
    }
    return "Unknown";
}

var id_video_my, id_video_peer;

window.onload = function()
{
    //判断是哪个浏览器,设置使用的窗口
    var strB = myBrowser();
    
    if ("IE" == strB)
    {
        if (null != id_video_my_o.object)//OCX已注册
        {
            id_video_my             = id_video_my_o;
            id_video_peer           = id_video_peer_o;
            document.getElementById("id_video_my_v").style.display="none";
            document.getElementById("id_video_peer_v").style.display="none";
            document.getElementById("id_video_my_down").style.display="none";
            document.getElementById("id_video_peer_down").style.display="none";
        }
        else//OCX未注册
        {
            id_video_my             = null;
            id_video_peer           = null;
            document.getElementById("id_video_my_v").style.display="none";
            document.getElementById("id_video_peer_v").style.display="none";
            document.getElementById("id_video_my_o").style.display="none";
            document.getElementById("id_video_peer_o").style.display="none";
        }
    }
    else
    {
        id_video_my             = id_video_my_v;
        id_video_peer           = id_video_peer_v;
        document.getElementById("id_video_my_o").style.display="none";
        document.getElementById("id_video_peer_o").style.display="none";
        document.getElementById("id_video_my_down").style.display="none";
        document.getElementById("id_video_peer_down").style.display="none";
    }

    //判断URL地址,填写MC地址
    
    var strSrvAddr = document.getElementById("id_srv_addr");
    var strGpsSrvAddr = document.getElementById("id_gpssrv_addr");
    
    if (-1 != window.location.href.indexOf('file:///'))//本地文件
    {
        strSrvAddr.value = "ws://IPAddr:10004";
        strGpsSrvAddr.value = "ws://IPAddr:10005";
    }
    else
    {
        var strIp = window.location.href.split("//")[1];    
        
        strIp = strIp.split(":")[0];
        if (-1 == window.location.href.indexOf('https'))
        {
            //用WS
            strSrvAddr.value = "ws://" + strIp + ":10004";
            strGpsSrvAddr.value = "ws://" + strIp + ":10005";
        }
        else
        {
            //用WSS
            strSrvAddr.value = "wss://" + strIp + ":8801/mc_wss";
            strGpsSrvAddr.value = "wss://" + strIp + ":8801/gs_wss";
        }
    }
    return 0;
}


var g_ShowHB = false;

//是否显示心跳
function fn_ck_msgrx(){
    var cbk = document.getElementById('id_ck_msgrx');
    if (cbk.checked == false)
    {
        g_ShowHB = false;
    }
    else
    {
        g_ShowHB = true;
    }
}

//--------------------------------------------------------------------------------
//      收到消息的钩子函数,调试用
//  输入:
//      link:           链路名
//      msg:            收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onRecvMsgHook(link, msg)
{
    if (false == g_ShowHB && msg.MsgCode == IDT.MSG_HB)
        return;
        
	var strOld = document.getElementById("id_rxtx_msg").value;
    var strMsg = JSON.stringify(msg);
    // \\->\
    var strMsg1 = strMsg.replace(new RegExp("\\\\\\\\", "g"), "\\");
	document.getElementById("id_rxtx_msg").value = strOld + link + ":<--Rx--" + strMsg1 + "\r\n";
    return 0;
}
//--------------------------------------------------------------------------------
//      发送消息的钩子函数,调试用
//  输入:
//      link:           链路名
//      msg:            收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onSendMsgHook(link, msg)
{
    if (false == g_ShowHB)
    {
        if (IDT.MSG_HB == msg.MsgCode)
            return;
        if (IDT.MSG_MM_STATUSSUBS == msg.MsgCode)
        {
            if (0 == msg.MsgBody.SN)
                return;
        }
    }
        
	var strOld = document.getElementById("id_rxtx_msg").value;
    var strMsg = JSON.stringify(msg);
    // \\->\
    var strMsg1 = strMsg.replace(new RegExp("\\\\\\\\", "g"), "\\"); 
	document.getElementById("id_rxtx_msg").value = strOld + link + ":--Tx-->" + strMsg1 + "\r\n";
    return 0;
}
//--------------------------------------------------------------------------------
//      状态指示
//  输入:
//      status:         状态
//      usCause:        原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onStatusInd(status, usCause)
{
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onStatusInd", status, usCause);
    var statusCtrl = document.getElementById("id_status");
    if (0 == status)//离线
    {
		statusCtrl.textContent = PUtility.PGetCurTime() + "  " + "离线 " + IDT.GetCauseStr(usCause);
    }
    else//在线
    {
		statusCtrl.textContent = PUtility.PGetCurTime() + "  " + "在线 " + IDT.GetCauseStr(usCause);
        m_IdtApi.StatusSubs(IDT.GU_STATUSSUBS_STR_ALL, IDT.GU_STATUSSUBS_DETAIL1);

        //加载组织下所有用户和组
        fn_UQueryAll();
        fn_GQueryAll();
    }
    return 0;
}
//--------------------------------------------------------------------------------
//      组信息指示
//  输入:
//      gInfo:          组Jason对象
//          Prio:       优先级,1~7,越小越高
//          Type:       GROUP_MEMBERTYPE_USER等,用户还是组
//          UTType:     终端类型,UT_TYPE_TAP等.如果是组,此字段无效
//          Attr:       终端属性,UT_ATTR_HS等,显示用.如果号码不是终端,无效
//          Num:        号码
//          Name:       名字
//          AGNum:      附加组号码,通常用做视频组
//          ChanNum:    摄像头通道个数,如果号码不是摄像头,无效
//          Status:     主状态,UT_STATUS_OFFLINE等
//          FGCount:    父组个数
//          FGNum:      父组号码
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onGInfoInd(gInfo)
{
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onGInfoInd", gInfo);

    var strGroup = '';
    var i;
    if (null != gInfo)
    {
        for (i = 0; i < gInfo.length; i++)
        {
            strGroup += gInfo[i].Num + '(' + gInfo[i].Name + ') ';
        }
    }
    document.getElementById("id_my_group").textContent = strGroup;

    return 0;

    //加载组织下所有用户和组
    fn_UQueryAll();
    fn_GQueryAll();
    return 0;    
}
//--------------------------------------------------------------------------------
//      收到即时消息指示
//  输入:
//      pucSn:          序号
//      dwType:         及时消息类型
//      pcFrom:         源号码
//      pcFromName:     源名字
//      pcTo:           目的号码,#+号码:表示是组号码
//      pcOriTo:        原始目的号码
//      pcTxt:          文本内容
//      pcFileName:     文件名
//      pcSourceFileName:源文件名
//      pcTime:         发送的时间
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onIMRecv(pucSn, dwType, pcFrom, pcFromName, pcTo, pcOriTo, pcTxt, pcFileName, pcSourceFileName, pcTime)
{
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onIMRecv", pucSn, dwType, pcFrom, pcFromName, pcTo, pcOriTo, pcTxt, pcFileName, pcSourceFileName, pcTime);
    return 0;
}
//--------------------------------------------------------------------------------
//      IM状态指示
//  输入:
//      dwSn:           消息事务号
//      pucSn:          系统的事务号
//      dwType:         及时消息类型
//      ucStatus:       状态,PTE_CODE_TXCFM
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onIMStatusInd(dwSn, pucSn, dwType, ucStatus)
{
    //PTE_CODE_TXCFM=2
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onIMStatusInd", dwSn, pucSn, dwType, ucStatus);
    return 0;
}

//--------------------------------------------------------------------------------
//      组/用户OAM操作指示
//  输入:
//      dwOptCode:      操作码
//                      OPT_USER_ADD        pucUNum,pucUName,ucUAttr有效
//                      OPT_USER_DEL        pucUNum有效
//                      OPT_USER_MODIFY     pucUNum,pucUName,ucUAttr有效
//                      OPT_G_ADD           pucGNum,pucGName有效
//                      OPT_G_DEL           pucGNum有效
//                      OPT_G_MODIFY        pucGNum,pucGName有效
//                      OPT_G_ADDUSER       pucGNum,pucUNum,pucUName,ucUAttr有效
//                      OPT_G_DELUSER       pucGNum,pucUNum有效
//                      OPT_G_MODIFYUSER    pucGNum,pucUNum,pucUName,ucUAttr有效
//      pucGNum:        组号码
//      pucGName:       组名字
//      pucUNum:        用户号码
//      pucUName:       用户名字
//      ucUAttr:        用户属性
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onGUOamInd(dwOptCode, pucGNum, pucGName, pucUNum, pucUName, ucUAttr)
{
    return 0;
}
//--------------------------------------------------------------------------------
//      组/用户状态指示
//  输入:
//      GMemberStatus   组/用户状态Json对象
//[{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
//{
//  Type: 2,                GROUP_MEMBERTYPE_USER(1)    GROUP_MEMBERTYPE_GROUP(2)
//  Num: "1115",            字符串
//  Status: 1,              UT_STATUS_OFFLINE(0)        UT_STATUS_ONLINE(1)
//  GpsReport: 0,           暂时不使用.是否正在上报GPS,0未上报,1正在上报
//  CallNum: 0,             呼叫个数
//      []                  呼叫数组
//      CallType :%d,       SRV_TYPE_BASIC_CALL
//      CallStatus:%d,      GU_STATUSCALL_OALERT
//      CallId:%d,          CSAID，内部使用，可以不理会
//      PeerNum:%s,         对端号码
//      PeerName\":\"%s\"}  对端名字
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onGUStatusInd(GMemberStatus)
{
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onGUStatusInd", GMemberStatus);
    return 0;
}

//--------------------------------------------------------------------------------
//      GPS数据指示,获得其他用户的GPS记录
//  输入:
//      GpsRecStr:      GPS记录信息,Json格式
//  Num:    "986001",
//  Status: 1   //不使用
//  Count   1   //GpsInfo数组个数
//  GpsInfo:
//  [
//      {Longitude:"113.943718", Latitude:"22.543962", Speed:"0.000000", Direction:"0.000000", Time:"2017-11-11 16:59:59"}
//  ]
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onGpsRecInd(GpsRecStr)
{
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onGpsRecInd", GpsRecStr);
    return 0;
}

//--------------------------------------------------------------------------------
//      GPS历史数据指示
//  输入:
//      UsrNum:         用户号码
//      sn:             操作序号
//      EndFlag:        结束标志,0未结束,1结束
//      GpsRecStr:      GPS记录信息,Json格式
//  Num:    "986001",
//  Status: 1   //不使用
//  Count   1   //GpsInfo数组个数
//  GpsInfo:
//  [
//      {Longitude:"113.943718", Latitude:"22.543962", Speed:"0.000000", Direction:"0.000000", Time:"2017-11-11 16:59:59"}
//  ]
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onGpsHisQueryInd(UsrNum, sn, EndFlag, GpsRecStr)
{
//986001,0,2017-11-11 00:00:00,2017-11-11 23:59:59
    PUtility.Log("IDTUser", PUtility.PGetCurTime(), "onGpsHisQueryInd", UsrNum, sn, EndFlag, GpsRecStr);
    return 0;
}

var m_CallId = -1, m_CallRef, m_ARx = 0, m_ATx = 0, m_VRx = 0, m_VTx = 0;
//--------------------------------------------------------------------------------
//      呼叫信息指示
//  输入:
//      event:          事件
//          IDT.CALL_EVENT_Rel:             event, UsrCtx, ID(IDT的呼叫ID), ucClose(IDT.CLOSE_BYUSER), usCause(IDT.CAUSE_ZERO)
//          IDT.CALL_EVENT_PeerAnswer:      event, UsrCtx, PeerNum, PeerName, SrvType(可能与发出时不同.例如想发起组呼(主控),但变成组呼接入)
//          IDT.CALL_EVENT_In:              event, ID(此时是IDT的呼叫ID,不是用户上下文), pcPeerNum, pcPeerName, SrvType, bIsGCall, ARx, ATx, VRx, VTx
//          IDT.CALL_EVENT_MicInd:          event, UsrCtx, ind(0听话,1讲话)
//          IDT.CALL_EVENT_RecvInfo:        event, UsrCtx, Info, InfoStr
//          IDT.CALL_EVENT_TalkingIDInd:    event, UsrCtx, TalkingNum, TalkingName
//          IDT.CALL_EVENT_ConfCtrlInd:     event, UsrCtx, Info{Info(IDT.SRV_INFO_MICREL), InfoStr}
//          IDT.CALL_EVENT_ConfStatusRsp:   event, UsrCtx(无效), MsgBody
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
function onCallInd(event)
{
    var params = arguments.length;
    
    switch (event)
    {
    case IDT.CALL_EVENT_Rel://event, UsrCtx, ID(IDT的呼叫ID), ucClose(IDT.CLOSE_BYUSER), usCause(IDT.CAUSE_ZERO)
        if (params < 5)
            return -1;
        PUtility.Log("IDTUser", PUtility.PGetCurTime(), "CALL_EVENT_Rel", event, arguments[1], arguments[2], arguments[3], IDT.GetCauseStr(arguments[4]));
        var calltime = document.getElementById("id_call_time");
    	calltime.textContent += "~";
        calltime.textContent += PUtility.PGetCurTime();
        calltime.textContent += "  ";
        calltime.textContent += IDT.GetCloseStr(arguments[3]);
        calltime.textContent += ":";
        calltime.textContent += IDT.GetCauseStr(arguments[4]);

        var callinfo = document.getElementById("id_call_info");
    	callinfo.textContent = '讲话指示:';
        var callinfo = document.getElementById("id_call_talkinfo");
    	callinfo.textContent = '讲话方:';
        
        m_CallId = -1;
        break;

    case IDT.CALL_EVENT_PeerAnswer://event, UsrCtx, PeerNum, PeerName, SrvType(可能与发出时不同.例如想发起组呼(主控),但变成组呼接入), UserMark, UserCallRef
        if (params < 5)
            return -1;
        m_CallRef = arguments[2];
        PUtility.Log("IDTUser", PUtility.PGetCurTime(), "CALL_EVENT_PeerAnswer", event, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
        //m_IdtApi.CallConfCtrlReq(m_CallId, null, IDT.SRV_INFO_AUTOMICON, 1);//0是台上话权,1是台下话权.自由发言只针对台下话权        
        break;
        
    case IDT.CALL_EVENT_In://event, ID(此时是IDT的呼叫ID,不是用户上下文), pcPeerNum, pcPeerName, SrvType, bIsGCall, ARx, ATx, VRx, VTx, UserMark, UserCallRef
        if (params < 10)
            return -1;
        //此时UsrCtx是IDT的callid,同CallMakeOut的返回值
        PUtility.Log("IDTUser", PUtility.PGetCurTime(), "CALL_EVENT_In", event, arguments[1], arguments[2], arguments[3], arguments[4],
            arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11]);
        var calltime = document.getElementById("id_call_time");
    	calltime.textContent = arguments[2] + '(' + arguments[3] + ')入呼叫-媒体属性(' + arguments[6] + arguments[7] + arguments[8] + arguments[9] + ')';
        m_CallId = arguments[1];
        m_ARx = arguments[6];
        m_ATx = arguments[7];
        m_VRx = arguments[8];
        m_VTx = arguments[9];

        if (IDT.SRV_TYPE_CONF == arguments[4] && true == arguments[5])//是组呼
        {
            fn_answer();
            var callinfo = document.getElementById("id_call_info");
        	callinfo.textContent = '讲话指示:0';
        }
        break;
        
    case IDT.CALL_EVENT_MicInd://event, UsrCtx, ind(0听话,1讲话)
        if (params < 3)
            return -1;
        var callinfo = document.getElementById("id_call_info");
    	callinfo.textContent = '讲话指示:' + arguments[2];
        break;
        
    case IDT.CALL_EVENT_RecvInfo://event, UsrCtx, Info, InfoStr
        if (params < 4)
            return -1;
        var callinfo = document.getElementById("id_call_info");
    	callinfo.textContent = '信息码:' + arguments[2] + ':' + arguments[3];
        break;
        
    case IDT.CALL_EVENT_TalkingIDInd://event, UsrCtx, TalkingNum, TalkingName
        if (params < 4)
            return -1;
        var callinfo = document.getElementById("id_call_talkinfo");
    	callinfo.textContent = '讲话方' + arguments[2] + ':' + arguments[3];
        break;
        
    case IDT.CALL_EVENT_ConfCtrlInd://event, UsrCtx, Info{Info(IDT.SRV_INFO_MICREL), InfoStr}
        if (params < 3)
            return -1;
        PUtility.Log("IDTUser", PUtility.PGetCurTime(), "CALL_EVENT_ConfCtrlInd", event, arguments[1], arguments[2]);
        break;
        
    case IDT.CALL_EVENT_ConfStatusRsp://event, UsrCtx(无效), MsgBody
        if (params < 3)
            return -1;
        PUtility.Log("IDTUser", PUtility.PGetCurTime(), "CALL_EVENT_ConfStatusRsp", event, arguments[1], arguments[2]);
        break;

    default:
        break;
    }
    return 0;
}


var m_IdtApi = null;
// 启动
function fn_Start()
{
	if (null == m_IdtApi)
	{
        m_IdtApi = new CIdtApi();
        //m_IdtApi.RUN_MODE = m_IdtApi.RUN_MODE_RELEASE;
	}
    var strSrvUrl = document.getElementById("id_srv_addr").value;
    var strGpsSrvUrl = document.getElementById("id_gpssrv_addr").value;
    var strUserId = document.getElementById("id_my_num").value;
    var strPwd = document.getElementById("id_my_pwd").value;
    var CallBack = 
    {
        onRecvMsgHook : onRecvMsgHook,          //收到消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
        onSendMsgHook : onSendMsgHook,          //发送消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
        onStatusInd : onStatusInd,              //登录状态指示
        onGInfoInd  : onGInfoInd,               //组信息指示,指示用户在哪些组里面
        onIMRecv    : onIMRecv,                 //短信接收指示
        onIMStatusInd : onIMStatusInd,          //短信状态指示
        onGUOamInd  : onGUOamInd,               //用户/组OAM操作指示
        onGUStatusInd : onGUStatusInd,          //用户/组状态指示
        onGpsRecInd : onGpsRecInd,              //GPS数据指示
        onGpsHisQueryInd : onGpsHisQueryInd,    //GPS历史数据查询响应
        onCallInd   : onCallInd                 //呼叫指示
    };

    var bIsIe = false;
    if ("IE" == myBrowser())
    {
        bIsIe = true;
    }
    
	m_IdtApi.Start(strSrvUrl, strGpsSrvUrl, strUserId, strPwd, 32, 32, 1, 4096, CallBack, bIsIe);
}

// 退出
function fn_Exit()
{
    m_IdtApi.Exit();
    m_IdtApi = null;
}

//bRes:     是否操作成功,false失败,true成功
//cause:    错误原因值,IDT.CAUSE_ZERO等
//strCause: 错误字符串
//MsgBody:  操作返回消息,Json对象
function fn_OamCallBack(bRes, cause, strCause, MsgBody)
{
    var xx = 0;
    return 0;
}

function fn_OamCallBack_UQueryAll(bRes, cause, strCause, MsgBody)
{
    var i;
    for (i = 0; i < MsgBody.GNumU; i++)
    {
        m_IdtApi.GpsSubs(MsgBody.GMember[i].Num, IDT.GU_STATUSSUBS_DETAIL1)
    }
    return 0;
}

function fn_ReadGps()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '",fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{\\\"type\\\":0}","toDesc":"';//0:查询 1:查询响应 2.设置 3设置响应
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":1}';//0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_SetGps()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '",fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{\\\"open\\\":true,\\\"type\\\":2}","toDesc":"';//0:查询 1:查询响应 2.设置 3设置响应
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":1}';//0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_ReadVideoParam()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '",fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{\\\"type\\\":0}","toDesc":"';//0:查询 1:查询响应 2.设置 3设置响应
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":2}';//0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_SetVideoParam()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '",fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{';
    strText += '\\\"type\\\":2,\\\"bitrate\\\":2200,\\\"framerate\\\":25,\\\"resolution\\\":\\\"1920*1080\\\",';//0:查询 1:查询响应 2.设置 3设置响应
    strText += '\\\"videoPara\\\":{\\\"maxBitrate\\\":3000,\\\"maxFramerate\\\":30,\\\"minBitrate\\\":300,\\\"minFramerate\\\":5,\\\"resolutionList\\\":[\\\"320*240\\\",\\\"640*480\\\",\\\"1280*720\\\",\\\"1920*1080\\\",\\\"480*720\\\"]}';
    strText += '}","toDesc":"';
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":2}';//0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_TransVideo()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strWatchDown = document.getElementById("id_watchdown_num").value;

    //发送给strTo,让strTo查看strWatchDown的视频
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '","fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{';
    strText += '\\\"toNum\\\":\\\"';
    strText += strWatchDown;
    strText += '\\\",\\\"toNumDesc\\\":\\\"';
    strText += strWatchDown;
    strText += '\\\",\\\"type\\\":2,\\\"userList\\\":[]';//0:查询 1:查询响应 2.设置 3设置响应
    strText += '}","toDesc":"';
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":4}';//0:会议相关信息  1:表示终端Gps设置相关  2:视频参数设置  3.用户头像等属性改变 4.视频转发 6.表示sos消息

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_ScreenVideo()
{
    var strTo = document.getElementById("id_msmgr_num").value;
    var strFrom = document.getElementById("id_my_num").value;

    //发送给strTo,让strTo查看strWatchDown的视频
    var strText = '{"fromDesc":"';
    strText += strFrom;
    strText += '","fromNumber":"';
    strText += strFrom;
    strText += '","messageId":"2018-03-13","subPara":"{';
    strText += '\\\"messageId\\\":1533720661900,';
    strText += '\\\"type\\\":1}","toDesc":"';
    strText += strTo;
    strText += '","toNumber":"';
    strText += strTo;
    strText += '","type":7}';

    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

//添加组织
function fn_OAdd()
{
//      pucOName:       组织名字
//      ucType:         类型
//      pucODesc:       组织描述
//      dwUserNum:      用户总数
//      dwDsNum:        调度台总数
//      dwGNum:         组个数
//      dwEUNum:        终端用户数
//      pucDs0Num:      初始调度台号码
//      pucDs0Pwd:      初始调度台名字
//      pucDsDispName:  调度台显示名字
//      pucDsIcon:      调度台图标
//      pucAppDispName: APP显示名字
//      pucAppIcon:     APP图标
//      pucUSegStart:   用户号段开始
//      pucUSegEnd:     用户号段结束
//      pucGSegStart:   组号段开始
//      pucGSegEnd:     组号段结束
//      pucDSSegStart:  调度台号段开始
//      pucDSSegEnd:    调度台号段结束
//      pucStartTime:   开始时间
//      pucEndTime:     结束时间

    var strNum = document.getElementById("id_org_num").value;
    var strName = document.getElementById("id_org_name").value;
    var iType = Number(document.getElementById("id_org_type").value);
    var strDesc = document.getElementById("id_org_desc").value;
    var iUCount = Number(document.getElementById("id_org_ucount").value);
    var iDCount = Number(document.getElementById("id_org_dcount").value);
    var iGCount = Number(document.getElementById("id_org_gcount").value);
    var iEUCount = Number(document.getElementById("id_org_endusercount").value);
    var strD0Num = document.getElementById("id_org_d0num").value;
    var strD0Pwd = document.getElementById("id_org_d0pwd").value;
    var strDShowName = document.getElementById("id_org_dshowname").value;
    var strDIcon = document.getElementById("id_org_dicon").value;
    var strAppName = document.getElementById("id_org_appshowname").value;
    var strAppIcon = document.getElementById("id_org_appicon").value;
    var strUStart = document.getElementById("id_org_usegstart").value;
    var strUEnd = document.getElementById("id_org_usegend").value;
    var strGStart = document.getElementById("id_org_gsegstart").value;
    var strGEnd = document.getElementById("id_org_gsegend").value;
    var strDSStart = document.getElementById("id_org_dssegstart").value;
    var strDSEnd = document.getElementById("id_org_dssegend").value;
    var strStartTime = document.getElementById("id_org_starttime").value;
    var strEndTime = document.getElementById("id_org_endtime").value;

    var jOrg = {
        Num     : "",
        Name    : strName,
        Type    : iType,
        Desc    : strDesc,
        UserNum : iUCount,
        DsNum   : iDCount,
        GNum    : iGCount,
        EUNum   : iEUCount,
        DS0Num  : strD0Num,
        DS0Pwd  : strD0Pwd,
        DSName  : strDShowName,
        DsIcon  : strDIcon,
        AppName : strAppName,
        AppIcon : strAppIcon,
        USegStart : strUStart,
        USegEnd : strUEnd,
        GSegStart : strGStart,
        GSegEnd : strGEnd,
        DSSegStart : strDSStart,
        DSSegEnd : strDSEnd,
        StartTime: strStartTime,
        EndTime : strEndTime};

    m_IdtApi.OAdd(jOrg, fn_OamCallBack);
}

//删除组织
function fn_ODel()
{
    var strNum = document.getElementById("id_org_num").value;

    var jOrg = {
        Num     : strNum,
        Name    : "",
        Type    : 0,
        Desc    : "",
        UserNum : 0,
        DsNum   : 0,
        GNum    : 0,
        EUNum   : 0,
        DS0Num  : "",
        DS0Pwd  : "",
        DSName  : "",
        DsIcon  : "",
        AppName : "",
        AppIcon : "",
        USegStart : "",
        USegEnd : "",
        GSegStart : "",
        GSegEnd : "",
        DSSegStart : "",
        DSSegEnd : "",
        StartTime: "",
        EndTime : ""};
    m_IdtApi.ODel(strNum, fn_OamCallBack);
}

//修改组织
function fn_OModify()
{
    var strNum = document.getElementById("id_org_num").value;
    var strName = document.getElementById("id_org_name").value;
    var iType = Number(document.getElementById("id_org_type").value);
    var strDesc = document.getElementById("id_org_desc").value;
    var iUCount = Number(document.getElementById("id_org_ucount").value);
    var iDCount = Number(document.getElementById("id_org_dcount").value);
    var iGCount = Number(document.getElementById("id_org_gcount").value);
    var iEUCount = Number(document.getElementById("id_org_endusercount").value);
    var strD0Num = document.getElementById("id_org_d0num").value;
    var strD0Pwd = document.getElementById("id_org_d0pwd").value;
    var strDShowName = document.getElementById("id_org_dshowname").value;
    var strDIcon = document.getElementById("id_org_dicon").value;
    var strAppName = document.getElementById("id_org_appshowname").value;
    var strAppIcon = document.getElementById("id_org_appicon").value;
    var strUStart = document.getElementById("id_org_usegstart").value;
    var strUEnd = document.getElementById("id_org_usegend").value;
    var strGStart = document.getElementById("id_org_gsegstart").value;
    var strGEnd = document.getElementById("id_org_gsegend").value;
    var strDSStart = document.getElementById("id_org_dssegstart").value;
    var strDSEnd = document.getElementById("id_org_dssegend").value;
    var strStartTime = document.getElementById("id_org_starttime").value;
    var strEndTime = document.getElementById("id_org_endtime").value;

    var jOrg = {
        Num     : strNum,
        Name    : strName,
        Type    : iType,
        Desc    : strDesc,
        UserNum : iUCount,
        DsNum   : iDCount,
        GNum    : iGCount,
        EUNum   : iEUCount,
        DS0Num  : strD0Num,
        DS0Pwd  : strD0Pwd,
        DSName  : strDShowName,
        DsIcon  : strDIcon,
        AppName : strAppName,
        AppIcon : strAppIcon,
        USegStart : strUStart,
        USegEnd : strUEnd,
        GSegStart : strGStart,
        GSegEnd : strGEnd,
        DSSegStart : strDSStart,
        DSSegEnd : strDSEnd,
        StartTime: strStartTime,
        EndTime : strEndTime};
    m_IdtApi.OModify(jOrg, fn_OamCallBack);
}

//查询组织
function fn_OQuery()
{
    var strNum = document.getElementById("id_org_num").value;

    m_IdtApi.OQuery(strNum, fn_OamCallBack);
}

//查询所有用户
function fn_UQueryAll()
{
    var strGNum = '0';
    var iGroup  = 0;
    var iUser   = 1;
    var iPage   = 0;

//      pucGNum:        组号码
//      ucGroup:        是否查询下属组,0不查询,1查询
//      ucUser:         是否查询下属用户,0不查询,1查询
//      dwPage:         第几页,从0开始.默认每页1024个用户,如果不到1024个用户,说明查询结束

    var query = {
        GNum        : strGNum,
			QueryExt    :
            {
                All     : 1,
                Group   : iGroup,
                User    : iUser,
                Order   : 0,
                Page    : iPage,
                Count   : 1024,
                TotalCount : 0
            }
        };
    
    m_IdtApi.GQueryU(query, fn_OamCallBack_UQueryAll);
}

//添加用户
function fn_UAdd()
{
    var strNum = document.getElementById("id_user_num").value;
    var strName = document.getElementById("id_user_name").value;
    var strPwd = document.getElementById("id_user_pwd").value;
    var iType = Number(document.getElementById("id_user_type").value);
    var iAttr = Number(document.getElementById("id_user_attr").value);
    var iStatus = Number(document.getElementById("id_user_status").value);
    var iPrio = Number(document.getElementById("id_user_prio").value);
    var iConCurrent = Number(document.getElementById("id_user_concurrent").value);
    var strCfgIp = document.getElementById("id_user_cfgip").value;
    var strAddr = document.getElementById("id_user_addr").value;
    var strContact = document.getElementById("id_user_contact").value;
    var strDesc = document.getElementById("id_user_desc").value;
    var strCTime = document.getElementById("id_user_ctime").value;
    var strVTime = document.getElementById("id_user_vtime").value;
    var iCamType = Number(document.getElementById("id_user_camtype").value);
    var strCamIp = document.getElementById("id_user_camip").value;
    var iCamPort = Number(document.getElementById("id_user_camport").value);
    var strCamName = document.getElementById("id_user_camname").value;
    var strCamPwd = document.getElementById("id_user_campwd").value;
    var iCamChanNum = Number(document.getElementById("id_user_camchannum").value);
    var strWorkInfo = document.getElementById("id_user_workinfo").value;
    var strProxyReg = document.getElementById("id_user_proxyreg").value;
    var iDataRole = Number(document.getElementById("id_user_datarole").value);
    var iMenuRole = Number(document.getElementById("id_user_menurole").value);
    var strDeptNum = document.getElementById("id_user_deptnum").value;
    var strID = document.getElementById("id_user_id").value;
    var strWorkId = document.getElementById("id_user_workid").value;
    var strWorkUnit = document.getElementById("id_user_workunit").value;
    var strTitle = document.getElementById("id_user_worktitle").value;
    var strCarId = document.getElementById("id_user_carid").value;
    var strTel = document.getElementById("id_user_tel").value;
    var strOther = document.getElementById("id_user_other").value;
    var iCount = Number(document.getElementById("id_user_count").value);

    var jUser = {
            UsrNum      : strNum,
            UsrName     : strName,
            Pwd         : strPwd,
            UserType    : iType,
            UserAttr    : iAttr,
            Prio        : iPrio,
            ConCurrent  : iConCurrent,
            UserIPAddr  : strCfgIp,
            UserAddr    : strAddr,
            UserContact : strContact,
            UserDesc    : strDesc,
            VTime       : strVTime,
            CamInfo     :
            {
                Type    : iCamType,
                Num     : "",
                IPAddr  : strCamIp,
                Port    : iCamPort,
                Name    : strCamName,
                Pwd     : strCamPwd,
                ChanNum : iCamChanNum
            },
            WorkInfo    : strWorkInfo,
            UserProxy   : strProxyReg,
            DataRole    : iDataRole,
            MenuRole    : iMenuRole,
            DeptNum     : strDeptNum,
            ID          : strID,
            WorkID      : strWorkId,
            WorkUnit    : strWorkUnit,
            Title       : strTitle,
            CarID       : strCarId,
            Tel         : strTel,
            Other       : strOther
        };

    m_IdtApi.UAdd(jUser, iCount, fn_OamCallBack);
}

//删除用户
function fn_UDel()
{
    var strNum = document.getElementById("id_user_num").value;
    var iCount = Number(document.getElementById("id_user_count").value);

    m_IdtApi.UDel(strNum, iCount, fn_OamCallBack);
}

//修改用户
function fn_UModify()
{
    var strNum = document.getElementById("id_user_num").value;
    var strName = document.getElementById("id_user_name").value;
    var strPwd = document.getElementById("id_user_pwd").value;
    var iType = Number(document.getElementById("id_user_type").value);
    var iAttr = Number(document.getElementById("id_user_attr").value);
    var iStatus = Number(document.getElementById("id_user_status").value);
    var iPrio = Number(document.getElementById("id_user_prio").value);
    var iConCurrent = Number(document.getElementById("id_user_concurrent").value);
    var strCfgIp = document.getElementById("id_user_cfgip").value;
    var strAddr = document.getElementById("id_user_addr").value;
    var strContact = document.getElementById("id_user_contact").value;
    var strDesc = document.getElementById("id_user_desc").value;
    var strCTime = document.getElementById("id_user_ctime").value;
    var strVTime = document.getElementById("id_user_vtime").value;
    var iCamType = Number(document.getElementById("id_user_camtype").value);
    var strCamIp = document.getElementById("id_user_camip").value;
    var iCamPort = Number(document.getElementById("id_user_camport").value);
    var strCamName = document.getElementById("id_user_camname").value;
    var strCamPwd = document.getElementById("id_user_campwd").value;
    var iCamChanNum = Number(document.getElementById("id_user_camchannum").value);
    var strWorkInfo = document.getElementById("id_user_workinfo").value;
    var strProxyReg = document.getElementById("id_user_proxyreg").value;
    var iDataRole = Number(document.getElementById("id_user_datarole").value);
    var iMenuRole = Number(document.getElementById("id_user_menurole").value);
    var strDeptNum = document.getElementById("id_user_deptnum").value;
    var strID = document.getElementById("id_user_id").value;
    var strWorkId = document.getElementById("id_user_workid").value;
    var strWorkUnit = document.getElementById("id_user_workunit").value;
    var strTitle = document.getElementById("id_user_worktitle").value;
    var strCarId = document.getElementById("id_user_carid").value;
    var strTel = document.getElementById("id_user_tel").value;
    var strOther = document.getElementById("id_user_other").value;

    var jUser = {
            UsrNum      : strNum,
            UsrName     : strName,
            Pwd         : strPwd,
            UserType    : iType,
            UserAttr    : iAttr,
            Prio        : iPrio,
            ConCurrent  : iConCurrent,
            UserIPAddr  : strCfgIp,
            UserAddr    : strAddr,
            UserContact : strContact,
            UserDesc    : strDesc,
            VTime       : strVTime,
            CamInfo     :
            {
                Type    : iCamType,
                Num     : "",
                IPAddr  : strCamIp,
                Port    : iCamPort,
                Name    : strCamName,
                Pwd     : strCamPwd,
                ChanNum : iCamChanNum
            },
            WorkInfo    : strWorkInfo,
            UserProxy   : strProxyReg,
            DataRole    : iDataRole,
            MenuRole    : iMenuRole,
            DeptNum     : strDeptNum,
            ID          : strID,
            WorkID      : strWorkId,
            WorkUnit    : strWorkUnit,
            Title       : strTitle,
            CarID       : strCarId,
            Tel         : strTel,
            Other       : strOther
        };

    m_IdtApi.UModify(jUser, fn_OamCallBack);
}

//查询用户
function fn_UQuery()
{
    var strNum = document.getElementById("id_user_num").value;

    m_IdtApi.UQuery(strNum, fn_OamCallBack);
}

//查询所有组
function fn_GQueryAll()
{
    var strGNum = '0';
    var iGroup  = 1;
    var iUser   = 0;
    var iPage   = 0;

//      pucGNum:        组号码
//      ucGroup:        是否查询下属组,0不查询,1查询
//      ucUser:         是否查询下属用户,0不查询,1查询
//      dwPage:         第几页,从0开始.默认每页1024个用户,如果不到1024个用户,说明查询结束

    var query = {
        GNum        : strGNum,
			QueryExt    :
            {
                All     : 1,
                Group   : iGroup,
                User    : iUser,
                Order   : 0,
                Page    : iPage,
                Count   : 1024,
                TotalCount : 0
            }
        };
    
    m_IdtApi.GQueryU(query, fn_OamCallBack);
}

//添加组
function fn_GAdd()
{
    var strGNum = document.getElementById("id_group_num").value;
    var strGName = document.getElementById("id_group_name").value;
    var iType = Number(document.getElementById("id_group_type").value);
    var iPrio = Number(document.getElementById("id_group_prio").value);
    var strAGNum = document.getElementById("id_group_agnum").value;

    var jGroup = {
        GNum        : strGNum,
        GName       : strGName,
        GType       : iType,
        Prio        : iPrio,
        AGNum       : strAGNum};
    var jFather = [
        {"Num" : "20018888810", "Prio" : 7}
        ];
    var jMember = [
        {"Prio":7,"Type":1,"Num":"2001"},
        {"Prio":7,"Type":1,"Num":"2011"},
        {"Prio":7,"Type":1,"Num":"2012"},
        {"Prio":7,"Type":1,"Num":"2013"}
        ];
    m_IdtApi.GAdd(jGroup, jFather, jMember, fn_OamCallBack);
    //m_IdtApi.GAdd(jGroup, null, null, fn_OamCallBack);
}

//删除组
function fn_GDel()
{
    var strGNum = document.getElementById("id_group_num").value;

    m_IdtApi.GDel(strGNum, fn_OamCallBack);
}

//修改组
function fn_GModify()
{
    var strGNum = document.getElementById("id_group_num").value;
    var strGName = document.getElementById("id_group_name").value;
    var iType = Number(document.getElementById("id_group_type").value);
    var iPrio = Number(document.getElementById("id_group_prio").value);
    var strAGNum = document.getElementById("id_group_agnum").value;

    var jGroup = {
        GNum        : strGNum,
        GName       : strGName,
        GType       : iType,
        Prio        : iPrio,
        AGNum       : strAGNum};
    m_IdtApi.GModify(jGroup, fn_OamCallBack);
}

//查询组
function fn_GQuery()
{
    var strGNum = document.getElementById("id_group_num").value;
    
    m_IdtApi.GQuery(strGNum, fn_OamCallBack);
}

//查询组中用户
function fn_GQueryU()
{
    var strGNum = document.getElementById("id_group_num").value;
    var iGroup = Number(document.getElementById("id_all_group").value);
    var iUser = Number(document.getElementById("id_all_user").value);
    var iPage = Number(document.getElementById("id_page_index").value);

//      pucGNum:        组号码
//      ucGroup:        是否查询下属组,0不查询,1查询
//      ucUser:         是否查询下属用户,0不查询,1查询
//      dwPage:         第几页,从0开始.默认每页1024个用户,如果不到1024个用户,说明查询结束

    var query = {
        GNum        : strGNum,
			QueryExt    :
            {
                All     : 1,
                Group   : iGroup,
                User    : iUser,
                Order   : 0,
                Page    : iPage,
                Count   : 1024,
                TotalCount : 0
            }
        };
    
    m_IdtApi.GQueryU(query, fn_OamCallBack);
}

//查询用户所在组信息
function fn_UQueryG()
{
    var strUNum = document.getElementById("id_group_unum").value;
    m_IdtApi.UQueryG(strUNum, fn_OamCallBack);
}

//组添加用户
function fn_GAddU()
{
    var strGNum = document.getElementById("id_group_num").value;
    var strUNum = document.getElementById("id_group_unum").value;
    var ucType = Number(document.getElementById("id_group_utype").value);
    var ucPrio = Number(document.getElementById("id_group_uprio").value);
    m_IdtApi.GAddU(strGNum, strUNum, ucType, ucPrio, fn_OamCallBack);
}

//组删除用户
function fn_GDelU()
{
    var strGNum = document.getElementById("id_group_num").value;
    var strUNum = document.getElementById("id_group_unum").value;
    m_IdtApi.GDelU(strGNum, strUNum, fn_OamCallBack);
}

//组修改用户
function fn_GModifyU()
{
    var strGNum = document.getElementById("id_group_num").value;
    var strUNum = document.getElementById("id_group_unum").value;
    var ucType = Number(document.getElementById("id_group_utype").value);
    var ucPrio = Number(document.getElementById("id_group_uprio").value);
    m_IdtApi.GModifyU(strGNum, strUNum, ucType, ucPrio, fn_OamCallBack);
}

function fn_gps_subs()
{
    var info = document.getElementById("id_gps_param_subs").value.split(",");
    m_IdtApi.GpsSubs(info[0], IDT.GU_STATUSSUBS_DETAIL1);
}

function fn_gps_report()
{
    //号码,经度,纬度,速度,方向
    //时间取当前时间
    var info = document.getElementById("id_gps_param_report").value.split(",");
    
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var str = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    
    m_IdtApi.GpsReport(info[0], info[1], info[2], info[3], info[4], str);
}

function fn_gps_hisquery()
{
    //号码,SN,开始时间,结束时间
    var info = document.getElementById("id_gps_param_his").value.split(",");
    m_IdtApi.GpsHisQuery(info[0], 0, info[1], info[2]);
}


//发送短信
function fn_IMSend()
{
    var strTo = document.getElementById("id_peer_num").value;
    var strTxt = document.getElementById("id_im_msg").value;
    var iType = Number(document.getElementById("id_im_type").value);
    
    var strFileName = null;
    var strSourceFileName = null;
    //m_IdtApi.IMSend(300, IDT.IM_TYPE_TXT, strTo, strTxt, strFileName, strSourceFileName);
    m_IdtApi.IMSend(300, iType, strTo, strTxt, strFileName, strSourceFileName);
}

var m_bAutoMic = false;

function fn_callout()
{
    var strTo = document.getElementById("id_peer_num").value;
    var ARx = Number(document.getElementById("id_a_rx").value);
    var ATx = Number(document.getElementById("id_a_tx").value);
    var VRx = Number(document.getElementById("id_v_rx").value);
    var VTx = Number(document.getElementById("id_v_tx").value);
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, ARx, ATx, VRx, VTx, strTo, IDT.SRV_TYPE_BASIC_CALL,  "", 1, 0, "UserMark12345");
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();
    m_bAutoMic = false;
    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}

function fn_rel()
{
    if (-1 == m_CallId)
        return;
    
    var usCause = Number(document.getElementById("id_rel_cause").value);

    m_IdtApi.CallRel(m_CallId, 100, usCause);
    m_CallId = -1;

    var calltime = document.getElementById("id_call_time");
	calltime.textContent += "~";
    calltime.textContent += PUtility.PGetCurTime();
    calltime.textContent += "  ";
    calltime.textContent += IDT.GetCloseStr(IDT.CLOSE_BYUSER);
    calltime.textContent += ":";
    calltime.textContent += IDT.GetCauseStr(usCause);

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
    
    m_bAutoMic = false;
}

function fn_sendnum()
{
    if (-1 == m_CallId)
        return;
    
    var strTo = document.getElementById("id_peer_num").value;
    
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_NUM, strTo, null);
}

function fn_answer()
{
    m_IdtApi.CallAnswer(m_CallId, 100, id_video_my, id_video_peer, m_ARx, m_ATx, m_VRx, m_VTx);

    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();
}

function fn_watch_down()
{
    var strTo = document.getElementById("id_peer_num").value;
    var ARx = Number(document.getElementById("id_a_rx").value);
    var VRx = Number(document.getElementById("id_v_rx").value);
    
    m_CallId = m_IdtApi.CallMakeOut(100, null, id_video_peer, ARx, 0, VRx, 0, strTo, IDT.SRV_TYPE_WATCH_DOWN,  "", 1, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';

    //m_IdtApi.CallSetPeerVolume(m_CallId, 1.0);
}


function fn_watch_up()
{
    var strTo = document.getElementById("id_peer_num").value;
    var ATx = Number(document.getElementById("id_a_tx").value);
    var VTx = Number(document.getElementById("id_v_tx").value);
    
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, 0, ATx, 0, VTx, strTo, IDT.SRV_TYPE_WATCH_UP,  "", 1, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}

function fn_peer_volume()
{
    var volume = document.getElementById("peer_volume").value;

    m_IdtApi.CallSetPeerVolume(m_CallId, volume);
}

function fn_gcallout()
{
    var strTo = document.getElementById("id_conf_num").value;
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, 0, 1, 0, 0, strTo, IDT.SRV_TYPE_CONF,  "", 1, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();
    m_bAutoMic = false;

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}

function fn_micwant()
{
    m_IdtApi.CallMicCtrl(m_CallId, true);
}

function fn_micrel()
{
    m_IdtApi.CallMicCtrl(m_CallId, false);
}

function fn_ccallout()
{
    var strTo = document.getElementById("id_conf_num").value;
    var iCallOutType = Number(document.getElementById("id_ccallout_type").value);;
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, 1, 1, 1, 1, strTo, IDT.SRV_TYPE_CONF,  "", iCallOutType, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();
    m_bAutoMic = false;

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}
function fn_ccall_url()
{
    var strTo = document.getElementById("id_conf_num").value;
    var strFrom = document.getElementById("id_my_num").value;
    var strText = '{"fromDesc":';
    strText += '"' + strFrom + '","fromNumber":';
    strText += '"' + strFrom + '","subPara":"{\\\"accept\\\":false,\\\"content\\\":\\\"会议开始通知, 点击加入\\\",\\\"desc\\\":\\\"调度员发起组会议:\\\",\\\"meetId\\\":\\\"';
    strText += strTo;
    strText += '\\\",\\\"number\\\":\\\"';
    strText += strTo;
    strText += '\\\",\\\"time\\\":\\\"1970-01-01 08:00:00\\\",\\\"title\\\":\\\"\\\",\\\"type\\\":2}","toDesc":"","toNumber":"';
    strText += strTo;
    strText += '","type":0}';
    m_IdtApi.IMSend(300, IDT.IM_TYPE_CONF, strTo, strText, null, null);
}

function fn_ccall_add()
{
    var strTo = document.getElementById("id_peer_num").value;
    m_IdtApi.CallUserCtrl(m_CallRef, strTo, 1, 1, 0, 1, 0);
}

function fn_ccall_del()
{
    var strTo = document.getElementById("id_peer_num").value;
    m_IdtApi.CallUserCtrl(m_CallRef, strTo, 0, 0, 0, 0, 0);
}
function fn_ccall_dial()
{
    var strTo = document.getElementById("id_conf_num").value;
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, 1, 1, 1, 1, strTo, IDT.SRV_TYPE_CONF_JOIN,  "", 0, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();

    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}
function fn_ccall_query()
{
    //查询会场状态
    var strTo = document.getElementById("id_conf_num").value;
    m_IdtApi.CallConfStatusReq(strTo, 1234);
}

function fn_ccall_talkflag()
{
    //自由发言
    if (m_bAutoMic)
    {
        m_IdtApi.CallConfCtrlReq(m_CallId, null, IDT.SRV_INFO_AUTOMICOFF, 1);//0是台上话权,1是台下话权.自由发言只针对台下话权
        m_bAutoMic = false;
    }
    else
    {
        m_IdtApi.CallConfCtrlReq(m_CallId, null, IDT.SRV_INFO_AUTOMICON, 1);//0是台上话权,1是台下话权.自由发言只针对台下话权
        m_bAutoMic = true;
    }
}
function fn_ccall_micgive0()
{
    //台上话权
    var strTo = document.getElementById("id_ccall_micnum").value;
    m_IdtApi.CallConfCtrlReq(m_CallId, strTo, IDT.SRV_INFO_MICGIVE, 0);
}
function fn_ccall_micgive1()
{
    //台下话权
    var strTo = document.getElementById("id_ccall_micnum").value;
    m_IdtApi.CallConfCtrlReq(m_CallId, strTo, IDT.SRV_INFO_MICGIVE, 1);
}
function fn_ccall_mictake()
{
    //收回话权
    var strTo = document.getElementById("id_ccall_micnum").value;
    m_IdtApi.CallConfCtrlReq(m_CallId, strTo, IDT.SRV_INFO_MICTAKE, 0xff);
}

function fn_force_inj()
{
    //强插,强插只能强插音频
    var strTo = document.getElementById("id_force_num").value;
    m_CallId = m_IdtApi.CallMakeOut(100, id_video_my, id_video_peer, 1, 1, 0, 0, strTo, IDT.SRV_TYPE_FORCE_INJ,  "", 0, 0);
    var calltime = document.getElementById("id_call_time");
	calltime.textContent = PUtility.PGetCurTime();
    
    var callinfo = document.getElementById("id_call_info");
	callinfo.textContent = '讲话指示:';
    var callinfo = document.getElementById("id_call_talkinfo");
	callinfo.textContent = '讲话方:';
}

function fn_force_rel()
{
    //强拆
    var strTo = document.getElementById("id_force_num").value;
    m_IdtApi.ForceRel(strTo);
}

function fn_fullscreen()
{
    var strB = myBrowser();
    if ("IE" == strB)
    {
        id_video_peer.RequestFullScreen();
    }
    else
    {
        PUtility.RequestFullScreen(id_video_peer);
    }
}

var m_mediaRecorder = null;
var m_recordedBlobs = null;

function saveAs(blob, filename) {
    var type = blob.type;
    var force_saveable_type = 'application/octet-stream';
    if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
        var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
        blob = slice.call(blob, 0, blob.size, force_saveable_type);
    }

    var url = window.URL.createObjectURL(blob);
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = url;
    save_link.download = filename;

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
    URL.revokeObjectURL(url);
}

function fn_ondataavailable(event)
{
    m_recordedBlobs.push(event.data)
}

function fn_startsave()
{
    m_recordedBlobs = [];
    var options = {mimeType: 'video/webm'};
    mediaRecorder = new MediaRecorder(m_IdtApi.LocalStream, options);

    //停止录像以后的回调函数
    mediaRecorder.ondataavailable = fn_ondataavailable;
    mediaRecorder.start();
}

function fn_stopsave()
{
    mediaRecorder.stop();
    mediaRecorder = null;
	setTimeout(function(){
		saveAs(m_recordedBlobs, "test.webm");
        m_recordedBlobs = null;
	},1000);
}


function fn_cam_up()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_UP,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_dowm()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_DOWN,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_left()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_LEFT,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_right()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_RIGHT,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_zoomwide()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMWIDE,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_zoomtele()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_ZOOMTELE,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_focusnear()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_FOCUSNEAR,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_focusfar()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_FOCUSFAR,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_irisopen()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_IRISOPEN,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_irisclose()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_IRISCLOSE,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_autoscan()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_AUTOSCAN,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_criuse()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_CRUISE,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_infrared()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_INFRARED,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_rainstrip()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_RAINSTRIP,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_preset()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_PRESET,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_reboot()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_REBOOT,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}
function fn_cam_stop()
{
    m_IdtApi.CallSendInfo(m_CallId, IDT.SRV_INFO_CAMCTRL, JSON.stringify({'CtrlCode' : IDT.SRV_CAMCTRL_STOP,
        'CtrlValue' : Number(document.getElementById("id_cam_value").value)}), document.getElementById("id_peer_num").value);
}


//添加路由
function fn_RAdd()
{
//      ucRName:        名字
//      ucPeerZone:     对端区号
//      ucPeerOrgNum:   对端组织号码
//      ucMyZone:       本端区号
//      ucMyOrgNum:     本端组织号码              空表示所有组织都能看到这个路由,有值表示特定组织的路由
//      ucSwitchBoard:  本端总机号码              对端如果拨打这个号码,就进入"请拨打分机号"
//      iCall:          是否支持呼叫业务,0不支持,1支持
//      iIm:            是否支持即时消息业务,0不支持,1支持
//      iOam:           是否支持OAM,0不支持,1支持
//      iGps:           是否支持GPS,0不支持,1支持
//      iMetr:          优先级,越小越高
//      ucFid:          接口模块名,TAP/SIP
//      ucIPAddr:       IP地址
//      ucRegNum:       注册号码
    var ucRName     = document.getElementById("id_route_name").value;
    var ucPeerZone  = document.getElementById("id_route_peer_zone").value;
    var ucPeerOrg   = document.getElementById("id_route_peer_org").value;
    var ucMyZone    = document.getElementById("id_route_my_zone").value;
    var ucMyOrg     = document.getElementById("id_route_my_org").value;
    var ucSwitchBoard= document.getElementById("id_route_switchboard").value;
    var iCall       = Number(document.getElementById("id_route_call").value);
    var iIm         = Number(document.getElementById("id_route_im").value);
    var iOam        = Number(document.getElementById("id_route_oam").value);
    var iGps        = Number(document.getElementById("id_route_gps").value);
    var iMetr       = Number(document.getElementById("id_route_metr").value);
    var ucFid       = document.getElementById("id_route_fid").value;
    var ucIpAddr    = document.getElementById("id_route_ipaddr").value;
    var ucRegNum    = document.getElementById("id_route_regnum").value;
    
    var jRoute = {
            Name        :   ucRName,
            PeerZone    :   ucPeerZone,
            PeerOrg     :   ucPeerOrg,
            MyZone      :   ucMyZone,
            MyOrg       :   ucMyOrg,
            SwitchBoard :   ucSwitchBoard,
            Call        :   iCall,
            Im          :   iIm,
            Oam         :   iOam,
            Gps         :   iGps,
            Metr        :   iMetr,
            Fid         :   ucFid,
            IpAddr      :   ucIpAddr,
            RegNum      :   ucRegNum
        };

    m_IdtApi.RAdd(jRoute, fn_OamCallBack);
}

//删除路由
function fn_RDel()
{
    var ucRName     = document.getElementById("id_route_name").value;

    var jRoute = {
            Name       :   ucRName
        };

    m_IdtApi.RDel(jRoute, fn_OamCallBack);
}

//修改组织
function fn_RModify()
{
//      ucRName:        名字
//      ucPeerZone:     对端区号
//      ucPeerOrgNum:   对端组织号码
//      ucMyZone:       本端区号
//      ucMyOrgNum:     本端组织号码              空表示所有组织都能看到这个路由,有值表示特定组织的路由
//      ucSwitchBoard:  本端总机号码              对端如果拨打这个号码,就进入"请拨打分机号"
//      iCall:          是否支持呼叫业务,0不支持,1支持
//      iIm:            是否支持即时消息业务,0不支持,1支持
//      iOam:           是否支持OAM,0不支持,1支持
//      iGps:           是否支持GPS,0不支持,1支持
//      iMetr:          优先级,越小越高
//      ucFid:          接口模块名,TAP/SIP
//      ucIPAddr:       IP地址
//      ucRegNum:       注册号码
    var ucRName     = document.getElementById("id_route_name").value;
    var ucPeerZone  = document.getElementById("id_route_peer_zone").value;
    var ucPeerOrg   = document.getElementById("id_route_peer_org").value;
    var ucMyZone    = document.getElementById("id_route_my_zone").value;
    var ucMyOrg     = document.getElementById("id_route_my_org").value;
    var ucSwitchBoard= document.getElementById("id_route_switchboard").value;
    var iCall       = Number(document.getElementById("id_route_call").value);
    var iIm         = Number(document.getElementById("id_route_im").value);
    var iOam        = Number(document.getElementById("id_route_oam").value);
    var iGps        = Number(document.getElementById("id_route_gps").value);
    var iMetr       = Number(document.getElementById("id_route_metr").value);
    var ucFid       = document.getElementById("id_route_fid").value;
    var ucIpAddr    = document.getElementById("id_route_ipaddr").value;
    var ucRegNum    = document.getElementById("id_route_regnum").value;
    
    var jRoute = {
            Name        :   ucRName,
            PeerZone    :   ucPeerZone,
            PeerOrg     :   ucPeerOrg,
            MyZone      :   ucMyZone,
            MyOrg       :   ucMyOrg,
            SwitchBoard :   ucSwitchBoard,
            Call        :   iCall,
            Im          :   iIm,
            Oam         :   iOam,
            Gps         :   iGps,
            Metr        :   iMetr,
            Fid         :   ucFid,
            IpAddr      :   ucIpAddr,
            RegNum      :   ucRegNum
        };
    
    m_IdtApi.RModify(jRoute, fn_OamCallBack);
}

//查询组织
function fn_RQuery()
{
    var ucRName     = document.getElementById("id_route_name").value;

    var jRoute = {
            Name       :   ucRName
        };

    m_IdtApi.RQuery(jRoute, fn_OamCallBack);
}



function fn_MicDetect_CallBack(status)
{
    console.log("fn_MicDetect_CallBack:", status);
}


var m_MicDetect = null;
function fn_MicDetect()
{
	if (null == m_MicDetect)
	{
        m_MicDetect = new MicDetect();
    }
    m_MicDetect.Run(-10.0, 2000, fn_MicDetect_CallBack);
}

