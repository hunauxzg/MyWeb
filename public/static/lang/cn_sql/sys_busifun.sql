/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:07:26
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_busifun
-- ----------------------------
DROP TABLE IF EXISTS `sys_busifun`;
CREATE TABLE `sys_busifun` (
  `FUN_CODE` varchar(32) NOT NULL COMMENT '功能编码',
  `FUN_NAME` varchar(32) NOT NULL,
  `FUN_DESC` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`FUN_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='业务功能清单表';

-- ----------------------------
-- Records of sys_busifun
-- ----------------------------
INSERT INTO `sys_busifun` VALUES ('01-voice', '音频', '音频功能');
INSERT INTO `sys_busifun` VALUES ('02-video', '视频', '视频功能');
INSERT INTO `sys_busifun` VALUES ('03-intertalk', '对讲', '对讲功能');
INSERT INTO `sys_busifun` VALUES ('04-im', '消息', '即时消息功能');
INSERT INTO `sys_busifun` VALUES ('05-log', '日志', '日志功能');
INSERT INTO `sys_busifun` VALUES ('06-notice', '通知', '通知公告功能');
INSERT INTO `sys_busifun` VALUES ('07-task', '任务', '任务功能');
INSERT INTO `sys_busifun` VALUES ('08-inspect', '巡检', '巡检功能');
INSERT INTO `sys_busifun` VALUES ('09-attence', '考勤', '考勤功能');
