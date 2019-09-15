/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:08:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_param
-- ----------------------------
DROP TABLE IF EXISTS `sys_param`;
CREATE TABLE `sys_param` (
  `PARA_CODE` varchar(64) NOT NULL COMMENT '参数代码',
  `PARA_NAME` varchar(128) NOT NULL COMMENT '参数名称',
  `PARA_TYPE` varchar(32) NOT NULL COMMENT '参数分类:通用设置，底层通讯，平台管理等，数据字典定义。',
  `PARA_CATE` varchar(32) NOT NULL COMMENT '参数类别:SYS系统级参数，COMP公司级个人参数，PER个人级参数，数据字典定义。',
  `DATA_TYPE` varchar(32) DEFAULT NULL COMMENT '数据类型',
  `WIDGET_HTML` varchar(1024) DEFAULT NULL COMMENT '控件脚本',
  `DEF_VALUE` varchar(256) NOT NULL COMMENT '默认值',
  `PARA_VALUE` varchar(256) NOT NULL COMMENT '参数值',
  `SORTNO` int(11) DEFAULT NULL COMMENT '排序号',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '参数说明',
  PRIMARY KEY (`PARA_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统参数表';

-- ----------------------------
-- Records of sys_param
-- ----------------------------
INSERT INTO `sys_param` VALUES ('browserType', 'Browser type', '4-other', 'SYS', 'string', '<select name=\"browserType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"chrome\">Chrome</option>\r\n		<option value=\"ie\">IE browsers</option>\r\n		<option value=\"firefox\">Firefox browser</option>\r\n</select>', 'chrome', 'chrome', '11', 'Browser type');
INSERT INTO `sys_param` VALUES ('checkNumSeg', 'Open an account section check', '2-busi', 'COMP', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '15', 'When the system is opened, is there any strict check on the number segment');
INSERT INTO `sys_param` VALUES ('dispatchType', 'Type of station', '2-busi', 'COMP', 'string', '<select name=\"dispatchType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"haveMap\">Map control desk</option>\r\n		<option value=\"normal\">General dispatch desk</option>\r\n</select>', 'haveMap', 'haveMap', '16', 'Interface type of dispatching console');
INSERT INTO `sys_param` VALUES ('dispShowMode', 'Monitor display mode', '3-per', 'PER', 'string', '<select name=\"dispShowMode\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"PC\">PC mode</option>\r\n		<option value=\"touch\">Touch screen mode</option>\r\n</select>', 'PC', 'PC', '24', 'Monitor display mode');
INSERT INTO `sys_param` VALUES ('errRange', 'Allowable error range', '2-busi', 'COMP', 'number', '<input type=\"text\">', '100', '100', '8', 'Allowable error range');
INSERT INTO `sys_param` VALUES ('gps_url', 'GPS service address', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10005', 'ws://124.160.11.21:10005', '0', 'The WEBSOCKET address of the communication server GPS');
INSERT INTO `sys_param` VALUES ('haveTask', 'Mission support', '4-other', 'SYS', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'false', '12', 'Mission support');
INSERT INTO `sys_param` VALUES ('iMaxCall', 'Maximum number of calls', '0-comm', 'SYS', 'number', '<input type=\"text\">', '32', '32', '2', 'Maximum number of calls per single communication connection');
INSERT INTO `sys_param` VALUES ('iMaxGpsSubs', 'Maximum number of GPS subscriptions', '0-comm', 'SYS', 'number', '<input type=\"text\">', '4096', '4096', '4', 'Maximum number of GPS subscriptions per single communication connection');
INSERT INTO `sys_param` VALUES ('iMaxStatueSubs', 'Maximum number of state subscriptions', '0-comm', 'SYS', 'number', '<input type=\"text\">', '1', '1', '3', 'Maximum number of state connections for single communication connection');
INSERT INTO `sys_param` VALUES ('iMaxTrans', 'Maximum number of transactions', '0-comm', 'SYS', 'number', '<input type=\"text\">', '32', '1024', '1', 'Maximum number of transactions per single communication connection');
INSERT INTO `sys_param` VALUES ('inspDistance', 'Inspection interval', '2-busi', 'COMP', 'number', '<input type=\"text\">', '200', '200', '7', 'Inspection interval');
INSERT INTO `sys_param` VALUES ('mapEnv', 'Map environment type', '1-map', 'SYS', 'string', '<select name=\"mapEnv\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"online\">On-line</option>\r\n		<option value=\"offline\">Off-line</option>\r\n</select>', 'online', 'online', '6', 'Map environment type');
INSERT INTO `sys_param` VALUES ('mapImgFileExt', 'Offline map image extension', '1-map', 'SYS', 'string', '<select name=\"mapEnv\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\".png\">png</option>\r\n		<option value=\".jpg\">jpg</option>\r\n</select>', '.png', '.jpg', '8', 'Offline map image extension');
INSERT INTO `sys_param` VALUES ('mapInitLevel', 'Default map zoom level', '2-busi', 'COMP', 'number', '<input type=\"text\">', '16', '16', '14', 'Default map zoom display level');
INSERT INTO `sys_param` VALUES ('mapInitPoint', 'Default map center coordinates', '2-busi', 'COMP', 'string', '<input type=\"text\" onclick=\"fn_simpleSetPosition(this)\">', '120.147288,30.260963', '120.147288,30.260963', '13', 'Default map center coordinates');
INSERT INTO `sys_param` VALUES ('mapTailShow', 'Unconcerned user display', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '19', 'Does it show non concern users');
INSERT INTO `sys_param` VALUES ('mapType', 'Map engine type', '1-map', 'SYS', 'string', '<select name=\"mapType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"baidu\">Baidu Maps</option>\r\n		<option value=\"google\">Google Maps</option>\r\n		<option value=\"qqmap\">Tencent Maps</option>\r\n		<option value=\"tianditu\">Map World</option>\r\n		<option value=\"amap\">Scott Maps</option>\r\n</select>', 'baidu', 'baidu', '5', 'Map engine type');
INSERT INTO `sys_param` VALUES ('mapUserSn', 'Map API account', '1-map', 'SYS', 'string', '<input type=\"text\" style=\"width:250px;height:24px;\">', '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8', 'pdi33iA7kGmIbFCWt3cGwDzc6HZR5a4v', '7', 'Map API interface access account');
INSERT INTO `sys_param` VALUES ('micDetectTime', 'Automatic group call time', '3-per', 'PER', 'number', '<input type=\"text\">', '3000', '3000', '23', 'Automatic group call mute release interval length (unit: milliseconds)');
INSERT INTO `sys_param` VALUES ('micDetectVal', 'Automatic volume of group calls', '3-per', 'PER', 'number', '<input type=\"text\">', '-15', '-15', '22', 'Automatic group call volume detection threshold');
INSERT INTO `sys_param` VALUES ('offLineShow', 'Offline user display', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '18', 'Display offline user');
INSERT INTO `sys_param` VALUES ('pageSize', 'Page count', '3-per', 'PER', 'number', '<input type=\"text\">', '10', '10', '10', 'Page count');
INSERT INTO `sys_param` VALUES ('sysColor', 'System of color of skin', '3-per', 'PER', 'string', '<select name=\"sysColor\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"blue\">blue</option>\r\n		<option value=\"green\">green</option>\r\n</select>', 'blue', 'blue', '9', 'System of color of skin');
INSERT INTO `sys_param` VALUES ('toolBarShow', 'The toolbar is always displayed', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'false', 'false', '21', 'Is the toolbar displayed all the time');
INSERT INTO `sys_param` VALUES ('topMenuCss', 'Top-level menu style', '2-busi', 'COMP', 'string', '<select name=\"topMenuCss\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"icon\">Only icons</option>\r\n		<option value=\"iconAndText\">Icon plus text</option>\r\n</select>', 'icon', 'iconAndText', '17', 'Top menu display type');
INSERT INTO `sys_param` VALUES ('TPPURoot', 'Third party account display', '2-busi', 'COMP', 'string', '<select name=\"TPPURoot\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"root\">Root node</option>\r\n		<option value=\"dockUser\">Under the docking account</option>\r\n</select>', 'dockUser', 'dockUser', '20', 'Third party platform user display style');
INSERT INTO `sys_param` VALUES ('ws_url', 'Correspondence address', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10004', 'ws://124.160.11.21:10004', '0', 'Communication server WEBSOCKET address');
INSERT INTO `sys_param` VALUES ('wwgps_url', 'GPS service address of external network', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10005', 'ws://124.160.11.21:10005', '0', 'External network WEBSOCKET address of communication server GPS');
INSERT INTO `sys_param` VALUES ('wwws_url', 'External network communication address', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10004', 'ws://124.160.11.21:10004', '0', 'Communication server external network WEBSOCKET address');
