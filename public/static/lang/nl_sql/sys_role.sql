/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:08:20
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `ROLE_CODE` varchar(32) NOT NULL COMMENT '角色编码',
  `ROLE_NAME` varchar(32) NOT NULL COMMENT '角色名称',
  `IS_SYS` varchar(32) DEFAULT NULL COMMENT '是否内置:0否，1是，内置的角色信息不允许删除，只允许修改数据权限与功能权限。',
  `DATA_RIGHT` varchar(32) NOT NULL COMMENT '数据权限:0个人级、1部门级、2单位级、3全部，数据字典定义。',
  `VERSION` int(11) DEFAULT NULL COMMENT '版本号:数据版本号，用于并发控制，初始为0，每更新一次自动加1。',
  `CREATOR` varchar(32) DEFAULT NULL COMMENT '创建人',
  `CREATE_DATE` varchar(19) DEFAULT NULL COMMENT '创建时间',
  `UPDATOR` varchar(32) DEFAULT NULL COMMENT '修改人',
  `UPDATE_DATE` varchar(19) DEFAULT NULL COMMENT '修改时间',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`ROLE_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='角色信息表';

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES ('001', 'Systeembeheerder', '1', '3', '3', 'admin', '2017-09-09 17:37:00', 'admin', null, '');
INSERT INTO `sys_role` VALUES ('002', 'Unit manager', '1', '2', '9', 'admin', '2017-09-09 17:37:00', 'admin', null, '');
INSERT INTO `sys_role` VALUES ('003', 'Senior dispatcher', '1', '2', '11', 'admin', '2017-09-09 17:37:00', 'admin', null, '');
INSERT INTO `sys_role` VALUES ('004', 'Algemene coördinator', '1', '1', '10', 'admin', '2017-09-09 17:37:00', 'admin', null, '');
INSERT INTO `sys_role` VALUES ('005', 'Teamleider', '1', '1', '1', 'admin', '2017-09-09 17:37:00', 'admin', '2017-09-09 17:37:00', null);
INSERT INTO `sys_role` VALUES ('006', 'Groepslid', '1', '0', '1', 'admin', '2017-09-09 17:37:00', 'admin', '2017-09-09 17:37:00', null);
