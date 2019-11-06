/**
 * Created by arjun010 on 10/17/16.
 */
(function () {
    operationManager = {};

    operationManager.addNewNode = function () {
        var newNodeId = "node-"+globalVars.newNodeIdCounter;
        var newNode = {
            "hullGroup" : ""
        };

        globalVars.latestAction = new Action('NEW_NODE');
        globalVars.latestAction.addParamObj("newNode",newNode);

        if(d3.select("#actionResponseDiv").classed("hide")){
            d3.select("#actionResponseDiv").classed("hide",false);
        }


        for(var nodeAttribute of globalVars.nodeAttributes){
            if(nodeAttribute=="id" || nodeAttribute=="name"){
                newNode[nodeAttribute] = newNodeId;
            }else{
                if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="number"){
                    newNode[nodeAttribute] = 0.0;
                }else if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="string"){
                    newNode[nodeAttribute] = "";
                }
            }
        }
        graphQueryManager.addNewNode(newNode);
    };

    operationManager.addNewSplitNode = function (sourceNode) {
        var newNodeId = "split_from_"+sourceNode.id;

        sourceNode.hullGroup = "y";
        var newNode = {
            hullGroup : "y"
        };

        globalVars.latestAction = new Action('NODE_SPLIT');
        globalVars.latestAction.addParamObj("sourceNode",sourceNode);
        globalVars.latestAction.addParamObj("newNode",newNode);

        if(d3.select("#actionResponseDiv").classed("hide")){
            d3.select("#actionResponseDiv").classed("hide",false);
        }

        for(var nodeAttribute of globalVars.nodeAttributes){
            if(nodeAttribute=="id" || nodeAttribute=="name"){
                newNode[nodeAttribute] = newNodeId;
            }else{
                if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="number"){
                    newNode[nodeAttribute] = 0.0;
                }else if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="string"){
                    newNode[nodeAttribute] = "";
                }
            }
        }
        //newNode['x'] = sourceNode.x;
        //newNode['y'] = sourceNode.y;

        graphQueryManager.addNewNode(newNode);

        var newLinksMap = {}, linksToAdd = [];

        for(var sourceNodeId in globalVars.edgeMap){
            if(sourceNode.id == sourceNodeId){
                for(var targetNodeId in globalVars.edgeMap[sourceNodeId]){
                    if((sourceNodeId in globalVars.nodeMap) && (targetNodeId in globalVars.nodeMap)){
                        for(var existingLink of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                            if(!(newNodeId in newLinksMap)){
                                newLinksMap[newNodeId] = {};
                                newLinksMap[newNodeId][targetNodeId] = {
                                    'weight' : parseFloat(existingLink['weight']),
                                    'details' : existingLink['details']
                                };
                            }else{
                                if(targetNodeId in newLinksMap[newNodeId]){
                                    newLinksMap[newNodeId][targetNodeId]['weight'] += parseFloat(existingLink['weight']);
                                    newLinksMap[newNodeId][targetNodeId]['details'] += " ; " + existingLink['details'];
                                }else{
                                    newLinksMap[newNodeId][targetNodeId] = {
                                        'weight' : parseFloat(existingLink['weight']),
                                        'details' : existingLink['details']
                                    };
                                }
                            }
                        }
                    }
                }
            }else{
                for(var targetNodeId in globalVars.edgeMap[sourceNodeId]){
                    if(sourceNode.id == targetNodeId){
                        if ((sourceNodeId in globalVars.nodeMap) && (targetNodeId in globalVars.nodeMap)) {
                            for (var existingLink of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                                if (!(targetNodeId in newLinksMap)) {
                                    newLinksMap[sourceNodeId] = {};
                                    newLinksMap[sourceNodeId][newNodeId] = {
                                        'weight': parseFloat(existingLink['weight']),
                                        'details': existingLink['details']
                                    };
                                } else {
                                    if (newNodeId in newLinksMap[sourceNodeId]) {
                                        newLinksMap[sourceNodeId][newNodeId]['weight'] += parseFloat(existingLink['weight']);
                                        newLinksMap[sourceNodeId][newNodeId]['details'] += " ; " + existingLink['details'];
                                    } else {
                                        newLinksMap[sourceNodeId][newNodeId] = {
                                            'weight': parseFloat(existingLink['weight']),
                                            'details': existingLink['details']
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for(var sourceId in newLinksMap){
            for(var targetId in newLinksMap[sourceId]){
                linksToAdd.push({
                    "source" : sourceId,
                    "target" : targetId,
                    "details" : newLinksMap[sourceId][targetId]['details'],
                    "weight" : newLinksMap[sourceId][targetId]['weight']
                })
            }
        }

        graphQueryManager.addNewEdges(linksToAdd);


    };

    operationManager.mergeNodes = function (node1, node2) {
        var newNodeId = "merge_of_"+node1.id+"_and_"+node2.id;
        var newNode = {};
        for(var nodeAttribute of globalVars.nodeAttributes){
            if(nodeAttribute=="id" || nodeAttribute=="name"){
                newNode[nodeAttribute] = newNodeId;
            }else{
                if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="number"){
                    newNode[nodeAttribute] = 0.0;
                }else if(globalVars.nodeAttributeTypeMap[nodeAttribute]=="string"){
                    newNode[nodeAttribute] = "";
                }
            }
        }
        graphQueryManager.addNewNode(newNode);

        var nodesToRemove = [node1,node2];

        var linksToAdd = [], newLinksMap = {};

        for(var sourceNodeId in globalVars.edgeMap){
            if([node1.id,node2.id].indexOf(sourceNodeId)!=-1){
                for(var targetNodeId in globalVars.edgeMap[sourceNodeId]){
                    if((sourceNodeId in globalVars.nodeMap) && (targetNodeId in globalVars.nodeMap)){
                        for(var existingLink of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                            if(!(newNodeId in newLinksMap)){
                                newLinksMap[newNodeId] = {};
                                newLinksMap[newNodeId][targetNodeId] = {
                                    'weight' : parseFloat(existingLink['weight']),
                                    'details' : existingLink['details']
                                };
                            }else{
                                if(targetNodeId in newLinksMap[newNodeId]){
                                    newLinksMap[newNodeId][targetNodeId]['weight'] += parseFloat(existingLink['weight']);
                                    newLinksMap[newNodeId][targetNodeId]['details'] += " ; " + existingLink['details'];
                                }else{
                                    newLinksMap[newNodeId][targetNodeId] = {
                                        'weight' : parseFloat(existingLink['weight']),
                                        'details' : existingLink['details']
                                    };
                                }
                            }
                        }
                    }
                }
            }else{
                for(var targetNodeId in globalVars.edgeMap[sourceNodeId]){
                    if([node1.id,node2.id].indexOf(targetNodeId)!=-1) {
                        if ((sourceNodeId in globalVars.nodeMap) && (targetNodeId in globalVars.nodeMap)) {
                            for (var existingLink of globalVars.edgeMap[sourceNodeId][targetNodeId]['links']){
                                if (!(targetNodeId in newLinksMap)) {
                                    newLinksMap[sourceNodeId] = {};
                                    newLinksMap[sourceNodeId][newNodeId] = {
                                        'weight': parseFloat(existingLink['weight']),
                                        'details': existingLink['details']
                                    };
                                } else {
                                    if (newNodeId in newLinksMap[sourceNodeId]) {
                                        newLinksMap[sourceNodeId][newNodeId]['weight'] += parseFloat(existingLink['weight']);
                                        newLinksMap[sourceNodeId][newNodeId]['details'] += " ; " + existingLink['details'];
                                    } else {
                                        newLinksMap[sourceNodeId][newNodeId] = {
                                            'weight': parseFloat(existingLink['weight']),
                                            'details': existingLink['details']
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for(var sourceId in newLinksMap){
            for(var targetId in newLinksMap[sourceId]){
                linksToAdd.push({
                    "source" : sourceId,
                    "target" : targetId,
                    "details" : newLinksMap[sourceId][targetId]['details'],
                    "weight" : newLinksMap[sourceId][targetId]['weight']
                })
            }
        }

        graphQueryManager.addNewEdges(linksToAdd);

        for(var nodeToRemove of nodesToRemove){
            graphQueryManager.deleteNode(globalVars.nodeMap[nodeToRemove.id]);
        }

    };

})();