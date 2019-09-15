/**
 * 字符串基本功能扩展JS文件。
 */

/**
 * 删除左右两端的空格
 */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g,'');
}
/**
 * 删除左边的空格
 */
String.prototype.ltrim = function() {
	return this.replace(/(^\s*)/g,'');
}
/**
 * 删除右边的空格
 */
String.prototype.rtrim = function() {
	return this.replace(/(\s*$)/g,'');
}

/**
 * 判断字符串是否以特定字符串开始。
 */
String.prototype.startWith = function(str) {
	var reg = new RegExp("^" + str);
	return reg.test(this);
}

/**
 * 判断字符串是否以特定字符串结束。
 */
String.prototype.endWith = function(str) {
	var reg = new RegExp(str + "$");
	return reg.test(this);
}