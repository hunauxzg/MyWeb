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
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#333333', 'Zwarte', null, '#333333', null, '1', '10', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#496999', 'Blauwe', null, '#496999', null, '1', '6', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#49714A', 'Donkergroen', null, '#49714A', null, '1', '4', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#77ABCF', 'Lichtblauw', null, '#77ABCF', null, '1', '5', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#7A6854', 'bruin', null, '#7A6854', null, '1', '8', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#7F7F7F', 'grijs', null, '#7F7F7F', null, '1', '9', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#8AB66D', 'Lichtgroen', null, '#8AB66D', null, '1', '3', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#9E6B99', 'purper', null, '#9E6B99', null, '1', '7', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#C84E4E', 'Rode', null, '#C84E4E', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#D79750', 'Oranje', null, '#D79750', null, '1', '1', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('bgcolor', '#EACF59', 'Geel', null, '#EACF59', null, '1', '2', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', '-', 'No', null, '-', '', '1', '0', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-01 16:33:24', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '0', 'Geen zaken', null, '0', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_cate', '0', 'Niet van', '', '0', '', '1', '0', '0', 'admin', '2018-10-12 14:24:01', 'admin', '2018-10-12 14:24:01', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '0', 'Persoonlijk niveau', null, '0', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ishave', '0', 'No', null, '0', '#C84E4E', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_status', '0', 'Ongeldig', '', '0', '#C84E4E', '1', '0', '1', 'admin', '2018-04-28 09:45:34', 'admin', '2018-04-28 09:46:01', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '0', 'No', null, '0', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '0', 'Niet gepubliceerd', '', '0', '#8AB66D', '1', '0', '4', 'admin', '2018-04-13 09:37:49', 'admin', '2018-04-13 09:49:21', '');
INSERT INTO `sys_dict_detail` VALUES ('org_type', '0', 'Proefeenheden', null, '0', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '0', 'De provincies en gemeenten ', '', '0', '', '1', '0', '1', 'admin', '2018-10-15 09:26:35', 'admin', '2018-10-15 09:26:59', '');
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '0', 'Alle personeelsleden', '', '0', '#C84E4E', '1', '0', '1', 'admin', '2018-04-13 09:39:21', 'admin', '2018-04-13 09:49:34', '');
INSERT INTO `sys_dict_detail` VALUES ('sex', '0', 'Onbekende Sex', null, '0', '', '1', '0', '11', 'admin', '2017-09-11 16:47:00', 'admin', '2017-12-04 19:00:05', '');
INSERT INTO `sys_dict_detail` VALUES ('status', '0', 'Ongeldig', null, '0', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '0', 'Revisie in behandeling', '', '0', '', '1', '0', '0', 'admin', '2018-03-23 13:46:41', 'admin', '2018-03-23 13:46:41', null);
INSERT INTO `sys_dict_detail` VALUES ('yesorno', '0', 'Of', null, '0', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '0-comm', 'Communicatie-instellingen', null, '0-comm', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '00', 'Niet ontvangen', '', '00', '#D79750', '1', '0', '0', 'admin', '2018-08-13 11:32:48', 'admin', '2018-08-13 11:32:48', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '00', 'Tijdelijke opslag', '', '00', '#77ABCF', '1', '0', '1', 'admin', '2018-08-13 11:30:04', 'admin', '2018-08-13 11:31:19', '');
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '00', 'Geen patrouille', '', '00', '', '1', '0', '0', 'admin', '2018-06-05 14:41:05', 'admin', '2018-06-05 14:41:05', null);
INSERT INTO `sys_dict_detail` VALUES ('per_cate', '00', 'Bijgestaan', '', '00', '', '1', '0', '0', 'admin', '2018-06-21 09:59:37', 'admin', '2018-06-21 09:59:37', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '00', 'Tijdelijke opslag', '', '00', '', '1', '0', '0', 'admin', '2017-12-22 09:56:11', 'admin', '2017-12-22 09:56:11', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '01', 'is ontvangen', '', '01', '#8AB66D', '1', '1', '0', 'admin', '2018-08-13 11:33:04', 'admin', '2018-08-13 11:33:04', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '01', 'Heeft escaleerde', '', '01', '#D79750', '1', '1', '1', 'admin', '2018-08-13 11:30:22', 'admin', '2018-08-13 11:31:40', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '01', 'Algemene coördinator', null, '01', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '01', 'In patrouille', '', '01', '', '1', '1', '0', 'admin', '2018-06-05 14:41:31', 'admin', '2018-06-05 14:41:31', null);
INSERT INTO `sys_dict_detail` VALUES ('per_cate', '01', 'Belangrijkste', '', '01', '', '1', '1', '0', 'admin', '2018-06-21 09:59:48', 'admin', '2018-06-21 09:59:48', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '01', 'Vader', '', '01', '', '1', '1', '0', 'admin', '2018-03-23 13:52:41', 'admin', '2018-03-23 13:52:41', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '01', 'Wegenbouw', '', '01', '', '1', '0', '1', 'admin', '2018-01-02 14:31:49', 'admin', '2018-01-02 14:35:00', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '01', 'Heeft escaleerde', '', '01', '#D79750', '1', '0', '0', 'admin', '2018-01-02 14:33:24', 'admin', '2018-01-02 14:33:24', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '01', 'is gepubliceerd', '', '01', '', '1', '0', '0', 'admin', '2017-12-22 09:56:24', 'admin', '2017-12-22 09:56:24', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_recstatus', '02', 'is afgewezen', '', '02', '#C84E4E', '1', '2', '0', 'admin', '2018-08-13 11:33:24', 'admin', '2018-08-13 11:33:24', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '02', 'De politie is al op zijn plaats', '', '02', '#C84E4E', '1', '2', '1', 'admin', '2018-08-13 11:30:39', 'admin', '2018-08-13 11:31:50', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '02', 'Onderliggende communicatie', null, '02', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '02', 'Stop patrouille', '', '02', '', '1', '2', '0', 'admin', '2018-06-05 14:41:56', 'admin', '2018-06-05 14:41:56', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '02', 'Moeder', '', '02', '', '1', '2', '0', 'admin', '2018-03-23 13:52:56', 'admin', '2018-03-23 13:52:56', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '02', 'Lijn niet', '', '02', '', '1', '0', '0', 'admin', '2018-01-02 14:35:26', 'admin', '2018-01-02 14:35:26', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '02', 'In proces', '', '02', '#496999', '1', '0', '0', 'admin', '2018-01-02 14:33:48', 'admin', '2018-01-02 14:33:48', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '02', 'is ontvangen', '', '02', '', '1', '0', '0', 'admin', '2017-12-22 09:56:47', 'admin', '2017-12-22 09:56:47', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_status', '03', 'is verwijderd', '', '03', '#8AB66D', '1', '3', '1', 'admin', '2018-08-13 11:30:56', 'admin', '2018-08-13 11:32:00', '');
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '03', 'Platform Management', null, '03', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '03', 'Stop patrouille', '', '03', '', '1', '3', '0', 'admin', '2018-06-05 14:42:39', 'admin', '2018-06-05 14:42:39', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '03', 'Echtgenoot', '', '03', '', '1', '3', '0', 'admin', '2018-03-23 13:53:10', 'admin', '2018-03-23 13:53:10', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_cate', '03', 'Schade aan apparatuur', '', '03', '', '1', '0', '1', 'admin', '2018-01-02 14:32:04', 'admin', '2018-01-02 14:35:09', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '03', 'is opgelost', '', '03', '#49714A', '1', '0', '0', 'admin', '2018-01-02 14:34:12', 'admin', '2018-01-02 14:34:12', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '03', 'Heb feedback', '', '03', '', '1', '0', '0', 'admin', '2017-12-22 10:02:45', 'admin', '2017-12-22 10:02:45', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '04', 'BedrijfsVoering', null, '04', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ins_status', '04', 'Patrouille gecontroleerd', '', '04', '', '1', '4', '0', 'admin', '2018-06-05 14:43:01', 'admin', '2018-06-05 14:43:01', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '04', 'Broer', '', '04', '', '1', '4', '0', 'admin', '2018-03-23 13:53:26', 'admin', '2018-03-23 13:53:26', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_status', '04', 'is ongedaan gemaakt', '', '04', '#C84E4E', '1', '0', '0', 'admin', '2018-01-02 14:34:32', 'admin', '2018-01-02 14:34:32', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '04', 'is gearchiveerd', '', '04', '', '1', '0', '0', 'admin', '2017-12-22 10:07:38', 'admin', '2017-12-22 10:07:38', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '05', 'Opdracht en VerzenDing', null, '05', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '05', 'Zusters', '', '05', '', '1', '5', '0', 'admin', '2018-03-23 13:53:41', 'admin', '2018-03-23 13:53:41', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '05', 'is geëvalueerd', '', '05', '', '1', '0', '0', 'admin', '2017-12-22 10:07:58', 'admin', '2017-12-22 10:07:58', null);
INSERT INTO `sys_dict_detail` VALUES ('dict_cate', '06', 'Besluit analyse', null, '06', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '06', 'Familieleden', '', '06', '', '1', '6', '1', 'admin', '2018-03-23 13:54:12', 'admin', '2018-03-23 13:54:51', '');
INSERT INTO `sys_dict_detail` VALUES ('task_status', '06', 'is afgewezen', '', '06', '', '1', '0', '0', 'admin', '2017-12-22 10:08:27', 'admin', '2017-12-22 10:08:27', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '07', 'Collega 's', '', '07', '', '1', '7', '0', 'admin', '2018-03-23 13:54:41', 'admin', '2018-03-23 13:54:41', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '07', 'Terug naar gestraft ernstig', '', '07', '', '1', '0', '0', 'admin', '2017-12-22 10:08:57', 'admin', '2017-12-22 10:08:57', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '08', 'Vrienden', '', '08', '', '1', '8', '0', 'admin', '2018-03-23 13:55:02', 'admin', '2018-03-23 13:55:02', null);
INSERT INTO `sys_dict_detail` VALUES ('per_relate', '09', 'Andere', '', '09', '', '1', '9', '0', 'admin', '2018-03-23 13:55:12', 'admin', '2018-03-23 13:55:12', null);
INSERT INTO `sys_dict_detail` VALUES ('task_status', '09', 'is ongedaan gemaakt', '', '09', '', '1', '0', '0', 'admin', '2017-12-22 10:09:19', 'admin', '2017-12-22 10:09:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_ot', '1', 'De heer riep', null, '1', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_cate', '1', 'Zijn collectie', '', '1', '', '1', '1', '0', 'admin', '2018-10-12 14:24:18', 'admin', '2018-10-12 14:24:18', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '1', 'Groepeerniveau', null, '1', '#EACF59', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '1', 'Standaard SIP-Terminal', null, '1', '', '1', '5', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:22:35', '');
INSERT INTO `sys_dict_detail` VALUES ('grp_member_Type', '1', 'Personeel', null, '1', '#8AB66D', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('ishave', '1', 'Ja', null, '1', '#8AB66D', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_status', '1', 'Effectieve', '', '1', '#8AB66D', '1', '1', '0', 'admin', '2018-04-28 09:45:52', 'admin', '2018-04-28 09:45:52', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '1', 'Alleen tekst', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '1', 'is gepubliceerd', '', '1', '#C84E4E', '1', '1', '3', 'admin', '2018-04-13 09:38:07', 'admin', '2018-04-13 09:48:50', '');
INSERT INTO `sys_dict_detail` VALUES ('org_type', '1', 'Officiële eenheid', null, '1', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '1', '区/县', '', '1', '', '1', '1', '0', 'admin', '2018-10-15 09:26:50', 'admin', '2018-10-15 09:26:50', null);
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '1', 'Deze eenheid', '', '1', '#D79750', '1', '1', '1', 'admin', '2018-04-13 09:39:34', 'admin', '2018-04-13 09:49:57', '');
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '1', 'Niveau', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '1', 'Man', null, '1', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('status', '1', 'Effectieve', null, '1', '#8AB66D', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '1', 'Is verstreken', '', '1', '', '1', '1', '0', 'admin', '2018-03-23 13:46:57', 'admin', '2018-03-23 13:46:57', null);
INSERT INTO `sys_dict_detail` VALUES ('yesorno', '1', 'Is', null, '1', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '1-map', 'Kaart instellingen', null, '1-map', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '10', '10', '', '10', '', '1', '1', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '100', 'Dahua platform', '', '100', '', '1', '100', '0', 'admin', '2018-05-23 17:20:15', 'admin', '2018-05-23 17:20:15', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '101', 'Bitwin', '', '101', '', '1', '101', '0', 'admin', '2018-05-23 17:20:34', 'admin', '2018-05-23 17:20:34', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '101', '国家级正职', '', '101', '', '1', '0', '0', 'admin', '2018-10-12 14:25:14', 'admin', '2018-10-12 14:25:14', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '102', '国家级副职', '', '102', '', '1', '1', '0', 'admin', '2018-10-12 14:25:42', 'admin', '2018-10-12 14:25:42', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '110KV', '110KV', '', '110KV', '#EACF59', '1', '1', '1', 'admin', '2018-04-28 09:44:22', 'admin', '2018-04-28 09:46:38', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '111', '省部级正职', '', '111', '', '1', '2', '0', 'admin', '2018-10-12 14:26:10', 'admin', '2018-10-12 14:26:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '112', '省部级副职', '', '112', '', '1', '3', '0', 'admin', '2018-10-12 14:26:24', 'admin', '2018-10-12 14:26:24', null);
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '1200', '1200', '', '1200', '', '1', '2', '0', 'admin', '2018-04-04 09:41:38', 'admin', '2018-04-04 09:41:38', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '121', '厅局级正职', '', '121', '', '1', '4', '0', 'admin', '2018-10-12 14:26:45', 'admin', '2018-10-12 14:26:45', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '122', '厅局级副职', '', '122', '', '1', '5', '0', 'admin', '2018-10-12 14:26:59', 'admin', '2018-10-12 14:26:59', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '128', 'Meerdere zakelijke', null, '128', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '1280*720', '720x1280x1200kbps', '', '1280*720', '', '1', '5', '2', 'admin', '2018-04-03 19:39:36', 'admin', '2018-04-17 14:15:29', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '131', '县处级正职', '', '131', '', '1', '6', '0', 'admin', '2018-10-12 14:27:35', 'admin', '2018-10-12 14:27:35', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '132', '县处级副职', '', '132', '', '1', '7', '0', 'admin', '2018-10-12 14:27:51', 'admin', '2018-10-12 14:27:51', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '141', '乡科级正职', '', '141', '', '1', '8', '0', 'admin', '2018-10-12 14:28:22', 'admin', '2018-10-12 14:28:22', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '142', '乡科级副职', '', '142', '', '1', '9', '0', 'admin', '2018-10-12 14:28:36', 'admin', '2018-10-12 14:28:36', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '15', '15', '', '15', '', '1', '2', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '150', '科员级', '', '150', '', '1', '10', '0', 'admin', '2018-10-12 14:29:18', 'admin', '2018-10-12 14:29:18', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '16', 'Basis gesprek met twee partijen', null, '16', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '160', '办事员级', '', '160', '', '1', '11', '0', 'admin', '2018-10-12 14:29:48', 'admin', '2018-10-12 14:29:48', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '17', 'Vergadering', null, '17', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '17', 'Vergadering formaat SMS', null, '17', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '18', 'Vergadering partij deelnemers', null, '18', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '18', 'Stem bericht GroepsOproep', null, '18', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '19', 'Sterke stekker', null, '19', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '19', 'Conferentie-opname', null, '19', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '1920*1080', '1080x1920x2200kbps', '', '1920*1080', '', '1', '6', '2', 'admin', '2018-04-03 19:39:49', 'admin', '2018-04-17 14:16:04', '');
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '199', '未定职公务员', '', '199', '', '1', '12', '0', 'admin', '2018-10-12 14:30:19', 'admin', '2018-10-12 14:30:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_ot', '2', 'worden opgeroepen', null, '2', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('data_right', '2', 'Eenheidsniveau', null, '2', '#D79750', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '2', 'Uitgebreide SIP interface Terminal', null, '2', '', '1', '6', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:24:46', '');
INSERT INTO `sys_dict_detail` VALUES ('grp_member_Type', '2', 'Groep', null, '2', '#C84E4E', '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '2', 'GPS locatie informatie', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('note_status', '2', 'is ongedaan gemaakt', '', '2', '#D79750', '1', '2', '2', 'admin', '2018-04-13 09:38:33', 'admin', '2018-04-13 09:48:57', '');
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '2', '乡/镇', '', '2', '', '1', '2', '0', 'admin', '2018-10-15 09:27:17', 'admin', '2018-10-15 09:27:17', null);
INSERT INTO `sys_dict_detail` VALUES ('per_selrange', '2', 'Geselecteerde personen', '', '2', '#77ABCF', '1', '2', '1', 'admin', '2018-04-13 09:39:47', 'admin', '2018-04-13 09:50:05', '');
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '2', 'Tweede niveau', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '2', 'Vrouw', null, '2', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('wl_status', '2', 'is afgewezen', '', '2', '', '1', '2', '0', 'admin', '2018-03-23 13:47:12', 'admin', '2018-03-23 13:47:12', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '2-busi', 'Bedrijfsinstellingen', null, '2-busi', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '20', '20', '', '20', '', '1', '3', '0', 'admin', '2018-04-17 14:13:26', 'admin', '2018-04-17 14:13:26', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '20', 'Sterke sloop', null, '20', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '200', 'PC', null, '200', '#9E6B99', '1', null, '1', 'admin', '2018-03-22 14:58:16', 'admin', '2018-03-22 14:58:16', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '201', 'Smart Phones', null, '201', '#145385', '1', null, '10', 'admin', '2018-03-22 14:49:59', 'admin', '2018-03-22 14:49:59', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '202', 'Geen scherm machine', null, '202', '#145385', '1', null, '0', 'admin', '2018-03-22 14:50:42', 'admin', '2018-03-22 14:50:42', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '203', 'Kleine scherm machine', null, '203', '#145385', '1', null, '0', 'admin', '2018-03-22 14:51:29', 'admin', '2018-03-22 14:51:29', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '204', 'IP telefoon', null, '204', '#D18315', '1', null, '0', 'admin', '2018-03-22 14:51:53', 'admin', '2018-03-22 14:51:53', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '205', 'IP visuele telefoon', null, '205', '#D18315', '1', null, '0', 'admin', '2018-03-22 14:52:15', 'admin', '2018-03-22 14:52:15', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '206', 'zijn begeleid bal', null, '206', '#006100', '1', null, '0', 'admin', '2018-03-22 14:52:39', 'admin', '2018-03-22 14:52:39', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '207', 'Ophanging controle hoofd', null, '207', '#006100', '1', null, '0', 'admin', '2018-03-22 14:53:19', 'admin', '2018-03-22 14:53:19', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '208', 'Controle hoofd', null, '208', '#006100', '1', null, '0', 'admin', '2018-03-22 14:53:47', 'admin', '2018-03-22 14:53:47', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '209', 'GPS-Locator', null, '209', '#77ABCF', '1', null, '0', 'admin', '2018-03-22 14:54:20', 'admin', '2018-03-22 14:54:20', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '21', 'DownLoads controleren', null, '21', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '210', 'Gewone auto station', null, '210', '#A01A1A', '1', null, '0', 'admin', '2018-03-22 14:55:03', 'admin', '2018-03-22 14:55:03', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '211', '公司职员', '', '211', '', '1', '13', '0', 'admin', '2018-10-12 14:33:11', 'admin', '2018-10-12 14:33:11', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '211', 'Video auto station', null, '211', '#A01A1A', '1', null, '2', 'admin', '2018-03-22 14:55:58', 'admin', '2018-03-22 14:55:58', null);
INSERT INTO `sys_dict_detail` VALUES ('device_cate', '213', '语音网关', null, '213', null, '1', null, '0', 'admin', '2018-10-12 16:45:19', 'admin', '2018-10-12 16:45:19', null);
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '22', 'Uploads controleren', null, '22', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '220KV', '220KV', '', '220KV', '#D79750', '1', '2', '1', 'admin', '2018-04-28 09:44:44', 'admin', '2018-04-28 09:46:43', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '23', 'Opslaginstructies', null, '23', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '25', '25', '', '25', '', '1', '4', '0', 'admin', '2018-04-04 09:41:50', 'admin', '2018-04-04 09:41:50', '');
INSERT INTO `sys_dict_detail` VALUES ('data_right', '3', 'Alle', null, '3', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '3', 'Afbeelding', null, '3', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '3', 'Drie niveaus', null, '3', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '3-per', 'Persoonlijkheids instellingen', null, '3-per', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '30', '30', '', '30', '', '1', '5', '0', 'admin', '2018-04-03 19:45:47', 'admin', '2018-04-03 19:45:47', '');
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '300', '300', '', '300', '', '1', '0', '0', 'admin', '2018-04-03 19:45:15', 'admin', '2018-04-03 19:45:15', '');
INSERT INTO `sys_dict_detail` VALUES ('app_bitrate', '3000', '3000', '', '3000', '', '1', '1', '0', 'admin', '2018-04-03 19:45:25', 'admin', '2018-04-03 19:45:25', '');
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '320*240', '240x320x300kbps', '', '320*240', '', '1', '1', '1', 'admin', '2018-04-03 19:38:44', 'admin', '2018-04-17 14:12:55', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330000', 'Provincie Zhejiang', null, '330000', '', '1', '0', '4', 'admin', '2017-11-07 15:07:38', 'admin', '2018-03-22 14:29:17', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330100', 'Hangzhou stad', '330000', '330000/330100', '', '1', '0', '4', 'admin', '2017-11-07 15:08:03', 'admin', '2017-11-08 15:56:35', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330102', 'Shangcheng district', '330100', '330000/330100/330102', '', '1', '0', '0', 'admin', '2017-11-08 15:58:27', 'admin', '2017-11-08 15:58:27', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330103', 'Xiacheng district', '330100', '330000/330100/330103', '', '1', '0', '0', 'admin', '2017-11-08 16:01:50', 'admin', '2017-11-08 16:01:50', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330104', 'Jianggan district', '330100', '330000/330100/330104', '', '1', '0', '0', 'admin', '2017-11-08 16:02:13', 'admin', '2017-11-08 16:02:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330105', 'Gongshu district', '330100', '330000/330100/330105', '', '1', '0', '0', 'admin', '2017-11-08 16:23:55', 'admin', '2017-11-08 16:23:55', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330106', 'Xihu district', '330100', '330000/330100/330106', '', '1', '0', '0', 'admin', '2017-11-08 16:24:13', 'admin', '2017-11-08 16:24:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330108', 'Bingjiang district', '330100', '330000/330100/330108', '', '1', '0', '0', 'admin', '2017-11-08 16:25:05', 'admin', '2017-11-08 16:25:05', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330109', 'Xiaoshan  district', '330100', '330000/330100/330109', '', '1', '0', '0', 'admin', '2017-11-08 16:25:26', 'admin', '2017-11-08 16:25:26', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330110', 'Yuhang district', '330100', '330000/330100/330110', '', '1', '0', '0', 'admin', '2017-11-08 16:25:46', 'admin', '2017-11-08 16:25:46', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330111', 'Fuyang district', '330100', '330000/330100/330111', '', '1', '0', '0', 'admin', '2017-11-08 16:26:08', 'admin', '2017-11-08 16:26:08', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330122', 'Tonglu County', '330100', '330000/330100/330122', '', '1', '0', '0', 'admin', '2017-11-08 16:26:36', 'admin', '2017-11-08 16:26:36', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330127', 'Chun'an County', '330100', '330000/330100/330127', '', '1', '0', '0', 'admin', '2017-11-08 16:26:54', 'admin', '2017-11-08 16:26:54', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330182', 'Jiande stad', '330100', '330000/330100/330182', '', '1', '0', '0', 'admin', '2017-11-08 16:27:13', 'admin', '2017-11-08 16:27:13', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330185', 'Lin'an stad', '330100', '330000/330100/330185', '', '1', '0', '0', 'admin', '2017-11-08 16:27:35', 'admin', '2017-11-08 16:27:35', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330200', 'Ningbo stad', '330000', '330000/330200', '', '1', '0', '2', 'admin', '2017-11-08 16:29:16', 'admin', '2018-03-22 14:36:05', '');
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330203', 'Haishu district', '330200', '330000/330200/330203', '', '1', '0', '0', 'admin', '2017-11-08 16:29:40', 'admin', '2017-11-08 16:29:40', null);
INSERT INTO `sys_dict_detail` VALUES ('admin_area', '330204', 'Jiangdong district', '330200', '330000/330200/330204', '', '1', '0', '0', 'admin', '2017-11-08 16:30:00', 'admin', '2017-11-08 16:30:00', null);
INSERT INTO `sys_dict_detail` VALUES ('l_type', '35KV', '35KV', '', '35KV', '#8AB66D', '1', '0', '1', 'admin', '2018-04-28 09:44:04', 'admin', '2018-04-28 09:46:30', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '4', 'Spraakbestanden', null, '4', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '4', 'Niveau vier', null, '4', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_type', '4-other', 'Andere instellingen', null, '4-other', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '410', '高级', '', '410', '', '1', '14', '0', 'admin', '2018-10-12 14:33:42', 'admin', '2018-10-12 14:33:42', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '411', '正高级', '', '411', '', '1', '15', '0', 'admin', '2018-10-12 14:34:10', 'admin', '2018-10-12 14:34:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '412', '副高级', '', '412', '', '1', '16', '0', 'admin', '2018-10-12 14:34:32', 'admin', '2018-10-12 14:34:32', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '420', '中级', '', '420', '', '1', '17', '0', 'admin', '2018-10-12 14:34:51', 'admin', '2018-10-12 14:34:51', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '430', '初级', '', '430', '', '1', '18', '0', 'admin', '2018-10-12 14:35:10', 'admin', '2018-10-12 14:35:10', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '434', '助理级', '', '434', '', '1', '19', '0', 'admin', '2018-10-12 14:35:37', 'admin', '2018-10-12 14:35:37', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '435', '员级', '', '435', '', '1', '20', '0', 'admin', '2018-10-12 14:35:58', 'admin', '2018-10-12 14:35:58', null);
INSERT INTO `sys_dict_detail` VALUES ('con_duty', '499', '未定职级专业技术人员', '', '499', '', '1', '21', '0', 'admin', '2018-10-12 14:36:26', 'admin', '2018-10-12 14:36:26', null);
INSERT INTO `sys_dict_detail` VALUES ('app_framerate', '5', '5', '', '5', '', '1', '0', '0', 'admin', '2018-04-03 19:45:39', 'admin', '2018-04-03 19:45:39', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '5', 'Video-opnamebestanden', null, '5', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '5', 'Niveau vijf', null, '5', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '5', 'Vrouwen veranderen (veranderen) in Male', null, '5', '', '1', '0', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-07 16:59:33', '');
INSERT INTO `sys_dict_detail` VALUES ('l_type', '500KV', '500KV', '', '500KV', '#C84E4E', '1', '3', '1', 'admin', '2018-04-28 09:44:58', 'admin', '2018-04-28 09:46:49', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '6', 'WilleKeurig bestand', null, '6', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '6', 'Niveau zes', null, '6', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '6', 'Mannelijke verandering (verandering) in vrouwelijk', null, '6', '', '1', '0', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2017-11-07 17:20:44', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '64', 'Universele kraan Terminal', null, '64', '', '1', '0', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:00', '');
INSERT INTO `sys_dict_detail` VALUES ('app_resolution', '640*480', '480x640x800kbps', '', '640*480', '', '1', '2', '3', 'admin', '2018-04-03 19:38:58', 'admin', '2018-04-23 14:49:33', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '65', 'Dispatch station', null, '65', '', '1', '1', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:17', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '66', 'Video gateway', null, '66', '', '1', '2', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:40', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '67', 'Opslag nummer', null, '67', '', '1', '8', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:20', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '68', 'OrganisatieBeheerder', null, '68', '', '1', '3', '3', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:21:58', '');
INSERT INTO `sys_dict_detail` VALUES ('device_type', '69', 'GPS functie Terminal alleen', null, '69', '', '1', '4', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:49', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '7', 'Gesprek met één oproep', null, '7', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('priority_level', '7', 'Niveau zeven', null, '7', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('device_type', '70', '28181 platform of Terminal', null, '70', '', '1', '7', '4', 'admin', '2017-09-11 16:47:00', 'admin', '2018-05-23 17:25:02', '');
INSERT INTO `sys_dict_detail` VALUES ('media_type', '8', 'Video-oproep met één oproep', null, '8', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '8', 'Eenheid', '', '8', '', '1', '8', '1', 'admin', '2018-10-15 09:27:31', 'admin', '2018-10-15 10:10:11', '');
INSERT INTO `sys_dict_detail` VALUES ('call_srvtype', '80', 'Instant MessaGing', null, '80', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('media_type', '9', 'GroepsOproep', null, '9', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('pbcate', '9', 'Andere', '', '9', '', '1', '9', '0', 'admin', '2018-10-15 09:28:02', 'admin', '2018-10-15 09:28:02', null);
INSERT INTO `sys_dict_detail` VALUES ('sex', '9', 'Niet-beschrijvende gender', null, '9', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '96', 'Anhui Maak de wereld camera', '', '96', '', '1', '96', '0', 'admin', '2018-05-23 17:19:03', 'admin', '2018-05-23 17:19:03', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '97', 'Hoi Hong camera', '', '97', '', '1', '97', '0', 'admin', '2018-05-23 17:19:25', 'admin', '2018-05-23 17:19:25', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '98', 'Rich Vision bewakings camera', '', '98', '', '1', '98', '0', 'admin', '2018-05-23 17:19:42', 'admin', '2018-05-23 17:19:42', null);
INSERT INTO `sys_dict_detail` VALUES ('cam_type', '99', 'Hoi Hong platform', '', '99', '', '1', '99', '0', 'admin', '2018-05-23 17:20:00', 'admin', '2018-05-23 17:20:00', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'Android', 'Android', null, 'Android', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'bad', 'Slechte', '', 'bad', '#9E6B99', '1', '3', '2', 'admin', '2018-06-05 14:36:39', 'admin', '2018-06-05 14:40:29', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'CAN_ADD_GROUP', 'Terminal zelf-gebouwde groep', '', 'CAN_ADD_GROUP', '', '1', '6', '1', 'admin', '2018-03-22 11:19:44', 'admin', '2018-03-22 14:32:37', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'CAR_ID', 'Auto grade', '', 'CAR_ID', '', '1', '12', '1', 'admin', '2018-03-22 10:52:37', 'admin', '2018-03-22 14:30:25', '');
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_cate', 'Soort geval', '', 'cas_cate', '', '1', '2', '1', 'admin', '2018-08-13 11:22:43', 'admin', '2018-08-13 14:15:08', '');
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_code', 'Geval nummer', '', 'cas_code', '', '1', '0', '0', 'admin', '2018-08-13 11:21:53', 'admin', '2018-08-13 11:21:53', null);
INSERT INTO `sys_dict_detail` VALUES ('cas_setcate', 'cas_ori', 'Zaak bron', '', 'cas_ori', '', '1', '1', '0', 'admin', '2018-08-13 11:22:14', 'admin', '2018-08-13 11:22:14', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'chat_file', 'Chat-bestand', null, 'chat_file', null, '1', '0', '0', 'admin', '2018-03-12 14:41:00', 'admin', '2018-03-12 14:41:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'chat_img', 'Chat Foto's', null, 'chat_img', null, '1', '0', '0', 'admin', '2018-03-12 14:41:00', 'admin', '2018-03-12 14:41:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'COMP', 'Eenheid', null, 'COMP', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'day', 'Dagen', '', 'day', '', '1', '0', '0', 'admin', '2018-06-05 14:43:40', 'admin', '2018-06-05 14:43:40', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'DEPT_NUM', 'Departement', '', 'DEPT_NUM', '', '1', '2', '1', 'admin', '2018-03-22 10:26:02', 'admin', '2018-03-22 14:30:34', '');
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'device_cate', 'Type uitrusting', null, 'device_cate', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'ERROR', 'Fout', null, 'ERROR', '#C84E4E', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'excellent', 'Uitstekend', '', 'excellent', '#C84E4E', '1', '0', '1', 'admin', '2018-06-05 14:35:43', 'admin', '2018-06-05 14:37:45', '');
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'FAIL', 'Mislukt', null, 'FAIL', '#EACF59', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'FRAME', 'Framesnelheid', '', 'FRAME', '', '1', '2', '1', 'admin', '2018-03-22 11:00:27', 'admin', '2018-03-22 14:31:56', '');
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'general', 'Zo zo', '', 'general', '#496999', '1', '2', '2', 'admin', '2018-06-05 14:36:22', 'admin', '2018-06-05 14:40:19', '');
INSERT INTO `sys_dict_detail` VALUES ('tsk_eval', 'good', 'Goede', '', 'good', '#8AB66D', '1', '1', '3', 'admin', '2018-06-05 14:36:00', 'admin', '2018-06-05 14:40:10', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'GPS_INFO', 'Locatie informatie', '', 'GPS_INFO', '', '1', '8', '1', 'admin', '2018-03-22 10:29:58', 'admin', '2018-03-22 14:31:18', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'GPS_REPORT_FREQ', 'GPS escalatie frequentie', '', 'GPS_REPORT_FREQ', '', '1', '10', '0', 'admin', '2018-05-24 10:35:37', 'admin', '2018-05-24 10:35:37', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'GPS_REPORT_ONOFF', 'GPS-schakelaar', '', 'GPS_REPORT_ONOFF', '', '1', '11', '0', 'admin', '2018-05-24 10:38:02', 'admin', '2018-05-24 10:38:02', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'GPS_TIME', 'Locatie uploadTijd', '', 'GPS_TIME', '', '1', '9', '1', 'admin', '2018-03-22 10:30:19', 'admin', '2018-03-22 14:31:25', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'ID', 'Id', '', 'ID', '', '1', '6', '1', 'admin', '2018-03-22 10:28:01', 'admin', '2018-03-22 14:31:04', '');
INSERT INTO `sys_dict_detail` VALUES ('ef_type', 'in', 'Voer alarm', null, 'in', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('inter_calltype', 'IN', 'wordt genoemd', null, 'IN', '#9E6B99', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'INIT_GPS', 'Eerste positie', '', 'INIT_GPS', '', '1', '4', '1', 'admin', '2018-03-22 11:05:24', 'admin', '2018-03-22 14:32:24', '');
INSERT INTO `sys_dict_detail` VALUES ('prb_origin', 'inspection', 'inspectie', '', 'inspection', '#49714A', '1', '0', '0', 'admin', '2018-01-02 14:32:53', 'admin', '2018-01-02 14:32:53', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'ios', 'ios', null, 'ios', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'label_icon', 'Pictogram van bijschrift', '', 'label_icon', '', '1', '0', '0', 'admin', '2018-01-08 17:20:02', 'admin', '2018-01-08 17:20:02', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'linux', 'linux', null, 'linux', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'menu', 'Menu', null, 'menu', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'menu_group', 'Menu groep', null, 'menu_group', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'month', 'Maand', '', 'month', '', '1', '2', '0', 'admin', '2018-06-05 14:44:05', 'admin', '2018-06-05 14:44:05', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'OFFLINE_TIME', 'Offline tijd', '', 'OFFLINE_TIME', '', '1', '10', '1', 'admin', '2018-03-22 10:30:54', 'admin', '2018-03-22 14:30:11', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'OFFLINE_TRANS_INTERTEL', 'Offline overdracht van intranet telefoon', '', 'OFFLINE_TRANS_INTERTEL', '', '1', '8', '1', 'admin', '2018-03-22 11:21:27', 'admin', '2018-03-22 14:32:51', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'OFFLINE_TRANS_OUTTEL', 'Offline overdracht van externe netwerk telefoon', '', 'OFFLINE_TRANS_OUTTEL', '', '1', '9', '1', 'admin', '2018-03-22 11:21:59', 'admin', '2018-03-22 14:32:58', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'OTHER', 'Fabrikanten', '', 'OTHER', '', '1', '11', '2', 'admin', '2018-03-22 10:52:10', 'admin', '2018-03-22 14:30:18', '');
INSERT INTO `sys_dict_detail` VALUES ('ef_type', 'out', 'Laat het alarm achter', null, 'out', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('inter_calltype', 'OUT', 'Oproep', null, 'OUT', '#496999', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'page_element', 'Elementen binnen een pagina', null, 'page_element', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'PER', 'Persoonlijke', null, 'PER', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'per_headicon', 'Witte lijst persoon avatar', null, 'per_headicon', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'PRIORITY', 'Prioriteitsniveau', '', 'PRIORITY', '', '1', '7', '1', 'admin', '2018-03-22 10:28:57', 'admin', '2018-03-22 14:31:11', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'season', 'Kwartaal', '', 'season', '', '1', '3', '0', 'admin', '2018-06-05 14:45:11', 'admin', '2018-06-05 14:45:11', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'SOS_ONOFF', 'SOS-schakelaar', '', 'SOS_ONOFF', '', '1', '12', '0', 'admin', '2018-05-24 10:38:36', 'admin', '2018-05-24 10:38:36', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'SSCALL', 'Enkelvoudige oproep', '', 'SSCALL', '', '1', '5', '1', 'admin', '2018-03-22 11:06:06', 'admin', '2018-03-22 14:32:31', '');
INSERT INTO `sys_dict_detail` VALUES ('succ_flag', 'SUCCESS', 'Succes', null, 'SUCCESS', '#49714A', '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('para_cate', 'SYS', 'Systeem', null, 'SYS', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('fn_type', 'system', 'Systeem', null, 'sys', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'system_icon', 'Systeempictogram', null, 'system_icon', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('prb_origin', 'task', 'Taak', '', 'task', '#C84E4E', '1', '0', '0', 'admin', '2018-01-02 14:32:31', 'admin', '2018-01-02 14:32:31', null);
INSERT INTO `sys_dict_detail` VALUES ('att_cate', 'task_attach', 'Taak bijlagen', null, 'task_attach', null, '1', '0', '0', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'TEL', 'Mobiele telefoon', '', 'TEL', '', '1', '5', '1', 'admin', '2018-03-22 10:27:23', 'admin', '2018-03-22 14:30:57', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'TITLE', 'Taken', '', 'TITLE', '', '1', '3', '1', 'admin', '2018-03-22 10:26:26', 'admin', '2018-03-22 14:30:42', '');
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'unix', 'unix', null, 'unix', null, '1', '0', '1', 'admin', '2017-09-11 16:47:00', 'admin', '2017-09-11 16:47:00', null);
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VBR', 'Code rate', '', 'VBR', '', '1', '3', '1', 'admin', '2018-03-22 11:04:35', 'admin', '2018-03-22 14:32:18', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VGA', 'Video resolutie', '', 'VGA', '', '1', '1', '1', 'admin', '2018-03-22 10:59:01', 'admin', '2018-03-22 14:31:48', '');
INSERT INTO `sys_dict_detail` VALUES ('set_field', 'VIDEO_UPLOAD_SOUND', 'Video uploaden audio', '', 'VIDEO_UPLOAD_SOUND', '', '1', '7', '1', 'admin', '2018-03-22 11:20:27', 'admin', '2018-03-22 14:32:45', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'week', 'Week', '', 'week', '', '1', '1', '0', 'admin', '2018-06-05 14:43:50', 'admin', '2018-06-05 14:43:50', null);
INSERT INTO `sys_dict_detail` VALUES ('oper_system', 'windows', 'windows', null, 'windows', '', '1', '0', '2', 'admin', '2017-09-11 16:47:00', 'admin', '2018-06-26 18:58:10', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'WORK_ID', 'Badge', '', 'WORK_ID', '', '1', '4', '1', 'admin', '2018-03-22 10:27:02', 'admin', '2018-03-22 14:30:50', '');
INSERT INTO `sys_dict_detail` VALUES ('view_field', 'WORK_UNIT', 'Eenheid', '', 'WORK_UNIT', '', '1', '1', '1', 'admin', '2018-03-22 10:25:03', 'admin', '2018-03-22 14:30:00', '');
INSERT INTO `sys_dict_detail` VALUES ('cyc_unit', 'year', 'Jaar', '', 'year', '', '1', '4', '0', 'admin', '2018-06-05 14:45:24', 'admin', '2018-06-05 14:45:24', null);
