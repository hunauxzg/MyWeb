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
INSERT INTO `sys_dict` VALUES ('admin_area', '行政区划', '01', '1', '0', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('app_bitrate', '码率', '05', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('app_framerate', '帧率', '05', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('app_resolution', '分辨率', '05', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('att_cate', '附件类别', '01', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('bgcolor', '背景色', '03', '0', '1', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('call_ot', '主被叫标识', '03', '0', '1', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('call_srvtype', '业务类型', '03', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('cam_type', '摄像头类型', '02', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('cas_recstatus', '案件接收状态', '04', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('cas_setcate', '案件设置类别', '04', '0', '0', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('cas_status', '案件状态', '04', '0', '0', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('con_cate', '人员类别', '03', '0', '1', '1', '19', null);
INSERT INTO `sys_dict` VALUES ('con_duty', '人员职务', '03', '0', '0', '1', '18', null);
INSERT INTO `sys_dict` VALUES ('cyc_unit', '周期单位', '04', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('data_right', '数据权限', '03', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('device_cate', '设备种类', '02', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('device_type', '设备类型', '02', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('dict_cate', '字典类别', '01', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('ef_type', '电子围栏类型', '02', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('fn_type', '功能类型', '03', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('grp_member_Type', '小组成员类型', '03', '0', '1', '1', '13', null);
INSERT INTO `sys_dict` VALUES ('ins_status', '巡检状态', '04', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('inter_calltype', '调用方式', '03', '0', '1', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('ishave', '有无', '01', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('l_status', '线路状态', '04', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('l_type', '线路类型', '04', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('media_type', '媒体类型', '03', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('note_status', '公告状态', '05', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('oper_system', '操作系统', '03', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('org_type', '单位类型', '03', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('para_cate', '参数类别', '03', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('para_type', '参数分类', '03', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('pbcate', '通讯录目录类别', '03', '0', '1', '1', '20', null);
INSERT INTO `sys_dict` VALUES ('per_cate', '人员类型', '04', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('per_relate', '人员关系', '03', '0', '1', '1', '17', null);
INSERT INTO `sys_dict` VALUES ('per_selrange', '人员范围', '05', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('prb_cate', '问题种类', '04', '0', '0', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('prb_origin', '问题来源', '04', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('prb_status', '问题状态', '04', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('priority_level', '优先级', '02', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('set_field', '终端设置属性', '03', '0', '1', '1', '15', null);
INSERT INTO `sys_dict` VALUES ('sex', '性别', '01', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('status', '有效状态', '01', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('succ_flag', '成功标志', '03', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('task_status', '任务状态', '04', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('tsk_eval', '评价等级', '04', '0', '1', '1', '3', '');
INSERT INTO `sys_dict` VALUES ('view_field', '终端显示属性', '03', '0', '1', '1', '14', null);
INSERT INTO `sys_dict` VALUES ('wl_status', '白名单状态', '03', '0', '1', '1', '16', null);
INSERT INTO `sys_dict` VALUES ('yesorno', '是否', '01', '0', '1', '1', '2', null);
