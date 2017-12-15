/**
 * RGB 颜色值转换为 HSL.
 * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
 * r, g, 和 b 需要在 [0, 255] 范围内
 * 返回的 h, s, 和 l 在 [0, 1] 之间
 *
 * @param   Number  r       红色色值
 * @param   Number  g       绿色色值
 * @param   Number  b       蓝色色值
 * @return  Array           HSL各值数组
 */

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}
/**
 * HSL颜色值转换为RGB. 
 * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
 * h, s, 和 l 设定在 [0, 1] 之间
 * 返回的 r, g, 和 b 在 [0, 255]之间
 *
 * @param   Number  h       色相
 * @param   Number  s       饱和度
 * @param   Number  l       亮度
 * @return  Array           RGB色值数值
 */
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * RGB 颜色值转换为 HSL.
 * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
 * r, g, 和 b 需要在 [0, 255] 范围内
 * 返回的 h[0.360], s[0,1], 和 l 在 [0,1] 之间
 *
 * @param   Number  r       红色色值
 * @param   Number  g       绿色色值
 * @param   Number  b       蓝色色值
 * @return  Array           HSL各值数组
 */

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = 60*((g - b) / d + (g < b ? 6 : 0));
                break;
            case g:
                h = 60*((b - r) / d + 2);
                break;
            case b:
                h = 60*((r - g) / d + 4);
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}


//hex转化为RGB
String.prototype.colorRgb = function () {
    var sColor = this.toLowerCase();
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return "RGB(" + sColorChange.join(",") + ")";
    }
    return sColor;
};

/*******RGB颜色转换为十六进制表示：***/

String.prototype.colorHex = function () {
    var that = this;
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是rgb颜色表示
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;
        }
        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return that;
        } else if (aNum.length === 3) {
            var numHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    }
    return that;
};


//var sRgb = "RGB(23, 245, 56)" , sHex = "#34538b";
//var sHexColor = sRgb.colorHex();
//var sRgbColor = sHex.colorRgb();



/****解释(HSV :色彩、深浅、明暗)****/
/***从 RGB 到HSV 的转换
设 (r, g, b) 分别是一个颜色的红、绿和蓝坐标，它们的值是在 0 到 1 之间的实数。设 max 等价于 r, g 和 b 中的最大者。设 min 等于这些值中的最小者。要找到在 HSV 空间中的 (h, s, v) 值，这里的 h ∈ [0, 360）是角度的色相角，而 s, v ∈ [0,1] 是饱和度和亮度，计算为：
max=max(R,G,B) 
min=min(R,G,B) 
if R = max, H = (G-B)/(max-min) 
if G = max, H = 2 + (B-R)/(max-min) 
if B = max, H = 4 + (R-G)/(max-min) 

H = H * 60 
if H < 0, H = H + 360 

V=max(R,G,B) 
S=(max-min)/max
h 的值通常规范化到位于 0 到 360°之间。而 h = 0 用于 max = min 的（就是灰色）时候而不是留下 h 未定义。
****/
/*******/
//RGB->HSV
function rgbToHsv(r, g, b) {
    // r,g,b values are from 0 to 1
    // h = [0,360], s = [0,1], v = [0,1]
    // if s == 0, then h = -1 (undefined)
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, v = max,
        diff = max - min;
    if (max != 0)
        s = (max - min) / max;
    else {
        //r=g=b=0; 
        s = 0;
        h = -1;
        return [h, s, v];
    }
    if (diff == 0) h = 0;
    else {
        if (r == max) h = (g - b) / (max - min);
        if (g == max) h = 2 + (b - r) / (max - min);
        if (b == max) h = 4 + (r - g) / (max - min);
    }
    h = h * 60;
    if (h < 0) h = h + 360;
    return [h, s, v];
}


/**注释

从 HSV 到 RGB 的转换
类似的，给定在 HSV 中 (h, s, v) 值定义的一个颜色，带有如上的 h，和分别表示饱和度和明度的 s 和 v 变化于 0 到 1 之间，在 RGB 空间中对应的 (r, g, b) 三原色可以计算为：

h_i \equiv \left\lfloor \frac{h}{60} \right\rfloor \pmod{6}
f = \frac{h}{60} - h_i
p = v \times (1 - s) \, 
q = v \times (1 - f \times s) \, 
t = v \times (1 - (1 - f) \times s) \, 

对于每个颜色向量 (r, g, b),


(r, g, b) = \begin{cases}(v, t, p), & \mbox{if } h_i = 0  \\(q, v, p), & \mbox{if } h_i = 1  \\(p, v, t), & \mbox{if } h_i = 2  \\(p, q, v), & \mbox{if } h_i = 3  \\(t, p, v), & \mbox{if } h_i = 4  \\(v, p, q), & \mbox{if } h_i = 5  \\\end{cases}
*****/
//hsv--->rgb
function hsvToRgb(h, s, v) {
    var r, g, b;

}


//rgb(a)颜色值转成十六进制颜色(hex)
var rgbToHex = function(rgb) {
var rRgba = /rgba?((\d{1,3}),(\d{1,3}),(\d{1,3})(,([.\d]+))?)/, r, g, b, a, rsa = rgb.replace(/\s+/g, "").match(rRgba); if (rsa) { r = (+rsa[1]).toString(16); r = r.length == 1 ? "0" + r : r; g = (+rsa[2]).toString(16); g = g.length == 1 ? "0" + g : g; b = (+rsa[3]).toString(16); b = b.length == 1 ? "0" + b : b; a = (+(rsa[5] ? rsa[5] : 1)) * 100 return {hex: "#" + r + g + b, alpha: Math.ceil(a)}; } else { return {hex: rgb, alpha: 100}; } };


//十六进制颜色(hex)转成rgba格式
//在日常开发中，我们最常使用的颜色值应该就是十六进制格式的颜色值了（#ff0000、#f00等），如果我们在使用颜色值的时候需要转换成rgba格式，我们该怎么做呢？

var hexToRgba = function(hex, al) {
var hexColor = /^#/.test(hex) ? hex.slice(1) : hex, alp = hex === 'transparent' ? 0 : Math.ceil(al), r, g, b; hexColor = /^[0-9a-f]{3}|[0-9a-f]{6}$/i.test(hexColor) ? hexColor : 'fffff'; if (hexColor.length === 3) { hexColor = hexColor.replace(/(\w)(\w)(\w)/gi, '$1$1$2$2$3$3'); } r = hexColor.slice(0, 2); g = hexColor.slice(2, 4); b = hexColor.slice(4, 6); r = parseInt(r, 16); g = parseInt(g, 16); b = parseInt(b, 16); return { hex: '#' + hexColor, alpha: alp, rgba: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alp / 100).toFixed(2) + ')' }; };