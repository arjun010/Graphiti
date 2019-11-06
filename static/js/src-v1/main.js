/**
 * Created by arjun010 on 9/21/16.
 */
(function(){
    main = {};
    $body = $("body");
    $(document).on({
        ajaxStart: function() { $body.addClass("loading");    },
        ajaxStop: function() { $body.removeClass("loading"); }
    });

    //console.log($("body").width(),$("body").height())

    var d = document.getElementById('legendDiv');
    d.style.position = "absolute";
    d.style.left = ($("body").width()*0.60)+'px';
    d.style.top = '150px';

    var d = document.getElementById('detailsDiv');
    d.style.position = "absolute";
    d.style.left = ($("body").width()*0.78)+'px';
    d.style.top = ($("body").height()*0.045)+'px';

    $("#nodesDbDisplay").width($("body").width()*0.47);
    $("#linksDbDisplay").width($("body").width()*0.47);
    $("#nodesDbDisplay").height(200);
    $("#linksDbDisplay").height(200);

    var clustersComputed = false;

    var legendAttribute = undefined;

    $("#legendDiv").hide();

    // d3.select("#graphSvg").attr("width",$("#graphDiv").width()).attr("height",$("#graphDiv").height())

    $.post( "/getNetwork", {"directory" : "test"})
        .done(function(response){
            globalVars.nodeList = response['network']['nodes'];
            globalVars.edgeList = response['network']['links'];

            dataKnife.generateNetworkMaps(utils.clone(globalVars.nodeList),utils.clone(globalVars.edgeList));

            google.charts.load('current', {'packages':['table']});

            globalVars.newNodeIdCounter = Object.keys(globalVars.nodeMap).length + 1; // adding 1 to be on the safer side (i.e. default ids could have started with 1 instead of 0)
            globalVars.newLinkIdCounter = globalVars.edgeList.length + 1;

            globalVars.nodeAttributes = ['id','name','mValue','type'];
            globalVars.nodeAttributeTypeMap = {
                'id' : 'uString',
                'name' : 'string',
                'mValue' : 'number',
                'type' : 'string'
            };


            globalVars.edgeAttributes = ['id','source','target','weight','details'];
            globalVars.edgeAttributeTypeMap = {
                'id' : 'uString',
                'target' : 'string',
                'source' : 'number',
                'weight' : 'number',
                'details' : 'string'
            };

            populateDropdowns(globalVars.nodeList[0],globalVars.nodeAttributes);
            //console.log(globalVars.edgeMap)

            graphRenderer.init("#graphDiv",globalVars.activeNetwork);
            setTimeout(function() {
                dbTableRenderer.updateNodeTable(globalVars.nodeAttributes, globalVars.nodeList);
                dbTableRenderer.updateEdgeTable(globalVars.edgeAttributes, globalVars.edgeList);
            },500);
        });

    function populateDropdowns(node,nodeAttributes){
        for(var attribute of nodeAttributes){
            if(!isNaN(node[attribute])){
                $("#sizeDropdown").append($('<option>', {
                    value: attribute ,
                    text: attribute
                }));
            }else{
                $("#colorDropdown").append($('<option>', {
                    value: attribute ,
                    text: attribute
                }));
            }
            $("#sizeDropdown").selectpicker('refresh');
            $("#colorDropdown").selectpicker('refresh');
        }
    }

    // graphRenderer.init("#graphDiv",preStudyGraph)
    // graphRenderer.draw(preStudyGraph);

    var triggerSearchInViz = function(searchValue,searchAttribute) {
        if(searchValue==""){
            d3.selectAll(".node").classed("highlightedNode",false).classed("fadedNode",false);
        }else{
            d3.selectAll('.node').each(function (d) {
                if(d[searchAttribute].toLowerCase().indexOf(searchValue.toLowerCase())!=-1){
                    graphRenderer.addLabel(this,d,"name");
                } else{
                    if(!d3.select(this).classed("fadedNode")){
                        d3.select(this).classed("fadedNode",true)
                    }
                }
            });
        }
    };

    $("#colorDropdown").change(function(evt){
        var colorAttribute = $("#colorDropdown").val();
        if(colorAttribute!=""){
            graphRenderer.recolorNodes(colorAttribute);
            $("#legendDiv").show();
            updateLegendDiv(colorAttribute);
        }else{
            $("#legendDiv").hide();
            d3.selectAll(".nodeGlyph").style("fill", "steelblue");
        }
    });

    $("#sizeDropdown").change(function(evt){
        var sizeAttribute = $("#sizeDropdown").val();
        if(sizeAttribute!=""){
            graphRenderer.resizeNodes(sizeAttribute)
        }else{
            d3.selectAll(".nodeGlyph").transition().duration(500).attr("r", 5);
        }
    });

    updateLegendDiv = function(coloringAttribute){
        legendAttribute = coloringAttribute;

        var tempCountMap = {};
        d3.selectAll(".node").each(function(d){
            var colorAttributeValue = globalVars.nodeMap[d.id][coloringAttribute]; // using nodeMap because modularity groups are added to that.
            if(colorAttributeValue in tempCountMap){
                tempCountMap[colorAttributeValue] += 1;
            }else{
                tempCountMap[colorAttributeValue] = 1;
            }
        });
        var colorLegendData = [];
        for(var attributeValue in tempCountMap){
            colorLegendData.push({
                "count" : tempCountMap[attributeValue],
                "label" : attributeValue
            });
        }

        utils.sortObj(colorLegendData,'count','d');
        //console.log(graphRenderer.colorScale.domain())
        drawLegend("#legendDiv",colorLegendData,graphRenderer.colorScale);
    };

    function drawLegend(divId,data,colorScale) {

        $(divId).html('');
        $(divId).append('<p align="right" style="margin-right:10px"><b>Count('+data.length+')</b></p>');
        var dataMaxVal;

        if(data.length>0){
            //dataMaxVal = -1;
            //for(var i in data){
            //	var val = data[i]['count'];
            //	if(dataMaxVal<val){
            //		dataMaxVal = val;
            //	}
            //}
            dataMaxVal = data[0]['count'];
        }
        var scale = d3.scale.linear()
            .domain([0,dataMaxVal])
            .range([5,80]);

        var row = d3.select(divId)
            .selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("class","legendinforow")
            .style("margin-top","3px")
            .style("width","250px")
            .on("click",function(d){
                refreshCanvas();
                d3.selectAll(".node").each(function(node){
                    if(globalVars.nodeMap[node.id][legendAttribute] == d.label){
                        if(!d3.select(this).classed("highlighedNode")){
                            d3.select(this).classed("highlighedNode",true);
                        }
                        graphRenderer.addLabel(this,node,"name");
                    }else{
                        if(!d3.select(this).classed("fadedNode")){
                            d3.select(this).classed("fadedNode",true);
                        }
                    }
                });
            });


        row.append("div")
            .attr("class","legendinfolabelcolorbox")
            .attr("flex","1")
            .style("background-color", function (d) {
                if(colorScale==undefined){
                    return "none"
                }else {
                    return colorScale(d.label);
                }
            });


        var infolabelclass = 'legendinfolabel';
        infolabelclass += ' nocolorbox';

        row.append("div")
            .attr("class",infolabelclass)
            .attr("flex","1")
            .style("margin-left","5px")
            .text(function(d) { return d.label; });

        row.append("svg")
            .attr("width",80)
            .append("rect")
            .attr("class","legendinfobar")
            .style("width", function(d) { return scale(d.count) + "px"; });

        row.append("div")
            .attr("class","legendinfovalue")
            .text(function(d) {
                return d.count;
            });

    }

    main.showEdgeDetails = function(edge){
        var sourceNodeId = edge.source.id;
        var targetNodeId = edge.target.id;

        //var links = globalVars.edgeMap[sourceNodeId][targetNodeId]['links'];

        var links = [];
        if(sourceNodeId in globalVars.edgeMap){
            if(targetNodeId in globalVars.edgeMap[sourceNodeId]){
                for(var link of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                    links.push(link);
                }
            }
        }

        if(targetNodeId in globalVars.edgeMap){
            if(sourceNodeId in globalVars.edgeMap[targetNodeId]){
                for(var link of globalVars.edgeMap[targetNodeId][sourceNodeId]['links']){
                    links.push(link);
                }
            }
        }

        $("#edgeDetails").html("");
        //for(var link of links){
        //    var linkRowHTML = "<div>";
        //    for(var edgeAttribute of globalVars.edgeAttributes){
        //        linkRowHTML += "<p><b>"+edgeAttribute+"</b>: " + link[edgeAttribute];
        //    }
        //    linkRowHTML += "</div><hr>";
        //    $("#edgeDetails").append(linkRowHTML);
        //}

        var individualLinkDivs =  d3.select("#edgeDetails").selectAll("div")
            .data(links)
            .enter()
            .append("div")
            .attr("class", "individualLinkDiv");

        for(var attr of ["source", "target" , "details", "weight"]){
            individualLinkDivs
                .append("p")
                .html(function (d) {
                    return "<b>" +attr+ "</b>: " + d[attr];
                });
        }

        d3.selectAll(".individualLinkDiv").on("click",function(d){
            if(!d3.select(this).classed("selected")){
                d3.select(this).classed("selected", true);
            }else{
                d3.select(this).classed("selected", false);
            }
        }).on("contextmenu",function(d){
            d3.event.preventDefault();
            graphQueryManager.removeLink(d);
        });

    };

    main.showNodeDetails = function(node){
        //$("#nodeDetails").append("<p><b>"+ globalVars.nodeMap[node.id].name +"</b></p>");
        $("#nodeDetails").html("");
        for(var nodeAttribute of globalVars.nodeAttributes){
            $("#nodeDetails").append("<p><b>"+ nodeAttribute + "</b>: " +globalVars.nodeMap[node.id][nodeAttribute] +"</p>");
        }
    };

    $("#computeClustersButton").click(function(evt){
        if(clustersComputed==false){
            clustersComputed = true;
            $("#colorDropdown").append($('<option></option>').val('modularityGroup').html('Clusters'));
            $("#colorDropdown").selectpicker('refresh');
            computeClusters();
        }
        $("#colorDropdown").val('modularityGroup').trigger('change');
    });

    function computeClusters(){
        var modularityResults = jLouComputation();
        var nodeModularityMap = modularityResults['nodeModularityMap'];
        var modularityGroups = modularityResults['modGroups'];
    }

    function jLouComputation(){
        var nodeIdList = [], edgeList = [];
        d3.selectAll('.node').each(function(d){
            if(nodeIdList.indexOf(d.id)==-1){
                nodeIdList.push(d.id);
            }
        });
        d3.selectAll('.link').each(function(d){
            edgeList.push({
                "source": d.source.id,
                "target": d.target.id,
                "weight": d.weight
            });
        });
        var community = jLouvain().nodes(nodeIdList).edges(edgeList);//.partition_init(init_part);
        var result  = community();
        var modGroups = [];
        for(var nodeId in result){
            result[nodeId] = ""+result[nodeId];
            globalVars.nodeMap[nodeId]['modularityGroup'] = result[nodeId];
            if(modGroups.indexOf(result[nodeId])==-1){
                modGroups.push(result[nodeId]);
            }
        }

        return {'nodeModularityMap':result,'modGroups':modGroups};

    }

    refreshCanvas = function (){
        graphRenderer.detailsModeActive = 0;
        graphRenderer.detailsNode = null;
        $("#nodeDetails").html('');
        $("#edgeDetails").text('');

        d3.selectAll(".node").classed("highlightedNode",false).classed("fadedNode",false);
        d3.selectAll(".link").classed("highlighted",false).classed("faded",false);
        d3.selectAll(".nodelabel").remove();
    };

    $("#acceptChangesButton").click(function(evt){
        graphQueryManager.applyChanges();
        d3.select("#acceptChangesButton").classed("hide",true);
    });

    $("#acceptActionButton").click(function(evt){
        //console.log("accept", globalVars.latestAction);
        for(var node of globalVars.activeNetwork.nodes){
            node.hullGroup = "";
        }
        graphRenderer.update(globalVars.activeNetwork);
        if(!d3.select("#actionResponseDiv").classed("hide")){
            d3.select("#actionResponseDiv").classed("hide",true);
        }

        ActionManager.addToActionList(globalVars.latestAction);
    });

    $("#rejectActionButton").click(function(evt){
        //console.log("reject", globalVars.latestAction);
        for(var node of globalVars.activeNetwork.nodes){
            node.hullGroup = "";
        }
        //graphQueryManager.deleteNode(globalVars.latestAction.params.newNode);
        ActionManager.undoAction(globalVars.latestAction);
        if(!d3.select("#actionResponseDiv").classed("hide")){
            d3.select("#actionResponseDiv").classed("hide",true);
        }
    });

    main.updateActionsList = function(){
        $("#actionHistoryDiv").html("");

        var actionDivs = d3.select("#actionHistoryDiv").selectAll("div")
                            .data(globalVars.actionList)
                            .enter()
                            .append("div")
                            .attr("class","actionDiv");

        for(var attr of ["type","timestamp"]){
            actionDivs.append("p")
                .html(function (d) {
                    return "<b>" +attr+ "</b>: " + d[attr];
                });
        }

    }

})();