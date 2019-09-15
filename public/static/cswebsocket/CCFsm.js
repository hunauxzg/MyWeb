"use strict";

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      CC状态机
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
(function(global, factory)
{
    if (typeof define === "function" && define.amd)
    {
        define([], factory);
    }
    else if (typeof module !== "undefined" && module.exports)
    {
        module.exports = factory();
    }
    else
    {
        global.CCFsm = factory();
    }
})(this, function() 
{
    function CCFsm()
    {
        var self = this;

        //常量定义
        self.FSMID_ERROR        = 0xffffffff;   //错误的状态机号
        //状态常量
        self.CC_IDLE            = 0;            //空闲态
        self.CC_WAIT_SETUPACK   = 1;            //主叫等SETUP ACK
        self.CC_WAIT_CONN       = 2;            //主叫等CONNECT
        self.CC_WAIT_USER_CONN  = 3;            //被叫等用户应答
        self.CC_WAIT_CONNACK    = 4;            //被叫等CONNACK
        self.CC_RUNNING         = 5;            //通话
        self.CPTM_CC_SETUPACK_LEN = 6000;       // 6秒
        self.CPTM_CC_CONN_LEN   = 90000;        // 90秒,一分半钟
        self.CPTM_CC_ANSWER_LEN = 90000;        // 90秒,一分半钟
        self.CPTM_CC_CONNACK_LEN= 6000;         // 6秒
        self.CPTM_CC_HB_LEN     = 5000;         // 5秒
        self.CPTM_CC_PRESS_LEN  = 1000;         // 1秒

        self.uiMyId             = self.FSMID_ERROR;//自己的ID号,数组下标,系统启动时赋值,之后不会变
        
        //初始化标志
        self.bInit = false;

        self.UserCtx            = null;         //用户上下文
        self.PeerConn           = null;         //RTCPeerConnection
        self.bPeerConnAnswer    = false;        //RTCPeerConnection是否创建了Answer
        self.MySdp              = null;         //本地SDP
        self.PeerSdp            = null;         //对端SDP
        self.uiPeerFsmId        = self.FSMID_ERROR;//对端MC状态机号
        self.uiPrio             = 7;            //优先级
        self.strMyNum           = null;         //本端号码
        self.strPeerNum         = null;         //对端号码
        self.strOrigCalledNum   = null;         //原始被叫号码,相当于分机号
        self.strDispNum         = null;         //对方的显示号码
        self.strstDispName      = null;         //对方的显示名字
        self.SrvType            = null;         //业务类型
        self.bConnected         = false;        //是否接通过

        //媒体方向
        self.ucARx              = 0;            //语音接收,0不接收,1接收
        self.ucATx              = 0;            //语音发送,0不发送,1发送
        self.ucVRx              = 0;            //视频接收,0不接收,1接收
        self.ucVTx              = 0;            //视频发送,0不发送,1发送
        self.idLocalV           = null;         //本端视频显示窗口
        self.idPeerV            = null;
        self.SetPeerSdp         = false;        //是否设置了对方SDP

        self.LocalStream        = null;         //本地摄像头和麦克风
        self.tmp_ucARx          = null;
        self.tmp_ucATx          = null;
        self.tmp_ucVRx          = null;
        self.tmp_ucVTx          = null;
        self.tmp_idLocalV       = null;
        self.tmp_idPeerV        = null;
        self.tmp_SrvType        = null;
        self.tmp_bSetVolume     = false;

        //临时变量
        self.tmp_strPwd         = null;
        self.tmp_ucCallOut      = 0;
        self.tmp_ucDelG         = 0;

        //心跳定时器
        self.iHBCount           = 0;            //心跳计数器
        self.TimerHB            = null;         //心跳定时器

        //话权控制
        self.bIsGCall           = false;        //是否是组呼
        self.bUserNotify        = false;        //用户是否关心话权
        self.bUserWantMic       = false;        //用户是否期望话权,需要与服务器进行同步的信息,经过按键定时处理后的
        self.ucLastMicReq       = 0;            //最后一次申请话权状态,0未定义,其他 SRV_INFO_MICREQ
        self.ucLastMic          = 0;            //最后一次话权状态,0/1同媒体属性,2是未定义
        self.strTalkingNum      = null;         //当前讲话方号码
        self.strTalkingName     = null;         //当前讲话方名字
        self.TimerPress         = null;         //按键定时器
        self.bPressUserWant     = false;        //按键是否期望话权

        //状态
        self.State              = 0;            //状态
        self.TimerState         = null;         //状态定时器


//--------------------------------------------------------------------------------
//      初始化
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Init = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Init");
            
            self.ClearRun();
            return 0;
        };

//--------------------------------------------------------------------------------
//      清除运行数据
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.ClearRun = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "ClearRun");

            //释放定时器
            if (null != self.TimerState)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Stop TimerState");
                clearTimeout(self.TimerState);
                self.TimerState = null;
            }
            if (null != self.TimerPress)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Stop TimerPress");
                clearTimeout(self.TimerPress);
                self.TimerPress = null;
            }
            if (null != self.TimerHB)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Stop TimerHB");
                clearTimeout(self.TimerHB);
                self.TimerHB = null;
            }

            if (null != self.idLocalV)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "idLocalV.srcObject=null");
                if (true == m_IDT_INST.bIsIe)
                {
                    self.idLocalV.closeUserMedia();
                }
                else
                {
                    self.idLocalV.srcObject = null;
                }
                self.idLocalV       = null;
            }
            if (null != self.idPeerV)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "idPeerV.srcObject=null");
                if (true == m_IDT_INST.bIsIe)
                {
                    self.idPeerV.closeUserMedia();
                }
                else
                {
                    self.idPeerV.srcObject = null;
                }
                self.idPeerV       = null;
            }
            
            if (self.PeerConn)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Release PeerConn");
                self.PeerConn.close();
                self.PeerConn      = null;
            }

            if (self.LocalStream)
            {
                try
                {
                    self.LocalStream.getAudioTracks()[0].stop();
                }
                catch (e)
                {
                }
                try
                {
                    self.LocalStream.getVideoTracks()[0].stop();
                }
                catch (e)
                {
                }
                self.LocalStream = null;
            }

            //清除数据
            //初始化标志
            self.bInit = false;

            self.UserCtx            = null;         //用户的上下文
            self.PeerConn           = null;         //RTCPeerConnection
            self.bPeerConnAnswer    = false;        //RTCPeerConnection是否创建了Answer
            self.MySdp              = null;         //本地SDP
            self.PeerSdp            = null;         //对端SDP
            self.uiPeerFsmId        = self.FSMID_ERROR;//对端MC状态机号
            self.uiPrio             = 7;            //优先级
            self.strMyNum           = null;         //本端号码
            self.strPeerNum         = null;         //对端号码
            self.strOrigCalledNum   = null;         //原始被叫号码,相当于分机号
            self.strDispNum         = null;         //对方的显示号码
            self.strstDispName      = null;         //对方的显示名字
            self.SrvType            = null;         //业务类型
            self.bConnected         = false;        //是否接通过

            //媒体
            self.ucARx              = 0;            //语音接收,0不接收,1接收
            self.ucATx              = 0;            //语音发送,0不发送,1发送
            self.ucVRx              = 0;            //视频接收,0不接收,1接收
            self.ucVTx              = 0;            //视频发送,0不发送,1发送
            self.idLocalV           = null;         //本端视频显示窗口
            self.idPeerV            = null;         //对端视频显示窗口
            self.SetPeerSdp         = false;        //是否设置了对端SDP

            self.LocalStream        = null;         //本地摄像头和麦克风
            self.tmp_ucARx          = null;
            self.tmp_ucATx          = null;
            self.tmp_ucVRx          = null;
            self.tmp_ucVTx          = null;
            self.tmp_idLocalV       = null;
            self.tmp_idPeerV        = null;
            self.tmp_SrvType        = null;
            self.tmp_bSetVolume     = false;

            //临时变量
            self.tmp_strPwd         = null;
            self.tmp_ucCallOut      = 0;
            self.tmp_ucDelG         = 0;

            //心跳定时器
            self.iHBCount           = 0;            //心跳计数器
            self.TimerHB            = null;         //心跳定时器

            //话权控制
            self.bIsGCall           = false;        //是否是组呼
            self.bUserNotify        = false;        //用户是否关心话权
            self.bUserWantMic       = false;        //用户是否期望话权,需要与服务器进行同步的信息,经过按键定时处理后的
            self.ucLastMicReq       = 0;            //最后一次申请话权状态,0未定义,其他 SRV_INFO_MICREQ
            self.ucLastMic          = 0;            //最后一次话权状态,0/1同媒体属性,2是未定义
            self.strTalkingNum      = null;         //当前讲话方号码
            self.strTalkingName     = null;         //当前讲话方名字
            self.TimerPress         = null;         //按键定时器
            self.bPressUserWant     = false;        //按键是否期望话权

            //状态
            self.State              = 0;            //状态
            self.TimerState         = null;         //状态定时器

            return 0;
        };

//--------------------------------------------------------------------------------
//      释放
//  输入:
//      ucClose:        释放方向
//      usCause:        释放原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Rel = function(ucClose, usCause)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Rel", IDT.GetCloseStr(ucClose), ":", IDT.GetCauseStr(usCause));
            if (false == self.bInit)//现在空闲,没有启用状态机
                return 0;
            var iRelPeer = 0, iRelUser = 0;

            switch (ucClose)
            {
            case IDT.CLOSE_BYPEER:
                iRelUser = 1;
                break;
            case IDT.CLOSE_BYUSER:
                iRelPeer = 1;
                break;
            case IDT.CLOSE_BYINNER:
                iRelPeer = 1;
                iRelUser = 1;
                break;
            default:
                break;
            }
            
            //根据释放方向，发送消息
            //释放对端
            if (iRelPeer)
            {
                m_IDT_INST.McLink.SendJson({
					MsgCode : IDT.MSG_CC_REL,
                    SrcFsm  : self.uiMyId,
                    DstFsm  : self.uiPeerFsmId,
					MsgBody :
					{
                        Cause       : usCause
				    }
                });
            }

            //释放用户
            if (iRelUser)
            {
                if (null != m_IDT_INST.CallBack.onCallInd)
                {
                    m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_Rel, self.UserCtx, self.uiMyId, ucClose, usCause);
                }
            }

            self.ClearRun();
            return 0;
        };
//--------------------------------------------------------------------------------
//      CreateOffer成功发送消息到对端
//  输入:
//      ucClose:        释放方向
//      usCause:        释放原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onCreateOfferSuccessSendMsg = function()
        {
            var msg;

            if (self.CC_WAIT_SETUPACK == self.State)
            {
                //发出Setup
                msg =
                {
    					MsgCode : IDT.MSG_CC_SETUP,
                        SrcFsm  : self.uiMyId,
                        DstFsm  : self.FSMID_ERROR,
    					MsgBody :
    					{
                            MyNum       : self.strMyNum,
                            PeerNum     : self.strPeerNum,
                            OrigCalledNum : self.strOrigCalledNum,
                            SrvType     : self.SrvType,
                            MySdp       :
                            {
                                ARx     : self.ucARx,
                                ATx     : self.ucATx,
                                VRx     : self.ucVRx,
                                VTx     : self.ucVTx,
                                SdpStrType : self.MySdp.type,
                                SdpStr  : self.MySdp.sdp
                            },
                            CallConf    : 
                            {
                                Pwd     : self.tmp_strPwd,
                                CallOut : self.tmp_ucCallOut,
                                DelG    : self.tmp_ucDelG
                            }
    				    }
                };
                if (IDT.SRV_TYPE_CONF == self.SrvType)
                {
                    //组呼
                    if (0 == self.ucARx)
                    {
                        msg.MsgBody.CallConf.MicNum1    = 1;
                        msg.MsgBody.CallConf.Audio1     = 1;
                        msg.MsgBody.CallConf.VideoTx1   = 0;
                        msg.MsgBody.CallConf.VideoRx1   = 0;
                        msg.MsgBody.CallConf.MicNum2    = 0;
                        msg.MsgBody.CallConf.Audio2     = 0;
                        msg.MsgBody.CallConf.VideoTx2   = 0;
                        msg.MsgBody.CallConf.VideoRx2   = 0;
                        msg.MsgBody.CallConf.AutoMic    = 1;
                        
                        self.bIsGCall = true;
                    }
                    //会议
                    else
                    {
                        msg.MsgBody.CallConf.MicNum1    = 1;
                        msg.MsgBody.CallConf.Audio1     = 1;
                        msg.MsgBody.CallConf.VideoTx1   = 1;
                        msg.MsgBody.CallConf.VideoRx1   = 1;
                        msg.MsgBody.CallConf.MicNum2    = 16;
                        msg.MsgBody.CallConf.Audio2     = 1;
                        msg.MsgBody.CallConf.VideoTx2   = 1;
                        msg.MsgBody.CallConf.VideoRx2   = 0;
                        msg.MsgBody.CallConf.AutoMic    = 0;
                        
                        self.bIsGCall = false;
                    }
                }
                else
                {
                    msg.MsgBody.CallConf.MicNum1    = 0;
                    msg.MsgBody.CallConf.Audio1     = 0;
                    msg.MsgBody.CallConf.VideoTx1   = 0;
                    msg.MsgBody.CallConf.VideoRx1   = 0;
                    msg.MsgBody.CallConf.MicNum2    = 0;
                    msg.MsgBody.CallConf.Audio2     = 0;
                    msg.MsgBody.CallConf.VideoTx2   = 0;
                    msg.MsgBody.CallConf.VideoRx2   = 0;
                    msg.MsgBody.CallConf.AutoMic    = 0;
                    
                    self.bIsGCall = false;
                }
            }
            else
            {
                //发出CONNECT
                msg =
                {
    					MsgCode : IDT.MSG_CC_CONN,
                        SrcFsm  : self.uiMyId,
                        DstFsm  : self.uiPeerFsmId,
    					MsgBody :
    					{
                            MySdp       :
                            {
                                ARx     : self.ucARx,
                                ATx     : self.ucATx,
                                VRx     : self.ucVRx,
                                VTx     : self.ucVTx,
                                SdpStrType : self.MySdp.type,
                                SdpStr  : self.MySdp.sdp
                            }
    				    }
                };
            }
            
            m_IDT_INST.McLink.SendJson(msg);
        };

//--------------------------------------------------------------------------------
//      设置媒体方向,WebRTC方式
//  输入:
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//      idLocalV:       本地媒体播放控件
//      idPeerV:        对端媒体播放控件
//      SrvType:        业务类型
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.SetMedia_1 = function(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, SrvType)
        {
            //记录参数
            self.ucARx = ucARx;
            self.ucATx = ucATx;
            self.ucVRx = ucVRx;
            self.ucVTx = ucVTx;
            self.idLocalV = idLocalV;
            self.idPeerV = idPeerV;

            if (IDT.SRV_TYPE_WATCH_DOWN == SrvType)
            {
                if (null != self.idPeerV)
                {
                    if (false == self.tmp_bSetVolume)
                    {
                        try {self.idPeerV.volume = 0;} catch (e){};
                        self.tmp_bSetVolume = true;
                    }
                }
            }
            else
            {
                if (null != self.idPeerV)
                {
                    try {self.idPeerV.volume = 1;} catch (e){};
                    self.tmp_bSetVolume = true;
                }
            }

            var LocalStream;
            if (null == self.LocalStream)
            {
                LocalStream = m_IDT_INST.LocalStream;
            }
            else
            {
                LocalStream = self.LocalStream;
            }
            
            //显示本端视频
            if (1 == self.ucVTx)
            {
                self.idLocalV.srcObject = LocalStream;
            }

            //初始化 PeerConn
            var servers = {"iceServers": [{"urls": m_IDT_INST.strStunServer}]};
            PUtility.Log(' ', PUtility.PGetCurTime(), 'self.PeerConn = new RTCPeerConnection(servers)');
            self.PeerConn = new RTCPeerConnection(servers);
            //添加track
            var videoTracks, audioTracks;

            audioTracks = LocalStream.getAudioTracks();
            videoTracks = LocalStream.getVideoTracks();
            if ((ucARx || ucATx) && (null != self.PeerConn))
            {
                PUtility.Log(' ', PUtility.PGetCurTime(), 'Added Audio stream to LocalConn');
                self.PeerConn.addTrack(audioTracks[0], LocalStream);
            }
            if ((ucVRx || ucVTx) && (null != self.PeerConn))
            {
                PUtility.Log(' ', PUtility.PGetCurTime(), 'Added Video stream to LocalConn');
                self.PeerConn.addTrack(videoTracks[0], LocalStream);
            }
            self.PeerConn.onicecandidate = function(event)
            {
                self.onIceCandidate(self, event);
            };
            self.PeerConn.oniceconnectionstatechange = function(event)
            {
                self.onIceStateChange(self, event);
            };
            self.PeerConn.ontrack = function(event)
            {
                self.onTrack(self, event);
            };
            
            PUtility.Log(' ', PUtility.PGetCurTime(), 'self.PeerConn.createOffer()');
            self.PeerConn.createOffer().then(
                self.onCreateOfferSuccess, self.onCreateOfferError);
            
            return 0;
        };

//--------------------------------------------------------------------------------
//      设置媒体方向,OCX方式
//  输入:
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//      idLocalV:       本地媒体播放控件
//      idPeerV:        对端媒体播放控件
//      SrvType:        业务类型
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.SetMedia_2 = function(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, SrvType)
        {
            //记录参数
            self.ucARx = ucARx;
            self.ucATx = ucATx;
            self.ucVRx = ucVRx;
            self.ucVTx = ucVTx;
            self.idLocalV = idLocalV;
            self.idPeerV = idPeerV;

            var sdp = {"type":"offer", "sdp":""};
            self.MySdp = sdp;
            if (null != self.idLocalV)
            {
                var par = {"ATx": ucATx, "VTx": ucVTx};
                var strPar = JSON.stringify(par);
                self.idLocalV.getUserMedia(strPar);
            }
            if (null != self.idPeerV)
            {
                var par = {"ARx": ucARx, "ATx": ucATx, "VRx": ucVRx, "VTx": ucVTx};
                var strPar = JSON.stringify(par);
                self.MySdp.sdp = self.idPeerV.CreateOffer(strPar);
            }

            self.onCreateOfferSuccessSendMsg();
            if (IDT.SRV_TYPE_WATCH_DOWN == SrvType)
            {
                if (false == self.tmp_bSetVolume)
                {
                    self.idPeerV.setPeerVolume(0);
                    self.tmp_bSetVolume = true;
                }
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      得到呼叫Stream
//  输入:
//      stream:         stream对象
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GotStream = function(stream)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "GotStream");
            self.LocalStream = stream;

            self.SetMedia_1(self.tmp_ucARx, self.tmp_ucATx, self.tmp_ucVRx, self.tmp_ucVTx, self.tmp_idLocalV, self.tmp_idPeerV, self.tmp_SrvType)
        };
//--------------------------------------------------------------------------------
//      设置媒体方向
//  输入:
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//      idLocalV:       本地媒体播放控件
//      idPeerV:        对端媒体播放控件
//      SrvType:        业务类型
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.SetMedia = function(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, SrvType)
        {
            if (true == m_IDT_INST.bIsIe)
            {
                return self.SetMedia_2(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, SrvType);
            }
            else
            {
                if (null == self.LocalStream)
                {
                    self.tmp_ucARx      = ucARx;
                    self.tmp_ucATx      = ucATx;
                    self.tmp_ucVRx      = ucVRx;
                    self.tmp_ucVTx      = ucVTx;
                    self.tmp_idLocalV   = idLocalV;
                    self.tmp_idPeerV    = idPeerV;
                    self.tmp_SrvType    = SrvType;

                    var bAudio, bVideo;
                    if (1 == ucARx || 1 == ucATx)
                        bAudio = true;
                    else
                        bAudio = false;
                    if (1 == ucVRx || 1 == ucVTx)
                        bVideo = true;
                    else
                        bVideo = false;
                    
                    navigator.mediaDevices.getUserMedia({audio: bAudio, video: bVideo})
                        .then(self.GotStream);
                        //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                }
                else
                {
                    return self.SetMedia_1(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, SrvType);
                }
            }
        };

//--------------------------------------------------------------------------------
//      SDP过滤一行
//  输入:
//      str:            一行内容
//      step:           当前步骤
//      telEventId:     电话事件的ID
//      H264Id:         H264的ID
//  返回:
//      false:          不需要加入,无用的行
//      true:           需要加入,有用的行
//--------------------------------------------------------------------------------
        self.SdpFilter = function(str, step, telEventId, H264Id)
        {
            if (0 == step)
                return true;
            if (-1 != str.indexOf('a=extmap:'))
                return false;
            
            var strMatch = new Array();
            strMatch[0] = {str : 'a=rtpmap:', len: 9};
            strMatch[1] = {str : 'a=rtcp-fb:', len : 10};
            strMatch[2] = {str : 'a=fmtp:', len : 7};

            var i, index = -1;
            for (i = 0; i < strMatch.length; i++)
            {
                if (-1 != str.indexOf(strMatch[i].str))
                {
                    index = i;
                    break;
                }
            }
            if (-1 == index)
            {
                strMatch = null;
                return true;
            }
            var id = parseInt(str.substring(strMatch[index].len));
            switch (step)
            {
            case 1://语音
                if (id == 0 || id == telEventId)
                {
                    strMatch = null;
                    return true;
                }
                break;
            case 2://视频
                if (id == H264Id)
                {
                    strMatch = null;
                    return true;
                }
                break;
            default:
                strMatch = null;
                return true;
            }
            strMatch = null;            
            return false;
        };
//--------------------------------------------------------------------------------
//      SDP格式化
//  输入:
//      sdp:            sdp内容
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//      SrvType:        业务类型
//      bIsGCall:       是否组呼
//  返回:
//      SDP字符串
//--------------------------------------------------------------------------------
        self.FormatSdp = function(sdp, ucARx, ucATx, ucVRx, ucVTx, SrvType, bIsGCall)
        {
            var telEventId = 126;
            var H264Id = 100;
            if (ucARx || ucATx)
                telEventId = -1;
            if (ucVRx || ucVTx)
                H264Id = -1;
            
            var strArray = sdp.split('\r\n');
            if (strArray.length <= 1)
                return '';
            var i;
            var str;
            for (i = 0; i < strArray.length - 1; i++)
            {
                if (-1 == telEventId)
                {
                    //a=rtpmap:126 telephone-event/8000
                    if (-1 == strArray[i].indexOf('telephone-event/8000'))
                        continue;
                    telEventId = parseInt(strArray[i].substring(9));
                }
                if (-1 == H264Id)
                {
                    //a=fmtp:100 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f
                    //a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f
                    //a=fmtp:127 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f
                    if (-1 == strArray[i].indexOf('profile-level-id=42e01f'))
                        continue;
                    H264Id = parseInt(strArray[i].substring(7));
                }
                
                if (-1 != telEventId && -1 != H264Id)
                    break;
            }
            
            var step = 0;//0全局, 1语音, 2视频
            var strG, strA, strV;
            var strDst = '';
            for (i = 0; i < strArray.length - 1; i++)
            {
                if (-1 != strArray[i].indexOf('m=audio'))
                {
                    step = 1;
                    strDst += 'm=audio 9 UDP/TLS/RTP/SAVPF 0 ';
                    strDst += telEventId;
                    strDst += '\r\n';
                    continue;
                }
                if (-1 != strArray[i].indexOf('m=video'))
                {
                    step = 2;
                    strDst += 'm=video 9 UDP/TLS/RTP/SAVPF ';
                    strDst += H264Id;
                    strDst += '\r\n';
                    continue;
                }

                if (false == self.SdpFilter(strArray[i], step, telEventId, H264Id))
                    continue;
                if (-1 == strArray[i].indexOf('a=sendrecv'))
                {
                    strDst += strArray[i];
                    strDst += '\r\n';
                    continue;
                }
                switch (step)
                {
                case 1:
                    if (IDT.SRV_TYPE_CONF == SrvType || IDT.SRV_TYPE_CONF_JOIN == SrvType)
                    {
                        strDst += 'a=sendrecv\r\n';
                    }
                    else
                    {
                        if (1 == ucARx && 1 == ucATx)
                            strDst += 'a=sendrecv\r\n';
                        else if (1 == ucARx && 0 == ucATx)
                            strDst += 'a=recvonly\r\n';
                        else if (0 == ucARx && 1 == ucATx)
                            strDst += 'a=sendonly\r\n';
                    }
                    break;
                case 2:
                    if (IDT.SRV_TYPE_CONF == SrvType || IDT.SRV_TYPE_CONF_JOIN == SrvType)
                    {
                        if (false == bIsGCall)
                            strDst += 'a=sendrecv\r\n';
                    }
                    else
                    {
                        if (1 == ucVRx && 1 == ucVTx)
                            strDst += 'a=sendrecv\r\n';
                        else if (1 == ucVRx && 0 == ucVTx)
                            strDst += 'a=recvonly\r\n';
                        else if (0 == ucVRx && 1 == ucVTx)
                            strDst += 'a=sendonly\r\n';
                    }
                    break;
                default:
                    break;
                }
            }
            return strDst;
        };
//--------------------------------------------------------------------------------
//      只是打印的几个函数
//--------------------------------------------------------------------------------
        self.onCreateOfferError = function(error)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onCreateOfferError", error);
        };
        self.onSetLocalSuccess = function(sdp)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onSetLocalSuccess:", sdp);
            
        };
        self.onSetLocalError = function(error)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onSetLocalError", error);
        };
        self.onSetRemoteSuccess = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onSetRemoteSuccess:");
        };

        self.onSetRemoteError = function(error)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onSetRemoteError", error);
        };
        self.onIceStateChange = function(that, event)
        {
            if (null == self.PeerConn)
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onIceLocalStateChange:", event);
            else
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onIceLocalStateChange:", event, self.PeerConn.iceConnectionState);
        };
        self.onAddIcePeerCandidateSuccess = function(cand)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onAddIcePeerCandidateSuccess:", cand);
            
        };
        self.onAddIcePeerCandidateError = function(cand, error)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onAddIcePeerCandidateError:", cand, error);
        };

//--------------------------------------------------------------------------------
//      Offer需要处理的两个函数
//--------------------------------------------------------------------------------
        //ICE备选
        self.onIceCandidate = function(that, event)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onIceCandidate:", event);
            if (null == event.candidate)
                return;
            return;
            
            //发送ICE备选到对端
			var strIce = JSON.stringify(event.candidate);
            self.UserSendInfo(IDT.SRV_INFO_ICECAND, strIce);
        };
        //offer创建成功
        self.onCreateOfferSuccess = function(sdp)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onCreateOfferSuccess:", sdp);
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onCreateOfferSuccess-sdp:", sdp.sdp);
            //修整本端sdp
            sdp.sdp = self.FormatSdp(sdp.sdp, self.ucARx, self.ucATx, self.ucVRx, self.ucVTx, self.SrvType, self.bIsGCall);
            
            PUtility.Log(' ', PUtility.PGetCurTime(), 'self.PeerConn.setLocalDescription', sdp.sdp);
            self.PeerConn.setLocalDescription(sdp)
                .then(function() {self.onSetLocalSuccess(sdp);}, self.onSetLocalError);

            self.MySdp = sdp;

            self.onCreateOfferSuccessSendMsg();

            if (IDT.SRV_TYPE_WATCH_DOWN == self.SrvType)//如果是视频查看,关闭本端摄像头和麦克风
            {
                if (self.LocalStream)
                {
                    try
                    {
                        self.LocalStream.getAudioTracks()[0].stop();
                    }
                    catch (e)
                    {
                    }
                    try
                    {
                        self.LocalStream.getVideoTracks()[0].stop();
                    }
                    catch (e)
                    {
                    }
                    self.LocalStream = null;
                }
            }
        };

        self.onTrack = function(that, event)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "onTrack:", event);
            if (IDT.SRV_TYPE_CONF == self.SrvType || IDT.SRV_TYPE_CONF_JOIN == self.SrvType)
            {
                if (self.idPeerV.srcObject !== event.streams[0])
                {
                    self.idPeerV.srcObject = event.streams[0];
                    PUtility.Log(PUtility.PGetCurTime(), "onTrack:", self.idPeerV);
                }
            }
            else
            {
                if (1 == self.ucARx || 1 == self.ucVRx)
                {
                    if (self.idPeerV.srcObject !== event.streams[0])
                    {
                        self.idPeerV.srcObject = event.streams[0];
                        PUtility.Log(PUtility.PGetCurTime(), "onTrack:", self.idPeerV);
                    }
                }
            }
        };

        self.SdpGetMyAttrFromPeer = function(sdp, attr)
        {
            attr.ARx = 0;
            attr.ATx = 0;
            attr.VRx = 0;
            attr.VTx = 0;
            
            if (1 == sdp.ARx)
                attr.ATx = 1;
            if (1 == sdp.ATx)
                attr.ARx = 1;
            if (1 == sdp.VRx)
                attr.VTx = 1;
            if (1 == sdp.VTx)
                attr.VRx = 1;
            return 0;
        };
//--------------------------------------------------------------------------------
//      启动呼出
//  输入:
//      UserCtx:        用户上下文
//      idLocalV:       本端音视频控件ID,video标签
//      idPeerV:        对端音视频控件ID,video标签
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucVTx:          是否发送视频,1发送,0不发送
//      strMyNum:       自己号码
//      strPeerNum:     对方号码
//      SrvType:        业务类型,SRV_TYPE_BASIC_CALL等
//      strPwd:         密码,创建或进入会场的密码
//      ucCallOut:      服务器是否直接呼出,0不呼出,1直接呼出
//      ucDelG:         会议结束后,是否删除组,0不删除,1删除
//  返回:
//      -1:             失败
//      else:           呼叫标识
//  注意:
//      如果是组呼(SRV_TYPE_CONF, 语音发送为1,语音接收为0, 视频未定义,或者与语音相同)
//      1.strPeerNum为组号码
//      2.pAttr中,ucAudioSend为1,其余为0
//      如果是会议:
//      1.发起会议(SRV_TYPE_CONF, 语音发送为1,语音接收为1)
//          a)被叫号码可以为空,或者用户号码/组号码
//          b)strPwd为会议密码
//          c)在CallPeerAnswer时,带回会议的内部号码,为交换机产生的呼叫标识
//      2.加入会议(SRV_TYPE_CONF_JOIN,ucAudioRecv=1,ucVideoRecv=1)
//          a)strPeerNum为1中的c
//          b)strPwd为1中的b
//--------------------------------------------------------------------------------
        self.CallMakeOut = function(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, strMyNum, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "CallMakeOut",
                strMyNum, strPeerNum, SrvType, ucARx, ucATx, ucVRx, ucVTx, UserCtx, strPwd, ucCallOut, ucDelG, idLocalV, idPeerV);

            //记录参数
            self.UserCtx            = UserCtx;      //用户的上下文
            self.PeerConn           = null;         //WebRTC RTCPeerConnection
            self.MySdp              = null;         //本地SDP
            self.PeerSdp            = null;         //对端SDP
            self.uiPeerFsmId        = self.FSMID_ERROR; //对端MC状态机号
            self.uiPrio             = null;         //优先级
            self.strMyNum           = strMyNum;     //本端号码
            self.strPeerNum         = strPeerNum.split('*')[0];//对端号码
            self.strOrigCalledNum   = strPeerNum;   //原始被叫号码,相当于分机号
            self.strDispNum         = null;         //对方的显示号码
            self.strstDispName      = null;         //对方的显示名字
            self.SrvType            = SrvType;      //业务类型
            self.bConnected         = false;        //是否接通过

            //临时变量
            self.tmp_strPwd         = strPwd;
            self.tmp_ucCallOut      = ucCallOut;
            self.tmp_ucDelG         = ucDelG;

            //心跳定时器
            self.iHBCount           = 0;            //心跳计数器
            self.TimerHB            = null;         //心跳定时器

            //话权控制
            self.bIsGCall           = null;         //是否是组呼
            self.bUserNotify        = null;         //用户是否关心话权
            self.bUserWantMic       = null;         //用户是否期望话权,需要与服务器进行同步的信息,经过按键定时处理后的
            self.ucLastMicReq       = null;         //最后一次申请话权状态,0未定义,其他 SRV_INFO_MICREQ
            self.ucLastMic          = null;         //最后一次话权状态,0/1同媒体属性,2是未定义
            self.strTalkingNum      = null;         //当前讲话方号码
            self.strTalkingName     = null;         //当前讲话方名字
            self.TimerPress         = null;         //按键定时器
            self.bPressUserWant     = null;         //按键是否期望话权

            switch (SrvType)
            {
            case IDT.SRV_TYPE_CONF:
                self.bUserNotify   = true;
                self.bUserWantMic  = true;
                self.bPressUserWant= true;
                self.ucLastMicReq  = IDT.SRV_INFO_MICREQ;
                //组呼
                if (0 == ucARx)
                {
                    self.bIsGCall = true;
                }
                //会议
                else
                {
                    self.bIsGCall = false;
                }
                break;
            case IDT.SRV_TYPE_CONF_JOIN:
                self.bUserNotify   = true;
                self.bUserWantMic  = false;
                self.bPressUserWant= false;
                self.ucLastMicReq  = IDT.SRV_INFO_MICNONE;
                self.bIsGCall = false;
                break;
            default:
                self.bUserNotify   = false;
                self.bUserWantMic  = false;
                self.bPressUserWant= false;
                self.ucLastMicReq  = IDT.SRV_INFO_MICNONE;
                self.bIsGCall = false;
                break;
            }

            // 4.启动定时器,状态跃迁
            self.TimerState = setTimeout(self.TmSetupAck, self.CPTM_CC_SETUPACK_LEN);
            self.State      = self.CC_WAIT_SETUPACK;
            
            //设置媒体
            //CreateOffer成功时,发送SETUP
            self.SetMedia(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, self.SrvType);
            
            return self.uiMyId;
        };
//--------------------------------------------------------------------------------
//      收到SETUPACK的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvSetupAckProc = function(RecvMsg)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "RecvSetupAckProc:", RecvMsg.SrcFsm);
            if (self.State != self.CC_WAIT_SETUPACK)
                return -1;

            self.State = self.CC_WAIT_CONN;
            self.uiPeerFsmId = RecvMsg.SrcFsm;
            
            clearTimeout(self.TimerState);
            self.TimerState = null;
            //是组呼主叫
            if (self.SRV_TYPE_CONF == self.SrvType && self.bIsGCall)
            {
                self.TimerState = setTimeout(self.TmConn, self.CCTM_CS_MICREL_LEN);
            }
            //不是组呼主叫
            else
            {
                self.TimerState = setTimeout(self.TmConn, self.CPTM_CC_CONN_LEN);
            }

            //启动心跳定时器
            self.TimerHB = setTimeout(self.TmHB, self.CPTM_CC_HB_LEN);
            self.iHBCount = 0;
            return 0;
        };

        self.SetPeerSdpFunc = function(sdp)
        {
            var attr = {};
            self.SdpGetMyAttrFromPeer(sdp, attr);
            self.ucARx = attr.ARx;
            self.ucATx = attr.ATx;
            self.ucVRx = attr.VRx;
            self.ucVTx = attr.VTx;

            var reg = new RegExp("<br/>", "g"); //创建正则RegExp对象
            var stringObj = sdp.SdpStr;
            var strPeerSdp = stringObj.replace(reg, "\r\n");
            self.PeerSdp = {type : 'answer', sdp : strPeerSdp};

            if (true == self.SetPeerSdp)
                return 0;
            
            var strSdpJs = 'v=0\r\n';
                strSdpJs += 'o=- 7 2 IN IP4 0.0.0.0\r\n';
                strSdpJs += 's=-\r\n';
                strSdpJs += 'c=IN IP4 0.0.0.0\r\n';
                strSdpJs += 't=0 0\r\n';
                strSdpJs += 'm=audio 9 UDP/TLS/RTP/SAVPF 0 126\r\n';
                strSdpJs += 'c=IN IP4 0.0.0.0\r\n';
                strSdpJs += 'a=ptime:20\r\n';
                strSdpJs += 'a=minptime:1\r\n';
                strSdpJs += 'a=maxptime:255\r\n';
                strSdpJs += 'a=rtpmap:0 PCMU/8000/1\r\n';
                strSdpJs += 'a=rtpmap:126 telephone-event/8000/1\r\n';
                strSdpJs += 'a=fmtp:126 0-16\r\n';
                strSdpJs += 'a=sendrecv\r\n';
                strSdpJs += 'a=rtcp-mux\r\n';
                strSdpJs += 'a=ssrc:2442385887 cname:IDT-CNAME-A\r\n';
                strSdpJs += 'a=ssrc:2442385887 mslabel:IDT-MSLABLE\r\n';
                strSdpJs += 'a=ssrc:2442385887 label:IDT-LABLE-A\r\n';
                strSdpJs += 'a=ice-ufrag:86OB\r\n';
                strSdpJs += 'a=ice-pwd:/8I1yH78ZWVT90mFQzN+9SQm\r\n';
                strSdpJs += 'a=ice-options:trickle\r\n';
                strSdpJs += 'a=fingerprint:sha-256 D8:2F:5E:63:F1:82:BA:F1:AE:57:AD:4A:39:CA:19:44:94:F0:D6:E6:49:73:6C:5F:E6:3E:57:59:9D:6A:B1:70\r\n';
                strSdpJs += 'a=setup:passive\r\n';
                strSdpJs += 'm=video 9 UDP/TLS/RTP/SAVPF 107\r\n';
                strSdpJs += 'c=IN IP4 0.0.0.0\r\n';
                strSdpJs += 'a=extmap:5 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01';
                //strSdpJs += 'a=rtcp-fb:* ccm fir\r\n';
                //strSdpJs += 'a=rtcp-fb:* nack\r\n';
                //strSdpJs += 'a=rtcp-fb:* doubs-jcng\r\n';
                strSdpJs += 'a=label:14\r\n';
                strSdpJs += 'a=content:main\r\n';
                strSdpJs += 'a=rtpmap:107 H264/90000\r\n';
                strSdpJs += 'a=fmtp:107 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=420029\r\n';
                strSdpJs += 'a=sendrecv\r\n';
                strSdpJs += 'a=rtcp-mux\r\n';
                strSdpJs += 'a=ssrc:1822225773 cname:IDT-CNAME-V\r\n';
                strSdpJs += 'a=ssrc:1822225773 mslabel:IDT-MSLABLE\r\n';
                strSdpJs += 'a=ssrc:1822225773 label:IDT-LABLE-V\r\n';
                strSdpJs += 'a=ice-ufrag:86OB\r\n';
                strSdpJs += 'a=ice-pwd:/8I1yH78ZWVT90mFQzN+9SQm\r\n';
                strSdpJs += 'a=ice-options:trickle\r\n';
                strSdpJs += 'a=fingerprint:sha-256 D8:2F:5E:63:F1:82:BA:F1:AE:57:AD:4A:39:CA:19:44:94:F0:D6:E6:49:73:6C:5F:E6:3E:57:59:9D:6A:B1:70\r\n';
                strSdpJs += 'a=setup:passive\r\n';
            //self.PeerSdp = {type : 'answer', sdp : strSdpJs};

            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "SetPeerSdpFunc:", self.PeerSdp.sdp);
            if (true == m_IDT_INST.bIsIe)
            {
                if (null != self.idPeerV)
                    self.idPeerV.setRemoteDescription(self.PeerSdp);
            }
            else
            {
                self.PeerConn.setRemoteDescription(self.PeerSdp)
                    .then(self.onSetRemoteSuccess, self.onSetRemoteError);
            }
            self.SetPeerSdp = true;
            return 0;
        };

//--------------------------------------------------------------------------------
//      收到ALERT的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvAlertProc = function(RecvMsg)
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "RecvAlertProc: ", RecvMsg);
            
            self.SetPeerSdpFunc(RecvMsg.MsgBody.MySdp);
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到CONNECT的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvConnProc = function(RecvMsg)
        {
            // 检查状态
            if (!(self.CC_WAIT_CONN == self.State || self.CC_RUNNING == self.State))
                return -1;
            
            // 记录参数
            self.uiPeerFsmId= RecvMsg.SrcFsm;
            self.uiPrio     = RecvMsg.MsgBody.Prio;
            self.stDispNum  = RecvMsg.MsgBody.TrueNum;
            self.stDispName = RecvMsg.MsgBody.TrueName;
            self.SrvType    = RecvMsg.MsgBody.SrvType;
            switch (self.SrvType)
            {
            case IDT.SRV_TYPE_CONF_JOIN:
                self.SrvType = IDT.SRV_TYPE_CONF;
                break;
            default:
                break;
            }

            //发送CONNACK到对端
            m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_CONNACK,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId,
				MsgBody :
				{
			    }
            });
            
            //停止定时器,状态跃迁
            clearTimeout(self.TimerState);
            self.TimerState = null;
            self.State      = self.CC_RUNNING;
            self.bConnected = true;
            
            self.SetPeerSdpFunc(RecvMsg.MsgBody.MySdp);
            
            if (m_IDT_INST.CallBack.onCallInd)
            {
                m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_PeerAnswer, self.UserCtx, self.stDispNum, self.stDispName, self.SrvType);
            }

            if (IDT.SRV_TYPE_CONF == self.SrvType || IDT.SRV_TYPE_CONF_JOIN == self.SrvType)
            {
                self.MicInd(false);
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到SETUP的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvSetupProc = function(RecvMsg)
        {
            // 1.记录参数
            self.uiPeerFsmId    = RecvMsg.SrcFsm;
            self.uiPrio         = RecvMsg.MsgBody.Prio;
            self.strPeerNum     = RecvMsg.MsgBody.MyNum;
            self.strMyNum       = RecvMsg.MsgBody.PeerNum;
            self.strDispNum     = RecvMsg.MsgBody.TrueNum;
            self.strDispName    = RecvMsg.MsgBody.TrueName;
            self.SrvType        = RecvMsg.MsgBody.SrvType;
            if (IDT.SRV_TYPE_NONE == self.SrvType)
                self.SrvType = IDT.SRV_TYPE_BASIC_CALL;
            //修正SrvType??????
            switch (self.SrvType)
            {
            case IDT.SRV_TYPE_CONF:
            case IDT.SRV_TYPE_CONF_JOIN:
                self.SrvType = IDT.SRV_TYPE_CONF;
                if (null != RecvMsg.MsgBody.OrigCalledName)
                    self.strDispName = RecvMsg.MsgBody.OrigCalledName;
                break;
            default:
                break;
            }
            
            // 2.发送SETUPACK到对端
            m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_SETUPACK,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId,
				MsgBody :
				{
			    }
            });

            // 3.发送Alert到对端
            m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_ALERT,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId,
				MsgBody :
				{
			    }
            });
            
            // 4.处理媒体
            var attr = {};
            self.SdpGetMyAttrFromPeer(RecvMsg.MsgBody.MySdp, attr);
            if (IDT.SRV_TYPE_CONF == self.SrvType || IDT.SRV_TYPE_CONF_JOIN == self.SrvType)
            {
                if (attr.VRx || attr.VTx)
                    self.bIsGCall = false;
                else
                    self.bIsGCall = true;
            }
            else
            {
                self.bIsGCall = false;
            }

            // 5.启动定时器,走状态
            self.State = self.CC_WAIT_USER_CONN;
            self.TimerState = setTimeout(self.TmAnswer, self.CPTM_CC_ANSWER_LEN);

            // 启动心跳定时器
            self.TimerHB = setTimeout(self.TmHB, self.CPTM_CC_HB_LEN);
            self.iHBCount = 0;
            
            // 6.发送CALLIN到用户
            if (m_IDT_INST.CallBack.onCallInd)
            {
                m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_In, self.uiMyId, RecvMsg.MsgBody.TrueNum, RecvMsg.MsgBody.TrueName, self.SrvType, self.bIsGCall,
                    attr.ARx, attr.ATx, attr.VRx, attr.VTx);
            }
            
            return 0;
        };
//--------------------------------------------------------------------------------
//      用户应答
//  输入:
//      UserCtx:        用户上下文
//      idLocalV:       本地视频ID
//      idPeerV:        对端视频ID
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.UserAnswer = function(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx)
        {
            self.UserCtx = UserCtx;

            self.SetMedia(ucARx, ucATx, ucVRx, ucVTx, idLocalV, idPeerV, self.SrvType);

            // 启动定时器,走状态
            clearTimeout(self.TimerState);
            self.TimerState = null;
            self.State = self.CC_WAIT_CONNACK;
            self.TimerState = setTimeout(self.TmConnAck, self.CPTM_CC_CONNACK_LEN);
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到CONNACK的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvConnAckProc = function(RecvMsg)
        {
            if (self.State != self.CC_WAIT_CONNACK)
                return 0;
            clearTimeout(self.TimerState);
            self.TimerState = null;
            self.State = self.CC_RUNNING;
            self.bConnected = true;
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到REL的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvRelProc = function(RecvMsg)
        {
            if (false == self.bInit)
                return 0;
            self.Rel(IDT.CLOSE_BYPEER, RecvMsg.MsgBody.Cause);
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到INFO的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvInfoProc = function(RecvMsg)
        {
            m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_INFOACK,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId
            });
        
            var cand;
            switch (RecvMsg.MsgBody.Info.Info)
            {
            case IDT.SRV_INFO_ICECAND://对端ICE信息
                var reg = new RegExp("<br/>", "g"); //创建正则RegExp对象
                var stringObj = RecvMsg.MsgBody.Info.InfoStr;
                var newstr = stringObj.replace(reg, "\"");
                cand = JSON.parse(newstr);
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "RecvInfoProc-ICECAND: ", cand);

                if (true == m_IDT_INST.bIsIe)
                {
                    if (null != self.idPeerV)
                        self.idPeerV.addIceCandidate(newstr);
                }
                else
                {
                    self.PeerConn.addIceCandidate(cand)
                        .then(function(){self.onAddIcePeerCandidateSuccess(cand);},
                        function(err){self.onAddIcePeerCandidateError(cand, err);});
                }
                break;

            case IDT.SRV_INFO_SDP://对端SDP
                self.SetPeerSdpFunc(RecvMsg.MsgBody.MySdp);
                break;

            case IDT.SRV_INFO_MICINFO://话权提示
                if (self.strTalkingNum != RecvMsg.MsgBody.UsrNum)
                {
                    self.strTalkingNum  = RecvMsg.MsgBody.UsrNum;
                    self.strTalkingName = RecvMsg.MsgBody.UsrName;
                    if (null == self.strTalkingNum)
                        self.strTalkingNum = '';
                    if (null == self.strTalkingName)
                        self.strTalkingName = '';

                    if (m_IDT_INST.CallBack.onCallInd)
                    {
                        m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_TalkingIDInd, self.UserCtx, self.strTalkingNum, self.strTalkingName);
                    }
                }
                break;

            case IDT.SRV_INFO_MICREQ://话权申请
            case IDT.SRV_INFO_MICREL://话权释放
                if (m_IDT_INST.CallBack.onCallInd)
                {
                    m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_ConfCtrlInd, self.UserCtx, RecvMsg.MsgBody.Info.Info);
                }
                break;

            case IDT.SRV_INFO_TALKONRSP://打开对讲响应
                    /*
                    if (0 == pstRecvMsg->stInfo.ucInfo)
                        break;
                    int i = atoi((char*)pstRecvMsg->stInfo.ucInfo);
                    if (0 != i)
                        break;
                    if (NULL == m_pLeg)
                        return -1;
                    
                    MEDIAATTR_s attr;
                    SdpGetAttr(m_pLeg->m_MySdp, attr);
                    attr.ucAudioSend = 1;
                    UserModify(&attr);*/
                break;

            default:
                if (m_IDT_INST.CallBack.onCallInd)
                {
                    m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_RecvInfo, self.UserCtx, RecvMsg.MsgBody.Info.Info, RecvMsg.MsgBody.Info.InfoStr);
                }
                break;
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到INFOACK的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvInfoAckProc = function(RecvMsg)
        {
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到MODIFY的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvModifyProc = function(RecvMsg)
        {
            //设置对端SDP
            self.SetPeerSdpFunc(RecvMsg.MsgBody.MySdp);

            m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_MODIFYACK,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId,
                MsgBody :
                {
                    OpSn        : RecvMsg.MsgBody.OpSn,
                    MySdp       :
                    {
                        ARx     : self.ucARx,
                        ATx     : self.ucATx,
                        VRx     : self.ucVRx,
                        VTx     : self.ucVTx,
                        SdpStrType : self.MySdp.type,
                        SdpStr  : self.MySdp.sdp
                    }
                }
            });

            self.MicInd(false);

            if (IDT.SRV_TYPE_CONF == self.SrvType || IDT.SRV_TYPE_CONF_JOIN == self.SrvType)
            {
                if (self.ucVRx || self.ucVTx)
                    self.bIsGCall = false;
                else
                    self.bIsGCall = true;
            }
            else
            {
                self.bIsGCall = false;
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到MODIFYACK的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RecvModifyAckProc = function(RecvMsg)
        {
            return 0;
        };
//--------------------------------------------------------------------------------
//      发送信息
//  输入:
//      dwInfo:         信息码
//      pucInfo:        信息内容
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.UserSendInfo = function(dwInfo, pucInfo)
        {
            return m_IDT_INST.McLink.SendJson({
				MsgCode : IDT.MSG_CC_INFO,
                SrcFsm  : self.uiMyId,
                DstFsm  : self.uiPeerFsmId,
				MsgBody :
				{
                    UsrNum      : self.strMyNum,
                    Info :
                    {
                        Info    : dwInfo,
                        InfoStr : pucInfo
                    }
			    }
            });
        };
//--------------------------------------------------------------------------------
//      话权控制
//  输入:
//      bWant:          true:话权请求,false:话权释放
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallMicCtrl = function(bWant)
        {
            if (false == self.bInit)
                return 0;
            
            //如果有按键定时器,记录下来,返回
            if (null != self.TimerPress)
            {
                self.bPressUserWant = bWant;
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "bUserWantMic:", self.bUserWantMic, "bPressUserWant:", self.bPressUserWant);
                return 0;
            }
            
            self.bUserNotify    = true;
            self.bUserWantMic   = bWant;
            self.bPressUserWant = bWant;
            self.ucLastMic      = self.ucATx;

            self.MicCtrl();
            self.MicInd(true);
            self.PressTimer = setTimeout(self.TmPress, self.CPTM_CC_PRESS_LEN);
        };
//--------------------------------------------------------------------------------
//      话权通知
//  输入:
//      bFirst:         是否第一次
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.MicInd = function(bFirst)
        {
            if (false == self.bUserNotify)
                return 0;
            //没有接通过,不发送
            if (false == self.bConnected)
                return 0;		

            var bInd = false;
            //第一次
            if (bFirst)
            {
                if (self.ucLastMic == self.ucATx)
                    bInd = true;
            }
            //不是第一次
            else
            {
                if (2 == self.ucLastMic || self.ucLastMic != self.ucATx)
                    bInd = true;
            }
            
            if (bInd && m_IDT_INST.CallBack.onCallInd)
            {
                m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_MicInd, self.UserCtx, self.ucATx);
            }
            
            self.ucLastMic = self.ucATx;
            return 0;
        };
//--------------------------------------------------------------------------------
//      话权控制处理
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.MicCtrl = function()
        {
            if (false == self.bUserNotify)
                return 0;
            //没有接通过,不发送
            if (false == self.bConnected)
                return 0;

            //用户期望话权
            if (self.bUserWantMic)
            {
                //没有话权,申请
                if (0 == self.ucATx || IDT.SRV_INFO_MICREL == self.ucLastMicReq)
                {
                    PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Send MicReq");
                    //发送话权申请到服务器
                    self.UserSendInfo(IDT.SRV_INFO_MICREQ, '');
                    self.ucLastMicReq = IDT.SRV_INFO_MICREQ;
                }
            }
            //用户释放话权
            else
            {
                //已经有话权了,释放;已经发送了话权申请,正在排队,也释放
                if (self.ucATx || IDT.SRV_INFO_MICREQ == self.ucLastMicReq)
                {
                    PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Send MicRel");
                    //发送话权释放到服务器
                    self.UserSendInfo(IDT.SRV_INFO_MICREL, '');
                    self.ucLastMicReq = IDT.SRV_INFO_MICREL;
                }
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      收到对端消息的处理
//  输入:
//      RecvMsg:        收到的消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.ProcPeerMsg = function(RecvMsg)
        {
            if (false == self.bInit)
                return -1;
            self.iHBCount = 0;
            switch (RecvMsg.MsgCode)
            {
            case IDT.MSG_CC_SETUP:                    //建立
                self.RecvSetupProc(RecvMsg);
                break;
            case IDT.MSG_CC_SETUPACK:                 //建立应答
                self.RecvSetupAckProc(RecvMsg);
                break;
            case IDT.MSG_CC_ALERT:                    //振铃
                self.RecvAlertProc(RecvMsg);
                break;
            case IDT.MSG_CC_CONN:                     //连接
                self.RecvConnProc(RecvMsg);
                break;
            case IDT.MSG_CC_CONNACK:                  //连接应答
                self.RecvConnAckProc(RecvMsg);
                break;
            case IDT.MSG_CC_INFO:                     //信息
                self.RecvInfoProc(RecvMsg);
                break;
            case IDT.MSG_CC_INFOACK:                  //信息应答
                self.RecvInfoAckProc(RecvMsg);
                break;
            case IDT.MSG_CC_MODIFY:                   //媒体修改
                self.RecvModifyProc(RecvMsg);
                break;
            case IDT.MSG_CC_MODIFYACK:                //媒体修改应答
                self.RecvModifyAckProc(RecvMsg);
                break;
            case IDT.MSG_CC_REL:                      //释放
                self.RecvRelProc(RecvMsg);
                break;
            case IDT.MSG_CC_RLC:                      //释放完成
                self.RecvRlcProc(RecvMsg);
                break;
            //case IDT.MSG_HB:
            //case IDT.MSG_CC_HB:                       //心跳
            //    self.RecvHBProc(RecvMsg);
            //    break;
            default:
                break;
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      HB定时器到期
//--------------------------------------------------------------------------------
        self.TmHB = function()
        {
            if (null == self.bInit)
                return 0;
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmHBExpire");
            self.iHBCount++;

            if (self.iHBCount >= 3)
            {
                PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmHB_Disc");
                self.Rel(IDT.CLOSE_BYINNER, IDT.CAUSE_EXPIRE_IDT + IDT.CPTM_CC_HB * 0x100 + IDT.CAUSE_TIMER_EXPIRY);
            }
            else
            {
                m_IDT_INST.McLink.SendJson({
    				MsgCode : IDT.MSG_HB,
                    SrcFsm  : self.uiMyId,
                    DstFsm  : self.uiPeerFsmId
                });
            
                //启动心跳
                PUtility.Log("CWsLink", PUtility.PGetCurTime(), "Start TmHB", self.CPTM_CC_HB_LEN);
                self.TimerHB = setTimeout(self.TmHB, self.CPTM_CC_HB_LEN);
            }
        };
        self.TmSetupAck = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmSetupAck");
            self.Rel(IDT.CLOSE_BYINNER, IDT.CAUSE_EXPIRE_IDT + IDT.CPTM_CC_SETUPACK * 0x100 + IDT.CAUSE_TIMER_EXPIRY);
        };
        self.TmConn = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmConn");
            self.Rel(IDT.CLOSE_BYINNER, IDT.CAUSE_EXPIRE_IDT + IDT.CPTM_CC_CONN * 0x100 + IDT.CAUSE_TIMER_EXPIRY);
        };
        self.TmAnswer = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmAnswer");
            self.Rel(IDT.CLOSE_BYINNER, IDT.CAUSE_EXPIRE_IDT + IDT.CPTM_CC_ANSWER * 0x100 + IDT.CAUSE_TIMER_EXPIRY);
        };
        self.TmConnAck = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmConnAck");
            self.Rel(IDT.CLOSE_BYINNER, IDT.CAUSE_EXPIRE_IDT + IDT.CPTM_CC_CONNACK * 0x100 + IDT.CAUSE_TIMER_EXPIRY);
        };
        self.TmPress = function()
        {
            PUtility.Log("CCFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmPress", self.bPressUserWant);
            self.bUserNotify    = true;
            self.bUserWantMic   = self.bPressUserWant;
            self.ucLastMic      = self.ucATx;

            self.MicCtrl();
            self.MicInd(true);
            if (null != self.TimerPress)
            {
                clearTimeout(self.TimerPress);
                self.TimerPress = null;
            }
        };
//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    }
    return CCFsm;
});


