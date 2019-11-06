/**
 * Created by arjun010 on 12/22/16.
 */
(function () {
    conditionConstructor = {};

    conditionConstructor.generateConditions = function(similarityMap){
        var suggestedConditions = [];
        for(var attribute in similarityMap){
            if(similarityMap[attribute]!=null){
                var conditionsForAttribute = getConditionObjects(attribute,similarityMap[attribute]['value'],similarityMap[attribute]['similarity']);
                for(var conditionObject of conditionsForAttribute){
                    suggestedConditions.push(conditionObject);
                }
            }
        }
        console.log(suggestedConditions)
        utils.newSortObj(suggestedConditions, 'confidence', 'd');
        return suggestedConditions;
    };

    var getConditionObjects = function(attribute,value,similarityScore){
        switch (globalVars.dataAttributeMap[attribute]['type']){
            case "Number":
                return getConditionObjectsForNumericalAttribute(attribute,value,similarityScore);
                break;
            case "Categorical":
                return getConditionObjectsForCategoricalAttribute(attribute,value,similarityScore);
                break;
            case "List":
                return getConditionObjectsForListAttribute(attribute,value,similarityScore);
                break;
        }
    };

    var getConditionObjectsForNumericalAttribute = function(attribute,value,similarityScore){
        if(parseFloat(value)== 0.0){ // if two values are same
            var conditionId = "condition-"+globalVars.conditionCounter;
            var condition = new Condition(conditionId,attribute,"SAME_VALUE",value,[value],similarityScore);
        }else{ // if two values are close to each other
            var conditionId = "condition-"+globalVars.conditionCounter;
            var condition = new Condition(conditionId,attribute,"LESS_THAN_EQUALS",value,[value],similarityScore);
        }

        globalVars.conditionIdMap[conditionId] = condition;

        globalVars.conditionCounter += 1;
        return [condition];
    };

    var getConditionObjectsForCategoricalAttribute = function(attribute,valueMap,similarityScore){
        var conditionId = "condition-"+globalVars.conditionCounter;
        var condition1 = new Condition(conditionId,attribute,"CONTAINS_COMMON","","",similarityScore); // connect because there exists a common value
        globalVars.conditionIdMap[conditionId] = condition1;

        globalVars.conditionCounter += 1;

        if(Object.keys(valueMap).length>0){
            conditionId = "condition-"+globalVars.conditionCounter;
            var condition2 = new Condition(conditionId,attribute,"CONTAINS_VALUES",[Object.keys(valueMap)[0]],Object.keys(valueMap),similarityScore); // connect because the common value is a certain value
            globalVars.conditionIdMap[conditionId] = condition2;

            globalVars.conditionCounter += 1;
            return [condition1,condition2];
        }else{
            return [condition1];
        }
    };

    var getConditionObjectsForListAttribute = function(attribute,values,similarityScore){
        var conditionId = "condition-"+globalVars.conditionCounter;
        var condition1 = new Condition(conditionId,attribute,"CONTAINS_COMMON","","",similarityScore); // connect because there exists a common value
        globalVars.conditionIdMap[conditionId] = condition1;

        globalVars.conditionCounter += 1;

        if(values.length>0){
            conditionId = "condition-"+globalVars.conditionCounter;
            var condition2 = new Condition(conditionId,attribute,"CONTAINS_VALUES",[values[0]],values,similarityScore); // connect because the common value is a certain value
            globalVars.conditionIdMap[conditionId] = condition2;

            globalVars.conditionCounter += 1;
            return [condition1,condition2];
        }else{
            return [condition1];
        }
    };

})();