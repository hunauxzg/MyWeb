<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
  <base href="<%=basePath%>" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>jQuery图片预览插件imgPreview - 星知苑</title>
        <script src="static/imgPreview/jquery-1.7.1.js" type="text/javascript"></script>
		<script src="static/imgPreview/imgpreview.min.0.22.jquery.js" type="text/javascript"></script>
<script src="static/EasyUI151/jquery.min.js"></script>
</head>
<body>
<h2>jQuery图片预览插件imgPreview - <a href="http://www.myxzy.com">星知苑</a></h2>
    
↓↓↓↓↓缩略图图片显示大图预览，鼠标移动到图片连接上即可查看效果↓↓↓↓↓<br />
<a href="static/imgPreview/2.jpg"><img src="static/imgPreview/2.jpg"></a><br /><br /><br />

↓↓↓↓↓文字连接显示大图预览，鼠标移动到文字连接上即可查看效果↓↓↓↓↓<br />
<a href="static/imgPreview/1.jpg">星知苑截图</a><br />

<script type="text/javascript">
 	jQuery.noConflict();    //将变量$的控制权移交给JsCOM.js
   $(function(){
	   $('a').imgPreview({
			imgCSS: { width: 800 }
			});
	   
   })
	
	
/* 	(function($){  
	$('a').imgPreview({
	imgCSS: { width: 800 }
	});
	})(jQuery); */
</script>
</body>
</html>