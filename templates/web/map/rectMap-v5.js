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
        dataMD: [],
        presentData: [],
        presentID: "",
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
        nomLimit: false,
        drawNum: [0, 0],
        diffY: 0,
        parameterName: ['MW', 'MSP', 'THRTEMP'],
        g_dis: [9, 2, 0.7],
        fineObj: { //type:记录最细粒度展示的类型：1：折线图、2：多参数对比的像素热力图
            type: 0,
            date: ""
        }
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
                    //暂时不显示时间轴
                    //                    display_axis(settings.data[i].values);
                } else {
                    h += 1 * settings.strokeWidth;
                }
                var beforeMonth = parseInt(settings.data[i].key.split('-')[1]);
            }
            if (settings.height !== "auto")
                var inner_h = settings.height + settings.margin.top + settings.margin.bottom;
            else
                var inner_h = settings.diffY + settings.strokeWidth / 2 + settings.margin.top + settings.margin.bottom;
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
        display_axis_x();
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
        if (settings.mwLimit) { //显示分层数据
            display_seg(line_data);
            //if (settings.segment)
            //  display_segList(line_data);
        } else { //显示原始数据
            display_rect(line_data);
        }
        settings.gY += csv_nest.length;
        settings.dataMD = settings.dataMD.concat(d3.nest().key(function (d) {
            return d.MD;
        }).entries(line_data));
        //        console.log(settings.dataMD);
        return csv_nest.length;
    }
    //绘制横向的x-time坐标轴
    function display_axis_x() {
        var data = settings.dataMD[1].values;
        var beforeSvg = d3.select(".multi-svg");
        //        var g = settings.svg.insert("g",beforeSvg)
        var x_svg = d3.select("#content").insert("svg", ".multi-svg").attr("transform", "translate(" + settings.margin.right + ",0)").attr("width", settings.width).attr("height", 20).append("g").attr("class", "x-time");
        var x = d3.time.scale()
            .range([0, settings.width]);

        var xAxis = d3.svg.axis()
            .scale(x).orient("top").ticks(d3.time.minutes, 60).tickFormat(d3.time.format("%H:%M"));
        //       console.log(settings.dataMD[1].values);
        x.domain(d3.extent(settings.dataMD[1].values, function (d) {
            return d.date;
        }));
        x_svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,20)")
            .call(xAxis).attr("dy", ".31em")
            .style("text-anchor", "middle").style("font-size", "9px");
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

    function line_fineGrit(data) {
        var dis = 15;
        settings.diffY += dis; //添加与上部的区别框
        //最细粒度展示(多参数对比)
        var startPoint = settings.diffY;
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")").style("fill", "red");
        var x = d3.time.scale()
            .range([0, settings.width]);

        var xAxis = d3.svg.axis()
            .scale(x).orient("bottom").ticks(24);

        x.domain(d3.extent(data, function (d) {
            return d.date;
        }))

        var y = d3.scale.linear()
            .range([settings.strokeWidth * settings.g_dis[0], 0]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        var temp_color = d3.scale.category10();
        for (var i in settings.parameterName) {

            var line = d3.svg.area()
                .interpolate("basis")
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d[settings.parameterName[i]]);
                });
            y.domain(d3.extent(data, function (d) {
                return d[settings.parameterName[i]];
            }));

            var area = d3.svg.area()
                .interpolate("basis")
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d[settings.parameterName[i]]);
                });
            rect_g.datum(data);

            rect_g.append("path")
                .attr("class", "line")
                .attr("d", line).attr("x", 0).attr("y", settings.diffY).style("stroke", temp_color(i)).style("stroke-width", "1px");
        }

        rect_g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + settings.strokeWidth * settings.g_dis[0] + ")")
            .call(xAxis).attr("dy", ".31em")
            .style("text-anchor", "middle").style("font-size", "9px");

        //        rect_g.append("g")
        //            .attr("class", "y axis")
        //            .call(yAxis);
        //            .append("text")
        //            .attr("transform", "rotate(-90)")
        //            .attr("y", 6)
        //            .attr("dy", ".31em")
        //            .style("text-anchor", "end").style("font-size", "9px");
        //.text("Temperature (ºF)");



        settings.diffY += settings.strokeWidth * settings.g_dis[0];
        //添加日期（Day）分隔线
        //        rect_g.append("line").attr("x1", -6).attr("y1", settings.diffY - 1).attr("y2", settings.diffY - 1 ).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);

        settings.diffY += dis + 2;
        //绘制边框
        //        rect_g.append("polyline").attr("points", "0," + startPoint + " " + settings.width + "," + startPoint + " 0," + settings.diffY + " " + settings.width + "," + settings.diffY + "").attr("y1", settings.diffY - 1).attr("y2", settings.diffY - 1).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);
        // 添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + (settings.strokeWidth * settings.g_dis[0] / 2) + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", settings.strokeWidth * 2 + "px").style("font-weight", "bolder").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer")
        }).on("click", function () {
            //获取父节点的id--要放大到最大尺度的id
            console.log(d3.select(this), this.event);
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawMap(rectID);
        });
        //添加线段说明
        var line_g = rect_g.append("g").attr("transform", "translate(0,0)");
        line_g.selectAll(".line_text").data(settings.parameterName).enter().append("line").attr("class", "line_text").attr("x1", function (d, i) {
            return i * 50;
        }).attr("y1", 0).attr("x2", function (d, i) {
            return i * 50 + 30;
        }).attr("y2", 0).attr("stroke", function (d, i) {
            return temp_color(i);
        }).attr("stroke-width", "2");
        line_g.selectAll(".text_des").data(settings.parameterName).enter().append("text").attr("class", "text_des").attr("x", function (d, i) {
            return i * 50 + 30;
        }).attr("y", 0).attr("fill", "#000").text(function (d) {
            return d;
        });
    }

    function rect_fineGrit(presentIndex, presentID, data) {
        //最细粒度展示(多参数对比)
        //获取转换g的x,y位置
        var tra = $("#" + presentID).css('transform').replace(/[^0-9\-,]/g, '').split(',');
        var g_x = parseInt(tra[4]),
            g_y = parseInt(tra[5]);
        var rect_g = d3.select($('#' + presentID)[0]);
        rect_g.selectAll('*').remove();
        //删除目前的svg
        var dis = 15;
        //        settings.diffY += dis; //添加与上部的区别框
        //        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + g_x + "," + g_y + ")");
        for (var i in settings.parameterName) {
            //使用不同的色系
            //方案一：取值范围为全部数据的最大最小值===效果不好
            var tempColor_v1 = d3.scale.quantize()
                .domain(allDomain[i])
                .range(parameterColor[i]);
            //方案而：取值范围为显示最大粒度数据的最大最小值===效果不好
            var tempColor = d3.scale.quantize()
                .domain(d3.extent(data, function (d) {
                    return d[settings.parameterName[i]];
                }))
                .range(parameterColor[i]);
            //使用相同的色系
            //方案一：取值范围为全部数据的最大最小值===效果不好
            var tempColor_r1 = d3.scale.quantize()
                .domain(allDomain[i])
                .range(settings.color.range());
            //方案而：取值范围为显示最大粒度数据的最大最小值===效果不好
            var tempColor_r2 = d3.scale.quantize()
                .domain(d3.extent(data, function (d) {
                    return d[settings.parameterName[i]];
                }))
                .range(settings.color.range());
            var rect = rect_g.selectAll("." + settings.parameterName[i] + "_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * i;
                }).attr("width", function (d) {
                    return d.dx;
                }).attr("height", function (d) {
                    return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                }).style("fill", function (d) {
                    //                    console.log(d[settings.parameterName[i]], settings.parameterName[i]);
                    if (settings.parameterName[i] == "MW" || settings.parameterName[i] == "MWD2") {
                        if (d[settings.parameterName[i]] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.parameterName[i]]);
                        }
                    } else {
                        //                        console.log(settings.parameterName[i], d[settings.parameterName[i]], tempColor(d[settings.parameterName[i]]), tempColor.domain, tempColor.range());
                        return tempColor(d[settings.parameterName[i]]);
                    }
                }).style("stroke", "#ccc").style("stroke-width", 0.5).style("opacity", settings.alpha);
            rect.append('title').text(function (d) {
                return d.dateStr + " " + settings.parameterName[i] + ":" + d[settings.parameterName[i]] + "class:" + d.resolution;
            });
        }
        //        g_y += settings.strokeWidth * settings.g_dis[0]
        //        g_y += dis;
        //        //添加日期（Day）分隔线
        //        rect_g.append("line").attr("x1", -6).attr("y1",g_y - 1 + settings.strokeWidth * settings.g_dis[0]).attr("y2", g_y - 1 + settings.strokeWidth * 2).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);

        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + (settings.strokeWidth * settings.g_dis[0] / 2) + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", "9px").style("font-size", settings.strokeWidth * 2 + "px").style("font-weight", "bolder").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer")
        }).on("click", function (evt) {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawMap(rectID);
        });
    }

    function rect_fineGrit_v1(data) {
        var dis = 15;
        settings.diffY += dis; //添加与上部的区别框
        //最细粒度展示(多参数对比)
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        for (var i in settings.parameterName) {
            var tempColor = d3.scale.quantize()
                .domain(allDomain[i])
                .range(parameterColor[i]);
            var rect = rect_g.selectAll("." + settings.parameterName[i] + "_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return settings.diffY + settings.strokeWidth * settings.g_dis[0];
                }).attr("width", function (d) {
                    return d.dx;
                }).attr("height", function (d) {
                    return settings.strokeWidth * settings.g_dis[0];
                }).style("fill", function (d) {
                    //                    console.log(d[settings.parameterName[i]], settings.parameterName[i]);
                    if (settings.parameterName[i] == "MW" || settings.parameterName[i] == "MWD2") {
                        if (d[settings.parameterName[i]] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.parameterName[i]]);
                        }
                    } else {
                        console.log(settings.parameterName[i], d[settings.parameterName[i]], tempColor(d[settings.parameterName[i]]), tempColor.domain, tempColor.range());
                        return tempColor(d[settings.parameterName[i]]);
                    }
                }).style("stroke", "#ccc").style("stroke-width", 0.5).style("opacity", settings.alpha);
            rect.append('title').text(function (d) {
                return d.dateStr + " " + settings.parameterName[i] + ":" + d[settings.parameterName[i]] + "class:" + d.resolution;
            });
            settings.diffY += settings.strokeWidth * settings.g_dis[0];
        }
        settings.diffY += 2;
        settings.diffY += dis;
        //添加日期（Day）分隔线
        rect_g.append("line").attr("x1", -6).attr("y1", settings.diffY - 1 + settings.strokeWidth * settings.g_dis[0]).attr("y2", settings.diffY - 1 + settings.strokeWidth * 2).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);
        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + settings.diffY + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", "9px").style("font-size", settings.strokeWidth * 2 + "px").style("font-weight", "bolder").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer")
        }).on("click", function (evt) {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawMap(rectID);
        });
    }

    function rect_midGrit(data) {
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")");
        var rect = rect_g.selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return 0;
            }).attr("width", function (d) {
                return d.dx;
            }).attr("height", function (d) {
                return settings.strokeWidth * settings.g_dis[1];
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
                return settings.alpha;
            });
        rect.append('title').text(function (d) {
            return d.dateStr + " mw:" + d.MW + "class:" + d.resolution;
        });
        settings.diffY += settings.strokeWidth * settings.g_dis[1];
        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + settings.strokeWidth + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", settings.strokeWidth * settings.g_dis[1] + "px").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer");
        }).on("click", function () {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawMap(rectID);
        });
    }

    function rect_rudeGrit(data) {
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")");
        var rect = rect_g.selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return 0;
            }).attr("width", function (d) {
                return d.dx;
            }).attr("height", function (d) {
                return settings.strokeWidth * settings.g_dis[2];
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
                return settings.alpha;
            });
        rect.append('title').text(function (d) {
            return d.dateStr + " mw:" + d.MW + "class:" + d.resolution;
        });

        settings.diffY += settings.strokeWidth * settings.g_dis[2];
        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + settings.strokeWidth / 2 + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", settings.strokeWidth + "px").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer");
        }).on("click", function () {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawMap(rectID);
        });
    }

    function changeDrawMap(presentID) {
        var multi_svg = document.getElementsByClassName("multi-svg")[0];
        multi_svg.innerHTML = "";
        settings.fineObj.date = presentID;
        settings.fineObj.type = 1;
        //        console.log(multi_svg);
        settings.diffY = 0;
        var g_obj = d3.selectAll(".g-rect");
        console.log(g_obj);
        var presentFlag = 0,
            presentIndex = 0;
        for (var i in settings.dataMD) {
            if (settings.dataMD[i].key == presentID) //放大的Day
            {
                presentFlag++;
                presentIndex = i;
                settings.presentData = settings.dataMD[i].values;
                settings.presentID = presentID;
                line_fineGrit(settings.dataMD[i].values);
            } else {
                if (presentFlag <= 5 && presentFlag > 0) //选中之后的5D天数
                {
                    rect_midGrit(settings.dataMD[i].values);
                    presentFlag++
                } else { //选中日期之前天数
                    rect_rudeGrit(settings.dataMD[i].values);
                }
            }
        }
        //动态更改显示svg-multi-svg的高度
        settings.svg.attr("height", settings.diffY);
        //设置左侧time-day坐标鼠标右键事件--切换视图展示
        var day_des = document.getElementsByClassName("day-des");
        for (var i = 0; i < day_des.length; i++) {
            day_des[i].oncontextmenu = function () {
                if (confirm("是否切换为多参数对比视图?") == true)
                //调用切换的视图
                {
                    settings.fineObj.type = 2;
                    rect_fineGrit(presentIndex, presentID, settings.presentData);
                }
                return false;
            }
        }
        document.oncontextmenu = function () {
            return false;
        }
    }

    function display_rect(data) {
        //根据y-m-r分类展示；同时展示不同尺度不同分辨率的数据(前5D细粒度展示，6-10D中粒度展示，剩下的粗粒度展示)
        if (settings.drawNum[0] < 1 || settings.drawNum[1] < 5) {
            var draw_data = d3.nest().key(function (d) {
                return d.classFlag + "-" + d.day;
            }).entries(data);
            //var g=settings.svg.append('g').attr("class", "g-rect").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
            for (var i = 0; i < draw_data.length; i++) {
                if (settings.drawNum[0] < 1) {
                    settings.drawNum[0]++;
                    //最细粒度展示
                    //rect_fineGrit(draw_data[i].values);
                    line_fineGrit(draw_data[i].values);
                } else
                if (settings.drawNum[1] < 5) {
                    settings.drawNum[1]++;
                    //中粒度展示
                    rect_midGrit(draw_data[i].values);
                } else {
                    //粗粒度展示
                    rect_rudeGrit(draw_data[i].values);
                }
            }
        }
        settings.svg.attr("height", settings.diffY);
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


    //分别MCR 和Seg后的展示

    function line_fineSegGrit(data) {
        var dis = 15;
        settings.diffY += dis; //添加与上部的区别框
        //最细粒度展示(多参数对比)
        var startPoint = settings.diffY;
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")").style("fill", "red");
        var temp_color = d3.scale.category10();

        var x = d3.time.scale()
            .range([0, settings.width]);
        var xAxis = d3.svg.axis()
            .scale(x).orient("bottom").ticks(24);

        x.domain(d3.extent(data, function (d) {
            return d.date;
        }))

        var area = d3.svg.area()
            .interpolate("basis")
            .x(function (d) {
                return x(d.date);
            })
            .y0(settings.strokeWidth * settings.g_dis[0])
            .y1(function (d) {
                //展示MCR
                return y(d[settings.parameterName[0]]);
            });

        var y = d3.scale.linear()
            .range([settings.strokeWidth * settings.g_dis[0], 0]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        for (var i in settings.parameterName) {
            var line = d3.svg.area()
                .interpolate("basis")
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d[settings.parameterName[i]]);
                });
            y.domain(d3.extent(data, function (d) {
                return d[settings.parameterName[i]];
            }));
            rect_g.datum(data);
            rect_g.append("path")
                .attr("class", "line")
                .attr("d", line).attr("x", 0).attr("y", settings.diffY).style("stroke", temp_color(i)).style("stroke-width", "1px");

            if (i == 0) {
                //                分层次展示
                var tempAreaColor = settings.color_1((settings.mwDomain[0] + settings.mwDomain[1]) / 2);
                if (!settings.segment) { //展示MCR层
                    //记录MCR数据，
                    var MCRData = [],
                        temp = [];
                    console.log(settings.mwDomain);
                    data.forEach(function (d) {
                        if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                            temp.push(d);
                            if (d.date == data[data.length - 1].date && temp.length > 0) {
                                MCRData.push(temp);
                                temp = [];
                            }
                        } else {
                            if (temp.length > 0)
                                MCRData.push(temp);
                            temp = [];
                        }

                    });
                    MCRData.forEach(function (val) {
                        //展示MCR
                        rect_g.append("path")
                            .attr("class", "area")
                            .attr("d", area(val))
                            .style("fill", tempAreaColor).style("fill-opacity", 0.5);
                    });
                } else {
                    //展示MCR和SEG层
                    //记录MCR和SEG层数据
                    //SEG层
                    var startData = [],
                        startIndex = 0;
                    var segDate; //记录稳定工况段的起始start和结束end时间
                    var flag = 0; ////记录存在seg段含有的原始rect个数
                    var endFlag = 0; //记录跨天的稳定工况，-1表示跨天，0表示不跨天
                    var MCRData = [],
                        SEGData = [],
                        tempMCR = [],
                        tempSeg = [];
                    for (var t in data) {
                        var d = data[t];
                        if (d.resolution > 0 && (settings.nom == 5 ? d.NOM >= 5 : d.NOM == settings.nom) && (getSegDetail(d) >= settings.mwDomain[0]) && (getSegDetail(d) < settings.mwDomain[1])) {
                            if (flag == 0) {
                                segDate = isSegStart(d);
                                //flag = 0; //记录存在seg段含有的原始rect个数
                                if (JSON.stringify(segDate) != '{}') { //判断是否有返回值
                                    //                                console.log(d.date, segDate);
                                    startData = d; //记录稳定工况段起始位置数值
                                    startIndex = d.index; //记录稳定工况段初始位置index
                                    flag++;
                                    tempSeg.push(d);
                                }
                            } else if (flag > 0) {
                                if ((formatDate(segDate.end) - d.date) >= 0 && (formatDate(segDate.end) - d.date) < 600000) { //满足时间段
                                    if (tempSeg.length > 0) {
                                        tempSeg.push(d);
                                        SEGData.push(tempSeg);
                                        tempSeg = [];
                                        flag = 0;
                                    }
                                } else
                                    tempSeg.push(d);
                            }
                        }
                        if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                            tempMCR.push(d);
                            if (d.date == data[data.length - 1].date && tempMCR.length > 0) {
                                MCRData.push(tempMCR);
                                tempMCR = [];
                            }
                        } else {
                            if (tempMCR.length > 0)
                                MCRData.push(tempMCR);
                            tempMCR = [];
                        }
                    }
                    MCRData.forEach(function (val) {
                        //展示MCR
                        rect_g.append("path")
                            .attr("class", "area")
                            .attr("d", area(val))
                            .style("fill", tempAreaColor).style("fill-opacity", 0.5);
                    });
                    SEGData.forEach(function (val) {
                        //展示Seg
                        rect_g.append("path")
                            .attr("class", "area")
                            .attr("d", area(val))
                            .style("fill", tempAreaColor).style("fill-opacity", 1);
                    });

                }
            }
        }

        //        console.log(settings.presentData, settings.presentID);


        rect_g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + settings.strokeWidth * settings.g_dis[0] + ")")
            .call(xAxis).attr("dy", ".31em")
            .style("text-anchor", "middle").style("font-size", "9px");



        settings.diffY += settings.strokeWidth * settings.g_dis[0];
        //添加日期（Day）分隔线
        //        rect_g.append("line").attr("x1", -6).attr("y1", settings.diffY - 1).attr("y2", settings.diffY - 1 ).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);

        settings.diffY += dis + 2;
        //绘制边框
        //        rect_g.append("polyline").attr("points", "0," + startPoint + " " + settings.width + "," + startPoint + " 0," + settings.diffY + " " + settings.width + "," + settings.diffY + "").attr("y1", settings.diffY - 1).attr("y2", settings.diffY - 1).attr("x2", data[data.length - 1].x + data[0].dx).attr("stroke", "#000").attr("stroke-width", 1.5);
        // 添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + (settings.strokeWidth * settings.g_dis[0] / 2) + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", settings.strokeWidth * 2 + "px").style("font-weight", "bolder").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer")
        }).on("click", function () {
            //获取父节点的id--要放大到最大尺度的id
            //            console.log(d3.select(this), this.event);
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawSegMap(rectID);
        });
        //添加线段说明
        var line_g = rect_g.append("g").attr("transform", "translate(0,0)");
        line_g.selectAll(".line_text").data(settings.parameterName).enter().append("line").attr("class", "line_text").attr("x1", function (d, i) {
            return i * 50;
        }).attr("y1", 0).attr("x2", function (d, i) {
            return i * 50 + 30;
        }).attr("y2", 0).attr("stroke", function (d, i) {
            return temp_color(i);
        }).attr("stroke-width", "2");
        line_g.selectAll(".text_des").data(settings.parameterName).enter().append("text").attr("class", "text_des").attr("x", function (d, i) {
            return i * 50 + 30;
        }).attr("y", 0).attr("fill", "#000").text(function (d) {
            return d;
        });
    }

    //多参数细节展示图//MCR+SEG
    function rect_fineSegGrit(presentID, data) {
        var dis = 15;
        //        settings.diffY += dis; //添加与上部的区别框
        var tra = $("#" + presentID).css('transform').replace(/[^0-9\-,]/g, '').split(',');
        var g_x = parseInt(tra[4]),
            g_y = parseInt(tra[5]);
        var rect_g = d3.select($('#' + presentID)[0]);
        rect_g.selectAll('*').remove();
        for (var t in settings.parameterName) {
            var tempColor = d3.scale.quantize()
                .domain(d3.extent(data, function (d) {
                    return d[settings.parameterName[t]];
                }))
                .range(parameterColor[t]);
            console.log(settings.parameterName[t])
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
                        var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                            .attr("y", function (d) {
                                return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * t;
                            }).attr("width", d.dx).attr("height", function (d) {
                                return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                            }).style("fill", function () {
                                if ((mw >= settings.mwDomain[0]) && (mw < settings.mwDomain[1])) //解决MCR90% 时，判断resolution>0 如MCR=80% 但是meanMW>900的情况
                                    return settings.parameterName[t]=="MW"?settings.color_1(mw):tempColor(d[settings.parameterName[t]]);
                                else {
                                    return tempColor(d[settings.parameterName[t]]);
                                }
                            }).style("stroke-width", 0).style("stroke", "#ccc").style("opacity", function () {
                                if ((mw >= settings.mwDomain[0]) && (mw < settings.mwDomain[1]))
                                    return (settings.alpha * 0.8);
                                else return (settings.alpha * 0.5);
                            });
                        rect.append('title').text(d.dateStr + " "+settings.parameterName[t]+":" + d[settings.parameterName[t]]+ " class:" + d.resolution);


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
                                var rect = rect_g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                    .attr("y", function (d) {
                                        return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * t;
                                    }).attr("width", (d.dx * (d.index - startIndex + 1))).attr("height", function (d) {
                                        return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                                    })
                                    .style("fill", function () {
                                        //添加动态效果
                                        //                                    var seg_hsl = settings.color_1(getSegDetail(d)).colorHsl();
                                        //                                    var cssText = defindedNewHsl(seg_hsl);
                                        //                                    var seg_style = document.getElementById("seg-style");
                                        //                                    seg_style.innerHTML = cssText;
                                        //结束添加
                                        return settings.parameterName[t]=="MW"?settings.color_1(getSegDetail(d)):tempColor(d[settings.parameterName[t]]);
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
                                            return settings.color(detail["MW"]);
                                        });
                                        detail_rect.append('title').text(function (d) {
                                            return d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM
                                        });
                                    });
                                rect.append('title').text(d.dateStr + " "+settings.parameterName[t]+":" + d[settings.parameterName[t]] + " class:" + d.resolution + "nom:" + d.NOM);
                                //*************结束绘制稳定工况

                                //**任务2**绘制磨煤机台数标识符***开始
                                // drawNOM(startData);
                                //****绘制磨煤机台数标识符***结束

                            } else { //还未到结束时间
                                //1、判断是否结尾
                                if (d.date.getHours() == 23 && d.date.getMinutes() == 50) {
                                    //******任务1*****画稳定工况（可变色的长方形rect 加边框）开始
                                    var rect = rect_g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                        .attr("y", function (d) {
                                            return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * t;
                                        }).attr("width", (d.dx * (d.index - startIndex + 1)))
                                        .attr("height", function (d) {
                                            return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                                        })
                                        .style("fill", function () {
                                            //结束添加
                                            return  settings.parameterName[t]=="MW"?settings.color_1(getSegDetail(d)):tempColor(d[settings.parameterName[t]]);
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
//                                                console.log(detail["MW"], settings.color(detail["MW"]));
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
                        var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                            .attr("y", function (d) {
                                return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * t;
                            }).attr("width", d.dx).attr("height", function (d) {
                                return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                            }).style("fill", function () {
                                if (d.MW < 400)
                                    return 'rgb(221, 221, 221)';
                                else if (d.mw < 500)
                                    return "#1a9850";
                                else {
                                    return settings.parameterName[t]=="MW"?settings.color(d[settings.parameterName[t]]):tempColor(d[settings.parameterName[t]]);
                                }
                            }).style("stroke-width", 0.35).style("stroke", "#ccc").style("opacity", function () {
                                return (settings.alpha * 0.5);
                            });
                        rect.append('title').text(d.dateStr + " "+settings.parameterName[t]+":" + d[settings.parameterName[t]]+ " class:" + d.resolution);
                    }

                } else { //只限制功率的取值范围 （否） 只显示两层结构(RAW--MCR)
                    var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                        .attr("y", function (d) {
                            return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length * t;
                        }).attr("width", d.dx).attr("height", function (d) {
                            return settings.strokeWidth * settings.g_dis[0] / settings.parameterName.length;
                        }).style("fill", function () {
                            if (settings.mwLimit) {
                                if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                    return settings.parameterName[t]=="MW"?settings.color_1(d[settings.selectMap]):tempColor(d[settings.parameterName[t]]);
                                } else {
                                    if (d.MW < 400)
                                        return 'rgb(221, 221, 221)';
                                    else if (d.MW < 500)
                                        return '#1a9850';
//                                    else
                                        return settings.parameterName[t]=="MW"?settings.color(d[settings.selectMap]):tempColor(d[settings.parameterName[t]]);
                                }
                            }
                        }).style("stroke-width", 0.35).style("stroke", "#ccc").style("opacity", function () {
                            if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                return settings.alpha;
                            } else return (settings.alpha / 2);
                        });
                    rect.append('title').text(d.dateStr + " "+settings.parameterName[t]+":" + d[settings.parameterName[t]]+ " class:" + d.resolution);
                }
            }
        }



        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + (settings.strokeWidth * settings.g_dis[0] / 2) + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", "9px").style("font-size", settings.strokeWidth * 2 + "px").style("font-weight", "bolder").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer")
        }).on("click", function (evt) {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawSegMap(rectID);
        });
        document.oncontextmenu = function () {
            return true;
        }
    }

    function rect_midSegGrit(data) {
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")");
        drawSegRect(rect_g, settings.g_dis[1], data);
    }

    function rect_rudeSegGrit(data) {
        var rect_g = settings.svg.append('g').attr("class", "g-rect").attr("id", data[0].MD).attr("transform", "translate(" + settings.margin.right + "," + settings.diffY + ")");
        drawSegRect(rect_g, settings.g_dis[2], data);

    }

    //展示MCR限制和切割后的布局
    function display_seg(data) {
        var draw_data = d3.nest().key(function (d) {
            return d.classFlag + "-" + d.day;
        }).entries(data);
        for (var i = 0; i < draw_data.length; i++) {
            if (settings.drawNum[1] <= 5) //设置最细和中间粒度展示
            {
                if (settings.drawNum[0] == 0 && ((settings.fineObj.date == "" ? draw_data[0].key : settings.fineObj.date) == draw_data[i].key)) {
                    settings.drawNum[0]++;
                    //if (settings.fineObj.type == 2) //多参数对比
                    // rect_fineSegGrit(draw_data[i].key,draw_data[i].values);
                    // else //折线图
                    line_fineSegGrit(draw_data[i].values);
                } else {
                    if (settings.drawNum[0] > 0) { //中间粒度展示
                        settings.drawNum[1]++;
                        rect_midSegGrit(draw_data[i].values);
                    } else { //展示最粗粒度
                        rect_rudeSegGrit(draw_data[i].values);
                    }
                }
            } else {
                //展示最粗粒度
                rect_rudeSegGrit(draw_data[i].values);
            }
        }
        settings.svg.attr("height", settings.diffY);
    }

    function drawSegRect(rect_g, g_dis, data) {
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
                    var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                        .attr("y", 0).attr("width", d.dx).attr("height", settings.strokeWidth * g_dis).style("fill", function () {
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
                        //                        console.log(d.dateStr, formatDate(segDate.end), (formatDate(segDate.end) - d.date))
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
                            var rect = rect_g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                .attr("y", 0).attr("width", (d.dx * (d.index - startIndex + 1))).attr("height", settings.strokeWidth * g_dis)
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

                                    //                                        console.log(tempData);
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
                                var rect = rect_g.append("rect").attr("class", "seg-rect").attr("id", "rect-" + i).attr("x", (startData.x))
                                    .attr("y", 0).attr("width", (d.dx * (d.index - startIndex + 1)))
                                    .attr("height", settings.strokeWidth * g_dis)
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
                    var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                        .attr("y", 0).attr("width", d.dx).attr("height", settings.strokeWidth * g_dis).style("fill", function () {
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
                var rect = rect_g.append("rect").attr("class", "map_rect").attr("id", "rect-" + i).attr("x", d.x)
                    .attr("y", 0).attr("width", d.dx).attr("height", (settings.strokeWidth * g_dis)).style("fill", function () {
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
        settings.diffY += settings.strokeWidth * g_dis;

        //添加日期说明
        rect_g.append("g").attr("transform", "translate(-" + settings.margin.right + "," + settings.strokeWidth + ")").append("text").attr("class", "day-des").attr('dy', '0.31em').text(data[0].classFlag.split("-")[1] + "-" + data[0].day).style("font-size", settings.strokeWidth * g_dis + "px").style("text-align", "right").on("mouseover", function () {
            d3.select(this).style("cursor", "pointer");
        }).on("click", function () {
            //获取父节点的id--要放大到最大尺度的id
            var rectID = $(this).parent().prev().parent()[0].id;
            //********更改布局
            //方法
            changeDrawSegMap(rectID);
        });
    }

    function changeDrawSegMap(presentID) {
        var multi_svg = document.getElementsByClassName("multi-svg")[0];
        multi_svg.innerHTML = "";
        settings.fineObj.date = presentID;
        settings.fineObj.type = 1;
        settings.diffY = 0;
        var g_obj = d3.selectAll(".g-rect");
        //        console.log(g_obj);
        var presentFlag = 0,
            presentIndex = 0;
        for (var i in settings.dataMD) {
            if (settings.dataMD[i].key == presentID) //放大的Day
            {
                presentFlag++;
                presentIndex = i;
                settings.presentData = settings.dataMD[i].values;
                settings.presentID = presentID;
                line_fineSegGrit(settings.dataMD[i].values);
            } else {
                if (presentFlag <= 5 && presentFlag > 0) //选中之后的5D天数
                {
                    rect_midSegGrit(settings.dataMD[i].values);
                    presentFlag++
                } else { //选中日期之前天数
                    rect_rudeSegGrit(settings.dataMD[i].values);
                }
            }
        }
        //动态更改显示svg-multi-svg的高度
        settings.svg.attr("height", settings.diffY);
        //设置左侧time-day坐标鼠标右键事件--切换视图展示
        var day_des = document.getElementsByClassName("day-des");
        for (var i = 0; i < day_des.length; i++) {
            day_des[i].oncontextmenu = function () {
                if (confirm("是否切换为多参数对比视图?") == true)
                //调用切换的视图
                {
                    //                    var rectID = $(this).parent().prev().parent()[0].id;
                    settings.fineObj.type = 2;
                    rect_fineSegGrit(presentID, settings.presentData);
                }
                return false;
            }
        }
        document.oncontextmenu = function () {
            return false;
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


    //鼠标滑过SEG层展示鼠标跟随布局图处理函数
    function mouseover(d) {
        console.log(this, this.id);
//        this.parentNode.appendChild(this);
//        d3.select(this)
//            .style("pointer-events", "none")
//            .transition()
//            .duration(750)
//            .attr("transform", "translate(480,480)scale(23)rotate(180)")
//            .transition()
//            .delay(1500)
//            .attr("transform", "translate(240,240)scale(0)")
//            .style("fill-opacity", 0)
//            .remove();
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
        settings.diffY = 0;
        settings.drawNum = [0, 0];
        settings.dataMD = [];
        initRaw();
    };
    rectMap.segList = function (options) {
        settings = Object.assign(settings, options);
        settings.gY = 0;
        settings.diffY = 0;
        settings.drawNum = [0, 0];
        settings.dataMD = [];
        initRaw();
    };
    rectMap.scale = function () {
        console.log(111);
    };


    global[__INFO__.plug] = rectMap;
    global[__INFO__.plug] = rectMap;
})(typeof window !== "undifined" ? window : this);