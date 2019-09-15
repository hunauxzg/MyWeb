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
INSERT INTO `sys_func` VALUES ('001', 'Integrated Communications Command Platform', 'Integrated Communications Command Platform', 'system', null, null, null, '0', '1', '0', '0', null);
INSERT INTO `sys_func` VALUES ('001000', 'Create a police situation', 'Create a police situation', 'menu', 'createCase()', null, '&#xe6ec', '0', '1', '001', '0', '');
INSERT INTO `sys_func` VALUES ('001001', 'Dispatch', 'Dispatch', 'menu', 'dispatch/dispatch', null, '&#xe60b', '0', '1', '001', '1', null);
INSERT INTO `sys_func` VALUES ('001002', 'Platform', 'Platform', 'menu_group', null, null, '&#xe608', '0', '1', '001', '2', 'static/img/sys_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001002001', 'Unit Registration', 'Platform Management-Unit registration', 'menu', 'system/orgInfo', null, '&#xe643', '0', '1', '001002', '5', null);
INSERT INTO `sys_func` VALUES ('001002002', 'Role', 'Platform Management-Role management', 'menu', 'system/role', null, '&#xe623', '0', '1', '001002', '6', null);
INSERT INTO `sys_func` VALUES ('001002003', 'Device Type', 'Platform Management-Device type', 'menu', 'system/deviceType', null, '&#xe63a', '0', '1', '001002', '7', null);
INSERT INTO `sys_func` VALUES ('001002004', 'Data dictionary', 'Platform Management-Data word', 'menu', 'system/dict', null, '&#xe63a', '0', '1', '001002', '8', null);
INSERT INTO `sys_func` VALUES ('001002005', 'System Account', 'Platform Management-System account', 'menu', 'system/openAccount', null, '&#xe63e', '0', '1', '001002', '9', null);
INSERT INTO `sys_func` VALUES ('001002006', 'White list', 'Platform Management-white list management', 'menu', 'system/whiteList', null, '&#xe63a', '0', '1', '001002', '10', null);
INSERT INTO `sys_func` VALUES ('001002007', 'Log', 'Platform Management-Log management', 'menu_group', null, null, '&#xe646', '0', '1', '001002', '11', null);
INSERT INTO `sys_func` VALUES ('001002007001', 'Operation Log', 'Platform Management-Log management-operations log', 'menu', 'system/operLog', null, '&#xe63a', '0', '1', '001002007', '12', null);
INSERT INTO `sys_func` VALUES ('001002007002', 'Comm log', 'Platform Management-Log management-communication logs', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001002007', '13', null);
INSERT INTO `sys_func` VALUES ('001002007003', 'Interface Log', 'Platform Management-Log management-interface logs', 'menu', 'system/interLog', null, '&#xe63a', '0', '1', '001002007', '14', null);
INSERT INTO `sys_func` VALUES ('001002008', 'Alarm settings', 'Platform Management-Alarm settings', 'menu', 'system/anjianbianhanguanli', null, '&#xe63a', '0', '1', '001002', '15', null);
INSERT INTO `sys_func` VALUES ('001002009', 'Contact', 'Platform Management-Address book Management', 'menu', 'system/phoneBook', null, '&#xe63a', '0', '1', '001002', '16', null);
INSERT INTO `sys_func` VALUES ('001003', 'Business', 'Business', 'menu_group', null, null, '&#xe60c', '0', '1', '001', '3', 'static/img/busi_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001003001', 'Comm Log', 'Business Management-Communication logs', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001003', '15', null);
INSERT INTO `sys_func` VALUES ('001003002', 'Notice', 'Business Management-Notification announcements', 'menu', 'basic/sysNotice', null, '&#xe63a', '0', '1', '001003', '16', null);
INSERT INTO `sys_func` VALUES ('001003003', 'Task', 'Business Management-Task management', 'menu_group', 'system/system_manager.jsp', null, '&#xe63a', '0', '1', '001003', '17', null);
INSERT INTO `sys_func` VALUES ('001003003001', 'Task category', 'Business Management-Task management-task category', 'menu', 'task/temIframe', null, '&#xe63a', '0', '1', '001003003', '34', null);
INSERT INTO `sys_func` VALUES ('001003003002', 'Evaluation Template', 'Business Management-Task management-evaluation templates', 'menu', 'task/deviceEvaluate.jsp', null, '&#xe63a', '0', '1', '001003003', '35', null);
INSERT INTO `sys_func` VALUES ('001003003003', 'Task List', 'Business Management-Task management-Task List', 'menu', 'task/taskManagement', null, '&#xe63a', '0', '1', '001003003', '36', null);
INSERT INTO `sys_func` VALUES ('001003004', 'Patrol', 'Business Management-Patrol management', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '18', null);
INSERT INTO `sys_func` VALUES ('001003004001', 'Failure templates', 'Business Management-Patrol management-Failure templates', 'menu', 'inspection/failureTemplate', null, '&#xe633', '0', '1', '001003004', '19', null);
INSERT INTO `sys_func` VALUES ('001003004002', 'Line Setup', 'Business Management-Patrol management-line Setup', 'menu', 'inspection/lineSetting', null, '&#xe63a', '0', '1', '001003004', '20', null);
INSERT INTO `sys_func` VALUES ('001003004003', 'Patrol monitoring', 'Business Management-patrol management-patrol monitoring', 'menu', 'inspection/inspecteControl', null, '&#xe63a', '0', '1', '001003004', '21', null);
INSERT INTO `sys_func` VALUES ('001003004004', 'Patrol Log', 'Business Management-Patrol management-patrol log', 'menu', 'inspection/inspectLog', null, '&#xe63a', '0', '1', '001003004', '22', null);
INSERT INTO `sys_func` VALUES ('001003004005', 'Problem management', 'Business Management-Patrol management-patrol log', 'menu', 'inspection/problemManage', null, '&#xe63a', '0', '1', '001003004', '23', null);
INSERT INTO `sys_func` VALUES ('001003006', 'Attendance', 'Business Management-Patrol management-patrol log', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '20', null);
INSERT INTO `sys_func` VALUES ('001003006001', 'Holiday settings', 'Business Management-Attendance management-Holiday settings', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '21', null);
INSERT INTO `sys_func` VALUES ('001003006002', 'Attendance Group setup', 'Business Management-Attendance management-time group setup', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '22', null);
INSERT INTO `sys_func` VALUES ('001003006003', 'Overtime Management', 'Business Management-Attendance management-overtime management', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '23', null);
INSERT INTO `sys_func` VALUES ('001003006004', 'Leave management', 'Business Management-Attendance management-leave management', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '24', null);
INSERT INTO `sys_func` VALUES ('001003006005', 'Field Management', 'Business Management-Attendance management-field management', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '25', null);
INSERT INTO `sys_func` VALUES ('001003006006', 'Attendance processing', 'Business Management-Attendance management-Attendance processing', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '26', null);
INSERT INTO `sys_func` VALUES ('001003006007', 'Attendance statistics', 'Business Management-Attendance management-attendance statistics', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '27', null);
INSERT INTO `sys_func` VALUES ('001003007', 'Police intelligence Management', 'Business Management-Police intelligence management', 'menu', 'basic/upCase', null, '&#xe63a', '0', '1', '001003', '28', null);
INSERT INTO `sys_func` VALUES ('001004', 'Decision analysis', 'Decision analysis', 'menu_group', null, null, '&#xe60a', '0', '1', '001', '4', 'static/img/stat_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001004001', 'Basic situation', 'Decision ANALYSIS-Basic conditions', 'menu', 'system/manager', null, '&#xe63a', '0', '1', '001004', '40', null);
INSERT INTO `sys_func` VALUES ('001004002', 'Task Analysis', 'Decision Analysis-Task analysis', 'menu', null, null, '&#xe63a', '0', '1', '001004', '41', null);
INSERT INTO `sys_func` VALUES ('001004003', 'Patrol analysis', 'Decision analysis-Patrol analysis', 'menu', null, null, '&#xe63a', '0', '1', '001004', '42', null);
INSERT INTO `sys_func` VALUES ('001004004', 'Problem analysis', 'Decision ANALYSIS-Problem analysis', 'menu', null, null, '&#xe63a', '0', '1', '001004', '43', null);
INSERT INTO `sys_func` VALUES ('001004005', 'Attendance analysis', 'Decision analysis-Attendance analysis', 'menu', null, null, '&#xe63a', '0', '1', '001004', '44', null);
INSERT INTO `sys_func` VALUES ('001004006', 'Performance analysis', 'Decision Analysis-Performance analysis', 'menu', 'inspection/testMap', null, '&#xe63a', '0', '1', '001004', '45', null);
