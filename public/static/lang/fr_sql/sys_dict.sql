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
INSERT INTO `sys_dict` VALUES ('admin_area', 'Divisions administratives', '01', '1', '0', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('app_bitrate', 'Taux de code', '05', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('app_framerate', 'Taux de trame', '05', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('app_resolution', 'Résolution', '05', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('att_cate', 'Catégorie de pièce jointe', '01', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('bgcolor', 'Couleur d'arrière-plan', '03', '0', '1', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('call_ot', 'Le Seigneur est appelé identité', '03', '0', '1', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('call_srvtype', 'Type d'entreprise', '03', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('cam_type', 'Type de caméra', '02', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('cas_recstatus', 'État de réception de cas', '04', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('cas_setcate', 'Catégorie de coffret', '04', '0', '0', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('cas_status', 'État du cas', '04', '0', '0', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('con_cate', '人员类别', '03', '0', '1', '1', '19', null);
INSERT INTO `sys_dict` VALUES ('con_duty', '人员职务', '03', '0', '0', '1', '18', null);
INSERT INTO `sys_dict` VALUES ('cyc_unit', 'Unités de cycle', '04', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('data_right', 'Autorisations de données', '03', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('device_cate', 'Type d'équipement', '02', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('device_type', 'Type d'appareil', '02', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('dict_cate', 'Catégorie de dictionnaire', '01', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('ef_type', 'Type de clôture électronique', '02', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('fn_type', 'type de fonction', '03', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('grp_member_Type', 'Type de membre du groupe', '03', '0', '1', '1', '13', null);
INSERT INTO `sys_dict` VALUES ('ins_status', 'État de la patrouille', '04', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('inter_calltype', 'Mode d'appel', '03', '0', '1', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('ishave', 'Il n'y a pas', '01', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('l_status', 'État de la ligne', '04', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('l_type', 'Type de ligne', '04', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('media_type', 'Type de support', '03', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('note_status', 'Statut de l'annonce', '05', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('oper_system', 'Système d'exploitation', '03', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('org_type', 'Type d'unité', '03', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('para_cate', 'Catégories de paramètres', '03', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('para_type', 'Classification des paramètres', '03', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('pbcate', '通讯录目录类别', '03', '0', '1', '1', '20', null);
INSERT INTO `sys_dict` VALUES ('per_cate', 'Type de personnel', '04', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('per_relate', 'Relations du personnel', '03', '0', '1', '1', '17', null);
INSERT INTO `sys_dict` VALUES ('per_selrange', 'Portée du personnel', '05', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('prb_cate', 'Type de problème', '04', '0', '0', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('prb_origin', 'Source du problème', '04', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('prb_status', 'État du problème', '04', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('priority_level', 'Niveau de priorité', '02', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('set_field', 'Propriétés des paramètres de terminal', '03', '0', '1', '1', '15', null);
INSERT INTO `sys_dict` VALUES ('sex', 'Sexe', '01', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('status', 'État valide', '01', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('succ_flag', 'Signe de succès', '03', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('task_status', 'État de la tâche', '04', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('tsk_eval', 'Niveau d'évaluation', '04', '0', '1', '1', '3', '');
INSERT INTO `sys_dict` VALUES ('view_field', 'Propriétés d'affichage des terminaux', '03', '0', '1', '1', '14', null);
INSERT INTO `sys_dict` VALUES ('wl_status', 'Statut de la liste blanche', '03', '0', '1', '1', '16', null);
INSERT INTO `sys_dict` VALUES ('yesorno', 'Si', '01', '0', '1', '1', '2', null);
