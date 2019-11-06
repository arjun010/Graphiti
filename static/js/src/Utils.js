/**
 * Created by arjun010 on 12/19/16.
 */
(function(){
    utils = {};

    /*
    * Makes a deep copy.
    * */
    utils.clone = function(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = utils.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = utils.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };


    /*
    * sorts a list of objects by key in place.
    * Default order is ascending.
    * */
    utils.sortObj = function(list, key,order) {
        order = typeof order !== 'undefined' ? order : 'a';
        function compare(a, b) {
            a = a[key];
            b = b[key];
            var type = (typeof(a) === 'string' || typeof(b) === 'string') ? 'string' : 'number';
            var result;
            if (type === 'string'){
                if(key=='startDate' || key=='endDate'){
                    a = new Date(a).getTime();
                    b = new Date(b).getTime();
                    if(order=='a'){
                        result = a - b;
                    }else if(order=='d'){
                        result = b - a;
                    }
                    //if(order=='a'){
                    //    result = a < b;
                    //}else if(order=='d'){
                    //    result = a > b;
                    //}
                }else{
                    if(order=='a'){
                        result = a.localeCompare(b);
                    }else if(order=='d'){
                        result = b.localeCompare(a);
                    }
                }
            } else {
                if(order=='a'){
                    result = a - b;
                }else if(order=='d'){
                    result = b - a;
                }
            }
            return result;
        }
        return list.sort(compare);
    };

    utils.newSortObj = function (list, key, order) {
        order = typeof order !== 'undefined' ? order : 'a';
        function compare(a, b) {
            keepa = a;
            keepb = b;
            a = a[key];
            b = b[key];
            var type = (typeof(a) === 'string' || typeof(b) === 'string') ? 'string' : 'number';
            var result;
            if (type === 'string') {
                if (key == 'startDate' || key == 'endDate') {
                    a = new Date(a).getTime();
                    b = new Date(b).getTime();
                    if (order == 'a') {
                        result = a - b;
                    } else if (order == 'd') {
                        result = b - a;
                    }
                    //if(order=='a'){
                    //    result = a < b;
                    //}else if(order=='d'){
                    //    result = a > b;
                    //}
                } else {
                    if (order == 'a') {
                        result = a.localeCompare(b);
                    } else if (order == 'd') {
                        result = b.localeCompare(a);
                    }
                }
            } else {
                if (order == 'a') {
                    result = a - b;
                } else if (order == 'd') {
                    result = b - a;
                }
            }
            if (result==0 || !result) {
                // result = keepa['attribute']>keepb['attribute'] ? 1 : (keepa['attribute']<keepb['attribute'] ? -1 : 0);
                result = keepa['attribute']>keepb['attribute'] ? 1 : -1;
                if (keepa['attribute']==keepb['attribute']) { result = keepa['operator']>keepb['operator'] ? -1 : 1; }
            }
            return result;
        }

        return list.sort(compare);
    };

    utils.getOperatorByAttributeTypeAndValue = function(attrType,value){
    };

    utils.deactivateCondition = function(conditionId){
        var andBlockIndexToDelete = -1, conditionIndexToDelete = -1;
        for(var andBlockIndex in globalVars.activeConditionList){
            var andBlock = globalVars.activeConditionList[andBlockIndex];
            for(var conditionIndex in andBlock){
                var condition = andBlock[conditionIndex];
                if(condition.id == conditionId){
                    andBlockIndexToDelete = andBlockIndex;
                    conditionIndexToDelete = conditionIndex;
                    break;
                }
            }
        }
        if(andBlockIndexToDelete!=-1 && conditionIndexToDelete!=-1){
            globalVars.activeConditionList[andBlockIndexToDelete].splice(conditionIndexToDelete,1);
            if(globalVars.activeConditionList[andBlockIndexToDelete].length == 0){
                globalVars.activeConditionList.splice(andBlockIndexToDelete,1);
                return {
                    "andBlockRemoved" : 1
                };
            }
        }
        return {
            "andBlockRemoved" : -1
        };
    };

    utils.getNodeByLabel = function(nodeLabel){
        for(var nodeId in globalVars.nodeMap){
            var node = globalVars.nodeMap[nodeId];
            if(node[globalVars.aggregationAttribute] == nodeLabel){
                return globalVars.nodeMap[nodeId];
            }
        }
    };

    utils.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    utils.addEdgeToExistingEdgeMap = function(node1Id,node2Id,newEdge,edgeMap){
        if(node1Id in edgeMap){
            if(node2Id in edgeMap[node1Id]){

            }else{
                edgeMap[node1Id][node2Id] = newEdge;
            }
        }else{
            edgeMap[node1Id] = {};
            edgeMap[node1Id][node2Id] = newEdge;
        }

        if(node2Id in edgeMap){
            if(node1Id in edgeMap[node2Id]){

            }else{
                edgeMap[node2Id][node1Id] = newEdge;
            }
        }else{
            edgeMap[node2Id] = {};
            edgeMap[node2Id][node1Id] = newEdge;
        }
    };

    utils.getAllValuesForAttribute = function (attribute) {
        var attributeValues = [];
        if(globalVars.dataAttributeMap[attribute]['type']=="Categorical"){
            for(var nodeId in globalVars.nodeMap){
                var node = globalVars.nodeMap[nodeId];
                for(var value in node[attribute]){
                    if(attributeValues.indexOf(value)==-1){
                        attributeValues.push(value);
                    }
                }
            }
        }else if(globalVars.dataAttributeMap[attribute]['type']=="List"){
            for(var nodeId in globalVars.nodeMap){
                var node = globalVars.nodeMap[nodeId];
                var values = node[attribute];
                for(var value of values){
                    if(attributeValues.indexOf(value)==-1){
                        attributeValues.push(value);
                    }
                }
            }
        }else if(globalVars.dataAttributeMap[attribute]['type']=="Number"){
            for(var nodeId in globalVars.nodeMap){
                var node = globalVars.nodeMap[nodeId];
                var value = parseFloat(node[attribute]);
                attributeValues.push(value);
            }
        }
        return attributeValues;
    };

    utils.getNodesDownloadStr = function(){
        // console.log('start adding nodes');
        var downloadStr = '';
        var headerRowStr = 'id,';
        var headerRow = ['id'];
        for(var attr of Object.keys(globalVars.nodeList[0])){
            if(attr!='id'){
                headerRowStr += ','+attr;                
                headerRow.push(attr);
            }
        }
        downloadStr += headerRow + "\n";

        var nodeCount = 0;
        var contentRowsStr = "";        
        for(var i in globalVars.nodeList){
            var node = globalVars.nodeList[i];
            var rowStr = "", row=[];
            for(var attr of headerRow){
                if(attr in globalVars.dataAttributeMap && attr!=globalVars.aggregationAttribute){
                    if(globalVars.dataAttributeMap[attr]['type']=='Categorical'){
                        row.push(Object.keys(node[attr]).join('|'));
                    }else if(globalVars.dataAttributeMap[attr]['type']=='List'){
                        row.push(node[attr].join('|'));
                    }else{
                        row.push(node[attr]);
                    }
                }else{
                    row.push(node[attr]);
                }
            }
            rowStr = row.join(',');
            contentRowsStr += rowStr+"\n";
        }
        downloadStr += contentRowsStr;
        // console.log('done adding nodes');
        return downloadStr;
    };

    utils.getEdgesDownloadStr = function(){
        // console.log('start adding edges');
        var downloadStr = '';
        var headerRowStr = 'srouce,target';
        var edgeTypeIndex = {}, edgeTypes=[];
        for(var i in globalVars.activeConditionList){
            var andBlock = globalVars.activeConditionList[i];
            var andBlockId = queryConstructor.getAndBlockId(andBlock);
            var edgeTypeLabel = globalVars.andBlockMap[andBlockId]['label'];
            edgeTypeIndex[edgeTypeLabel] = i;
            edgeTypes.push(edgeTypeLabel);
            headerRowStr += ','+edgeTypeLabel;
        }
        headerRowStr += '\n';
        downloadStr += headerRowStr;

        // console.log('start adding edges 2');
        var edgeCount = 0;
        var contentRowsStr = "";
        for(var i=0; i<globalVars.nodeList.length-1;i++){
            // console.log('start adding edges 3 --- '+i);
            var source = globalVars.nodeList[i];
            for(var j=i+1;j<globalVars.nodeList.length;j++){
                // console.log('start adding edges 4 --- '+j);
                var target = globalVars.nodeList[j];                
                if(i!=j){
                    // console.log('start adding edges 5 --- '+i+' --- '+j);
                    var satisfiedEdgeTypes = getSatisfiedEdgeTypes(source,target);
                    // console.log(['satisfiedEdgeTypes', satisfiedEdgeTypes]);
                    if(satisfiedEdgeTypes.length>0){
                        // console.log('start adding edges 6 --- '+i+' --- '+j);
                        var row = [source['id'],target['id']], rowStr ='';
                        for(var satisfiedEdgeType of satisfiedEdgeTypes){
                            // console.log('start adding edges 7 --- '+i+' --- '+j);
                            row.push(1);
                        }
                        // console.log(edgeTypes);
                        var edgeTypeDiff = edgeTypes.length-satisfiedEdgeTypes.length
                        while(edgeTypeDiff>0){
                            row.push(0);
                            edgeTypeDiff -= 1;
                            // break;
                        }
                        rowStr = row.join(',')+'\n';
                        contentRowsStr += rowStr;
                    }
                }
            }
            // console.log([i, edgeCount]);
            // if (edgeCount>=50) {break;}
        }
        // console.log('done adding edges');
        downloadStr += contentRowsStr;
        return downloadStr;
    };

    var getSatisfiedEdgeTypes = function(source,target){
        // console.log(['getSatisfiedEdgeTypes', source, target]);
        if(globalVars.activeConditionList.length>0){
            var satisfiedConditionMap = getSatisfiedConditions(source, target);
            var conditionsSatisfied = satisfiedConditionMap['conditionsSatisfied'];
            var satisfiedEdgeTypes = satisfiedConditionMap['satisfiedEdgeTypes'];
        }
        return satisfiedEdgeTypes;
    }

})();