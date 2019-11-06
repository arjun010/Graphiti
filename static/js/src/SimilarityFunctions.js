/**
 * Created by arjun010 on 12/19/16.
 */
(function () {
    similarityFinder = {};

    var localData = [];
    var maxDifferenceMap = {};

    similarityFinder.data = function(data){
        localData = data;
        for(var attribute in globalVars.dataAttributeMap) {
            if (attribute != globalVars.aggregationAttribute && globalVars.dataAttributeMap[attribute]['type']=="Number") {
                var maxDifferenceForNumericalAttribute = parseFloat(getMaxDifferenceForNumericalAttribute(attribute));
                maxDifferenceMap[attribute] = maxDifferenceForNumericalAttribute;
            }
        }
    };

    similarityFinder.getSimilarityMap = function (evidencePairs) {
        var activeSimilarityMap = similarityFinder.getSimilarityMapForNodePair(evidencePairs[0][0],evidencePairs[0][1]);
        for(var i = 1;i<evidencePairs.length;i++){
            var curPairSimilarityMap = similarityFinder.getSimilarityMapForNodePair(evidencePairs[i][0],evidencePairs[i][1]);
            var updatedSimilarityMap = getIntersectingSimilarityMap(activeSimilarityMap,curPairSimilarityMap);
            activeSimilarityMap = updatedSimilarityMap;
        }
        console.log(activeSimilarityMap)
        return activeSimilarityMap;
    };

    similarityFinder.getSimilarityMapForNodePair = function(item1,item2){
        var similarityMap = {};
        for(var attribute in globalVars.dataAttributeMap){
            if(attribute!=globalVars.aggregationAttribute){
                similarityMap[attribute] = getSimilarityMapForAttribute(item1,item2,attribute);
            }
        }
        //console.log(similarityMap);
        return similarityMap;
    };

    similarityFinder.getSimilarityMapForAttribute = function(item1,item2,attribute){
        return getSimilarityMapForAttribute(item1,item2,attribute);
    };

    var getMaxDifferenceForNumericalAttribute = function(attribute){
        var diff = -1;
        //console.log(localData);
        for(var i =0; i<localData.length-1;i++){
            for(var j=i+1;j<localData.length;j++){
                var curDiff = Math.abs(parseFloat(localData[j][attribute])-parseFloat(localData[i][attribute]));
                if(curDiff>diff){
                    diff = curDiff;
                }
            }
        }
        return curDiff;
    };

    var getSimilarityMapForAttribute = function(item1,item2,attribute){
        var similarityMap;
        switch (globalVars.dataAttributeMap[attribute]['type']){
            case "Categorical":
                similarityMap = getSimilarityMapForCategoricalAttribute(item1,item2,attribute);
                break;
            case "Number":
                similarityMap = getSimilarityMapForNumericalAttribute(item1,item2,attribute);
                break;
            case "List":
                similarityMap = getSimilarityMapForListAttribute(item1,item2,attribute);
                break;
        }

        return similarityMap;
    };

    var getSimilarityMapForCategoricalAttribute = function (item1,item2,attribute) {
        var item1Values = Object.keys(item1[attribute]);
        var item2Values = Object.keys(item2[attribute]);
        var commonValues = _.intersection(item1Values,item2Values);
        var similarityMap = {};
        if(commonValues.length>0){
            similarityMap['similarity'] = 1.0;
            similarityMap['value'] = {};
            for(var i =0;i<commonValues.length;i++){
                var commonValue = commonValues[i];
                if(item1[attribute][commonValue]<=item2[attribute][commonValue]){
                    similarityMap['value'][commonValue] = item1[attribute][commonValue];
                }else{
                    similarityMap['value'][commonValue] = item2[attribute][commonValue];
                }
            }
        }else{
            similarityMap = null;
        }

        return similarityMap;
    };

    var getSimilarityMapForNumericalAttribute = function(item1,item2,attribute) {
        var item1Value = parseFloat(item1[attribute]);
        var item2Value = parseFloat(item2[attribute]);
        var maxDifferenceForAttribute = parseFloat(maxDifferenceMap[attribute]);


        if(maxDifferenceForAttribute>0.0){ // if all values are same
            var similarityScore = 1.0 - parseFloat(Math.abs(item1Value-item2Value)/maxDifferenceForAttribute);
        }else{
            var similarityScore = 1.0 - parseFloat(Math.abs(item1Value-item2Value));
        }

        //console.log(attribute, item1Value,item2Value,maxDifferenceForAttribute,similarityScore)

        var similarityMap = {};
        if(similarityScore>=globalVars.numericalSimilarityThreshold){
            similarityMap = {
                "similarity" : similarityScore,
                "value" : Math.abs(item1Value-item2Value)
            };
        }else{
            similarityMap = null;
        }

        return similarityMap;
    };

    var getSimilarityMapForListAttribute = function(item1,item2,attribute){
        var item1Values = item1[attribute];
        var item2Values = item2[attribute];
        var commonValues = _.intersection(item1Values,item2Values);
        var similarityMap = {};
        if(commonValues.length>0){
           similarityMap = {
               "similarity" : 1.0,
               "value" : commonValues
           }
        }else{
            similarityMap = null;
        }

        return similarityMap;
    };

    var getIntersectingSimilarityMap = function(similarityMap1, similarityMap2){
        var map1AttributeList = Object.keys(similarityMap1);
        var map2AttributeList = Object.keys(similarityMap2);
        var commonAttributes = _.intersection(map1AttributeList,map2AttributeList);
        var intersectingSimilarityMap = {};
        for(var i in commonAttributes){
            var attribute = commonAttributes[i];
            if(similarityMap1[attribute]!=null && similarityMap2[attribute]!=null){ // if both maps have similar values for a common attribute
                var similarityMapForAttribute = getComparedSimilarityMapForAttribute(similarityMap1,similarityMap2,attribute);
                intersectingSimilarityMap[attribute] = similarityMapForAttribute;
            }else{
                intersectingSimilarityMap[attribute] = null;
            }
        }
        return intersectingSimilarityMap;
    };

    var getComparedSimilarityMapForAttribute = function(similarityMap1,similarityMap2,attribute){
        var similarityMap;
        switch (globalVars.dataAttributeMap[attribute]['type']){
            case "Categorical":
                similarityMap = getComparedSimilarityMapForCategoricalAttribute(similarityMap1,similarityMap2,attribute);
                break;
            case "Number":
                similarityMap = getComparedSimilarityMapForNumericalAttribute(similarityMap1,similarityMap2,attribute);
                break;
            case "List":
                similarityMap = getComparedSimilarityMapForListAttribute(similarityMap1,similarityMap2,attribute);
                break;
        }
        return similarityMap;
    };

    var getComparedSimilarityMapForCategoricalAttribute = function(map1,map2,attribute){
        var map1Values = Object.keys(map1[attribute]['value']);
        var map2Values = Object.keys(map2[attribute]['value']);
        var commonValues = _.intersection(map1Values,map2Values);
        var commonValueMap = {};
        if(commonValues.length==0){
            return {
                "similarity" : 1.0,
                "value" : {}
            }
        }else{
            for(var commonValue of commonValues){
                if(map1[attribute]['value']<=map2[attribute]['value']){
                    commonValueMap[commonValue] = map1[attribute]['value'];
                }else{
                    commonValueMap[commonValue] = map2[attribute]['value'];
                }
            }

            return {
                "similarity" : 1.0,
                "value" : commonValueMap
            }
        }
    };

    var getComparedSimilarityMapForNumericalAttribute = function(map1,map2,attribute){
        var map1Value = map1[attribute]['value'];
        var map2Value = map2[attribute]['value'];
        if(map1Value<=map2Value){
            return map1;
        }else{
            return map2;
        }
    };

    var getComparedSimilarityMapForListAttribute = function(map1,map2,attribute){
        var map1Values = map1[attribute]['value'];
        var map2Values = map2[attribute]['value'];
        var commonValues = _.intersection(map1Values,map2Values);
        var commonValueMap = {};
        if(commonValues.length==0){
            return {
                "similarity" : 1.0,
                "value" : []
            }
        }else{
            return {
                "similarity" : 1.0,
                "value" : commonValues
            }
        }
    };

})();