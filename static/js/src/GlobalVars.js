/**
 * Created by arjun010 on 12/19/16.
 */
(function(){
    globalVars = {};

    globalVars.dataAttributeMap = {};
    globalVars.nodeList = [];
    globalVars.nodeMap = {};
    globalVars.aggregationAttribute = null;
    globalVars.dataDirectory = null;

    globalVars.conditionCounter = 0;
    globalVars.conditionIdMap = {};
    globalVars.activeConditionList = [];

    globalVars.numericalSimilarityThreshold = 0.8;

    globalVars.preDefinedEdges = [];
    globalVars.preDefinedEdgeMap = {};

    globalVars.evidencePairs = [];
    globalVars.andBlockMap = {};

    globalVars.conditionOperatorToLabelMap = {
        "CONTAINS_COMMON":"has common value(s)",
        "CONTAINS_VALUES":"has value(s)",
        "SAME_VALUE":"is same",
        "LESS_THAN_EQUALS":"has difference less than equal to"
    };

    globalVars.layoutPaused = false;

    globalVars.layoutCharge = -250;
    globalVars.linkDistance = 250;

})();