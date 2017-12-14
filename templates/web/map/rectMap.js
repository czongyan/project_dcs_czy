/*
1.功能
画图：1) 根据加载数据显示所有的线型图
*/

rectMap = function (config) {
    //    var rectversion: "1.0.2",
    //        author: "czy"
    //    };
    var __ = {
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
        segFlag: "1"
    };

    function extend(target, source) {
        for (var key in source) {
            console.log(key);
            target[key] = source[key];
        }
        return target;
    }
    extend(__, config);
    var rm = function (selection) {
        selection = rm.selection = d3.select(selection);
        console.log(selection);
    }
    rm.createMap = function () {
        console.log(__.data);
        var dataMode = {
            multi: function () {
                var csv_nest = d3.nest().key(function (d) {
                    return d.classFlag;
                }).entries(__.data);
                __.data = csv_nest;
            },
            single: function () {

            }
        };
        if (!__.nodeID) var svgDOM = d3.select("body");
        else
            var svgDOM = d3.select("#" + __.nodeID);
        if (!svgDOM) svgDOM = d3.select("body");
        var w = __.width + __.margin.right + __.margin.left;
        var h = 0;
        var svg = svgDOM.append("svg").attr("width", w).attr("class", "multi-avg").style("margin-top", __.svgInterval);
        if (__.mode === "multi") {
            dataMode.multi();
            var beforeMonth = parseInt(__.data[0].key.split('-')[1]);
            for (var i in __.data) {
                if (parseInt(__.data[i].key.split('-')[1]) - beforeMonth <= 1) {
                    h += drawRectMap(__.data[i].values) * __.storkeWidth;
                    display_axis(__.data[i].values, svg);
                } else {
                    h += 1 * __.storkeWidth;
                }
                var beforeMonth = parseInt(__.data[i].key.split('-')[1]);
            }
            if (__.height !== "auto")
                var inner_h = __.height + __.margin.top + __.margin.bottom;
            else
                var inner_h = h + __.margin.top + __.margin.bottom;
            svg.attr("height", inner_h);
            //            display_axis(__.data, svg);
        }
        if (__.mode === "single") {
            var h = 0;
            h += drawRectMap(__.data) * __.storkeWidth;
            if (__.height !== "auto")
                var inner_h = __.height + __.margin.top + __.margin.bottom;
            else
                var inner_h = h + __.margin.top + __.margin.bottom;
            svg.attr("height", inner_h);
        }

        function drawRectMap(data) {
            var csv_nest = d3.nest().key(function (d) {
                return d.day;
            }).entries(data);
            var line_data = [];
            csv_nest.forEach(function (d, i) {
                line_data = line_data.concat(initLayout(d.values, i));
            });
            //绘制
            //display_rect(line_data, svg)
            //display(line_data, svg);
            if (__.segment) {
                display_seg(line_data, svg);
                display_segList();
            } else {
                display_rect(line_data, svg);
            }
            __.gY += csv_nest.length;
            return csv_nest.length;
        }
        //绘制坐标轴
        function display_axis_1(data, svg) {
            var g = svg.append("g").attr("traslate", "transform(0,0)");

            g.selectAll('axis-x1').data(data).enter().append("line").attr("class", 'axis-x1').attr('x1', 0).attr('y1', function (d) {
                return d.values[1].y
            }).attr('x2', 20).attr('y2', function (d) {
                return d.values[0].y
            }).attr('stroke-size', 1).attr('stroke', '#000');

            g.selectAll('axis-x2').data(data).enter().append("line").attr("class", 'axis-x2').attr('x1', 0).attr('y1', function (d) {
                return (d.values[d.values.length - 1].y + __.storkeWidth / 2);
            }).attr('x2', 20).attr('y2', function (d) {
                return (d.values[d.values.length - 1].y + __.storkeWidth / 2);
            }).attr('stroke-size', 1).attr('stroke', '#000');

            g.selectAll('axis-y').data(data).enter().append("line").attr("class", 'axis-x1').attr('x1', 19).attr('y1', function (d) {
                return (d.values[0].y)
            }).attr('x2', 19).attr('y2', function (d) {
                return (d.values[d.values.length - 1].y + __.storkeWidth / 2)
            }).attr('stroke-size', 1).attr('stroke', '#000');

            //添加文本
            g.selectAll('.axis-title').data(data).enter().append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "rotate(-90)").text(function (d) {
                return d.values[0].classFlag;
            }).style("text-anchor", "middle").style("font-size", "10px");
            //g.selectAll('text').attr("transform","rotate(-20)");
        }
        //绘制坐标轴
        function display_axis(data, svg) {
            var g = svg.append("g").attr("traslate", "transform(0," + data[data.length - 1].y + ")");
            g.append("line").attr('x1', 0).attr('y1', data[0].y).attr('x2', 20).attr('y2', data[0].y).attr('stroke-size', 1).attr('stroke', '#000');
            g.append("line").attr('x1', 0).attr('y1', (data[data.length - 1].y + __.storkeWidth / 2)).attr('x2', 20).attr('y2', (data[data.length - 1].y + __.storkeWidth / 2)).attr('stroke-size', 1).attr('stroke', '#000');
            g.append("line").attr('x1', 19).attr('y1', (data[0].y)).attr('x2', 19).attr('y2', (data[data.length - 1].y + __.storkeWidth / 2)).attr('stroke-size', 1).attr('stroke', '#000');

            //添加文本
            g.append('text').attr('class', 'axis-title').attr('y', 0).attr("x", 0).attr('dy', '0.31em').attr("transform", "translate(0," + data[Math.floor((data.length - 1) / 2)].y + ")").text(data[0].classFlag).style("font-size", "10px");
            console.log(data[0].y, data[data.length - 1].y, data[0].classFlag, __.storkeWidth / 2);
            //g.selectAll('text').attr("transform","rotate(-20)");
        }
        //初始化数据
        function initLayout(data, i) {
            var rect_w = Math.floor(__.width / data.length);
            var rect_h = __.storkeWidth;
            if (__.segment) {
                var new_data = [],
                    mean_data = [],
                    start_arr = [],
                    end_arr = [];
                data.forEach(function (d, dx) {
                    d.x = dx * rect_w;
                    d.y = (i + __.gY) * rect_h;
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
                    d.y = (i + __.gY) * rect_h;
                    //} else {
                    //    d.y = (i + __.gY) * rect_h + __.gH;
                    // }
                    d.dx = rect_w;
                    d.dy = rect_h;
                });
            }
            return data;
        }

        function display_rect(data, svg) {
            svg.append('g').attr("class", "g-rect").attr("transform", "translate(" + __.margin.right + "," + __.margin.top + ")").selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                }).attr("width", function (d) {
                    return d.dx;
                }).attr("height", function (d) {
                    return __.storkeWidth;
                }).style("fill", function (d) {
                    if (selectMap == "MW" || selectMap == "MWD2") {
                        if (d[selectMap] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof __.color === "string") ? __.color : __.color(d[__.selectMap]);
                        }
                    }
                }).style("stroke-width", 0).style("opacity", __.alpha);
        }

        function display(data, svg) {
            svg.append('g').attr("class", "g-?").attr("transform", "translate(" + __.margin.right + "," + __.margin.top + ")").selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr('id', function (d, i) {
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
                            return (typeof __.color === "string") ? __.color : __.color(d[__.selectMap]);

                        }
                    }
                }).style("stroke-width", __.storkeWidth).style("opacity", __.alpha);
        }

        function display_seg(data, svg) {
            console.log(data);
            var list_svg = d3.select("#seg_list").append("svg").attr("width", 100).attr("height", 200).attr("class", "segList_svg").style("margin-top", __.svgInterval);
            var list_g = list_svg.append("g");
            var g = svg.append('g').attr("class", "g-?").attr("transform", "translate(" + __.margin.right + "," + __.margin.top + ")");
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
                                    return (typeof __.color === "string") ? __.color : __.color(p[__.selectMap]);

                                }
                            }
                        }).style("stroke-width", __.storkeWidth).style("opacity", __.alpha);

                    //画工矿
                    if (d.resolution === p.resolution && d.resolution === __.segFlag) {
                        if (flag == 0) {
                            list_g.append("rect").attr("class", "map_rect").attr("x", 0)
                                .attr("y", function () {
                                    return d.y;
                                }).attr("width", function (d) {
                                    return 20;
                                }).attr("height", function (d, i) {
                                    return __.storkeWidth;
                                }).style("fill", function () {
                                    if (selectMap == "MW" || selectMap == "MWD2") {
                                        if (d[selectMap] < 400)
                                            return 'rgb(221, 221, 221)';
                                        else {
                                            return (typeof __.color === "string") ? __.color : __.color(p[__.selectMap]);

                                        }
                                    }
                                }).style("stroke-width", 0.3).style("stroke", "#fff").style("opacity", __.alpha);

                        }
                    }
                    //画圆
                    g.append("circle").attr("cx", d.x).attr('cy', d.y).attr("r", __.circleR).attr("fill", function () {
                        if (selectMap == "MW" || selectMap == "MWD2") {
                            if (p[selectMap] < 400)
                                return 'rgb(221, 221, 221)';
                            else {
                                return (typeof __.color === "string") ? __.color : __.color(p[__.selectMap]);

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
                                    return (typeof __.color === "string") ? __.color : __.color(d[__.selectMap]);

                                }
                            }
                        }).style("stroke-width", __.storkeWidth).style("opacity", __.alpha_org / 2);
                }
            }
        }

        function display_segList(list_g, d) {

        }

        function getSegMean(d) {
            var p = {},
                data = [];
            data = __["seg_data"].slice(0);
            for (var i = 0; i < __.seg_data.length; i++) {
                p = __.seg_data[i];
                if (Math.abs(p.startDate - d.date) < 600000) {
                    p.resolution = d.resolution;
                    break;
                }
            }
            return p;
        }
    };
    rectMap.reDisplay = function () {
        console.log(rectMap);
        return 11;
    }
    rectMap.scale = function () {
        console.log(111);
    };
    rm.version = '1.0.2';
    rm.author = 'czy';
    return rm;
};