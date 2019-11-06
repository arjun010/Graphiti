/**
 * Created by arjun010 on 9/21/16.
 */
(function(){
    graphRenderer = {};

    appliedTranslate = [0,0];
    function zoomer(){
        appliedTranslate = d3.event.translate;
        viewContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        // d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        // d.x = d3.event.x;
        // d.y = d3.event.y;
    }

    function dragended(d) {
        //d.fixed = true;
        d3.select(this).classed("dragging", false);
    }

    var tick = function() {
        // links.attr("x1", function(d) { return d.source.x; })
        //     .attr("y1", function(d) { return d.source.y; })
        //     .attr("x2", function(d) { return d.target.x; })
        //     .attr("y2", function(d) { return d.target.y; });

        // links.attr("d", function(d) {
        //     var dx = d.target.x - d.source.x,
        //         dy = d.target.y - d.source.y,
        //         dr = Math.sqrt(dx * dx + dy * dy);
        //         dr = 0;
        //     return "M" +
        //         d.source.x + "," +
        //         d.source.y + "A" +
        //         dr + "," + dr + " 0 0,1 " +
        //         d.target.x + "," +
        //         d.target.y;
        // });

        if (!hull.empty()) {
            hull.data(convexHulls(globalVars.activeNetwork.nodes, getGroup, off))
                .attr("d", drawCluster);
        }

        links.attr('d', function(d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = d.type == "undirected" ? 6 : 6,
                targetPadding = d.type == "undirected" ? 6 : 12,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        // nodes.attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; });
        nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    };

    svg = null, viewZoom = null;
    var width,height,xScale,yScale,force,viewContainer,links,nodes,drag, drag2,nodeGlyphs,nodeLabels,linkedByIndex, linksLayer, nodesLayer, drag_line, hullG, hull;
    var timer;
    var shortestPathNodes = [], shortestPathNodePickerMode = 0, off = 15;
    graphRenderer.detailsModeActive = 0;

    var newLinkSourceNode = null, newLinkTargetNode = null, nodeMergeSourceNode = null, nodeMergeTargetNode = null;

    graphRenderer.detailsNode = null;

    graphRenderer.colorScale = d3.scale.category20();

    var edgeWeightScale = d3.scale.linear();
    var nodeSizeScale = d3.scale.linear();

    var hullDisplayMap = {
        "y" : "block",
        "" : "none",
        "undefined" : "none"
    };

    function convexHulls(nodes, index, offset) {
        var hulls = {};
        var groupMap = {};

        // create point sets
        for (var k=0; k<nodes.length; ++k) {
            var n = nodes[k];
            if (n.size) continue;
            var i = index(n),
                l = hulls[i] || (hulls[i] = []);
            if(i in groupMap){
                groupMap[i].push(n)
            }else{
                groupMap[i] = [n];
            }
            l.push([n.x-offset, n.y-offset]);
            l.push([n.x-offset, n.y+offset]);
            l.push([n.x+offset, n.y-offset]);
            l.push([n.x+offset, n.y+offset]);
        }

        // create convex hulls
        var hullset = [];
        for (i in hulls) {
            hullset.push({hullGroup: i, path: d3.geom.hull(hulls[i]), nodes:groupMap[i]});
        }

        return hullset;
    }

    var curve = d3.svg.line()
        .interpolate("cardinal-closed")
        .tension(.85);

    function drawCluster(d) {
        return curve(d.path); // 0.8
    }

    function getGroup(n) { return n.hullGroup; }

    graphRenderer.addLabel = function(node,nodeDataObj,labelAttribute,persist){
        if(!d3.select(node).classed("highlightedNode")){
            //d3.select(node).classed("highlightedNode",true);
            if (d3.select(node).select("text").empty() == true) {
                d3.select(node).append("text")
                    .attr("id", function () {
                        return "label__for__"+ nodeDataObj.id;
                    })
                    .attr("class", function(){
                        if(persist==true){
                            return "nodelabel-p"
                        }
                        else{
                            return "nodelabel"
                        }
                    })
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("font-family", "sans-serif")
                    .style("font-size", function () {
                        return 10;
                    })
                    .text(function (d) {
                        return d.label || globalVars.nodeMap[d.id][labelAttribute];
                    })
                    .style("fill", "black");
            }
        }
    };

    graphRenderer.init = function(selector,graph) {

        width = $(selector).width() * 0.99;
        height = $(selector).height();

        xScale = d3.scale.linear()
            .domain([0, width]).range([0, width]);
        yScale = d3.scale.linear()
            .domain([0, height]).range([0, height]);

        viewZoom = d3.behavior.zoom()
            .scaleExtent([0.2, 10])
            .x(xScale)
            .y(yScale)
            .on("zoom", zoomer);

        force = d3.layout.force()
            .gravity(0.1)
            .distance(150)
            .charge(-100)
            .size([width, height])
            .on('end', function () {
                // layout is done
                $("body").trigger('ForceLayoutEnd');
            });

        drag = force.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        svg = d3.select("#graphDiv").append("svg")
            .attr("class", "bgSvg")
            .attr("width", width)
            .attr("height", height)
            .call(viewZoom)
            .on("dblclick.zoom", null)
            .on("contextmenu", d3.contextMenu(svgContextMenu))
            .on("click", function (d) {
                d3.event.preventDefault();
                if (d3.select(d3.event.srcElement).attr("class") == "bgSvg") {
                    refreshCanvas();
                    graphRenderer.deactivateEditMode();
                }
            });

        viewContainer = svg.append("g");

        drag_line = viewContainer.append('svg:line')
            .attr('class', 'dragline hidden');
        // .attr('d', 'M0,0L0,0');

        // build the arrow.
        // viewContainer.append("svg:defs").selectAll("marker")
        //     .data(["end"])      // Different link/path types can be defined here
        //     .enter().append("svg:marker")    // This section adds in the arrows
        //     .attr("id", String)
        //     .attr("viewBox", "0 -5 10 10")
        //     .attr("refX", 30)
        //     .attr("refY", 0)
        //     .attr("markerWidth", 6)
        //     .attr("markerHeight", 6)
        //     .attr("orient", "auto")
        //     .append("svg:path")
        //     .attr("d", "M0,-5L10,0L0,5");

        // define arrow markers for graph links
        viewContainer.append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');

        viewContainer.append('svg:defs').append('svg:marker')
            .attr('id', 'start-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 4)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M10,-5L0,0L10,5')
            .attr('fill', '#000');


        force.nodes(graph.nodes)
            .links(graph.links)
            .start();

        hullG = viewContainer.append("g").attr("class","hullsLayer");

        linksLayer = viewContainer.append("g").attr("class", "linksLayer");
        nodesLayer = viewContainer.append("g").attr("class", "nodesLayer");

        graphRenderer.draw(graph);
    };

    graphRenderer.activateNodeMergeMode = function (sourceNode) {
        svg.call(viewZoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null)
            .on("mousedown.drag", null)
            .on("touchstart.drag", null)
            .on("touchmove.drag", null)
            .on("touchend.drag", null);

        nodeMergeSourceNode = sourceNode;

        d3.selectAll(".node").each(function(d){
            if(d.id==nodeMergeSourceNode.id){
                if(!d3.select(this).classed("highlightedNode")){
                    d3.select(this).classed("highlightedNode",true);
                }
            }else{
                d3.select(this).moveToFront();
                if(!d3.select(this).classed("fadedNode")){
                    d3.select(this).classed("fadedNode",true);
                }
            }
        });

        d3.selectAll(".node").each(function(d){
            d.fixed = true;
        });

        d3.selectAll('.node').on("contextmenu",null);

        d3.selectAll('.node').on("mouseover",nodeMergeModeNodeMouseoverHandler).on("mouseout",nodeMergeModeNodeMouseoutHandler).on("mouseup",nodeMergeMouseupHandler);
        //svg.on("mousemove",nodeMergeCanvasMousemoveHandler).on("mouseup",nodeMergeCanvasMouseupHandler);

    };

    function nodeMergeModeNodeMouseoverHandler(d){
        if(d3.select(this).classed("fadedNode")){
            d3.select(this).classed("fadedNode",false);
        }
        if (!d3.select(this).classed("highlightedNode")) {
            d3.select(this).classed("highlightedNode", true);
        }
    }

    function nodeMergeModeNodeMouseoutHandler(){
        d3.selectAll(".node").each(function (d) {
            if(d.id!=nodeMergeSourceNode.id){
                if(d3.select(this).classed("highlightedNode")){
                    d3.select(this).classed("highlightedNode",false);
                }
                if(!d3.select(this).classed("fadedNode")){
                    d3.select(this).classed("fadedNode",true);
                }
            }
        })
    }

    graphRenderer.activateLinkDrawingMode = function(sourceNode){

        svg.call(viewZoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null)
            .on("mousedown.drag", null)
            .on("touchstart.drag", null)
            .on("touchmove.drag", null)
            .on("touchend.drag", null);

        newLinkSourceNode = sourceNode;

        svg.on("mousemove",canvasMousemoveHandler).on("mouseup",canvasMouseupHandler);

        d3.selectAll(".link").classed("faded",true);

        d3.selectAll('.node').on('mousedown.drag', null)
            .on('touchstart.drag', null);

        d3.selectAll(".node").each(function(d){
            if(d.id==newLinkSourceNode.id){
                if(!d3.select(this).classed("highlightedNode")){
                    d3.select(this).classed("highlightedNode",true);
                }
            }else{
                if(!d3.select(this).classed("fadedNode")){
                    d3.select(this).classed("fadedNode",true);
                }
            }
        });

        d3.selectAll('.node').on("mousedown",nodeMousedownHandler).on("mouseup",nodeMouseupHandler).on("mouseover",linkCreationModeNodeMouseoverHandler).on("mouseout",linkCreationModeNodeMouseoutHandler);

        d3.selectAll('.node').on("contextmenu",null);

    };

    graphRenderer.deactivateEditMode = function(){

        svg.call(viewZoom).on("dblclick.zoom", null);

        newLinkSourceNode = null;
        newLinkTargetNode = null;
        nodeMergeSourceNode = null;
        nodeMergeTargetNode = null;

        d3.selectAll(".link").classed("faded",false);

        drag_line.classed('hidden', true);

        d3.selectAll('.node').on("mousedown",null).on("mouseup",null).on("mouseover",null).on("mouseout",null);

        d3.selectAll('.node').call(drag);

        d3.selectAll(".node").classed("highlightedNode",false).classed("fadedNode",false)

        d3.selectAll(".node").on("click",function(d){
            if(d3.event.defaultPrevented){
                return;
            }else{
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() {
                    nodeClickHandler(d);
                }, 250);
            }
        }).on("contextmenu",d3.contextMenu(nodeContextMenu));

        d3.selectAll(".node").each(function(d){
            d.fixed = false;
        });

    };

    keydown = function() {
        d3.event.preventDefault();
        // ctrl
        if(d3.event.keyCode === 17) {
            // viewZoom.on("zoom",null);
            svg.call(viewZoom)
                .on("mousedown.zoom", null)
                .on("touchstart.zoom", null)
                .on("touchmove.zoom", null)
                .on("touchend.zoom", null)
                .on("mousedown.drag", null)
                .on("touchstart.drag", null)
                .on("touchmove.drag", null)
                .on("touchend.drag", null);

            svg.on("mousemove",canvasMousemoveHandler).on("mouseup",canvasMouseupHandler).on("mousedown",canvasMousedownHandler);

            nodes.on('mousedown.drag', null)
                .on('touchstart.drag', null);

            nodes.on("mousedown",nodeMousedownHandler).on("mouseup",nodeMouseupHandler);

            nodes.on("contextmenu",function(d){
                d3.event.preventDefault();
                nodeDeleteHandler(d);
            })


        }else{
            // svg.on("zoom",null)            
            nodes.on("contextmenu",null);
            nodes.call(drag);
            d3.selectAll(".nodes").on("click",function(d){
                if(d3.event.defaultPrevented){
                    return;
                }else{
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function() {
                        nodeClickHandler(d);
                    }, 250);
                }
            });
        }
    };

    keyup = function () {
        // ctrl
        if(d3.event.keyCode === 17) {
            // nodes.on('mousedown.drag', null)
            //   .on('touchstart.drag', null);
            newLinkSourceNode = null;
            newLinkTargetNode = null;

            svg.call(viewZoom).on("dblclick.zoom", null);
            svg.on("mousedown",null).on("mousemove",null);

            nodes.call(drag);
            nodes.on("contextmenu",null);
            d3.selectAll(".nodes").on("click",function(d){
                if(d3.event.defaultPrevented){
                    return;
                }else{
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function() {
                        nodeClickHandler(d);
                    }, 250);
                }
            });
        }
    };


    graphRenderer.draw = function(graph){

        updateEdgeWeightScale(graph);

        hullG.selectAll("path.hull").remove();
        hull = hullG.selectAll("path.hull")
            .data(convexHulls(graph.nodes, getGroup, off))
            .enter().append("path")
            .attr("class", "hull")
            .attr("d", drawCluster)
            .style("display", function(d) {
                return hullDisplayMap[d.hullGroup];
            })
            .on("click",function(d){
                console.log(d)
            });

        links = linksLayer.selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            // .attr("marker-end", function(d){
            //     if(d.id != "link_3" && d.id != "link_5"){
            //         return "url(#end)"
            //     }
            // })
            .style("stroke-width",function(d){
                if(d.type=="undirected"){
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight + globalVars.edgeMap[d.target.id][d.source.id].totalWeight;
                }else{
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight;
                }
                return edgeWeightScale(edgeWeight);
            })
            .style('marker-start', function(d) {
                // return d.type == "directed" ? 'url(#start-arrow)' : ''; 
                // return d.left ? 'url(#start-arrow)' : '';
                return ""
            })
            .style('marker-end', function(d) {
                // return d.type == "directed" ? 'url(#end-arrow)' : '';
                // return d.right ? 'url(#end-arrow)' : ''; 
                if(d.type == "directed"){
                    return 'url(#end-arrow)'
                }else{
                    return ""
                }
            });

        nodes = nodesLayer.selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(drag);

        nodes.append("circle")
            .attr("class", "nodeGlyph")
            .attr("r", 5)
            //.style("fill", function(d) {  return graphRenderer.colorScale(d.primaryCategory); });

        nodes.each(function(node){
            graphRenderer.addLabel(this,node,"name",true);
        });

        force.on("tick",tick);

        d3.selectAll(".node").on("click",function(d){
            if(d3.event.defaultPrevented){
                return;
            }else{
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() {
                    nodeClickHandler(d);
                }, 250);
            }
        });

        d3.selectAll(".link").on("click",function(d){
            if(d3.event.defaultPrevented){
                return;
            }else{
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() {
                    if(graphRenderer.detailsNode!=null){
                        if(d.source.id == graphRenderer.detailsNode.id || d.target.id == graphRenderer.detailsNode.id){
                            main.showEdgeDetails(d);
                        }
                    }
                }, 250);
            }
        });

        d3.selectAll(".node").on("contextmenu",d3.contextMenu(nodeContextMenu));
        d3.selectAll(".link").on("contextmenu",d3.contextMenu(relationshipContextMenu));
    };

    graphRenderer.update = function(graph){
        //console.log(graph);

        updateEdgeWeightScale(graph);

        links = links.data(graph.links);
        //console.log(globalVars.edgeMap)

        var exitingLinks = links.exit();
        exitingLinks.remove();
        var newLinks = links.enter();

        force.start();

        hullG.selectAll("path.hull").remove();
        hull = hullG.selectAll("path.hull")
            .data(convexHulls(graph.nodes, getGroup, off))
            .enter().append("path")
            .attr("class", "hull")
            .attr("d", drawCluster)
            .style("display", function(d) {
                return hullDisplayMap[d.hullGroup];
            })
            .on("click",function(d){
                console.log(d)
            });

        newLinks.insert("path", ".node")
            .attr("class", "link")
            .style("stroke-width",function(d){
                if(d.type=="undirected"){
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight + globalVars.edgeMap[d.target.id][d.source.id].totalWeight;
                }else{
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight;
                }
                return edgeWeightScale(edgeWeight);
            })
            .style('marker-start', function(d) {
                // return d.type == "directed" ? 'url(#start-arrow)' : ''; 
                // return d.left ? 'url(#start-arrow)' : '';
                return ""
            })
            .style('marker-end', function(d) {
                // return d.type == "directed" ? 'url(#end-arrow)' : '';
                // return d.right ? 'url(#end-arrow)' : ''; 
                if(d.type == "directed"){
                    return 'url(#end-arrow)'
                }else{
                    return ""
                }
            });

        nodes = nodes.data(graph.nodes, function(d) {
            return d.id;
        });
        var exitingNodes = nodes.exit();
        exitingNodes.remove();
        var newNodes = nodes.enter();

        newNodes.append("g").attr("class","node")
            .call(drag)
            .append("circle")
            .attr("class", "nodeGlyph")
            .attr("r", 5);
            //.style("fill", function(d) {
            //    return graphRenderer.colorScale(d[$("")]);
            //});

        nodes.each(function(node){
            graphRenderer.addLabel(this,node,"name",true);
        });


        d3.selectAll(".link").style("stroke-width",function(d){
                if(d.type=="undirected"){
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight + globalVars.edgeMap[d.target.id][d.source.id].totalWeight;
                }else{
                    var edgeWeight = globalVars.edgeMap[d.source.id][d.target.id].totalWeight;
                }
                return edgeWeightScale(edgeWeight);
            })
            .style('marker-start', function(d) {
                // return d.type == "directed" ? 'url(#start-arrow)' : '';
                // return d.left ? 'url(#start-arrow)' : '';
                return ""
            })
            .style('marker-end', function(d) {
                // return d.type == "directed" ? 'url(#end-arrow)' : '';
                // return d.right ? 'url(#end-arrow)' : '';
                if(d.type == "directed"){
                    return 'url(#end-arrow)'
                }else{
                    return ""
                }
            })
            .on("click",function(d){
                if(d3.event.defaultPrevented){
                    return;
                }else{
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function() {
                        if(graphRenderer.detailsNode!=null){
                            if(d.source.id == graphRenderer.detailsNode.id || d.target.id == graphRenderer.detailsNode.id){
                                main.showEdgeDetails(d);
                            }
                        }
                    }, 250);
                }
            });

        //force.on("tick",tick );

        d3.selectAll(".nodes").on("click",function(d){
            if(d3.event.defaultPrevented){
                return;
            }else{
                if (timer) clearTimeout(timer);
                timer = setTimeout(function() {
                    nodeClickHandler(d);
                }, 250);
            }
        });

        d3.selectAll(".node").on("contextmenu",d3.contextMenu(nodeContextMenu));
        d3.selectAll(".link").on("contextmenu",d3.contextMenu(relationshipContextMenu));
    };

    function nodeMousedownHandler(d){
        //newLinkSourceNode = d;
        if(d.id==newLinkSourceNode.id){
            drag_line.classed('hidden', false).attr("x1",newLinkSourceNode.x).attr("y1",newLinkSourceNode.x).attr("x2",newLinkSourceNode.x).attr("y2",newLinkSourceNode.x);
        }
        // .attr('d', 'M' + newLinkSourceNode.x + ',' + newLinkSourceNode.y + 'L' + newLinkSourceNode.x + ',' + newLinkSourceNode.y);
    }

    function nodeMouseupHandler(d){
        // console.log(d)
        if(d!=newLinkSourceNode){
            newLinkTargetNode = d;
            //drag_line.classed('hidden', true);
            console.log("new link creation instantiated");
            //queryModalManager.showNewLinkModal(newLinkSourceNode,newLinkTargetNode);
            //queryModalManager.showNewLinkModal(newLinkSourceNode,newLinkTargetNode);
            var newLink = {
                "source" : newLinkSourceNode.id,
                "target" : newLinkTargetNode.id,
                "weight" : 1.0,
                "details" : "Link from " + newLinkSourceNode.id + " to " + newLinkTargetNode.id
            };
            graphRenderer.deactivateEditMode();
            graphQueryManager.addNewEdges([newLink]);
        }else{
            //drag_line.classed('hidden', true);
            newLinkSourceNode = null;
            newLinkTargetNode = null;
        }
    }

    function canvasMouseupHandler(){
        if(newLinkTargetNode==null){
            drag_line.classed('hidden', true);
            newLinkSourceNode = null;
            newLinkTargetNode = null;
        }else{

        }
    }

    function nodeMergeCanvasMousemoveHandler(){
        if(nodeMergeSourceNode!=null){

        }
    }

    function canvasMousemoveHandler(){
        if(newLinkSourceNode!=null){
            //console.log('moving');
            // drag_line.classed('hidden', false)
            //     .attr('d', 'M' + newLinkSourceNode.x + ',' + newLinkSourceNode.y + 'L' + newLinkSourceNode.x + ',' + newLinkSourceNode.y);       
            // console.log(d3.event)
            var newX = d3.mouse(this)[0], newY = d3.mouse(this)[1];
            //console.log(this)
            // console.log(d3.mouse(this))
            // drag_line.attr('d', 'M' + newLinkSourceNode.x + ',' + newLinkSourceNode.y + 'L' + newX + ',' + newY);
            drag_line.attr("x1",newLinkSourceNode.x)
                .attr("y1",newLinkSourceNode.y)
                .attr("x2",newX)
                .attr("y2",newY);
        }
    }

    function canvasMousedownHandler(){
        if(newLinkSourceNode==null){
            //queryModalManager.showNewNodeModal();
        }
    }

    graphRenderer.resizeNodes = function(sizingAttribute){
        var minVal = undefined, maxVal = undefined;
        for(var nodeId in globalVars.nodeMap){
            if(minVal == undefined){
                minVal = parseInt(globalVars.nodeMap[nodeId][sizingAttribute]);
            }else{
                if(minVal > parseInt(globalVars.nodeMap[nodeId][sizingAttribute])){
                    minVal = parseInt(globalVars.nodeMap[nodeId][sizingAttribute]);
                }
            }
            if(maxVal == undefined){
                maxVal = parseInt(globalVars.nodeMap[nodeId][sizingAttribute]);
            }else{
                if(maxVal < parseInt(globalVars.nodeMap[nodeId][sizingAttribute])){
                    maxVal = parseInt(globalVars.nodeMap[nodeId][sizingAttribute]);
                }
            }
        }

        nodeSizeScale.domain([minVal,maxVal]).range([4,10]);


        d3.selectAll(".nodeGlyph").transition().duration(500).attr("r",function(d){
            return nodeSizeScale(globalVars.nodeMap[d.id][sizingAttribute]);
        })
    };


    graphRenderer.recolorNodes = function(coloringAttribute){
        d3.selectAll(".nodeGlyph").transition().duration(500).style("fill",function(d){
            var colorAttributeValue = globalVars.nodeMap[d.id][coloringAttribute];
            return graphRenderer.colorScale(colorAttributeValue);
        })
    };

    function nodeClickHandler(d){
        //d3.selectAll(".node").each(function(curNode){
        //    if(curNode.id== d.id){
        //        if(!d3.select(this).classed("highlightedNode")){
        //            d3.select(this).classed("highlightedNode",true)
        //        }
        //    }else{
        //        if(!d3.select(this).classed("fadedNode")){
        //            d3.select(this).classed("fadedNode",true)
        //        }
        //    }
        //});
        graphRenderer.detailsNode = d;
        main.showNodeDetails(d);
        graphRenderer.highlightConnections(d);
        //main.showEdgeDetails();
    }

    graphRenderer.highlightConnections = function(d){
        var activeNodeIds = [d.id];
        d3.selectAll(".link").each(function(link){
            if(link.source.id == d.id || link.target.id == d.id){
                if(!d3.select(this).classed("highlighted")){
                    d3.select(this).classed("highlighted",true)
                }
                activeNodeIds.push(link.source.id);
                activeNodeIds.push(link.target.id);
                d3.select(this).moveToFront();
            }else{
                if(!d3.select(this).classed("faded")){
                    d3.select(this).classed("faded",true)
                }
            }
        });

        d3.selectAll(".node").each(function(node){
            if(activeNodeIds.indexOf(node.id)!=-1){ // if active node
                if(!d3.select(this).classed("highlightedNode")){
                    d3.select(this).classed("highlightedNode",true)
                }
                graphRenderer.addLabel(this,node,"name");
            }else{
                if(!d3.select(this).classed("fadedNode")){
                    d3.select(this).classed("fadedNode",true)
                }
            }
        });
    };

    function nodeDeleteHandler(d){
        //console.log("to delete", d);
        graphQueryManager.deleteNode(d);
    }

    function updateEdgeWeightScale(graph){
        var minEdgeWeight = undefined,maxEdgeWeight = undefined;
        for(var edge of graph.links){
            var sourceNodeId, targetNodeId;

            if(edge["source"] === parseInt(edge["source"], 10)) {
                sourceNodeId = graph.nodes[edge["source"]]['id'];
                targetNodeId = graph.nodes[edge["target"]]['id'];
            }else{
                sourceNodeId = edge["source"].id;
                targetNodeId = edge["target"].id;
            }
            //var edgeWeight = globalVars.edgeMap[sourceNodeId][targetNodeId].totalWeight;
            if(edge.type=="undirected"){
                var edgeWeight = globalVars.edgeMap[sourceNodeId][targetNodeId].totalWeight + globalVars.edgeMap[targetNodeId][sourceNodeId].totalWeight;
            }else{
                var edgeWeight = globalVars.edgeMap[sourceNodeId][targetNodeId].totalWeight;
            }

            if(minEdgeWeight==undefined){
                minEdgeWeight = edgeWeight;
            }else{
                if(minEdgeWeight > edgeWeight){
                    minEdgeWeight = edgeWeight;
                }
            }
            if(maxEdgeWeight==undefined){
                maxEdgeWeight = edgeWeight;
            }else{
                if(maxEdgeWeight < edgeWeight){
                    maxEdgeWeight = edgeWeight;
                }
            }
        }

        edgeWeightScale.domain([minEdgeWeight,maxEdgeWeight]).range([2,6]);
    }

    function linkCreationModeNodeMouseoverHandler(d){
        if(d3.select(this).classed("fadedNode")){
            d3.select(this).classed("fadedNode",false);
        }
        if (!d3.select(this).classed("highlightedNode")) {
            d3.select(this).classed("highlightedNode", true);
        }
    }

    function linkCreationModeNodeMouseoutHandler(){
        d3.selectAll(".node").each(function (d) {
            if(d.id!=newLinkSourceNode.id){
                if(d3.select(this).classed("highlightedNode")){
                    d3.select(this).classed("highlightedNode",false);
                }
                if(!d3.select(this).classed("fadedNode")){
                    d3.select(this).classed("fadedNode",true);
                }
            }
        })
    }

    function nodeMergeMouseupHandler(targetNode){
        if(targetNode!=nodeMergeSourceNode){

            nodeMergeTargetNode = targetNode;

            //queryModalManager.showNodeMergeModal(nodeMergeSourceNode,nodeMergeTargetNode);
            operationManager.mergeNodes(nodeMergeSourceNode,nodeMergeTargetNode);

            d3.selectAll(".node").each(function(d){
                if(d.id==nodeMergeSourceNode.id){
                    d3.select(this).moveToFront();
                }
            })
        }
    }

})();
