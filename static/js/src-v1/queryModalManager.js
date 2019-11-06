/**
 * Created by arjun010 on 9/27/16.
 */
(function () {
    queryModalManager = {};

    queryModalManager.showNewNodeModal = function(){
        //svg.on("mousedown",null).on("mousemove",null);
        //d3.select(window)
        //    .on('keydown', null)
        //    .on('keyup', null);

        $('#newNodeModal').modal('show');
        var newNodeId = "node-"+globalVars.newNodeIdCounter;
        var newNodeFormHTML = "";
        $("#newNodeModalBody").html("");
        for(var nodeAttribute of globalVars.nodeAttributes){
            //console.log()
            newNodeFormHTML += "<div class='modal-row'>";
            newNodeFormHTML += "<span class='modal-row-label'><b>"+nodeAttribute+"</b></span>";
            if(['id','name'].indexOf(nodeAttribute)!=-1){
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"' value='"+newNodeId+"'>";
            }else{
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"'>";
            }
            newNodeFormHTML += "</div>";
        }
        $("#newNodeModalBody").html(newNodeFormHTML);
    };

    $("#addNewNodeButton").click(function(evt){
        var newNode = {};
        $(".newNodeValueTextBox").each(function(index,elm){
            var attribute = $(elm).attr('name');
            var attributeValue = $(elm).val();
            newNode[attribute] = attributeValue;
        });
        graphQueryManager.addNewNode(newNode);
    });

    queryModalManager.showNewLinkModal = function(sourceNode,targetNode){
        //d3.select(window)
        //    .on('keydown', null)
        //    .on('keyup', null);

        $('#newLinkModal').modal('show');
        var newLinkId = "link-" + globalVars.newLinkIdCounter;
        var newLinkFormHTML = "";
        $("#newLinkModalBody").html("");
        for(var edgeAttribute of globalVars.edgeAttributes){
            newLinkFormHTML += "<div class='modal-row'>";
            newLinkFormHTML += "<span class='modal-row-label'><b>"+edgeAttribute+"</b></span>";
            if(['id'].indexOf(edgeAttribute)!=-1){
                newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='"+newLinkId+"'>";
            }else if(edgeAttribute=="source"){
                newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='"+sourceNode.id+"'>";
                //newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='"+sourceNode.id+" ("+sourceNode.name+")'>";
                //newLinkFormHTML += "<p class='newLinkValueTextBox'>"+sourceNode.id+" ("+sourceNode.name+")</p>"
            }else if(edgeAttribute=="target"){
                newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='"+targetNode.id+"'>";
                //newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='"+targetNode.id+" ("+targetNode.name+")'>";
                //newLinkFormHTML += "<p class='newLinkValueTextBox'>"+targetNode.id+" ("+targetNode.name+")</p>"
            }else if(edgeAttribute=="weight"){
                newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"' value='1'>";
            }else{
                newLinkFormHTML += "<input class='newLinkValueTextBox' type='text' name='"+edgeAttribute+"'>";
            }
            newLinkFormHTML += "</div>";
        }
        $("#newLinkModalBody").html(newLinkFormHTML);
    };

    queryModalManager.showNodeSplitModal = function (existingNode) {
        $("#nodeSplitModal").modal("show");
        var newNodeId = "node-"+globalVars.newNodeIdCounter;

        $("#existingNodeTextPlaceholder").text(existingNode.id);
        var newNodeFormHTML = "<b>New Node Details:</b>";
        $(".newNodeDetails").html("");
        for(var nodeAttribute of globalVars.nodeAttributes){
            //console.log()
            newNodeFormHTML += "<div class='modal-row'>";
            newNodeFormHTML += "<span class='modal-row-label'><b>"+nodeAttribute+"</b></span>";
            if(['id','name'].indexOf(nodeAttribute)!=-1){
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"' value='"+newNodeId+"'>";
            }else{
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"'>";
            }
            newNodeFormHTML += "</div>";
        }
        $(".newNodeDetails").html(newNodeFormHTML);

        $("#existingNodeOutgoingLinks").html("");
        var existingNodeOutgoingLinksHTML = "";
        var existingNodeOutgoingLinks = [];
        for(var targetNodeId in globalVars.edgeMap[existingNode.id]){ // outgoing links
            for(var link of globalVars.edgeMap[existingNode.id][targetNodeId]['links']){
                existingNodeOutgoingLinks.push(link);
            }
        }

        var outgoingLinksDivs =  d3.select("#existingNodeOutgoingLinks").selectAll("div")
            .data(existingNodeOutgoingLinks)
            .enter()
            .append("div")
            .attr("class", "existingNodeLinkDiv");

        for(var attr of ["target", "details"]){
            outgoingLinksDivs
                .append("p")
                .html(function (d) {
                    return "<b>" +attr+ "</b>: " + d[attr];
                });
        }

        $("#existingNodeIncomingLinks").html("");
        var existingNodeIncomingLinksHTML = "";
        var existingNodeIncomingLinks = [];
        for(var sourceNodeId in globalVars.edgeMap){
            if(sourceNodeId != existingNode.id){
                if(existingNode.id in globalVars.edgeMap[sourceNodeId]){
                    for(var link of globalVars.edgeMap[sourceNodeId][existingNode.id]['links']){
                        existingNodeIncomingLinks.push(link);
                    }
                }
            }
        }


        var outgoingLinksDivs =  d3.select("#existingNodeIncomingLinks").selectAll("div")
            .data(existingNodeIncomingLinks)
            .enter()
            .append("div")
            .attr("class", "existingNodeLinkDiv");

        for(var attr of ["source", "details"]){
            outgoingLinksDivs
                .append("p")
                .html(function (d) {
                    return "<b>" +attr+ "</b>: " + d[attr];
                });
        }

        d3.selectAll(".existingNodeLinkDiv").on("click",function(d){
            if(!d3.select(this).classed("selected")){
                d3.select(this).classed("selected", true);
            }else{
                d3.select(this).classed("selected", false);
            }
        });
    };

    $("#addSplitNodeButton").click(function(evt){
        var newNode = {};
        $(".newNodeValueTextBox").each(function(index,elm){
            var attribute = $(elm).attr('name');
            var attributeValue = $(elm).val();
            newNode[attribute] = attributeValue;
        });
        graphQueryManager.addNewNode(newNode);

        var linkOperation = $('input[name=splittedNodeLinksOperation]:checked').val();
        var linksToAdd = [];

        var existingNodeId = $("#existingNodeTextPlaceholder").text();

        if(linkOperation=="all"){
            d3.selectAll(".existingNodeLinkDiv").each(function(existingLink){
                console.log(existingLink)
                var newLink = {};
                if(existingLink.source == existingNodeId){ // outgoing edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[newNode.id];
                    newLink['target'] = globalVars.nodeMap[existingLink.target];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }else if(existingLink.target == existingNodeId){ // incoming edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[existingLink.source];
                    newLink['target'] = globalVars.nodeMap[newNode.id];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }
                linksToAdd.push(newLink);
            });
            graphQueryManager.addNewLinks(linksToAdd);
        }else if(linkOperation=="selected"){
            d3.selectAll(".existingNodeLinkDiv.selected").each(function(existingLink){
                console.log(existingLink)
                var newLink = {};
                if(existingLink.source == existingNodeId){ // outgoing edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[newNode.id];
                    newLink['target'] = globalVars.nodeMap[existingLink.target];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }else if(existingLink.target == existingNodeId){ // incoming edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[existingLink.source];
                    newLink['target'] = globalVars.nodeMap[newNode.id];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }
                linksToAdd.push(newLink);
            });
            graphQueryManager.addNewLinks(linksToAdd);
        }
    });

    queryModalManager.showNodeMergeModal = function(mergeSourceNode, mergeTargetNode){

        $("#existingNodesTextPlaceholder").text([mergeSourceNode.id,mergeTargetNode.id].join());

        $('#nodeMergeModal').modal('show');
        var newNodeId = "node-"+globalVars.newNodeIdCounter;
        var newNodeFormHTML = "";
        $(".newNodeDetails").html("");
        for(var nodeAttribute of globalVars.nodeAttributes){
            //console.log()
            newNodeFormHTML += "<div class='modal-row'>";
            newNodeFormHTML += "<span class='modal-row-label'><b>"+nodeAttribute+"</b></span>";
            if(['id','name'].indexOf(nodeAttribute)!=-1){
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"' value='"+newNodeId+"'>";
            }else{
                newNodeFormHTML += "<input class='newNodeValueTextBox' type='text' name='"+nodeAttribute+"'>";
            }
            newNodeFormHTML += "</div>";
        }
        $(".newNodeDetails").html(newNodeFormHTML);

        $("#existingNodesOutgoingLinks").html("");
        var existingNodeOutgoingLinksHTML = "";
        var existingNodeOutgoingLinks = [];

        for(var existingNode of [mergeSourceNode,mergeTargetNode]){

            for(var targetNodeId in globalVars.edgeMap[existingNode.id]){ // outgoing links
                for(var link of globalVars.edgeMap[existingNode.id][targetNodeId]['links']){
                    existingNodeOutgoingLinks.push(link);
                }
            }

            var outgoingLinksDivs =  d3.select("#existingNodesOutgoingLinks").selectAll("div")
                .data(existingNodeOutgoingLinks)
                .enter()
                .append("div")
                .attr("class", "existingNodeLinkDiv");

            for(var attr of ["source", "target", "details"]){
                outgoingLinksDivs
                    .append("p")
                    .html(function (d) {
                        return "<b>" +attr+ "</b>: " + d[attr];
                    });
            }
        }

        for(var existingNode of [mergeSourceNode,mergeTargetNode]){
            $("#existingNodesIncomingLinks").html("");
            var existingNodeIncomingLinksHTML = "";
            var existingNodeIncomingLinks = [];
            for(var sourceNodeId in globalVars.edgeMap){
                if(sourceNodeId != existingNode.id){
                    if(existingNode.id in globalVars.edgeMap[sourceNodeId]){
                        for(var link of globalVars.edgeMap[sourceNodeId][existingNode.id]['links']){
                            existingNodeIncomingLinks.push(link);
                        }
                    }
                }
            }


            var outgoingLinksDivs =  d3.select("#existingNodesIncomingLinks").selectAll("div")
                .data(existingNodeIncomingLinks)
                .enter()
                .append("div")
                .attr("class", "existingNodeLinkDiv");

            for(var attr of ["source", "target" , "details"]){
                outgoingLinksDivs
                    .append("p")
                    .html(function (d) {
                        return "<b>" +attr+ "</b>: " + d[attr];
                    });
            }
        }

        d3.selectAll(".existingNodeLinkDiv").on("click",function(d){
            if(!d3.select(this).classed("selected")){
                d3.select(this).classed("selected", true);
            }else{
                d3.select(this).classed("selected", false);
            }
        });

    };

    $("#mergeNodeButton").click(function(evt){
        var existingNodeIds = $("#existingNodesTextPlaceholder").text().split(",");

        var newNode = {};
        $(".newNodeValueTextBox").each(function(index,elm){
            var attribute = $(elm).attr('name');
            var attributeValue = $(elm).val();
            newNode[attribute] = attributeValue;
        });
        graphQueryManager.addNewNode(newNode);

        var linkOperation = $('input[name=mergedNodeLinksOperation]:checked').val();
        var linksToAdd = [];

        if(linkOperation=="all"){
            d3.selectAll(".existingNodeLinkDiv").each(function(existingLink){
                var newLink = {};
                if(existingNodeIds.indexOf(existingLink.source)!=-1){ // outgoing edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[newNode.id];
                    newLink['target'] = globalVars.nodeMap[existingLink.target];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }else if(existingNodeIds.indexOf(existingLink.target)!=-1){ // incoming edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[existingLink.source];
                    newLink['target'] = globalVars.nodeMap[newNode.id];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }
                if(existingNodeIds.indexOf(existingLink.source)!=-1 && existingNodeIds.indexOf(existingLink.target)!=-1){

                }else{
                    linksToAdd.push(newLink);
                }
            });
            graphQueryManager.addNewLinks(linksToAdd);
        }else if(linkOperation=="selected"){
            d3.selectAll(".existingNodeLinkDiv.selected").each(function(existingLink){
                console.log(existingLink)
                var newLink = {};
                if(existingNodeIds.indexOf(existingLink.source)!=-1){ // outgoing edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[newNode.id];
                    newLink['target'] = globalVars.nodeMap[existingLink.target];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }else if(existingNodeIds.indexOf(existingLink.target)!=-1){ // incoming edge
                    newLink['id'] = "edge-" + globalVars.newLinkIdCounter;
                    newLink['source'] = globalVars.nodeMap[existingLink.source];
                    newLink['target'] = globalVars.nodeMap[newNode.id];
                    newLink['details'] = existingLink.details;
                    newLink['weight'] = existingLink.weight;
                }
                if(existingNodeIds.indexOf(existingLink.source)!=-1 && existingNodeIds.indexOf(existingLink.target)!=-1){

                }else{
                    linksToAdd.push(newLink);
                }
            });
            graphQueryManager.addNewLinks(linksToAdd);
        }
        for(var existingNodeId of existingNodeIds){
            graphQueryManager.deleteNode(globalVars.nodeMap[existingNodeId]);
        }
    });


    $("#addNewLinkButton").click(function(evt){
        var newLink = {};
        $(".newLinkValueTextBox").each(function(index,elm){
            var attribute = $(elm).attr('name');
            var attributeValue = $(elm).val();
            newLink[attribute] = attributeValue;
        });
        newLink.source = globalVars.nodeMap[newLink.source];
        newLink.target = globalVars.nodeMap[newLink.target];
        graphQueryManager.addNewLinks([newLink]);

    });

    $('#newLinkModal').on('hidden.bs.modal', function () {
        graphRenderer.deactivateEditMode();
    });

    $('#newNodeModal').on('hidden.bs.modal', function () {
        graphRenderer.deactivateEditMode();
    });

    $('#nodeMergeModal').on('hidden.bs.modal', function () {
        graphRenderer.deactivateEditMode();
    });

    $('#nodeSplitModal').on('hidden.bs.modal', function () {
        graphRenderer.deactivateEditMode();
    });

})();