function initMenuUI() {
	// --指挥调度、平台管理、业务管理、决策分析等一级菜单切换及提示信息显示。--
	$('#interface>.header .tab ul').on('click', 'li', function() {
		var menuId = $(this).attr('id');
		if (menuId == 'menu_001000') return;
//		$("div.content_set").hide();
//		$("div.content").show();
		$('#interface>.header .tab ul li').removeClass('active');
		$(this).addClass('active');
		$('#interface>.content>div').removeClass('active');
		$('#interface>.content>div').eq($(this).index()).addClass('active');
	});

	if(!window.mainTabHasWorld){
		$('#interface>.header .tab li').hover(function() {
			$(this).find('div').css('display', 'block');
		}, function() {
			$(this).find('div').css('display', 'none');
		})
	}
/*
	$('#interface>.header .tab li').hover(function() {
		$(this).find('div').css('display', 'block');
	}, function() {
		$(this).find('div').css('display', 'none');
	})*/

	// --设置、注销、退出等功能按钮的提示信息显示。--
	$('#interface>.header .esc li').hover(function() {
		$(this).find('div').css('display', 'block');
	}, function() {
		$(this).find('div').css('display', 'none');
	})

	// --平台管理、业务管理、决策分析等的二级菜单及其子菜单的切换显示。--
	$('#interface .mainMenu .menu_group>li').on('click', function() {
		$('#interface .mainMenu .menu_group>li').removeClass('active');
		$(this).addClass('active');
	});
	$('#interface .mainMenu .menu_group>li').hover(function() {
		$(this).find('.subMenu').addClass('active');
	}, function() {
		$(this).find('.subMenu').removeClass('active');
	})
	$('.subMenu').on('click', function() {
		$('.subMenu').removeClass('active');
	})

	// 自动选择一级菜单中的首菜单。
	var firstMenuId = $('#interface .header .tab ul li').eq(0).attr('id');
	if (firstMenuId == 'menu_001000') {
		$('#interface .header .tab ul li').removeClass('active');
		$('#interface .header .tab ul li').eq(1).addClass('active');
		$('#interface .content>div').removeClass('active');
		$('#interface .content>div').eq(1).addClass('active');
	} else {
		$('#interface .header .tab ul li').removeClass('active');
		$('#interface .header .tab ul li').eq(0).addClass('active');
		$('#interface .content>div').removeClass('active');
		$('#interface .content>div').eq(0).addClass('active');
	}

	// 点击相关菜单，执行相关方法。
	$('.chatsurefun').on('click', function(event) {
		var fn_code = $(this).attr('functionCode');
		var fn_url = $(this).attr('functionUrl');
		if (!fn_code || fn_code.length <= 6 || !fn_url || fn_url == '')
			return;
		if (fn_code.length >= 12) {
			$('#interface .mainMenu .menu_group>li').removeClass('active');
			var sendLevelmenuDivId = 'menu_' + fn_code.substring(0, 9);
			$('#interface .mainMenu .menu_group #' + sendLevelmenuDivId).addClass('active');
		}
		var iframeID = 'iframe_' + fn_code.substring(0, 6);
		$('#' + iframeID).attr('src', fn_url);
		$('#' + iframeID).css("visibility","hidden");
		$('#' + iframeID).load(function() {
			$('#' + iframeID).css("visibility","visible");
	    });
		event.stopPropagation();
	});
}

var userInfoDetail;
$(function() {
	$('#interface>.content').height($('#interface').height() - 65);
	$('#interface>.content').width($('#interface').width());
	$(window).resize(function() {
		$('#interface>.content').height($('#interface').height() - 65);
		$('#interface>.content').width($('#interface').width());
	});
	createFormSelect('#edit_type', 'device_type', true);// 用户类型
	// 获取用户信息，并装载显示在页面中。
	getUserInfoData();
//	getSetDialog(); // 对设置弹框进行生成
	// 取当前登陆用户的相关信息。包括用户信息、角色信息、功能权限、数据权限、单位信息、相关参数等。
	function getUserInfoData() {
		$.ajax({
			type : "POST",
			url : "webservice/api/v1/comm/getUserInfo",
			async : false,
			success : function(data) {
				if (data.success == 'SUCCESS') {
					var pointXY = '';
					if (!data.userInfo.LONGITUDE)
						data.userInfo.LONGITUDE = '';
					if (!data.userInfo.LATITUDE)
						data.userInfo.LATITUDE = '';
					if (data.userInfo.LONGITUDE != '' && data.userInfo.LATITUDE != '')
						pointXY = data.userInfo.LONGITUDE + ',' + data.userInfo.LATITUDE;
					/* vvvvvvvvvvvvvvv用户详情vvvvvvvvvvvvvvvvvvv */
					$("#user_name").text(data.userInfo.name);
					$("#user_num").text(data.userInfo.num);
					$("#user_type").text(data.userInfo.typeValue);
					$("#user_work_unit").text(data.userInfo.work_unit);
					$("#user_dept_num").text(data.userInfo.dept_num);
					$("#user_title").text(data.userInfo.title);
					$("#user_tel").text(data.userInfo.tel);
					$("#user_id").text(data.userInfo.id);
					$("#user_address").text(pointXY);
					$("#user_work_id").text(data.userInfo.work_id);
					$("#user_car_id").text(data.userInfo.car_id);
					/* ^^^^^^^^^^^^^^^^^^ 用户详情 ^^^^^^^^^^^^^^^^ */
					/* vvvvvvvvvvvvvvv用户编辑vvvvvvvvvvvvvvvvvvv */
					$("#edit_name").text(data.userInfo.name);
					$("#edit_num").text(data.userInfo.num);
					$("#editAttr").val(data.userInfo.attr);
					$("#edit_type").find("option[value='" + data.userInfo.type + "']").attr("selected", true); // 用户类型
					$("#edit_work_unit").val(data.userInfo.work_unit);
					$("#edit_dept_num").val(data.userInfo.dept_num);
					$("#edit_title").val(data.userInfo.title);
					$("#edit_tel").val(data.userInfo.tel);
					$("#edit_id").val(data.userInfo.id);
					$("#edit_address").val(pointXY);
					$("#edit_pointName").val(data.userInfo.pointName);
					$("#edit_work_id").val(data.userInfo.work_id);
					$("#edit_car_id").val(data.userInfo.car_id);
					$("#editImg").attr("src", '/upload/headicon/' + data.userInfo.num + '.png?t=' + Math.random());
					/* ^^^^^^^^^^^^^^^^^^ 用户编辑 ^^^^^^^^^^^^^^^^ */

					// 加载登陆用户头像。
					$('.photo>img').attr('src', '/upload/headicon/' + data.userInfo.num + '.png?t=' + Math.random());
					$('#user_att_url').attr('src', '/upload/headicon/' + data.userInfo.num + '.png?t=' + Math.random());

					// 加载当前登陆用户所在单位的系统图像以及系统名称，并设置相关COOKIE与系统标题。
					if (data.orgInfoMap) {
						var systemImg = data.orgInfoMap.DS_ICON;
						var systemName = data.orgInfoMap.DS_NAME;
						if (!systemImg || systemImg == '')
							systemImg = 'static/img/logo.png';
						if (!systemName || systemName == '')
							systemName = lang.login.title;
						$('.logo>img').attr('src', systemImg);
						$('.banner .text').html(systemName);
						$('title').text(systemName);
						$.cookie('systemImg', systemImg, {
							expires : 366
						});
						$.cookie('systemName', systemName, {
							expires : 366
						});
					}

					// 设置用户信息并初始化页面与菜单。
					userInfoDetail = data;
					window.top.sessionUser = data.sessionUser;
					initPage(data);
				} else {
					$("#errorMsg").text(data.msg);
				}
			}
		});
	}
	// 并根据相关信息，展示主界面中的登陆人员、菜单等信息。
	function initPage(data) {
		// 加载登陆用户及其角色信息。
		var strUserNameMsg = data.userInfo.name + "【" + data.userInfo.num + "】";
		$("#userNameMsg").text(strUserNameMsg);
		$("#userNameMsg").attr("title", strUserNameMsg);
		var strUserRoleMsg = "";
		var roleList = data.userRolelist;
		for (var i = 0; i < roleList.length; i++) {
			strUserRoleMsg += roleList[i].role_name + " ";
		}
		$("#userRoleMsg").text(strUserRoleMsg);
		$("#userRoleMsg").attr("title", strUserRoleMsg);

		// 连接通讯服务。
		fn_wsstart(data);
		// 加载登陆用户菜单信息。
		var userFunclist = data.userFunclist;
		for (var i = 0; i < userFunclist.length; i++) {
			// 取出菜单相关值，并进行简单处理。
			var fn_code = userFunclist[i].fn_code;
			var fn_name = userFunclist[i].fn_name;
			var fn_type = userFunclist[i].fn_type;
			var fn_url = userFunclist[i].fn_url;
			var fn_img = userFunclist[i].fn_img;
			var parent_fncode = userFunclist[i].parent_fncode;
			var bkimg = userFunclist[i].memo;
			if (!fn_code)
				fn_code = "";
			if (!fn_name)
				fn_name = "";
			if (!fn_type)
				fn_type = "";
			if (!fn_url)
				fn_url = "";
			if (!fn_img)
				fn_img = "";
			if (!parent_fncode)
				parent_fncode = "";
			if (!bkimg)
				bkimg = "";
			fn_url = fn_url.trim();

			if (!fn_type || fn_type == "" || fn_type == "system" || fn_type == "page_element")
				continue;
			if (fn_code && fn_code != "") {
				var funLevel = fn_code.length / 3;
				switch (funLevel) {
				case 1:// 第一级功能，为指挥调度系统，跳过，不做处理。
					break;
				case 2:// 第二级功能，为顶层的指挥调度、业务管理、平台管理、决策分析等菜单项。创建相关菜单项，以及其内容展示DIV即可。
					var contentStr = "";
					if (fn_url != "" && fn_url.indexOf('()') != -1) { //JS的弹窗菜单。
						contentStr = '<div class="mainDiv" id="panel_' + fn_code + '">' + '</div>';
						//$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '" onClick = "createCase()">' + '<div>'+'<span class="icon">'+ fn_img +'</span>' + '<span>' + fn_name + '</span>'+ '</div></li>');
						if(window.mainTabHasWorld){
							$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '" onClick = "createCase()">' + '<div>'+'<span class="icon">'+ fn_img +'</span>' + '<span>' + fn_name + '</span>'+ '</div></li>');
						}else{
							$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '" onClick = "createCase()">' + fn_img + ' <div>' + fn_name + '</div></li>');
						}
						$('#interface .content').append(contentStr);
						break;
					}
					if (fn_url != "") {
						contentStr = '<div class="mainDiv" id="panel_' + fn_code + '">' + '</div>';
					} else {
						contentStr = '<div class="mainDiv" id="panel_' + fn_code + '">' + '<div class="menuWrap" style="background-image: url(\'' + bkimg
								+ '\');">' + '<div class="mainMenu" >' + '<div>' + '    <p>' + fn_name + '</p>' + '    <ul class="menu_group" id="menu_'
								+ fn_code + '">' + '    </ul>' + '</div>' + '</div>' + '</div>' + '<div class="iframeWrap">'
								+ '     <iframe src="" frameborder="0" id="iframe_' + fn_code + '"></iframe>' + '</div>' + "</div>";
					}
//					$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '">' +'<div>'+'<span class="icon">'+ fn_img +'</span>' + '<span>' + fn_name + '</span>'+'</div></li>');
					if(window.mainTabHasWorld){
						$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '">' +'<div>'+'<span class="icon">'+ fn_img +'</span>' + '<span>' + fn_name + '</span>'+'</div></li>');
					}else{
						$('#interface .header .tab ul').append('<li class="chatsurefun" id="menu_' + fn_code + '">' + fn_img + ' <div>' + fn_name + '</div></li>');
					}
					$('#interface .content').append(contentStr);
					if (fn_url != "") {
//						$("#panel_" + fn_code).load(fn_url);
						$("#panel_" + fn_code).load(fn_url,function(){
							angular.element(document).ready(function() {
								 angular.bootstrap(document, ['myApp']);
							});
						});
					}
					break;
				case 3:// 第三级功能。
					// 根据上级菜单，在上级顶层菜单对应的DIV中添加相关内容。
					$('#panel_' + parent_fncode + ' .menu_group').append(
							'<li class="chatsurefun" id="menu_' + fn_code + '"><span class="icon">' + fn_img + '</span><span>' + fn_name + '</span></li>');
					break;
				case 4:// 第四级功能。
					if ($('#menu_' + parent_fncode + ' ul').length > 0) {
						$('#menu_' + parent_fncode + ' ul').append('<li class="chatsurefun" id="menu_' + fn_code + '">' + fn_name + '</li>');
					} else {
						$('#menu_' + parent_fncode).append('<ul class="subMenu"><li class="chatsurefun" id="menu_' + fn_code + '">' + fn_name + '</li></ul>');
					}
					break;
				default:// 其它各级功能，跳过，不做处理。
					break;
				}
				$('#menu_' + fn_code).attr('functionUrl', fn_url);
				$('#menu_' + fn_code).attr('functionCode', fn_code);
			}
		}
		initMenuUI();
	}

	//退出按钮功能。
	$("#btn_exit").click(function() {
		 if (navigator.userAgent.indexOf("MSIE") > 0) {
			 $.messager.confirm(lang.dispatch.prompt,lang.dispatch.confLogout,function(r) {
				 if (r) {
					 fn_wsexit();
					 window.top.location.href = 'logOut?logoutFlag=1';
				 }
			 });
             if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
                 window.opener = null;
                 window.close();
             } else {
                 window.open('', '_top');
                 window.top.close();
             }
         } else if (navigator.userAgent.indexOf("Firefox") > 0) {
             prompt('error', '该浏览器不支持脚本关闭功能！', 1000);
         } else {
        	 prompt('error', '该浏览器不支持脚本关闭功能！', 1000);
         }
	});
	//全屏按钮功能。
	$("#btn_fullscreen").click(function() {
		var titleStr = $(this).find('div').html();
		if (titleStr == '全屏') {
			$(this).html('&#xe698; <div>还原</div>');
			fn_startFullScreen();
		} else {
			$(this).html('&#xe69b; <div>全屏</div>');
			fn_closeFullScreen();
		}
	});
	// 登陆按钮功能。
	$("#btn_logout").click(function() {
		$.messager.confirm(lang.dispatch.prompt,lang.dispatch.confLogout,function(r) {
			if (r) {
				fn_wsexit();
				window.top.location.href = 'logout?logoutFlag=1';
			}
		});
	});
});

// 设置弹窗--------------------------------------
$('.setLogo').on('click', function() {
	getSetDialog();
	$('#setting').dialog({
		title : lang.dispatch.Systemsettings,
		width : 768,
		height : 530,
		closed : false,
		cache : false,
		modal : true
	});
});
var boo = true;
$('#setting .left>ul>li').on(
    'click',
    'li',
    function() {
        if (boo) {
            boo = false;
            $('#setting .left>ul>li li').removeClass('active');
            var n = $(this).index();
            var $this = $(this);
            var number = $('#setting .left .system ul>li').length;
            $('#setting .left>ul>li li').removeClass('active');
            var index = $(this).parent().parent().index()
            if (index >= 1) {
                var x;
                if (index === 2) {
                    x = 1
                } else {
                    x = 0
                }
                var addHeight = preHeight(index)
                $('#setting .focus').animate({
                    'top' : 32 * n + addHeight + 55
                }, 300, function() {
                    $this.addClass('active');
                });
                $('#setting .right').animate(
                    {
                        'scrollTop' : n * 583 + ($('#setting .right>ul>li').eq(0).find('.three').length) * 583
                        + ($('#setting .right>ul>li').eq(1).find('.three').length) * 583 * x
                    }, function() {
                        boo = true
                    })
            } else {
                $('#setting .focus').animate({
                    'top' : 32 * n + 55
                }, 300, function() {
                    $this.addClass('active');
                });
                $('#setting .right').animate({
                    'scrollTop' : n * 583
                }, function() {
                    boo = true;
                })
            }
        }
    });

function preHeight(index) {
	var height = 0;
	for (var i = 0; i < index; i++) {
		height += $('#setting .left>ul>li').eq(i).height();
	}
	return height;
}

// 鼠标滚轮滚动效果
var wheel = true;
$('#setting').on(
    "mousewheel DOMMouseScroll",
    function(e) {
        var nowFocus = $('#setting .left>ul>li .active').index();
        var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome
            // & ie
            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
        var nowLeftTop = $('#setting .focus').css('top');
        var nowRightTop = $('#setting .right').scrollTop();
        var parentIndex = $('#setting .left>ul>li .active').parent().parent().index();
        if (delta > 0 && wheel && boo) {
            wheel = false;
            if (!(parentIndex === 0) || !(nowFocus === 0)) {
                var x = 0;
                var y = 0;
                var z = 0;
                if (nowFocus === 0) {
                    x = 1;
                }
                if (parentIndex >= 1) {
                    y = 1;
                }
                if (parentIndex === 2) {
                    z = 1;
                }
                var yLength = $('#setting .left>ul>li').eq(0).find('li').length * y;
                var zLength = $('#setting .left>ul>li').eq(1).find('li').length * z;
                $('#setting .left>ul>li li').removeClass('active');
                $('#setting .focus').animate({
                    'top' : parseInt(nowLeftTop) - 32 - 36 * x
                }, 300, function() {
                    $('#setting .left>ul>li li').eq(parseInt(nowFocus + yLength + zLength) - 1).addClass('active');
                });
                $('#setting .right').animate({
                    'scrollTop' : nowRightTop - 583
                }, function() {
                    boo = true
                    wheel = true
                })
            } else {
                wheel = true
            }
        } else if (delta < 0 && wheel && boo) {
            wheel = false
            // 向下滚
            if (parentIndex === ($('#setting .left>ul>li').length - 1)
                && nowFocus === $('#setting .left>ul>li').eq($('#setting .left>ul>li').length - 1).find('li').last().index()) {
                wheel = true
            } else {
                var x = 0;
                var y = 0;
                var z = 0;
                if (nowFocus === ($('#setting .left>ul>li').eq(parentIndex).find('li').length - 1)) {
                    x = 1
                }
                if (parentIndex >= 1) {
                    y = 1
                }
                if (parentIndex === 2) {
                    z = 1
                }
                var yLength = $('#setting .left>ul>li').eq(0).find('li').length * y;
                var zLength = $('#setting .left>ul>li').eq(1).find('li').length * z;
                $('#setting .left>ul>li li').removeClass('active');
                $('#setting .focus').animate({
                    'top' : parseInt(nowLeftTop) + 32 + 36 * x
                }, 300, function() {
                    $('#setting .left>ul>li li').eq(parseInt(nowFocus + yLength + zLength) + 1).addClass('active');
                });
                $('#setting .right').animate({
                    'scrollTop' : nowRightTop + 583
                }, function() {
                    boo = true
                    wheel = true
                })
            }
        }
    });

// title--------------------------------------
function createTooltip(tag, content) {
	tag.append('<div class="tip">' + content + '</div>');
	$('#setting .right .three>li .float-left').hover(function() {
		$(this).parent().find('.tip').addClass('active');
	}, function() {
		$(this).parent().find('.tip').removeClass('active');
	});
}

$('#setting .right .three>li .float-left').hover(function() {
	$(this).parent().find('.tip').addClass('active');
}, function() {
	$(this).parent().find('.tip').removeClass('active');
});

// 参数设置修改js
function getSetDialog()
{
    $("#system1 ul").html('');
    $("#company1 ul").html('');
    $("#person1 ul").html('');
    $("#system2 ul.two").html('');
    $("#company2 ul.two").html('');
    $("#person2 ul.two").html('');
    $.ajax({
        type : "POST",
        async : false,
        url : "webservice/api/v1/comm/SysParam/selectParaType",
        dataType : "json",
        success : function(datas) {
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                if (data.PARA_CATE == 'SYS') {
                    $("#system1 ul").append("<li>" + data.ITEM_NAME + "</li>");
                    var Str = "<li> <div class='right-title'>" + data.ITEM_NAME + "</div> <ul class='three' id = '" + data.ITEM_CODE + "'> </ul> </li>";
                    $("#system2 ul.two").append(Str);
                    getSet(data.ITEM_CODE, data.ITEM_CODE, 'SYS');
                }
                if (data.PARA_CATE == 'PER') {
                    $("#person1 ul").append("<li>" + data.ITEM_NAME + "</li>");
                    var Str = "<li> <div class='right-title'>" + data.ITEM_NAME + "</div> <ul class='three' id = '" + data.ITEM_CODE + "'> </ul> </li>";
                    $("#person2 ul.two").append(Str);
                    getSet(data.ITEM_CODE, data.ITEM_CODE, 'PER');
                }
                if (data.PARA_CATE == 'COMP') {
                    $("#company1 ul").append("<li>" + data.ITEM_NAME + "</li>");
                    var Str = "<li> <div class='right-title'>" + data.ITEM_NAME + "</div> <ul class='three' id = '" + data.ITEM_CODE + "'> </ul> </li>";
                    $("#company2 ul.two").append(Str);
                    getSet(data.ITEM_CODE, data.ITEM_CODE, 'COMP');
                }
            }
            var role = $('#userRoleMsg').text();
            if (role.indexOf(lang.dispatch.system) == -1) {//系统
                $("#system1").remove();
                $("#system2").remove();
            }
            if (role.indexOf(lang.dispatch.company) == -1) {//单位
                $("#company1").remove();
                $("#company2").remove();
            }
            $('#setting .left>ul>li').eq(0).find('li').eq(0).addClass('active');
        }
    });

	function getSet(ulId, PARA_TYPE, PARA_CATE) {
		$.ajax({
			type : "POST",
			async : false,
			url : "webservice/api/v1/comm/SysParam/select",
			dataType : "json",
			data : {
				PARA_TYPE : PARA_TYPE,
				PARA_CATE : PARA_CATE
			},
			success : function(datas) {
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i];
					if (data.DATA_TYPE == "checkbox") { // checkbox 单独处理
						var sppStr = "<li MEMO = '" + data.DATA_TYPE + "' PARA_CODE = '" + data.PARA_CODE + "'>" + "<div class='float-left'>" + data.PARA_NAME
								+ "&nbsp;:&nbsp;</div>" + data.WIDGET_HTML + "</li>";
						$("#" + ulId).append(sppStr);
						if ("true" == data.PARA_VALUE) {
							$("li[PARA_CODE=" + data.PARA_CODE + "] input").prop("checked", true);
						} else {
							$("li[PARA_CODE=" + data.PARA_CODE + "] input").prop("checked", false);
						}
						createTooltip($("li[PARA_CODE = " + data.PARA_CODE + "] div.float-left"), data.MEMO);
					} else {
						var sppStr = "<li PARA_CODE = '" + data.PARA_CODE + "'>" + "<div class='float-left'>" + data.PARA_NAME + "&nbsp;:&nbsp;</div>"
								+ data.WIDGET_HTML + "</li>";
						$("#" + ulId).append(sppStr);
						$("#" + ulId + " li").children().last().val(data.PARA_VALUE);
						createTooltip($("li[PARA_CODE = " + data.PARA_CODE + "] div.float-left"), data.MEMO);
					}
				}
			}
		});
		$("#" + ulId + " li").children().change(function() {
			var PARA_VALUE = $(this).val();
			var PARA_CODE = $(this).parent().attr("PARA_CODE");
			var MEMO = $(this).parent().attr("MEMO");
			if (MEMO == "checkbox") { // checkbox 单独处理
				var check = $(this).find("input").prop("checked");
				if (check == false) {
					$.ajax({
						type : "POST",
						url : "webservice/api/v1/comm/SysParam/update",
						data : {
							PARA_CODE : PARA_CODE,
							PARA_VALUE : "false"
						},
						dataType : "json",
						success : function(data) {
						}
					});
					$(this).find("input").prop("checked", false);
				} else {
					$.ajax({
						type : "POST",
						url : "webservice/api/v1/comm/SysParam/update",
						data : {
							PARA_CODE : PARA_CODE,
							PARA_VALUE : "true"
						},
						dataType : "json",
						success : function(data) {
						}
					});
					$(this).find("input").prop("checked", true);
				}
			} else {
				$.ajax({
					type : "POST",
					url : "webservice/api/v1/comm/SysParam/update",
					data : {
						PARA_CODE : PARA_CODE,
						PARA_VALUE : PARA_VALUE
					},
					dataType : "json",
					success : function(data) {
					}
				});
			}
		});
	}
}

// -----------个人信息状态栏设置和指定位置弹窗------------
$('#infoSet').on('click', function() {
	$('.personal-data .data-setting').css("display", "block");
});
$('.personal-data .data-setting .close').on('click', function() {
	$('.personal-data .data-setting').css("display", "none");
});
// ---------个人资料点击弹出,点击其他地方隐藏----------
$(document).off('click').on('click', function(e) {
	$('#interface .header .user .data').fadeOut();
	$('#interface .header .user .data').removeClass('active');
});
$('#interface .header .user').on('click', function(e) {
	e.stopPropagation();
	if ($('#interface .header .user .data').hasClass('active')) {
		$('#interface .header .user .data').fadeOut();
		$('#interface .header .user .data').removeClass('active');
	} else {
		$('#interface .header .user .data').addClass('active');
		$('#interface .header .user .data').fadeIn();
	}
});

// -------------------修改密码-----------------
$('#editPassword').on('click', function() {
	$("#pwd").val("");
	$("#oldPwd").val("");
	$("#surePwd").val("");
	$('.editPassword').dialog({
		title : lang.dispatch.changePassword,
		width : 293,
		height :300,
		closed : false,
		cache : false,
		modal : true
	});
});
$("#surePasd").click(function() {
	var num = window.userInfo.userInfo.num;
	var oldPwd = $("#oldPwd").val();
	var pwd = $("#pwd").val();
	var surePwd = $("#surePwd").val();
	var curPwd = window.userInfo.userInfo.pwd;
	var succFlag = true;
	var succMsg = '';
	if (surePwd != pwd) {
		succMsg = lang.dispatch.newDifferentNew;
		succFlag = false;
	}
	if (oldPwd != curPwd) {
		succMsg = lang.dispatch.oldPasswordError;
		succFlag = false;
	}
	if (succFlag == false) {
		prompt('warn', succMsg, 1000);
		$("#oldPwd").val('');
		$("#pwd").val('');
		$("#surePwd").val('');
		return succFlag;
	}
	var jUser = {
		UsrNum : num,
		Pwd : pwd
	};
	var retFn = function(bRes, cause, strCause, QueryRes) {
		if (bRes == true) {
			window.userInfo.userInfo.pwd = $("#surePwd").val();
			prompt('success', lang.dispatch.userPassWordModifiySucc, 1000);
			$("#oldPwd").val('');
			$("#pwd").val('');
			$("#surePwd").val('');
			$('.editPassword').dialog('close');
		} else {
			var errMsg = window.top.IDT.GetCauseStr(cause);
			prompt('error', lang.system.uPassUdpFailed+'，'+lang.system.Causeoferror+'：' + errMsg, 1000);
		}
	};
	var ret = window.top.m_IdtApi.UModify(jUser, retFn);
	if (ret < 0) {
		prompt('error', lang.system.uPassChangeFailed, 1000);
	}
});

// -------------------修改个人资料-------------------
$('#editData').on('click', function() {
	$('.editData').dialog({
		title : lang.dispatch.userModify,
		width : 330,
		height : 400,
		closed : false,
		cache : false,
		modal : true
	});
});

// 保存并更新用户个人信息。
$("#edit_sure").click(function() {
	var num = $("#edit_num").text(); // 用户号码
	var type = Number($('#edit_type').val());// 类型
	var attr = Number($("#editAttr").val()); // 用户属性。
	var dept_num = $("#edit_dept_num").val(); // 部门号码
	var id_card = $("#edit_id").val(); // 身份证号码
	var work_id = $("#edit_work_id").val(); // 工作证号
	var work_unit = $("#edit_work_unit").val(); // 工作单位
	var title = $("#edit_title").val(); // 职务
	var car_id = $("#edit_car_id").val(); // 车牌号
	var tel = $("#edit_tel").val(); // 电话号码
	var imgSrc = $("#editImg").attr("src");
	if (imgSrc && imgSrc != '' && imgSrc.lastIndexOf("?t=") != -1) imgSrc = imgSrc.substring(0,imgSrc.lastIndexOf("?t="));
	var isPosChg = $("#edit_address").attr("isPosChg");
	var modiPointXY = $("#edit_address").val();
	var modiPointName = $("#edit_pointName").val();
	// 相关数据处理。
	if (isNaN(type))
		type = 64;
	if (isNaN(attr))
		attr = 0;
	var jUser = {
		UsrNum : num,
		UserType : type,
		UserAttr : attr,
		DeptNum : dept_num,
		ID : id_card,
		WorkID : work_id,
		WorkUnit : work_unit,
		Title : title,
		CarID : car_id,
		Tel : tel
	};
	var retFn = function(bRes, cause, strCause, QueryRes) {
		if (bRes == true) {
			var pObj = this.pfCallBack.paraObj;
			var jUserObj = this.pfCallBack.jUser;
			// 修改用户的其它如角色、头像、GPS定位等信息。
			$.ajax({
				type : "POST",
				url : 'webservice/api/v1/comm/userBasic/updateUserWSExt',
				data : pObj,
				dataType : "json",
				success : function(data) {
					prompt('success', lang.system.Userinformationbeen, 1000);
					// 更新登陆用户个人信息。
					window.userInfo.userInfo.num = jUserObj.UsrNum;
					window.userInfo.userInfo.type = jUserObj.UserType;
					window.userInfo.userInfo.attr = jUserObj.UserAttr;
					window.userInfo.userInfo.dept_num = jUserObj.DeptNum;
					window.userInfo.userInfo.id = jUserObj.ID;
					window.userInfo.userInfo.work_id = jUserObj.WorkID;
					window.userInfo.userInfo.work_unit = jUserObj.WorkUnit;
					window.userInfo.userInfo.title = jUserObj.Title;
					window.userInfo.userInfo.car_id = jUserObj.CarID;
					window.userInfo.userInfo.tel = jUserObj.Tel;
					// 更新登陆用户地图坐标信息。
					var pointXY = pObj.modiPointXY;
					if (!pointXY)
						pointXY = '';
					var pointArr = pointXY.split(',');
					if (pointArr.length && pointArr.length == 2) {
						window.userInfo.userInfo.LONGITUDE = pointArr[0];
						window.userInfo.userInfo.LATITUDE = pointArr[1];
						fn_GpsReport(jUserObj.UsrNum , pointArr[0] , pointArr[1]);
					}
					// 更新登陆用户显示详情。
					$("#user_type").text(convertCodeToName('device_type', jUserObj.UserType));
					$("#user_dept_num").text(jUserObj.DeptNum);
					$("#user_id").text(jUserObj.ID);
					$("#user_work_id").text(jUserObj.WorkID);
					$("#user_work_unit").text(jUserObj.WorkUnit);
					$("#user_title").text(jUserObj.Title);
					$("#user_tel").text(jUserObj.Tel);
					$("#user_car_id").text(jUserObj.CarID);
					$("#user_address").text(pObj.modiPointXY);
					// 更新登陆用户头像。
					$("#editImg").attr("src", '/upload/headicon/' + jUserObj.UsrNum + '.png?t=' + Math.random());
					$('.photo>img').attr('src', '/upload/headicon/' + jUserObj.UsrNum + '.png?t=' + Math.random());
					$('#user_att_url').attr('src', '/upload/headicon/' + jUserObj.UsrNum + '.png?t=' + Math.random());
					$('.editData').dialog('close');
				}
			});
		} else {
			var errMsg = window.top.IDT.GetCauseStr(cause);
			prompt('error', lang.system.userModification+'，'+lang.system.Causeoferror+'：' + errMsg, 1000);
		}
	};
	retFn.jUser = jUser;
	retFn.paraObj = {
		"num" : num,
		"role_code" : 'noChange',
		"imgSrc" : imgSrc,
		"isPosChg" : isPosChg,
		"modiPointXY" : modiPointXY,
		"modiPointName" : modiPointName
	};
	var ret = window.top.m_IdtApi.UModify(jUser, retFn);
	if (ret < 0) {
		prompt('error', lang.system.UserChangesFailed, 1000);
	}
});

$("input[name=filename]").change(function(e) {
	if (!e.target.files || !e.target.files[0])
		return;
	var file = e.target.files[0];
	var fileName = file.name;
	var pos = fileName.lastIndexOf(".");
	var fileExt = "";
	if (pos && pos > 0) {
		fileExt = fileName.substring(pos + 1, fileName.length).toLowerCase();
	}
	if (fileExt != "png") {
		prompt('error', lang.system.imageisnotPNG, 1000);
		return;
	}
	var formData = new FormData();
	formData.append("file", file);
	formData.append("att_cate", "headicon");
	formData.append("obj_id", "");
	$.ajax({
		url : "webservice/api/v1/comm/attach/headicon",
		type : "POST",
		data : formData,
		// 告诉jQuery不要去处理发送的数据
		processData : false,
		// 告诉jQuery不要去设置Content-Type请求头
		contentType : false,
		success : function(data) {
			if (data && data.att_url && data.att_url != '') {
				$("#editImg").attr('src', data.att_url);
			}
		}
	});
});
function setPosition() {
	var eleId = $(this).attr("eleId");
	$('#targetId').val(eleId);
	var mapName = $("#" + eleId + "_pointName").val();
	var mapXY = $("#" + eleId + "_address").val();
	console.log(mapXY);
	if (mapXY == null || mapXY == "") {
		mapName = "";
	}
	var config = {
		title : lang.system.Specifythelocation,
		oriObj : $("#" + eleId + "_address"),
		mapXY : mapXY,
		mapName : mapName,
		mapDesc : '',
		okFn : function(posData) {
			$("#" + eleId + "_address").val(posData.mapXY);
			$("#" + eleId + "_pointName").val(posData.mapName);
		}
	};
	if(window.top.myMapType == 'google') fn_commonSetPositionOfGoogle(config);
	if(window.top.myMapType == 'baidu')  fn_commonSetPosition(config);
}
$('.mapPop').on('click', setPosition);
// ---------------选择类型图像弹窗-----------------
function chooseImgFn() {
	window.HeadIconType = "host";
	var eleId = $(this).attr("eleId");
	// 检索现在的各设备类型图片并展示。
	var htmlStr = $(".chooseImg .imgWrap").html();
	if (htmlStr == '') {
		$.ajax({
			type : "POST",
			url : 'webservice/api/v1/comm/attach/queryDevCateImg',
			async : false,
			data : {},
			dataType : "json",
			success : function(data) {
				if (!data || !data.length || data.length <= 0)
					return;
				var oldDevCate = "", domStr = "";
				for (var i = 0; i < data.length; i++) {
					var curDevCate = data[i].OBJ_ID;
					if (curDevCate && curDevCate != oldDevCate) {
						oldDevCate = curDevCate;
						if (i != 0) {
							domStr += "</ul></div>";
							$(".chooseImg .imgWrap").append(domStr);
						}
						domStr = '<div class="series"><div class="headline">' + data[i].ITEM_NAME + '</div><ul>';
						domStr += '<li><img src="' + data[i].ATT_URL + '" style="width:100%;height:100%;" devCate="' + data[i].OBJ_ID + '"/></li>';
					} else {
						domStr += '<li><img src="' + data[i].ATT_URL + '" style="width:100%;height:100%;" devCate="' + data[i].OBJ_ID + '"/></li>';
					}
					if (i == (data.length - 1)) {
						domStr += "</ul></div>";
						$(".chooseImg .imgWrap").append(domStr);
					}
				}
			}
		});
	}
	$('.chooseImg').attr("eleId", eleId);
	$('.chooseImg').dialog({
		title : lang.dispatch.userAvatar,
		width : 380,
		height : 530,
		closed : false,
		cache : false,
		modal : true
	});
}
//---------------地图选择类型图像弹窗-----------------
function chooseMapImgFn() {
	window.HeadIconType = "notHost";
	//检索现在的各设备类型图片并展示。
	var htmlStr = $(".chooseImg .imgWrap").html();
	if (htmlStr == '') {
		$.ajax({
			type : "POST",
			url : 'webservice/api/v1/comm/attach/queryDevCateImg',
			async : false,
			data : {},
			dataType : "json",
			success : function(data) {
				if (!data || !data.length || data.length <= 0) return;
				var oldDevCate = "", domStr = "";
				for (var i = 0; i < data.length; i++) {
					var curDevCate = data[i].OBJ_ID;
					if (curDevCate && curDevCate != oldDevCate) {
						oldDevCate = curDevCate;
						if (i != 0) {
							domStr += "</ul></div>";
							$(".chooseImg .imgWrap").append(domStr);
						}
						domStr = '<div class="series"><div class="headline">' + data[i].ITEM_NAME + '</div><ul>';
						domStr +='<li><img src="' + data[i].ATT_URL + '" style="width:100%;height:100%;" devCate="' + data[i].OBJ_ID + '"/></li>';
					} else {
						domStr +='<li><img src="' + data[i].ATT_URL + '" style="width:100%;height:100%;" devCate="' + data[i].OBJ_ID + '"/></li>';
					}
					if (i == (data.length -1)) {
						domStr += "</ul></div>";
						$(".chooseImg .imgWrap").append(domStr);
					}
				}
			}
		});
	}
	$('.chooseImg').dialog({
		title : lang.dispatch.userAvatar,
		width : 380,
		height : 530,
		closed : false,
		cache : false,
		modal : true
	});
}
function chooseUserHeadIcon(event) {
	$('.chooseImg .imgWrap .series>ul>li').removeClass('active');
	$(event.target).parent().addClass('active');
	var imgSrc = $(event.target).attr("src");
	var devCate = $(event.target).attr("devCate");
	$('.chooseImg').attr("imgSrc", imgSrc);
	$('.chooseImg').attr("devCate", devCate);
	event.stopPropagation();
}
function setUserHeadIcon() {
	if(window.HeadIconType == "notHost"){
		var imgSrc = $('.chooseImg li.active img').attr('src');
		$('#mapHeadIconSetId').attr('src',imgSrc);
		$('.chooseImg').dialog('close');
	}
	if(window.HeadIconType == "host"){
    	var imgSrc = $('.chooseImg').attr("imgSrc");
    	var devCate= $('.chooseImg').attr("devCate");
    	var eleId  = $('.chooseImg').attr("eleId");
    	var attrId = eleId.substring(0, eleId.length -3) + "Attr";
    	$("#"+eleId).attr("src",imgSrc);
    	$("#"+attrId).val(devCate);
    	$('.chooseImg').dialog('close');
	}
}
$('.chooseImgType').on('click', chooseImgFn);
$('.chooseImg').on('click', function(e) {
	chooseUserHeadIcon(e);
});
$('.chooseImg').on('dblclick', function(e) {
	chooseUserHeadIcon(e);
	setUserHeadIcon();
});
// 设置设备种类图片信息。
$("#sureHeadImg").click(setUserHeadIcon);
