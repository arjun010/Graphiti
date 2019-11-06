/**
 * Created by arjun010 on 12/19/16.
 */
(function(){
    interfaceManager = {};

    interfaceManager.sizeLayout = function(){
        var pageWidth = $(document).width();
        var pageHeight = $(document).height();

        // $("#visCanvas").height(pageHeight*0.72);
        //$("#detailsContainer").height(pageHeight*0.5);
        //$("#stepSuggestionContainer").height(pageHeight*0.215);


        // $("#linkingCriteriaSuggestionContainer").height(pageHeight*0.25);
        // $("#activeQueryContainer").height(pageHeight*0.25);
    };

    $("#simulationButton").click(function(evt){

        console.log(similarityFinder.getSimilarityMapForNodePair(globalVars.nodeList[0],globalVars.nodeList[1]));

        var similarityMap = similarityFinder.getSimilarityMapForNodePair(globalVars.nodeList[0],globalVars.nodeList[1]);

        var suggestedConditions = conditionConstructor.generateConditions(similarityMap);

        interfaceManager.populateSuggestionsContainer(suggestedConditions);

    });

    interfaceManager.populateSuggestionsContainer = function(suggestions){

        var linkingCriteriaEvidenceText = "Based on the link(s) drawn between";
        for(var evidencePair of globalVars.evidencePairs){
            linkingCriteriaEvidenceText += ' <span class="label label-default drawn">'+evidencePair[0][globalVars.aggregationAttribute]+" ↔ "+evidencePair[1][globalVars.aggregationAttribute]+"</span> ";
        }
        if(globalVars.evidencePairs.length==0){
            linkingCriteriaEvidenceText = "";
        } else {
            linkingCriteriaEvidenceText = linkingCriteriaEvidenceText.slice(0,-1);
        }
        $("#linkingCriteriaEvidence").html(linkingCriteriaEvidenceText);

        $("#linkingCriteriaSuggestionContainer").html('');

        var suggestionRows = d3.select("#linkingCriteriaSuggestionContainer").selectAll("div")
            .data(suggestions)
            .enter()
            .append("div")
            .attr("class","systemSuggestion")
            .html(function(d){return d.displayHTML;});

        // suggestionRows.append("i").attr("class","fa fa-check-circle-o acceptSuggestion")
        suggestionRows.append("div")
            .attr("class","btn-group btn-group-xs pull-right")
            .html(function(d) {
                // console.log(d);
                var btnHTML = '<a href="#" class="btn btn-default"><i class="fa fa-plus-square"></i> Add To</a>';
                btnHTML += '<a href="#" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="caret"></span></a>';
                btnHTML += '<ul class="dropdown-menu" this-id="'+d.id+'"></ul>';
                return btnHTML;
            });
        queryConstructor.refreshDropdown();
        
        // existing single button
        suggestionRows.append("button")
            .attr("type","button")
            .attr("class","btn btn-default btn-xs pull-right acceptSuggestion")
            .html("<i class='fa fa-plus-square'></i> Add")
        d3.selectAll(".acceptSuggestion")
            .on("click",function(d,i){
                // console.log($(this).parent());
                queryConstructor.addCondition(globalVars.conditionIdMap[d.id]);
                $(this).parent().remove();
                globalVars.evidencePairs = [];
            });

        //$('.selectpicker').selectpicker();
        interfaceManager.populateValuePickerOptions();

    };

    $("#newNodeButton").click(function(evt){
        graphRenderer.network.nodes.push({"id":globalVars.nodeList.length+1})
        graphRenderer.draw(graphRenderer.network)
    });

    interfaceManager.populateAggregationAttributeDropdown = function(attributeMap){
        for(var attribute in attributeMap){
            if(attributeMap[attribute]['type']=="Categorical"){
                $("#aggregationAttributeDropdown").append($('<option>', {value:attribute, text:attribute}));
            }
        }
    };

    $("#aggregationAttributeDropdown").change(function(evt){
        var newAggregationAttribute = $("#aggregationAttributeDropdown").val();
        main.getAggregatedData(newAggregationAttribute,null);
    });

    $("#pullNetworkButton").click(function(evt){
        var nodeCount = 150 - graphRenderer.network.nodes.length;
        if(nodeCount > globalVars.nodeList.length){
            nodeCount = globalVars.nodeList.length;
        }
        if(nodeCount < 1){
            nodeCount = 5;
        }
        // for(var i =parseInt(globalVars.nodeList.length/1.5) ;i<globalVars.nodeList.length;i++){
        for(var i =0 ;i<globalVars.nodeList.length;i++){
            graphRenderer.addNode(globalVars.nodeList[i]);
        }
        graphRenderer.computeLinks(graphRenderer.network.nodes);
        graphRenderer.removeZeroDegreeNodes();
    });

    interfaceManager.populateValuePickerOptions = function(){
        $('.selectpicker').selectpicker({
            dropupAuto: true
        });
        $('.selectpicker').each(function(e){
            var selectpickerId = $(this).attr('id');
            if(selectpickerId.indexOf("valuePickerFor")!=-1){ // if it is a dropdown for condition values
                var conditionId = selectpickerId.split("valuePickerFor-")[1];
                var condition = globalVars.conditionIdMap[conditionId];
                $(this).selectpicker('val',condition.value);
            }
        });
    
        $('.selectpicker option').attr("selected","selected");
        $('.selectpicker').selectpicker('refresh');

        $(".valuePickerSlider").each(function(){
            var valuePickerId = $(this).attr('id');
            var conditionId = valuePickerId.split("valuePickerFor-")[1];
            var condition = globalVars.conditionIdMap[conditionId];
            var handleId = "handleFor-"+conditionId;
            var handle = $("#"+handleId);
            $(this).slider({
                create: function() {
                    handle.text($( this ).slider( "value" ));
                },
                max: condition.startValue,
                slide: function( event, ui ) {
                    handle.text( ui.value );
                },
                value: condition.value,
                stop: function(event,ui){
                    condition.value = ui.value;
                    graphRenderer.computeLinks(graphRenderer.network.nodes);
                }
            });
        });
        //var handle = $( "#custom-handle" );
        //$( "#slider" ).slider({
        //    create: function() {
        //        handle.text( $( this ).slider( "value" ) );
        //    },
        //    slide: function( event, ui ) {
        //        handle.text( ui.value );
        //    }
        //});


        $('.selectpicker').on('change', function(){
            var selectpickerId = $(this).attr('id');
            if(selectpickerId.indexOf("valuePickerFor")!=-1){ // if it is a dropdown for condition values
                var conditionId = selectpickerId.split("valuePickerFor-")[1];
                var condition = globalVars.conditionIdMap[conditionId];
                condition.value = $(this).val();
                graphRenderer.computeLinks(graphRenderer.network.nodes);
            }
        });
    };

    interfaceManager.highlightSatisfiedConditions = function(satisfiedConditions){
        $(".queryCondition").each(function () {
            var conditionId = $(this).attr("id");
            if(satisfiedConditions.indexOf(conditionId)!=-1){
                $(this).removeClass("ui-state-default");
                $(this).addClass("ui-state-focus");
            }
        });
    };

    interfaceManager.unHighlightConditions = function(){
        $(".queryCondition").each(function () {
            $(this).removeClass("ui-state-focus");
            $(this).addClass("ui-state-default");
        });
    };

    interfaceManager.activateLabelInputBoxes = function(){
        $(".edgeTypeInputBox").on("input",function(){
            var andBlockId = $(this).parent().parent().attr("id").split("_ANDContainer")[0];
            globalVars.andBlockMap[andBlockId]['label'] = $(this).val();
        })
    };

    $("#conditionBoxPlaceholder").on("click",function(evt){
        $("#conditionBoxPlaceholder").addClass("hide");
        $("#manualQuerySpecifier").removeClass("hide");
    });

    $("#cancelManualQueryIcon").on("click", function (evt) {
        $("#manualQuerySpecifier").addClass("hide");
        $("#conditionBoxPlaceholder").removeClass("hide");
    });

    $("#applyManualQueryIcon").on("click", function (evt) {
        var queryAttribute = $("#manualQueryAttrDropdown").val();
        var queryOperator = $("#manualQueryConditionOperatorDropdown").val();
        var queryValue;
        if(globalVars.dataAttributeMap[queryAttribute]['type']=="Number" && queryOperator!="SAME_VALUES"){
            queryValue = $("#manualQueryValueElm").slider("value");
            if(isNaN(queryValue)){
                queryValue = 0.0;
            }
            console.log(queryValue)
            var conditionId = "condition-"+globalVars.conditionCounter;
            var condition = new Condition(conditionId,queryAttribute,queryOperator,queryValue,[queryValue],1); // connect because there exists a common value
            globalVars.conditionIdMap[conditionId] = condition;
            globalVars.conditionCounter += 1;
        }else if(globalVars.dataAttributeMap[queryAttribute]['type']=="Categorical" || globalVars.dataAttributeMap[queryAttribute]['type']=="List"){
            queryValue = $("#manualQueryValueElm").val();

            var conditionId = "condition-"+globalVars.conditionCounter;
            var condition = new Condition(conditionId,queryAttribute,queryOperator,[queryValue],[queryValue],1);
            globalVars.conditionIdMap[conditionId] = condition;
            globalVars.conditionCounter += 1;
        }

        queryConstructor.addCondition(globalVars.conditionIdMap[conditionId]);
        $("#cancelManualQueryIcon").trigger("click");
        //console.log(queryAttribute,queryOperator,queryValue, typeof queryValue)


        //var conditionId = "condition-"+globalVars.conditionCounter;
        //var condition1 = new Condition(conditionId,attribute,"CONTAINS_COMMON","","",similarityScore); // connect because there exists a common value
        //globalVars.conditionIdMap[conditionId] = condition1;
        //
        //globalVars.conditionCounter += 1;
    });

    interfaceManager.populateManualQueryAttributeDropdown = function(){
        $("#manualQueryAttrDropdown").html('');
        $("#manualQueryConditionOperatorDropdown").html('');
        $("#manualQueryValueSpan").html('');

        $(".aggregationAttributeLabel").text(globalVars.aggregationAttribute);
        for(var attribute in globalVars.dataAttributeMap){
            if(attribute!=globalVars.aggregationAttribute){
                $("#manualQueryAttrDropdown").append($('<option>', {value:attribute, text:attribute}));
            }
        }
        interfaceManager.updateManualQueryOperatorDropdown($("#manualQueryAttrDropdown").val());
        interfaceManager.updateManualQueryValueSpan($("#manualQueryAttrDropdown").val(),$("#manualQueryConditionOperatorDropdown").val());
    };

    $("#manualQueryAttrDropdown").on("change",function(evt){
        var attribute = $(this).val();
        interfaceManager.updateManualQueryOperatorDropdown(attribute);
    });

    interfaceManager.updateManualQueryOperatorDropdown = function(attribute){
        $("#manualQueryConditionOperatorDropdown").html('');
        $("#manualQueryValueSpan").html('');
        if(globalVars.dataAttributeMap[attribute]['type']=='Categorical' || globalVars.dataAttributeMap[attribute]['type']=='List'){
            var possibleOperators = ["CONTAINS_COMMON","CONTAINS_VALUES"]
            for(var i in possibleOperators){
                var operatorValue = possibleOperators[i];
                $("#manualQueryConditionOperatorDropdown").append($('<option>', {value:operatorValue, text:globalVars.conditionOperatorToLabelMap[operatorValue]}));
            }
        }else if(globalVars.dataAttributeMap[attribute]['type']=='Number'){
            var possibleOperators = ["SAME_VALUE","LESS_THAN_EQUALS"]
            for(var i in possibleOperators){
                var operatorValue = possibleOperators[i];
                $("#manualQueryConditionOperatorDropdown").append($('<option>', {value:operatorValue, text:globalVars.conditionOperatorToLabelMap[operatorValue]}));
            }
        }
        interfaceManager.updateManualQueryValueSpan(attribute,$("#manualQueryConditionOperatorDropdown").val());
    };

    $("#manualQueryConditionOperatorDropdown").on("change",function(){
        interfaceManager.updateManualQueryValueSpan($("#manualQueryAttrDropdown").val(),$("#manualQueryConditionOperatorDropdown").val());
    });

    interfaceManager.updateManualQueryValueSpan = function(attribute,operator){
        $("#manualQueryValueSpan").html('');

        if(globalVars.dataAttributeMap[attribute]['type']=="Categorical" || globalVars.dataAttributeMap[attribute]['type']=="List"){
            if(operator=="CONTAINS_VALUES"){
                $("#manualQueryValueSpan").append("<select id='manualQueryValueElm'></select>");
                var attributeValues = utils.getAllValuesForAttribute(attribute);
                for(var value of attributeValues){
                    $("#manualQueryValueElm").append($('<option>', {value:value, text:value}));
                }
            }
        }else if(globalVars.dataAttributeMap[attribute]['type']=="Number"){
            if(operator=="LESS_THAN_EQUALS"){
                var attributeValues = utils.getAllValuesForAttribute(attribute);

                var valuePickerId =  "manualQueryValueElm";
                var handleId = "handleFor-manualQueryValueElm";

                var valuePickerHTML = "<div id='"+valuePickerId+"' class='valuePickerSlider'><div id='"+handleId+"' class='ui-slider-handle valuePickerSliderHandle'></div></div>";
                $("#manualQueryValueSpan").append(valuePickerHTML);
                var handle = $("#"+handleId);
                $("#"+valuePickerId).slider({
                    create: function() {
                        handle.text($( this ).slider( "value" ));
                    },
                    max: Math.max.apply(null, attributeValues),
                    min: 0,
                    slide: function( event, ui ) {
                        handle.text( ui.value );
                    },
                    value: Math.max.apply(null, attributeValues)/2
                });
            }
        }
    };

    $("#computeNetworkMetricsButton").on("click", function (evt) {
        //$.post("/computeNetworkMetrics", {"nodes": graphRenderer.network.nodes,"links":graphRenderer.network.links})
        $.post("/computeNetworkMetrics", {"network": JSON.stringify(graphRenderer.network)})
            .done(function (response) {
                $("#networkMetricsDisplayDiv").html('');
                for(var networkMetric in response){
                    if (networkMetric=="average_clustering") $("#networkMetricsDisplayDiv").append("<li><b>"+networkMetric+"</b>: " + response[networkMetric].toFixed(4)+"</li>");
                    else $("#networkMetricsDisplayDiv").append("<li><b>"+networkMetric+"</b>: " + response[networkMetric]+"</li>");
                }
            });
    });

    interfaceManager.showNodeDetails = function (node){
        $("#nodeDetailsDisplayDiv").html('')
        for(var attribute in globalVars.dataAttributeMap){
            if(attribute==globalVars.aggregationAttribute){
                $("#nodeDetailsDisplayDiv").append("<li><b>"+attribute+"</b>: "+node[attribute]+"</li>")
            }
            else if(globalVars.dataAttributeMap[attribute]['type']=='Categorical'){
                $("#nodeDetailsDisplayDiv").append("<li><b>"+attribute+"</b>: "+Object.keys(node[attribute]).join()+"</li>")
            }else{
                $("#nodeDetailsDisplayDiv").append("<li><b>"+attribute+"</b>: "+node[attribute]+"</li>")
            }
        }
    };

    interfaceManager.activateEdgeToggleButtons = function(){
        $(".edgeTypeToggleButton").on("click",function(evt){
            var andBlockId = $(this).parent().parent().attr("id").split("_ANDContainer")[0];
            console.log(andBlockId,globalVars.andBlockMap)
            if($(this).hasClass("btn-primary")){
                $(this).removeClass("btn-primary");
                $(this).addClass("btn-default");
                $(this).html("<i class='fa fa-eye-slash'></i> Hidden");
                globalVars.andBlockMap[andBlockId]['active'] = false;
            }else if($(this).hasClass("btn-default")){
                $(this).removeClass("btn-default");
                $(this).addClass("btn-primary");
                $(this).html("<i class='fa fa-eye'></i> Shown");
                globalVars.andBlockMap[andBlockId]['active'] = true;
            }
            graphRenderer.computeLinks(graphRenderer.network.nodes);
        });
    };

    $("#removeZeroDegreeNodesButton").click(function(evt){
        graphRenderer.removeZeroDegreeNodes();
    });

    $("#downloadButton").click(function(evt){
        var nodeFileDownloadStr = utils.getNodesDownloadStr();
        var edgeFileDownloadStr = utils.getEdgesDownloadStr();
        download(nodeFileDownloadStr,'graphiti_nodeFile.csv','text/csv')
        setTimeout(function(){
            download(edgeFileDownloadStr,'graphiti_edgeFile.csv','text/csv')
        },1000);

        // var zip = new JSZip();
        // zip.file("graphiti_nodeFile.csv", nodeFileDownloadStr);
        // zip.file("graphiti_edgeFile.csv", edgeFileDownloadStr);

        // zip.generateAsync({type:"blob"})
        // .then(function(content) {
        //     // see FileSaver.js
        //     saveAs(content, "graphiti_network.zip");
        // });

    });

})();