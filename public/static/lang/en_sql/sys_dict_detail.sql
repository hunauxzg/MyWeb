/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:07:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_dict_detail
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_detail`;
CREATE TABLE `sys_dict_detail` (
  `DICT_CODE` varchar(32) NOT NULL COMMENT '字典编码',
  `ITEM_CODE` varchar(32) NOT NULL COMMENT '数据编码',
  `ITEM_NAME` varchar(128) NOT NULL COMMENT '数据名称',
  `PARENT_CODE` varchar(32) DEFAULT NULL COMMENT '父级编码',
  `FULL_CODE` varchar(512) DEFAULT NULL COMMENT '全路径编码',
  `BGCOLOR` varchar(32) DEFAULT NULL COMMENT '背景色',
  `STATUS` varchar(32) NOT NULL COMMENT '状态:有效、无效等',
  `SORTNO` int(11) DEFAULT '0' COMMENT '排序号',
  `VERSION` int(11) DEFAULT NULL COMMENT '版本号:数据版本号，用于并发控制，初始为0，每更新一次自动加1。',
  `CREATOR` varchar(32) DEFAULT NULL COMMENT '创建人',
  `CREATE_DATE` varchar(19) DEFAULT NULL COMMENT '创建时间',
  `UPDATOR` varchar(32) DEFAULT NULL COMMENT '修改人',
  `UPDATE_DATE` varchar(19) DEFAULT NULL COMMENT '修改时间',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`ITEM_CODE`,`DICT_CODE`),
  KEY `FK_Reference_11` (`DICT_CODE`) USING BTREE,
  CONSTRAINT `sys_dict_detail_ibfk_1` FOREIGN KEY (`DICT_CODE`) REFERENCES `sys_dict` (`DICT_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='数据字典明细表';

-- ----------------------------
-- Records of sys_dict_detail
-- ----------------------------
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#333333', 'Black', null, '#333333', null, '1', '10', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#496999', 'Blue', null, '#496999', null, '1', '6', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#49714A', 'Dark green', null, '#49714A', null, '1', '4', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#77ABCF', 'Light blue', null, '#77ABCF', null, '1', '5', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#7A6854', 'brown', null, '#7A6854', null, '1', '8', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#7F7F7F', 'gray', null, '#7F7F7F', null, '1', '9', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#8AB66D', 'Light green', null, '#8AB66D', null, '1', '3', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#9E6B99', 'purple', null, '#9E6B99', null, '1', '7', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#C84E4E', 'red', null, '#C84E4E', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#D79750', 'orange', null, '#D79750', null, '1', '1', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#EACF59', 'yellow', null, '#EACF59', null, '1', '2', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', '-', 'No', null, '-', '', '1', '0', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-01 16:33:24', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '0', 'No Business', null, '0', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_cate', '0', 'Not collection', '', '0', '', '1', '0', '0', 'admin', '2018-10-12 14:24:01', 'admin', '2018-10-12 14:24:01', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '0', 'Personal level', null, '0', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ishave', '0', 'No', null, '0', '#C84E4E', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_status', '0', 'Invalid', '', '0', '#C84E4E', '1', '0', '1', 'admin', '2018-04-28 09:45:34', 'admin', '2018-04-28 09:46:01', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '0', 'No', null, '0', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '0', 'Not published', '', '0', '#8AB66D', '1', '0', '4', 'admin', '2018-04-13 09:37:49', 'admin', '2018-04-13 09:49:21', '');
INSERT INTO `sys_dict_detail` VALUES ('org_type', '0', 'Trial units', null, '0', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '0', 'Province / City', '', '0', '', '1', '0', '1', 'admin', '2018-10-15 09:26:35', 'admin', '2018-10-15 09:26:59', '');
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '0', 'All personnel', '', '0', '#C84E4E', '1', '0', '1', 'admin', '2018-04-13 09:39:21', 'admin', '2018-04-13 09:49:34', '');
INSERT INTO `sys_dict_detail` VALUES ('sex', '0', 'Unknown sex', null, '0', '', '1', '0', '11', 'admin', '2017-09-11 16:47:00', 'admin', '2017-12-04 19:00:05', '');
INSERT INTO `sys_dict_detail` VALUES ('status', '0', 'Invalid', null, '0', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '0', 'Pending review', '', '0', '', '1', '0', '0', 'admin', '2018-03-23 13:46:41', 'admin', '2018-03-23 13:46:41', null);
INSERT INTO `sys_dict_detail` VALUES ('yesorno', '0', 'Whether', null, '0', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '0-comm', 'Settings', null, '0-comm', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '00', 'Not received', '', '00', '#D79750', '1', '0', '0', 'admin', '2018-08-13 11:32:48', 'admin', '2018-08-13 11:32:48', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '00', 'Temporary storage', '', '00', '#77ABCF', '1', '0', '1', 'admin', '2018-08-13 11:30:04', 'admin', '2018-08-13 11:31:19', '');
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '00', 'No patrol', '', '00', '', '1', '0', '0', 'admin', '2018-06-05 14:41:05', 'admin', '2018-06-05 14:41:05', null);
INSERT INTO `sys_dict_detail` VALUES ('per_cate', '00', 'Assisted', '', '00', '', '1', '0', '0', 'admin', '2018-06-21 09:59:37', 'admin', '2018-06-21 09:59:37', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '00', 'Temporary storage', '', '00', '', '1', '0', '0', 'admin', '2017-12-22 09:56:11', 'admin', '2017-12-22 09:56:11', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '01', 'has been received', '', '01', '#8AB66D', '1', '1', '0', 'admin', '2018-08-13 11:33:04', 'admin', '2018-08-13 11:33:04', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '01', 'Has escalated', '', '01', '#D79750', '1', '1', '1', 'admin', '2018-08-13 11:30:22', 'admin', '2018-08-13 11:31:40', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '01', 'General dispatchers', null, '01', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '01', 'In Patrol', '', '01', '', '1', '1', '0', 'admin', '2018-06-05 14:41:31', 'admin', '2018-06-05 14:41:31', null);
INSERT INTO `sys_dict_detail` VALUES ('per_cate', '01', 'Main', '', '01', '', '1', '1', '0', 'admin', '2018-06-21 09:59:48', 'admin', '2018-06-21 09:59:48', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '01', 'Father', '', '01', '', '1', '1', '0', 'admin', '2018-03-23 13:52:41', 'admin', '2018-03-23 13:52:41', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '01', 'Road construction', '', '01', '', '1', '0', '1', 'admin', '2018-01-02 14:31:49', 'admin', '2018-01-02 14:35:00', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '01', 'Has escalated', '', '01', '#D79750', '1', '0', '0', 'admin', '2018-01-02 14:33:24', 'admin', '2018-01-02 14:33:24', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '01', 'has been published', '', '01', '', '1', '0', '0', 'admin', '2017-12-22 09:56:24', 'admin', '2017-12-22 09:56:24', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '02', 'has been rejected', '', '02', '#C84E4E', '1', '2', '0', 'admin', '2018-08-13 11:33:24', 'admin', '2018-08-13 11:33:24', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '02', 'The police are already in place', '', '02', '#C84E4E', '1', '2', '1', 'admin', '2018-08-13 11:30:39', 'admin', '2018-08-13 11:31:50', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '02', 'Underlying communications', null, '02', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '02', 'Stop Patrol', '', '02', '', '1', '2', '0', 'admin', '2018-06-05 14:41:56', 'admin', '2018-06-05 14:41:56', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '02', 'Mother', '', '02', '', '1', '2', '0', 'admin', '2018-03-23 13:52:56', 'admin', '2018-03-23 13:52:56', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '02', 'Line failure', '', '02', '', '1', '0', '0', 'admin', '2018-01-02 14:35:26', 'admin', '2018-01-02 14:35:26', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '02', 'In process', '', '02', '#496999', '1', '0', '0', 'admin', '2018-01-02 14:33:48', 'admin', '2018-01-02 14:33:48', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '02', 'has been received', '', '02', '', '1', '0', '0', 'admin', '2017-12-22 09:56:47', 'admin', '2017-12-22 09:56:47', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '03', 'has been disposed', '', '03', '#8AB66D', '1', '3', '1', 'admin', '2018-08-13 11:30:56', 'admin', '2018-08-13 11:32:00', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '03', 'Platform Management', null, '03', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '03', 'Stop Patrol', '', '03', '', '1', '3', '0', 'admin', '2018-06-05 14:42:39', 'admin', '2018-06-05 14:42:39', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '03', 'Spouse', '', '03', '', '1', '3', '0', 'admin', '2018-03-23 13:53:10', 'admin', '2018-03-23 13:53:10', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '03', 'Equipment damage', '', '03', '', '1', '0', '1', 'admin', '2018-01-02 14:32:04', 'admin', '2018-01-02 14:35:09', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '03', 'has been resolved', '', '03', '#49714A', '1', '0', '0', 'admin', '2018-01-02 14:34:12', 'admin', '2018-01-02 14:34:12', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '03', 'Have feedback', '', '03', '', '1', '0', '0', 'admin', '2017-12-22 10:02:45', 'admin', '2017-12-22 10:02:45', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '04', 'Business Management', null, '04', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '04', 'Patrol checked', '', '04', '', '1', '4', '0', 'admin', '2018-06-05 14:43:01', 'admin', '2018-06-05 14:43:01', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '04', 'Brother', '', '04', '', '1', '4', '0', 'admin', '2018-03-23 13:53:26', 'admin', '2018-03-23 13:53:26', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '04', 'has been undone', '', '04', '#C84E4E', '1', '0', '0', 'admin', '2018-01-02 14:34:32', 'admin', '2018-01-02 14:34:32', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '04', 'has been archived', '', '04', '', '1', '0', '0', 'admin', '2017-12-22 10:07:38', 'admin', '2017-12-22 10:07:38', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '05', 'Command and Dispatch', null, '05', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '05', 'Sisters', '', '05', '', '1', '5', '0', 'admin', '2018-03-23 13:53:41', 'admin', '2018-03-23 13:53:41', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '05', 'has been evaluated', '', '05', '', '1', '0', '0', 'admin', '2017-12-22 10:07:58', 'admin', '2017-12-22 10:07:58', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '06', 'Decision analysis', null, '06', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '06', 'Relatives', '', '06', '', '1', '6', '1', 'admin', '2018-03-23 13:54:12', 'admin', '2018-03-23 13:54:51', '');
INSERT INTO `sys_dict_detail` VALUES ('task_status', '06', 'has been rejected', '', '06', '', '1', '0', '0', 'admin', '2017-12-22 10:08:27', 'admin', '2017-12-22 10:08:27', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '07', 'Colleagues', '', '07', '', '1', '7', '0', 'admin', '2018-03-23 13:54:41', 'admin', '2018-03-23 13:54:41', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '07', 'Return to punished severely', '', '07', '', '1', '0', '0', 'admin', '2017-12-22 10:08:57', 'admin', '2017-12-22 10:08:57', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '08', 'Friends', '', '08', '', '1', '8', '0', 'admin', '2018-03-23 13:55:02', 'admin', '2018-03-23 13:55:02', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '09', 'Other', '', '09', '', '1', '9', '0', 'admin', '2018-03-23 13:55:12', 'admin', '2018-03-23 13:55:12', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '09', 'has been undone', '', '09', '', '1', '0', '0', 'admin', '2017-12-22 10:09:19', 'admin', '2017-12-22 10:09:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_ot', '1', 'The Lord called', null, '1', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_cate', '1', 'Already collected', '', '1', '', '1', '1', '0', 'admin', '2018-10-12 14:24:18', 'admin', '2018-10-12 14:24:18', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '1', 'Group level', null, '1', '#EACF59', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '1', 'Standard SIP Terminal', null, '1', '', '1', '5', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:22:35', '');
INSERT INTO `sys_dict_detail` VALUES ('grp_member_Type', '1', 'Personnel', null, '1', '#8AB66D', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ishave', '1', 'Yes', null, '1', '#8AB66D', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_status', '1', 'Effective', '', '1', '#8AB66D', '1', '1', '0', 'admin', '2018-04-28 09:45:52', 'admin', '2018-04-28 09:45:52', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '1', 'Only text', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '1', 'has been published', '', '1', '#C84E4E', '1', '1', '3', 'admin', '2018-04-13 09:38:07', 'admin', '2018-04-13 09:48:50', '');
INSERT INTO `sys_dict_detail` VALUES ('org_type', '1', 'Official unit', null, '1', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '1', 'District / county', '', '1', '', '1', '1', '0', 'admin', '2018-10-15 09:26:50', 'admin', '2018-10-15 09:26:50', null);
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '1', 'This unit', '', '1', '#D79750', '1', '1', '1', 'admin', '2018-04-13 09:39:34', 'admin', '2018-04-13 09:49:57', '');
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '1', 'First Level', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '1', 'Man', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('status', '1', 'Effective', null, '1', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '1', 'Has passed', '', '1', '', '1', '1', '0', 'admin', '2018-03-23 13:46:57', 'admin', '2018-03-23 13:46:57', null);
INSERT INTO `sys_dict_detail` VALUES ('yesorno', '1', 'Yes', null, '1', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '1-map', 'Map settings', null, '1-map', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '10', '10', '', '10', '', '1', '1', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '100', 'Dahua Platform', '', '100', '', '1', '100', '0', 'admin', '2018-05-23 17:20:15', 'admin', '2018-05-23 17:20:15', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '101', 'Bitwin', '', '101', '', '1', '101', '0', 'admin', '2018-05-23 17:20:34', 'admin', '2018-05-23 17:20:34', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '101', 'National duty', '', '101', '', '1', '0', '0', 'admin', '2018-10-12 14:25:14', 'admin', '2018-10-12 14:25:14', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '102', 'National Deputy', '', '102', '', '1', '1', '0', 'admin', '2018-10-12 14:25:42', 'admin', '2018-10-12 14:25:42', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '110KV', '110KV', '', '110KV', '#EACF59', '1', '1', '1', 'admin', '2018-04-28 09:44:22', 'admin', '2018-04-28 09:46:38', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '111', 'Provincial and ministerial duty', '', '111', '', '1', '2', '0', 'admin', '2018-10-12 14:26:10', 'admin', '2018-10-12 14:26:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '112', 'Provincial and ministerial Deputy', '', '112', '', '1', '3', '0', 'admin', '2018-10-12 14:26:24', 'admin', '2018-10-12 14:26:24', null);
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '1200', '1200', '', '1200', '', '1', '2', '0', 'admin', '2018-04-04 09:41:38', 'admin', '2018-04-04 09:41:38', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '121', 'Office level', '', '121', '', '1', '4', '0', 'admin', '2018-10-12 14:26:45', 'admin', '2018-10-12 14:26:45', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '122', 'Deputy director of Bureau', '', '122', '', '1', '5', '0', 'admin', '2018-10-12 14:26:59', 'admin', '2018-10-12 14:26:59', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '128', 'Multiple business', null, '128', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '1280*720', '720x1280x1200kbps', '', '1280*720', '', '1', '5', '2', 'admin', '2018-04-03 19:39:36', 'admin', '2018-04-17 14:15:29', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '131', 'County level duty', '', '131', '', '1', '6', '0', 'admin', '2018-10-12 14:27:35', 'admin', '2018-10-12 14:27:35', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '132', 'County level Deputy', '', '132', '', '1', '7', '0', 'admin', '2018-10-12 14:27:51', 'admin', '2018-10-12 14:27:51', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '141', 'Township level duty', '', '141', '', '1', '8', '0', 'admin', '2018-10-12 14:28:22', 'admin', '2018-10-12 14:28:22', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '142', 'Township level Deputy', '', '142', '', '1', '9', '0', 'admin', '2018-10-12 14:28:36', 'admin', '2018-10-12 14:28:36', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '15', '15', '', '15', '', '1', '2', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '150', 'Staff level', '', '150', '', '1', '10', '0', 'admin', '2018-10-12 14:29:18', 'admin', '2018-10-12 14:29:18', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '16', 'Basic two-party call', null, '16', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '160', 'Clerical level', '', '160', '', '1', '11', '0', 'admin', '2018-10-12 14:29:48', 'admin', '2018-10-12 14:29:48', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '17', 'Meeting', null, '17', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '17', 'Meeting Format SMS', null, '17', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '18', 'Meeting Party participants', null, '18', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '18', 'Group Call Voice Message', null, '18', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '19', 'Strong plug', null, '19', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '19', 'Conference recording', null, '19', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '1920*1080', '1080x1920x2200kbps', '', '1920*1080', '', '1', '6', '2', 'admin', '2018-04-03 19:39:49', 'admin', '2018-04-17 14:16:04', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '199', 'Undecided civil servant', '', '199', '', '1', '12', '0', 'admin', '2018-10-12 14:30:19', 'admin', '2018-10-12 14:30:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_ot', '2', 'be called', null, '2', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '2', 'Unit level', null, '2', '#D79750', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '2', 'Extended SIP Interface Terminal', null, '2', '', '1', '6', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:24:46', '');
INSERT INTO `sys_dict_detail` VALUES ('grp_member_Type', '2', 'Group', null, '2', '#C84E4E', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '2', 'GPS location Information', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '2', 'has been undone', '', '2', '#D79750', '1', '2', '2', 'admin', '2018-04-13 09:38:33', 'admin', '2018-04-13 09:48:57', '');
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '2', 'Township / town', '', '2', '', '1', '2', '0', 'admin', '2018-10-15 09:27:17', 'admin', '2018-10-15 09:27:17', null);
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '2', 'Selected persons', '', '2', '#77ABCF', '1', '2', '1', 'admin', '2018-04-13 09:39:47', 'admin', '2018-04-13 09:50:05', '');
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '2', 'Second Level', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '2', 'Woman', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '2', 'has been rejected', '', '2', '', '1', '2', '0', 'admin', '2018-03-23 13:47:12', 'admin', '2018-03-23 13:47:12', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '2-busi', 'Business settings', null, '2-busi', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '20', '20', '', '20', '', '1', '3', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '20', 'Strong demolition', null, '20', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '200', 'PC', null, '200', '#9E6B99', '1', null, '1', 'admin', '2018-03-22 14:58:16', 'admin', '2018-03-22 14:58:16', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '201', 'Smart phones', null, '201', '#145385', '1', null, '10', 'admin', '2018-03-22 14:49:59', 'admin', '2018-03-22 14:49:59', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '202', 'No screen machine', null, '202', '#145385', '1', null, '0', 'admin', '2018-03-22 14:50:42', 'admin', '2018-03-22 14:50:42', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '203', 'Small screen Machine', null, '203', '#145385', '1', null, '0', 'admin', '2018-03-22 14:51:29', 'admin', '2018-03-22 14:51:29', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '204', 'IP Phone', null, '204', '#D18315', '1', null, '0', 'admin', '2018-03-22 14:51:53', 'admin', '2018-03-22 14:51:53', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '205', 'IP Visual Phone', null, '205', '#D18315', '1', null, '0', 'admin', '2018-03-22 14:52:15', 'admin', '2018-03-22 14:52:15', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '206', 'have been supervised ball', null, '206', '#006100', '1', null, '0', 'admin', '2018-03-22 14:52:39', 'admin', '2018-03-22 14:52:39', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '207', 'Gimbal Monitoring Head', null, '207', '#006100', '1', null, '0', 'admin', '2018-03-22 14:53:19', 'admin', '2018-03-22 14:53:19', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '208', 'Monitoring Head', null, '208', '#006100', '1', null, '0', 'admin', '2018-03-22 14:53:47', 'admin', '2018-03-22 14:53:47', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '209', 'GPS Locator', null, '209', '#77ABCF', '1', null, '0', 'admin', '2018-03-22 14:54:20', 'admin', '2018-03-22 14:54:20', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '21', 'Monitoring Downloads', null, '21', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '210', 'Ordinary Car station', null, '210', '#A01A1A', '1', null, '0', 'admin', '2018-03-22 14:55:03', 'admin', '2018-03-22 14:55:03', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '211', 'company employee', '', '211', '', '1', '13', '0', 'admin', '2018-10-12 14:33:11', 'admin', '2018-10-12 14:33:11', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '211', 'Video Car Station', null, '211', '#A01A1A', '1', null, '2', 'admin', '2018-03-22 14:55:58', 'admin', '2018-03-22 14:55:58', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '213', 'voip gateway', null, '213', null, '1', null, '0', 'admin', '2018-10-12 16:45:19', 'admin', '2018-10-12 16:45:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '22', 'Monitoring uploads', null, '22', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '220KV', '220KV', '', '220KV', '#D79750', '1', '2', '1', 'admin', '2018-04-28 09:44:44', 'admin', '2018-04-28 09:46:43', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '23', 'Storage instructions', null, '23', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '25', '25', '', '25', '', '1', '4', '0', 'admin', '2018-04-04 09:41:50', 'admin', '2018-04-04 09:41:50', '');
INSERT INTO `sys_dict_detail` VALUES ('data_right', '3', 'All', null, '3', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '3', 'Image', null, '3', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '3', 'Third Level', null, '3', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '3-per', 'Setting', null, '3-per', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '30', '30', '', '30', '', '1', '5', '0', 'admin', '2018-04-03 19:45:47', 'admin', '2018-04-03 19:45:47', '');
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '300', '300', '', '300', '', '1', '0', '0', 'admin', '2018-04-03 19:45:15', 'admin', '2018-04-03 19:45:15', '');
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '3000', '3000', '', '3000', '', '1', '1', '0', 'admin', '2018-04-03 19:45:25', 'admin', '2018-04-03 19:45:25', '');
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '320*240', '240x320x300kbps', '', '320*240', '', '1', '1', '1', 'admin', '2018-04-03 19:38:44', 'admin', '2018-04-17 14:12:55', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330000', 'Zhejiang Province', null, '330000', '', '1', '0', '4', 'admin', '2017-11-07 15:07:38', 'admin', '2018-03-22 14:29:17', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330100', 'Hangzhou City', '330000', '330000/330100', '', '1', '0', '4', 'admin', '2017-11-07 15:08:03', 'admin', '2017-11-08 15:56:35', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330102', 'Shangcheng District', '330100', '330000/330100/330102', '', '1', '0', '0', 'admin', '2017-11-08 15:58:27', 'admin', '2017-11-08 15:58:27', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330103', 'Xiacheng District', '330100', '330000/330100/330103', '', '1', '0', '0', 'admin', '2017-11-08 16:01:50', 'admin', '2017-11-08 16:01:50', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330104', 'Jianggan District', '330100', '330000/330100/330104', '', '1', '0', '0', 'admin', '2017-11-08 16:02:13', 'admin', '2017-11-08 16:02:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330105', 'Gongshu District', '330100', '330000/330100/330105', '', '1', '0', '0', 'admin', '2017-11-08 16:23:55', 'admin', '2017-11-08 16:23:55', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330106', 'Xihu District', '330100', '330000/330100/330106', '', '1', '0', '0', 'admin', '2017-11-08 16:24:13', 'admin', '2017-11-08 16:24:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330108', 'Bingjiang District', '330100', '330000/330100/330108', '', '1', '0', '0', 'admin', '2017-11-08 16:25:05', 'admin', '2017-11-08 16:25:05', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330109', 'Xiaoshan District', '330100', '330000/330100/330109', '', '1', '0', '0', 'admin', '2017-11-08 16:25:26', 'admin', '2017-11-08 16:25:26', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330110', 'Yuhang District', '330100', '330000/330100/330110', '', '1', '0', '0', 'admin', '2017-11-08 16:25:46', 'admin', '2017-11-08 16:25:46', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330111', 'Fuyang District', '330100', '330000/330100/330111', '', '1', '0', '0', 'admin', '2017-11-08 16:26:08', 'admin', '2017-11-08 16:26:08', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330122', 'Tonglu County', '330100', '330000/330100/330122', '', '1', '0', '0', 'admin', '2017-11-08 16:26:36', 'admin', '2017-11-08 16:26:36', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330127', 'Chunan County', '330100', '330000/330100/330127', '', '1', '0', '0', 'admin', '2017-11-08 16:26:54', 'admin', '2017-11-08 16:26:54', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330182', 'Jiande City', '330100', '330000/330100/330182', '', '1', '0', '0', 'admin', '2017-11-08 16:27:13', 'admin', '2017-11-08 16:27:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330185', 'Linan City', '330100', '330000/330100/330185', '', '1', '0', '0', 'admin', '2017-11-08 16:27:35', 'admin', '2017-11-08 16:27:35', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330200', 'Ningbo City', '330000', '330000/330200', '', '1', '0', '2', 'admin', '2017-11-08 16:29:16', 'admin', '2018-03-22 14:36:05', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330203', 'Haishu District', '330200', '330000/330200/330203', '', '1', '0', '0', 'admin', '2017-11-08 16:29:40', 'admin', '2017-11-08 16:29:40', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330204', 'Jiangdong District', '330200', '330000/330200/330204', '', '1', '0', '0', 'admin', '2017-11-08 16:30:00', 'admin', '2017-11-08 16:30:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '35KV', '35KV', '', '35KV', '#8AB66D', '1', '0', '1', 'admin', '2018-04-28 09:44:04', 'admin', '2018-04-28 09:46:30', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '4', 'Voice files', null, '4', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '4', 'Fourth Level', null, '4', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '4-other', 'Other settings', null, '4-other', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '410', 'senior', '', '410', '', '1', '14', '0', 'admin', '2018-10-12 14:33:42', 'admin', '2018-10-12 14:33:42', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '411', 'Positive advanced', '', '411', '', '1', '15', '0', 'admin', '2018-10-12 14:34:10', 'admin', '2018-10-12 14:34:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '412', 'Deputy senior', '', '412', '', '1', '16', '0', 'admin', '2018-10-12 14:34:32', 'admin', '2018-10-12 14:34:32', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '420', 'intermediate', '', '420', '', '1', '17', '0', 'admin', '2018-10-12 14:34:51', 'admin', '2018-10-12 14:34:51', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '430', 'primary', '', '430', '', '1', '18', '0', 'admin', '2018-10-12 14:35:10', 'admin', '2018-10-12 14:35:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '434', 'Assistant level', '', '434', '', '1', '19', '0', 'admin', '2018-10-12 14:35:37', 'admin', '2018-10-12 14:35:37', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '435', 'Member level', '', '435', '', '1', '20', '0', 'admin', '2018-10-12 14:35:58', 'admin', '2018-10-12 14:35:58', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '499', 'Undetermined professional and technical personnel', '', '499', '', '1', '21', '0', 'admin', '2018-10-12 14:36:26', 'admin', '2018-10-12 14:36:26', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '5', '5', '', '5', '', '1', '0', '0', 'admin', '2018-04-03 19:45:39', 'admin', '2018-04-03 19:45:39', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '5', 'Video recording files', null, '5', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '5', 'Fifth Level', null, '5', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '5', 'Women change (change) to Male', null, '5', '', '1', '0', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-07 16:59:33', '');
INSERT INTO `sys_dict_detail` VALUES ('l_type', '500KV', '500KV', '', '500KV', '#C84E4E', '1', '3', '1', 'admin', '2018-04-28 09:44:58', 'admin', '2018-04-28 09:46:49', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '6', 'Arbitrary file', null, '6', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '6', 'Sixth Level', null, '6', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '6', 'Male change (change) to female', null, '6', '', '1', '0', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-07 17:20:44', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '64', 'Universal Tap Terminal', null, '64', '', '1', '0', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:00', '');
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '640*480', '480x640x800kbps', '', '640*480', '', '1', '2', '3', 'admin', '2018-04-03 19:38:58', 'admin', '2018-04-23 14:49:33', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '65', 'Dispatch Station', null, '65', '', '1', '1', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:17', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '66', 'Video Gateway', null, '66', '', '1', '2', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:40', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '67', 'Storage number', null, '67', '', '1', '8', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:20', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '68', 'Organization Administrator', null, '68', '', '1', '3', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:58', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '69', 'GPS function Terminal only', null, '69', '', '1', '4', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:49', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '7', 'Single-Call voice call', null, '7', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '7', 'Seventh Level', null, '7', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '70', '28181 platform or terminal', null, '70', '', '1', '7', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:02', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '8', 'Single-Call Video Call', null, '8', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '8', 'Unit', '', '8', '', '1', '8', '1', 'admin', '2018-10-15 09:27:31', 'admin', '2018-10-15 10:10:11', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '80', 'Instant messaging', null, '80', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '9', 'Group Call', null, '9', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '9', 'Other', '', '9', '', '1', '9', '0', 'admin', '2018-10-15 09:28:02', 'admin', '2018-10-15 09:28:02', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '9', 'Non-descriptive gender', null, '9', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '96', 'Anhui Create the World camera', '', '96', '', '1', '96', '0', 'admin', '2018-05-23 17:19:03', 'admin', '2018-05-23 17:19:03', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '97', 'Hoi Hong Camera', '', '97', '', '1', '97', '0', 'admin', '2018-05-23 17:19:25', 'admin', '2018-05-23 17:19:25', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '98', 'Rich Vision Security Camera', '', '98', '', '1', '98', '0', 'admin', '2018-05-23 17:19:42', 'admin', '2018-05-23 17:19:42', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '99', 'Hoi Hong Platform', '', '99', '', '1', '99', '0', 'admin', '2018-05-23 17:20:00', 'admin', '2018-05-23 17:20:00', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'Android', 'Android', null, 'Android', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'bad', 'Poor', '', 'bad', '#9E6B99', '1', '3', '2', 'admin', '2018-06-05 14:36:39', 'admin', '2018-06-05 14:40:29', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'CAN_ADD_GROUP', 'Terminal Self-built group', '', 'CAN_ADD_GROUP', '', '1', '6', '1', 'admin', '2018-03-22 11:19:44', 'admin', '2018-03-22 14:32:37', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'CAR_ID', 'Car Grade', '', 'CAR_ID', '', '1', '12', '1', 'admin', '2018-03-22 10:52:37', 'admin', '2018-03-22 14:30:25', '');
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_cate', 'Type of case', '', 'cas_cate', '', '1', '2', '1', 'admin', '2018-08-13 11:22:43', 'admin', '2018-08-13 14:15:08', '');
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_code', 'Case number', '', 'cas_code', '', '1', '0', '0', 'admin', '2018-08-13 11:21:53', 'admin', '2018-08-13 11:21:53', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_ori', 'Case Source', '', 'cas_ori', '', '1', '1', '0', 'admin', '2018-08-13 11:22:14', 'admin', '2018-08-13 11:22:14', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'chat_file', 'Chat file', null, 'chat_file', null, '1', '0', '0', 'admin', '2018-03-12 14:41:00', 'admin', '2018-03-12 14:41:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'chat_img', 'Chat pictures', null, 'chat_img', null, '1', '0', '0', 'admin', '2018-03-12 14:41:00', 'admin', '2018-03-12 14:41:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'COMP', 'Unit', null, 'COMP', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'day', 'Days', '', 'day', '', '1', '0', '0', 'admin', '2018-06-05 14:43:40', 'admin', '2018-06-05 14:43:40', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'DEPT_NUM', 'Department', '', 'DEPT_NUM', '', '1', '2', '1', 'admin', '2018-03-22 10:26:02', 'admin', '2018-03-22 14:30:34', '');
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'device_cate', 'Type of equipment', null, 'device_cate', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'ERROR', 'Error', null, 'ERROR', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'excellent', 'Excellent', '', 'excellent', '#C84E4E', '1', '0', '1', 'admin', '2018-06-05 14:35:43', 'admin', '2018-06-05 14:37:45', '');
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'FAIL', 'Failed', null, 'FAIL', '#EACF59', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'FRAME', 'Frame rate', '', 'FRAME', '', '1', '2', '1', 'admin', '2018-03-22 11:00:27', 'admin', '2018-03-22 14:31:56', '');
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'general', 'So so', '', 'general', '#496999', '1', '2', '2', 'admin', '2018-06-05 14:36:22', 'admin', '2018-06-05 14:40:19', '');
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'good', 'Good', '', 'good', '#8AB66D', '1', '1', '3', 'admin', '2018-06-05 14:36:00', 'admin', '2018-06-05 14:40:10', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'GPS_INFO', 'Location information', '', 'GPS_INFO', '', '1', '8', '1', 'admin', '2018-03-22 10:29:58', 'admin', '2018-03-22 14:31:18', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'GPS_REPORT_FREQ', 'GPS escalation Frequency', '', 'GPS_REPORT_FREQ', '', '1', '10', '0', 'admin', '2018-05-24 10:35:37', 'admin', '2018-05-24 10:35:37', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'GPS_REPORT_ONOFF', 'GPS Switch', '', 'GPS_REPORT_ONOFF', '', '1', '11', '0', 'admin', '2018-05-24 10:38:02', 'admin', '2018-05-24 10:38:02', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'GPS_TIME', 'Location upload Time', '', 'GPS_TIME', '', '1', '9', '1', 'admin', '2018-03-22 10:30:19', 'admin', '2018-03-22 14:31:25', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'ID', 'Id', '', 'ID', '', '1', '6', '1', 'admin', '2018-03-22 10:28:01', 'admin', '2018-03-22 14:31:04', '');
INSERT INTO `sys_dict_detail` VALUES ('ef_type', 'in', 'Enter alarm', null, 'in', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('inter_calltype', 'IN', 'is called', null, 'IN', '#9E6B99', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'INIT_GPS', 'Initial position', '', 'INIT_GPS', '', '1', '4', '1', 'admin', '2018-03-22 11:05:24', 'admin', '2018-03-22 14:32:24', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_origin', 'inspection', 'inspection', '', 'inspection', '#49714A', '1', '0', '0', 'admin', '2018-01-02 14:32:53', 'admin', '2018-01-02 14:32:53', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'ios', 'ios', null, 'ios', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'label_icon', 'Callout icon', '', 'label_icon', '', '1', '0', '0', 'admin', '2018-01-08 17:20:02', 'admin', '2018-01-08 17:20:02', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'linux', 'linux', null, 'linux', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'menu', 'Menu', null, 'menu', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'menu_group', 'Menu Group', null, 'menu_group', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'month', 'Month', '', 'month', '', '1', '2', '0', 'admin', '2018-06-05 14:44:05', 'admin', '2018-06-05 14:44:05', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'OFFLINE_TIME', 'Offline time', '', 'OFFLINE_TIME', '', '1', '10', '1', 'admin', '2018-03-22 10:30:54', 'admin', '2018-03-22 14:30:11', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'OFFLINE_TRANS_INTERTEL', 'Offline Transfer of intranet phone', '', 'OFFLINE_TRANS_INTERTEL', '', '1', '8', '1', 'admin', '2018-03-22 11:21:27', 'admin', '2018-03-22 14:32:51', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'OFFLINE_TRANS_OUTTEL', 'Offline transfer of external network telephone', '', 'OFFLINE_TRANS_OUTTEL', '', '1', '9', '1', 'admin', '2018-03-22 11:21:59', 'admin', '2018-03-22 14:32:58', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'OTHER', 'Manufacturers', '', 'OTHER', '', '1', '11', '2', 'admin', '2018-03-22 10:52:10', 'admin', '2018-03-22 14:30:18', '');
INSERT INTO `sys_dict_detail` VALUES ('ef_type', 'out', 'Leave the alarm.', null, 'out', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('inter_calltype', 'OUT', 'Call', null, 'OUT', '#496999', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'page_element', 'Elements within a page', null, 'page_element', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'PER', 'Personal', null, 'PER', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'per_headicon', 'White List persons avatar', null, 'per_headicon', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'PRIORITY', 'Priority level', '', 'PRIORITY', '', '1', '7', '1', 'admin', '2018-03-22 10:28:57', 'admin', '2018-03-22 14:31:11', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'season', 'Quarter', '', 'season', '', '1', '3', '0', 'admin', '2018-06-05 14:45:11', 'admin', '2018-06-05 14:45:11', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'SOS_ONOFF', 'SOS Switch', '', 'SOS_ONOFF', '', '1', '12', '0', 'admin', '2018-05-24 10:38:36', 'admin', '2018-05-24 10:38:36', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'SSCALL', 'Simplex single call', '', 'SSCALL', '', '1', '5', '1', 'admin', '2018-03-22 11:06:06', 'admin', '2018-03-22 14:32:31', '');
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'SUCCESS', 'Success', null, 'SUCCESS', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'SYS', 'System', null, 'SYS', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'system', 'System', null, 'sys', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'system_icon', 'System icon', null, 'system_icon', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_origin', 'task', 'Task', '', 'task', '#C84E4E', '1', '0', '0', 'admin', '2018-01-02 14:32:31', 'admin', '2018-01-02 14:32:31', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'task_attach', 'Task Attachments', null, 'task_attach', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'TEL', 'Cell phone', '', 'TEL', '', '1', '5', '1', 'admin', '2018-03-22 10:27:23', 'admin', '2018-03-22 14:30:57', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'TITLE', 'Duties', '', 'TITLE', '', '1', '3', '1', 'admin', '2018-03-22 10:26:26', 'admin', '2018-03-22 14:30:42', '');
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'unix', 'unix', null, 'unix', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VBR', 'Code rate', '', 'VBR', '', '1', '3', '1', 'admin', '2018-03-22 11:04:35', 'admin', '2018-03-22 14:32:18', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VGA', 'Video resolution', '', 'VGA', '', '1', '1', '1', 'admin', '2018-03-22 10:59:01', 'admin', '2018-03-22 14:31:48', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VIDEO_UPLOAD_SOUND', 'Video Upload Audio', '', 'VIDEO_UPLOAD_SOUND', '', '1', '7', '1', 'admin', '2018-03-22 11:20:27', 'admin', '2018-03-22 14:32:45', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'week', 'Week', '', 'week', '', '1', '1', '0', 'admin', '2018-06-05 14:43:50', 'admin', '2018-06-05 14:43:50', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'windows', 'windows', null, 'windows', '', '1', '0', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-06-26 18:58:10', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'WORK_ID', 'Badge', '', 'WORK_ID', '', '1', '4', '1', 'admin', '2018-03-22 10:27:02', 'admin', '2018-03-22 14:30:50', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'WORK_UNIT', 'Unit', '', 'WORK_UNIT', '', '1', '1', '1', 'admin', '2018-03-22 10:25:03', 'admin', '2018-03-22 14:30:00', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'year', 'Years', '', 'year', '', '1', '4', '0', 'admin', '2018-06-05 14:45:24', 'admin', '2018-06-05 14:45:24', null);
