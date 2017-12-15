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
        storkeWidth: 2,
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
        nowLimit: false
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
        settings.svg = svgDOM.append("svg").attr("width", w).attr("class", "multi-avg").style("margin-top", settings.svgInterval);
        if (settings.mode === "multi") {
            if (!settings.mwLimit) dataMode.multi();
            var beforeMonth = parseInt(settings.data[0].key.split('-')[1]);
            for (var i in settings.data) {
                if (parseInt(settings.data[i].key.split('-')[1]) - beforeMonth <= 1) {
                    h += drawRectMap(settings.data[i].values) * settings.storkeWidth;
                    display_axis(settings.data[i].values);
                } else {
                    h += 1 * settings.storkeWidth;
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
            h += drawRectMap(settings.data) * settings.storkeWidth;
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
        if (settings.segment) {
            display_seg(line_data);
            display_segList();
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
            return (d.values[d.values.length - 1].y + settings.storkeWidth / 2);
        }).attr('x2', 20).attr('y2', function (d) {
            return (d.values[d.values.length - 1].y + settings.storkeWidth / 2);
        }).attr('stroke-size', 1).attr('stroke', '#000');

        g.selectAll('axis-y').data(data).enter().append("line").attr("class", 'axis-x1').attr('x1', 19).attr('y1', function (d) {
            return (d.values[0].y)
        }).attr('x2', 19).attr('y2', function (d) {
            return (d.values[d.values.length - 1].y + settings.storkeWidth / 2)
        }).attr('stroke-size', 1).attr('stroke', '#000');

        //添加文本
        g.selectAll('.axis-title').data(data).enter().append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "rotate(-90)").text(function (d) {
            return d.values[0].classFlag;
        }).style("text-anchor", "middle").style("font-size", "10px");
        //g.selectAll('text').attr("transform","rotate(-20)");
    }
    //绘制坐标轴
    function display_axis(data) {
        var g = settings.svg.append("g").attr("traslate", "transform(0," + data[data.length - 1].y + ")");
        g.append("line").attr('x1', 0).attr('y1', data[0].y).attr('x2', 20).attr('y2', data[0].y).attr('stroke-size', 1).attr('stroke', '#000');
        g.append("line").attr('x1', 0).attr('y1', (data[data.length - 1].y + settings.storkeWidth / 2)).attr('x2', 20).attr('y2', (data[data.length - 1].y + settings.storkeWidth / 2)).attr('stroke-size', 1).attr('stroke', '#000');
        g.append("line").attr('x1', 19).attr('y1', (data[0].y)).attr('x2', 19).attr('y2', (data[data.length - 1].y + settings.storkeWidth / 2)).attr('stroke-size', 1).attr('stroke', '#000');

        //添加文本
        g.append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "translate(0," + data[Math.floor((data.length - 1) / 2)].y + ")").text(data[0].classFlag).style("font-size", "10px");
        //g.selectAll('text').attr("transform","rotate(-20)");
    }
    //初始化数据
    function initLayout(data, i) {
        var rect_w = Math.floor(settings.width / data.length);
        var rect_h = settings.storkeWidth;
        if (settings.segment) {
            var new_data = [],
                mean_data = [],
                start_arr = [],
                end_arr = [];
            data.forEach(function (d, dx) {
                d.x = dx * rect_w;
                d.y = (i + settings.gY) * rect_h;
                d.dx = rect_w;
                d.dy = rect_h;
                if (dx == 0 && d.resolution > 0) {
                    d.startIndex = 1;
                    start_arr.push(dx);
                }
                if (d.startIndex === 1) {
                    start_arr.push(dx);
                }
                if (d.endIndex === 1) {
                    end_arr.push(dx);
                }
                if (dx == data.length - 1 && d.resolution > 0) {
                    d.endIndex = 1;
                    end_arr.push(dx);
                }
            });
            for (var i = 0; i < start_arr.length; i++) {
                if (start_arr[i] >= 0 && end_arr[i] >= 0)
                    data[start_arr[i]].dx = (end_arr[i] - start_arr[i] + 1) * rect_w;
            }
        } else {
            data.forEach(function (d, dx) {
                d.x = dx * rect_w;
                //if (i == 0) {
                d.y = (i + settings.gY) * rect_h;
                //} else {
                //    d.y = (i + settings.gY) * rect_h + settings.gH;
                // }
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
                return settings.storkeWidth;
            }).style("fill", function (d) {
                if (settings.mwLimit) {
                    //                    console.log(settings.mwDomain[0], settings.mwDomain[1], d.MW)
                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
                        //                          console.log(settings.now, d.NOM, Math.round(d.NOM));
                        return (typeof settings.color_1 === "string") ? settings.color_1 : settings.color_1(d[settings.selectMap]);
                        //                        console.log(settings.color_1(d[settings.selectMap]));
                    } else {
                        if (d.MW < 400)
                            return 'rgb(221, 221, 221)';
                        else
                            return settings.limitColor;
                    }
                } else {
                    if (selectMap == "MW" || selectMap == "MWD2") {
                        if (d[selectMap] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);
                        }
                    }
                }
            }).style("stroke-width", 1).style("opacity", function (d) {
                if (settings.nowLimit) {
                    if ((d.MW >= settings.mwDomain[0]) && (d.MW < settings.mwDomain[1])) {
//                        console.log(d.NOM,d.NOW >= 5)
                        if (settings.now == 5 && d.NOM >= 5) {
                            return settings.alpha;
                        } else if (settings.now < 5 && (settings.now == Math.round(d.NOM))) {
                            return settings.alpha;
                        } else return settings.alpha / 2;
                    }
                } else return settings.alpha;
            }).on("mouseovwe", function () {});
        rect.append('title').text(function (d) {
            return d.dateStr + " mw:" + d.MW;
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
            }).style("stroke-width", settings.storkeWidth).style("opacity", settings.alpha);
    }

    function display_seg(data) {
        console.log(data);
        var list_svg = d3.select("#seg_list").append("svg").attr("width", 100).attr("height", 200).attr("class", "segList_svg").style("margin-top", settings.svgInterval);
        var list_g = list_svg.append("g");
        var g = settings.svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
        for (var i in data) {
            var d = data[i];
            var p = data[i];
            var flag = 0;
            if (data[i].startIndex == 1 && data[i].endIndex == 0) {
                p = getSegMean(d);
                //                                        console.log(p.startDate, p, d, (d.dx - d.x));
                g.append("rect").attr("class", "map_rect").attr("x", d.x)
                    .attr("y", d.y).attr("width", d.dx).attr("height", d.dy).style("stroke", function () {
                        if (selectMap == "MW" || selectMap == "MWD2") {
                            if (p[selectMap] < 400)
                                return 'rgb(221, 221, 221)';
                            else {
                                return (typeof settings.color === "string") ? settings.color : settings.color(p[settings.selectMap]);

                            }
                        }
                    }).style("stroke-width", settings.storkeWidth).style("opacity", settings.alpha);

                //画工矿
                if (d.resolution === p.resolution && d.resolution === settings.segFlag) {
                    if (flag == 0) {
                        list_g.append("rect").attr("class", "map_rect").attr("x", 0)
                            .attr("y", function () {
                                return d.y;
                            }).attr("width", function (d) {
                                return 20;
                            }).attr("height", function (d, i) {
                                return settings.storkeWidth;
                            }).style("fill", function () {
                                if (selectMap == "MW" || selectMap == "MWD2") {
                                    if (d[selectMap] < 400)
                                        return 'rgb(221, 221, 221)';
                                    else {
                                        return (typeof settings.color === "string") ? settings.color : settings.color(p[settings.selectMap]);

                                    }
                                }
                            }).style("stroke-width", 0.3).style("stroke", "#fff").style("opacity", settings.alpha);

                    }
                }
                //画圆
                g.append("circle").attr("cx", d.x).attr('cy', d.y).attr("r", settings.circleR).attr("fill", function () {
                    if (selectMap == "MW" || selectMap == "MWD2") {
                        if (p[selectMap] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof settings.color === "string") ? settings.color : settings.color(p[settings.selectMap]);

                        }
                    }
                });
            } else if (data[i].startIndex === 0 && data[i].endIndex === 0 && data[i].resolution === "0") {
                g.append("rect").attr("class", "map_rect").attr("x", d.x)
                    .attr("y", d.y).attr("width", d.dx).attr("height", d.dy).style("stroke", function () {
                        if (selectMap == "MW" || selectMap == "MWD2") {
                            if (d[selectMap] < 400)
                                return 'rgb(221, 221, 221)';
                            else {
                                return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);

                            }
                        }
                    }).style("stroke-width", settings.storkeWidth).style("opacity", settings.alpha_org / 2);
            }
        }
    }

    function display_segList(list_g, d) {

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
        return 11;
    };
    rectMap.reDisplay.name = "mwDomain";
    rectMap.scale = function () {
        console.log(111);
    };


    global[__INFO__.plug] = rectMap;
})(typeof window !== "undifined" ? window : this);