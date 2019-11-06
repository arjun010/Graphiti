/**
 * Created by arjun010 on 12/22/16.
 */
(function () {

    queryConstructor = {};

    queryConstructor.addCondition = function(condition){
        globalVars.activeConditionList.push([condition]);
        //graphRenderer.computeLinks(globalVars.nodeList);
        graphRenderer.computeLinks(graphRenderer.network.nodes);
        drawQueryContainer(globalVars.activeConditionList);
    };

    queryConstructor.getAndBlockId = function(andBlock){
        var conditionIds = [];
        for(var condition of andBlock){
            conditionIds.push(condition.id);
        }
        return conditionIds.join("_");
    };
    
    queryConstructor.refreshDropdown = function() {
        $('#linkingCriteriaSuggestionContainer .dropdown-menu').html('');
        $('#linkingCriteriaSuggestionContainer .dropdown-menu').html(function () {
            var btnHTML = '';
            for (var i = 0; i < globalVars.activeConditionList.length; i++) {
                btnHTML += '<li><a href="#" class="addToBtn" this-id="'+$(this).attr('this-id')+'" target-id="'+i+'">New Edge Type '+(i+1)+'</a></li>';
            }
            if (globalVars.activeConditionList.length>0) {
                btnHTML += '<li class="divider"></li>';
            }
            btnHTML += '<li><a href="#" class="addToBtn" this-id="'+$(this).attr('this-id')+'" target-id="-1">New Edge Type</a></li>';
            return btnHTML;
        });

        d3.selectAll(".addToBtn")
            .on("click",function() {
                if ($(this).attr('target-id')<0) {
                    globalVars.activeConditionList.push([globalVars.conditionIdMap[$(this).attr('this-id')]]);
                } else {
                    globalVars.activeConditionList[$(this).attr('target-id')].push(globalVars.conditionIdMap[$(this).attr('this-id')]);
                }
                $(this).parent().parent().parent().parent().remove();
                globalVars.evidencePairs = [];
                graphRenderer.computeLinks(graphRenderer.network.nodes);
                drawQueryContainer(globalVars.activeConditionList);
            });
    }

    function drawQueryContainer(conditionList){
        queryConstructor.refreshDropdown();
        $("#activeQueryDiv").html('');
        for(var i in conditionList){
            var andBlock = conditionList[i];
            if(andBlock.length>0){
                var andBlockId = queryConstructor.getAndBlockId(andBlock);

                var andBlockSelector = d3.select("#activeQueryDiv")
                    .append("ul")
                    //.attr("id",function(){
                    //    return "ul-"+conditionList.indexOf(andBlock)
                    //})
                    .attr("id",function(){
                        return andBlockId;
                    })
                    .attr("class","connectedSortable ANDContainer");

                // andBlockSelector.append('span').attr('class', 'label label-default pull-right').html('AND Block');

                if(!(andBlockId in globalVars.andBlockMap)){
                    globalVars.andBlockMap[andBlockId] = {
                        "active" : true,
                        "color" : null,
                        "label" : null
                    };
                }

                var edgeTypeValue = 'New Edge Type ' + (parseInt(i)+1);
                if(globalVars.andBlockMap[andBlockId]['label']!=null){
                    edgeTypeValue = globalVars.andBlockMap[andBlockId]['label'];
                }else{
                    globalVars.andBlockMap[andBlockId]['label'] = edgeTypeValue;
                }

                andBlockSelector.append("li")
                    //.attr("id",function(){
                    //    return "ul-"+conditionList.indexOf(andBlock) + "-ANDContainerHeader";
                    //})
                    .attr("id",function(){
                        return andBlockId + "_ANDContainerHeader";
                    })
                    .attr("class",function(){
                        return "ANDContainerHeader";
                    })
                    .html(function() {
                        // return "&nbsp;<span style='float:right'><input class='edgeTypeInputBox' type='text' value='"+edgeTypeValue+"'><button type='button' class='btn btn-primary edgeTypeToggleButton' style='margin-top: -12px;'><i class='fa fa-eye'></i></button></span>";
                        return "<button type='button' class='btn btn-primary btn-xs edgeTypeToggleButton'><i class='fa fa-eye'></i> Shown</button> <input class='edgeTypeInputBox' type='text' value='"+edgeTypeValue+"'> <span class='label label-default'><i class='fa fa-pencil'></i> Editable</span>";
                    });

                for(var condition of andBlock){
                    andBlockSelector.append("li")
                        .attr("id",function(){return condition.id})
                        .attr("class","ui-state-default queryCondition")
                        .html(function() {
                            // return condition.displayHTML + "<i class='fa fa-times-circle-o removeCondition' style='color: red;float:right;font-size:20px;'></i>";
                            return condition.displayControl + "<button class='btn btn-danger btn-xs pull-right removeCondition'><i class='fa fa-minus-square'></i> Remove</button>";
                        });
                }
            }
        }

        d3.selectAll(".removeCondition")
            .on("click",function(d,i){
                var conditionIdToRemove = $(this).parent().attr("id");
                var andBlockRemoved = utils.deactivateCondition(conditionIdToRemove)['andBlockRemoved'];
                if(andBlockRemoved==1){
                    $(this).parent().parent().remove();
                }else{
                    $(this).parent().remove();
                }
                graphRenderer.computeLinks(graphRenderer.network.nodes);
            });

        $( "#activeQueryDiv, .ANDContainer" ).sortable({
            connectWith: ".connectedSortable",
            placeholder: "ui-state-highlight",
            stop:function(e) {
                var andBlockMap = {}, andBlockOrder = [], newAndBlockCount = 0;
                d3.select("#activeQueryDiv").selectAll(".queryCondition")
                    .each(function(item){
                        if($(this).parent().attr("id")=="activeQueryDiv"){ // if is floating <li>, then assign AND block around it
                            andBlockOrder.push("newUl-"+newAndBlockCount);
                            andBlockMap["newUl-"+newAndBlockCount] = [$(this).attr("id")];
                            newAndBlockCount += 1;
                        }else if($(this).parent().attr("class").indexOf("ANDContainer")!=-1){ // if <li> is within an AND block, group with conditions
                            if(andBlockOrder.indexOf($(this).parent().attr("id"))==-1){ // if block is not already covered, add it to list
                                andBlockOrder.push($(this).parent().attr("id"));
                                andBlockMap[$(this).parent().attr("id")] = [$(this).attr("id")];
                            }else{
                                andBlockMap[$(this).parent().attr("id")].push($(this).attr("id"));
                            }
                        }
                    });

                var newConditionList = [];
                for(var andBlockId of andBlockOrder){
                    var curBlockConditionList = [];
                    for(var conditionId of andBlockMap[andBlockId]){
                        curBlockConditionList.push(globalVars.conditionIdMap[conditionId]);
                    }
                    newConditionList.push(curBlockConditionList);
                }
                //console.log(newConditionList);
                //globalVars.activeConditionList = utils.clone(newConditionList);
                globalVars.activeConditionList = newConditionList; // removing clone when conditions are merged to maintain new values
                drawQueryContainer(newConditionList);

            }
        }).disableSelection();
        //graphRenderer.network.nodes = globalVars.nodeList
        //graphRenderer.computeLinks(globalVars.nodeList);

        //$('.selectpicker').selectpicker();

        interfaceManager.activateLabelInputBoxes();

        interfaceManager.populateValuePickerOptions();

        interfaceManager.activateEdgeToggleButtons();

        graphRenderer.computeLinks(graphRenderer.network.nodes);

    };

    queryConstructor.isActiveAndBlock = function(andBlockId){
        if(andBlockId in globalVars.andBlockMap){
            return globalVars.andBlockMap[andBlockId]['active'];
        }else{
            return true;
        }
    };

})();