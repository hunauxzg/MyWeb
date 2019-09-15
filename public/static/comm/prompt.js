$('head').append('<link rel="stylesheet" href="/static/css/prompt.css">\n');
var prompt = (function () {
    function promptSuccess(describe) {
        $('body').append('<div class="prompt success">\n' + '    <span class="icon">&#xe60f</span>\n' + '    <div class="strong">' + lang.system.Succeed + '！</div>\n' + '    ' + describe + '\n' + '</div>');
    }
    function promptWarn(describe) {
        $('body').append('<div class="prompt warn">\n' + '    <span class="icon">&#xe60e</span>\n' + '    <div class="strong">' + lang.prompt.warning + '！ </div>\n' + '    ' + describe + '\n' + '</div>');
    }
    function promptError(describe) {
        $('body').append('<div class="prompt error">\n' + '    <span class="icon">&#xe610</span>\n' + '    <div class="strong">' + lang.system.Failure + '！ </div>\n' + '    ' + describe + '\n' + '</div>');
    }
    function promptSwitch(type, describe) {
        switch (type) {
            case 'success':
                promptSuccess(describe);
                break;
            case 'warn':
                promptWarn(describe);
                break;
            default:
                promptError(describe);
        }
    }
    return (function Prompt(type, describe, time) {
        promptSwitch(type, describe);
        $('.prompt').fadeIn(time,
        function () {
            $('.prompt').fadeOut(time,
            function () {
                $('.prompt').remove();
            })
        })
    })
})();

function cuttingWarn() {
    var content = '<div id="cutting-warn" >\n' + '    <span class="icon">&#xe943</span> <span>' + lang.prompt.networkLine + '</span>\n' + '</div>';
    $('body').append(content);
}

function removeCutWarn() {
    $('#cutting-warn').remove();
}

//通用地图聚合点击信息弹窗。
function fn_commonOpenConvInfoW(mapObj, pointXY, overLayArr) {
    // 创建通用地图聚合点击信息弹窗面板。
    mapObj.closeInfoWindow();
    var dw = 250,
    dh = 204,
    uw = 250,
    uh = 204,
    ww = 280,
    wh = 210; //div宽高，ul宽高，信息窗宽高。
    var overLen = overLayArr.length;
    if (overLen <= 4) {
        dw = Math.ceil(dw * 2 / 3);
        uw = 170;
        ww = Math.ceil(ww * 2 / 3);
        dh = Math.ceil(dh * Math.ceil(overLen / 2) / 3);
        uh = Math.ceil(uh * Math.ceil(overLen / 2) / 3);
        wh = Math.ceil(wh * Math.ceil(overLen / 2) / 3);
    } else if (overLen > 4 && overLen <= 6) {
        dh = Math.ceil(dh * 2 / 3);
        uh = Math.ceil(uh * 2 / 3);
        wh = Math.ceil(wh * 2 / 3);
    }
    var htmlStr = '<div class="convClkShowDiv" style="display:none;width:' + dw + 'px;height:' + dh + 'px;">' + '<ul class="clearfix" style="width:' + uw + 'px;height:' + uh + 'px;">';
    for (var i = 0; i < overLayArr.length; i++) {
        htmlStr += overLayArr[i].getConvHtml();
    }
    htmlStr += '</ul></div>';
    if ($('.convClkShowDiv').length > 0) $('.convClkShowDiv').remove();
    $(document.body).append(htmlStr);
    var infoWinDom = $('.convClkShowDiv');
    $('.convClkShowDiv').css('display', 'block');
    var $liTages = $('.convClkShowDiv>ul>li');
    if ($liTages.length <= 9) {
        $liTages.css("margin", "3px");
        $('.convClkShowDiv>ul').css('overflow', 'hidden');
    } else {
        $('.convClkShowDiv>ul').css('overflow', 'auto');
    }
    if (overLayArr[0].event) {
        for (var e in overLayArr[0].event) {
            $liTages.bind(e.substring(2), overLayArr[0].event[e]);
        }
    }
    var infoWindow = new BMap.InfoWindow(infoWinDom[0], {
        width: ww,
        height: wh
    });
    mapObj.openInfoWindow(infoWindow, pointXY);
}

//通用的小组人员选择弹窗。
function fn_commonUserAndGroupChoose(options) {
    var _this = this;
    this.config = {
        title: lang.dispatch.ModifyMmeber,
        gnum: '',
        gname: '',
        dataLoadFn: function () {
            $('.commonMemberChoose #selMemberTable').datagrid('load', {
                "gnum": _this.config.gnum
            });
        },
        okFn: function (chooseData) { }
    };
    $.extend(_this.config, options);
    // 创建人员选择对话框面板。
    var htmlStr = '<div class="commonMemberChoose">' + '    <div class="float-left">' + '	    <div class="dicTitle">' + lang.common.allUsers + '</div>' + '	    <div class="search">' + '	        <input type="text" placeholder="' + lang.dispatch.memberOrName + '" id="searchAllMember"/><div class="icon">&#xe60d;</div>' + '	    </div>' + '	    <div>' + '	        <div class="treeWrap"><ul id="treeAllMember"></ul></div>' + '	        <div class="btn icon" id="addSelMember">&#xe6a9; ' + lang.dispatch.addObject + '</div>' + '	    </div>' + '	</div>' + '	<div class="float-right">' + '	    <div class="dicTitle">' + lang.dispatch.beSelectd + ' <span style="color:#f5f5f5">' + _this.config.gname + '</span></div>' + '	    <div class="search">' + '	        <input type="text" placeholder="' + lang.system.PleaseNameOrNumber + '" id="searchSelMember"/><div class="icon">&#xe60d;</div>' + '	    </div>' + '	    <div class="rightTable"><table id="selMemberTable"></table></div>' + '	    <div class="btn icon" id="delSelMember">&#xe606; ' + lang.dispatch.cleanObject + '</div>' + '	</div>' + '	<div class="footer">' + '	    <img src="/static/img/true.png"  id="MemberChooseOK"  alt=""/>' + '	    <img src="/static/img/false.png" id="MemberChooseQX"  alt=""/>' + '	</div>' + '</div>';
    if ($('.commonMemberChoose').length == 0) $(document.body).append(htmlStr);
    this.treeClkArr = [];
    this.treeNodeWidth = function (node) {
        var treeWrapScrollWidth = node.scrollWidth;
        $(node).find('.tree-node').css('width', treeWrapScrollWidth);
    };
    this.ctrlClick = function () {
        $(document).keydown(function (e) {
            if (e.keyCode === 17) {
                $('.commonMemberChoose .treeWrap .tree-node').off('click').on('click',
                function (e) {
                    if ($(e.target).hasClass('addMember')) { //添加成员。
                        _this.insertOneMemberFn(e.target);
                        e.stopPropagation(); //阻止事件向上冒泡。
                    } else {
                        var _this = $(this);
                        if ($(this).hasClass('active')) {
                            _this.removeClass('active');
                            return;
                        }
                        $(this).addClass('active');
                        _this.treeClkArr.push($(".commonMemberChoose .treeWrap .tree-node").index($(this)));
                    }
                });
            } else if (e.shiftKey) {
                $('.commonMemberChoose .treeWrap .tree-node').off('click').on('click',
                function (e) {
                    if ($(e.target).hasClass('addMember')) { //添加成员。
                        _this.insertOneMemberFn(e.target);
                        e.stopPropagation(); //阻止事件向上冒泡。
                    } else {
                        $(this).addClass('active');
                        _this.treeClkArr.push($(".commonMemberChoose .treeWrap .tree-node").index($(this)));
                        var iMin = Math.min(_this.treeClkArr[_this.treeClkArr.length - 2], _this.treeClkArr[_this.treeClkArr.length - 1]);
                        var iMax = Math.max(_this.treeClkArr[_this.treeClkArr.length - 2], _this.treeClkArr[_this.treeClkArr.length - 1]);
                        for (var i = iMin; i <= iMax; i++) {
                            $(".commonMemberChoose .treeWrap .tree-node:eq(" + i + ")").addClass("active");
                        }
                    }
                });
            }
        }).keyup(function () {
            $('.commonMemberChoose .treeWrap .tree-node').off('click').on('click',
            function (e) {
                if ($(e.target).hasClass('addMember')) { //添加成员。
                    _this.insertOneMemberFn(e.target);
                    e.stopPropagation(); //阻止事件向上冒泡。
                } else {
                    $('.commonMemberChoose .treeWrap .tree-node').removeClass('active');
                    $(this).addClass('active');
                    _this.treeClkArr = [];
                    _this.treeClkArr.push($(".commonMemberChoose .treeWrap .tree-node").index($(this)));
                }
            });
        });
    };
    this.convertAllMember = function (rows) {
        function exists(rows, pid) {
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].id == pid) {
                    return true;
                }
            }
            return false;
        }
        var nodes = [];
        // get the root nodes  
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (!exists(rows, row.pid)) {
                nodes.push({
                    id: row.id,
                    text: row.name,
                    attributes: {
                        nodeId: row.id,
                        nodeName: row.name,
                        nodeType: row.type
                    }
                });
            }
        }
        var toDo = [];
        for (var i = 0; i < nodes.length; i++) {
            toDo.push(nodes[i]);
        }
        while (toDo.length) {
            // the parent node
            var node = toDo.shift();
            // get the children nodes
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.pid == node.id) {
                    var status = row.STATUS;
                    var textVal = '';
                    if (status == '1') {
                        textVal = "<font color = 'blue'>" + "【" + row.id + "】" + row.name + " (" + lang.prompt.onLines + ")" + "</font>";
                    } else {
                        textVal = "【" + row.id + "】" + row.name;
                    }
                    if (row.id == '-1') {
                        textVal = row.name;
                    }
                    var child = {
                        id: row.id,
                        text: textVal,
                        attributes: {
                            nodeId: row.id,
                            nodeName: row.name,
                            nodeType: row.type
                        }
                    };
                    if (node.children) {
                        node.children.push(child);
                    } else {
                        node.children = [child];
                    }
                    toDo.push(child);
                }
            }
        }
        return nodes;
    };
    //插入单个小组成员。
    this.insertOneMemberFn = function (Obj) {
        var gnum = _this.config.gnum;
        var curNode = $('.commonMemberChoose #treeAllMember').tree('getNode', $(Obj).parent());
        if (curNode.attributes.nodeId == '-1' || curNode.attributes.nodeId == window.top.userInfo.orgInfoMap.NUM) return;
        if (_this.isParentNodeComm(curNode, gnum) == true) {
            prompt('warn', lang.system.ParentsOrOrganizations, 1000);
            return;
        }
        var curRows = $('.commonMemberChoose #selMemberTable').datagrid('getRows');
        var curCount = 0;
        var row = {
            GNUM: gnum,
            TYPE: Number(curNode.attributes.nodeType),
            NUM: curNode.attributes.nodeId,
            NAME: curNode.attributes.nodeName
        };
        for (var i = 0; i < curRows.length; i++) {
            if (curNode.attributes.nodeId == curRows[i].NUM) {
                curCount++;
                break;
            }
        }
        if (curCount == 0) {
            $('.commonMemberChoose #selMemberTable').datagrid('appendRow', row);
        }
    };
    this.treeInit = function () {
        $('.commonMemberChoose #treeAllMember').tree({
            url: "webservice/api/v1/comm/userBasic/queryAllMember",
            method: 'post',
            animate: true,
            dnd: false,
            cascadeCheck: true,
            onDrop: function (targetNode, source, point) { },
            onLoadSuccess: function (node, data) {
                debugger;
                $(this).tree('collapseAll');
                var roots = $(this).tree('getRoots');
                if (roots && roots.length && roots.length > 0) {
                    for (var i = 0; i < roots.length; i++) {
                        $(this).tree('expand', roots[i].target);
                    }
                }
                _this.treeNodeWidth(document.querySelector('.commonMemberChoose .treeWrap'));
                $('.commonMemberChoose .treeWrap .tree-node').off('click').on('click',
                function (e) {
                    if ($(e.target).hasClass('addMember')) { //添加成员。
                        _this.insertOneMemberFn(e.target);
                        e.stopPropagation(); //阻止事件向上冒泡。
                    } else { //选择成员。
                        $('.commonMemberChoose .treeWrap .tree-node').removeClass('active');
                        $(this).addClass('active');
                        _this.treeClkArr = [];
                        _this.treeClkArr.push($(".commonMemberChoose .treeWrap .tree-node").index($(this)));
                    }
                });
                $('.commonMemberChoose .treeWrap .tree-node .icon').remove();
                $('.commonMemberChoose .treeWrap .tree-node').append('<div class="icon addMember">&#xe6a9</div>');
                $.each($('.commonMemberChoose .treeWrap .tree-node'),
                function () {
                    var curNode = $('#treeAllMember').tree('getNode', $(this));
                    var nodeType = curNode.attributes.nodeType;
                    if (nodeType == '0') {
                        $(this).find(".tree-icon").html("&#xe648") //单位
                    } else if (nodeType == '1') {
                        $(this).find(".tree-file").html("&#xe625") //个人
                    } else {
                        $(this).find(".tree-icon").html("&#xe619") //小组
                    }
                });
                _this.ctrlClick();
            },
            loadFilter: function (rows) {
                return _this.convertAllMember(rows);
            },
            onExpand: function (node) {
                _this.treeNodeWidth(document.querySelector('.commonMemberChoose .treeWrap'));
            }
        });
    };
    //判断当前结点是不是当前小组的父结点。如果为当前小组的父结点，则不允许将其设为当前小组的成员。
    this.isParentNodeComm = function (curNode, gnum) {
        if (!curNode || !gnum || gnum == '') return false;
        var flag = false;
        var curId = curNode.attributes.nodeId;
        var pNode = $('.commonMemberChoose #treeAllMember').tree('find', gnum);
        while (pNode && pNode.attributes.nodeId && pNode.attributes.nodeId != '') {
            if (pNode.attributes.nodeId == curId) {
                flag = true;
                break;
            } else {
                pNode = $('.commonMemberChoose #treeAllMember').tree('getParent', pNode.target);
            }
        }
        return flag;
    };
    this.tableInit = function () {
        $('.commonMemberChoose #selMemberTable').datagrid({
            url: 'userBasic/queryGroupMember',
            columns: [[{
                field: 'TYPE',
                title: lang.common.type,
                width: 80,
                align: 'center',
                formatter: dgColCvt('grp_member_Type', true)
            },
            {
                field: 'NAME',
                title: lang.common.num,
                width: 200,
                align: 'center',
                formatter: function (value, row, index) {
                    return row.NUM + "(" + row.NAME + ")";
                }
            },
            {
                field: 'edit',
                title: lang.common.Moveout,
                width: 80,
                align: 'center',
                formatter: function (value, row, index) {
                    return ('<span class="icon import removeMember" dataid="' + row.NUM + '">&#xe606</span>');
                }
            }]],
            fitColumns: true,
            scrollbarSize: 10,
            pageNumber: 10,
            singleSelect: true,
            idField: 'NUM',
            striped: true,
            fit: true,
            nowrap: true,
            border: true,
            checkOnSelect: true,
            selectOnCheck: true,
            loadFilter: function (data) {
                if (!data || !data.length) return [];
                data = {
                    total: data.length,
                    rows: data
                };
                return data;
            },
        });
    };
    // 树形菜单小组查询 回车键盘事件
    $(".commonMemberChoose #searchAllMember").off('keydown').on('keydown',
    function (evt) {
        evt = (evt) ? evt : ((window.event) ? window.event : '');
        var keyCode = evt.keyCode ? evt.keyCode : (evt.which ? evt.which : evt.charCode);
        if (keyCode == 13) {
            var searchAllMemberVal = $(".commonMemberChoose #searchAllMember").val();
            if (searchAllMemberVal && searchAllMemberVal != '') {
                easyui_Tree_Search(".commonMemberChoose #treeAllMember", searchAllMemberVal);
            }
        }
    });
    // 已选成员查询， 回车键盘事件
    $(".commonMemberChoose #searchSelMember").off('keydown').on('keydown',
    function (evt) {
        evt = (evt) ? evt : ((window.event) ? window.event : "");
        keyCode = evt.keyCode ? evt.keyCode : (evt.which ? evt.which : evt.charCode);
        if (keyCode == 13) {
            var conVal = $(".commonMemberChoose #searchSelMember").val();
            var curRows = $('.commonMemberChoose #selMemberTable').datagrid('getRows');
            var selRow = $('.commonMemberChoose #selMemberTable').datagrid('getSelected');
            $('.commonMemberChoose #selMemberTable').datagrid('clearSelections');
            if (selRow) {
                var rowIndex = $('.commonMemberChoose #selMemberTable').datagrid('getRowIndex', selRow);
                var isFind = false;
                for (var i = rowIndex + 1; i < curRows.length; i++) {
                    if (curRows[i].NUM.indexOf(conVal) >= 0 || curRows[i].NAME.indexOf(conVal) >= 0) {
                        $('.commonMemberChoose #selMemberTable').datagrid('selectRow', i);
                        isFind = true;
                        break;
                    }
                }
                if (isFind == false) {
                    for (var i = 0; i <= rowIndex; i++) {
                        if (curRows[i].NUM.indexOf(conVal) >= 0 || curRows[i].NAME.indexOf(conVal) >= 0) {
                            $('.commonMemberChoose #selMemberTable').datagrid('selectRow', i);
                            break;
                        }
                    }
                }
            } else {
                for (var i = 0; i < curRows.length; i++) {
                    if (curRows[i].NUM.indexOf(conVal) >= 0 || curRows[i].NAME.indexOf(conVal) >= 0) {
                        $('.commonMemberChoose #selMemberTable').datagrid('selectRow', i);
                        break;
                    }
                }
            }
        }
    });
    //添加成员按钮点击事件。
    $('.commonMemberChoose #addSelMember').off('click').on('click',
    function (event) {
        var gnum = _this.config.gnum;
        var treeNodeCollect = $('.commonMemberChoose .treeWrap .tree-node');
        if (treeNodeCollect && treeNodeCollect.length) {
            for (var i = 0; i < treeNodeCollect.length; i++) {
                if (treeNodeCollect.eq(i).hasClass('active')) {
                    var curNode = $('.commonMemberChoose #treeAllMember').tree('getNode', treeNodeCollect[i]);
                    if (curNode.attributes.nodeId == '-1' || curNode.attributes.nodeId == window.top.userInfo.orgInfoMap.NUM) continue;
                    if (_this.isParentNodeComm(curNode, gnum) == true) continue;
                    var curRows = $('.commonMemberChoose #selMemberTable').datagrid('getRows');
                    var curCount = 0;
                    var row = {
                        GNUM: gnum,
                        TYPE: Number(curNode.attributes.nodeType),
                        NUM: curNode.attributes.nodeId,
                        NAME: curNode.attributes.nodeName
                    };
                    for (var j = 0; j < curRows.length; j++) {
                        if (curNode.attributes.nodeId == curRows[j].NUM) {
                            curCount++;
                            break;
                        }
                    }
                    if (curCount == 0) {
                        $('.commonMemberChoose #selMemberTable').datagrid('appendRow', row);
                    }
                }
            }
        }
    });
    //表格已选成员清空。
    $('.commonMemberChoose #delSelMember').off('click').on('click',
    function (event) {
        var curRows = $('.commonMemberChoose #selMemberTable').datagrid('getRows');
        for (var i = curRows.length - 1; i >= 0; i--) {
            var index = $('.commonMemberChoose #selMemberTable').datagrid('getRowIndex', curRows[i]);
            $('.commonMemberChoose #selMemberTable').datagrid('deleteRow', index);
        }
    });
    //表格移出按钮点击事件。
    $('.commonMemberChoose .rightTable').off('click').on('click',
    function (e) {
        if ($(e.target).hasClass('removeMember') == false) return;
        var num = $(e.target).attr('dataid');
        if (!num || num == '') return;
        var index = $('.commonMemberChoose #selMemberTable').datagrid('getRowIndex', num);
        if (index >= 0) {
            $('.commonMemberChoose #selMemberTable').datagrid('deleteRow', index);
        }
    });
    //关闭按钮点击事件。
    $('.commonMemberChoose #MemberChooseQX').off('click').on('click',
    function (event) {
        $('.commonMemberChoose').dialog('close');
    });
    //确定按钮点击事件。
    $('.commonMemberChoose #MemberChooseOK').off('click').on('click',
    function (event) {
        $('.commonMemberChoose').dialog('close');
        var chooseData = $('.commonMemberChoose #selMemberTable').datagrid('getRows');
        _this.config.okFn(chooseData);
    });
    //页面元素初始化，事件绑定，以及展示弹窗。
    _this.treeInit();
    _this.tableInit();
    $(".commonMemberChoose #searchAllMember").val('');
    $(".commonMemberChoose #searchSelMember").val('');
    _this.config.dataLoadFn();
    $('.commonMemberChoose').dialog({
        title: _this.config.title,
        width: 747,
        height: 583,
        closed: false,
        cache: false,
        modal: true
    });
};

//通用的地图位置信息选择对话框。  ==  百度
function fn_commonSetPosition(options) {
    var _this = this;
    this.config = {
        title: lang.system.Specifythelocation,
        oriObj: '',
        mapXY: '',
        mapName: '',
        mapDesc: '',
        okFn: function (posData) {
            $(_this.config.oriObj).val(posData.mapXY);
            $(_this.config.oriObj).change();
        }
    };
    $.extend(_this.config, options);
    // 创建地图们置选择对话框面板。
    var htmlStr = '<div class="commonMapSite" style="display:none">' + '	<div class="mapSearchDiv">' + '		<input type="text" id="mapSearch" placeholder="' + lang.prompt.inputLocationSearch + '"/>' + '		<span class="icon">&#xe64a;</span>' + '	</div>' + '	<div class="map" id="commonChooseMap"></div>' + '	<div class="coordinate">' + '		<div class="float-left">' + '			<div class="float-left">' + lang.prompt.latAndLng + ' :</div>' + '			<div class="float-right"><input type="text" style="width:220px;" id="mapXY"/></div>' + '		</div>' + '		<div class="float-right">' + '			<div class="float-left">' + lang.prompt.locationName + ' :</div>' + '			<div class="float-right"><input type="text" style="width:310px;" id="mapName"/></div>' + '		</div>' + '	</div>' + '	<div class="describe">' + '		<div class="float-left">' + lang.prompt.descriptionInfo + ' :</div>' + '		<div class="float-right"><input type="text" style="width:529px;" id="mapDesc"/></div>' + '	</div>' + '	<div class="footer">' + '		<img src="/static/img/true.png"  alt="" id="setMapInfo"/>' + '		<img src="/static/img/false.png" alt="" id="offMapInfo"/>' + '	</div>' + '</div>';
    var isInit = false;
    if ($('.commonMapSite').length == 0) {
        $(document.body).append(htmlStr);
        isInit = true;
    }
    $('.commonMapSite').dialog({
        title: _this.config.title,
        width: 768,
        height: 517,
        closed: false,
        cache: false,
        modal: true
    });

    if (isInit == true) {
        // 百度地图API功能
        var mapInitPoint = window.top.getParaVal('mapInitPoint');
        var mapInitLevel = window.top.getParaVal('mapInitLevel');
        var mapEnv = window.top.getParaVal('mapEnv');
        var mapInitPointArr = mapInitPoint.split(',');
        var map = new BMap.Map($('.commonMapSite #commonChooseMap')[0], {
            enableMapClick: false
        });
        map.addControl(new BMap.MapTypeControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            // 位置
            mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
        })); //添加地图类型控件	
        map.centerAndZoom(BMap.BPoint(Number(mapInitPointArr[0]), Number(mapInitPointArr[1])), Number(mapInitLevel)); //初始化地图,设置中心点坐标和地图级别
        function showInfo(e) {
            $(".commonMapSite #mapXY").val(bd2wgs(e.point.lng, e.point.lat));
            var pt = e.point;
            setTimeout(function () {
                map.clearOverlays();
                var marker = new BMap.Marker(pt);
                map.addOverlay(marker);
                map.panTo(pt);
            },
            500);
            if (mapEnv == 'online') { //如果是在线地图，才能得出当前位置的具体中文地址名称。
                var geoc = new BMap.Geocoder();
                geoc.getLocation(pt,
                function (rs) {
                    var addComp = rs.addressComponents;
                    var strMapName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                    $(".commonMapSite #mapName").val(strMapName);
                });
            } else {
                fn_pointToAddr(pt.lng, pt.lat,
                function (rs) {
                    var addComp = rs.addressComponent;
                    var strMapName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.street_number;
                    $(".commonMapSite #mapName").val(strMapName);
                });
            }
        }
        //		map.setCurrentCity("杭州");       //设置地图显示的城市，三维地图此项必须设置。
        map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        map.addEventListener("click", showInfo);
        window.commSetMap = map;
        if (mapEnv == 'online') $('.commonMapSite>.mapSearchDiv>ul').css('display', 'none');
        //关闭按钮点击事件。
        $('.commonMapSite #offMapInfo').off('click').on('click',
        function (event) {
            $(".commonMapSite #mapXY").val('');
            $(".commonMapSite #mapName").val('');
            $(".commonMapSite #mapDesc").val('');
            $('.commonMapSite').dialog('close');
        });

        //确定按钮点击事件。
        $('.commonMapSite #setMapInfo').off('click').on('click',
        function (event) {
            $('.commonMapSite').dialog('close');
            var mapXYVal = $(".commonMapSite #mapXY").val();
            var mapNameVal = $(".commonMapSite #mapName").val();
            var mapDescVal = $(".commonMapSite #mapDesc").val();
            var posData = {
                mapXY: mapXYVal.trim(),
                mapName: mapNameVal.trim(),
                mapDesc: mapDescVal.trim()
            };
            _this.config.okFn(posData);
            $(".commonMapSite #mapXY").val('');
            $(".commonMapSite #mapName").val('');
            $(".commonMapSite #mapDesc").val('');
        });
        if (mapEnv == 'online') {
            $(".commonMapSite .mapSearchDiv").css('display', 'block');
            var ac = new BMap.Autocomplete({ //建立一个自动完成的对象
                input: $('.commonMapSite #mapSearch')[0],
                location: window.commSetMap
            });
            ac.addEventListener("onconfirm",
            function (e) { //鼠标点击下拉列表后的事件
                var _value = e.item.value;
                var myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                window.commSetMap.clearOverlays(); //清除地图上所有覆盖物
                function myFun() {
                    var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                    $(".commonMapSite #mapXY").val(bd2wgs(pp.lng, pp.lat));
                    var geoc = new BMap.Geocoder();
                    geoc.getLocation(pp,
                    function (rs) {
                        var addComp = rs.addressComponents;
                        var strMapName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                        $(".commonMapSite #mapName").val(strMapName);
                    });
                    setTimeout(function () {
                        window.commSetMap.clearOverlays();
                        var marker = new BMap.Marker(pp);
                        window.commSetMap.addOverlay(marker);
                        window.commSetMap.panTo(pp);
                    },
                    500);
                }
                var local = new BMap.LocalSearch(window.commSetMap, { //智能搜索
                    onSearchComplete: myFun
                });
                local.search(myValue);
            });
        } else {
            fn_offLineAutoComplete($('.commonMapSite>.mapSearchDiv>#mapSearch'),
            function (fullAddr, point) {
                $(".commonMapSite #mapName").val(fullAddr);
                if (point && point != '') {
                    var pointArr = point.split(',');
                    $(".commonMapSite #mapXY").val(bd2wgs(Number(pointArr[0]), Number(pointArr[1])));
                    setTimeout(function () {
                        window.commSetMap.clearOverlays();
                        var pp = new BMap.Point(Number(pointArr[0]), Number(pointArr[1]));
                        var marker = new BMap.Marker(pp);
                        window.commSetMap.addOverlay(marker);
                        window.commSetMap.panTo(pp);
                    },
                    500);
                } else {
                    fn_addrToPoint(fullAddr,
                    function (pp) {
                        $(".commonMapSite #mapXY").val(bd2wgs(pp.lng, pp.lat));
                        setTimeout(function () {
                            window.commSetMap.clearOverlays();
                            var marker = new BMap.Marker(pp);
                            window.commSetMap.addOverlay(marker);
                            window.commSetMap.panTo(pp);
                        },
                        500);
                    });
                }
            });
        }
    }
    $(".commonMapSite #mapSearch").val('');
    $(".commonMapSite #mapXY").val(_this.config.mapXY);
    $(".commonMapSite #mapName").val(_this.config.mapName);
    $(".commonMapSite #mapDesc").val(_this.config.mapDesc);
    var point = _this.config.mapXY.split(",");
    setTimeout(function () {
        if (window.commSetMap) window.commSetMap.clearOverlays();
        if (point.length == 2) {
            var marker = new BMap.Marker(BMap.BPoint(Number(point[0]), Number(point[1])));
            window.commSetMap.addOverlay(marker);
            window.commSetMap.panTo(BMap.BPoint(Number(point[0]), Number(point[1])));
        }
    },
    500);
}

//通用的地图位置信息选择对话框。  ==  google
function fn_commonSetPositionOfGoogle(options) {
    var _this = this;
    this.config = {
        title: lang.system.Specifythelocation,
        oriObj: '',
        mapXY: '',
        mapName: '',
        mapDesc: '',
        okFn: function (posData) {
            $(_this.config.oriObj).val(posData.mapXY);
            $(_this.config.oriObj).change();
        }
    };
    $.extend(_this.config, options);
    // 创建地图们置选择对话框面板。
    var htmlStr = '<div class="commonMapSite" style="display:none">' + '	<div class="mapSearchDiv">' + '		<input type="text" id="mapSearch" placeholder="' + lang.prompt.inputLocationSearch + '"/>' + '		<span class="icon">&#xe64a;</span>' + '	</div>' + '	<div class="map" id="commonChooseMap"></div>' + '	<div class="coordinate">' + '		<div class="float-left">' + '			<div class="float-left">' + lang.prompt.latAndLng + ' :</div>' + '			<div class="float-right"><input type="text" style="width:220px;" id="mapXY"/></div>' + '		</div>' + '		<div class="float-right">' + '			<div class="float-left">' + lang.prompt.locationName + ' :</div>' + '			<div class="float-right"><input type="text" style="width:310px;" id="mapName"/></div>' + '		</div>' + '	</div>' + '	<div class="describe">' + '		<div class="float-left">' + lang.prompt.descriptionInfo + ' :</div>' + '		<div class="float-right"><input type="text" style="width:529px;" id="mapDesc"/></div>' + '	</div>' + '	<div class="footer">' + '		<img src="/static/img/true.png"  alt="" id="setMapInfo"/>' + '		<img src="/static/img/false.png" alt="" id="offMapInfo"/>' + '	</div>' + '</div>';
    var isInit = false;
    if ($('.commonMapSite').length == 0) {
        $(document.body).append(htmlStr);
        isInit = true;
    }
    $('.commonMapSite').dialog({
        title: _this.config.title,
        width: 768,
        height: 517,
        closed: false,
        cache: false,
        modal: true
    });

    if (isInit == true) {
        // 百度地图API功能
        var mapInitPoint = window.top.getParaVal('mapInitPoint');
        var mapInitLevel = window.top.getParaVal('mapInitLevel');
        var mapEnv = window.top.getParaVal('mapEnv');
        var mapInitPointArr = mapInitPoint.split(',');

        //	-------------------------------------------  下面为地图快  --------------------------------------
        var map = new google.maps.Map($('.commonMapSite #commonChooseMap')[0], {
            clickableIcons: false
        });

        //		map.addControl(new BMap.MapTypeControl({
        //			anchor : BMAP_ANCHOR_TOP_RIGHT, // 位置
        //			mapTypes : [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
        //		}));   					//添加地图类型控件	
        map.setCenter({
            lng: Number(mapInitPointArr[0]),
            lat: Number(mapInitPointArr[1])
        });
        map.setZoom(Number(mapInitLevel));

        function showInfo(e) {
            var lng = e.latLng.lng(); //经
            var lat = e.latLng.lat(); //纬
            $(".commonMapSite #mapXY").val(gcjtowgs(Number(lng), Number(lat)));

            //			var pt = e.point;
            //			setTimeout(function() {
            //				map.clearOverlays(); 
            //				var marker = new BMap.Marker(pt);
            //				map.addOverlay(marker);
            //				map.panTo(pt);
            //			}, 500);
            if (mapEnv == 'online') { //如果是在线地图，才能得出当前位置的具体中文地址名称。
                var geoc = new google.maps.Geocoder;
                var latlng = {
                    lat: Number(lat),
                    lng: Number(lng)
                };
                geoc.geocode({
                    'location': latlng
                },
                function (results, status) {
                    if (status === 'OK') {
                        if (results[0]) $(".commonMapSite #mapName").val(results[0].formatted_address);
                    }
                });
            } else {
                //				fn_pointToAddr(pt.lng, pt.lat, function(rs) {
                //					var addComp = rs.addressComponent;
                //					var strMapName=addComp.province + addComp.city + addComp.district + addComp.street + addComp.street_number;
                //					$(".commonMapSite #mapName").val(strMapName);
                //				});
            }
        }
        //		map.setCurrentCity("杭州");       //设置地图显示的城市，三维地图此项必须设置。
        //		map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        map.addListener("click", showInfo);
        window.commSetMap = map;
        if (mapEnv == 'online') $('.commonMapSite>.mapSearchDiv>ul').css('display', 'none');
        //关闭按钮点击事件。
        $('.commonMapSite #offMapInfo').off('click').on('click',
        function (event) {
            $(".commonMapSite #mapXY").val('');
            $(".commonMapSite #mapName").val('');
            $(".commonMapSite #mapDesc").val('');
            $('.commonMapSite').dialog('close');
        });

        //确定按钮点击事件。
        $('.commonMapSite #setMapInfo').off('click').on('click',
        function (event) {
            $('.commonMapSite').dialog('close');
            var mapXYVal = $(".commonMapSite #mapXY").val();
            var mapNameVal = $(".commonMapSite #mapName").val();
            var mapDescVal = $(".commonMapSite #mapDesc").val();
            var posData = {
                mapXY: mapXYVal.trim(),
                mapName: mapNameVal.trim(),
                mapDesc: mapDescVal.trim()
            };
            _this.config.okFn(posData);
            $(".commonMapSite #mapXY").val('');
            $(".commonMapSite #mapName").val('');
            $(".commonMapSite #mapDesc").val('');
        });
        if (mapEnv == 'online') {
            //			$(".commonMapSite .mapSearchDiv").css('display','block');
            //			var ac = new BMap.Autocomplete({    //建立一个自动完成的对象
            //				input : $('.commonMapSite #mapSearch')[0],
            //				location : window.commSetMap
            //			});
            //			ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
            //				var _value = e.item.value;
            //				var myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            //				window.commSetMap.clearOverlays();    //清除地图上所有覆盖物
            //				function myFun(){
            //					var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            //					$(".commonMapSite #mapXY").val(bd2wgs(pp.lng,pp.lat));
            //					var geoc = new BMap.Geocoder();
            //					geoc.getLocation(pp, function(rs){
            //						var addComp = rs.addressComponents;
            //						var strMapName=addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
            //						$(".commonMapSite #mapName").val(strMapName);
            //					});
            //					setTimeout(function() {
            //						window.commSetMap.clearOverlays(); 
            //						var marker = new BMap.Marker(pp);
            //						window.commSetMap.addOverlay(marker);
            //						window.commSetMap.panTo(pp);
            //					}, 500);
            //				}
            //				var local = new BMap.LocalSearch(window.commSetMap, { //智能搜索
            //					onSearchComplete: myFun
            //				});
            //				local.search(myValue);
            //			});
        } else {
            //			fn_offLineAutoComplete($('.commonMapSite>.mapSearchDiv>#mapSearch'), function(fullAddr, point) {
            //				$(".commonMapSite #mapName").val(fullAddr);
            //				if (point && point !='') {
            //					var pointArr = point.split(',');
            //					$(".commonMapSite #mapXY").val(bd2wgs(Number(pointArr[0]),Number(pointArr[1])));
            //					setTimeout(function() {
            //						window.commSetMap.clearOverlays(); 
            //						var pp = new BMap.Point(Number(pointArr[0]),Number(pointArr[1]));
            //						var marker = new BMap.Marker(pp);
            //						window.commSetMap.addOverlay(marker);
            //						window.commSetMap.panTo(pp);
            //					}, 500);
            //				} else {
            //					fn_addrToPoint(fullAddr, function(pp) {
            //						$(".commonMapSite #mapXY").val(bd2wgs(pp.lng,pp.lat));
            //						setTimeout(function() {
            //							window.commSetMap.clearOverlays(); 
            //							var marker = new BMap.Marker(pp);
            //							window.commSetMap.addOverlay(marker);
            //							window.commSetMap.panTo(pp);
            //						}, 500);
            //					});
            //				}
            //			});
        }
    }
    $(".commonMapSite #mapSearch").val('');
    $(".commonMapSite #mapXY").val(_this.config.mapXY);
    $(".commonMapSite #mapName").val(_this.config.mapName);
    $(".commonMapSite #mapDesc").val(_this.config.mapDesc);
    var point = _this.config.mapXY.split(",");
    setTimeout(function () {
        //		if (window.commSetMap) window.commSetMap.clearOverlays(); 
        if (point.length == 2) {
            //			var marker = new BMap.Marker(BMap.BPoint(Number(point[0]),Number(point[1])));
            //			window.commSetMap.addOverlay(marker);
            //			window.commSetMap.panTo(BMap.BPoint(Number(point[0]),Number(point[1])));
        }
    },
    500);
}

//简单调用通用地图定位信息设置对话框。
function fn_simpleSetPosition(obj) {
    var config = {
        mapXY: ($(obj).val()).trim(),
        oriObj: obj
    };
    if (window.top.myMapType == 'google') fn_commonSetPositionOfGoogle(config);
    if (window.top.myMapType == 'baidu') fn_commonSetPosition(config);
}

//根据输入的内容，检索推荐的地址信息。
function fn_querySuggestAddr(infoVal, nowTimeStamp, callbackFn) {
    var gisSn = window.top.getParaVal("mapUserSn");
    if (!gisSn || gisSn == '') gisSn = '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8';
    var protoStr = window.location.protocol; //获取当前网页协议。
    var httpUrl = '';
    if (protoStr.indexOf('https') != -1) {
        httpUrl = 'https://api.map.baidu.com/place/v2/suggestion?';
        httpUrl += 'ak=' + gisSn + '&s=1';
    } else {
        httpUrl = 'http://api.map.baidu.com/place/v2/suggestion?';
        httpUrl += 'ak=' + gisSn;
    }
    httpUrl += '&query=' + infoVal;
    httpUrl += '&region=单县';
    httpUrl += '&output=json';
    httpUrl = encodeURI(httpUrl);
    $.ajax({
        url: httpUrl,
        type: "GET",
        dataType: "jsonp",
        //指定服务器返回的数据类型
        success: function (data) {
            console.log(data);
            var jsonArr = [];
            if (data && data.message && data.message == 'ok' && data.result && data.result.length && data.result.length > 0) {
                for (var i = 0; i < data.result.length; i++) {
                    var curAddr = data.result[i];
                    var jsonObj = {
                        fullAddr: curAddr.province + curAddr.city + curAddr.district + curAddr.name,
                        showName: curAddr.name,
                        title: curAddr.province + curAddr.city + curAddr.district,
                        point: (curAddr.location) ? curAddr.location.lng + ',' + curAddr.location.lat : ''
                    }
                    jsonArr.push(jsonObj);
                }
            }
            if (callbackFn && typeof (callbackFn) == 'function') callbackFn(jsonArr);
        }
    });
}

//根据输入的内容，检索推荐的地址信息。
function fn_getSuggestAddr(infoVal, callbackFn) {
    var protoStr = window.location.protocol; //获取当前网页协议。
    var httpUrl = '';
    if (protoStr.indexOf('https') != -1) {
        httpUrl = 'https://map.baidu.com/su?wd=';
    } else {
        httpUrl = 'http://map.baidu.com/su?wd=';
    }
    httpUrl += infoVal + '&cid=353&type=0&from=jsapi';
    httpUrl += '&t=' + Number(new Date());
    httpUrl = encodeURI(httpUrl);
    $.ajax({
        url: httpUrl,
        type: "GET",
        dataType: "jsonp",
        //指定服务器返回的数据类型
        success: function (data) {
            var jsonArr = [];
            if (data && data.s && data.s.length && data.s.length > 0) {
                for (var i = 0; i < data.s.length; i++) {
                    var curAddr = data.s[i];
                    if (!curAddr || curAddr == '') continue;
                    var curArr = curAddr.split('$');
                    var jsonObj = {
                        fullAddr: curArr[0] + curArr[1] + curArr[3],
                        showName: curArr[3],
                        title: curArr[0] + curArr[1]
                    }
                    jsonArr.push(jsonObj);
                }
            }
            if (callbackFn && typeof (callbackFn) == 'function') callbackFn(jsonArr);
        }
    });
}

//经纬度地址坐标转名称。
function fn_pointToAddr(lng, lat, callbackFn) {
    var gisSn = window.top.getParaVal("mapUserSn");
    if (!gisSn || gisSn == '') gisSn = '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8';
    var protoStr = window.location.protocol; //获取当前网页协议。
    var httpUrl = '';
    if (protoStr.indexOf('https') != -1) {
        httpUrl = 'https://api.map.baidu.com/geocoder/v2/?';
        httpUrl += 'ak=' + gisSn + '&s=1';
    } else {
        httpUrl = 'http://api.map.baidu.com/geocoder/v2/?';
        httpUrl += 'ak=' + gisSn;
    }
    httpUrl += '&location=' + lat + ',' + lng;
    httpUrl += '&output=json&pois=1';
    httpUrl = encodeURI(httpUrl);
    $.ajax({
        url: httpUrl,
        type: "GET",
        dataType: "jsonp",
        //指定服务器返回的数据类型
        success: function (data) {
            if (!data || !data.result || !data.result.addressComponent) return;
            if (callbackFn && typeof (callbackFn) == 'function') callbackFn(data.result);
        }
    });
}

//地址名称转经纬度坐标。
function fn_addrToPoint(addr, callbackFn) {
    var gisSn = window.top.getParaVal("mapUserSn");
    if (!gisSn || gisSn == '') gisSn = '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8';
    var protoStr = window.location.protocol; //获取当前网页协议。
    var httpUrl = '';
    if (protoStr.indexOf('https') != -1) {
        httpUrl = 'https://api.map.baidu.com/geocoder/v2/?';
        httpUrl += 'ak=' + gisSn + '&s=1';
    } else {
        httpUrl = 'http://api.map.baidu.com/geocoder/v2/?';
        httpUrl += 'ak=' + gisSn;
    }
    httpUrl += '&address=' + addr;
    httpUrl += '&output=json';
    httpUrl = encodeURI(httpUrl);
    $.ajax({
        url: httpUrl,
        type: "GET",
        dataType: "jsonp",
        //指定服务器返回的数据类型
        success: function (data) {
            if (!data || !data.result || !data.result.location || !data.result.location.lat || !data.result.location.lng) return;
            var point = new BMap.Point(data.result.location.lng, data.result.location.lat);
            if (callbackFn && typeof (callbackFn) == 'function') callbackFn(point);
        }
    });
}

//离线时的地址下拉盾索框初始化绑定函数。
function fn_offLineAutoComplete(jqObj, callbackFn) {
    var nowCount = 0;
    //初始化
    if (jqObj.parent().children('ul').length <= 0) jqObj.parent().append('<ul></ul>');
    jqObj.parent().children('ul').css('display', 'none');
    var $ulTags = jqObj.parent().children('ul');
    //监听输入事件
    jqObj.off('input').on('input',
    function (event) {
        event.stopPropagation();
        //获取到当前输入的值
        var nowTimeStamp = Number(new Date());
        jqObj.attr('nowTimeStamp', nowTimeStamp);
        var searchMessage = $(this).val();
        if (!searchMessage || searchMessage == '') {
            $ulTags.html('');
            $ulTags.css('display', 'none');
            return;
        }
        fn_querySuggestAddr(searchMessage, nowTimeStamp,
        function (jsonArr) {
            var curTimeStamp = jqObj.attr('nowTimeStamp');
            if (curTimeStamp != nowTimeStamp) return;
            nowCount = 0;
            $ulTags.html('');
            for (var i = 0; i < jsonArr.length; i++) {
                $ulTags.append('<li><span class="icon">&#xe60d;</span></li>');
                var innerHtml = '<span class="message1">' + blackKeyWord(jsonArr[i]['showName'], searchMessage) + '</span><span class="message2">' + jsonArr[i]['title'] + '</span>';
                $ulTags.find('li').eq(i).append(innerHtml);
                $ulTags.find('li').eq(i).attr('fullAddr', jsonArr[i]['fullAddr']);
                $ulTags.find('li').eq(i).attr('point', jsonArr[i]['point']);
                $ulTags.css('display', 'block');
            }
            searchUpandDown(nowCount);
        });

        //hover效果
        $ulTags.off('mouseenter').on('mouseenter', 'li',
        function (event) {
            var liIndex = $(event.currentTarget).index();
            liTagsToggle(liIndex);
            nowCount = liIndex + 1;
            //	        getMessageValueit(liIndex);
            searchUpandDown(nowCount);
            return nowCount;
        });
        $ulTags.off('mouseleave').on('mouseleave', 'li',
        function (event) {
            $ulTags.find('li').removeClass('active');
        });
        //阻止input点击事件
        jqObj.off('click').on('click',
        function (event) {
            return false;
        });
        //点击li阻止默认事件
        $ulTags.off('click').on('click', 'li',
        function (event) {
            //继续添加操作
            var fullAddr = $ulTags.find('li').eq($(this).index()).attr('fullAddr');
            var point = $ulTags.find('li').eq($(this).index()).attr('point');
            jqObj.val(fullAddr);
            if (callbackFn && typeof (callbackFn) == 'function') callbackFn(fullAddr, point);
            $ulTags.css('display', 'none');
            return false;
        });
        //点击它处检索内容消失
        $('html').off('click').on('click',
        function (event) {
            $ulTags.css('display', 'none');
        });
        //判断现在的up/down位置
        function searchUpandDown(nowCount) {
            var index;
            var $liTags = $ulTags.find('li');
            if (nowCount === 0) {
                $liTags.removeClass('active');
            }
            jqObj.parent().off('keydown').on('keydown',
            function (event) {
                var e = window.event || event || event.which;
                var keyNum = e.keyCode; //获取键值
                switch (keyNum) { //判断按键
                    case 13:
                        //回车键
                        var fullAddr = $ulTags.find('li').eq(index).attr('fullAddr');
                        var point = $ulTags.find('li').eq(index).attr('point');
                        jqObj.val(fullAddr);
                        if (callbackFn && typeof (callbackFn) == 'function') callbackFn(fullAddr, point);
                        $ulTags.css('display', 'none');
                        break;
                    case 38:
                        //向上方向键
                        nowCount = nowCount - 1;
                        if (Math.abs(nowCount) > $liTags.length) {
                            nowCount = parseInt(nowCount / $liTags.length);
                        }
                        if (nowCount < 0) {
                            index = Math.abs($liTags.length + nowCount);
                            nowCount = $liTags.length - Math.abs(nowCount) + 1;
                            liTagsToggle(index);
                            getMessageValueit(index);
                        } else if (nowCount > 0) {
                            index = nowCount - 1;
                            liTagsToggle(index);
                            getMessageValueit(index);
                        } else if (nowCount === 0) {
                            $liTags.removeClass('active');
                        }
                        // return nowCount
                        break;
                    case 40:
                        //向下方向键
                        nowCount = nowCount + 1;
                        if (nowCount > $liTags.length) {
                            nowCount = parseInt(nowCount / $liTags.length);
                        }
                        if (Math.abs(nowCount) > 0) {
                            index = nowCount - 1;
                            liTagsToggle(index);
                            getMessageValueit(index);
                        } else { }
                        // return nowCount
                        break;
                    default:
                        break;
                }
            });
        }
        function liTagsToggle(index) {
            $ulTags.find('li').removeClass('active');
            $ulTags.find('li').eq(index).addClass('active');
        }
        //获取并赋值input
        function getMessageValueit(index) {
            var fullAddr = $ulTags.find('li').eq(index).attr('fullAddr');
            jqObj.val(fullAddr);
        }
        function blackKeyWord(oriVal, key) {
            if (!oriVal || oriVal == '') return '';
            if (!key || key == '') return oriVal;
            var pos = oriVal.indexOf(key);
            if (pos != -1) {
                var retVal = oriVal.substring(0, pos) + '<b>' + key + '</b>' + oriVal.substring(pos + key.length);
                return retVal;
            } else {
                return oriVal;
            }
        }
    });
}

/**
 * 
 * #C84E4E #D79750 #EACF59 #8AB66D #49714A #77ABCF #496999 #9E6B99 #7A6854
 * #7F7F7F #333333 红色 橙色 黄色 浅绿 深绿 浅蓝 深蓝 紫色 棕色 灰色 黑色
 * 
 * @param content
 * @param color
 * @returns
 */
function boult(content, color) {
    return ('<div class="tally" style="background: ' + color + '">' + content + '<div style="border:12px solid ' + color + ';"></div></div>')
}

window.top.bgColorCache = [{
    color: '#FFFFFF',
    text: lang.system.Nothing
},
{
    color: '#C84E4E',
    text: lang.prompt.red
},
{
    color: '#D79750',
    text: lang.prompt.orange
},
{
    color: '#EACF59',
    text: lang.prompt.yellow
},
{
    color: '#8AB66D',
    text: lang.prompt.lightGreen
},
{
    color: '#49714A',
    text: lang.prompt.darkGreen
},
{
    color: '#77ABCF',
    text: lang.prompt.lightBlue
},
{
    color: '#496999',
    text: lang.prompt.deepBlue
},
{
    color: '#9E6B99',
    text: lang.prompt.purple
},
{
    color: '#7A6854',
    text: lang.prompt.brown
},
{
    color: '#7F7F7F',
    text: lang.prompt.gray
},
{
    color: '#333333',
    text: lang.prompt.black
}];

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
Date.prototype.Format = function (fmt) { // author: wujj
    var o = {
        "M+": this.getMonth() + 1,
        // 月份
        "d+": this.getDate(),
        // 日
        "H+": this.getHours(),
        // 小时
        "m+": this.getMinutes(),
        // 分
        "s+": this.getSeconds(),
        // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
Date.prototype.addYear = function (years) {
    var cyear = this.getFullYear();
    cyear += years;
    this.setYear(cyear);
    return this;
}
//在当前时间上添加天数  
Date.prototype.addDay = function (days) {
    var cd = this.getDate();
    cd += days;
    this.setDate(cd);
    return this;
}
//在当前时间上添加月数  
Date.prototype.addMonth = function (months) {
    var cm = this.getMonth();
    cm += months;
    this.setMonth(cm);
    return this;
}

function chkMyBrowser() {
    var userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera"
    }; // 判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    } // 判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    } // 判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        return "IE";
    }; // 判断是否IE浏览器
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return "IE";
    }
    return "Unknown";
}

function isIe() {
    var myBrowser = chkMyBrowser();
    if (myBrowser && "IE" == myBrowser) {
        return true;
    } else {
        return false;
    }
}


/**
 * 
 * 转换数据列表datagrid中的数据字典。
 * 
 * @param url
 * @param vField
 * @param tField
 * @returns
 */
function dgColCvtComplex(url, vField, tField) {
    window.top.dictCache = window.top.dictCache || new Array();
    if (url && url != '') {
        if (!window.top.dictCache[url]) { // 该字典不存在，则从后台检索，并放入缓存中。
            $.ajax({
                type: "POST",
                url: url,
                async: false,
                dataType: "json",
                success: function (data) {
                    window.top.dictCache[url] = data;
                }
            });
        }
    }
    if (!vField || vField == '') vField = 'ITEM_CODE';
    if (!tField || tField == '') tField = 'ITEM_NAME';
    return function (value, row, index) {
        var dictData = window.top.dictCache[url];
        if (!dictData || !dictData.length) return value;
        for (var i = 0; i < dictData.length; i++) {
            if (dictData[i][vField] && dictData[i][vField] == value) {
                return dictData[i][tField];
            }
        }
        return value;
    };
}

/**
 * 
 * 将数据字典的代码转换为名称。
 * 
 * @param dictCode
 * @param code
 * @returns
 */
function convertCodeToName(dictCode, code) {
    var result = '';
    if (!dictCode || dictCode == '' || !code || code == '') return result;
    window.top.dictCache = window.top.dictCache || new Array();
    if (!window.top.dictCache[dictCode]) { // 该字典不存在，则从后台检索，并放入缓存中。
        $.ajax({
            type: "POST",
            url: "https://110.53.141.167:8443/comm/SysDictDetail/findByItemCode",
            async: false,
            data: {
                "DICT_CODE": dictCode
            },
            dataType: "json",
            success: function (data) {
                window.top.dictCache[dictCode] = data;
            }
        });
    }
    var dictData = window.top.dictCache[dictCode];
    if (dictData && dictData.length) {
        for (var i = 0; i < dictData.length; i++) {
            if (dictData[i].ITEM_CODE && dictData[i].ITEM_CODE == code) {
                result = dictData[i].ITEM_NAME || '';
                break;
            }
        }
    }
    return result;
}

/**
 * 
 * 转换form表单中的数据字典为HTML原生的SELECT下拉框。
 * 
 * @param jqObj
 * @param dictCode
 * @param haveEmpty
 * @param emptyText
 * @returns
 */
function createFormSelect(jqObj, dictCode, haveEmpty, emptyText) {
    if (!jqObj || !dictCode || dictCode == '') return;
    $(jqObj).html('');
    haveEmpty = haveEmpty || false;
    emptyText = emptyText || '--' + lang.dispatch.select + '--';
    window.top.dictCache = window.top.dictCache || new Array();
    if (!window.top.dictCache[dictCode]) { // 该字典不存在，则从后台检索，并放入缓存中。
        $.ajax({
            type: "POST",
            url: "https://110.53.141.167:8443/comm/SysDictDetail/findByItemCode",
            async: false,
            data: {
                "DICT_CODE": dictCode
            },
            dataType: "json",
            success: function (data) {
                window.top.dictCache[dictCode] = data;
            }
        });
    }
    var dictData = window.top.dictCache[dictCode];
    if (dictData && dictData.length) {
        dictData = dictData.concat();
        if (haveEmpty == true) {
            dictData.unshift({
                DICT_CODE: dictCode,
                ITEM_CODE: "",
                ITEM_NAME: emptyText,
                FULL_CODE: "",
                STATUS: "1"
            });
        }
        for (var i = 0; i < dictData.length; i++) {
            $(jqObj).append('<option value="' + dictData[i].ITEM_CODE + '">' + dictData[i].ITEM_NAME + '</option>');
        }
    }
}

/**
 * 
 * 转换form表单中的数据字典。
 * 
 * @param jqObj
 * @param dictCode
 * @param haveEmpty
 * @param emptyText
 * @returns
 */
function createCombobox(jqObj, dictCode, haveEmpty, emptyText) {
    if (!jqObj || !dictCode || dictCode == '') return;
    haveEmpty = haveEmpty || false;
    emptyText = emptyText || '--' + lang.dispatch.select + '--';
    window.top.dictCache = window.top.dictCache || new Array();
    if (!window.top.dictCache[dictCode]) { // 该字典不存在，则从后台检索，并放入缓存中。
        $.ajax({
            type: "POST",
            url: "https://110.53.141.167:8443/comm/SysDictDetail/findByItemCode",
            async: false,
            data: {
                "DICT_CODE": dictCode
            },
            dataType: "json",
            success: function (data) {
                window.top.dictCache[dictCode] = data;
            }
        });
    }
    var dictData = window.top.dictCache[dictCode];
    var ph = 'auto';
    if (dictData && dictData.length) {
        dictData = dictData.concat();
        if (haveEmpty == true) {
            dictData.unshift({
                DICT_CODE: dictCode,
                ITEM_CODE: "",
                ITEM_NAME: emptyText,
                FULL_CODE: "",
                STATUS: "1"
            });
        }
        if (dictData.length > 8) {
            ph = '224px';
        }
    }
    $(jqObj).combobox({
        data: dictData,
        valueField: 'ITEM_CODE',
        textField: 'ITEM_NAME',
        editable: false,
        panelHeight: ph
    });
}

/**
 * 
 * 转换form表单中的其它下拉列表项。
 * 
 * @param jqObj
 * @param dictCode
 * @param haveEmpty
 * @param emptyText
 * @returns
 */
function createOtherCom(jqObj, url, vField, tField, haveEmpty, emptyText) {
    if (!jqObj || !url || url == '' || !vField || vField == '' || !tField || tField == '') return;
    haveEmpty = haveEmpty || false;
    emptyText = emptyText || '--' + lang.dispatch.select + '--';
    window.top.dictCache = window.top.dictCache || new Array();
    if (!window.top.dictCache[url]) { // 该字典不存在，则从后台检索，并放入缓存中。
        $.ajax({
            type: "POST",
            url: url,
            async: false,
            dataType: "json",
            success: function (data) {
                window.top.dictCache[url] = data;
            }
        });
    }
    var dictData = window.top.dictCache[url];
    var ph = 'auto';
    if (dictData && dictData.length) {
        dictData = dictData.concat();
        if (url == 'userBasic/findRoleType') {
            for (var i = 0; i < dictData.length; i++) {
                if (dictData[i][vField] == '001') {
                    dictData.splice(i, 1);
                    break;
                }
            }
        }
        if (haveEmpty == true) {
            var tempObj = {};
            tempObj[vField] = "";
            tempObj[tField] = emptyText;
            dictData.unshift(tempObj);
        }
        if (dictData.length > 8) {
            ph = '224px';
        }
    }
    $(jqObj).combobox({
        data: dictData,
        valueField: vField,
        textField: tField,
        editable: false,
        panelHeight: ph
    });
}

/**
 * 
 * 查找并定位树中符合条件的节点。
 * 
 * @param jqTreeObj
 * @param searchTxt
 * @returns
 */
function easyui_Tree_Search(jqTreeObj, searchTxt) {
    // 如果传入的参数不符合要求，则直接返回。
    if (!jqTreeObj || jqTreeObj == '' || $(jqTreeObj).length <= 0 || !searchTxt || searchTxt == '' || $.trim(searchTxt) == '') return;
    // 传入的参数前处理。
    searchTxt = $.trim(searchTxt);
    // 取出旧的查询参数。
    var oldSearchTxt = $(jqTreeObj).attr('searchTxt');
    var searchCount = Number($(jqTreeObj).attr('searchCount'));
    if (!oldSearchTxt || $.trim(oldSearchTxt) == '') oldSearchTxt = '';
    if (!searchCount || isNaN(searchCount)) searchCount = 0;
    var searchNode = getSearchNode(jqTreeObj, searchTxt);
    if (searchTxt != oldSearchTxt) { // 两次查找条件相同，则直接在上一次的查询基础上往下查找。
        $(jqTreeObj).attr('searchTxt', searchTxt);
        searchCount = 0;
    }
    if (searchNode && searchNode.length && searchNode.length > 0) {
        var pos = searchCount % searchNode.length;
        $(jqTreeObj).find('.tree-node').removeClass('active');
        $('#' + searchNode[pos].domId).addClass('active');
        $(jqTreeObj).tree("select", searchNode[pos].target);
        $(jqTreeObj).tree("expandTo", searchNode[pos].target);
        $(jqTreeObj).tree("scrollTo", searchNode[pos].target);
    } else {
        prompt('warn', lang.common.Nonode, 1000);
    }
    searchCount++;
    $(jqTreeObj).attr('searchCount', searchCount);

    // 首先获取所有符合条件的节点数据。
    function getSearchNode(jqTreeObj, searchTxt) {
        var rootNode = $(jqTreeObj).tree('getRoots');
        var searchNode = [];
        if (rootNode && rootNode.length && rootNode.length > 0) {
            for (var i = 0; i < rootNode.length; i++) { // 循环顶级 node
                var nodeText = rootNode[i].text;
                var nodeId = rootNode[i].id;
                if (nodeText.lastIndexOf("（") != -1) {
                    nodeText = nodeText.substring(0, nodeText.lastIndexOf("（"));
                }
                if (nodeText.indexOf(searchTxt) >= 0 || nodeId.indexOf(searchTxt) >= 0) { // 判断节点text是否包含搜索文本
                    searchNode.push(rootNode[i]);
                }
                children = $(jqTreeObj).tree('getChildren', rootNode[i].target); // 获取顶级node下所有子节点
                if (children && children.length && children.length > 0) { // 如果有子节点
                    for (var j = 0; j < children.length; j++) { // 循环所有子节点
                        var childNodeText = children[j].text;
                        var childNodeId = children[j].id;
                        if (childNodeText.lastIndexOf("（") != -1) {
                            childNodeText = childNodeText.substring(0, childNodeText.lastIndexOf("（"));
                        }
                        if (childNodeText.indexOf(searchTxt) >= 0 || childNodeId.indexOf(searchTxt) >= 0) { // 判断节点text是否包含搜索文本
                            searchNode.push(children[j]);
                        }
                    }
                }
            }
        }
        return searchNode;
    }
}

// 计算字符串长度函数。
function fn_strLenCount(value) {
    var cArr = value.match(/[^\x00-\xff]/ig);
    var strLen = value.length + (cArr == null ? 0 : cArr.length);
    return strLen
}

// 获取当前可用最小小组号码信息。如无，则直接返回空。
function fn_getMinCanUseGNum() {
    var gNum = null;
    $.ajax({
        type: "POST",
        url: 'https://110.53.141.167:8443/comm/orginfo/getOAStat',
        async: false,
        data: {},
        dataType: "json",
        success: function (data) {
            if (data) {
                var sg = Number(data.oaSumInfo.GROUP_NUM);
                var ng = Number(data.oaSumInfo.t_gnum);
                if (sg > ng && data.gMisslist && data.gMisslist.length && data.gMisslist.length > 0) {
                    gNum = data.gMisslist[0].startMisNum
                }
            }
        }
    });
    return gNum;
}

/**
 * 字符串基本功能扩展JS文件。
 */

/**
 * 删除左右两端的空格
 */
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, '');
}
/**
 * 删除左边的空格
 */
String.prototype.ltrim = function () {
    return this.replace(/(^\s*)/g, '');
}
/**
 * 删除右边的空格
 */
String.prototype.rtrim = function () {
    return this.replace(/(\s*$)/g, '');
}

/**
 * 判断字符串是否以特定字符串开始。
 */
String.prototype.startWith = function (str) {
    var reg = new RegExp("^" + str);
    return reg.test(this);
}

/**
 * 判断字符串是否以特定字符串结束。
 */
String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
}

//在iframe页面加载完成后，添加上clicked事件的监听，触发顶级窗口的显示当前登陆用户的隐藏功能。
$(function () {
    $('#interface .header .user .data', window.top.window.document).fadeOut();
    $('#interface .header .user .data', window.top.window.document).removeClass('active');
    $(document).off('click').on('click',
    function (e) {
        $('#interface .header .user .data', window.top.window.document).fadeOut();
        $('#interface .header .user .data', window.top.window.document).removeClass('active');
    });
});