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
INSERT INTO `sys_dict` VALUES ('admin_area', 'División administrativa', '01', '1', '0', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('app_bitrate', 'Tarifa del código', '05', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('app_framerate', 'Velocidad de fotoGrama', '05', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('app_resolution', 'Resolución', '05', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('att_cate', 'Categoría de adJuntos', '01', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('bgcolor', 'Color de fondo', '03', '0', '1', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('call_ot', 'El Señor se llama identidad', '03', '0', '1', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('call_srvtype', 'Tipo de negocio', '03', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('cam_type', 'Tipo de cámara', '02', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('cas_recstatus', 'Estado de recepción de casos', '04', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('cas_setcate', 'Categoría de conjunto de casos', '04', '0', '0', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('cas_status', 'Estado del caso', '04', '0', '0', '1', '11', null);
INSERT INTO `sys_dict` VALUES ('con_cate', '人员类别', '03', '0', '1', '1', '19', null);
INSERT INTO `sys_dict` VALUES ('con_duty', '人员职务', '03', '0', '0', '1', '18', null);
INSERT INTO `sys_dict` VALUES ('cyc_unit', 'Unidades de ciclo', '04', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('data_right', 'Permisos de datos', '03', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('device_cate', 'Tipo de equipo', '02', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('device_type', 'Tipo de dispositivo', '02', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('dict_cate', 'Categoría de Diccionario', '01', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('ef_type', 'Tipo de valla electrónica', '02', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('fn_type', 'tipo de función', '03', '0', '1', '1', '2', null);
INSERT INTO `sys_dict` VALUES ('grp_member_Type', 'Tipo de miembro del grupo', '03', '0', '1', '1', '13', null);
INSERT INTO `sys_dict` VALUES ('ins_status', 'Estado de la patrulla', '04', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('inter_calltype', 'Modo de invocación', '03', '0', '1', '1', '10', null);
INSERT INTO `sys_dict` VALUES ('ishave', 'No hay ninguna', '01', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('l_status', 'Estado de la línea', '04', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('l_type', 'Tipo de línea', '04', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('media_type', 'Tipo de medios', '03', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('note_status', 'Estado del anuncio', '05', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('oper_system', 'Sistema operativo', '03', '0', '0', '1', '12', null);
INSERT INTO `sys_dict` VALUES ('org_type', 'Tipo de unidad', '03', '0', '1', '1', '3', null);
INSERT INTO `sys_dict` VALUES ('para_cate', 'Categorías de parámetros', '03', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('para_type', 'Clasificación de parámetros', '03', '0', '1', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('pbcate', '通讯录目录类别', '03', '0', '1', '1', '20', null);
INSERT INTO `sys_dict` VALUES ('per_cate', 'Tipo de personal', '04', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('per_relate', 'Relaciones de personal', '03', '0', '1', '1', '17', null);
INSERT INTO `sys_dict` VALUES ('per_selrange', 'Alcance del personal', '05', '0', '1', '1', '5', null);
INSERT INTO `sys_dict` VALUES ('prb_cate', 'Tipo de problema', '04', '0', '0', '1', '7', null);
INSERT INTO `sys_dict` VALUES ('prb_origin', 'Origen del problema', '04', '0', '1', '1', '8', null);
INSERT INTO `sys_dict` VALUES ('prb_status', 'Estado del problema', '04', '0', '1', '1', '9', null);
INSERT INTO `sys_dict` VALUES ('priority_level', 'Nivel de prioridad', '02', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('set_field', 'Propiedades de configuración de terminal', '03', '0', '1', '1', '15', null);
INSERT INTO `sys_dict` VALUES ('sex', 'Género', '01', '0', '0', '1', '4', null);
INSERT INTO `sys_dict` VALUES ('status', 'Estado válido', '01', '0', '1', '1', '1', null);
INSERT INTO `sys_dict` VALUES ('succ_flag', 'Signo de éxito', '03', '0', '1', '1', '6', null);
INSERT INTO `sys_dict` VALUES ('task_status', 'Estado de la tarea', '04', '0', '1', '1', '0', null);
INSERT INTO `sys_dict` VALUES ('tsk_eval', 'Nivel de evaluación', '04', '0', '1', '1', '3', '');
INSERT INTO `sys_dict` VALUES ('view_field', 'Propiedades de visualización de terminal', '03', '0', '1', '1', '14', null);
INSERT INTO `sys_dict` VALUES ('wl_status', 'Estado de la lista blanca', '03', '0', '1', '1', '16', null);
INSERT INTO `sys_dict` VALUES ('yesorno', 'Si', '01', '0', '1', '1', '2', null);
