console.log('load comm-v2.js');
window.top.treeInfo2 = window.top.treeInfo2 || {};
window.top.groupTreeData2 = {};
window.top.treeTimer2 = null;
window.top.treeInitFlag2 = false;


/**
 * 获取部门信息，如果没有指定部门ID，则获取当前用户所在部门信息，如果有指定，则获取指定部门ID的下级部门列表
 * @param dept_id
 * @returns {Promise<any>}
 */
function fn_getDeptInfo(dept_id = -1) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "webservice/api/v1/comm/Organization/deptNodes",
            data: {dept_id: dept_id},
            async: false,
            success: function (data) {
                resolve(data.deptList);
            },
            fail: function (err) {
                reject();
            }
        });
    });
}

async function fn_getMyGroups() {
    var group = {
        id: -1,
        name: window.top.userInfo.orgInfoMap.NAME,
        groups: [],
    };

    async function fn_genGroupTree(root_group) {
        return new Promise(async (resolve) => {
            var dept_id = root_group.id;
            var deptList = await fn_getDeptInfo(dept_id);
            for (let deptInfo of deptList) {
                var node = {
                    id: deptInfo.dept_id,
                    name: deptInfo.dept_name,
                    groups: [],
                };
                root_group.groups.push(node);
                await fn_genGroupTree(node);
            }
            resolve(root_group)
        });
    }
    await fn_genGroupTree(group);
    console.log(group);
    return group;
}

function fn_Groups() {
    fn_getMyGroups();
}

async function fn_genTreeDataNew() {
    var device = {"Prio":2,"Type":1,"UTType":65,"Attr":200,"Num":"10001","Name":"10001","AGNum":"","GType":1,"ChanNum":0,"Status":1,"FGCount":5,"FGNum":"10009,10007,10006,10008,10005"}

    var root = {
        id: -1, //orgData.NUM,
        text: window.top.userInfo.orgInfoMap.NAME, //orgData.NAME + "（" + onLineArr.length + "/" + (onLineArr.length + offLineArr.length) + "）",
        state: 'open',
        checked: false,
        children: [],
        attrEx: {
            dept_id: -1,
        },
        attributes: {
            num: undefined,
            nodeId: -1,
            nodeName: window.top.userInfo.sessionUser.userInfo.cname, //orgData.NAME,
            nodeType: 0,
            nodeAgnum: '',
            nodePrio: '1',
            nodeIsTPPU: '0',
            onLine: [device],
            offLine: []
        }
    };

    // 递归生产下级节点
    async function fn_genChildrenNodes(root_node) {
        //console.log('fn_genChildrenNodes', root_node)
        return new Promise(async (resolve, reject) => {
            var dept_id = root_node.attrEx.dept_id;
            var deptList = await fn_getDeptInfo(dept_id);
            for(let deptInfo of deptList) {
                var childNode = {
                    id: deptInfo.dept_id,
                    text: deptInfo.dept_name,
                    state: null,
                    checked: false,
                    //children: [],
                    attrEx: {},
                    attributes: {
                        num: undefined,
                        nodeId: '',
                        nodeName: '',
                        nodeType: 0,
                        nodeAgnum: '',
                        nodePrio: '1',
                        nodeIsTPPU: '0',
                        onLine: [],
                        offLine: []
                    }
                };
                Object.assign(childNode.attrEx, deptInfo);
                if (!root_node.children)
                    root_node.children = [];
                root_node.children.push(childNode);
                await fn_genChildrenNodes(childNode);
            }
            resolve(root_node);
        });
    }

    await fn_genChildrenNodes(root);

    // 判断是否显示单位根节点。
    var isShowCompRoot = window.top.getParaVal('isShowCompRoot');
    if (isShowCompRoot != 'false') {
        window.top.groupTreeData2 = root;
        return [root];
    } else {
        window.top.groupTreeData2 = root;
        return root.children;
    }
    //return root;
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
