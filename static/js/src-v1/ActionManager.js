/**
 * Created by arjun010 on 11/7/16.
 */
(function () {
    ActionManager = {};

    ActionManager.addToActionList = function (newAction) {
        globalVars.actionList.push(newAction);
        main.updateActionsList();
    };

    ActionManager.undoAction = function (action) {
        switch (action.type){
            case "NEW_NODE":
                graphQueryManager.deleteNode(action.params.newNode);
                break;
            case "NODE_SPLIT" :
                graphQueryManager.deleteNode(action.params.newNode);
                break;
            case "DELETE_NODE":
                graphQueryManager.addNewNode(action.params.deletedNode);
                graphQueryManager.addNewEdges(action.params.deletedLinks);
                break;
        }
    };

})();