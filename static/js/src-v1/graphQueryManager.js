/**
 * Created by arjun010 on 9/27/16.
 */
(function(){
    graphQueryManager = {};

    graphQueryManager.addNewNode = function(newNode){ // adds node to active network
        globalVars.activeNetwork.nodes.push(newNode);
        newNode['nodeListIndex'] = parseInt(utils.getIndexInList(newNode,globalVars.activeNetwork.nodes,'id'));
        globalVars.nodeMap[newNode.id] = newNode;
        globalVars.newNodeIdCounter += 1;
        if(!d3.select("#graphDiv").classed("hypothesized",true)){
            d3.select("#graphDiv").classed("hypothesized",true);
        }
        if(d3.select("#acceptChangesButton").classed("hide")){
            d3.select("#acceptChangesButton").classed("hide",false);
        }

        graphRenderer.update(globalVars.activeNetwork);
        var colorAttribute = $("#colorDropdown").val();
        if(colorAttribute!=""){
            graphRenderer.recolorNodes(colorAttribute);
            $("#legendDiv").show();
            updateLegendDiv(colorAttribute);
        }
        var sizeAttribute = $("#sizeDropdown").val();
        if(sizeAttribute!=""){
            graphRenderer.resizeNodes(sizeAttribute)
        }

    };

    graphQueryManager.addNewEdges = function(newLinks){
        for(var newLink of newLinks){
            var newLinkSourceId = newLink.source;
            var newLinkTargetId = newLink.target;
            var newLinkWeight = newLink.weight;
            var newLinkDetails = newLink.details;
            var newLinkId = 'edge-' + globalVars.newLinkIdCounter;

            newLink['id'] = newLinkId;

            if(!(newLinkSourceId in globalVars.edgeMap)){
                globalVars.edgeMap[newLinkSourceId] = {};
                globalVars.edgeMap[newLinkSourceId][newLinkTargetId] = {
                    "links" : [newLink],
                    "totalWeight" : parseFloat(newLinkWeight)
                };
            }else{
                if(!(newLinkTargetId in globalVars.edgeMap[newLinkSourceId])){
                    globalVars.edgeMap[newLinkSourceId][newLinkTargetId] = {
                        "links" : [newLink],
                        "totalWeight" : parseFloat(newLinkWeight)
                    };
                }else{
                    globalVars.edgeMap[newLinkSourceId][newLinkTargetId].links.push(newLink);
                    globalVars.edgeMap[newLinkSourceId][newLinkTargetId].totalWeight += parseFloat(newLinkWeight); // handles directed edge case
                }
            }


            var existingLinkIndex = dataKnife.isExistingEdge(globalVars.activeNetwork.links,newLink);

            //console.log(newLinkSourceId,newLinkTargetId,globalVars.nodeMap)

            if(existingLinkIndex==-1){ // new link, will be directed by default
                var sourceNodeIndex = globalVars.nodeMap[newLinkSourceId].nodeListIndex;
                var targetNodeIndex = globalVars.nodeMap[newLinkTargetId].nodeListIndex;
                globalVars.activeNetwork.links.push({
                    "source" : sourceNodeIndex,
                    "target" : targetNodeIndex,
                    "type" : "directed"
                });
            }else{ // link exists
                var existingLink = globalVars.activeNetwork.links[existingLinkIndex];
                if(existingLink.source.id == newLinkSourceId && existingLink.target.id == newLinkTargetId){ // existing link is in same direction
                }else{ // existing link is in other direction
                    existingLink.type = "undirected";
                }
                //console.log(existingLink)
            }
            globalVars.newLinkIdCounter += 1;
        }

        if(!d3.select("#graphDiv").classed("hypothesized",true)){
            d3.select("#graphDiv").classed("hypothesized",true);
        }
        if(d3.select("#acceptChangesButton").classed("hide")){
            d3.select("#acceptChangesButton").classed("hide",false);
        }

        //console.log(globalVars.edgeMap);
        graphRenderer.update(globalVars.activeNetwork);
    };

    graphQueryManager.deleteNode = function(nodeToDelete){
        var linksToDelete = [];
        var nodeId = nodeToDelete.id;

        var deletedLinkPairs = [], deletedLinks = [];

        for(var i=0;i<globalVars.activeNetwork.links.length;i++){
            if(globalVars.activeNetwork.links[i]["source"] === parseInt(globalVars.activeNetwork.links[i]["source"], 10)) {
                var sIndex = globalVars.activeNetwork.links[i]['source'];
                var tIndex = globalVars.activeNetwork.links[i]['target'];

                var sourceNode = globalVars.activeNetwork.nodes[sIndex];
                var targetNode = globalVars.activeNetwork.nodes[tIndex];

                if((globalVars.activeNetwork.nodes[sIndex].id==nodeId) || (globalVars.activeNetwork.nodes[tIndex].id==nodeId)){
                    linksToDelete.push(globalVars.activeNetwork.links[i]);
                    deletedLinkPairs.push({
                        "sourceNode" : sourceNode,
                        "targetNode" : targetNode
                    });
                }

            }else{

                var sourceNode = globalVars.activeNetwork.links[i]['source'];
                var targetNode = globalVars.activeNetwork.links[i]['target'];

                if((globalVars.activeNetwork.links[i]['source']['id']==nodeId) || (globalVars.activeNetwork.links[i]['target']['id']==nodeId)){
                    linksToDelete.push(globalVars.activeNetwork.links[i]);
                    deletedLinkPairs.push({
                        "sourceNode" : sourceNode,
                        "targetNode" : targetNode
                    });
                }
            }
        }

        for(var deletedLinkPair of deletedLinkPairs){
            var deletedSourceId = deletedLinkPair.sourceNode.id;
            var deletedTargetId = deletedLinkPair.targetNode.id;

            for(var sourceId in globalVars.edgeMap){
                if(sourceId == deletedSourceId){
                    for(var targetId in globalVars.edgeMap[sourceId]){
                        if(targetId == deletedTargetId){
                            for(var link of globalVars.edgeMap[sourceId][targetId]['links']){
                                deletedLinks.push(link);
                            }
                        }
                    }
                }else if(sourceId == deletedTargetId){
                    for(var targetId in globalVars.edgeMap[sourceId]){
                        if(targetId == deletedSourceId){
                            for(var link of globalVars.edgeMap[sourceId][targetId]['links']){
                                deletedLinks.push(link);
                            }
                        }
                    }

                }
            }
        }

        for(var i=0;i<linksToDelete.length;i++){
            var x = globalVars.activeNetwork.links.indexOf(linksToDelete[i]);
            if(x != -1) {
                globalVars.activeNetwork.links.splice(x, 1);
            }
        }

        globalVars.activeNetwork.nodes.splice(nodeToDelete.index,1);
        delete globalVars.nodeMap[nodeToDelete.id];

        delete globalVars.edgeMap[nodeToDelete.id];

        for(var sourceNodeId in globalVars.edgeMap){
            for(var targetNodeId in globalVars.edgeMap){
                if(targetNodeId==nodeToDelete.id){
                    delete globalVars.edgeMap[sourceNodeId][targetNodeId]
                }
            }
        }

        for(var nodeIndex in globalVars.activeNetwork.nodes){
            var node = globalVars.activeNetwork.nodes[nodeIndex];
            node.nodeListIndex = parseInt(nodeIndex);
        }

        if(!d3.select("#graphDiv").classed("hypothesized",true)){
            d3.select("#graphDiv").classed("hypothesized",true);
        }
        if(d3.select("#acceptChangesButton").classed("hide")){
            d3.select("#acceptChangesButton").classed("hide",false);
        }

        graphRenderer.update(globalVars.activeNetwork);
        var colorAttribute = $("#colorDropdown").val();
        if(colorAttribute!=""){
            graphRenderer.recolorNodes(colorAttribute);
            $("#legendDiv").show();
            updateLegendDiv(colorAttribute);
        }
        var sizeAttribute = $("#sizeDropdown").val();
        if(sizeAttribute!=""){
            graphRenderer.resizeNodes(sizeAttribute)
        }

        return deletedLinks;

    };

    graphQueryManager.applyChanges = function(){
        globalVars.nodeList = [];
        globalVars.edgeList = [];

        for(var nodeId in globalVars.nodeMap){
            globalVars.nodeList.push(globalVars.nodeMap[nodeId]);
        }

        //for(var edge in globalVars.activeNetwork.links){
        //    var sourceId = edge.source.id;
        //    var targetId = edge.target.id;
        //}
        for(var sourceNodeId in globalVars.edgeMap){
            for(var targetNodeId in globalVars.edgeMap[sourceNodeId]){
                for(var edge of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                    var existingEdgeIndex = utils.getIndexInList(edge,globalVars.edgeList,'id');
                    if(existingEdgeIndex==-1){
                        globalVars.edgeList.push(edge);
                    }
                }
            }
        }

        if(d3.select("#graphDiv").classed("hypothesized")){
            d3.select("#graphDiv").classed("hypothesized",false);
        }

        dbTableRenderer.updateNodeTable(globalVars.nodeAttributes, globalVars.nodeList);
        dbTableRenderer.updateEdgeTable(globalVars.edgeAttributes, globalVars.edgeList);

    };

    graphQueryManager.removeConnection = function(sourceNodeId, targetNodeId){
        if(sourceNodeId in globalVars.edgeMap){
            if(targetNodeId in globalVars.edgeMap[sourceNodeId]){
                delete globalVars.edgeMap[sourceNodeId][targetNodeId];
            }
        }
        if(targetNodeId in globalVars.edgeMap){
            if(sourceNodeId in globalVars.edgeMap[targetNodeId]){
                delete globalVars.edgeMap[targetNodeId][sourceNodeId];
            }
        }

        var linksToDelete = [];
        for(var i=0;i<globalVars.activeNetwork.links.length;i++){
            if(globalVars.activeNetwork.links[i]["source"] === parseInt(globalVars.activeNetwork.links[i]["source"], 10)) {
                var sIndex = globalVars.activeNetwork.links[i]['source'];
                var tIndex = globalVars.activeNetwork.links[i]['target'];
                if((globalVars.activeNetwork.nodes[sIndex].id==sourceNodeId && globalVars.activeNetwork.nodes[tIndex].id==targetNodeId) || (globalVars.activeNetwork.nodes[sIndex].id==targetNodeId && globalVars.activeNetwork.nodes[tIndex].id==sourceNodeId)){
                    linksToDelete.push(globalVars.activeNetwork.links[i]);
                }
            }else{
                if((globalVars.activeNetwork.links[i]['source']['id']==sourceNodeId && globalVars.activeNetwork.links[i]['target']['id']==targetNodeId) || (globalVars.activeNetwork.links[i]['source']['id']==targetNodeId && globalVars.activeNetwork.links[i]['target']['id']==sourceNodeId)){
                    linksToDelete.push(globalVars.activeNetwork.links[i]);
                }
            }
        }

        for(var i=0;i<linksToDelete.length;i++){
            var x = globalVars.activeNetwork.links.indexOf(linksToDelete[i]);
            if(x != -1) {
                globalVars.activeNetwork.links.splice(x, 1);
            }
        }
        if(!d3.select("#graphDiv").classed("hypothesized",true)){
            d3.select("#graphDiv").classed("hypothesized",true);
        }
        if(d3.select("#acceptChangesButton").classed("hide")){
            d3.select("#acceptChangesButton").classed("hide",false);
        }

        graphRenderer.update(globalVars.activeNetwork);
    };

    graphQueryManager.removeLink = function(linkToDelete){
        var linkIdToDelete = linkToDelete.id, sourceNodeId = linkToDelete.source, targetNodeId = linkToDelete.target;

        if(sourceNodeId in globalVars.edgeMap){
            if(targetNodeId in globalVars.edgeMap[sourceNodeId]){
                var links = globalVars.edgeMap[sourceNodeId][targetNodeId]['links'];
                var targetLinkIndex = -1;
                for(var i in links){
                    var link = links[i];
                    if(link.id == linkToDelete.id){
                        targetLinkIndex = i;
                    }
                }
                if(targetLinkIndex!=-1){
                    globalVars.edgeMap[sourceNodeId][targetNodeId]['links'].splice(targetLinkIndex, 1);
                }
            }
        }

        if(targetNodeId in globalVars.edgeMap){
            if(sourceNodeId in globalVars.edgeMap[targetNodeId]){
                var links = globalVars.edgeMap[targetNodeId][sourceNodeId]['links'];
                var targetLinkIndex = -1;
                for(var i in links){
                    var link = links[i];
                    if(link.id == linkToDelete.id){
                        targetLinkIndex = i;
                    }
                }
                if(targetLinkIndex!=-1){
                    globalVars.edgeMap[targetNodeId][sourceNodeId]['links'].splice(targetLinkIndex, 1);
                }
            }
        }

        if(sourceNodeId in globalVars.edgeMap) {
            if (targetNodeId in globalVars.edgeMap[sourceNodeId]) {
                var totalWeight = 0;
                var links = globalVars.edgeMap[sourceNodeId][targetNodeId]['links'];
                for(var link of links){
                    totalWeight += parseFloat(link.weight);
                }
                globalVars.edgeMap[sourceNodeId][targetNodeId]['totalWeight'] = totalWeight;
                if(totalWeight==0){
                    graphQueryManager.removeConnection(sourceNodeId,targetNodeId);
                }
            }
        }

        if(targetNodeId in globalVars.edgeMap) {
            if (sourceNodeId in globalVars.edgeMap[targetNodeId]) {
                var totalWeight = 0;
                var links = globalVars.edgeMap[targetNodeId][sourceNodeId]['links'];
                for(var link of links){
                    totalWeight += parseFloat(link.weight);
                }
                globalVars.edgeMap[targetNodeId][sourceNodeId]['totalWeight'] = totalWeight;
                if(totalWeight==0){
                    graphQueryManager.removeConnection(targetNodeId,sourceNodeId);
                }
            }
        }

        graphRenderer.update(globalVars.activeNetwork);
    };

})();