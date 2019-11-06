/**
 * Created by arjun010 on 9/28/16.
 */
(function () {
    nodeContextMenu = [
        {
            title: 'Create link',
            action: function(elm, d, i){
                graphRenderer.activateLinkDrawingMode(d);
            }
        },
        {
            title: 'Delete',
            action: function(elm, d, i) {
                var deletedLinks = graphQueryManager.deleteNode(d);
                console.log(deletedLinks);
                globalVars.latestAction = new Action('DELETE_NODE');
                globalVars.latestAction.addParamObj("deletedNode",d);
                globalVars.latestAction.addParamObj("deletedLinks",deletedLinks);

                if(d3.select("#actionResponseDiv").classed("hide")){
                    d3.select("#actionResponseDiv").classed("hide",false);
                }

            }
        },
        {
            title: 'Split',
            action: function(elm,d,i) {
                //queryModalManager.showNodeSplitModal(d);
                operationManager.addNewSplitNode(d);
            }
        },
        {
            title: 'Merge',
            action: function (elm, d, i) {
                graphRenderer.activateNodeMergeMode(d);
            }
        }
        //,{
        //    title: function (d) {
        //        if(d.fixed == true || d.fixed==1){
        //            return "Un-pin";
        //        }else {
        //            return "Pin";
        //        }
        //    },
        //    action: function (elm, d, i) {
        //        if(d.fixed!=true){
        //            d.fixed = true;
        //            if(!d3.select(elm).classed("fixed")){
        //                d3.select(elm).classed("fixed",true);
        //            }
        //        }else{
        //            d.fixed = false;
        //            if(d3.select(elm).classed("fixed")) {
        //                d3.select(elm).classed("fixed", false);
        //            }
        //        }
        //    }
        //}
    ];

    relationshipContextMenu = [
        {
            title: 'Delete Relationship',
            action: function(elm, d, i){
                graphQueryManager.removeConnection(d.source.id, d.target.id);
            }
        },
        {
            title: 'Show in details panel',
            action: function(elm, d, i){
                main.showEdgeDetails(d);
            }
        }
    ];

    svgContextMenu = [
        {
            title: "Add node",
            action: function (elm, d, i) {
                //queryModalManager.showNewNodeModal();
                operationManager.addNewNode();
            }
        }
    ];

})();