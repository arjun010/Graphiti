/**
 * Created by arjun010 on 9/22/16.
 */
(function(){
    globalVars = {};

    globalVars.newNodeIdCounter = null;
    globalVars.newLinkIdCounter = null;

    globalVars.nodeList = null;
    globalVars.edgeList = null;

    globalVars.nodeMap = {};
    globalVars.edgeMap = {};
    globalVars.activeNetwork = {};

    globalVars.nodeAttributes = [];
    globalVars.nodeAttributeTypeMap = {};

    globalVars.edgeAttributes = [];
    globalVars.edgeAttributeTypeMap = {};

    globalVars.latestAction = null;
    globalVars.actionList = [];

})();