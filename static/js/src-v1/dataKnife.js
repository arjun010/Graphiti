(function(){
    dataKnife = {};

    dataKnife.generateNetworkMaps = function(nodeList,edgeList){
        globalVars.activeNetwork = {"nodes":[],"links":[]};
        globalVars.nodeMap = {};
        globalVars.edgeMap = {};

        for(var nodeIndex in nodeList){
            var node = nodeList[nodeIndex];
            globalVars.activeNetwork.nodes.push(node);
            if(node.id in globalVars.nodeMap){
                continue;
            }else{
                node['nodeListIndex'] = parseInt(nodeIndex);
                globalVars.nodeMap[node.id] = node;
            }
        }

        for(var edgeIndex in edgeList){
            var edge = edgeList[edgeIndex];
            var sourceNodeId = edge['source'];
            var targetNodeId = edge['target'];
            var edgeWeight = edge['weight'];
            if(!(sourceNodeId in globalVars.edgeMap)){
                globalVars.edgeMap[sourceNodeId] = {};
                globalVars.edgeMap[sourceNodeId][targetNodeId] = {
                    "links" : [edge],
                    "totalWeight" : parseFloat(edgeWeight)
                };
            }else{
                if(!(targetNodeId in globalVars.edgeMap[sourceNodeId])){
                    globalVars.edgeMap[sourceNodeId][targetNodeId] = {
                        "links" : [edge],
                        "totalWeight" : parseFloat(edgeWeight)
                    };
                }else{
                    globalVars.edgeMap[sourceNodeId][targetNodeId].links.push(edge);
                    globalVars.edgeMap[sourceNodeId][targetNodeId].totalWeight += parseFloat(edgeWeight); // handles directed edge case
                }
            }

        }

        for(var edgeIndex in edgeList){
            var edge = edgeList[edgeIndex];
            //var sourceNodeId = edge['source'];
            //var targetNodeId = edge['target'];
            var sourceNodeId = dataKnife.getSourceNodeId(edge,nodeList);
            var targetNodeId = dataKnife.getTargetNodeId(edge,nodeList);

            var sourceNodeIndex = globalVars.nodeMap[sourceNodeId].nodeListIndex;
            var targetNodeIndex = globalVars.nodeMap[targetNodeId].nodeListIndex;
            var newEdgeObj = {
                "source" : sourceNodeIndex,
                "target" : targetNodeIndex
            };
            if(utils.isDirectedEdge(sourceNodeId,targetNodeId)==1){
                newEdgeObj['type'] = 'directed';
            }else{
                newEdgeObj['type'] = 'undirected';
            }

            if(dataKnife.isExistingEdge(globalVars.activeNetwork.links,newEdgeObj)==-1){
                globalVars.activeNetwork.links.push(newEdgeObj);
                //if(newEdgeObj.type == 'undirected'){
                //    // making weight for undirected edges x2 here instead of doing it in the previous loop
                //    globalVars.edgeMap[sourceNodeId][targetNodeId].totalWeight *= 2;
                //    globalVars.edgeMap[targetNodeId][sourceNodeId].totalWeight *= 2;
                //}
            }
        }
    };

    dataKnife.isExistingEdge = function (edgeList,newEdge){
        //console.log(edgeList,newEdge);
        if((newEdge["source"] === parseInt(newEdge["source"], 10))) {
            var newEdgeSourceId = globalVars.activeNetwork.nodes[newEdge['source']].id;
            var newEdgeTargetId = globalVars.activeNetwork.nodes[newEdge['target']].id;
        }else if(typeof (newEdge["source"]) === "string"){
            var newEdgeSourceId = newEdge.source;
            var newEdgeTargetId = newEdge.target;
        }else{
            var newEdgeSourceId = newEdge.source.id;
            var newEdgeTargetId = newEdge.target.id;
        }
        //console.log(newEdgeSourceId,newEdgeTargetId);
        for(var edgeIndex in edgeList){
            var edge = edgeList[edgeIndex], edgeSourceId,edgeTargetId;
            //console.log(typeof edge["source"], edge, globalVars.activeNetwork.nodes);
            if((edge["source"] === parseInt(edge["source"], 10))) {
                edgeSourceId = globalVars.activeNetwork.nodes[edge['source']].id;
                edgeTargetId = globalVars.activeNetwork.nodes[edge['target']].id;
            }else if(typeof (edge["source"]) === "string") {
                edgeSourceId = edge["source"];
                edgeTargetId = edge["target"];
            }else {
                edgeSourceId = edge.source.id;
                edgeTargetId = edge.target.id;
            }
            //console.log(edgeSourceId,edgeTargetId);
            if((newEdgeSourceId==edgeSourceId && newEdgeTargetId==edgeTargetId) || (newEdgeSourceId==edgeTargetId && newEdgeTargetId==edgeSourceId)){
                return edgeIndex;
            }
        }
        return -1;
    };

    dataKnife.getSourceNodeId = function(edge,nodeList){
        if(edge["source"] === parseInt(edge["source"], 10)) {
            return nodeList[edge["source"]]['id'];
        }else{
            return edge["source"].id || edge["source"];
        }
    };

    dataKnife.getTargetNodeId = function(edge,nodeList){
        if(edge["source"] === parseInt(edge["target"], 10)) {
            return nodeList[edge["target"]]['id'];
        }else{
            return edge["target"].id || edge["target"];
        }
    };

})();