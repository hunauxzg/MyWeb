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

        //用户标识
        self.ucUserMark         = null;


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

            //用户标识
            self.ucUserMark         = null;
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
                            },
                            UserMark : self.ucUserMark
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

                    var audioConst = {}, videoConst = {};
                    audioConst.deviceId = {exact: m_IDT_INST.AudioInList[0].deviceId};
                    videoConst.deviceId = {exact: m_IDT_INST.VideoInList[0].deviceId};

                    if (true == bAudio)
                    {
                        if (true == bVideo)
                        {
                            navigator.mediaDevices.getUserMedia({audio: audioConst, video: videoConst})
                                .then(self.GotStream);
                                //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                        }
                        else
                        {
                            navigator.mediaDevices.getUserMedia({audio: audioConst, video: false})
                                .then(self.GotStream);
                                //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                        }
                    }
                    else
                    {
                        if (true == bVideo)
                        {
                            navigator.mediaDevices.getUserMedia({audio: false, video: videoConst})
                                .then(self.GotStream);
                                //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                        }
                        else
                        {
                            //不应该到这里
                            navigator.mediaDevices.getUserMedia({audio: false, video: false})
                                .then(self.GotStream);
                                //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                        }
                    }
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
//      ucUserMark;     用户标识,字符串形式
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
        self.CallMakeOut = function(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, strMyNum, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG, ucUserMark)
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
            self.ucUserMark         = ucUserMark;   //用户标识

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
                m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_PeerAnswer, self.UserCtx, self.stDispNum, self.stDispName, self.SrvType, RecvMsg.MsgBody.UserMark, RecvMsg.MsgBody.UserCallRef);
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
                    attr.ARx, attr.ATx, attr.VRx, attr.VTx, RecvMsg.MsgBody.UserMark, RecvMsg.MsgBody.UserCallRef);
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
                    m_IDT_INST.CallBack.onCallInd(IDT.CALL_EVENT_ConfCtrlInd, self.UserCtx, RecvMsg.MsgBody.Info.Info, RecvMsg.MsgBody.UsrNum, RecvMsg.MsgBody.UsrName);
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


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//       状态机s管理
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
(function(global, factory)
{
    if (typeof define === 'function' && define.amd)
    {
        define([], factory);
    }
    else if (typeof module !== 'undefined' && module.exports)
    {
        module.exports = factory();
    }
    else
    {
        global.FsmMgr = factory();
    }
})(this, function() 
{
    function FsmMgr()
    {
        var self = this;
        self.ModuleName     = null;         //模块名字
        
        //初始化标志
        self.bInit = false;
        
        self.iMaxFsm        = 0;            //最大个数
        self.Fsm            = [];           //事物状态机
        

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
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Init');
            
            self.bInit          = true;
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
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'ClearRun');

            var i;
            for (i = 0; i < self.iMaxFsm; i++)
            {
                if (null != self.Fsm[i])
                {
                    if (true == self.Fsm[i].bInit)
                    {
                        self.Fsm[i].ClearRun();
                    }
                }
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      启动
//  输入:
//      ModuleName:     模块名字
//      iMaxFsm:        最大状态机数
//      FsmType:        状态机类型
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Start = function(ModuleName, iMaxFsm, FsmType)
        {
            self.ModuleName = ModuleName;
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Start');
            // 1.判断是否初始化过
            if (true == self.bInit)
            {
                // 2.如果初始化过,最大用户数相同,直接返回
                if (self.iMaxFsm == iMaxFsm)
                {
                    return 0;
                }

                // 3.如果初始化过,释放资源
                self.Exit();
            }

            // 初始化数据
            self.Init();
            
            // 记录参数
            self.iMaxFsm       = iMaxFsm;

            // 申请状态机资源
            var i;
            for (i = 0; i < iMaxFsm; i++)
            {
                self.Fsm[i] = new FsmType();
                self.Fsm[i].uiMyId = i;
            }
            self.bInit      = true;

            return 0;
        };
//--------------------------------------------------------------------------------
//      退出
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Exit = function()
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Exit');
        
            self.ClearRun();

            var i;
            for (i = 0; i < self.iMaxFsm; i++)
            {
                if (null != self.Fsm[i])
                {
                    self.Fsm[i] = null;
                }
            }
            self.iMaxFsm        = null;
            self.bInit          = null;
            return 0;
        };
//--------------------------------------------------------------------------------
//      分配状态机
//  输入:
//      无
//  返回:
//      -1:             失败
//      else:           状态机下标
//--------------------------------------------------------------------------------
        self.Alloc = function()
        {
            var i;
            for (i = 0; i < self.iMaxFsm; i++)
            {
                if (null != self.Fsm[i])
                {
                    if (false == self.Fsm[i].bInit)
                    {
                        self.Fsm[i].bInit = true;
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Alloc=', i);
                        return i;
                    }
                }
            }
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Alloc=-1');
            return -1;
        };
//--------------------------------------------------------------------------------
//      删除状态机
//  输入:
//      index:          移动位置
//  返回:
//      -1:             失败
//      else:           状态机下标
//--------------------------------------------------------------------------------
        self.Remove = function(index)
        {
            var i;
            for (i = index; i < self.iMaxFsm; i++)
            {
                if (i + 1 >= self.iMaxFsm)
                {
                    self.Fsm[i].ClearRun();
                    break;
                }
                if (false == self.Fsm[i].bInit)
                {
                    self.Fsm[i].ClearRun();
                    break;
                }
                self.Fsm[i] = self.Fsm[i + 1];
            }
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), 'Remove=', index);
            return 0;
        };
//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    }
    return FsmMgr;
});

"use strict";
var m_IDT_INST = null;
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      IDT接口
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
        global.CIdtApi = factory();
    }
})(this, function() 
{
    function CIdtApi()
    {
        var self = this;

//--------------------------------------------------------------------------------
//      变量定义
//--------------------------------------------------------------------------------
        self.RUN_MODE           = 1;            //0运行态,1调试态
        self.RUN_MODE_DEBUG     = 1;            //调试
        self.RUN_MODE_RELEASE   = 0;            //发布

        //初始化标志
        self.bInit              = false;

        //配置参数
        self.bIsIe              = null;         //是否IE浏览器
        self.strSrvUrl          = null;         //MC地址
        self.strUserId          = null;         //用户ID,可能是用户号码或用户名
        self.strUserPwd         = null;         //用户密码

        //运行参数
        self.bWss               = null;         //是否WSS,对拼接GS地址有用
        self.strUserNum         = null;         //用户号码
        self.strUserName        = null;         //用户名字
        self.McLink             = null;         //MC的连接
        self.strGpsSrvUrl       = null;         //GPS服务器地址
        self.strStunServer      = null;         //StunServer
        self.GsLink             = null;         //GPS服务器的连接
        self.strGpsServer       = null;         //GpsServer
        self.strFtpServer       = null;         //FtpServer
        self.strFtpUser         = null;         //Ftp用户名
        self.strFtpPwd          = null;         //Ftp密码
        self.strTaskInfo        = null;         //任务服务器信息
        self.MyOrg              = null;         //自己归属的组织信息
        self.UsrType            = null;         //用户类型          UT_TYPE_TAP
        self.UsrAttr            = null;         //用户属性          UT_ATTR_PC
        self.Token              = null;         //TOKEN
        self.CallBack           = null;         //回调函数
        self.TransMgr           = null;         //事务管理者
        self.CC                 = null;         //呼叫管理者
        self.LocalStream        = null;         //本地摄像头和MIC
        self.GUSubsTable        = null;         //用户/组状态订阅
        self.GpsSubsTable       = null;         //GPS订阅,和状态订阅数据结构相同
        self.ScanTimer          = null;         //扫描定时器,1秒一次回调,20秒一个周期
        self.GUScanPos          = null;         //用户和组状态扫描位置
        self.GpsScanPos         = null;         //Gps扫描位置
        self.AudioInList        = [];           //声音输入设备列表
        self.AudioOutList       = [];           //声音输出设备列表
        self.VideoInList        = [];           //视频输入设备列表

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
            PUtility.Log("IdtApi", PUtility.PGetCurTime(), "Got local stream");
            self.LocalStream = stream;
        };

        self.gotDevices = function(mediaDevices)
        {
            var i = 0;
            var AudioIn = [], AudioOut = [], VideoIn = [];
            for (i = 0; i < mediaDevices.length; i++)
            {
                if (mediaDevices[i].kind === 'audioinput')
                {
                    self.AudioInList.push(mediaDevices[i]);
                }
                else if (mediaDevices[i].kind === 'audiooutput')
                {
                    self.AudioOutList.push(mediaDevices[i]);
                }
                else if (mediaDevices[i].kind === 'videoinput')
                {
                    self.VideoInList.push(mediaDevices[i]);
                }
            }
        };

//--------------------------------------------------------------------------------
//      启动
//  输入:
//      strSrvUrl:      服务器地址      ws://192.168.2.11:10004     wss://192.168.2.11:8801/mc_wss
//      strGpsSrvUrl:   GPS服务器地址   ws://192.168.2.11:10005     wss://192.168.2.11:8801/gs_wss
//      strUserId:      用户ID,可以是号码,或者名字(UTF-8)
//      strPwd:         密码
//      iMaxTrans:      最大事务数
//      iMaxCall:       最大呼叫数
//      iMaxStatueSubs: 最大状态订阅数,通常是1,订阅"0"或"###"
//      iMaxGpsSubs:    最大GPS订阅数,默认4096,0表示不需要GPS功能
//      CallBack:       回调函数
//          onRecvMsgHook:      收到消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
//          onSendMsgHook:      发送消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
//          onStatusInd:        登录状态指示
//          onGInfoInd:         组信息指示,指示用户在哪些组里面
//          onIMRecv:           即时消息接收指示
//          onGUOamInd:         用户/组OAM操作指示
//          onGUStatusInd:      用户/组状态指示
//          onGpsRecInd:        GPS数据指示
//          onGpsHisQueryInd:   GPS历史数据查询响应
//          onCallInd:          呼叫指示
//      bIsIe:          是否IE浏览器
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Start = function(strSrvUrl, strGpsSrvUrl, strUserId, strPwd, iMaxTrans, iMaxCall, iMaxStatusSubs, iMaxGpsSubs, CallBack, bIsIe)
        {
            // 1.判断是否初始化过
            if (true == self.bInit)
            {
                // 2.如果初始化过,而且地址/用户ID和密码都相同,而且在线,返回成功
                if (self.strSrvUrl == strSrvUrl && self.strUserId == strUserId && self.strUserPwd == strPwd && 3 == self.McLink.Status)
                {
                    return 0;
                }

                // 3.如果初始化过,释放资源
                self.Exit();
            }

            m_IDT_INST      = self;
            if (self.RUN_MODE_DEBUG == self.RUN_MODE)
            {
                //if (typeof(console) == "" || typeof(console)== "undefined" || null == console || null == console.log)
                if (bIsIe)
                {
                    PUtility.Log = PUtility.Log2;
                }
                else
                {
                    PUtility.Log = console.log;
                }
            }
            else
            {
                PUtility.Log = PUtility.Log1;
            }

            // 记录参数
            self.strSrvUrl  = strSrvUrl;
            self.strGpsSrvUrl = strGpsSrvUrl;
            self.strUserId  = strUserId;
            self.strUserPwd = strPwd;
            self.CallBack   = CallBack;
            self.bIsIe      = bIsIe;
            if (-1 == self.strSrvUrl.indexOf('wss'))
            {
                self.bWss   = false;
            }
            else
            {
                self.bWss   = true;
            }
            //转换STUN地址
            self.strStunServer = self.strSrvUrl.split("//")[1];
            self.strStunServer = self.strStunServer.split(":")[0];
            self.strStunServer = "stun:" + self.strStunServer + ":10101";

            // 启动连接
            self.McLink = new CWsLink();
            self.McLink.Start("McLink", strSrvUrl, true, strUserId, strPwd, self.CallBack.onStatusInd, self.onWsLinkMcMessage, self.CallBack.onSendMsgHook);
            //self.strUserNum = strUserId;

            //初始化事务资源
            self.TransMgr = new FsmMgr();
            self.TransMgr.Start("TransMgr", iMaxTrans, TransFsm);

            //初始化呼叫资源
            self.CC = new FsmMgr();
            self.CC.Start("CCMgr", iMaxCall, CCFsm);
            if (false == self.bIsIe)
            {
                navigator.mediaDevices.enumerateDevices().then(self.gotDevices);
                
                if (false == self.bWss)//HTTPS模式下,打开摄像头和麦克风不弹框
                {
                    navigator.mediaDevices.getUserMedia({audio: true, video: true})
                        .then(self.GotStream);
                        //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
                }
            }
            
            //状态订阅
            self.GUSubsTable = new FsmMgr();
            self.GUSubsTable.Start("StatusSubsMgr", iMaxStatusSubs, SubsFsm);

            //GPS订阅
            self.GpsSubsTable = new FsmMgr();
            self.GpsSubsTable.Start("GpsSubsMgr", iMaxGpsSubs, SubsFsm);

            self.ScanTimer  = setTimeout(self.TmScan, 1000);
            self.GUScanPos  = 0;
            self.GpsScanPos = 0;

            self.bInit      = true;
            return 0;
        };

//--------------------------------------------------------------------------------
//      退出
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Exit = function()
        {
            if (false == self.bInit)
            {
                return 0;
            }
            self.McLink.Exit();
            self.McLink = null;
            if (null != self.CallBack.onStatusInd)
            {
                self.CallBack.onStatusInd(0, IDT.CAUSE_ZERO);
            }
            if (null != self.GsLink)
            {
                self.GsLink.Exit();
                self.GsLink= null;
            }
            self.CC.Exit();
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
            if (null != self.ScanTimer)
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), "Stop ScanTimer");
                clearTimeout(self.ScanTimer);
                self.ScanTimer = null;
            }
            self.GUSubsTable.Exit();
            self.GpsSubsTable.Exit();

            //配置参数
            self.bIsIe              = null;
            self.strSrvUrl          = null;
            self.strUserId          = null;
            self.strUserPwd         = null;

            //运行参数
            self.bWss               = null;
            self.strUserNum         = null;         //用户号码
            self.strUserName        = null;         //用户名字
            self.McLink             = null;         //MC的连接
            self.strGpsSrvUrl       = null;         //GPS服务器地址
            self.strStunServer      = null;         //StunServer
            self.GsLink             = null;         //GPS服务器的连接
            self.strGpsServer       = null;         //GpsServer
            self.strFtpServer       = null;         //FtpServer
            self.strFtpUser         = null;         //Ftp用户名
            self.strFtpPwd          = null;         //Ftp密码
            self.strTaskInfo        = null;         //任务服务器信息
            self.MyOrg              = null;         //自己归属的组织信息
            self.UsrType            = null;         //用户类型  IDT_TYPE_
            self.UsrAttr            = null;         //用户属性
            self.Token              = null;         //TOKEN
            self.CallBack           = null;         //回调函数
            self.TransMgr           = null;         //事务管理者
            self.CC                 = null;         //呼叫管理者
            self.LocalStream        = null;         //本地摄像头和MIC
            self.GUSubsTable        = null;         //用户/组状态订阅
            self.GpsSubsTable       = null;         //GPS订阅,和状态订阅数据结构相同
            self.ScanTimer          = null;         //扫描定时器,1秒一次回调,20秒一个周期
            self.GUScanPos          = null;         //用户和组状态扫描位置
            self.GpsScanPos         = null;         //Gps扫描位置

            self.LocalStream        = null;
            self.GUSubsTable        = null;
            self.GpsSubsTable       = null;
            self.GUScanPos          = null;
            self.GpsScanPos         = null;         //扫描位置
            self.AudioInList.splice(0, self.AudioInList.length);//声音输入设备列表
            self.AudioOutList.splice(0, self.AudioOutList.length);//声音输出设备列表
            self.VideoInList.splice(0, self.VideoInList.length);//视频输入设备列表

            m_IDT_INST              = null;
            
            //初始化标志
            self.bInit              = null;
            return 0;
        };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      状态
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      清除状态订阅
//  输入:
//      subs:           订阅管理者
//      link:           链路
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.ClearAllStatusSubs = function(subs, link)
        {
            
            var i, count;
            var strMsg='[';
            for (i = 0, count = 0; i < subs.iMaxFsm; i++)
            {
                if (null == subs.Fsm[i])
                    break;
                if (true != subs.Fsm[i].bInit)
                    break;

                if (0 == count)
                    strMsg += ('{"Num":"' + subs.Fsm[i].Num + '","Level":' + IDT.GU_STATUSSUBS_NONE + '}');
                else
                    strMsg += (',{"Num":"' + subs.Fsm[i].Num + '","Level":' + IDT.GU_STATUSSUBS_NONE + '}');
                subs.Fsm[i].ClearRun();
                count++;
            }
            strMsg+=']';
            
            if (count <= 0)
                return 0;
            
            var msg = JSON.parse(strMsg);
            if (null == link)
                return -1;
            
            link.SendJson({
				MsgCode : IDT.MSG_MM_STATUSSUBS,
				MsgBody :
				{
                    UsrNum      : self.strUserNum,
                    SN          : 1,
                    StatusSubs  : msg
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      发送一条订阅请求给服务器
//  输入:
//      link:           链路
//      num:            用户号码或组号码,"##0"表示取消之前所有订阅,"0"表示所有用户,"###"表示自己所属的所有组
//      level:          订阅级别,GU_STATUSSUBS_e
//      dwSn:           SN,0表示不需要立即发送状态,1表示启动一次性加载,else为响应服务器的SN
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.SendStatusSubsOne = function(link, num, level, dwSn)
        {
            if (null == num || '' == num)
                return -1;
            if (null == link)
                return -1;
            link.SendJson({
				MsgCode : IDT.MSG_MM_STATUSSUBS,
				MsgBody :
				{
                    UsrNum      : self.strUserNum,
                    SN          : dwSn,
                    StatusSubs  : [{Num : num, Level : level}]
			    }
            });
        	return 0;
        };
//--------------------------------------------------------------------------------
//      发送订阅请求给服务器
//  输入:
//      link:           链路
//      subs:           订阅表
//      iStart:         开始位置
//      iEnd:           结束位置
//  返回:
//      0:              发送了消息
//      -1:             没有发送消息
//--------------------------------------------------------------------------------
        self.SendStatusSubs = function(link, subs, iStart, iEnd, sn)
        {
            if (null == link || null == subs || iStart < 0 || iEnd > subs.iMaxFsm || iEnd < iStart || iEnd - iStart > IDT.GU_STATUSSUBS_MAXNUM)
                return -1;
            var msg = {};
            msg.MsgCode         = IDT.MSG_MM_STATUSSUBS;
            msg.MsgBody         = {};
            msg.MsgBody.UsrNum  = self.strUserNum;
            msg.MsgBody.SN      = sn;
            var i, j;
            msg.MsgBody.StatusSubs = [];
            for (i = iStart, j = 0; i < iEnd; i++, j++)
            {
                if (false == subs.Fsm[i].bInit)
                    break;
                msg.MsgBody.StatusSubs[j] = {};
                msg.MsgBody.StatusSubs[j].Num = subs.Fsm[i].Num;
                msg.MsgBody.StatusSubs[j].Level = subs.Fsm[i].Level;
            }
            if (j <= 0)
                return -1;
            if (null == link)
                return -1;
            link.SendJson(msg);
            return 0;
        };

//--------------------------------------------------------------------------------
//      订阅
//  输入:
//      name:           名字
//      table:          表
//      link:           链路
//      num:            号码
//      level:          订阅级别,GU_STATUSSUBS_e
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.TableSubs = function(name, table, link, num, level)
        {
            PUtility.Log("IdtApi", PUtility.PGetCurTime(), name, num, level);
            
            if (null == num || '' == num)
                return -1;
            if (null == level || level < IDT.GU_STATUSSUBS_NONE || level > IDT.GU_STATUSQUERY_MAX)
                return -1;
            
            // 1.取消
            if (num == IDT.GU_STATUSSUBS_STR_CLEARALL)
            {
                self.ClearAllStatusSubs(table, link);
                return 0;
            }
            
            // 2.订阅所有用户和组
            if (num == IDT.GU_STATUSSUBS_STR_ALL)
            {
                self.ClearAllStatusSubs(table, link);
            }

            //寻找相同的
            var i;
            for (i = 0; i < table.iMaxFsm; i++)
            {
                //获取第一个空闲
                if (false == table.Fsm[i].bInit)
                {
                    break;
                }
                
                if (num == table.Fsm[i].Num)
                {
                    table.Fsm[i].Level = level;
                    if (IDT.GU_STATUSSUBS_NONE == level)
                    {
                        table.Remove(i);
                    }
                    self.SendStatusSubsOne(link, num, level, 1);//第一次订阅SN=1
                    return 0;
                }
            }

            if (i >= table.iMaxFsm)
                return -1;
            if (IDT.GU_STATUSSUBS_NONE == level)//置空,处理完毕
                return 0;
            table.Fsm[i].bInit = true;
            table.Fsm[i].Num = num;
            table.Fsm[i].Level = level;
            PUtility.Log(table.ModuleName, PUtility.PGetCurTime(), 'Alloc=', i);
            self.SendStatusSubsOne(link, num, level, 1);//第一次订阅SN=1
            return 0;
        };
//--------------------------------------------------------------------------------
//      状态订阅
//  输入:
//      num:            用户号码或组号码,"##0"表示取消之前所有订阅,"0"表示所有用户,"###"表示自己所属的所有组
//      level:          订阅级别,GU_STATUSSUBS_DETAIL1等
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.StatusSubs = function(num, level)
        {
            return self.TableSubs("StatusSubs", self.GUSubsTable, self.McLink, num, level);
        };
//--------------------------------------------------------------------------------
//      GPS订阅
//  输入:
//      num:            用户号码,"##0"表示取消之前所有订阅
//      level:          订阅级别,GU_STATUSSUBS_DETAIL1等
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GpsSubs = function(num, level)
        {
            if (IDT.GU_STATUSSUBS_STR_ALL == num || IDT.GU_STATUSSUBS_STR_GROUP == num)
                return -1;
            return self.TableSubs("GpsSubs", self.GpsSubsTable, self.GsLink, num, level);
        };
//--------------------------------------------------------------------------------
//      GPS上报
//  输入:
//      num:            上报的号码(通常为自己,如果为其他用户,说明调度台指定了用户的位置信息)
//      longitude:      经度,字符串格式,6位小数
//      latitude:       纬度,字符串格式,6位小数,可以是负数
//      speed:          速度,字符串格式,6位小数
//      direction:      方向,字符串格式,6位小数
//      time:           时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GpsReport = function(num, longitude, latitude, speed, direction, time)
        {
            if (null == num)
            {
                num = self.strUserNum;
            }
                
            self.GsLink.SendJson({
				MsgCode : IDT.MSG_MM_GPSREPORT,
				MsgBody :
				{
                    GpsRecStr   :
                    {
                        Num     : num,
                        Status  : 1,
                        Count   : 1,
                        GpsInfo :
                        [
                            {
                                Longitude   : longitude,
                                Latitude    : latitude,
                                Speed       : speed,
                                Direction   : direction,
                                Time        : time
                            }
                        ]
                    }
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      GPS历史数据查询
//  输入:
//      num:            查询的号码
//      sn:             操作序号
//      startTime:      开始时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//      endTime:        结束时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GpsHisQuery = function(num, sn, startTime, endTime)
        {
            self.GsLink.SendJson({
				MsgCode : IDT.MSG_MM_GPSHISQUERYREQ,
				MsgBody :
				{
                    InvokeNum   : self.strUserNum,
                    UsrNum      : num,
                    SN          : sn,
                    GpsQueryExt :
                    {
                        EndFlag : 0,
                        Page    : 0,
                        Count   : IDT.GPS_REC_MAX,
                        StartTime : startTime,
                        EndTime : endTime
                    }
			    }
            });
            return 0;
        };

//--------------------------------------------------------------------------------
//      扫描定时器到期
//--------------------------------------------------------------------------------
        self.TmScan = function()
        {
            self.ScanTimer  = setTimeout(self.TmScan, 1000);

            var i, iGpsStart = 0, iGpsEnd = 0, iGpsStep = Math.floor(self.GpsSubsTable.iMaxFsm / 20);
            iGpsStart   = self.GpsScanPos * iGpsStep;
            if (((self.GpsScanPos + 1) * iGpsStep) >= self.GpsSubsTable.iMaxFsm)
                iGpsEnd = self.GpsSubsTable.iMaxFsm;
            else
                iGpsEnd = (self.GpsScanPos + 1) * iGpsStep;
            //PUtility.Log("IdtApi", PUtility.PGetCurTime(), "GpsScan", iGpsStart, "~", iGpsEnd);

            for (i = iGpsStart; i < iGpsEnd; i += IDT.GU_STATUSSUBS_MAXNUM)
            {
                if (i + IDT.GU_STATUSSUBS_MAXNUM < iGpsEnd)
                {
                    if (0 != self.SendStatusSubs(self.GsLink, self.GpsSubsTable, i, i + IDT.GU_STATUSSUBS_MAXNUM, 0))
                        break;
                   // PUtility.Log("IdtApi", PUtility.PGetCurTime(), "GpsScanSend", i, "~", i + IDT.GU_STATUSSUBS_MAXNUM);
                }
                else
                {
                    if (0 != self.SendStatusSubs(self.GsLink, self.GpsSubsTable, i, iGpsEnd, 0))
                        break;
                    //PUtility.Log("IdtApi", PUtility.PGetCurTime(), "GpsScanSend", i, "~", iGpsEnd);
                }
            }
            
            if ((self.GpsScanPos * iGpsStep) >= self.GpsSubsTable.iMaxFsm)
            {
                self.GpsScanPos = 0;
            }
            else
            {
                self.GpsScanPos++;
            }

            self.GUScanPos++;
            if (self.GUScanPos >= 20)
            {
                self.GUScanPos = 0;
                self.SendStatusSubs(self.McLink, self.GUSubsTable, 0, self.GUSubsTable.iMaxFsm, 0);
                //PUtility.Log("IdtApi", PUtility.PGetCurTime(), "GUScanSend", 0, "~", self.GUSubsTable.iMaxFsm);
            }
            return 0;
        };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      OAM操作
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      OAM预处理
//  输入:
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      -1:             失败
//      else:           事务状态机号
//--------------------------------------------------------------------------------
        self.OamPreProc = function(fnCallBack)
        {
            if (null == fnCallBack)
                return -1;
            if (false == self.bInit || 3 != self.McLink.Status)
            {
                fnCallBack(false, IDT.CAUSE_LINK_DISC, null);
                return -1;
            }
            var dwSn = self.TransMgr.Alloc();
            if (dwSn < 0)
            {
                fnCallBack(false, IDT.CAUSE_TEMPORARY_FAILURE, null);
                return -1;
            }
            self.TransMgr.Fsm[dwSn].Start(fnCallBack);
            return dwSn;
        };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组织操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询组织
//  输入:
//      strNum:         组织号码,如果自己是admin,号码是"all",表示查询所有组织
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.OQuery = function(strNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_O_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					OrgListMgr  : 
					[
                    {
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
                        EndTime : ""
                    }
                    ]
			    }
            });
            return 0;
        };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组织操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      用户操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询用户
//  输入:
//      pucNum:         用户号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.UQuery = function(pucNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_USER_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    UsrNum      : pucNum
			    }
            });
            return 0;
        };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      用户操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询组
//  输入:
//      pucGNum:        组号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GQuery = function(pucGNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_G_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					GNum        : pucGNum,
					QueryExt    :
                    {
                        All     : 0,
                        Group   : 0,
                        User    : 0,
                        Order   : 0,
                        Page    : 0,
                        Count   : 0,
                        TotalCount : 0
                    }
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      查询组内用户信息
//  输入:
//      jQuery:         查询条件
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jQuery = {
//          GNum        : strGNum,      组号码."0",表示查询组织下所有用户/组
//              QueryExt:
//              {
//                All     : 1,          是否所有用户/组,同"0"
//                Group   : iGroup,     是否查询组,0不查询,1查询
//                User    : iUser,      是否查询用户,0不查询,1查询
//                Order   : 0,          排序方式,0按号码排序,1按名字排序
//                Page    : iPage,      第几页
//                Count   : 1024,       每页有多少数据,最大1024
//                TotalCount : 0        总数,返回时使用
//            }
//        };
//--------------------------------------------------------------------------------
        self.GQueryU = function(jQuery, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;

            jQuery.OpCode    = IDT.OPT_G_QUERYUSER;
            jQuery.InvokeNum = self.strUserNum;
            jQuery.OpSN      = dwSn;
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody : jQuery
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      查询用户所在组信息
//  输入:
//      pucUNum:        用户号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.UQueryG = function(pucUNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_U_QUERYGROUP,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					UsrNum      : pucUNum
			    }
            });
            return 0;
        };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      发送IM消息
//  输入:
//      dwSn:           消息事务号
//      dwType:         及时消息类型    IM_TYPE_TXT(1)
//      strTo:          目的号码
//      strTxt:         文本内容
//      strFileName:    文件名
//      strSourceFileName:源文件名
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.IMSend = function(dwSn, dwType, strTo, strTxt, strFileName, strSourceFileName)
        {
            self.McLink.SendJson({
				MsgCode : IDT.MSG_MM_PASSTHROUGH,
				MsgBody :
				{
                    MyNum       : self.strUserNum,
                    PeerNum     : strTo,
                    ImInfo      :
                    {
                        Code    : IDT.PTE_CODE_TXREQ,
                        Type    : dwType,   //IM_TYPE_TXT
                        UtSn    : dwSn,
                        
                        From    : self.strUserNum,
                        To      : "",
                        OriTo   : strTo,
                        Txt     : strTxt,
                        FileName : strFileName,
                        SourceFileName : strSourceFileName
                    }
			    }
            });
            return 0;
        };

        self.CallCheckFsm = function(ID)
        {
            if (null == ID || ID < 0 || ID >= self.CC.iMaxFsm)
                return -1;
            if (false == self.CC.Fsm[ID].m_bInit)
                return -1;
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
//      strPeerNum:     对方号码
//      SrvType:        业务类型,SRV_TYPE_BASIC_CALL等
//      strPwd:         密码,创建或进入会场的密码
//      ucCallOut:      服务器是否直接呼出,0不呼出,1直接呼出
//      ucDelG:         会议结束后,是否删除组,0不删除,1删除
//      ucUserMark;     用户标识,字符串形式
//      AudioInDeviceId:语音输入设备
//      VideoInDeviceIn:语音输入设备
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
        self.CallMakeOut = function(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG, ucUserMark)
        {
            var i;
            i = self.CC.Alloc();
            if (i < 0)
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), "CallMakeOut", -1);
                return -1;
            }
            i = self.CC.Fsm[i].CallMakeOut(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, self.strUserNum, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG, ucUserMark);
            if (i < 0)
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), "CallMakeOut", -1);
            }
            else
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), "CallMakeOut", i);
            }
            return i;
        };
//--------------------------------------------------------------------------------
//      用户应答
//  输入:
//      ID:             IDT的呼叫ID
//      UsrCtx:         用户上下文,通常不使用
//      idLocalV:       本端音视频控件ID,video标签
//      idPeerV:        对端音视频控件ID,video标签
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallAnswer = function(ID, UsrCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            self.CC.Fsm[ID].UserAnswer(UsrCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx);
            return 0;
        };
//--------------------------------------------------------------------------------
//      呼叫释放
//  输入:
//      ID:             IDT的呼叫ID
//      UsrCtx:         用户上下文,通常不用这个
//      uiCause:        释放原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallRel = function(ID, UsrCtx, uiCause)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            self.CC.Fsm[ID].Rel(IDT.CLOSE_BYUSER, uiCause);
            return 0;
        };
//--------------------------------------------------------------------------------
//      设置对端音量
//  输入:
//      ID:             IDT的呼叫ID
//      volume:         音量,0.00~1.00
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallSetPeerVolume = function(ID, volume)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            try
            {
                if (null != self.CC.Fsm[ID].idPeerV)
                {
                    if (true == m_IDT_INST.bIsIe)
                    {
                        self.CC.Fsm[ID].idPeerV.setPeerVolume(volume);
                    }
                    else
                    {
                        self.CC.Fsm[ID].idPeerV.volume = volume;
                    }
                    self.CC.Fsm[ID].tmp_bSetVolume = true;
                }
                else if (null != self.CC.Fsm[ID].tmp_idPeerV)
                {
                    if (true == m_IDT_INST.bIsIe)
                    {
                        self.CC.Fsm[ID].tmp_idPeerV.setPeerVolume(volume);
                    }
                    else
                    {
                        self.CC.Fsm[ID].tmp_idPeerV.volume = volume;
                    }
                    self.CC.Fsm[ID].tmp_bSetVolume = true;
                }
                else
                {
                    return -1;
                }
            }
            catch (e)
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), e);
                return -1;
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      设置本端音量
//  输入:
//      ID:             IDT的呼叫ID
//      volume:         音量,0.00~1.00
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallSetMyVolume = function(ID, volume)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            if (null == self.CC.Fsm[ID].idLocalV)
                return -1;
            try
            {
                if (true == m_IDT_INST.bIsIe)
                {
                    //self.CC.Fsm[ID].idLocalV.setLocalVolume(volume);
                }
                else
                {
                    self.CC.Fsm[ID].idLocalV.volume = volume;
                }
            }
            catch (e)
            {
                PUtility.Log("IdtApi", PUtility.PGetCurTime(), e);
                return -1;
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      通话状态下发送号码
//  输入:
//      ID:             IDT的呼叫ID
//      cNum:           发送的号码,ASC字符串形式,有效值为"0"~"9","*","#","A"~"D",16(FLASH)
//      dwStreamId:     流号
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallSendNum = function(ID, cNum)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            return 0;
        };
//--------------------------------------------------------------------------------
//      话权控制
//  输入:
//      ID:             IDT的呼叫ID
//      bWant:          true:话权请求,false:话权释放
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallMicCtrl = function(ID, bWant)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;
            self.CC.Fsm[ID].CallMicCtrl(bWant);
        };
//--------------------------------------------------------------------------------
//      呼叫中添加/删除用户
//  输入:
//      strCallRef:     呼叫参考号
//      strNum:         用户号码
//      ucOp:           0删除,1添加
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallUserCtrl = function(strCallRef, strNum, ucOp, ucARx, ucATx, ucVRx, ucVTx)
        {
            return self.McLink.SendJson({
				MsgCode : IDT.MSG_CC_USERCTRL,
				MsgBody :
				{
                    CallUserCtrl:
                    {
                        CallRef : strCallRef,
                        Num     : strNum,
                        Op      : ucOp,
                        AudioRecv : ucARx,
                        AudioSend : ucATx,
                        VideoRecv : ucVRx,
                        VideoSend : ucVTx
                    }
			    }
            });
        };
//--------------------------------------------------------------------------------
//      查询会场状态
//  输入:
//      strCallRef:     会议组号码
//      dwSn:           操作序号
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallConfStatusReq = function(strCallRef, dwSn)
        {
            return self.McLink.SendJson({
				MsgCode : IDT.MSG_CC_CONFSTATUSREQ,
				MsgBody :
				{
                    MyNum       : strCallRef,
                    OpSN        : dwSn
			    }
            });
        };
//--------------------------------------------------------------------------------
//      会议控制
//  输入:
//      ID:             IDT的呼叫ID
//      strNum:         号码
//      ucCtrl:         控制信息,SRV_INFO_MICGIVE/SRV_INFO_MICTAKE
//      ucQueue:        队列号,0台上队列,1台下队列
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallConfCtrlReq = function(ID, strNum, ucCtrl, ucQueue)
        {
            if (0 != self.CallCheckFsm(ID))
                return -1;

            var dwInfo = ucQueue * 0x100 + ucCtrl;
            return self.McLink.SendJson({
				MsgCode : IDT.MSG_CC_INFO,
                SrcFsm  : self.CC.Fsm[ID].uiMyId,
                DstFsm  : self.CC.Fsm[ID].uiPeerFsmId,
				MsgBody :
				{
                    UsrNum      : strNum,
                    Info :
                    {
                        Info    : dwInfo,
                        InfoStr : strNum
                    }
			    }
            });
        };
//--------------------------------------------------------------------------------
//      呼叫透传信息
//  输入:
//      ID:             IDT的呼叫ID
//      dwInfo:         信息码
//      pucInfo:        信息内容
//      peerNum:        对端号码,如果不存在呼叫,用这个号码进行处理
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.CallSendInfo = function(ID, dwInfo, pucInfo, peerNum)
        {
            if (0 == self.CallCheckFsm(ID))//状态机正确
            {
                return self.McLink.SendJson({
    				MsgCode : IDT.MSG_CC_INFO,
                    SrcFsm  : self.CC.Fsm[ID].uiMyId,
                    DstFsm  : self.CC.Fsm[ID].uiPeerFsmId,
    				MsgBody :
    				{
                        Info :
                        {
                            Info    : dwInfo,
                            InfoStr : pucInfo
                        }
    			    }
                });
            }
            else//没有状态机,用号码直接处理
            {
                if (null == peerNum || '' == peerNum)
                    return -1;
                return self.McLink.SendJson({
    				MsgCode : IDT.MSG_CC_INFO,
    				MsgBody :
    				{
                        Info :
                        {
                            Info    : dwInfo,
                            InfoStr : pucInfo
                        },
                        PeerNum : peerNum
    			    }
                });            
            }
        };
//--------------------------------------------------------------------------------
//      强拆
//  输入:
//      pcPeerNum:      对方号码
//  返回:
//      -1:             失败
//      else:           呼叫标识
//--------------------------------------------------------------------------------
        self.ForceRel = function(pcPeerNum)
        {
            return self.McLink.SendJson({
				MsgCode : IDT.MSG_CC_INFO,
				MsgBody :
				{
                    MyNum       : self.strUserNum,
                    PeerNum     : pcPeerNum,
                    SrvType     : IDT.SRV_TYPE_FORCE_REL
			    }
            });
        };
//--------------------------------------------------------------------------------
//      GPS链路状态指示
//  输入:
//      status:         状态值
//      usCause:        原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsLinkGpsStatus = function(status, usCause)
        {
            PUtility.Log("IdtApi", PUtility.PGetCurTime(), "onWsLinkGpsStatus", status, usCause);
            self.GpsScanPos = 0;
            if (IDT.UT_STATUS_ONLINE != status)
                return 0;
            var i;
            for (i = 0; i < self.GpsSubsTable.iMaxFsm; i++)
            {
                if (false == self.GpsSubsTable.Fsm[i].bInit)
                    break;
                self.SendStatusSubsOne(self.GsLink, self.GpsSubsTable.Fsm[i].Num, self.GpsSubsTable.Fsm[i].Level, 1);
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      GS消息指示
//  输入:
//      msg:            消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsLinkGsMessage = function(msg)
        {
            var i;
            if (self.CallBack.onRecvMsgHook && self.RUN_MODE_DEBUG == self.RUN_MODE)
            {
                self.CallBack.onRecvMsgHook("GsLink", msg);
            }

            switch (msg.MsgCode)
            {
            case IDT.MSG_MM_GPSRECIND://GPS位置信息指示
                if (null != self.CallBack.onGpsRecInd)
                {
                    self.CallBack.onGpsRecInd(msg.MsgBody.GpsRecStr);
                }
                break;
                
            case IDT.MSG_MM_GPSHISQUERYRSP://GPS查询响应
                if (self.CallBack.onGpsHisQueryInd)
                {
                    self.CallBack.onGpsHisQueryInd(msg.MsgBody.UsrNum, msg.MsgBody.SN, msg.MsgBody.GpsQueryExt.EndFlag, msg.MsgBody.GpsRecStr);
                }
                //结束了
                if (1 == msg.MsgBody.GpsQueryExt.EndFlag)
                    break;
                
                self.GsLink.SendJson({
    				MsgCode : IDT.MSG_MM_GPSHISQUERYREQ,
    				MsgBody :
    				{
                        UsrNum      : msg.MsgBody.UsrNum,
                        SN          : msg.MsgBody.SN,
                        GpsQueryExt : msg.MsgBody.GpsQueryExt
    			    }
                });
                break;

            default:
                break;
            }
            return 0;
        };
//--------------------------------------------------------------------------------
//      MC消息指示
//  输入:
//      msg:            消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsLinkMcMessage = function(msg)
        {
            var i, strGps;
            if (self.CallBack.onRecvMsgHook && self.RUN_MODE_DEBUG == self.RUN_MODE)
            {
                self.CallBack.onRecvMsgHook("McLink", msg);
            }
            
            switch (msg.MsgCode)
            {
			case IDT.MSG_MM_REGRSP://注册响应
			    if (0 != msg.MsgBody.Result)
                    break;

			    self.strUserNum = msg.MsgBody.UsrNum;

                if (0 != self.GpsSubsTable.iMaxFsm)//需要订阅GPS
                {
                    if (true == self.bWss)//是WSS
                    {
                        strGps = "wss://" + msg.MsgBody.GpsServerInfoWss +"//gs_wss";
                    }
                    else//是WS
                    {
                        strGps = "ws://" + msg.MsgBody.GpsServerInfo;
                    }

                    if (null == self.strGpsSrvUrl || "" == self.strGpsSrvUrl)
                    {
                        //if (self.strGpsSrvUrl != strGps)//如果和之前的不同,更新
                        {
                            self.strGpsSrvUrl = strGps;
                            if (null != self.GsLink)
                            {
                                self.GsLink.Exit();
                                self.GsLink = null;
                            }
                            self.GsLink = new CWsLink();
                            self.GsLink.Start("GsLink", self.strGpsSrvUrl, false, null, null, self.onWsLinkGpsStatus, self.onWsLinkGsMessage, self.CallBack.onSendMsgHook);
                        }
                    }
                    else
                    {
                        if (null == self.GsLink)
                        {
                            self.GsLink = new CWsLink();
                            self.GsLink.Start("GsLink", self.strGpsSrvUrl, false, null, null, self.onWsLinkGpsStatus, self.onWsLinkGsMessage, self.CallBack.onSendMsgHook);
                        }
                    }
                }

                if (null != msg.MsgBody.FtpServerInfo)
                {
                    self.strFtpServer   = msg.MsgBody.FtpServerInfo.IPAddr;
                    self.strFtpUser     = msg.MsgBody.FtpServerInfo.Name;
                    self.strFtpPwd      = msg.MsgBody.FtpServerInfo.Pwd;
                        
                }
                if (null != msg.MsgBody.GpsServerInfo)
                {
                    self.strGpsServer   = msg.MsgBody.GpsServerInfo;
                }
                if (null != msg.MsgBody.TaskServerInfo)
                {
                    self.strTaskInfo   = msg.MsgBody.TaskServerInfo;
                }
                //SOS号码,未处理????????
                //组织
                if (null != msg.MsgBody.OrgList)
                {
                    self.MyOrg = msg.MsgBody.OrgList[0];
                }
                //TYPE
                if (null != msg.MsgBody.UserType)
                {
                    self.UsrType = msg.MsgBody.UserType;
                }
                //ATTR
                if (null != msg.MsgBody.UserAttr)
                {
                    self.UsrAttr = msg.MsgBody.UserAttr;
                }
                //NAME
                if (null != msg.MsgBody.UsrName)
                {
                    self.strUserName = msg.MsgBody.UsrName;
                }
                //NUM
                if (null != msg.MsgBody.UsrNum)
                {
                    self.strUserNum = msg.MsgBody.UsrNum;
                }
                else
                {
                    self.strUserNum = self.strUserId;
                }
                //Token
                self.Token = self.McLink.strAuthRsp;

                //发送组指示到用户
                if (self.CallBack.onGInfoInd)
                {
                    self.CallBack.onGInfoInd(msg.MsgBody.UsrGInfo);
                }
			    break;

            case IDT.MSG_MM_STATUSNOTIFY://状态提示
                if (self.CallBack.onGUStatusInd)
                {
                    self.CallBack.onGUStatusInd(msg.MsgBody.GMemberStatus);
                }
                
                //如果是一次性加载，返回数据给服务器
                if (0 == msg.MsgBody.SN || null == msg.MsgBody.UsrNum || null == msg.MsgBody.StatusSubs)
                    break;
                if (IDT.GU_STATUSSUBS_NONE == msg.MsgBody.StatusSubs[0].Level)
                    break;
                for (i = 0; i < self.GUSubsTable.iMaxFsm; i++)
                {
                    if (false == self.GUSubsTable.Fsm[i].m_bInit)
                        break;
                    if (msg.MsgBody.StatusSubs[0].Num == self.GUSubsTable.Fsm[i].Num)
                    {
                        self.SendStatusSubsOne(self.McLink, self.GUSubsTable.Fsm[i].Num, self.GUSubsTable.Fsm[i].Level, msg.MsgBody.SN);
                        break;
                    }
                }
                break;

            case IDT.MSG_MM_PASSTHROUGH://IM
                switch (msg.MsgBody.ImInfo.Code)
                {
                case IDT.PTE_CODE_TXREQ:
                    self.McLink.SendJson({
    					MsgCode : IDT.MSG_MM_PASSTHROUGH,
    					MsgBody :
    					{
                            MyNum       : msg.MsgBody.PeerNum,
                            PeerNum     : msg.MsgBody.MyNum,
                            ImInfo      :
                            {
                                Code    : IDT.PTE_CODE_TXCFM,
                                Type    : msg.MsgBody.ImInfo.Type,
                                UtSn    : msg.MsgBody.ImInfo.UtSn,
                                Sn      : msg.MsgBody.ImInfo.Sn
                            }
    				    }
                    });

                    if (self.CallBack.onIMRecv)
                    {
                        self.CallBack.onIMRecv(msg.MsgBody.ImInfo.Sn, msg.MsgBody.ImInfo.Type, msg.MsgBody.ImInfo.From, msg.MsgBody.TrueName, msg.MsgBody.ImInfo.To,
                            msg.MsgBody.ImInfo.OriTo, msg.MsgBody.ImInfo.Txt, msg.MsgBody.ImInfo.FileName, msg.MsgBody.ImInfo.SourceFileName,
                            msg.MsgBody.ImInfo.Time);
                    }
                    break;
                case IDT.PTE_CODE_TXCFM:
                    if (self.CallBack.onIMStatusInd)
                    {
                        self.CallBack.onIMStatusInd(msg.MsgBody.ImInfo.UtSn, msg.MsgBody.ImInfo.Sn, msg.MsgBody.ImInfo.Type, msg.MsgBody.ImInfo.Code);
                        break;
                    }
                    break;
                case IDT.PTE_CODE_USRREAD:
                    self.McLink.SendJson({
    					MsgCode : IDT.MSG_MM_PASSTHROUGH,
    					MsgBody :
    					{
                            MyNum       : msg.MsgBody.PeerNum,
                            PeerNum     : msg.MsgBody.MyNum,
                            ImInfo      :
                            {
                                Code    : IDT.PTE_CODE_USRREADCFM,
                                Type    : msg.MsgBody.ImInfo.Type,
                                UtSn    : msg.MsgBody.ImInfo.UtSn,
                                Sn      : msg.MsgBody.ImInfo.Sn
                            }
    				    }
                    });
                    break;
                default:
                    break;
                }
                break;

            case IDT.MSG_OAM_RSP:
                i = msg.MsgBody.OpSN;
                if (i < 0 || i > self.TransMgr.iMaxFsm)
                    break;
                if (true != self.TransMgr.Fsm[i].bInit)
                    break;
                if (null != self.TransMgr.Fsm[i].pfCallBack)
                {
                    switch (msg.MsgBody.OpCode)
                    {
                    case IDT.OPT_O_QUERY://组织查询
                        if (0 == msg.MsgBody.Cause)
                        {
                            self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, null, msg.MsgBody);
                        }
                        else
                        {
                            self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, null, msg.MsgBody);
                        }
                        break;

                    case IDT.OPT_USER_QUERY://用户查询
                    case IDT.OPT_G_QUERY://组查询
                    case IDT.OPT_G_QUERYUSER://组中查询用户
                    case IDT.OPT_U_QUERYGROUP://用户查询所在组
                        if (0 == msg.MsgBody.Cause)
                        {
                            self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, null, msg.MsgBody);
                        }
                        else
                        {
                            self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, null, msg.MsgBody);
                        }
                        break;

                    default:
                        if (0 == msg.MsgBody.Cause)
                        {
                            self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, null, msg.MsgBody);
                        }
                        else
                        {
                            self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, msg.MsgBody.CauseStr, msg.MsgBody);
                        }
                        break;
                    }
                }
                self.TransMgr.Fsm[i].ClearRun();
                break;

            case IDT.MSG_OAM_NOTIFY:
                if (null != self.CallBack.onGUOamInd)
                {
                    self.CallBack.onGUOamInd(msg.MsgBody.OpCode, msg.MsgBody.GNum, msg.MsgBody.GName, msg.MsgBody.UsrNum, msg.MsgBody.UsrName);
                }
                break;

            case IDT.MSG_CC_SETUP:                  //建立
                //创建FSM,处理Setup
                i = self.CC.Alloc();
                if (i < 0)
                    break;
                self.CC.Fsm[i].ProcPeerMsg(msg);
                break;
                
            case IDT.MSG_CC_SETUPACK:               //建立应答
            case IDT.MSG_CC_ALERT:                  //振铃
            case IDT.MSG_CC_CONN:                   //连接
            case IDT.MSG_CC_CONNACK:                //连接应答
            case IDT.MSG_CC_INFO:                   //信息
            case IDT.MSG_CC_INFOACK:                //信息应答
            case IDT.MSG_CC_MODIFY:                 //媒体修改
            case IDT.MSG_CC_MODIFYACK:              //媒体修改应答
            case IDT.MSG_CC_REL:                    //释放
            case IDT.MSG_CC_RLC:                    //释放完成
            case IDT.MSG_CC_USERCTRL:               //用户控制,加入呼叫/踢出呼叫
            case IDT.MSG_CC_STREAMCTRL:             //流控制
            case IDT.MSG_CC_CONFSTATUSREQ:          //会场状态请求
                //找到FSM,处理消息
                i = msg.DstFsm;
                if (null == i || i < 0 || i >= self.CC.iMaxFsm)
                    break;
                
                self.CC.Fsm[i].ProcPeerMsg(msg);
                break;
                
            case IDT.MSG_CC_CONFSTATUSRSP:          //会场状态响应
                if (self.CallBack.onCallInd)
                {
                    self.CallBack.onCallInd(IDT.CALL_EVENT_ConfStatusRsp, 0, msg.MsgBody);
                }
                break;

            case IDT.MSG_HB:                        //心跳
                if (null == msg.SrcFsm || null == msg.DstFsm)
                    break;
                if (0xffffffff != msg.SrcFsm || 0xffffffff != msg.DstFsm)
                {
                    i = msg.DstFsm;
                    if (null == i || i < 0 || i >= self.CC.iMaxFsm)
                        break;
                    self.CC.Fsm[i].ProcPeerMsg(msg);
                }
                break;

            default:
                break;
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      查询路由
//  输入:
//      jRoute:         路由Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RQuery = function(jRoute, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_R_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					RouteCfg    : 
					[
                        jRoute
                    ]
			    }
            });
            return 0;
        };

//--------------------------------------------------------------------------------
//      添加组织
//  输入:
//      jOrg:           组织Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jOrg = {
//          Num     : "",                   组织号码不用填写,由服务器自动生成
//          Name    : strName,              组织名字
//          Type    : iType,                类型
//          Desc    : strDesc,              组织描述
//          UserNum : iUCount,              用户总数
//          DsNum   : iDCount,              调度台总数
//          GNum    : iGCount,              组个数
//          EUNum   : iEUCount,             终端用户数
//          DS0Num  : strD0Num,             初始调度台号码
//          DS0Pwd  : strD0Pwd,             初始调度台名字
//          DSName  : strDShowName,         调度台显示名字
//          DsIcon  : strDIcon,             调度台图标
//          AppName : strAppName,           APP显示名字
//          AppIcon : strAppIcon,           APP图标
//          USegStart : strUStart,          用户号段开始
//          USegEnd : strUEnd,              用户号段结束
//          GSegStart : strGStart,          组号段开始
//          GSegEnd : strGEnd,              组号段结束
//          DSSegStart : strDSStart,        调度台号段开始
//          DSSegEnd : strDSEnd,            调度台号段结束
//          StartTime: strStartTime,        有效期开始时间
//          EndTime : strEndTime};          有效期结束时间
//--------------------------------------------------------------------------------
        self.OAdd = function(jOrg, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_O_ADD,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					OrgListMgr  : 
					[
                        jOrg
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      删除组织
//  输入:
//      strNum:         组织号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.ODel = function(strNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_O_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					OrgListMgr  : 
					[
                    {
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
                        EndTime : ""
                    }
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      修改组织
//  输入:
//      jOrg:           组织Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jOrg = {
//          Num     : strNum,               组织号码
//          Name    : strName,              组织名字
//          Type    : iType,                类型
//          Desc    : strDesc,              组织描述
//          UserNum : iUCount,              用户总数
//          DsNum   : iDCount,              调度台总数
//          GNum    : iGCount,              组个数
//          EUNum   : iEUCount,             终端用户数
//          DS0Num  : strD0Num,             初始调度台号码
//          DS0Pwd  : strD0Pwd,             初始调度台名字
//          DSName  : strDShowName,         调度台显示名字
//          DsIcon  : strDIcon,             调度台图标
//          AppName : strAppName,           APP显示名字
//          AppIcon : strAppIcon,           APP图标
//          USegStart : strUStart,          用户号段开始
//          USegEnd : strUEnd,              用户号段结束
//          GSegStart : strGStart,          组号段开始
//          GSegEnd : strGEnd,              组号段结束
//          DSSegStart : strDSStart,        调度台号段开始
//          DSSegEnd : strDSEnd,            调度台号段结束
//          StartTime: strStartTime,        有效期开始时间
//          EndTime : strEndTime};          有效期结束时间
//--------------------------------------------------------------------------------
        self.OModify = function(jOrg, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;

            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_O_MODIFY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					OrgListMgr  : 
					[
                        jOrg
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      添加用户
//  输入:
//      jUser:          用户Json对象
//      iCount:         开户个数,通常为1,大于1表示批开户
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jUser = {
//          UsrNum      : strNum,               号码,最大32字节
//          UsrName     : strName,              名字,最大64字节
//          Pwd         : strPwd,               密码,64字节
//          UserType    : iType,                类型                    UT_TYPE_TAP
//          UserAttr    : iAttr,                属性                    UT_ATTR_HS
//          Prio        : iPrio,                优先级                  1~7,1最高
//          ConCurrent  : iConCurrent,          并发数,暂时不使用
//          UserIPAddr  : strCfgIp,             IP地址,字符串形式,192.168.2.11:8080
//          UserAddr    : strAddr,              用户地址,128字节
//          UserContact : strContact,           联系方式,128字节
//          UserDesc    : strDesc,              描述,128字节
//          VTime       : strVTime,             有效时间
//          CamInfo     :                       摄像头信息
//          {
//              Type    : iCamType,             摄像头类型              UT_TYPE_HK
//              Num     : "",                   摄像头网关号码
//              IPAddr  : strCamIp,             摄像头地址,可能是IP地址,或者域名
//              Port    : iCamPort,             端口号
//              Name    : strCamName,           用户名
//              Pwd     : strCamPwd,            密码
//              ChanNum : iCamChanNum           摄像头通道个数
//          },
//          WorkInfo    : strWorkInfo,          WorkInfo
//          UserProxy   : strProxyReg,          用户代理信息      格式:0,无效
//                                              功能块号,代理号码,密码,服务器IP地址:端口号,是否代理注册
//                                              例如:
//                                                  SIP*8000*8000*222.42.245.76:5080*1          代理SIP注册到222.42.245.76:5080
//                                                  TAP*8000*8000*124.160.11.21:10000*1         代理TAP注册到222.42.245.76:5080
//                                                  USER*8000*8000*8001*0                       对方是用户接入到IDS,代理号码是8000,呼出时,自己号码是8001
//          DataRole    : iDataRole,            数据权限
//          MenuRole    : iMenuRole,            菜单权限
//          DeptNum     : strDeptNum,           部门号码
//          ID          : strID,                身份证
//          WorkID      : strWorkId,            工作证
//          WorkUnit    : strWorkUnit,          工作单位
//          Title       : strTitle,             职务
//          CarID       : strCarId,             车牌
//          Tel         : strTel,               电话号码
//          Other       : strOther              其他
//      };
//
//      批开户时:
//          如果号码/用户名/密码相同,后续的号码加1,后续号码/后续用户名/后续密码相同
//          如果号码/用户名/密码不同,后续的号码加1,后续的名字为:名字+1(张三1,张三2,张三100),密码与第一个密码相同
//--------------------------------------------------------------------------------
        self.UAdd = function(jUser, iCount, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;

            jUser.OpCode    = IDT.OPT_USER_ADD;
            jUser.InvokeNum = self.strUserNum;
            jUser.OpSN      = dwSn;
            jUser.GNumU     = iCount;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody : jUser
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      删除用户
//  输入:
//      pucNum:         用户号码
//      iCount:         开户个数,通常为1,大于1表示批删除
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.UDel = function(pucNum, iCount, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_USER_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    UsrNum      : pucNum,
                    GNumU       : iCount
			    }
            });
            return 0;
        };

//--------------------------------------------------------------------------------
//      修改用户
//  输入:
//      jUser:          用户Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jUser = {
//          UsrNum      : strNum,               号码,最大32字节
//          UsrName     : strName,              名字,最大64字节
//          Pwd         : strPwd,               密码,64字节
//          UserType    : iType,                类型                    UT_TYPE_TAP
//          UserAttr    : iAttr,                属性                    UT_ATTR_HS
//          Prio        : iPrio,                优先级                  1~7,1最高
//          ConCurrent  : iConCurrent,          并发数,暂时不使用
//          UserIPAddr  : strCfgIp,             IP地址,字符串形式,192.168.2.11:8080
//          UserAddr    : strAddr,              用户地址,128字节
//          UserContact : strContact,           联系方式,128字节
//          UserDesc    : strDesc,              描述,128字节
//          VTime       : strVTime,             有效时间
//          CamInfo     :                       摄像头信息
//          {
//              Type    : iCamType,             摄像头类型              UT_TYPE_HK
//              Num     : "",                   摄像头网关号码
//              IPAddr  : strCamIp,             摄像头地址,可能是IP地址,或者域名
//              Port    : iCamPort,             端口号
//              Name    : strCamName,           用户名
//              Pwd     : strCamPwd,            密码
//              ChanNum : iCamChanNum           摄像头通道个数
//          },
//          WorkInfo    : strWorkInfo,          WorkInfo
//          UserProxy   : strProxyReg,          用户代理信息      格式:0,无效
//                                              功能块号,代理号码,密码,服务器IP地址:端口号,是否代理注册
//                                              例如:
//                                                  SIP*8000*8000*222.42.245.76:5080*1          代理SIP注册到222.42.245.76:5080
//                                                  TAP*8000*8000*124.160.11.21:10000*1         代理TAP注册到222.42.245.76:5080
//                                                  USER*8000*8000*8001*0                       对方是用户接入到IDS,代理号码是8000,呼出时,自己号码是8001
//          DataRole    : iDataRole,            数据权限
//          MenuRole    : iMenuRole,            菜单权限
//          DeptNum     : strDeptNum,           部门号码
//          ID          : strID,                身份证
//          WorkID      : strWorkId,            工作证
//          WorkUnit    : strWorkUnit,          工作单位
//          Title       : strTitle,             职务
//          CarID       : strCarId,             车牌
//          Tel         : strTel,               电话号码
//          Other       : strOther              其他
//      };
//--------------------------------------------------------------------------------
        self.UModify = function(jUser, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            jUser.OpCode    = IDT.OPT_USER_MODIFY;
            jUser.InvokeNum = self.strUserNum;
            jUser.OpSN      = dwSn;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody : jUser
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      添加组
//  输入:
//      jGroup:         组Json对象
//      jFather:        父组信息
//      jMember:        子成员信息
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jGroup = {
//          GNum        : strGNum,              组名字,如果是空,由服务器自动分配组号码
//          GName       : strGName,             组名字
//          GType       : iType,                组类型,G_TYPE_FOMAL等
//          Prio        : iPrio,                优先级
//          AGNum       : strAGNum};            附加组号码,通常是摄像头组
//      jFather = [
//          {"Num" : "20018888810", "Prio" : 7}   父组号码,在父组中的优先级
//          ];
//      jMember = [
//              {"Prio":7,"Type":1,"Num":"2001"}    号码,类型(1用户,2组),优先级
//              {"Prio":7,"Type":1,"Num":"2002"}    号码,类型(1用户,2组),优先级
//          ];
//--------------------------------------------------------------------------------
        self.GAdd = function(jGroup, jFather, jMember, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            jGroup.OpCode   = IDT.OPT_G_ADD;
            jGroup.InvokeNum= self.strUserNum;
            jGroup.OpSN     = dwSn;
            if (null != jFather)
                jGroup.UsrGInfo = jFather;
            if (null != jMember)
                jGroup.GMember = jMember;

            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody : jGroup
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      删除组
//  输入:
//      pucGNum:        组号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GDel = function(pucGNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_G_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					GNum        : pucGNum
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      修改组
//  输入:
//      jGroup:         组Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jGroup = {
//          GNum        : strGNum,              组名字,如果是空,由服务器自动分配组号码
//          GName       : strGName,             组名字
//          GType       : iType,                组类型,G_TYPE_FOMAL等
//          Prio        : iPrio,                优先级
//          AGNum       : strAGNum};            附加组号码,通常是摄像头组
//--------------------------------------------------------------------------------
        self.GModify = function(jGroup, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;

            jGroup.OpCode    = IDT.OPT_G_MODIFY;
            jGroup.InvokeNum = self.strUserNum;
            jGroup.OpSN      = dwSn;
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody : jGroup
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      组添加用户
//  输入:
//      pucGNum:        组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      ucType:         用户号码所属类型,GROUP_MEMBERTYPE_USER(1)表示pucNum是用户号码,GROUP_MEMBERTYPE_GROUP(2)表示pucNum是组号码
//      ucPrio:         优先级(默认为7)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GAddU = function(pucGNum, pucNum, ucType, ucPrio, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_G_ADDUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    GMember     :
                    [
                    {
                        Prio    : ucPrio,
                        Type    : ucType,
                        UTType  : 0,
                        Attr    : 0,
                        Num     : pucNum,
                        Name    : "",
                        AGNum   : "",
                        ChanNum : 0,
                        Status  : 0,
                        FGCount : 0,
                        FGNum   : ""
                    }
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      组删除用户
//  输入:
//      pucGNum:        组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GDelU = function(pucGNum, pucUNum, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_G_DELUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    UsrNum      : pucUNum
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      组中修改用户
//  输入:
//      pucNum:         组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      ucType:         用户号码所属类型,GROUP_MEMBERTYPE_USER(1)表示pucNum是用户号码,GROUP_MEMBERTYPE_GROUP(2)表示pucNum是组号码
//      ucPrio:         优先级(默认为7)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.GModifyU = function(pucGNum, pucNum, ucType, ucPrio, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_G_MODIFYUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    GMember     :
                    [
                    {
                        Prio    : ucPrio,
                        Type    : ucType,
                        UTType  : 0,
                        Attr    : 0,
                        Num     : pucNum,
                        Name    : "",
                        AGNum   : "",
                        ChanNum : 0,
                        Status  : 0,
                        FGCount : 0,
                        FGNum   : ""
                    }
                    ]
			    }
            });
            return 0;
        };                        

//--------------------------------------------------------------------------------
//      添加路由
//  输入:
//      jRoute:         路由Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jRoute = {
//          RName       :   ucRName,
//          PeerZone    :   ucPeerZone,
//          MyZone      :   ucMyZone,
//          Call        :   iCall,
//          Im          :   iIm,
//          Oam         :   iOam,
//          Metr        :   iMetr,
//          Fid         :   ucFid,
//          IpAddr      :   ucIpAddr,
//          RegNum      :   ucRegNum,
//          OrgNum      :   ucOrgNum
//      }
//--------------------------------------------------------------------------------
        self.RAdd = function(jRoute, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_R_ADD,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					RouteCfg    : 
					[
                        jRoute
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      删除路由
//  输入:
//      jRoute:         路由Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.RDel = function(jRoute, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;
            
            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_R_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					RouteCfg    : 
					[
                        jRoute
                    ]
			    }
            });
            return 0;
        };
//--------------------------------------------------------------------------------
//      修改路由
//  输入:
//      jRoute:         路由Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jRoute = {
//          RName       :   ucRName,
//          PeerZone    :   ucPeerZone,
//          MyZone      :   ucMyZone,
//          Call        :   iCall,
//          Im          :   iIm,
//          Oam         :   iOam,
//          Metr        :   iMetr,
//          Fid         :   ucFid,
//          IpAddr      :   ucIpAddr,
//          RegNum      :   ucRegNum,
//          OrgNum      :   ucOrgNum
//      }
//--------------------------------------------------------------------------------
        self.RModify = function(jRoute, fnCallBack)
        {
            var dwSn = self.OamPreProc(fnCallBack);
            if (dwSn < 0)
                return -1;

            self.McLink.SendJson({
				MsgCode : IDT.MSG_OAM_REQ,
				MsgBody :
				{
                    OpCode      : IDT.OPT_R_MODIFY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
					RouteCfg    : 
					[
                        jRoute
                    ]
			    }
            });
            return 0;
        };


    }

//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    return CIdtApi;
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      功能函数
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var PUtility = {};

PUtility.str_utf8_length = function(string) {
  return unescape(encodeURIComponent(string)).length;
};

PUtility.isFunction = function(fn) {
  if (fn !== undefined) {
    return (Object.prototype.toString.call(fn) === '[object Function]')? true : false;
  } else {
    return false;
  }
};

PUtility.isString = function(str) {
  if (str !== undefined) {
    return (Object.prototype.toString.call(str) === '[object String]')? true : false;
  } else {
    return false;
  }
};

PUtility.isDecimal = function(num) {
  return !isNaN(num) && (parseFloat(num) === parseInt(num,10));
};

PUtility.isEmpty = function(value) {
  if (value === null || value === '' || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof(value) === 'number' && isNaN(value))) {
    return true;
  }
};

PUtility.hasMethods = function(obj /*, method list as strings */){
  var i = 1, methodName;
  while((methodName = arguments[i++])){
    if(this.isFunction(obj[methodName])) {
      return false;
    }
  }
  return true;
};


// http://stackoverflow.com/users/109538/broofa
PUtility.newUUID = function() {
  var UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });

  return UUID;
};

// MD5 (Message-Digest Algorithm) http://www.webtoolkit.info
PUtility.calculateMD5 = function(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }

  function addUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function doF(x,y,z) {
    return (x & y) | ((~x) & z);
  }

  function doG(x,y,z) {
    return (x & z) | (y & (~z));
  }

  function doH(x,y,z) {
    return (x ^ y ^ z);
  }

  function doI(x,y,z) {
    return (y ^ (x | (~z)));
  }

  function doFF(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doF(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doGG(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doG(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doHH(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doH(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doII(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doI(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray = new Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  }

  function wordToHex(lValue) {
    var wordToHexValue='',wordToHexValue_temp='',lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length-2,2);
    }
    return wordToHexValue;
  }

  function utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  var x=[];
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;

  string = utf8Encode(string);

  x = convertToWordArray(string);

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=doFF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=doFF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=doFF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=doFF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=doFF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=doFF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=doFF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=doFF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=doFF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=doFF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=doFF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=doFF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=doFF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=doFF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=doFF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=doFF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=doGG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=doGG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=doGG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=doGG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=doGG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=doGG(d,a,b,c,x[k+10],S22,0x2441453);
    c=doGG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=doGG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=doGG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=doGG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=doGG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=doGG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=doGG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=doGG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=doGG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=doGG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=doHH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=doHH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=doHH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=doHH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=doHH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=doHH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=doHH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=doHH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=doHH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=doHH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=doHH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=doHH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=doHH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=doHH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=doHH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=doHH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=doII(a,b,c,d,x[k+0], S41,0xF4292244);
    d=doII(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=doII(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=doII(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=doII(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=doII(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=doII(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=doII(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=doII(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=doII(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=doII(c,d,a,b,x[k+6], S43,0xA3014314);
    b=doII(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=doII(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=doII(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=doII(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=doII(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=addUnsigned(a,AA);
    b=addUnsigned(b,BB);
    c=addUnsigned(c,CC);
    d=addUnsigned(d,DD);
  }

  var temp = wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);

  return temp.toLowerCase();
};


//计算SIP MD5值
PUtility.AuthMD5_Calc = function(pucName, pucRealm, pucPwd, pucMethod, pucAlg, pucNonce, pucUri){
    // HA1 = MD5(A1) = MD5(username:realm:password)
    var ha1 = PUtility.calculateMD5(pucName + ':' + pucRealm + ':' + pucPwd);
    // HA2 = MD5(A2) = MD5(method:digestURI)
    var ha2 = PUtility.calculateMD5(pucMethod + ':' + pucUri);
    // response = MD5(HA1:nonce:HA2)
    var pucRsp = PUtility.calculateMD5(ha1 + ':' + pucNonce + ':' + ha2);
    return pucRsp;
};

PUtility.PGetCurTime = function() {
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
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds() + seperator2 + date.getMilliseconds();
    return currentdate;
};


//PUtility.Log = console.log;//可以定位到行号
//行号有问题
PUtility.Log1 = function()
{
    if (null == m_IDT_INST)
        return;
    if (0 == m_IDT_INST.RUN_MODE)
        return;
    //Var f = fso.createtextfile("c:\a.txt", 8, true); 
    PUtility.m_OrigLog.apply(console, arguments);
};

PUtility.Log2 = function()
{
    try
    {
        if (null == m_IDT_INST)
            return;
        if (0 == m_IDT_INST.RUN_MODE)
            return;
        if (null == console)
            return;
        if (null == console.log)
            return;
        console.log.apply(console, arguments);
    }
    catch (e)
    {
    }
};


PUtility.IsValid = function(val)
{
    return true;
};

PUtility.RequestFullScreen = function(element) {
    // 判断各种浏览器，找到正确的方法
    var requestMethod = element.requestFullScreen || //W3C
    element.webkitRequestFullScreen ||    //Chrome等
    element.mozRequestFullScreen || //FireFox
    element.msRequestFullScreen; //IE11
    if (requestMethod) {
        requestMethod.call(element);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
};

//退出全屏 判断浏览器种类
PUtility.ExitFull = function() {
    // 判断各种浏览器，找到正确的方法
    var exitMethod = document.exitFullscreen || //W3C
    document.mozCancelFullScreen ||    //Chrome等
    document.webkitExitFullscreen || //FireFox
    document.webkitExitFullscreen; //IE11
    if (exitMethod) {
        exitMethod.call(document);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
};

PUtility.GetBrowserName = function()
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

PUtility.m_OrigLog = null;
if ("IE" != PUtility.GetBrowserName())
{
    PUtility.m_OrigLog = console.log;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      订阅状态机
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
        global.SubsFsm = factory();
    }
})(this, function() 
{
    function SubsFsm()
    {
        var self = this;
        self.uiMyId             = null;         //自己的ID号,数组下标,系统启动时赋值,之后不会变
        self.bInit              = false;        //初始化标志
        
        self.Num                = null;         //订阅号码
        self.Level              = null;         //级别

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
            PUtility.Log("SubsFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "ClearRun");

            self.Num    = null;
            self.Level  = null;
            self.bInit  = false;
            return 0;
        };
//--------------------------------------------------------------------------------
//      设置订阅参数
//  输入:
//      num:            号码
//      level:          级别
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Start = function(num, level)
        {
            PUtility.Log("SubsFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Start", num, level);
            self.Num    = num;
            self.Level  = level;
            self.bInit  = true;
            return 0;
        };
//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    }
    return SubsFsm;
});



"use strict";
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      事务状态机
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
        global.TransFsm = factory();
    }
})(this, function() 
{
    function TransFsm()
    {
        var self = this;
        self.uiMyId             = null;         //自己的ID号,数组下标,系统启动时赋值,之后不会变
        
        //初始化标志
        self.bInit              = false;
        //发起时间
        self.InvokeTime         = null;
        //定时器
		self.TIMER_LEN          = 10000;        //定时器,监视事务是否超时
        self.Timer              = null;

        //回调函数
        self.pfCallBack         = null;

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
            PUtility.Log("TransFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Init");
            
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
            PUtility.Log("TransFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "ClearRun");

            self.InvokeTime = null;
            self.pfCallBack = null;
            if (null != self.Timer)
            {
                clearTimeout(self.Timer);
                self.Timer = null;
            }
            self.bInit      = false;
            
            return 0;
        };
//--------------------------------------------------------------------------------
//      定时器到期
//--------------------------------------------------------------------------------
        self.TmExp = function()
        {
            PUtility.Log("TransFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "TmExp");
            if (null == self.bInit)
                return 0;

            self.Timer = null;
            if (null != self.pfCallBack)
            {
                self.pfCallBack(false, IDT.CAUSE_TIMER_EXPIRY, null);
            }
            self.ClearRun();
        };
//--------------------------------------------------------------------------------
//      启动
//  输入:
//      pfCallBack:     回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Start = function(pfCallBack)
        {
            PUtility.Log("TransFsm[", self.uiMyId, "]", PUtility.PGetCurTime(), "Start");
            self.bInit       = true;
            //self.InvokeTime  = curTime;
            self.pfCallBack  = pfCallBack;
            self.Timer = setTimeout(self.TmExp, self.TIMER_LEN);
            return 0;
        };

//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    }
    return TransFsm;
});




"use strict";
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      WS链路
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
        global.CWsLink = factory();
    }
})(this, function() 
{
    function CWsLink()
    {
        var self = this;
        self.ModuleName     = null;         //模块名字
        
        //初始化标志
        self.bInit = false;

        //配置参数
        self.strPeerUrl     = null;
        self.bNeedReg       = false;        //是否需要发起注册
        self.strUserId      = null;         //用户ID,可能是号码或者名字
        self.strUserPwd     = null;         //密码
        //回调函数指针
        self.onRecvMsg      = null;         //收到消息
        self.onStatus       = null;         //状态指示

        //运行参数
        self.m_bFirstStart  = true;         //是否第一次启动
        self.Status         = 0;            //0空闲,1连接发送,2注册发送,3运行
		self.Link           = null;         //WebSocket链路
        self.strUserNum     = null;         //用户号码
		self.CONNECT_TIMER_LEN = 5000;      //连接定时器,监视onOpen
		self.TimerConnect   = null;
		self.LOGIN_TIMER_LEN= 10000;        //登录超时定时器,监视注册消息
        self.TimerLogin     = null;
		self.HB_TIMER_LEN   = 5000;         //心跳定时器,监视链路
        self.TimerHB        = null;
		self.iHBCount       = 0;
		self.strAuthRsp     = null;         //鉴权计算结果,还需要给应用层,作为TOKEN

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
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Init");
            
            self.bInit          = false;

            self.strPeerUrl     = null;
            self.bNeedReg       = false;    //是否需要发起注册
            self.strUserId      = null;     //用户ID,可能是号码或者名字
            self.strUserPwd     = null;     //密码
            //回调函数指针
            self.onRecvMsg      = null;     //收到消息
            self.onSendMsg      = null;     //发送消息
            self.onStatus       = null;     //状态指示

            //运行参数
            self.m_bFirstStart  = true;     //是否第一次启动
            self.Status         = 0;        //0空闲,1连接发送,2注册发送,3运行
    		self.Link           = null;     //WebSocket链路
            self.strUserNum     = null;     //用户号码
    		self.CONNECT_TIMER_LEN = 5000;  //连接定时器,监视onOpen
    		self.TimerConnect   = null;
    		self.LOGIN_TIMER_LEN= 10000;    //登录超时定时器,监视注册消息
            self.TimerLogin     = null;
    		self.HB_TIMER_LEN   = 5000;     //心跳定时器,监视链路
            self.TimerHB        = null;
    		self.iHBCount       = 0;
    		self.strAuthRsp     = null;     //鉴权计算结果,还需要给应用层,作为TOKEN
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
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "ClearRun");

            //释放定时器
            if (null != self.TimerConnect)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Stop TimerConnect");
                clearTimeout(self.TimerConnect);
                self.TimerConnect = null;
            }
            if (null != self.TimerLogin)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Stop TimerLogin");
                clearTimeout(self.TimerLogin);
                self.TimerLogin = null;
            }
            if (null != self.TimerHB)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Stop TimerHB");
                clearTimeout(self.TimerHB);
                self.TimerHB = null;
            }

            //释放链路
            if (null != self.Link)
            {
                self.Link.close();
                self.Link = null;
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "LinkClose");
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      进入连接状态
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.ConnectReq = function()
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "ConnectReq");
            self.ClearRun();

            self.SetStatus(1, IDT.CAUSE_ZERO);
            
            //启动连接
            self.Link = new WebSocket(self.strPeerUrl);
            self.Link.binaryType = "blob";
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "LinkCreate");
            self.Link.onopen = function(evt) { 
                self.onWsOpen(evt) 
            }; 
            self.Link.onclose = function(evt) { 
                self.onWsClose(evt) 
            }; 
            self.Link.onmessage = function(evt) { 
                self.onWsMessage(evt) 
            }; 
            self.Link.onerror = function(evt) { 
                self.onWsError(evt) 
            };
            
            //启动定时器
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmConnect", self.CONNECT_TIMER_LEN);
            self.TimerConnect = setTimeout(self.TmConnect, self.CONNECT_TIMER_LEN);
            if (true == self.bNeedReg)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmLogin", self.LOGIN_TIMER_LEN);
                self.TimerLogin = setTimeout(self.TmLogin, self.LOGIN_TIMER_LEN);
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      内部使用的发送Json消息
//  输入:
//      data:           Json数据
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
		self.SendJsonInner = function(data)
        {
//————————————————————————————————————
//    属性值        属性常量        描述
//————————————————————————————————————
//    0        CONNECTING        连接尚未建立
//    1        OPEN            WebSocket的链接已经建立
//    2        CLOSING            连接正在关闭
//    3        CLOSED            连接已经关闭或不可用
//————————————————————————————————————        
            if (1 != self.Link.readyState)
            {
                return -1;
            }
                
            if (null == data.SrcFsm)
            {
                data.SrcFsm = 0xffffffff;
            }
            if (null == data.DstFsm)
            {
                data.DstFsm = 0xffffffff;
            }
            
			var strMsg = JSON.stringify(data);
            self.Link.send(strMsg);

            if (self.onSendMsg && m_IDT_INST.RUN_MODE_DEBUG == m_IDT_INST.RUN_MODE)
            {
                self.onSendMsg(self.ModuleName, data);
            }
            return 0;
		};
//--------------------------------------------------------------------------------
//      发送Json消息
//  输入:
//      data:           Json数据
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
		self.SendJson = function(data)
        {
            if (3 != self.Status)
                return -1;
            return self.SendJsonInner(data);
		};
//--------------------------------------------------------------------------------
//      设置状态
//  输入:
//      status:         状态值
//      usCause:        原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.SetStatus = function(status, usCause)
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Status=", status, IDT.GetCauseStr(usCause));
            var oldStatus = self.Status;
            self.Status = status;
            
            if (null != self.onStatus)
            {
                //第一次启动,无条件发送响应
                if (self.m_bFirstStart)
                {
                    if (3 == status)
                    {
                        self.onStatus(1, usCause);
                        self.m_bFirstStart = false;
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onStatus", 1);
                    }
                    else if (0 == status)
                    {
                        self.onStatus(0, usCause);
                        self.m_bFirstStart = false;
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onStatus", 0);
                    }
                }
                else
                {
                    if (3 != oldStatus && 3 == status)
                    {
                        self.onStatus(1, usCause);
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onStatus", 1);
                    }
                    else if (3 == oldStatus && 0 == status)
                    {
                        self.onStatus(0, usCause);
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onStatus", 0);
                    }
                }
            }
            return 0;
        };

//--------------------------------------------------------------------------------
//      收到打开指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsOpen = function(event)
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onWsOpen");
        
            if (null == self.bInit)
                return 0;

            //停止连接定时器
            if (null != self.TimerConnect)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Stop TimerConnect");
                clearTimeout(self.TimerConnect);
                self.TimerConnect = null;
            }
            
            //进入连接态
            self.SetStatus(2, IDT.CAUSE_ZERO);
            //如果需要注册
            if (true == self.bNeedReg)
            {
                //启动注册流程
                self.SendJsonInner({
					MsgCode : IDT.MSG_MM_REGREQ,
					MsgBody :
					{
						UsrNum      : self.strUserNum,  //用户号码
						RegType     : 1,                //开机注册
						AuthAlg     : "MD5",
						AuthRealm   : "",
						AuthNonce   : "",
						AuthRsp     : "",
    			        ConCurrent  : 0                 //第二链路,以后要去掉
				    }
                });
                
                //启动登录定时器.如果是Start调用引起的注册,在Start时,就启动了登录定时器
                if (null == self.TimerLogin)
                {
                    PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmLogin", self.LOGIN_TIMER_LEN);
                    self.TimerLogin = setTimeout(self.TmLogin, self.LOGIN_TIMER_LEN);
                }
            }
            else
            {
                if (null != self.onStatus)
                {
                    self.SetStatus(3, IDT.CAUSE_ZERO);
                }
            }
            //启动心跳
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmHB", self.HB_TIMER_LEN);
            self.TimerHB = setTimeout(self.TmHB, self.HB_TIMER_LEN);
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到关闭指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsClose = function(event)
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onWsClose");
        
            if (null == self.bInit)
                return 0;

            return 0;
            
            //依赖定时器
            /*
            self.ClearRun();
            //进入空闲态
            self.SetStatus(0);

            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmConnect", self.CONNECT_TIMER_LEN);
            self.TimerConnect = setTimeout(self.TmConnect, self.CONNECT_TIMER_LEN);
            return 0;*/
        };
//--------------------------------------------------------------------------------
//      收到数据指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsMessage = function(event)
        {
            if (null == self.bInit)
                return 0;

            var msg = {};
			//try
            //{
                self.iHBCount = 0;

                //1.\r\n  ->  <br/>       SDP
                var newstr1 = event.data.replace(new RegExp("\r\n", "g"), "<br/>");
                //2.\n->空
                var newstr2 = newstr1.replace(new RegExp("\n", "g"), ""); 
                //3.\     ->  \\          文件路径
                var newstr3 = newstr2.replace(new RegExp("\\\\", "g"), "\\\\"); 
                //3.4.5,为会议链接转换
                //"{"MsgCode":"MM_PASSTHROUGH", "SrcFsm":-1, "DstFsm":48, "MsgBody":{"MyNum":"2010","PeerNum":"2014","TransMsgID":27,"ImInfo":{"Code":1,"Type":17,"UtSn":300,"Sn":"2018-03-13 16:40:45-5@300@76","Time":"2018-03-13 16:40:44","From":"2010","To":"#20018888810","OriTo":"20018888810","Txt":"{"fromDesc":"2010","fromNumber":"2010","subPara":"{\"accept\":false,\"content\":\"会议开始通知, 点击加入\",\"desc\":\"调度员发起组会议:\",\"meetId\":\"20018888810\",\"number\":\"20018888810\",\"time\":\"1970-01-01 08:00:00\",\"title\":\"\",\"type\":2}","toDesc":"","toNumber":"20018888810","type":0}","FileName":"","SourceFileName":""}}}"
                //4.\\"   ->  "
                var newstr4 = newstr3.replace(new RegExp('\\\\\\\\"', "g"), '"');
                //5.":"{" ->  ":{"
                var newstr5 = newstr4.replace(new RegExp('":"{"', "g"), '":{"');
                //6.}","  ->  },"
                var newstr6 = newstr5.replace(new RegExp('}","', "g"), '},"');
				try
				{
				    msg = JSON.parse(newstr6);
                }
                catch (e)
                {
                    PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "ErrorMsg:", event.data);
                    PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "ErrorMsg(newStr6):", newstr6);
                    return -1;
                }
                
                if (null != self.onRecvMsg)
                {
                    self.onRecvMsg(msg);
                }
                
                switch (msg.MsgCode)
                {
				case IDT.MSG_MM_REGRSP://注册响应
                    PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), IDT.MSG_MM_REGRSP, IDT.GetCauseStr(msg.MsgBody.Result));
				
					switch (msg.MsgBody.Result)
                    {
					case 25://需要鉴权
					    self.strAuthRsp = PUtility.AuthMD5_Calc(msg.MsgBody.UsrNum, msg.MsgBody.AuthRealm, self.strUserPwd,
                            "REGISTER", msg.MsgBody.AuthAlg, msg.MsgBody.AuthNonce, "0.0.0.0");
						self.SendJsonInner({
							MsgCode : IDT.MSG_MM_REGREQ,
							MsgBody : {
								UsrNum      : msg.MsgBody.UsrNum,
								RegType     : msg.MsgBody.RegType,
								AuthAlg     : msg.MsgBody.AuthAlg,
								AuthRealm   : msg.MsgBody.AuthRealm,
								AuthNonce   : msg.MsgBody.AuthNonce,
								AuthRsp     : self.strAuthRsp,
        						ConCurrent  : 0         //第二链路,以后要去掉
							}
						});
						break;
                        
					case 0://注册成功
					    self.SetStatus(3, msg.MsgBody.Result);
                        PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Stop TimerLogin");
                        clearTimeout(self.TimerLogin);
                        self.TimerLogin = null;
                        msg.MsgBody.AuthRsp = self.strAuthRsp;
						break;

					default:
					    self.SetStatus(0, msg.MsgBody.Result);
                        self.ClearRun();
						break;
					}
					break;
                    
				default:
					break;
				}
            //}
            //catch (e)
            //{
            //    PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "ErrorMsg:", event);
			//}
            return 0;
        };
//--------------------------------------------------------------------------------
//      收到错误指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.onWsError = function(evt)
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "onWsError");

            if (null == self.bInit)
                return 0;

            return 0;
        
            //出错处理
            //if (null != self.onUserError)
            //{
            //    self.onUserError(evt);
            //}
        };

//--------------------------------------------------------------------------------
//      Connect定时器到期
//--------------------------------------------------------------------------------
        self.TmConnect = function()
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "TmConnectExpire");
        
            if (null == self.bInit)
                return 0;
            
            //到初始状态,重新连接
            self.TimerConnect = null;
            //进入空闲态
            self.SetStatus(0, IDT.CAUSE_ZERO);

            //重新连接
            self.ConnectReq();
        };
//--------------------------------------------------------------------------------
//      Login定时器到期
//--------------------------------------------------------------------------------
        self.TmLogin = function()
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "TmLoginExpire");
            if (null == self.bInit)
                return 0;

            //到初始状态,重新连接
            self.TimerConnect = null;
            //进入空闲态
            self.SetStatus(0, IDT.CAUSE_TIMER_EXPIRY);

            //重新连接
            self.ConnectReq();
        };
//--------------------------------------------------------------------------------
//      HB定时器到期
//--------------------------------------------------------------------------------
        self.TmHB = function()
        {
            if (null == self.bInit)
                return 0;

            //PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "TmHBExpire");
            self.iHBCount++;

            if (self.iHBCount >= 3)
            {
                PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "TmHB_Disc");
            
                //到初始状态,重新连接
                self.TimerConnect = null;
                //进入空闲态
                self.SetStatus(0, IDT.CAUSE_TIMER_EXPIRY);
                //重新连接
                self.ConnectReq();
            }
            else
            {
                self.SendJsonInner({MsgCode : IDT.MSG_HB});//发送心跳包消息
                //启动心跳
                //PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start TmHB", self.HB_TIMER_LEN);
                self.TimerHB = setTimeout(self.TmHB, self.HB_TIMER_LEN);
            }
        };

//--------------------------------------------------------------------------------
//      启动
//  输入:
//      ModuleName:     模块名字
//      strPeerUrl:     对端URL
//      bNeedReg:       是否需要注册
//      strUserId:      用户ID,可以是号码,或者名字(UTF-8)
//      strUserPwd:     密码
//      onStatus:       状态回调
//      onRecvMsg:      消息到达回调
//      onSendMsg:      消息发送回调
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Start = function(ModuleName, strPeerUrl, bNeedReg, strUserId, strUserPwd, onStatus, onRecvMsg, onSendMsg)
        {
            self.ModuleName = ModuleName;
            
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Start");
            // 1.判断是否初始化过
            if (true == self.bInit)
            {
                // 2.如果初始化过,而且地址/用户ID和密码都相同,而且在线,返回成功
                if (self.strPeerUrl == strPeerUrl && self.strUserId == strUserId && self.strUserPwd == strUserPwd)
                {
                    return 0;
                }

                // 3.如果初始化过,释放资源
                self.Exit();
            }

            // 初始化数据
            self.Init();
            
            // 记录参数
            self.strPeerUrl     = strPeerUrl;
            self.bNeedReg       = bNeedReg;
            self.strUserId      = strUserId;
            self.strUserPwd     = strUserPwd;
            self.onStatus       = onStatus;
            self.onRecvMsg      = onRecvMsg;
            self.onSendMsg      = onSendMsg;
            self.strUserNum     = strUserId;

            // 启动连接
            self.ConnectReq();

            self.bInit      = true;
            return 0;
        };
//--------------------------------------------------------------------------------
//      退出
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Exit = function()
        {
            PUtility.Log(self.ModuleName, PUtility.PGetCurTime(), "Exit");
        
            self.ClearRun();

            self.bInit          = null;

            //配置参数
            self.strPeerUrl     = null;
            self.bNeedReg       = null;     //是否需要发起注册
            self.strUserId      = null;     //用户ID,可能是号码或者名字
            self.strUserPwd     = null;     //密码
            //回调函数指针
            self.onRecvMsg      = null;     //收到消息
            self.onSendMsg      = null;     //发送消息
            self.onStatus       = null;     //状态指示

            //运行参数
            self.m_bFirstStart  = null;     //是否第一次启动
            self.Status         = null;     //0空闲,1连接发送,2注册发送,3运行
    		self.Link           = null;     //WebSocket链路
            self.strUserNum     = null;     //用户号码
    		self.CONNECT_TIMER_LEN = null;  //连接定时器,监视onOpen
    		self.TimerConnect   = null;
    		self.LOGIN_TIMER_LEN= null;     //登录超时定时器,监视注册消息
            self.TimerLogin     = null;
    		self.HB_TIMER_LEN   = null;     //心跳定时器,监视链路
            self.TimerHB        = null;
    		self.iHBCount       = null;
    		self.strAuthRsp     = null;     //鉴权计算结果,还需要给应用层,作为TOKEN
            
            return 0;
        };
    }
//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    return CWsLink;
});


