"use strict";

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      麦克风检测
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var m_MicDetectAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
        global.MicDetect = factory();
    }
})(this, function() 
{
    function MicDetect()
    {
        var self = this;

        //常量定义
        self.OPEN_DB            = -15.0;
        self.CLOSE_DB           = -15.0;
        self.TM_IDLE_LEN        = 2000;         // 2秒,持续2秒无音
        
        //初始化标志
        self.bInit              = false;

        self.State              = 0;            //0:空闲,1:激活
        self.LocalStream        = null;
        self.TimerIdle          = null;         //转空闲定时器
        self.CallBack           = null;         //回调函数

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
            console.log("MicDetect:", PUtility.PGetCurTime(), "Init");
            
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
            console.log("MicDetect:", PUtility.PGetCurTime(), "ClearRun");

            //释放定时器
            if (null != self.TimerIdle)
            {
                console.log("MicDetect:", PUtility.PGetCurTime(), "Stop TimerState");
                clearTimeout(self.TimerIdle);
                self.TimerIdle = null;
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
            self.bInit      = false;
            self.State      = 0;
            return 0;
        };

//--------------------------------------------------------------------------------
//      运行
//  输入:
//      Threshold:      门限值
//      IdleTime:       激活后,门限值以下持续多长时间,认为空闲,2000=2秒
//      fnCallBack:     回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
        self.Run = function(Threshold, IdleTime, fnCallBack)
        {
            console.log("MicDetect:", PUtility.PGetCurTime(), "Run");
         
            self.OPEN_DB            = Threshold;
            self.CLOSE_DB           = Threshold;
            self.TM_IDLE_LEN        = IdleTime;
            self.CallBack           = fnCallBack;

            //如果已经运行了,直接返回
            if (false != self.bInit)
            {
                return 0;
            }
            self.ClearRun();
            self.bInit = true;
            
            //打开
            navigator.mediaDevices.getUserMedia({audio: true, video: false})
                .then(self.GotStream);

            return 0;
        };
//--------------------------------------------------------------------------------
//      获取分贝数
//  输入:
//      inputBuffer:    音源缓冲区
//  返回:
//      分贝数
//--------------------------------------------------------------------------------
        self.GetDB = function(inputBuffer)
        {
            var i;
            var iLength = inputBuffer.length;
            var v = 0.0;
            for (i = 0; i < iLength; i++)
            {
                v += Math.abs(inputBuffer[i]);
            }
            v /= iLength;
            var db = 10 * Math.log10(v);
            
            //console.log("MicDetect:", db);
            return db;
        }

        self.GotStream = function(stream)
        {
            self.LocalStream = stream;
            
            var StreamSource = m_MicDetectAudioCtx.createMediaStreamSource(stream);
            var StreamRecorder = m_MicDetectAudioCtx.createScriptProcessor(1024, 1, 1);
            StreamSource.connect(StreamRecorder);
            StreamRecorder.connect(m_MicDetectAudioCtx.destination);
            
            StreamRecorder.onaudioprocess = function(ev)
            {
                var inputBuffer = ev.inputBuffer.getChannelData(0);
                
                //1.获取分贝数
                var db = self.GetDB(inputBuffer);
                
                if (0 == self.State)//空闲
                {
                    if (db >= self.OPEN_DB)//检测到声音
                    {
                        if (null != self.TimerIdle)
                        {
                            clearTimeout(self.TimerIdle);
                            self.TimerIdle = null;
                        }
                        self.TimerIdle = setTimeout(self.TmIdle, self.TM_IDLE_LEN);
                        self.State = 1;
                        
                        //通知用户
                        if (null != self.CallBack)
                        {
                            self.CallBack(1);
                        }
                    }
                }
                else
                {
                    if (db >= self.CLOSE_DB)//在检测分贝值以上
                    {
                        if (null != self.TimerIdle)
                        {
                            clearTimeout(self.TimerIdle);
                            self.TimerIdle = null;
                        }
                        self.TimerIdle = setTimeout(self.TmIdle, self.TM_IDLE_LEN);
                    }
                }
            };
        };

//--------------------------------------------------------------------------------
//      空闲定时器到期
//  输入:
//      无
//  返回:
//      无
//--------------------------------------------------------------------------------
        self.TmIdle = function()
        {
            console.log("MicDetect:", PUtility.PGetCurTime(), "TmIdle");
            clearTimeout(self.TimerIdle);
            self.TimerIdle = null;
            self.State = 0;
            //通知用户
            if (null != self.CallBack)
            {
                self.CallBack(0);
            }
        };
//--------------------------------------------------------------------------------
//      停止
//  输入:
//      无
//  返回:
//      无
//--------------------------------------------------------------------------------
        self.Stop = function()
        {
            console.log("MicDetect:", PUtility.PGetCurTime(), "Stop");
            self.ClearRun();
        };
//--------------------------------------------------------------------------------
//      返回类对象
//--------------------------------------------------------------------------------
    }
    return MicDetect;
});
