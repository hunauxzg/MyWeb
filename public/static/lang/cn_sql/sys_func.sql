/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:07:58
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_func
-- ----------------------------
DROP TABLE IF EXISTS `sys_func`;
CREATE TABLE `sys_func` (
  `FN_CODE` varchar(64) NOT NULL COMMENT '功能代码',
  `FN_NAME` varchar(64) NOT NULL COMMENT '功能名称',
  `FN_FULLNAME` varchar(256) NOT NULL COMMENT '功能全称',
  `FN_TYPE` varchar(32) NOT NULL COMMENT '功能类型:页面、按钮、菜单、链接等，数据字典定义。',
  `FN_URL` varchar(256) DEFAULT NULL COMMENT '功能URL地址',
  `FN_PAGE_IDENT` varchar(256) DEFAULT NULL COMMENT '功能页面标识',
  `FN_IMG` varchar(256) DEFAULT NULL COMMENT '功能图标',
  `IS_AUTORUN` varchar(32) DEFAULT NULL COMMENT '是否自启动:0 不允许自启动，1登陆后自启动，数据字典定义。',
  `IS_CLOASEABLE` varchar(32) DEFAULT NULL COMMENT '可否关闭:0不可关闭，1可关闭，数据字典定义。',
  `PARENT_FNCODE` varchar(64) DEFAULT NULL COMMENT '上级功能',
  `SORTNO` int(11) DEFAULT NULL COMMENT '排序号',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`FN_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='功能模块清单表';

-- ----------------------------
-- Records of sys_func
-- ----------------------------
INSERT INTO `sys_func` VALUES ('001', '融合通讯综合指挥平台', '融合通讯综合指挥平台', 'system', null, null, null, '0', '1', '0', '0', null);
INSERT INTO `sys_func` VALUES ('001000', '创建警情', '创建警情', 'menu', 'createCase()', null, '&#xe6ec', '0', '1', '001', '0', '');
INSERT INTO `sys_func` VALUES ('001001', '指挥调度', '指挥调度', 'menu', 'dispatch/dispatch', null, '&#xe60b', '0', '1', '001', '1', null);
INSERT INTO `sys_func` VALUES ('001002', '平台管理', '平台管理', 'menu_group', null, null, '&#xe608', '0', '1', '001', '2', 'static/img/sys_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001002001', '单位注册', '平台管理-单位注册', 'menu', 'system/orgInfo', null, '&#xe643', '0', '1', '001002', '5', null);
INSERT INTO `sys_func` VALUES ('001002002', '角色管理', '平台管理-角色管理', 'menu', 'system/role', null, '&#xe623', '0', '1', '001002', '6', null);
INSERT INTO `sys_func` VALUES ('001002003', '设备种类', '平台管理-设备种类', 'menu', 'system/deviceType', null, '&#xe63a', '0', '1', '001002', '7', null);
INSERT INTO `sys_func` VALUES ('001002004', '数据字典', '平台管理-数据字典', 'menu', 'system/dict', null, '&#xe63a', '0', '1', '001002', '8', null);
INSERT INTO `sys_func` VALUES ('001002005', '系统开户', '平台管理-系统开户', 'menu', 'system/openAccount', null, '&#xe63e', '0', '1', '001002', '9', null);
INSERT INTO `sys_func` VALUES ('001002006', '白名单管理', '平台管理-白名单管理', 'menu', 'system/whiteList', null, '&#xe63a', '0', '1', '001002', '10', null);
INSERT INTO `sys_func` VALUES ('001002007', '日志管理', '平台管理-日志管理', 'menu_group', null, null, '&#xe646', '0', '1', '001002', '11', null);
INSERT INTO `sys_func` VALUES ('001002007001', '操作日志', '平台管理-日志管理-操作日志', 'menu', 'system/operLog', null, '&#xe63a', '0', '1', '001002007', '12', null);
INSERT INTO `sys_func` VALUES ('001002007002', '通讯日志', '平台管理-日志管理-通讯日志', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001002007', '13', null);
INSERT INTO `sys_func` VALUES ('001002007003', '接口日志', '平台管理-日志管理-接口日志', 'menu', 'system/interLog', null, '&#xe63a', '0', '1', '001002007', '14', null);
INSERT INTO `sys_func` VALUES ('001002008', '警情设置', '平台管理-警情设置', 'menu', 'system/anjianbianhanguanli', null, '&#xe63a', '0', '1', '001002', '15', null);
INSERT INTO `sys_func` VALUES ('001002009', '通讯录管理', '平台管理-通讯录管理', 'menu', 'system/phoneBook', null, '&#xe63a', '0', '1', '001002', '16', null);
INSERT INTO `sys_func` VALUES ('001003', '业务管理', '业务管理', 'menu_group', null, null, '&#xe60c', '0', '1', '001', '3', 'static/img/busi_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001003001', '通讯日志', '业务管理-通讯日志', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001003', '15', null);
INSERT INTO `sys_func` VALUES ('001003002', '通知公告', '业务管理-通知公告', 'menu', 'basic/sysNotice', null, '&#xe63a', '0', '1', '001003', '16', null);
INSERT INTO `sys_func` VALUES ('001003003', '任务管理', '业务管理-任务管理', 'menu_group', 'system/system_manager.jsp', null, '&#xe63a', '0', '1', '001003', '17', null);
INSERT INTO `sys_func` VALUES ('001003003001', '任务类别', '业务管理-任务管理-任务类别', 'menu', 'task/temIframe', null, '&#xe63a', '0', '1', '001003003', '34', null);
INSERT INTO `sys_func` VALUES ('001003003002', '评价模板', '业务管理-任务管理-评价模板', 'menu', 'task/deviceEvaluate.jsp', null, '&#xe63a', '0', '1', '001003003', '35', null);
INSERT INTO `sys_func` VALUES ('001003003003', '任务列表', '业务管理-任务管理-任务列表', 'menu', 'task/taskManagement', null, '&#xe63a', '0', '1', '001003003', '36', null);
INSERT INTO `sys_func` VALUES ('001003004', '巡检管理', '业务管理-巡检管理', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '18', null);
INSERT INTO `sys_func` VALUES ('001003004001', '故障模板', '业务管理-巡检管理-故障模板', 'menu', 'inspection/failureTemplate', null, '&#xe633', '0', '1', '001003004', '19', null);
INSERT INTO `sys_func` VALUES ('001003004002', '线路设置', '业务管理-巡检管理-线路设置', 'menu', 'inspection/lineSetting', null, '&#xe63a', '0', '1', '001003004', '20', null);
INSERT INTO `sys_func` VALUES ('001003004003', '巡检监控', '业务管理-巡检管理-巡检监控', 'menu', 'inspection/inspecteControl', null, '&#xe63a', '0', '1', '001003004', '21', null);
INSERT INTO `sys_func` VALUES ('001003004004', '巡检日志', '业务管理-巡检管理-巡检日志', 'menu', 'inspection/inspectLog', null, '&#xe63a', '0', '1', '001003004', '22', null);
INSERT INTO `sys_func` VALUES ('001003004005', '问题管理', '业务管理-巡检管理-问题管理', 'menu', 'inspection/problemManage', null, '&#xe63a', '0', '1', '001003004', '23', null);
INSERT INTO `sys_func` VALUES ('001003006', '考勤管理', '业务管理-考勤管理', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '20', null);
INSERT INTO `sys_func` VALUES ('001003006001', '节假日设置', '业务管理-考勤管理-节假日设置', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '21', null);
INSERT INTO `sys_func` VALUES ('001003006002', '考勤组设置', '业务管理-考勤管理-考勤组设置', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '22', null);
INSERT INTO `sys_func` VALUES ('001003006003', '加班管理', '业务管理-考勤管理-加班管理', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '23', null);
INSERT INTO `sys_func` VALUES ('001003006004', '请假管理', '业务管理-考勤管理-请假管理', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '24', null);
INSERT INTO `sys_func` VALUES ('001003006005', '外勤管理', '业务管理-考勤管理-外勤管理', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '25', null);
INSERT INTO `sys_func` VALUES ('001003006006', '考勤处理', '业务管理-考勤管理-考勤处理', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '26', null);
INSERT INTO `sys_func` VALUES ('001003006007', '考勤统计', '业务管理-考勤管理-考勤统计', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '27', null);
INSERT INTO `sys_func` VALUES ('001003007', '警情管理', '业务管理-警情管理', 'menu', 'basic/upCase', null, '&#xe63a', '0', '1', '001003', '28', null);
INSERT INTO `sys_func` VALUES ('001004', '决策分析', '决策分析', 'menu_group', null, null, '&#xe60a', '0', '1', '001', '4', 'static/img/stat_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001004001', '基本情况', '决策分析-基本情况', 'menu', 'system/manager', null, '&#xe63a', '0', '1', '001004', '40', null);
INSERT INTO `sys_func` VALUES ('001004002', '任务分析', '决策分析-任务分析', 'menu', null, null, '&#xe63a', '0', '1', '001004', '41', null);
INSERT INTO `sys_func` VALUES ('001004003', '巡检分析', '决策分析-巡检分析', 'menu', null, null, '&#xe63a', '0', '1', '001004', '42', null);
INSERT INTO `sys_func` VALUES ('001004004', '问题分析', '决策分析-问题分析', 'menu', null, null, '&#xe63a', '0', '1', '001004', '43', null);
INSERT INTO `sys_func` VALUES ('001004005', '考勤分析', '决策分析-考勤分析', 'menu', null, null, '&#xe63a', '0', '1', '001004', '44', null);
INSERT INTO `sys_func` VALUES ('001004006', '绩效分析', '决策分析-绩效分析', 'menu', 'inspection/testMap', null, '&#xe63a', '0', '1', '001004', '45', null);
