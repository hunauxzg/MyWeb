(function() {
	// 获取当前语言环境。
	var language = 'en';
	if (navigator.appName == 'Netscape')
		language = navigator.language;
	else
		language = navigator.browserLanguage;
	if (language.indexOf('en') > -1) // 英语
		language = 'en';
	else if (language.indexOf('fr') > -1) // 法语
		language = 'fr';
	else if (language.indexOf('es') > -1) // 西班牙语
		language = 'es';
	else if (language.indexOf('zh') > -1) // 中文
		language = 'zh_CN';
	else
		// 其它语种都设为英语。
		language = 'en';
	document.write('<script type="text/javascript" src="static/lang/angular.min.js"></script>');
	document.write('<script type="text/javascript" src="static/lang/comm-lang-' + language + '.js"></script>');
	document.write('<script type="text/javascript" src="static/EasyUI151/locale/easyui-lang-' + language + '.js"></script>');
	$(function() {
		angular.module('myApp', []).controller('myCtrl', [ '$scope', function($scope) {
			// 字符串转换成json对象
			$scope.lang = window.lang;
		} ]);
	});
})();