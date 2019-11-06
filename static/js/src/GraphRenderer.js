/**
 * Created by arjun010 on 12/22/16.
 */
(function () {
    graphRenderer = {};
    var edgeWeightMap = {};

    graphRenderer.network = {};

    var nodeTooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>" + globalVars.aggregationAttribute + ":</strong> <span style='color:red'>" + d[globalVars.aggregationAttribute] + "</span>";
        });

    var edgeTooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            var isPredefined = edgeWeightMap[d.source.id][d.target.id]['isPredefined'];
            var userConditionsSatisfied = edgeWeightMap[d.source.id][d.target.id]['conditionsSatisfied']-edgeWeightMap[d.source.id][d.target.id]['isPredefined'];

            var userConditionsSatisfiedHTML = "";
            if(d.satisfiedEdgeTypes!=undefined){
                for(var edgeType of d.satisfiedEdgeTypes){
                    userConditionsSatisfiedHTML += "<strong>" + edgeType + "</strong><br>";
                }
            }

            if(isPredefined==1){
                /*return "<strong>" + "Predefined edge." + "</strong><br>" +
                        "<strong>" + "Conditions satisfied " + "</strong>" + "<span style='color: gold'>" + userConditionsSatisfied + "</span><br>";*/
                return "<strong>" + "Predefined edge." + "</strong><br>" + userConditionsSatisfiedHTML;
            }else{
                //return "<strong>" + "Conditions satisfied " + "</strong>" + "<span style='color: gold'>" + userConditionsSatisfied + "</span>";
                return userConditionsSatisfiedHTML;
            }
        });

    var svg, width, height, force, drag, links, nodes, viewContainer, xScale, yScale, viewZoom, myDrag, edgeStrokeScale, linksLayer, nodesLayer, tick, timer, evidenceLinks, clickStartNode;

    graphRenderer.updateLinkDistance = function(newVal){
        force.distance(newVal);
        force.start();        
    };

    graphRenderer.updateCharge = function(newVal){
        force.charge(newVal);
        force.start();        
    };

    function zoomer() {
        viewContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        // d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        d.x = d3.event.x;
        d.y = d3.event.y;
    }

    function dragended(d) {
        //d.fixed = true;
        d3.select(this).classed("dragging", false);
    }

    graphRenderer.resetZoom = function(){
        //no molecules, nothing to do
        if (graphRenderer.network.nodes.length === 0)
            return;

        // Get the bounding box
        var min_x = d3.min(graphRenderer.network.nodes.map(function(d) {return d.x;}));
        var min_y = d3.min(graphRenderer.network.nodes.map(function(d) {return d.y;}));

        var max_x = d3.max(graphRenderer.network.nodes.map(function(d) {return d.x;}));
        var max_y = d3.max(graphRenderer.network.nodes.map(function(d) {return d.y;}));


        // The width and the height of the graph
        var mol_width = max_x - min_x;
        var mol_height = max_y - min_y;

        // how much larger the drawing area is than the width and the height
        var width_ratio = width / mol_width;
        var height_ratio = height / mol_height;

        // we need to fit it in both directions, so we scale according to
        // the direction in which we need to shrink the most
        var min_ratio = Math.min(width_ratio, height_ratio) * 0.8;

        // the new dimensions of the molecule
        var new_mol_width = mol_width * min_ratio;
        var new_mol_height = mol_height * min_ratio;

        // translate so that it's in the center of the window
        var x_trans = -(min_x) * min_ratio + (width - new_mol_width) / 2;
        var y_trans = -(min_y) * min_ratio + (height - new_mol_height) / 2;

        pathViewTranslate = [x_trans,y_trans];
        pathViewScale = min_ratio;

        if(pathViewScale<0.2){
            pathViewScale = 0.2;
        }
        if(pathViewScale>10){
            pathViewScale = 10;
        }


        // do the actual moving
        viewContainer.attr("transform", "translate(" + pathViewTranslate + ")" + " scale(" + pathViewScale + ")");

        // tell the zoomer what we did so that next we zoom, it uses the
        // transformation we entered here
        viewZoom.translate(pathViewTranslate);
        viewZoom.scale(pathViewScale);
    }

    graphRenderer.init = function (selector, network) {
        width = $(selector).width();
        height = $(selector).height() * 0.95;

        graphRenderer.network = network;

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
            .gravity(0.05)
            .theta(0.25)
            .alpha(0.9)
            .distance(globalVars.linkDistance)
            .charge(globalVars.layoutCharge)
            .size([width, height])
            .on('end', function () {
                // layout is done
                $("body").trigger('ForceLayoutEnd');
            });

        // force = cola.d3adaptor()
        //             .linkDistance(globalVars.linkDistance)
        //             .avoidOverlaps(true)
        //             .size([width, height])
        //             .on('end', function () {
        //                 // layout is done
        //                 $("body").trigger('ForceLayoutEnd');
        //             });

        drag = force.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        force.nodes([])
            .links([])
            .start();
        //force.nodes(graphRenderer.network.nodes)
        //     .links(graphRenderer.network.links)
        //     .start();

        svg = d3.select(selector).append("svg")
            .attr("class", "bgSvg")
            .attr("width", width)
            .attr("height", height)
            .call(viewZoom)
            .on("dblclick.zoom", null)
            .on("click", function (d) {
                if (d3.event.defaultPrevented) {
                    return;
                } else {
                    if (d3.select(d3.event.srcElement).attr("class") == "bgSvg") {
                        console.log("svg click!");
                        removeEvidenceLinks();
                    }
                }
            });

        svg.call(nodeTooltip);
        svg.call(edgeTooltip);

        viewContainer = svg.append("g");
        linksLayer = viewContainer.append("g").attr("class", "linksLayer");
        nodesLayer = viewContainer.append("g").attr("class", "nodesLayer");

        links = linksLayer.selectAll(".link")
            //.data(graphRenderer.network.links)
            .data([])
            .enter().append("path")
            .attr("class", "link");

        nodes = nodesLayer.selectAll(".node")
            //.data(graphRenderer.network.nodes)
            .data([])
            .enter()
            .append("g")
            .attr("class", "node")
            .call(drag);

        nodes.append("circle")
            .attr("class", "nodeGlyph")
            .attr("r", 5);

        force.on("tick", tick);
    };

    graphRenderer.draw = function (network) {

        clickStartNode = null;
        graphRenderer.network = network;
        force.nodes(network.nodes)
            .links(network.links)
            .start();

        links = links.data(network.links);
        //links = links.data(graphRenderer.network.links);
        links.attr("class", function (d) {
            if (d.linkType == "evidence") {
                return "link evidence"
            } else if (d.linkType == "predefined") {
                return "link predefined"
            } else if (d.linkType == "hybrid") {
                return "link hybrid"
            } else {
                return "link attributeBased"
            }
        });

        var exitingLinks = links.exit();
        exitingLinks.remove();
        var newLinks = links.enter();

        newLinks.insert("path", ".node")
            .attr("class", function (d) {
                if (d.linkType == "evidence") {
                    return "link evidence"
                } else if (d.linkType == "predefined") {
                    return "link predefined"
                } else if (d.linkType == "hybrid") {
                    return "link hybrid"
                } else {
                    return "link attributeBased"
                }
            });

        d3.selectAll(".link")
            .style("stroke-width", function (d) {
                var node1Id = d.source.id;
                var node2Id = d.target.id;
                if (node1Id in edgeWeightMap) {
                    if (node2Id in edgeWeightMap[node1Id]) {
                        if (edgeWeightMap[node1Id][node2Id]['conditionsSatisfied'] > 1) {
                            return 5;
                        } else {
                            return 2;
                        }
                    } else {
                        return 2;
                    }
                } else {
                    return 2;
                }
            })
            .on("mouseover",linkMouseover)
            .on("mouseout",linkMouseout)
            .style("cursor","pointer");


        nodes = nodes.data(network.nodes, function (d) {
            return d.id;
        });
        //nodes = nodes.data(graphRenderer.network.nodes, function(d) {
        //    return d.id;
        //});

        var exitingNodes = nodes.exit();

        exitingNodes.remove();
        var newNodes = nodes.enter();

        newNodes.append("g").attr("class", "node")
            .call(drag)
            .append("circle")
            .attr("class", "nodeGlyph")
            .attr("r", 5)
            .on('mouseover', nodeMouseover)
            .on('mouseout', nodeMouseout)
            .on("click", function (d) {
                if (d3.event.defaultPrevented) {
                    return;
                } else {
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function () {
                        nodeClickHandler(d);
                    }, 250);
                }
            });

        d3.selectAll(".node").each(function (d) {
            if (d3.select(this).select("text").empty() == true) {
                d3.select(this).append("text")
                    .attr("dx", 12)
                    .attr("dy", ".35em")
                    .style("font-family", "sans-serif")
                    .style("font-size", function () {
                        return 10;
                    })
                    .text(function (d) {
                        return d[globalVars.aggregationAttribute];
                    })
                    .style("fill", "black");
            }
        })        

    };

    tick = function () {
        links.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            dr = 0;
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;

        });

        nodes.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        
    };

    graphRenderer.computeLinks = function (nodeList) {
        //console.log(globalVars.activeConditionList);
        //console.log("=============");
        var predefinedEdges = getPredefinedEdges();
        var edgeList = predefinedEdges['edgeList'];
        var existingEdgeMap = predefinedEdges['edgeMap'];

        edgeWeightMap = {};
        for (var node1Id in existingEdgeMap) {
            for (var node2Id in existingEdgeMap[node1Id]) {
                edgeWeightMap[node1Id] = {}
                edgeWeightMap[node1Id][node2Id] = {
                    'conditionsSatisfied': 1,
                    'isPredefined': 1
                };
            }
        }

        for (var node1Index = 0; node1Index < nodeList.length - 1; node1Index++) {
            var node1 = nodeList[node1Index];
            for (var node2Index = node1Index + 1; node2Index < nodeList.length; node2Index++) {
                var node2 = nodeList[node2Index];
                for (var andBlockIndex in globalVars.activeConditionList) {
                    var andBlock = globalVars.activeConditionList[andBlockIndex];
                    var andBlockId = queryConstructor.getAndBlockId(andBlock);

                    var isActiveAndBlock = queryConstructor.isActiveAndBlock(andBlockId);

                    if(isActiveAndBlock==true){
                        var meetsAndBlock = 1;
                        var andBlockSatisfied = 1;
                        for (var conditionIndex in andBlock) {
                            var condition = andBlock[conditionIndex];
                            var conditionSatisfied = satisfiesCondition(node1, node2, condition);
                            if (conditionSatisfied == -1) {
                                andBlockSatisfied = -1;
                                break;
                            }
                            //console.log(node1[globalVars.aggregationAttribute],node2[globalVars.aggregationAttribute],condition);
                        }
                        if (andBlockSatisfied == 1) {
                            if (node1.id in edgeWeightMap) {
                                if (node2.id in edgeWeightMap[node1.id]) {
                                    edgeWeightMap[node1.id][node2.id]['conditionsSatisfied'] += 1;
                                    //edgeWeightMap[node1.id][node2.id] += 1;
                                } else {
                                    edgeWeightMap[node1.id][node2.id] = {
                                        'isPredefined': 0
                                    };
                                    edgeWeightMap[node1.id][node2.id]['conditionsSatisfied'] = 1;
                                }
                            } else {
                                edgeWeightMap[node1.id] = {};
                                edgeWeightMap[node1.id][node2.id] = {
                                    'isPredefined': 0
                                };
                                edgeWeightMap[node1.id][node2.id]['conditionsSatisfied'] = 1;
                            }

                            if (node2.id in edgeWeightMap) {
                                if (node1.id in edgeWeightMap[node2.id]) {
                                    edgeWeightMap[node2.id][node1.id]['conditionsSatisfied'] += 1;
                                } else {
                                    edgeWeightMap[node2.id][node1.id] = {
                                        'isPredefined': 0
                                    };
                                    edgeWeightMap[node2.id][node1.id]['conditionsSatisfied'] = 1;
                                }
                            } else {
                                edgeWeightMap[node2.id] = {};
                                edgeWeightMap[node2.id][node1.id] = {
                                    'isPredefined': 0
                                };
                                edgeWeightMap[node2.id][node1.id]['conditionsSatisfied'] = 1;
                            }

                            //console.log('possible bottleneck start',new Date());
                            //var existingLink = isExistingLink(node1.id,node2.id,edgeList,nodeList);
                            //console.log('possible bottleneck end',new Date());
                            var existingLink = linkInEdgeMap(node1.id, node2.id, existingEdgeMap);

                            if (existingLink == -1) {
                                var newEdge = {
                                    "source": node1,
                                    "target": node2,
                                    "linkType": ""
                                };
                                edgeList.push(newEdge);
                                addToExistingEdgeMap(node1.id, node2.id, newEdge, existingEdgeMap);
                            } else {
                                if (existingLink.linkType == "predefined") {
                                    existingLink.linkType = "hybrid";
                                } else if (existingLink.linkType == "hybrid") {
                                    existingLink.linkType = "hybrid";
                                } else {
                                    existingLink.linkType = "";
                                }
                            }
                        }
                    }
                    //console.log(node1[globalVars.aggregationAttribute],node2[globalVars.aggregationAttribute]);
                }
            }
        }
        //console.log(edgeWeightMap);
        //console.log(edgeList)
        //graphRenderer.draw({
        //    "nodes" : [],
        //    "links" : []
        //});
        //console.log(edgeList)
        //console.log("computed", nodeList.length,edgeList.length)
        graphRenderer.draw({
            "nodes": nodeList,
            "links": edgeList
        });
    };

    var linkInEdgeMap = function (node1Id, node2Id, edgeMap) {
        if (node1Id in edgeMap) {
            if (node2Id in edgeMap[node1Id]) {
                return edgeMap[node1Id][node2Id];
            }
        }

        if (node2Id in edgeMap) {
            if (node1Id in edgeMap[node2Id]) {
                return edgeMap[node2Id][node1Id];
            }
        }

        return -1;
    };

    var addToExistingEdgeMap = function (node1Id, node2Id, newEdge, edgeMap) {
        if (node1Id in edgeMap) {
            if (node2Id in edgeMap[node1Id]) {

            } else {
                edgeMap[node1Id][node2Id] = newEdge;
            }
        } else {
            edgeMap[node1Id] = {};
            edgeMap[node1Id][node2Id] = newEdge;
        }

        if (node2Id in edgeMap) {
            if (node1Id in edgeMap[node2Id]) {

            } else {
                edgeMap[node2Id][node1Id] = newEdge;
            }
        } else {
            edgeMap[node2Id] = {};
            edgeMap[node2Id][node1Id] = newEdge;
        }
    };

    satisfiesCondition = function (node1, node2, condition) {
        var conditionSatisfied = -1;
        switch (globalVars.dataAttributeMap[condition.attribute]['type']) {
            case "Number":
                if (condition.operator == "SAME_VALUE") { // if values are same
                    if (parseFloat(node1[condition.attribute]) == parseFloat(node2[condition.attribute])) {
                        conditionSatisfied = 1;
                    }
                } else if (condition.operator == "LESS_THAN_EQUALS") { // if value difference is within threshold
                    //var valueDiff = Math.abs(parseFloat(node1[condition.attribute]) - parseFloat(node2[condition.attribute]));
                    var similarityMap = similarityFinder.getSimilarityMapForAttribute(node1, node2, condition.attribute);
                    if (similarityMap != null) {
                         var valueDiff = parseFloat(similarityMap['value']);
                        //console.log("========")
                        //console.log(node1[globalVars.aggregationAttribute],node2[globalVars.aggregationAttribute],condition);
                        if (valueDiff <= parseFloat(condition.value)) {
                            conditionSatisfied = 1;
                        }
                    }
                }
                break;
            case "Categorical":
                if (condition.operator == "CONTAINS_COMMON") {
                    var similarityMap = similarityFinder.getSimilarityMapForAttribute(node1, node2, condition.attribute);
                    if (similarityMap != null) {
                        conditionSatisfied = 1;
                    }
                } else if (condition.operator == "CONTAINS_VALUES") {
                    var similarityMap = similarityFinder.getSimilarityMapForAttribute(node1, node2, condition.attribute);
                    if (similarityMap != null) {
                        var commonValues = Object.keys(similarityMap['value']);
                        if (_.intersection(commonValues, condition.value).length > 0) {
                            conditionSatisfied = 1;
                        }
                    }
                }
                break;
            case "List":
                if (condition.operator == "CONTAINS_COMMON") {
                    var similarityMap = similarityFinder.getSimilarityMapForAttribute(node1, node2, condition.attribute);
                    if (similarityMap != null) {
                        conditionSatisfied = 1;
                    }
                } else if (condition.operator == "CONTAINS_VALUES") {
                    var similarityMap = similarityFinder.getSimilarityMapForAttribute(node1, node2, condition.attribute);
                    if (similarityMap != null) {
                        var commonValues = similarityMap['value'];
                        if (_.intersection(commonValues, condition.value).length > 0) {
                            conditionSatisfied = 1;
                        }
                    }
                }
                break;
            default :
                break;
        }
        //console.log(node1['Name'],node2['Name'],conditionSatisfied)
        return conditionSatisfied;
    };

    var isExistingLink = function (node1Id, node2Id, existingLinks, nodeList) {
        for (var i in existingLinks) {
            if (existingLinks[i]["source"] === parseInt(existingLinks[i]["source"], 10)) {
                var sIndex = existingLinks[i]['source'];
                var tIndex = existingLinks[i]['target'];
                var sourceNode = nodeList[sIndex];
                var targetNode = nodeList[tIndex];
            } else {
                var sourceNode = existingLinks[i].source;
                var targetNode = existingLinks[i].target;
            }
            if ((sourceNode.id == node1Id && targetNode.id == node2Id) || (targetNode.id == node1Id && sourceNode.id == node2Id)) {
                return existingLinks[i];
            }
        }
        return -1;
    };

    graphRenderer.addNode = function (node) {
        if (isExistingNode(node.id, graphRenderer.network.nodes) == -1) {
            graphRenderer.network.nodes.push(node);
        }
        graphRenderer.network.links = getPredefinedEdges()['edgeList'];

        graphRenderer.draw({
            "nodes": graphRenderer.network.nodes,
            "links": graphRenderer.network.links
        });
    };

    graphRenderer.removeZeroDegreeNodes = function () {
        var nodesToRemove = [];
        for(var node of graphRenderer.network.nodes){
            if(node.weight==0){
                nodesToRemove.push(node);
            }
        }

        for (var i in nodesToRemove) {
            var nodeToRemove = nodesToRemove[i];
            var removalNodeIndex = graphRenderer.network.nodes.indexOf(nodeToRemove);
            graphRenderer.network.nodes.splice(removalNodeIndex, 1);
        }

        graphRenderer.draw(graphRenderer.network);

    };

    var getPredefinedEdges = function () {
        var edgeList = [], edgeMap = {};
        for (var i = 0; i < graphRenderer.network.nodes.length - 1; i++) {
            var node1 = graphRenderer.network.nodes[i];
            for (var j = i + 1; j < graphRenderer.network.nodes.length; j++) {
                var node2 = graphRenderer.network.nodes[j];
                if (node1.id in globalVars.preDefinedEdgeMap) {
                    if (node2.id in globalVars.preDefinedEdgeMap[node1.id]) {
                        var existingLink = isExistingLink(node1.id, node2.id, edgeList, graphRenderer.network.nodes);
                        if (existingLink == -1) {
                            var newEdge = {
                                "source": node1,
                                "target": node2,
                                "linkType": "predefined"
                            };
                            edgeList.push(newEdge);
                            addToExistingEdgeMap(node1.id, node2.id, newEdge, edgeMap)
                        }
                    }
                }
            }
        }
        return {
            "edgeList": edgeList,
            "edgeMap": edgeMap
        }
    };

    var isExistingNode = function (nodeId, existingNodes) {
        for (var i in existingNodes) {
            var node = existingNodes[i];
            if (node.id == nodeId) {
                return 1;
            }
        }
        return -1;
    };

    var nodeClickHandler = function (d) {
        if (clickStartNode == null) {
            clickStartNode = d;
        } else {
            var existingLink = isExistingLink(d.id, clickStartNode.id, graphRenderer.network.links, graphRenderer.network.nodes);
            if (existingLink == -1) {
                //console.log(clickStartNode,d);
                graphRenderer.network.links.push({
                    "source": clickStartNode,
                    "target": d,
                    "linkType": "evidence"
                });
                globalVars.evidencePairs.push([clickStartNode, d]);

                //var similarityMap = similarityFinder.getSimilarityMapForNodePair(clickStartNode,d);
                var similarityMap = similarityFinder.getSimilarityMap(globalVars.evidencePairs);

                var suggestedConditions = conditionConstructor.generateConditions(similarityMap);
                interfaceManager.populateSuggestionsContainer(suggestedConditions);
                graphRenderer.draw(graphRenderer.network);
            }
        }
    };

    var removeEvidenceLinks = function () {
        var linksToRemove = [];
        console.log(graphRenderer.network);
        for (var i in graphRenderer.network.links) {
            var link = graphRenderer.network.links[i];
            if (link.linkType == "evidence") {
                linksToRemove.push(link);
            }
        }
        for (var i in linksToRemove) {
            var linkToRemove = linksToRemove[i];
            var removalLinkIndex = graphRenderer.network.links.indexOf(linkToRemove);
            graphRenderer.network.links.splice(removalLinkIndex, 1);
        }
        globalVars.evidencePairs = [];

        interfaceManager.populateSuggestionsContainer([]);
        graphRenderer.draw(graphRenderer.network);
    };

    var getANDBlockEdgeType = function(andBlockIndex){
        var ANDBlockEdgeType = null;
        $(".ANDContainer").each(function(){
            if($(this).attr("id") == "ul-"+andBlockIndex){
                ANDBlockEdgeType = d3.select("#ul-"+andBlockIndex+"-ANDContainerHeader").select(".edgeTypeInputBox").attr("value");
            }
        });
        return ANDBlockEdgeType;
    };


    getSatisfiedConditions = function(node1,node2) {
        //console.log(node1,node2)
        var conditionsSatisfied = [];
        var satisfiedEdgeTypes = [];
        for (var andBlockIndex in globalVars.activeConditionList) {
            var andBlock = globalVars.activeConditionList[andBlockIndex];
            var meetsAndBlock = 1;
            var andBlockSatisfied = 1;

            var encapsulatedConditions = [];
            for (var conditionIndex in andBlock) {
                var condition = andBlock[conditionIndex];
                var conditionId = condition.id;
                var conditionSatisfied = satisfiesCondition(node1, node2, condition);

                if (conditionSatisfied == -1) {
                    andBlockSatisfied = -1;
                    break;
                }else{
                    encapsulatedConditions.push(conditionId);
                }
            }
            if(andBlockSatisfied==1){
                conditionsSatisfied = conditionsSatisfied.concat(encapsulatedConditions);
                var andBlockId = queryConstructor.getAndBlockId(andBlock);
                var andBlockEdgeType = globalVars.andBlockMap[andBlockId]['label'];
                if(andBlockEdgeType!=null){
                    satisfiedEdgeTypes.push(andBlockEdgeType);
                }
            }
        }

        return {
            "conditionsSatisfied":conditionsSatisfied,
            "satisfiedEdgeTypes":satisfiedEdgeTypes
        };
    };

    var linkMouseover = function(d){
        if(globalVars.activeConditionList.length>0){
            var satisfiedConditionMap = getSatisfiedConditions(d.source, d.target);
            var conditionsSatisfied = satisfiedConditionMap['conditionsSatisfied'];
            var satisfiedEdgeTypes = satisfiedConditionMap['satisfiedEdgeTypes'];
            d.satisfiedEdgeTypes = satisfiedEdgeTypes;
            interfaceManager.highlightSatisfiedConditions(conditionsSatisfied);
        }
        edgeTooltip.show(d);
        d3.selectAll(".node")
            .classed("faded",function(node){
                if([d.source.id, d.target.id].indexOf(node.id)==-1){
                    return true;
                }
            });

        d3.selectAll(".link")
            .classed("faded",function(link){
                if([d.source.id, d.target.id].indexOf(link.source.id)!=-1 && [d.source.id, d.target.id].indexOf(link.target.id)!=-1){
                    return false;
                }else{
                    return true;
                }
            });

    };

    var linkMouseout = function(d){
        interfaceManager.unHighlightConditions();
        edgeTooltip.hide();
        d3.selectAll(".node").classed("faded",false);
        d3.selectAll(".link").classed("faded",false);
    };

    var nodeMouseover = function(d){
        nodeTooltip.show(d);
        interfaceManager.showNodeDetails(d);
    };

    var nodeMouseout = function(d){
        nodeTooltip.hide();
    };

    $("#pauseLayoutButton").click(function(){
        if(!globalVars.layoutPaused){
            d3.selectAll('.node').each(function(d){
                d.fixed = true;
            });
            // $("#pauseLayoutButton").text("Resume layout")
            $("#pauseLayoutButton i").toggleClass("fa-pause fa-play");
            globalVars.layoutPaused = true;
        }else{
            d3.selectAll('.node').each(function(d){
                d.fixed = false;
            });
            //tick();
            // $("#pauseLayoutButton").text("Pause layout")
            $("#pauseLayoutButton i").toggleClass("fa-pause fa-play");
            globalVars.layoutPaused = false;
        }
    })

})();