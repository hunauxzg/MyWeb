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
INSERT INTO `sys_dict` VALUES ('admin_area', 'Bestuurlijke indeling', '01', '1', '0', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('app_bitrate', 'Code rate', '05', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('app_framerate', 'Framesnelheid', '05', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('app_resolution', 'Resolutie', '05', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('att_cate', 'Attachment Kategorie', '01', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('bgcolor', 'Achtergrondkleur', '03', '0', '1', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('call_ot', 'De heer heet identiteit', '03', '0', '1', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('call_srvtype', 'Type bedrijf', '03', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('cam_type', 'Type camera', '02', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('cas_recstatus', 'Aanvraag status ontvangen', '04', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('cas_setcate', 'Case set categorie', '04', '0', '0', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('cas_status', 'Status van case', '04', '0', '0', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('con_cate', 'De categorieën van het personeel ', '03', '0', '1', '1', '19', null);
INSERT INTO `sys_dict` VALUES ('con_duty', 'De beambte', '03', '0', '0', '1', '18', null);
INSERT INTO `sys_dict` VALUES ('cyc_unit', 'Cyclus eenheden', '04', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('data_right', 'Gegevens machtigingen', '03', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('device_cate', 'Type uitrusting', '02', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('device_type', 'Type apparaat', '02', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('dict_cate', 'Categorie WoordenBoek', '01', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('ef_type', 'Elektronisch hek type', '02', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('fn_type', 'functietype', '03', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('grp_member_Type', 'Type groeps lid', '03', '0', '1', '1', '13', null);
INSERT INTO `sys_dict` VALUES ('ins_status', 'Patrouille status', '04', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('inter_calltype', 'Aanroep modus', '03', '0', '1', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('ishave', 'Er is geen', '01', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('l_status', 'Regelstatus', '04', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('l_type', 'Lijntype', '04', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('media_type', 'Media type', '03', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('note_status', 'Aankondigings status', '05', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('oper_system', 'Besturingssysteem', '03', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('org_type', 'Type eenheid', '03', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('para_cate', 'Parameter Categorieën', '03', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('para_type', 'Parameter classificatie', '03', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('pbcate', 'Lijst van de categorieën ADRESBOEK', '03', '0', '1', '1', '20', null);
INSERT INTO `sys_dict` VALUES ('per_cate', 'Soort personeel', '04', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('per_relate', 'Personeels relaties', '03', '0', '1', '1', '17', null);
INSERT INTO `sys_dict` VALUES ('per_selrange', 'Personeels toepassings', '05', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('prb_cate', 'Soort probleem', '04', '0', '0', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('prb_origin', 'Bron van het probleem', '04', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('prb_status', 'Status van het probleem', '04', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('priority_level', 'Prioriteitsniveau', '02', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('set_field', 'Eigenschappen van Terminal instellingen', '03', '0', '1', '1', '15', null);
INSERT INTO `sys_dict` VALUES ('sex', 'Geslacht', '01', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('status', 'Geldige status', '01', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('succ_flag', 'Succes Sign', '03', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('task_status', 'Status van taak', '04', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('tsk_eval', 'Evaluatieniveau', '04', '0', '1', '1', '3', '');
INSERT INTO `sys_dict` VALUES ('view_field', 'Eigenschappen voor Terminal weergave', '03', '0', '1', '1', '14', null);
INSERT INTO `sys_dict` VALUES ('wl_status', 'Status van witte lijst', '03', '0', '1', '1', '16', null);
INSERT INTO `sys_dict` VALUES ('yesorno', 'Of', '01', '0', '1', '1', '2', null);
