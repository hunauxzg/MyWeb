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

