/*
1.功能
画图：1) 根据加载数据显示所有的线型图
*/

(function (global) {
    var __INFO__ = {
        plug: "lineMap",
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
        alpha_org:0.5,
        dimensions: {},
        storkeWidth: 2,
        gY: 0,
        gX: 0,
        svgInterval: -5,
        seg_index: [],
        circleR:3
    };

    var lineMap = function (options) {
        var settings = Object.assign({}, defaults, options);

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
        var svg = svgDOM.append("svg").attr("width", w).attr("class", "multi-avg").style("margin-top", settings.svgInterval);
        if (settings.mode === "multi") {
            dataMode.multi();
            var beforeMonth = parseInt(settings.data[0].key.split('-')[1]);
            for (var i in settings.data) {
                if (parseInt(settings.data[i].key.split('-')[1]) - beforeMonth <= 1) {
                    h += drawLineMap(settings.data[i].values) * settings.storkeWidth;
                } else {
                    h += 1 * settings.storkeWidth;
                }
                var beforeMonth = parseInt(settings.data[i].key.split('-')[1]);
            }
            if (settings.height !== "auto")
                var inner_h = settings.height + settings.margin.top + settings.margin.bottom;
            else
                var inner_h = h + settings.margin.top + settings.margin.bottom;
            svg.attr("height", inner_h);
        }
        if (settings.mode === "single") {
            var h = 0;
            h += drawLineMap(settings.data) * settings.storkeWidth;
            if (settings.height !== "auto")
                var inner_h = settings.height + settings.margin.top + settings.margin.bottom;
            else
                var inner_h = h + settings.margin.top + settings.margin.bottom;
            svg.attr("height", inner_h);
        }

        function drawLineMap(data) {
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
            if (settings.segment) {display_seg(line_data, svg);display_segList();}
            settings.gY += csv_nest.length;
            return csv_nest.length;
        }

        function initLayout(data, i) {
            if (settings.segment) {
                var line_w = Math.floor(settings.width / data.length);
                var line_h = settings.storkeWidth;
                var new_data = [],
                    mean_data = [],
                    start_arr = [],
                    end_arr = [];
                data.forEach(function (d, dx) {
                    d.x = dx * line_w;
                    d.y = (i + settings.gY) * line_h;
                    d.dx = (dx + 1) * line_w;
                    d.dy = (i + settings.gY) * line_h;
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
                        data[start_arr[i]].dx = (end_arr[i] + 1) * line_w;
                }
            } else {
                var line_w = Math.floor(settings.width / data.length);
                var line_h = settings.storkeWidth;
                var new_data = [],
                    mean_data = [],
                    start_arr = [],
                    end_arr = [];
                data.forEach(function (d, dx) {
                    d.x = dx * line_w;
                    d.y = (i + settings.gY) * line_h;
                    d.dx = (dx + 1) * line_w;
                    d.dy = (i + settings.gY) * line_h;
                });
            }
            return data;
        }

        function display_rect(data, svg) {
            svg.append('g').attr("class", "g-rect").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")").selectAll(".map_rect").data(data).enter().append("rect").attr("class", "map_rect").attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                }).attr("width", function (d) {
                    return d.dx - d.x;
                }).attr("height", function (d) {
                    return settings.storkeWidth;
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

        function display(data, svg) {
            svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")").selectAll(".map_line").data(data).enter().append("line").attr("class", "map_line").attr('id', function (d, i) {
                    return 'line-' + i
                }).attr("x1", function (d) {
                    return d.x;
                })
                .attr("y1", function (d) {
                    return d.y;
                }).attr("x2", function (d) {
                    return d.dx;
                }).attr("y2", function (d) {
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

        function display_seg(data, svg) {
            console.log(data);
            var g = svg.append('g').attr("class", "g-?").attr("transform", "translate(" + settings.margin.right + "," + settings.margin.top + ")");
            for (var i in data) {
                var d = data[i];
                var p = data[i];
                if (data[i].startIndex == 1 && data[i].endIndex == 0) {
                    p = getSegMean(d);
//                    console.log(p.startDate, p.endDate, d.date, (d.dx - d.x));
                    g.append("line").attr("class", "map_line").attr("x1", d.x)
                        .attr("y1", d.y).attr("x2", d.dx).attr("y2", d.dy).style("stroke", function () {
                            if (selectMap == "MW" || selectMap == "MWD2") {
                                if (p[selectMap] < 400)
                                    return 'rgb(221, 221, 221)';
                                else {
                                    return (typeof settings.color === "string") ? settings.color : settings.color(p[settings.selectMap]);

                                }
                            }
                        }).style("stroke-width", settings.storkeWidth).style("opacity", settings.alpha);                    
                    g.append("circle").attr("cx",d.x).attr('cy',d.y).attr("r",settings.circleR).attr("fill",function(){
                        if (selectMap == "MW" || selectMap == "MWD2") {
                                if (p[selectMap] < 400)
                                    return 'rgb(221, 221, 221)';
                                else {
                                    return (typeof settings.color === "string") ? settings.color : settings.color(p[settings.selectMap]);

                                }
                            }
                    });

                } else if (data[i].startIndex === 0 && data[i].endIndex === 0&&data[i].resolution==="0") {
                    g.append("line").attr("class", "map_line").attr("x1", d.x)
                        .attr("y1", d.y).attr("x2", d.dx).attr("y2", d.dy).style("stroke", function () {
                            if (selectMap == "MW" || selectMap == "MWD2") {
                                if (d[selectMap] < 400)
                                    return 'rgb(221, 221, 221)';
                                else {
                                    return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);

                                }
                            }
                        }).style("stroke-width", settings.storkeWidth).style("opacity", settings.alpha_org);
                }
            }
        }

        function display_segList() {
            var list_svg = d3.select("#seg_list").append("svg").attr("width", 100).attr("height", 200).attr("class", "segList_svg").style("margin-top", settings.svgInterval);
            var list_g = list_svg.append("g");
            list_g.selectAll(".map_line").data(settings.seg_data).enter().append("rect").attr("class", "map_line").attr("x", function (d) {
                    return 0;
                })
                .attr("y", function (d, i) {
                    return i * settings.circleR;
                }).attr("width", function (d) {
                    return 20;
                }).attr("height", function (d,i) {
                    return settings.circleR-0.5;
                }).style("fill", function (d) {
                    if (selectMap == "MW" || selectMap == "MWD2") {
                        if (d[selectMap] < 400)
                            return 'rgb(221, 221, 221)';
                        else {
                            return (typeof settings.color === "string") ? settings.color : settings.color(d[settings.selectMap]);

                        }
                    }
                }).style("stroke-width", 0).style("opacity", settings.alpha);
        }
        function getSegMean(d) {
            var p = {},
                data = [];
            data = settings["seg_data"].slice(0);
            for (var i = 0; i < settings.seg_data.length; i++) {
                p = settings.seg_data[i];
                //                    console.log(p.startDate)
                if (Math.abs(p.startDate - d.date) < 600000) {
                    break;
                }
            }
            return p;
        }
    };
    lineMap.initData = function () {
        //console.log(11);
        return 11;
    }
    lineMap.scale = function () {
        console.log(111);
    };


    global[__INFO__.plug] = lineMap;
})(typeof window !== "undefined" ? window : this);