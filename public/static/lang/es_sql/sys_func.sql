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
INSERT INTO `sys_func` VALUES ('001', 'Plataforma de comandos de comunicaciones integradas', 'Plataforma de comandos de comunicaciones integradas', 'system', null, null, null, '0', '1', '0', '0', null);
INSERT INTO `sys_func` VALUES ('001000', 'Crear una situación policial', 'Crear una situación policial', 'menu', 'createCase()', null, '&#xe6ec', '0', '1', '001', '0', '');
INSERT INTO `sys_func` VALUES ('001001', 'Comando y envío', 'Comando y envío', 'menu', 'dispatch/dispatch', null, '&#xe60b', '0', '1', '001', '1', null);
INSERT INTO `sys_func` VALUES ('001002', 'Gestión de plataformas', 'Gestión de plataformas', 'menu_group', null, null, '&#xe608', '0', '1', '001', '2', 'static/img/sys_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001002001', 'Registro de la unidad', 'Gestión de la plataforma-registro unitario', 'menu', 'system/orgInfo', null, '&#xe643', '0', '1', '001002', '5', null);
INSERT INTO `sys_func` VALUES ('001002002', 'Gestión de roles', 'Gestión de funciones de la plataforma', 'menu', 'system/role', null, '&#xe623', '0', '1', '001002', '6', null);
INSERT INTO `sys_func` VALUES ('001002003', 'Tipo de equipo', 'Gestión de plataformas-tipo de dispositivo', 'menu', 'system/deviceType', null, '&#xe63a', '0', '1', '001002', '7', null);
INSERT INTO `sys_func` VALUES ('001002004', 'Diccionario de datos', 'Gestión de la plataforma-Data Word', 'menu', 'system/dict', null, '&#xe63a', '0', '1', '001002', '8', null);
INSERT INTO `sys_func` VALUES ('001002005', 'Cuenta del sistema', 'Administración de la plataforma-cuenta del sistema', 'menu', 'system/openAccount', null, '&#xe63e', '0', '1', '001002', '9', null);
INSERT INTO `sys_func` VALUES ('001002006', 'Gestión de listas blancas', 'Gestión de plataformas-gestión de listas blancas', 'menu', 'system/whiteList', null, '&#xe63a', '0', '1', '001002', '10', null);
INSERT INTO `sys_func` VALUES ('001002007', 'Administración de logs', 'Administración de la plataforma: administración de logs', 'menu_group', null, null, '&#xe646', '0', '1', '001002', '11', null);
INSERT INTO `sys_func` VALUES ('001002007001', 'Registro de la operación', 'Administración de la plataforma-administración de logs-registro de operaciones', 'menu', 'system/operLog', null, '&#xe63a', '0', '1', '001002007', '12', null);
INSERT INTO `sys_func` VALUES ('001002007002', 'Registro de comunicación', 'Gestión de plataformas-gestión de logs-registros de comunicación', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001002007', '13', null);
INSERT INTO `sys_func` VALUES ('001002007003', 'Log de interfaz', 'Administración de plataformas-administración de logs-registros de interfaces', 'menu', 'system/interLog', null, '&#xe63a', '0', '1', '001002007', '14', null);
INSERT INTO `sys_func` VALUES ('001002008', 'Configuración de alarma', 'Gestión de plataformas-configuración de alarmas', 'menu', 'system/anjianbianhanguanli', null, '&#xe63a', '0', '1', '001002', '15', null);
INSERT INTO `sys_func` VALUES ('001002009', 'Gestión de libreta de direcciones', 'Gestión de plataformas-configuración de alarmas', 'menu', 'system/phoneBook', null, '&#xe63a', '0', '1', '001002', '16', null);
INSERT INTO `sys_func` VALUES ('001003', 'Gestión empresarial', 'Gestión empresarial', 'menu_group', null, null, '&#xe60c', '0', '1', '001', '3', 'static/img/busi_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001003001', 'Registro de comunicación', 'Gestión de empresas-logs de comunicación', 'menu', 'system/commLog', null, '&#xe63a', '0', '1', '001003', '15', null);
INSERT INTO `sys_func` VALUES ('001003002', 'Gestión empresarial', 'Gestión de empresas-avisos de notificación', 'menu', 'basic/sysNotice', null, '&#xe63a', '0', '1', '001003', '16', null);
INSERT INTO `sys_func` VALUES ('001003003', 'Gestión de tareas', 'Gestión de empresas-gestión de tareas', 'menu_group', 'system/system_manager.jsp', null, '&#xe63a', '0', '1', '001003', '17', null);
INSERT INTO `sys_func` VALUES ('001003003001', 'Categoría de tarea', 'Gestión de empresas-gestión de tareas-categoría de tareas', 'menu', 'task/temIframe', null, '&#xe63a', '0', '1', '001003003', '34', null);
INSERT INTO `sys_func` VALUES ('001003003002', 'Plantilla de evaluación', 'Gestión de empresas-gestión de tareas-plantillas de evaluación', 'menu', 'task/deviceEvaluate.jsp', null, '&#xe63a', '0', '1', '001003003', '35', null);
INSERT INTO `sys_func` VALUES ('001003003003', 'Lista de tareas', 'Gestión de empresas-gestión de tareas-lista de tareas', 'menu', 'task/taskManagement', null, '&#xe63a', '0', '1', '001003003', '36', null);
INSERT INTO `sys_func` VALUES ('001003004', 'Gestión de patrullas', 'Gestión de empresas-gestión de patrullas', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '18', null);
INSERT INTO `sys_func` VALUES ('001003004001', 'Plantillas de error', 'Administración de empresas-gestión de patrullas-plantillas de fallas', 'menu', 'inspection/failureTemplate', null, '&#xe633', '0', '1', '001003004', '19', null);
INSERT INTO `sys_func` VALUES ('001003004002', 'Configuración de línea', 'Gestión de empresas-gestión de patrullas-configuración de línea', 'menu', 'inspection/lineSetting', null, '&#xe63a', '0', '1', '001003004', '20', null);
INSERT INTO `sys_func` VALUES ('001003004003', 'Monitoreo de patrullas', 'Gestión de empresas-supervisión de patrullas', 'menu', 'inspection/inspecteControl', null, '&#xe63a', '0', '1', '001003004', '21', null);
INSERT INTO `sys_func` VALUES ('001003004004', 'Registro de patrulla', 'Gestión de empresas-patrulla de gestión-registro de patrulla', 'menu', 'inspection/inspectLog', null, '&#xe63a', '0', '1', '001003004', '22', null);
INSERT INTO `sys_func` VALUES ('001003004005', 'Gestión de problemas', 'Gestión de empresas-gestión de patrullas-gestión de problemas', 'menu', 'inspection/problemManage', null, '&#xe63a', '0', '1', '001003004', '23', null);
INSERT INTO `sys_func` VALUES ('001003006', 'Gestión de asistencia', 'Gestión de empresas-gestión de asistencia', 'menu_group', null, null, '&#xe63a', '0', '1', '001003', '20', null);
INSERT INTO `sys_func` VALUES ('001003006001', 'Configuración de vacaciones', 'Gestión de empresas-gestión de asistencia-configuración vacacional', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '21', null);
INSERT INTO `sys_func` VALUES ('001003006002', 'Configuración del grupo de asistencia', 'Gestión de empresas-gestión de asistencia-configuración de grupo de tiempo', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '22', null);
INSERT INTO `sys_func` VALUES ('001003006003', 'Gestión de horas extras', 'Gestión de empresas-gestión de asistencia-gestión de horas extras', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '23', null);
INSERT INTO `sys_func` VALUES ('001003006004', 'Gestión de licencia', 'Gestión de empresas-gestión de asistencia-gestión de licencia', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '24', null);
INSERT INTO `sys_func` VALUES ('001003006005', 'Gestión de campo', 'Gestión de empresas-gestión de asistencia-gestión de campos', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '25', null);
INSERT INTO `sys_func` VALUES ('001003006006', 'Procesamiento de asistencia', 'Dirección de empresas-gestión de asistencia-procesamiento de asistencia', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '26', null);
INSERT INTO `sys_func` VALUES ('001003006007', 'Procesamiento de asistencia', 'Gestión de empresas-gestión de asistencia-estadísticas de asistencia', 'menu', null, null, '&#xe63a', '0', '1', '001003006', '27', null);
INSERT INTO `sys_func` VALUES ('001003007', 'Gestión de inteligencia policial', 'Gerencia de negocio-gerencia de la inteligencia de la policía', 'menu', 'basic/upCase', null, '&#xe63a', '0', '1', '001003', '28', null);
INSERT INTO `sys_func` VALUES ('001004', 'Análisis de la decisión', 'Análisis de la decisión', 'menu_group', null, null, '&#xe60a', '0', '1', '001', '4', 'static/img/stat_bgpic.jpg');
INSERT INTO `sys_func` VALUES ('001004001', 'Situación básica', 'Análisis de la decisión-condiciones básicas', 'menu', 'system/manager', null, '&#xe63a', '0', '1', '001004', '40', null);
INSERT INTO `sys_func` VALUES ('001004002', 'Análisis de tareas', 'Análisis de la decisión-análisis de tareas', 'menu', null, null, '&#xe63a', '0', '1', '001004', '41', null);
INSERT INTO `sys_func` VALUES ('001004003', 'Análisis de patrullas', 'Análisis de decisiones-análisis de patrullas', 'menu', null, null, '&#xe63a', '0', '1', '001004', '42', null);
INSERT INTO `sys_func` VALUES ('001004004', 'Problem analysis', 'Análisis de la decisión-análisis del problema', 'menu', null, null, '&#xe63a', '0', '1', '001004', '43', null);
INSERT INTO `sys_func` VALUES ('001004005', 'Problem analysis', 'Análisis de la decisión-análisis de asistencia', 'menu', null, null, '&#xe63a', '0', '1', '001004', '44', null);
INSERT INTO `sys_func` VALUES ('001004006', 'Análisis de rendimiento', 'Análisis de la decisión-análisis de rendimiento', 'menu', 'inspection/testMap', null, '&#xe63a', '0', '1', '001004', '45', null);
