/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:07:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_dict
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict`;
CREATE TABLE `sys_dict` (
  `DICT_CODE` varchar(32) NOT NULL COMMENT '字典编码',
  `DICT_NAME` varchar(32) NOT NULL COMMENT '字典名称',
  `DICT_CATE` varchar(32) DEFAULT NULL COMMENT '字典类别:数据字典定义',
  `IS_TREE` varchar(32) DEFAULT NULL COMMENT '是否树形',
  `IS_SYS` varchar(32) DEFAULT '0' COMMENT '是否内置:0否，1是，内置的数据字典内容不允许修改。',
  `IS_VALID` varchar(32) DEFAULT NULL COMMENT '是否有效',
  `SORTNO` int(11) DEFAULT NULL COMMENT '排序号',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`DICT_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='数据字典表';

-- ----------------------------
-- Records of sys_dict
-- ----------------------------
INSERT INTO `sys_dict` VALUES ('admin_area', 'administrative area', '01', '1', '0', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('app_bitrate', 'Code rate', '05', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('app_framerate', 'Frame rate', '05', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('app_resolution', 'Resolution', '05', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('att_cate', 'Attachment category', '01', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('bgcolor', 'Background color', '03', '0', '1', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('call_ot', 'The Lord is called identity', '03', '0', '1', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('call_srvtype', 'Type of Business', '03', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('cam_type', 'Camera type', '02', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('cas_recstatus', 'Case Receive Status', '04', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('cas_setcate', 'Case set Category', '04', '0', '0', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('cas_status', 'Case status', '04', '0', '0', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('con_cate', 'Category of personnel', '03', '0', '1', '1', '19', null);
INSERT INTO `sys_dict` VALUES ('con_duty', 'Staff position', '03', '0', '0', '1', '18', null);
INSERT INTO `sys_dict` VALUES ('cyc_unit', 'Cycle units', '04', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('data_right', 'Data permissions', '03', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('device_cate', 'Type of equipment', '02', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('device_type', 'Device type', '02', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('dict_cate', 'Dictionary category', '01', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('ef_type', 'Electronic fence Type', '02', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('fn_type', 'function type', '03', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('grp_member_Type', 'Group member Type', '03', '0', '1', '1', '13', null);
INSERT INTO `sys_dict` VALUES ('ins_status', 'Patrol status', '04', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('inter_calltype', 'Invocation mode', '03', '0', '1', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('ishave', 'There is no', '01', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('l_status', 'Line status', '04', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('l_type', 'Line type', '04', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('media_type', 'Media type', '03', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('note_status', 'Announcement Status', '05', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('oper_system', 'Operating system', '03', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('org_type', 'Unit type', '03', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('para_cate', 'Parameter categories', '03', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('para_type', 'Parameter classification', '03', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('pbcate', 'Directory directory', '03', '0', '1', '1', '20', null);
INSERT INTO `sys_dict` VALUES ('per_cate', 'Type of personnel', '04', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('per_relate', 'Personnel relations', '03', '0', '1', '1', '17', null);
INSERT INTO `sys_dict` VALUES ('per_selrange', 'Personnel scope', '05', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('prb_cate', 'Type of problem', '04', '0', '0', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('prb_origin', 'Source of the problem', '04', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('prb_status', 'Problem status', '04', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('priority_level', 'Priority level', '02', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('set_field', 'Terminal Settings Properties', '03', '0', '1', '1', '15', null);
INSERT INTO `sys_dict` VALUES ('sex', 'Gender', '01', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('status', 'Valid state', '01', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('succ_flag', 'Success Sign', '03', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('task_status', 'Task status', '04', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('tsk_eval', 'Evaluation level', '04', '0', '1', '1', '3', '');
INSERT INTO `sys_dict` VALUES ('view_field', 'Terminal Display Properties', '03', '0', '1', '1', '14', null);
INSERT INTO `sys_dict` VALUES ('wl_status', 'White list status', '03', '0', '1', '1', '16', null);
INSERT INTO `sys_dict` VALUES ('yesorno', 'Whether', '01', '0', '1', '1', '2', null);
