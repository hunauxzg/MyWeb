//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      功能函数
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var PUtility = {};

PUtility.str_utf8_length = function(string) {
  return unescape(encodeURIComponent(string)).length;
};

PUtility.isFunction = function(fn) {
  if (fn !== undefined) {
    return (Object.prototype.toString.call(fn) === '[object Function]')? true : false;
  } else {
    return false;
  }
};

PUtility.isString = function(str) {
  if (str !== undefined) {
    return (Object.prototype.toString.call(str) === '[object String]')? true : false;
  } else {
    return false;
  }
};

PUtility.isDecimal = function(num) {
  return !isNaN(num) && (parseFloat(num) === parseInt(num,10));
};

PUtility.isEmpty = function(value) {
  if (value === null || value === '' || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof(value) === 'number' && isNaN(value))) {
    return true;
  }
};

PUtility.hasMethods = function(obj /*, method list as strings */){
  var i = 1, methodName;
  while((methodName = arguments[i++])){
    if(this.isFunction(obj[methodName])) {
      return false;
    }
  }
  return true;
};


// http://stackoverflow.com/users/109538/broofa
PUtility.newUUID = function() {
  var UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });

  return UUID;
};

// MD5 (Message-Digest Algorithm) http://www.webtoolkit.info
PUtility.calculateMD5 = function(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }

  function addUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function doF(x,y,z) {
    return (x & y) | ((~x) & z);
  }

  function doG(x,y,z) {
    return (x & z) | (y & (~z));
  }

  function doH(x,y,z) {
    return (x ^ y ^ z);
  }

  function doI(x,y,z) {
    return (y ^ (x | (~z)));
  }

  function doFF(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doF(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doGG(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doG(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doHH(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doH(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function doII(a,b,c,d,x,s,ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(doI(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray = new Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  }

  function wordToHex(lValue) {
    var wordToHexValue='',wordToHexValue_temp='',lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length-2,2);
    }
    return wordToHexValue;
  }

  function utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  var x=[];
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;

  string = utf8Encode(string);

  x = convertToWordArray(string);

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=doFF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=doFF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=doFF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=doFF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=doFF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=doFF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=doFF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=doFF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=doFF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=doFF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=doFF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=doFF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=doFF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=doFF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=doFF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=doFF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=doGG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=doGG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=doGG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=doGG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=doGG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=doGG(d,a,b,c,x[k+10],S22,0x2441453);
    c=doGG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=doGG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=doGG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=doGG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=doGG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=doGG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=doGG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=doGG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=doGG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=doGG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=doHH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=doHH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=doHH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=doHH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=doHH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=doHH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=doHH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=doHH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=doHH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=doHH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=doHH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=doHH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=doHH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=doHH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=doHH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=doHH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=doII(a,b,c,d,x[k+0], S41,0xF4292244);
    d=doII(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=doII(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=doII(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=doII(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=doII(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=doII(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=doII(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=doII(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=doII(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=doII(c,d,a,b,x[k+6], S43,0xA3014314);
    b=doII(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=doII(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=doII(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=doII(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=doII(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=addUnsigned(a,AA);
    b=addUnsigned(b,BB);
    c=addUnsigned(c,CC);
    d=addUnsigned(d,DD);
  }

  var temp = wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);

  return temp.toLowerCase();
};


//计算SIP MD5值
PUtility.AuthMD5_Calc = function(pucName, pucRealm, pucPwd, pucMethod, pucAlg, pucNonce, pucUri){
    // HA1 = MD5(A1) = MD5(username:realm:password)
    var ha1 = PUtility.calculateMD5(pucName + ':' + pucRealm + ':' + pucPwd);
    // HA2 = MD5(A2) = MD5(method:digestURI)
    var ha2 = PUtility.calculateMD5(pucMethod + ':' + pucUri);
    // response = MD5(HA1:nonce:HA2)
    var pucRsp = PUtility.calculateMD5(ha1 + ':' + pucNonce + ':' + ha2);
    return pucRsp;
};

PUtility.PGetCurTime = function() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds() + seperator2 + date.getMilliseconds();
    return currentdate;
};


//PUtility.Log = console.log;//可以定位到行号
//行号有问题
PUtility.Log1 = function()
{
    if (null == m_IDT_INST)
        return;
    if (0 == m_IDT_INST.RUN_MODE)
        return;
    //Var f = fso.createtextfile("c:\a.txt", 8, true); 
    PUtility.m_OrigLog.apply(console, arguments);
};

PUtility.Log2 = function()
{
    try
    {
        if (null == m_IDT_INST)
            return;
        if (0 == m_IDT_INST.RUN_MODE)
            return;
        if (null == console)
            return;
        if (null == console.log)
            return;
        console.log.apply(console, arguments);
    }
    catch (e)
    {
    }
};


PUtility.IsValid = function(val)
{
    return true;
};

PUtility.RequestFullScreen = function(element) {
    // 判断各种浏览器，找到正确的方法
    var requestMethod = element.requestFullScreen || //W3C
    element.webkitRequestFullScreen ||    //Chrome等
    element.mozRequestFullScreen || //FireFox
    element.msRequestFullScreen; //IE11
    if (requestMethod) {
        requestMethod.call(element);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
};

//退出全屏 判断浏览器种类
PUtility.ExitFull = function() {
    // 判断各种浏览器，找到正确的方法
    var exitMethod = document.exitFullscreen || //W3C
    document.mozCancelFullScreen ||    //Chrome等
    document.webkitExitFullscreen || //FireFox
    document.webkitExitFullscreen; //IE11
    if (exitMethod) {
        exitMethod.call(document);
    }
    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
};

PUtility.GetBrowserName = function()
{
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera)
    {
        return "Opera"
    }; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1)
    {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1)
    {
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1)
    {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera)
    {
        return "IE";
    }; //判断是否IE浏览器

    if (!!window.ActiveXObject || "ActiveXObject" in window)
    {
        return "IE";
    }
    return "Unknown";
}

PUtility.m_OrigLog = null;
if ("IE" != PUtility.GetBrowserName())
{
    PUtility.m_OrigLog = console.log;
}

