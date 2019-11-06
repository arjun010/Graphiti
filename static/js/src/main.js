/**
 * Created by arjun010 on 12/19/16.
 */
(function(){
    main = {};

    interfaceManager.sizeLayout();

    main.init = function(dataDirectory, linkingAttribute) {

        linkingAttribute = typeof linkingAttribute !== 'undefined' ? linkingAttribute : null;

        globalVars.dataDirectory = dataDirectory;
        $.post("/getDataAttributeMap", {"dataDirectory": dataDirectory})
            .done(function (response) {
                console.log(response);
                interfaceManager.populateAggregationAttributeDropdown(response.dataAttributeMap);
                if (linkingAttribute!=null){
                    $("#aggregationAttributeDropdown").val(linkingAttribute)
                }
                var initialAggregationAttribute = $("#aggregationAttributeDropdown").val();
                main.getAggregatedData(initialAggregationAttribute, linkingAttribute);
            });
    };

    main.getAggregatedData = function(aggregationAttribute, linkingAttribute){
        globalVars.aggregationAttribute = aggregationAttribute;
        $.post( "/processCSV", {"dataDirectory" : globalVars.dataDirectory,"aggregationAttribute":aggregationAttribute, "linkingAttribute":linkingAttribute})
            .done(function (response) {
                console.log(response);
                globalVars.nodeList = response.nodeList;
                globalVars.nodeMap = response.nodeIdMap;
                console.log(globalVars.nodeMap);
                globalVars.dataAttributeMap = response.dataAttributeMap;
                globalVars.preDefinedEdges = response.predefinedEdgeList;
                globalVars.preDefinedEdgeMap = response.predefinedEdgeMap;

                interfaceManager.populateManualQueryAttributeDropdown();

                similarityFinder.data(response.nodeList);

                var labelIdList = [];
                for(var i in globalVars.nodeList){
                    var node = globalVars.nodeList[i];
                    labelIdList.push({
                        "label" : node[aggregationAttribute],
                        "value" : node.id
                    });
                }

                $('#nodeInputBox').autocomplete({
                    source: labelIdList,
                    open: function(event, ui) {
                        console.log([event, ui])
                    },
                    // Once a value in the drop down list is selected, do the following:
                    select: function(event, ui) {
                        //console.log(ui.item);
                        if(ui.item.value == ui.item.label){ // workaround for weird cases where the value becomes the same as the label
                            var node = utils.getNodeByLabel(ui.item.value);
                        }else{
                            var node = globalVars.nodeMap[ui.item.value];
                        }
                        console.log(node);
                        graphRenderer.addNode(node);
                        return false;
                    }
                });

            });
    };

    var hashParams = window.location.hash.substr(1).split('|');
    // console.log(hashParams);
    if (hashParams[0].length==0) {
        main.init("imdb-demo");
    } else {
        if (hashParams.length>1) {
            main.init(hashParams[0], hashParams[1]); 
        } else {
            main.init(hashParams[0]);
        }
    }

    // main.init("crunchbase");
    // main.init("imdb");
    // main.init("global500","Name");
    // main.init("sdc-energy","name");
    //main.init("apis");
    //main.init("euro-16");
    // main.init("test");
    graphRenderer.init("#visCanvas",{"nodes":[],"links":[]});

})();