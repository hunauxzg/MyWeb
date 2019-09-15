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
INSERT INTO `sys_func` VALUES ('001', 'Geïntegreerd communicatie commando platform', 'Geïntegreerd communicatie commando platform', 'system', null, null, null, '0', '1', '0', '0', null);
INSERT INTO `sys_func` VALUES ('001000', 'Een politie situatie creëren', 'Een politie situatie creëren', 'menu', 'createCase()', null, '&#xe6ec', '0', '1', '001', '0', '');
INSERT INTO `sys_func` VALUES ('001001', 'Opdracht en VerzenDing', 'Opdracht en VerzenDing', 'menu', 'dispatch/dispatch', null, '&#xe60b', '0', '1', '001', '1', null);
INSERT INTO `sys_func` VALUES ('001002', 'Platform Management', 'Platform Management', 'menu_group', null, null, '&#xe608', '0', '1', '001', '2', 'static/img/sys_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001002001', 'Eenheid registratie', 'Platform Management-eenheid registratie', 'menu', 'system/orgInfo', null, '&#xe643', '0', '1', '001002', '5', null);
INSERT INTO `sys_func` VALUES ('001002002', 'Rollen beheer', 'Platform management-rollen beheer', 'menu', 'system/role', null, '&#xe623', '0', '1', '001002', '6', null);
INSERT INTO `sys_func` VALUES ('001002003', 'Type uitrusting', 'Platform management-type apparaat', 'menu', 'system/deviceType', null, '&#xe63a', '0', '1', '001002', '7', null);
INSERT INTO `sys_func` VALUES ('001002004', 'Data dictionary', 'Platform management-data woord', 'menu', 'system/dict', null, '&#xe63a', '0', '1', '001002', '8', null);
INSERT INTO `sys_func` VALUES ('001002005', 'Systeem account', 'Platform Management-systeemaccount', 'menu', 'system/openAccount', null, '&#xe63e', '0', '1', '001002', '9', null);
INSERT INTO `sys_func` VALUES ('001002006', 'White list management', 'Platform Management-whitelist Management', 'menu', 'system/whiteList', null, '&#xe63a', '0', '1', '001002', '10', null);
INSERT INTO `sys_func` VALUES ('001002007', 'LogboekBeheer', 'Platform Management-Log Management', 'menu_group', null, null, '&#xe646', '0', '1', '001002', '11', null);
INSERT INTO `sys_func` VALUES ('001002007001', 'Operatie logboek', 'Platform Management-Log Management-Operations log', 'menu', 'system/operLog', null, '&#xe63a', '0', '1', '001002007', '12', null);
INSERT INTO `sys_func` VALUES ('001002007002', 'Communicatie logboek', 'Platform Management-Log Management-communicatie logs', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001002007', '13', null);
INSERT INTO `sys_func` VALUES ('001002007003', 'Interface logboek', 'Platform Management-Log Management-Interface logs', 'menu', 'system/interLog', null, '&#xe63a', '0', '1', '001002007', '14', null);
INSERT INTO `sys_func` VALUES ('001002008', 'Alarm instellingen', 'Platform Management-Alarm instellingen', 'menu', 'system/anjianbianhanguanli', null, '&#xe63a', '0', '1', '001002', '15', null);
INSERT INTO `sys_func` VALUES ('001002009', 'AdresBoek beheer', 'Platform Management-Adresboek beheer', 'menu', 'system/phoneBook', null, '&#xe63a', '0', '1', '001002', '16', null);
INSERT INTO `sys_func` VALUES ('001003', 'BedrijfsVoering', 'BedrijfsVoering', 'menu_group', null, null, '&#xe60c', '0', '1', '001', '3', 'static/img/busi_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001003001', 'Communicatie logboek', 'Business Management-communicatie logs', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001003', '15', null);
INSERT INTO `sys_func` VALUES ('001003002', 'Aankondiging medeDeling', 'Business Management-notificatie aankondigingen', 'menu', 'basic/sysNotice', null, '&#xe63a', '0', '1', '001003', '16', null);
INSERT INTO `sys_func` VALUES ('001003003', 'Taakbeheer', 'Business Management-Taakbeheer', 'menu_group', 'system/system_manager.jsp', null, '&#xe63a', '0', '1', '001003', '17', null);
INSERT INTO `sys_func` VALUES ('001003003001', 'Taakcategorie', 'Business Management-Taakbeheer-taakcategorie', 'menu', 'task/temIframe', null, '&#xe63a', '0', '1', '001003003', '34', null);
INSERT INTO `sys_func` VALUES ('001003003002', 'Evaluatie sjabloon', 'Business Management-Task Management-evaluatie templates', 'menu', 'task/deviceEvaluate.jsp', null, '&#xe63a', '0', '1', '001003003', '35', null);
INSERT INTO `sys_func` VALUES ('001003003003', 'TakenLijst', 'Business Management-Taakbeheer-TakenLijst', 'menu', 'task/taskManagement', null, '&#xe63a', '0', '1', '001003003', '36', null);
INSERT INTO `sys_func` VALUES ('001003004', 'Patrouille beheer', 'Business Management-patrouille Management', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '18', null);
INSERT INTO `sys_func` VALUES ('001003004001', 'Niet-sjablonen', 'Business Management-Patrol management-niet sjablonen', 'menu', 'inspection/failureTemplate', null, '&#xe633', '0', '1', '001003004', '19', null);
INSERT INTO `sys_func` VALUES ('001003004002', 'RegelInstellingen', 'Business Management-patrouille Management-line Setup', 'menu', 'inspection/lineSetting', null, '&#xe63a', '0', '1', '001003004', '20', null);
INSERT INTO `sys_func` VALUES ('001003004003', 'Patrouille controle', 'Business Management-patrouille Management-patrouille bewaking', 'menu', 'inspection/inspecteControl', null, '&#xe63a', '0', '1', '001003004', '21', null);
INSERT INTO `sys_func` VALUES ('001003004004', 'Patrouille logboek', 'Business Management-patrouille beheer-patrouille logboek', 'menu', 'inspection/inspectLog', null, '&#xe63a', '0', '1', '001003004', '22', null);
INSERT INTO `sys_func` VALUES ('001003004005', 'Probleemmanagement', 'Business Management-Patrol Management-probleemmanagement', 'menu', 'inspection/problemManage', null, '&#xe63a', '0', '1', '001003004', '23', null);
INSERT INTO `sys_func` VALUES ('001003006', 'Aanwezigheid Management', 'BedrijfsManagement-presentie beheer', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '20', null);
INSERT INTO `sys_func` VALUES ('001003006001', 'Vakantie-instellingen', 'BedrijfsManagement-aanwezigheids Management-vakantie-instellingen', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '21', null);
INSERT INTO `sys_func` VALUES ('001003006002', 'Instellingen van aanwezigheids groep', 'Business Management-aanwezigheids management-tijd groep instellen', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '22', null);
INSERT INTO `sys_func` VALUES ('001003006003', 'Beheer van overwerk', 'BedrijfsManagement-presentie beheer-overwerk beheer', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '23', null);
INSERT INTO `sys_func` VALUES ('001003006004', 'Verlof management', 'BedrijfsManagement-presentie beheer-Leave Management', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '24', null);
INSERT INTO `sys_func` VALUES ('001003006005', 'VeldBeheer', 'BedrijfsManagement-presentie Management-Field Management', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '25', null);
INSERT INTO `sys_func` VALUES ('001003006006', 'Aanwezigheids verwerking', 'BedrijfsManagement-presentie beheer-aanwezigheids verwerking', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '26', null);
INSERT INTO `sys_func` VALUES ('001003006007', 'PresentieLijst statistieken', 'BedrijfsBeheer-presentie beheer-presentielijst statistieken', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '27', null);
INSERT INTO `sys_func` VALUES ('001003007', 'Politie Intelligence Management', 'BedrijfsVoering-politie Intelligence Management', 'menu', 'basic/upCase', null, '&#xe63a', '0', '1', '001003', '28', null);
INSERT INTO `sys_func` VALUES ('001004', 'Besluit analyse', 'Besluit analyse', 'menu_group', null, null, '&#xe60a', '0', '1', '001', '4', 'static/img/stat_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001004001', 'Basissituatie', 'Besluit analyse-basisvoorwaarden', 'menu', 'system/manager', null, '&#xe63a', '0', '1', '001004', '40', null);
INSERT INTO `sys_func` VALUES ('001004002', 'Taak analyse', 'Besluit analyse-taak analyse', 'menu', null, null, '&#xe63a', '0', '1', '001004', '41', null);
INSERT INTO `sys_func` VALUES ('001004003', 'Patrouille analyse', 'Besluit analyse-patrouille analyse', 'menu', null, null, '&#xe63a', '0', '1', '001004', '42', null);
INSERT INTO `sys_func` VALUES ('001004004', 'Probleemanalyse', 'Besluit analyse-probleemanalyse', 'menu', null, null, '&#xe63a', '0', '1', '001004', '43', null);
INSERT INTO `sys_func` VALUES ('001004005', 'Aanwezigheids analyse', 'Besluit analyse-presentie analyse', 'menu', null, null, '&#xe63a', '0', '1', '001004', '44', null);
INSERT INTO `sys_func` VALUES ('001004006', 'Prestatie-analyse', 'Besluit analyse-prestatieanalyse', 'menu', 'inspection/testMap', null, '&#xe63a', '0', '1', '001004', '45', null);
