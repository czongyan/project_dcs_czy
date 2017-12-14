/*
1.功能
画图：1) 根据加载数据显示所有的线型图
*/

(function (global) {
    var __INFO__ = {
        plug: "rectMap",
        version: "1.0.1",
        author: "czy"
    };
    var defaults = {
        nodeID: "",
        mode: "multi",
        segment: true,
        selectMap: "MW",
        data: [],
        seg_data: [],
        width: 600,
        height: 300,
        margin: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 0
        },
        color: "#ccc",
        alpha: 1,
        alpha_org: 0.5,
        dimensions: {},
        strokeWidth: 2,
        gY: 0,
        gX: 0,
        gH: 2,
        svgInterval: -5,
        seg_index: [],
        circleR: 3,
        segFlag: "1",
        svg: "",
        mwDomain: [0, 1000],
        mwLimit: false,
        color_1: "#ccc",
        limitColor: "rgb(203, 197, 197)",
        nomLimit: false
    };
    var settings;
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
    String.prototype.colorHsl = function () {
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
            var r = sColorChange[0],
                g = sColorChange[1],
                b = sColorChange[2];
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
        return sColor;
    };

    String.prototype.colorHsv = function () {
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
            var r = sColorChange[0],
                g = sColorChange[1],
                b = sColorChange[2];
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
        return sColor;
    };


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

    var rectMap = function (options) {
        settings = Object.assign({}, defaults, options);
        initRaw();
    }
    var initRaw = function () {
        var dataMode = {
            multi: function () {
                var csv_nest = d3.nest().key(function (d) {
                    return d.classFlag;
                }).entries(settings.data);
                settings.data = csv_nest;
            },
            single: function () {

            }
        };
        if (!settings.nodeID) var svgDOM = d3.select("body");
        else
            var svgDOM = d3.select("#" + settings.nodeID);
        if (!svgDOM) svgDOM = d3.select("body");
        var w = settings.width + settings.margin.right + settings.margin.left;
        var h = 0;
        if (settings.mwLimit) {
            svgDOM[0][0].innerHTML = "";
        }

        settings.svg = svgDOM.append("svg").attr("width", w).attr("class", "multi-svg").style("margin-top", settings.svgInterval);
        if (settings.mode === "multi") {
            if (!settings.mwLimit) dataMode.multi();
            var beforeMonth = parseInt(settings.data[0].key.split('-')[1]);
            for (var i in settings.data) {
                if (parseInt(settings.data[i].key.split('-')[1]) - beforeMonth <= 1) {
                    h += drawRectMap(settings.data[i].values) * (settings.strokeWidth + 2);
                    display_axis(settings.data[i].values);
                } else {
                    h += 1 * settings.strokeWidth;
                }
                var beforeMonth = parseInt(settings.data[i].key.split('-')[1]);
            }
            if (settings.height !== "auto")
                var inner_h = settings.height + settings.margin.top + settings.margin.bottom;
            else
                var inner_h = h + settings.margin.top + settings.margin.bottom;
            settings.svg.attr("height", inner_h);
            //            display_axis(settings.data, svg);
        }
        if (settings.mode === "single") {
            var h = 0;
            h += drawRectMap(settings.data) * settings.strokeWidth;
            if (settings.height !== "auto")
                var inner_h = settings.height + settings.margin.top + settings.margin.bottom;
            else
                var inner_h = h + settings.margin.top + settings.margin.bottom;
            settings.svg.attr("height", inner_h);
        }
    };

    function drawRectMap(data) {
        var line_data = [];
        if (!settings.mwLImit) {
            var csv_nest = d3.nest().key(function (d) {
                return d.day;
            }).entries(data);
            csv_nest.forEach(function (d, i) {
                line_data = line_data.concat(initLayout(d.values, i));
            });
        } else {
            line_data = data;
        }
        //绘制
        //display_rect(line_data, svg)
        //display(line_data, svg);
        if (settings.mwLimit) {
            display_seg(line_data);
            //if (settings.segment)
            //  display_segList(line_data);
        } else {
            display_rect(line_data);
        }
        settings.gY += csv_nest.length;
        return csv_nest.length;
    }
    //绘制坐标轴
    function display_axis_1(data) {
        var g = settings.svg.append("g").attr("traslate", "transform(0,0)");
        g.selectAll('axis-x1').data(data).enter().append("line").attr("class", 'axis-x1').attr('x1', 0).attr('y1', function (d) {
            return d.values[1].y
        }).attr('x2', 20).attr('y2', function (d) {
            return d.values[0].y
        }).attr('stroke-size', 1).attr('stroke', '#000');

        g.selectAll('axis-x2').data(data).enter().append("line").attr("class", 'axis-x2').attr('x1', 0).attr('y1', function (d) {
            return (d.values[d.values.length - 1].y + settings.strokeWidth / 2);
        }).attr('x2', 20).attr('y2', function (d) {
            return (d.values[d.values.length - 1].y + settings.strokeWidth / 2);
        }).attr('stroke-size', 1).attr('stroke', '#000');

        g.selectAll('axis-y').data(data).enter().append("line").attr("class", 'axis-x1').attr('x1', 19).attr('y1', function (d) {
            return (d.values[0].y)
        }).attr('x2', 19).attr('y2', function (d) {
            return (d.values[d.values.length - 1].y + settings.strokeWidth / 2)
        }).attr('stroke-size', 1).attr('stroke', '#000');

        //添加文本
        g.selectAll('.axis-title').data(data).enter().append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "rotate(-90)").text(function (d) {
            return d.values[0].classFlag;
        }).style("text-anchor", "middle").style("font-size", "10px");
        //g.selectAll('text').attr("transform","rotate(-20)");
    }
    //绘制坐标轴
    function display_axis(data) {
        var g = settings.svg.append("svg").attr("traslate", "transform(0," + data[data.length - 1].y + ")");
        //开始横线x1
        g.append("line").attr('x1', 0).attr('y1', data[0].y).attr('x2', 20).attr('y2', data[0].y).attr('stroke-size', 1).attr('stroke', '#000');
        //横线x2
        g.append("line").attr('x1', 0).attr('y1', (data[data.length - 1].y + settings.strokeWidth)).attr('x2', 20).attr('y2', (data[data.length - 1].y + settings.strokeWidth)).attr('stroke-size', 1).attr('stroke', '#000');
        //竖线y
        g.append("line").attr('x1', 19).attr('y1', (data[0].y)).attr('x2', 19).attr('y2', (data[data.length - 1].y + settings.strokeWidth)).attr('stroke-size', 1).attr('stroke', '#000');

        //添加文本
        g.append("g").attr("transform", "translate(10," + data[Math.floor((data.length - 1) * 3 / 4)].y + ")").append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "rotate(-60)").text(data[0].classFlag).style("font-size", "10px");
        //添加分割线
        settings.svg.append("g").attr("transform", "translate(20,0)").append("line").attr("x1", 0).attr('y1', (data[data.length - 1].y + settings.strokeWidth)).attr('x2', (data[data.length - 1].x + data[0].dx)).attr("y2", (data[data.length - 1].y + settings.strokeWidth)).attr("stroke-width", 1).attr("stroke", "#000");
    }

    //初始化数据
    var beforeClass = 0;

    function initLayout(data, i) {
        var rect_w = Math.floor(settings.width / data.length);
        var rect_h = settings.strokeWidth;
        if (settings.segment) { //已经分割
            var len = data.length;
            for (var j = 0; j < len; j++) {

                data[j].x = j * rect_w;
                data[j].y = (i + settings.gY) * (rect_h + 0);
                data[j].dx = rect_w;
                data[j].dy = rect_h;
                // console.log(data[j].resolution)
                if (data[j].resolution > 0) {
                    if (j == 0) { //每一天起始为稳定段
                        if (beforeClass == data[j].resolution) { //接前一天的结尾
                            data[j].startIndex = 2; //接提前一天并不是一段分割的开始
                            data[j].endIndex = 0;
                        } else {
                            data[j].startIndex = 1;
                            data[j].endIndex = 0;
                        }
                    } else if (j == data.length - 1) {
                        data[j].startIndex = 0;
                        data[j].endIndex = 1;
                        beforeClass = data[j].resolution;
                    } else if (data[j].resolution != data[j - 1].resolution) {
                        data[j].startIndex = 1;
                        data[j].endIndex = 0;
                    } else if (data[j].resolution != data[j + 1].resolution && j + 1 != data.length - 1) {
                        data[j].startIndex = 0;
                        data[j].endIndex = 1;
                    } else {
                        data[j].startIndex = 0;
                        data[j].endIndex = 0;
                    }
                } else {
                    data[j].startIndex = 0;
                    data[j].endIndex = 0;
                    if (j - 1 == 0) {
                        if (data[j - 1].resolution > 0) {
                            data[j - 1].endIndex = 1;
                        }
                    }
                }
            }
        } else {
            data.forEach(function (d, dx) {
                d.x = dx * rect_w;
                d.y = (i + settings.gY) * (rect_h + 0);
                d.dx = rect_w;
                d.dy = rect_h;
            });
        }
        return data;
    }

    function display_rect(data) {
        var rect = settings.svg.append('g').attr("class", "g-rect").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")").selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            }).attr("width", function (d) {
                return d.dx;
            }).attr("height", function (d) {
                return settings.strokeWidth;
            }).style("fill", function (d) {
                if (selectMap == "MW" || selectMap == "MWD2") {
                    if (d[selectMap] < 400)
                        return 'rgb(221, 221, 221)';
                    else {
                        return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                    }
                } else {
                    return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                }
            }).style("stroke", "#ccc").style("stroke-width", 0.5).style("opacity", function (d) {
                //根据切割工况段更改透明度
                if (settings.nomLimit) {
                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                        //                        console.log(d.resolution)
                        if (d.resolution > 0) {
                            return settings.alpha;
                        } else return settings.alpha / 2;
                    }
                } else return settings.alpha;
            });
        rect.append('title').text(function (d) {
            return d.dateStr + " mw:" + d.MW + "class:" + d.resolution;
        });
    }

    function display(data) {
        settings.svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")").selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr('id', function (d, i) {
                return 'rect-' + i
            }).attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            }).attr("width", function (d) {
                return d.dx;
            }).attr("height", function (d) {
                return d.dy;
            }).style("stroke", function (d) {
                if (selectMap == "MW" || selectMap == "MWD2") {
                    if (d[selectMap] < 400)
                        return 'rgb(221, 221, 221)';
                    else {
                        return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);

                    }
                }
            }).style("stroke-width", settings.strokeWidth).style("opacity", settings.alpha);
    }

    function getSegDetail(data) {
        var result = 0;
        settings.segFlag.forEach(function (d) {
            if (d.flag == data.resolution) {
                result = d.max;
            }
        });
        return result;
    }

    function getSegFlag(data) {
        var result = 0;
        settings.segFlag.forEach(function (d) {
            if (d.flag == data.resolution && (d.max >= settings.mwDomain[0]) && (d.max < settings.mwDomain[1])) {
                result = d.flag;
            }
        });
        return result;
    };

    function isSegStart(data) {
        var result = {};
        for (var i in settings.segDate) {
            var d = settings.segDate[i];
            if (d.flag == data.resolution) {
                d.segDate.forEach(function (dx) {
                    //                    console.log(data.date, formatDate(dx.start),"***",(data.date - formatDate(dx.start) ))
                    if ((data.date - formatDate(dx.start)) >= 0 && (data.date - formatDate(dx.start)) < 1000000) {
                        //                        console.log(dx);
                        result = dx;
                    }
                });
            }
        }
        return result;
    };

    function defindedNewHsl(hsl) {
        var cssText = ".translated{fill: hsl(" + hsl[0] * 360 + "," + hsl[1] * 100 + "%," + hsl[2] * 100 + "%);animation-name: MCR-seg;animation-duration: 600ms;animation-iteration-count: infinite;animation-timing-function: ease-in-out;animation-direction: alternate;}@keyframes MCR-seg {0% {fill: hsl(" + hsl[0] * 360 + "," + hsl[1] * 100 + "%," + hsl[2] * 100 + "%);}100% {fill: hsl(" + hsl[0] * 360 + "," + hsl[1] * 100 + "%,80%);}}";
        return cssText;
    }

    function defindedNewHsv(hsv) {
        var cssText = ".translated{fill: hsv(" + hsv[0] + "," + hsv[1] + "," + hsv[2] + ");animation-name: MCR-seg;animation-duration: 700ms;animation-iteration-count: infinite;animation-timing-function: ease-in-out;animation-direction: alternate;}@keyframes MCR-seg {0% {fill: hsv(" + hsv[0] + "," + hsv[1] + "," + hsv[2] + ");}100% {fill: hsv(" + hsv[0] + "," + hsv[1] * 2 + "," + hsv[2] * 2 + ");}}";
        return cssText;
    }

    function display_seg(data) {
        var g = settings.svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        var startData = [],
            startIndex = 0;
        var segDate; //记录稳定工况段的起始start和结束end时间
        var flag = 0; ////记录存在seg段含有的原始rect个数
        var endFlag = 0; //记录跨天的稳定工况，-1表示跨天，0表示不跨天
        for (var i in data) {
            var d = data[i];
            //判断是否分割的最终结果
            if (settings.segment) { //是，显示三层结构 （RAW--MCR--SEG）
                if (d.resolution > 0 && (settings.nom == 5 ? d.NOM >= 5 : d.NOM == settings.nom) && (getSegDetail(d) >= settings.mwDomain[0]) && (getSegDetail(d) < settings.mwDomain[1])) {
                    //绘制MCR满的的第二层工况信息 MCR
                    var mw = getSegDetail(d);
                    var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                        .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {
                            if ((mw >= settings.mwDomain[0]) && (mw < settings.mwDomain[1])) //解决MCR90% 时，判断resolution>0 如MCR=80% 但是meanMW>900的情况
                                return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(mw);
                            else {
                                return (typeof settings.color === "string") ? settings.color : settings.color(mw);
                            }
                        }).style("stroke-width", 0).style("stroke", "#ccc").style("opacity", function () {
                            if ((mw >= settings.mwDomain[0]) && (mw < settings.mwDomain[1]))
                                return (settings.alpha * 0.8);
                            else return (settings.alpha * 0.5);
                        });
                    rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);


                    //判断是不是稳定工况段绘制第三层SEG
                    if (flag == 0) //MCR开始
                    {
                        segDate = isSegStart(d);
                        //flag = 0; //记录存在seg段含有的原始rect个数
                        if (JSON.stringify(segDate) != '{}') { //判断是否有返回值
                            {
                                //                                console.log(d.date, segDate);
                                startData = d; //记录稳定工况段起始位置数值
                                startIndex = d.index; //记录稳定工况段初始位置index
                                flag++;
                            }
                        }
                    }
                    if (flag > 0) { //开始判断是否到稳定工况段结束位置
                        console.log(d.dateStr, formatDate(segDate.end), (formatDate(segDate.end) - d.date))
                        //判断是不是衔接上一个稳定工况
                        if (endFlag == -1) {
                            startIndex = d.index;
                            startData = d;
                            endFlag = 0;
                        }
                        if ((formatDate(segDate.end) - d.date) >= 0 && (formatDate(segDate.end) - d.date) < 600000) { //满足时间段
                            flag = 0;
                            //                            console.log(startData, startIndex, d);
                            //*****任务1******画稳定工况（可变色的长方形rect 加边框）
                            var rect = g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                .attr("y", (startData.y)).attr("width", (d.dx * (d.index - startIndex + 1))).attr("height", settings.strokeWidth)
                                .style("fill", function () {
                                    //添加动态效果
                                    //                                    var seg_hsl = settings.color_1(getSegDetail(d)).colorHsl();
                                    //                                    var cssText = defindedNewHsl(seg_hsl);
                                    //                                    var seg_style = document.getElementById("seg-style");
                                    //                                    seg_style.innerHTML = cssText;
                                    //结束添加
                                    return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(getSegDetail(d));
                                })
                                .attr("stroke-width", 2).attr("stroke", "blue")
                                .attr("opacity", function () {
                                    //添加动态效果
                                    var seg_hsl = settings.color_1(getSegDetail(d)).colorHsl();
                                    var cssText = defindedNewHsl(seg_hsl);
                                    var seg_style = document.getElementById("seg-style");
                                    seg_style.innerHTML = cssText;
                                    return settings.alpha;
                                })
                                .on("mouseover", function () { //focus这个rect时 边框变粗
                                    d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
                                    mouseover();
                                }).on("mouseout", function () { //focus离开时，边框恢复
                                    d3.selectAll('.seg-rect').attr("stroke", "blue").attr("stroke-width", 1);
                                }) //添加弹出框
                                .on("click", function () {
                                    var index = this.id.split('-')[1];
                                    document.getElementById('light').style.display = 'block';
                                    document.getElementById('fade').style.display = 'block';
                                    d3.select("#polygon-" + index).attr("fill", "blue");
                                    //弹出细节现实；
                                    var detailSvg = d3.select('#singleDetail');
                                    var tempData = getSegData(index, data);

                                    console.log(tempData);
                                    var detail_rect = detailSvg.append("g").selectAll("rect").data(tempData).enter().append("rect").attr("x", function (di, i) {
                                        return i * 10;
                                    }).attr("y", 10).attr("width", 10).attr("height", 10).attr("stroke", "#ccc").attr("stroke-width", 1).attr("fill", function (detail) {
                                        console.log(detail["MW"], settings.color(detail["MW"]));
                                        return settings.color(detail["MW"]);
                                    });
                                    detail_rect.append('title').text(function (d) {
                                        return d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM
                                    });
                                });
                            rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM);
                            //*************结束绘制稳定工况

                            //**任务2**绘制磨煤机台数标识符***开始
                            // drawNOM(startData);
                            //****绘制磨煤机台数标识符***结束

                        } else { //还未到结束时间
                            //1、判断是否结尾
                            if (d.date.getHours() == 23 && d.date.getMinutes() == 50) {
                                //******任务1*****画稳定工况（可变色的长方形rect 加边框）开始
                                var rect = g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                    .attr("y", (startData.y)).attr("width", (d.dx * (d.index - startIndex + 1)))
                                    .attr("height", settings.strokeWidth)
                                    .style("fill", function () {
                                        //结束添加
                                        return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(getSegDetail(d));
                                    })
                                    .attr("stroke-width", 1).attr("stroke", "blue").attr("opacity", function () {
                                        //添加动态效果
                                        //                                        var seg_hsl = settings.color_1(getSegDetail(d)).colorHsl();
                                        //                                        var cssText = defindedNewHsl(seg_hsl);
                                        //                                        var seg_style = document.getElementById("seg-style");
                                        //                                        seg_style.innerHTML = cssText;
                                        return settings.alpha;
                                    }).on("mousemove", function () { //focus这个rect时 边框变粗
                                        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
                                        //弹出svg展示细节
                                        mouseover();
                                    }).on("mouseout", function () { //focus离开时，边框恢复
                                        d3.selectAll('.seg-rect').attr("stroke-width", 1);
                                    }) //添加弹出框
                                    .on("click", function () {
                                        var index = this.id.split('-')[1];
                                        document.getElementById('light').style.display = 'block';
                                        document.getElementById('fade').style.display = 'block';
                                        d3.select("#polygon-" + index).attr("fill", "blue");
                                        //弹出细节现实；//获取的index是seg段的结尾数据 需要往前寻找
                                        var detailSvg = d3.select('#singleDetail');
                                        var tempData = getSegData(index, data);
                                        console.log(tempData);
                                        var detail_rect = detailSvg.append("g").selectAll("rect").data(tempData).enter().append("rect").attr("x", function (di, i) {
                                            return i * 10;
                                        }).attr("y", 10).attr("width", 10).attr("height", 10).attr("stroke", "#ccc").attr("stroke-width", 1).attr("fill", function (detail) {
                                            console.log(detail["MW"], settings.color(detail["MW"]));
                                            return settings.color(detail["MW"]);
                                        });
                                        detail_rect.append('title').text(function (d) {
                                            return d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM
                                        });
                                    });
                                rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM);
                                //*************结束绘制稳定工况 

                                //**任务2**绘制磨煤机台数标识符***开始
                                // drawNOM(startData);
                                //****绘制磨煤机台数标识符***结束
                                startIndex = 0;
                                startData = 0;
                                endFlag = -1;
                            } //else { //不是结尾
                            flag++;
                        }
                    }
                } else { //不满足筛选条件的原始数据 RAW
                    var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                        .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {
                            if (d.MW < 400)
                                return 'rgb(221, 221, 221)';
                            else if (d.mw < 500)
                                return "#1a9850";
                            else {
                                return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                            }
                        }).style("stroke-width", 0.35).style("stroke", "#ccc").style("opacity", function () {
                            return (settings.alpha * 0.5);
                        });
                    rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);
                }

            } else { //只限制功率的取值范围 （否） 只显示两层结构(RAW--MCR)
                var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                    .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {
                        if (settings.mwLimit) {
                            if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
                            } else {
                                if (d.MW < 400)
                                    return 'rgb(221, 221, 221)';
                                else if (d.MW < 500)
                                    return '#1a9850';
                                else
                                    return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                            }
                        }
                    }).style("stroke-width", 0.35).style("stroke", "#ccc").style("opacity", function () {
                        if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                            return settings.alpha;
                        } else return (settings.alpha / 2);
                        // } else return settings.alpha;
                    });
                rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);
            }
        }
    }

    function display_segListSymbol(data) {
        var g = settings.svg.append('g').attr("class", "g-seglist").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        for (var i in data) {
            var d = data[i];
            if (d.startIndex == 1) {
                if (settings.nomLimit) {
                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                        //添加磨煤机标识
                        var symbol = d3.svg.symbol();
                        var size = 30;
                        symbol.size(30);
                        switch (settings.nom) {
                            case 3:
                                symbol.type('triangle-down');
                                break;
                            case 4:

                                symbol.type('diamond');
                                break;
                            case 5:
                                symbol.type('circle');
                                break;
                        }
                        g.append("path").attr("id", "path -" + i).attr("class", "path").attr("transform", function () {
                                return "translate(" + (d.x + d.dx / 2) + "," + (d.y) + ")";
                            }).attr("d", symbol)
                            .attr("fill", "#78c679").attr('stroke-width', 1).attr("stroke", "#252525").style("opacity", settings.alpha).on("mousemove", function () {
                                var size = 200;
                                symbol.size(size);
                                var temp = d3.select(this);
                                temp.attr("d", symbol);
                                temp.attr("stroke-width", 2);
                                temp.append("title").text("class:" + d.resolution + ".... \nnom: " + settings.nom + "....");
                            }).on("mouseout", function () {
                                symbol.size(30);
                                d3.selectAll('path').attr("d", symbol).attr("stroke-width", 1);

                            });
                    }
                }
            }
        }
    }

    //绘制磨煤机台式标识符 （传入参数 稳定工况段起始第一个数据对象）
    function drawNOM(d) {
        var g = settings.svg.append('g').attr("class", "g-seglist").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        var temp;
        switch (settings.nom) {
            case 3:
                //三角形
                temp = g.append("polygon").attr("points", function () {
                    var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth);
                    console.log(str);
                    return str;
                }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000").on("mousemove", function (e) {
                    var xx = e.originalEvent.x || e.originalEvent.layerX || 0;
                    var yy = e.originalEvent.y || e.originalEvent.layerY || 0;
                    console.log(xx, yy, this);
                }).on("mouseout", function () {});
                break;
            case 4:
                //菱形
                temp = g.append("polygon").attr("points", function () {
                    var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth / 2);
                    //                                    console.log(str);
                    return str;
                }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000");
                break;
                //path 菱形
            case 5: //画五边形
                temp = g.append("polygon").attr("id", "polygon-" + d.index).attr("points", function () {
                        var str = (d.x) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 4) + ',' + (d.y) + ' ' + (d.x + d.dx * 3 / 4) + ',' + d.y + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth);
                        return str;
                    }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000")
                    .on("mousemove", function () {
                        d3.select(this).attr("stroke-width", 1.5);
                    }).on("mouseout", function () {
                        d3.selectAll('polygon').attr("stroke-width", 1);
                    });
                break;
        }
        temp.append("title").text("class:" + d.resolution + ".... \nnom: " + settings.nom + "....");
    }

    function display_segList(data) {
        var g = settings.svg.append('g').attr("class", "g-seglist").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        for (var i in data) {
            var d = data[i];
            if (d.startIndex == 1) {
                if (settings.nomLimit) {
                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                        var temp;
                        switch (settings.nom) {
                            case 3:
                                //三角形
                                temp = g.append("polygon").attr("points", function () {
                                    var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth);
                                    console.log(str);
                                    return str;
                                }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000").on("mousemove", function (e) {
                                    var xx = e.originalEvent.x || e.originalEvent.layerX || 0;
                                    var yy = e.originalEvent.y || e.originalEvent.layerY || 0;
                                    console.log(xx, yy, this);
                                }).on("mouseout", function () {
                                    //                                    d3.selectAll('path').attr("d", symbol).attr("stroke-width", 1);
                                });
                                break;
                            case 4:
                                //菱形
                                temp = g.append("polygon").attr("points", function () {
                                    var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth / 2);
                                    //                                    console.log(str);
                                    return str;
                                }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000");
                                break;
                                //path 菱形
                            case 5: //画五边形
                                temp = g.append("polygon").attr("id", "polygon-" + i).attr("points", function () {
                                        var str = (d.x) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 4) + ',' + (d.y) + ' ' + (d.x + d.dx * 3 / 4) + ',' + d.y + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth);
                                        //console.log(str);
                                        return str;
                                    }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000")
                                    .on("mousemove", function () {
                                        d3.select(this).attr("stroke-width", 1.5);
                                    }).on("mouseout", function () {
                                        d3.selectAll('polygon').attr("stroke-width", 1);
                                    });
                                break;
                        }
                        temp.append("title").text("class:" + d.resolution + ".... \nnom: " + settings.nom + "....");
                    }
                }
            }
        }
    }

    function mouseover(d) {
        console.log(this);
        this.parentNode.appendChild(this);
        d3.select(this)
            .style("pointer-events", "none")
            .transition()
            .duration(750)
            .attr("transform", "translate(480,480)scale(23)rotate(180)")
            .transition()
            .delay(1500)
            .attr("transform", "translate(240,240)scale(0)")
            .style("fill-opacity", 0)
            .remove();
    }

    function getSegData(index, data) {
        var tempData = [],
            p = 0;
        tempIndex = 0;
        for (var i in data) {
            if (data[i].index == index) {
                p = i;
            }
            if (p > 0 && tempIndex == 0) {
                if (data[i].endIndex == 1) {
                    tempIndex = i;
                    break;
                }
            }
        }
        for (var i = p - 20; i <= tempIndex - 20; i++) {
            tempData.push(data[i])
        }
        return tempData;
    }

    function getSegMean(d) {
        var p = {},
            data = [];
        data = settings["seg_data"].slice(0);
        for (var i = 0; i < settings.seg_data.length; i++) {
            p = settings.seg_data[i];
            if (Math.abs(p.startDate - d.date) < 600000) {
                p.resolution = d.resolution;
                break;
            }
        }
        return p;
    }
    rectMap.reDisplay = function (options) {
        settings = Object.assign(settings, options);
        settings.gY = 0;
        initRaw();
    };
    rectMap.segList = function (options) {
        settings = Object.assign(settings, options);
        settings.gY = 0;
        initRaw();
    };
    rectMap.scale = function () {
        console.log(111);
    };


    global[__INFO__.plug] = rectMap;
    global[__INFO__.plug] = rectMap;
})(typeof window !== "undifined" ? window : this);