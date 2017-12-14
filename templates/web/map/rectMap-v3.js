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
                    h += drawRectMap(settings.data[i].values) * settings.strokeWidth;
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
            if (settings.segment)
                display_segList(line_data);
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
                data[j].y = (i + settings.gY) * rect_h;
                data[j].dx = rect_w;
                data[j].dy = rect_h;
                // console.log(data[j].resolution)
                if (data[j].resolution > 0) {
                    if (j == 0) { //每一天起始为稳定段
                        if (beforeClass == data[j].resolution) { //接前一天的结尾
                            data[j].startIndex = 2;
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
                // console.log(data[j].resolution,data[j].startIndex,data[j].endIndex)
            }

            //            var new_data = [],
            //                mean_data = [],
            //                start_arr = [],
            //                end_arr = [];
            //            data.forEach(function (d, dx) {
            //                d.x = dx * rect_w;
            //                d.y = (i + settings.gY) * rect_h;
            //                d.dx = rect_w;
            //                d.dy = rect_h;
            //                if (dx == 0 && d.resolution > 0) {
            //                    d.startIndex = 1;
            //                    start_arr.push(dx);
            //                }
            //                if (d.startIndex === 1) {
            //                    start_arr.push(dx);
            //                }
            //                if (d.endIndex === 1) {
            //                    end_arr.push(dx);
            //                }
            //                if (dx == data.length - 1 && d.resolution > 0) {
            //                    d.endIndex = 1;
            //                    end_arr.push(dx);
            //                }
            //            });
            //            for (var i = 0; i < start_arr.length; i++) {
            //                if (start_arr[i] >= 0 && end_arr[i] >= 0)
            //                    data[start_arr[i]].dx = (end_arr[i] - start_arr[i] + 1) * rect_w;
            //            }
        } else {
            data.forEach(function (d, dx) {
                d.x = dx * rect_w;
                d.y = (i + settings.gY) * rect_h;
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
                /*根据磨煤机更改透明度          if (settings.nomLimit) {
                              if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                  if (settings.nom == 5 && d.NOM >= 5) {
                                      return settings.alpha;
                                  } else if (settings.nom < 5 && (settings.nom == Math.round(d.NOM))) {
                                      return settings.alpha;
                                  } else return settings.alpha / 2;
                              }
                          } else return settings.alpha;**/
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

    function drawSingleDetail() {}

    function display_seg(data) {
        var g = settings.svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        var startData = [],
            startIndex = 0,
            flag = 0;
        for (var i in data) {
            var d = data[i];
            if (settings.segment) {
                //console.log(d.startIndex, d.endIndex, d.resolution, d.NOM, settings.nom)
                if (d.startIndex > 0 && d.NOM == settings.nom && (d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                    startData = d;
                    startIndex = i;
                    flag++;
                }
                if (flag > 0) { //满足所有外界条件的稳定工况段
                    if (d.endIndex == 1 && d.resolution == getSegFlag(d)) {
                        var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + startData.index).attr("x", startData.x)
                            .attr("y", startData.y).attr("width", (d.dx * (i - startIndex + 1))).attr("height", settings.strokeWidth).style("fill", function () {
                                //方案一：使用原色调(100跨度)
                                //return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(getSegDetail(d));
                                //方案2：使用三色调
                                return settings.color_1(getSegDetail(d));
                            }).style("stroke-width", 0.5).style("stroke", "blue").style("opacity", function () {
                                return settings.alpha;
                            }).on("click", function () {
                                var index=this.id.split('-')[1];
                                document.getElementById('light').style.display = 'block';
                                document.getElementById('fade').style.display = 'block';
                                d3.select("#polygon-" +index).attr("fill", "blue");
                                //弹出细节现实；
                                var detailSvg=d3.select('#singleDetail');
                                var tempData=[],p=0;tempIndex=0;
                                for(var i in data){
                                    if(data[i].index==index)
                                    {  
                                        p=i;
                                    }
                                    if(p>0&&tempIndex==0)
                                    {
                                        if(data[i].endIndex==1)
                                        {tempIndex=i;
                                        break;}
                                    }
                                }
                                for(var i=p-20;i<=tempIndex-20;i++)
                                {tempData.push(data[i])}
                                console.log(tempData);
                                detailSvg.append("g").selectAll("rect").data(tempData).enter().append("rect").attr("x",function(di,i){return i*10;}).attr("y",10).attr("width",10).attr("height",10).attr("stroke","#ccc").attr("stroke-width",1).attr("fill",function(detail){return settings.color(detail["MW"]);});
                            });
                        rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution + "nom:" + d.NOM);
                        startData = [];
                        flag = 0;
                        startIndex = 0;
                    } else {
                        var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + d.index).attr("x", d.x)
                            .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {

                                if (d.MW < 400)
                                    return 'rgb(221, 221, 221)';
                                else {
                                    //方案1：使用原始色调(100跨度 负荷范围内，范围外线性插值色调)
                                    //                                if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1]))
                                    //                                    return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
                                    //                                else return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                                    //方案2:使用三色调 >MCR 深色调 <MCR 浅色调 
                                    if ((d.MW < settings.mwDomain[0]))
                                        return settings.color_test[0];
                                    else if ((d.MW > settings.mwDomain[1]))
                                        return settings.color_test[2];
                                    else
                                        return settings.color_1(d[settings.selectMap]);
                                }
                            }).style("stroke-width", 0.5).style("stroke", "#ccc").style("opacity", function () {
                                if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1]))
                                    return (settings.alpha * 0.8);
                                else
                                    return (settings.alpha * 2 / 5);
                            });
                        rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);
                    }
                } else {
                    var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + d.index).attr("x", d.x)
                        .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {

                            if (d.MW < 400)
                                return 'rgb(221, 221, 221)';
                            else {
                                //方案1：使用原始色调(100跨度 负荷范围内，范围外线性插值色调)
                                //                                if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1]))
                                //                                    return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
                                //                                else return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                                //方案2:使用三色调 >MCR 深色调 <MCR 浅色调 
                                if ((d.MW < settings.mwDomain[0]))
                                    return settings.color_test[0];
                                else if ((d.MW > settings.mwDomain[1]))
                                    return settings.color_test[2];
                                else
                                    return settings.color_1(d[settings.selectMap]);
                            }
                        }).style("stroke-width", 0.5).style("stroke", "#ccc").style("opacity", function () {
                            if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1]))
                                return (settings.alpha * 0.8);
                            else
                                return (settings.alpha * 2 / 5);
                        });
                    rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);
                }
            } else {
                var rect = g.append("rect").attr("class", "map_rect").attr("id", "rect-" + d.index).attr("x", d.x)
                    .attr("y", d.y).attr("width", d.dx).attr("height", settings.strokeWidth).style("fill", function () {
                        if (settings.mwLimit) {
                            if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
                            } else {
                                if (d.MW < 400)
                                    return 'rgb(221, 221, 221)';
                                else
                                    return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                            }
                        }
                    }).style("stroke-width", 0.5).style("stroke", "#ccc").style("opacity", function () {
                        /*根据磨煤机更改透明度          if (settings.nomLimit) {
                                      if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                                          if (settings.nom == 5 && d.NOM >= 5) {
                                              return settings.alpha;
                                          } else if (settings.nom < 5 && (settings.nom == Math.round(d.NOM))) {
                                              return settings.alpha;
                                          } else return settings.alpha / 2;
                                      }
                                  } else return settings.alpha;**/
                        //根据切割工况段更改透明度
                        // if (settings.nomLimit) {
                        if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                            return settings.alpha;
                        } else return (settings.alpha / 2);
                        // } else return settings.alpha;
                    }).on("mouseovwe", function () {});
                rect.append('title').text(d.dateStr + " mw:" + d.MW + " class:" + d.resolution);
            }
            //           if (d.startIndex == 1) {
            //                if (settings.nomLimit) {
            //                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
            //                        /** //画圆
            //                         g.append("circle").attr("cx", d.x).attr('cy', d.y).attr("r", settings.circleR).attr("fill", function () {
            //                             if (settings.mwLimit) {
            //                                 if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
            //                                     return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
            //                                 } else {
            //                                     if (d.MW < 400)
            //                                         return 'rgb(221, 221, 221)';
            //                                     else
            //                                         return settings.limitColor;
            //                                 }
            //                             } else {
            //                                 if (selectMap == "MW" || selectMap == "MWD2") {
            //                                     if (d[selectMap] < 400)
            //                                         return 'rgb(221, 221, 221)';
            //                                     else {
            //                                         return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
            //                                     }
            //                                 }
            //                             }
            //                         });**/
            //                        //根据磨煤机台数话多边形
            //                        /**
            //                                                switch (settings.nom) {
            //                                                    case 3:
            //                                                        //三角形
            //                                                        g.append("polygon").attr("points", function () {
            //                                                            var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth);
            //                                                            console.log(str);
            //                                                            return str;
            //                                                        }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000");
            //                                                        break;
            //                                                    case 4:
            //                                                        //菱形
            //                                                        g.append("polygon").attr("points", function () {
            //                                                            var str = (d.x + d.dx / 2) + ',' + (d.y) + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth) + ' ' + (d.x) + ',' + (d.y + settings.strokeWidth / 2);
            //                                                            console.log(str);
            //                                                            return str;
            //                                                        }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000");
            //                                                        //path 菱形
            //                                                    case 5: //画圆
            //                                                        g.append("circle").attr("class","path -class").attr("cx", d.x).attr('cy', d.y).attr("r", settings.circleR).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000").on("mousemove",function(){console.log(d3.selectAll("circle"));d3.selectAll("circle").attr("r",settings.circleR);d3.select(this).attr('r',settings.circleR*2);});
            //                                                        break;
            //                                                }
            //                                                **/
            //
            //                        //                        /**
            //                        //                        根据symbol生成
            //                        var symbol = d3.svg.symbol();
            //                        var size = 30;
            //                        symbol.size(30);
            //                        switch (settings.nom) {
            //                            case 3:
            //                                symbol.type('triangle-down');
            //                                break;
            //                            case 4:
            //
            //                                symbol.type('diamond');
            //                                break;
            //                            case 5:
            //                                symbol.type('circle');
            //                                break;
            //                        }
            //                        g.append("path").attr("id", "path -" + i).attr("class", "path").attr("transform", function () {
            //                                return "translate(" + (d.x + d.dx / 2) + "," + d.y + ")";
            //                            }).attr("d", symbol)
            //                            .attr("fill", "#78c679").attr('stroke-width', 1).attr("stroke", "#252525").style("opacity", settings.alpha).on("mousemove", function () {
            //                                var size = 200;
            //                                symbol.size(size);
            //                                var temp = d3.select(this);
            //                                temp.attr("d", symbol);
            //                                temp.attr("stroke-width", 2);
            //                                temp.append("title").text("class:" + d.resolution + ".... \nnom: " + settings.nom + "....");
            //                            }).on("mouseout", function () {
            //                                symbol.size(30);
            //                                d3.selectAll('path').attr("d", symbol).attr("stroke-width", 1);
            //
            //                            });
            //                        //                        **/
            //                    }
            //                }
            //            }
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
                        //                        **/
                    }
                }
            }
        }
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
                                temp = g.append("polygon").attr("id", "polygon-" + d.index).attr("points", function () {
                                        var str = (d.x) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 4) + ',' + (d.y) + ' ' + (d.x + d.dx * 3 / 4) + ',' + d.y + ' ' + (d.x + d.dx) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (d.x + d.dx / 2) + ',' + (d.y + settings.strokeWidth);
                                        //console.log(str);
                                        return str;
                                    }).attr("fill", "#ccc").attr('stroke-width', 1).attr("stroke", "#000")
                                    .on("mousemove", function () {
                                        //                                    var id=document.getElementById("rect-"+(this.id.split('-')[1]-1));
                                        //                                    var x=id.x.animVal.value;
                                        //                                    var y=id.y.animVal.value;
                                        //                                    d3.select(this).attr("stroke-width", 2).attr("points", function () {
                                        //                                    var str =(this.points[0].x-d.dx/2) + ',' + (this.points[0].y)+ ' ' + (this.points[1].x-d.dx/4) + ',' + (this.points[1].x- ) + ' ' + (this.points[2].x + d.dx*5/4) + ',' + d.y + ' ' + (this.points[0].x+ d.dx*3/2) + ',' + (d.y + settings.strokeWidth / 2) + ' ' + (this.points[4].x) + ',' + (this.points[y].x) ;
                                        //                                    //console.log(str);
                                        //                                    return str;
                                        //});
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
})(typeof window !== "undifined" ? window : this);