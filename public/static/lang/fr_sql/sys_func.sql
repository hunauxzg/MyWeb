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
INSERT INTO `sys_func` VALUES ('001', 'Plate-forme de commande de communications intégrées', 'Plate-forme de commande de communications intégrées', 'system', null, null, null, '0', '1', '0', '0', null);
INSERT INTO `sys_func` VALUES ('001000', 'Créer une situation policière', 'Créer une situation policière', 'menu', 'createCase()', null, '&#xe6ec', '0', '1', '001', '0', '');
INSERT INTO `sys_func` VALUES ('001001', 'Commandement et expédition', 'Commandement et expédition', 'menu', 'dispatch/dispatch', null, '&#xe60b', '0', '1', '001', '1', null);
INSERT INTO `sys_func` VALUES ('001002', 'Gestion de plate-forme', 'Gestion de plate-forme', 'menu_group', null, null, '&#xe608', '0', '1', '001', '2', 'static/img/sys_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001002001', 'Enregistrement de l'unité', 'Gestion de plate-forme-enregistrement unitaire', 'menu', 'system/orgInfo', null, '&#xe643', '0', '1', '001002', '5', null);
INSERT INTO `sys_func` VALUES ('001002002', 'Gestion des rôles', 'Gestion des plateformes-gestion des rôles', 'menu', 'system/role', null, '&#xe623', '0', '1', '001002', '6', null);
INSERT INTO `sys_func` VALUES ('001002003', 'Type d'équipement', 'Gestion de plate-forme-type d'appareil', 'menu', 'system/deviceType', null, '&#xe63a', '0', '1', '001002', '7', null);
INSERT INTO `sys_func` VALUES ('001002004', 'Dictionnaire de données', 'Gestion de plate-forme-mot de données', 'menu', 'system/dict', null, '&#xe63a', '0', '1', '001002', '8', null);
INSERT INTO `sys_func` VALUES ('001002005', 'Compte système', 'Plate-forme de gestion-compte système', 'menu', 'system/openAccount', null, '&#xe63e', '0', '1', '001002', '9', null);
INSERT INTO `sys_func` VALUES ('001002006', 'Gestion des listes blanches', 'Gestion de la plate-forme-gestion des listes blanches', 'menu', 'system/whiteList', null, '&#xe63a', '0', '1', '001002', '10', null);
INSERT INTO `sys_func` VALUES ('001002007', 'Gestion des logs', 'Gestion des plateformes-gestion des logs', 'menu_group', null, null, '&#xe646', '0', '1', '001002', '11', null);
INSERT INTO `sys_func` VALUES ('001002007001', 'Journal des opérations', 'Gestion de la plate-forme-gestion des journaux-Journal des opérations', 'menu', 'system/operLog', null, '&#xe63a', '0', '1', '001002007', '12', null);
INSERT INTO `sys_func` VALUES ('001002007002', 'Journal de communication', 'Gestion de la plate-forme-gestion des journaux-journaux de communication', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001002007', '13', null);
INSERT INTO `sys_func` VALUES ('001002007003', 'Journal d'interface', 'Gestion de plate-forme-gestion de journal-journaux d'interface', 'menu', 'system/interLog', null, '&#xe63a', '0', '1', '001002007', '14', null);
INSERT INTO `sys_func` VALUES ('001002008', 'Paramètres d'alarme', 'Gestion de plate-forme-paramètres d'alarme', 'menu', 'system/anjianbianhanguanli', null, '&#xe63a', '0', '1', '001002', '15', null);
INSERT INTO `sys_func` VALUES ('001002009', 'Gestion du carnet d'adresses', 'Gestion de plate-forme-gestion de carnet d'adresses', 'menu', 'system/phoneBook', null, '&#xe63a', '0', '1', '001002', '16', null);
INSERT INTO `sys_func` VALUES ('001003', 'Gestion des affaires', 'Gestion des affaires', 'menu_group', null, null, '&#xe60c', '0', '1', '001', '3', 'static/img/busi_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001003001', 'Journal de communication', 'Gestion des affaires-journaux de communication', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001003', '15', null);
INSERT INTO `sys_func` VALUES ('001003002', 'Avis d'annonce', 'Gestion d'entreprise-annonces de notification', 'menu', 'basic/sysNotice', null, '&#xe63a', '0', '1', '001003', '16', null);
INSERT INTO `sys_func` VALUES ('001003003', 'Gestion des tâches', 'Gestion d'entreprise-gestion des tâches', 'menu_group', 'system/system_manager.jsp', null, '&#xe63a', '0', '1', '001003', '17', null);
INSERT INTO `sys_func` VALUES ('001003003001', 'Catégorie de tâches', 'Gestion d'entreprise-gestion des tâches-catégorie de tâches', 'menu', 'task/temIframe', null, '&#xe63a', '0', '1', '001003003', '34', null);
INSERT INTO `sys_func` VALUES ('001003003002', 'Modèle d'évaluation', 'Gestion d'entreprise-gestion des tâches-modèles d'évaluation', 'menu', 'task/deviceEvaluate.jsp', null, '&#xe63a', '0', '1', '001003003', '35', null);
INSERT INTO `sys_func` VALUES ('001003003003', 'Liste des tâches', 'Gestion d'entreprise-gestion des tâches-Liste des tâches', 'menu', 'task/taskManagement', null, '&#xe63a', '0', '1', '001003003', '36', null);
INSERT INTO `sys_func` VALUES ('001003004', 'Gestion des patrouilles', 'Gestion des affaires-gestion des patrouilles', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '18', null);
INSERT INTO `sys_func` VALUES ('001003004001', 'Modèles d'échec', 'Gestion d'entreprise-gestion des patrouilles-modèles de défaillance', 'menu', 'inspection/failureTemplate', null, '&#xe633', '0', '1', '001003004', '19', null);
INSERT INTO `sys_func` VALUES ('001003004002', 'Configuration de ligne', 'Gestion d'entreprise-gestion de patrouille-configuration de ligne', 'menu', 'inspection/lineSetting', null, '&#xe63a', '0', '1', '001003004', '20', null);
INSERT INTO `sys_func` VALUES ('001003004003', 'Surveillance de patrouille', 'Gestion d'entreprise-gestion de patrouille-surveillance de patrouille', 'menu', 'inspection/inspecteControl', null, '&#xe63a', '0', '1', '001003004', '21', null);
INSERT INTO `sys_func` VALUES ('001003004004', 'Journal de patrouille', 'Gestion d'entreprise-gestion de patrouille-journal de patrouille', 'menu', 'inspection/inspectLog', null, '&#xe63a', '0', '1', '001003004', '22', null);
INSERT INTO `sys_func` VALUES ('001003004005', 'Problem Management', 'Gestion des affaires-gestion des patrouilles-gestion des problèmes', 'menu', 'inspection/problemManage', null, '&#xe63a', '0', '1', '001003004', '23', null);
INSERT INTO `sys_func` VALUES ('001003006', 'Gestion des présences', 'Gestion d'entreprise-gestion des fréquentations', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '20', null);
INSERT INTO `sys_func` VALUES ('001003006001', 'Paramètres de vacances', 'Gestion d'entreprise-gestion des fréquentations-paramètres de vacances', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '21', null);
INSERT INTO `sys_func` VALUES ('001003006002', 'Configuration du groupe de présence', 'Gestion d'entreprise-gestion des fréquentations-configuration du groupe de temps', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '22', null);
INSERT INTO `sys_func` VALUES ('001003006003', 'Gestion des heures supplémentaires', 'Gestion d'entreprise-gestion des fréquentations-gestion des heures supplémentaires', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '23', null);
INSERT INTO `sys_func` VALUES ('001003006004', 'Gestion des congés', 'Gestion d'entreprise-gestion des fréquentations-gestion des congés', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '24', null);
INSERT INTO `sys_func` VALUES ('001003006005', 'Gestion de terrain', 'Gestion d'entreprise-gestion des présences-gestion de terrain', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '25', null);
INSERT INTO `sys_func` VALUES ('001003006006', 'Traitement des présences', 'Gestion d'entreprise-gestion des fréquentations-traitement des présences', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '26', null);
INSERT INTO `sys_func` VALUES ('001003006007', 'Statistiques de présence', 'Gestion d'entreprise-gestion des fréquentations-statistiques de présence', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '27', null);
INSERT INTO `sys_func` VALUES ('001003007', 'Gestion du renseignement policier', 'Gestion des affaires-gestion du renseignement policier', 'menu', 'basic/upCase', null, '&#xe63a', '0', '1', '001003', '28', null);
INSERT INTO `sys_func` VALUES ('001004', 'Analyse des décisions', 'Analyse des décisions', 'menu_group', null, null, '&#xe60a', '0', '1', '001', '4', 'static/img/stat_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001004001', 'Situation de base', 'ANALYSE décisionnelle-conditions de base', 'menu', 'system/manager', null, '&#xe63a', '0', '1', '001004', '40', null);
INSERT INTO `sys_func` VALUES ('001004002', 'Analyse des tâches', 'Analyse des décisions-analyse des tâches', 'menu', null, null, '&#xe63a', '0', '1', '001004', '41', null);
INSERT INTO `sys_func` VALUES ('001004003', 'Analyse de patrouille', 'Analyse des décisions-analyse des patrouilles', 'menu', null, null, '&#xe63a', '0', '1', '001004', '42', null);
INSERT INTO `sys_func` VALUES ('001004004', 'Analyse des problèmes', 'ANALYSE des décisions-analyse des problèmes', 'menu', null, null, '&#xe63a', '0', '1', '001004', '43', null);
INSERT INTO `sys_func` VALUES ('001004005', 'Analyse de présence', 'Analyse des décisions-analyse de la présence', 'menu', null, null, '&#xe63a', '0', '1', '001004', '44', null);
INSERT INTO `sys_func` VALUES ('001004006', 'Analyse des performances', 'Analyse des décisions-analyse des performances', 'menu', 'inspection/testMap', null, '&#xe63a', '0', '1', '001004', '45', null);
