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



