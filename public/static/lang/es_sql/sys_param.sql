/*
Navicat MySQL Data Transfer

Source Server         : 21
Source Server Version : 50610
Source Host           : 124.160.11.21:21217
Source Database       : comm

Target Server Type    : MYSQL
Target Server Version : 50610
File Encoding         : 65001

Date: 2018-10-26 11:08:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_param
-- ----------------------------
DROP TABLE IF EXISTS `sys_param`;
CREATE TABLE `sys_param` (
  `PARA_CODE` varchar(64) NOT NULL COMMENT '参数代码',
  `PARA_NAME` varchar(128) NOT NULL COMMENT '参数名称',
  `PARA_TYPE` varchar(32) NOT NULL COMMENT '参数分类:通用设置，底层通讯，平台管理等，数据字典定义。',
  `PARA_CATE` varchar(32) NOT NULL COMMENT '参数类别:SYS系统级参数，COMP公司级个人参数，PER个人级参数，数据字典定义。',
  `DATA_TYPE` varchar(32) DEFAULT NULL COMMENT '数据类型',
  `WIDGET_HTML` varchar(1024) DEFAULT NULL COMMENT '控件脚本',
  `DEF_VALUE` varchar(256) NOT NULL COMMENT '默认值',
  `PARA_VALUE` varchar(256) NOT NULL COMMENT '参数值',
  `SORTNO` int(11) DEFAULT NULL COMMENT '排序号',
  `MEMO` varchar(512) DEFAULT NULL COMMENT '参数说明',
  PRIMARY KEY (`PARA_CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统参数表';

-- ----------------------------
-- Records of sys_param
-- ----------------------------
INSERT INTO `sys_param` VALUES ('browserType', 'Tipo de navegador', '4-other', 'SYS', 'string', '<select name=\"browserType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"chrome\">谷歌浏览器</option>\r\n		<option value=\"ie\">IE浏览器</option>\r\n		<option value=\"firefox\">火狐浏览器</option>\r\n</select>', 'chrome', 'chrome', '11', '浏览器类型');
INSERT INTO `sys_param` VALUES ('checkNumSeg', 'Comprueba el número de apertura', '2-busi', 'COMP', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '15', '系统开户时，是否对号段进行严格检查');
INSERT INTO `sys_param` VALUES ('dispatchType', 'Tipo de control', '2-busi', 'COMP', 'string', '<select name=\"dispatchType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"haveMap\">带地图调度台</option>\r\n		<option value=\"normal\">普通调度台</option>\r\n</select>', 'haveMap', 'haveMap', '16', '调度台界面类型');
INSERT INTO `sys_param` VALUES ('dispShowMode', 'El mostrador muestra patrones', '3-per', 'PER', 'string', '<select name=\"dispShowMode\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"PC\">PC模式</option>\r\n		<option value=\"touch\">触摸屏模式</option>\r\n</select>', 'PC', 'PC', '24', '调度台显示模式');
INSERT INTO `sys_param` VALUES ('errRange', 'Margen de error permitido', '2-busi', 'COMP', 'number', '<input type=\"text\">', '100', '100', '8', '允许误差范围');
INSERT INTO `sys_param` VALUES ('gps_url', 'Dirección de servicios GPS', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10005', 'ws://124.160.11.21:10005', '0', '通讯服务器GPS的WEBSOCKET地址');
INSERT INTO `sys_param` VALUES ('haveTask', 'Apoyo a la misión', '4-other', 'SYS', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'false', '12', '任务支持');
INSERT INTO `sys_param` VALUES ('iMaxCall', 'Número máximo de llamadas', '0-comm', 'SYS', 'number', '<input type=\"text\">', '32', '32', '2', '单个通讯连接最大呼叫数');
INSERT INTO `sys_param` VALUES ('iMaxGpsSubs', 'Número máximo de suscripciones GPS', '0-comm', 'SYS', 'number', '<input type=\"text\">', '4096', '4096', '4', '单个通讯连接最大GPS订阅数');
INSERT INTO `sys_param` VALUES ('iMaxStatueSubs', 'Número máximo de suscripciones', '0-comm', 'SYS', 'number', '<input type=\"text\">', '1', '1', '3', '单个通讯连接最大状态订阅数');
INSERT INTO `sys_param` VALUES ('iMaxTrans', 'Número máximo de transacciones', '0-comm', 'SYS', 'number', '<input type=\"text\">', '32', '1024', '1', '单个通讯连接最大事务数');
INSERT INTO `sys_param` VALUES ('inspDistance', 'Espacio de inspección', '2-busi', 'COMP', 'number', '<input type=\"text\">', '200', '200', '7', '巡检间距');
INSERT INTO `sys_param` VALUES ('mapEnv', 'Tipo de mapa del medio ambiente', '1-map', 'SYS', 'string', '<select name=\"mapEnv\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"online\">在线</option>\r\n		<option value=\"offline\">离线</option>\r\n</select>', 'online', 'online', '6', '地图环境类型');
INSERT INTO `sys_param` VALUES ('mapImgFileExt', 'Extensión del mapa de la línea desconectada', '1-map', 'SYS', 'string', '<select name=\"mapEnv\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\".png\">png</option>\r\n		<option value=\".jpg\">jpg</option>\r\n</select>', '.png', '.jpg', '8', '离线地图图片扩展名');
INSERT INTO `sys_param` VALUES ('mapInitLevel', 'Escala de escala por omisión', '2-busi', 'COMP', 'number', '<input type=\"text\">', '16', '16', '14', '默认地图缩放显示级别');
INSERT INTO `sys_param` VALUES ('mapInitPoint', 'Las coordenadas del mapa predefinido', '2-busi', 'COMP', 'string', '<input type=\"text\" onclick=\"fn_simpleSetPosition(this)\">', '120.147288,30.260963', '120.147288,30.260963', '13', '默认地图中心坐标');
INSERT INTO `sys_param` VALUES ('mapTailShow', 'Los usuarios no se preocupan', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '19', '是否显示非关注用户');
INSERT INTO `sys_param` VALUES ('mapType', 'El tipo del motor del mapa', '1-map', 'SYS', 'string', '<select name=\"mapType\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"baidu\">百度地图</option>\r\n		<option value=\"google\">谷歌地图</option>\r\n		<option value=\"qqmap\">腾讯地图</option>\r\n		<option value=\"tianditu\">天地图</option>\r\n		<option value=\"amap\">高德地图</option>\r\n</select>', 'baidu', 'baidu', '5', '地图引擎类型');
INSERT INTO `sys_param` VALUES ('mapUserSn', 'Cuenta de API del mapa', '1-map', 'SYS', 'string', '<input type=\"text\" style=\"width:250px;height:24px;\">', '6XpaIRi9whiGdkRa8eYn5MQBaEOPN2r8', 'pdi33iA7kGmIbFCWt3cGwDzc6HZR5a4v', '7', '地图API接口访问账号');
INSERT INTO `sys_param` VALUES ('micDetectTime', 'Equipo automático llamando por el tiempo', '3-per', 'PER', 'number', '<input type=\"text\">', '3000', '3000', '23', '自动组呼静音释放话权间隔时长（单位：毫秒）');
INSERT INTO `sys_param` VALUES ('micDetectVal', 'El equipo automático está llamando a volumen', '3-per', 'PER', 'number', '<input type=\"text\">', '-15', '-15', '22', '自动组呼音量检测阀值');
INSERT INTO `sys_param` VALUES ('offLineShow', 'El usuario offline lo muestra', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'true', 'true', '18', '是否显示离线用户');
INSERT INTO `sys_param` VALUES ('pageSize', 'Número de páginas', '3-per', 'PER', 'number', '<input type=\"text\">', '10', '10', '10', '分页记录数');
INSERT INTO `sys_param` VALUES ('sysColor', 'Color del sistema', '3-per', 'PER', 'string', '<select name=\"sysColor\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"blue\">蓝色</option>\r\n		<option value=\"green\">绿色</option>\r\n</select>', 'blue', 'blue', '9', '系统肤色');
INSERT INTO `sys_param` VALUES ('toolBarShow', 'La barra de herramientas siempre aparece', '3-per', 'PER', 'checkbox', '<label class=\"label-checkbox\">\r\n		<input type=\"checkbox\" class=\"checkbox\">\r\n		<span class=\"checkSpan\"></span>\r\n</label>', 'false', 'false', '21', '工具栏是否一直显示');
INSERT INTO `sys_param` VALUES ('topMenuCss', 'El estilo del último piso', '2-busi', 'COMP', 'string', '<select name=\"topMenuCss\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"icon\">仅图标</option>\r\n		<option value=\"iconAndText\">图标加文字</option>\r\n</select>', 'icon', 'iconAndText', '17', '顶层菜单显示类型');
INSERT INTO `sys_param` VALUES ('TPPURoot', 'Número de cuenta de terceros', '2-busi', 'COMP', 'string', '<select name=\"TPPURoot\" style=\"width:214px;height:24px\" panelHeight=\"auto\">\r\n		<option value=\"root\">根节点下</option>\r\n		<option value=\"dockUser\">对接账号下</option>\r\n</select>', 'dockUser', 'dockUser', '20', '第三方平台用户显示样式');
INSERT INTO `sys_param` VALUES ('ws_url', 'Dirección de comunicaciones', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10004', 'ws://124.160.11.21:10004', '0', '通讯服务器WEBSOCKET地址');
INSERT INTO `sys_param` VALUES ('wwgps_url', 'Una dirección de servicio GPS', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10005', 'ws://124.160.11.21:10005', '0', '通讯服务器GPS的外网WEBSOCKET地址');
INSERT INTO `sys_param` VALUES ('wwws_url', 'La dirección de internet', '0-comm', 'SYS', 'string', '<input type=\"text\">', 'ws://124.160.11.21:10004', 'ws://124.160.11.21:10004', '0', '通讯服务器外网WEBSOCKET地址');
