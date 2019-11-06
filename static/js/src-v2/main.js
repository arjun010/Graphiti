/**
 * Created by arjun010 on 11/28/16.
 */
(function() {
    main = {};
    $body = $("body");
    $(document).on({
        ajaxStart: function () {
            $body.addClass("loading");
        },
        ajaxStop: function () {
            $body.removeClass("loading");
        }
    });

    main.init = function () {
        d3.csv("../static/data/global500/data-subset.csv", function (data) {
            console.log(data);

            ial.init(data);
            idItemMap = {};
            attributeValueMap = ial.getAttributeValueMap();
            originalNodesList = data;

            var labelValueList = [];

            for(var company of data){
                labelValueList.push({
                    "label": company.Name,
                    "value" : company.ial.id
                });
                idItemMap[company.ial.id] = company;
            }
            var inputNodesIds = [-1,-1];

            $('.nodeInputBox').autocomplete({
                source: labelValueList,
                // Once a value in the drop down list is selected, do the following:
                select: function(event, ui) {
                    // place the person.given_name value into the textfield called 'select_origin'...
                    //alert(ui.item.value,ui.item.label)
                    $(this).val(ui.item.label);
                    //console.log(this.id)
                    var inputBoxIndex = parseInt(this.id.split('Box')[1]);
                    inputNodesIds[inputBoxIndex] = parseInt(ui.item.value);

                    if(inputNodesIds.indexOf(-1)==-1){
                        triggerLinkFindingFunctions(inputNodesIds);
                    }
                    return false;
                }
            });

        });
    };


    var triggerLinkFindingFunctions = function(nodeIds){
        var nodes = [];
        for(var nodeId of nodeIds){
            nodes.push(idItemMap[nodeId])
        };
        var newWeightVector = ial.generateAttributeWeightVectorUsingSimilarity(nodes);
        console.log(nodes,newWeightVector);
        var suggestions = [];
        var suggestionId = 0;
        for(var attribute in newWeightVector){
            if(newWeightVector[attribute]>0.8){

                var suggestionObj = {
                    "attribute" : null,
                    "attributeType" : null,
                    "value" : null,
                    "text" : "",
                    "matchingFunction" : null,
                    "confidence" : 0
                };

                suggestionObj['attribute'] = attribute;
                suggestionObj['attributeType'] = attributeValueMap[attribute]['dataType'];
                suggestionObj['confidence'] = newWeightVector[attribute];
                suggestionObj['id'] = suggestionId;

                if(attributeValueMap[attribute]['dataType']=='numeric'){

                    suggestionObj['value'] = Math.abs(parseFloat(nodes[1][attribute])-parseFloat(nodes[0][attribute]));
                    suggestionObj['matchingFunction'] = "valueDifference";
                    suggestionObj['text'] = "Create links if the difference between values for <b>" + attribute + "</b> is <= <u>" + suggestionObj['value'] +"</u>";

                    suggestions.push(suggestionObj);
                    suggestionId += 1;

                }else if(attributeValueMap[attribute]['dataType']=='categorical'){

                    suggestionObj['matchingFunction'] = "attributeValueMatch";
                    suggestionObj['text'] = "Create links if there are matching values for <b>" + attribute + "</b>";

                    suggestions.push(suggestionObj);
                    suggestionId += 1;

                    var secondSuggestionObj = {
                        "attribute" : null,
                        "attributeType" : null,
                        "value" : null,
                        "text" : "",
                        "matchingFunction" : null,
                        "confidence" : 0
                    };

                    secondSuggestionObj['attribute'] = attribute;
                    secondSuggestionObj['attributeType'] = attributeValueMap[attribute]['dataType'];
                    secondSuggestionObj['confidence'] = newWeightVector[attribute];
                    secondSuggestionObj['matchingFunction'] = "hasValue";
                    secondSuggestionObj['value'] = nodes[0][attribute];
                    secondSuggestionObj['id'] = suggestionId;
                    secondSuggestionObj['text'] = "Create links between nodes with the value <u>" + secondSuggestionObj['value'] + "</u> for <b>" + attribute + "</b>";

                    suggestions.push(secondSuggestionObj);
                    suggestionId += 1;
                }

            }
        }
        console.log(suggestions);
        sortObj(suggestions,'confidence','d');
        populateSuggestions(suggestions)
    };

    acceptedSuggestions = [];

    var populateSuggestions = function(suggestions){

        $("#systemSuggestionsDiv").html('');

        var suggestionRows = d3.select("#systemSuggestionsDiv").selectAll("div")
            .data(suggestions)
            .enter()
            .append("div")
            .attr("class","systemSuggestion")
            .html(function(d){return d.text;});

        suggestionRows.append("i")
            .attr("class","fa fa-check-circle-o acceptSuggestion")
            .style("margin-left","2px")
            .style("margin-right","2px")
            .style("color","green");

        d3.selectAll(".acceptSuggestion")
            .on("click",function(d){
                if(isAlreadyAcceptedSuggestion(d)==-1){
                    if(!d3.select(this.parentNode).classed("accepted")){
                        d3.select(this.parentNode).classed("accepted",true);
                    }
                    acceptedSuggestions.push(d);
                    updateAcceptedSuggestions();
                }
            });

    };

    var updateAcceptedSuggestions = function(){
        $("#acceptedSuggestionsDiv").html('');

        var suggestionRows = d3.select("#acceptedSuggestionsDiv").selectAll("div")
            .data(acceptedSuggestions)
            .enter()
            .append("div")
            .attr("class","acceptedSuggestion")
            .html(function(d){return d.text;});

        suggestionRows.append("i")
            .attr("class","fa fa-times-circle-o rejectSuggestion")
            .style("margin-left","2px")
            .style("margin-right","2px")
            .style("color","red");

        d3.selectAll(".rejectSuggestion")
            .on("click",function(d,i){
                acceptedSuggestions.splice(i, 1);
                d3.select(this.parentNode).remove();
                d3.selectAll(".systemSuggestion").each(function(d2){
                    if(d2.id==d.id){
                        if(d3.select(this).classed("accepted")){
                            d3.select(this).classed("accepted",false);
                        }
                    }
                });
            });

    };

    function sortObj(list, key, order) {
        order = typeof order !== 'undefined' ? order : 'a';
        function compare(a, b) {
            if(key == "ial.weight" || key == "ial.id" || key == "ial.itemScore") {
                a = a["ial"][key.split('.')[1]];
                b = b["ial"][key.split('.')[1]];
            } else {
                a = a[key];
                b = b[key];
            }
            var type = (typeof(a) === 'string' ||
            typeof(b) === 'string') ? 'string' : 'number';
            var result;
            if (type === 'string') result = a.localeCompare(b);
            else {
                if (order == 'a') {
                    result = a - b;
                } else if (order == 'd') {
                    result = b - a;
                }
            }
            return result;
        }
        return list.sort(compare);
    }

    function isAlreadyAcceptedSuggestion(suggestion){
        for(var acceptedSuggestion of acceptedSuggestions){
            if(acceptedSuggestion.id == suggestion.id){
                return 1;
            }
        }
        return -1;
    }

    $("#applyQuery").click(function(evt){
        var modeledNetwork = modelNetwork();
        console.log(modeledNetwork)
        graphRenderer.draw(modeledNetwork,"graphDiv");
    });

    var modelNetwork = function(){

        var edgeMap = {};

        for(var i=0;i<originalNodesList.length-1;i++){
            var node1 = originalNodesList[i];
            for(var j=i+1;j<originalNodesList.length;j++){
                var node2 = originalNodesList[j];

                for(var criteria of acceptedSuggestions){
                    var curAttribute = criteria['attribute'];
                    if(criteria['attributeType']=='numeric'){
                        if(criteria['matchingFunction']=='valueDifference'){
                            var valueDiff = parseFloat(node1[curAttribute])-parseFloat(node2[curAttribute]);
                            if(valueDiff<=criteria['value']){
                                addToEdgeMap(node1,node2);
                            }
                        }
                    }else if(criteria['attributeType']=='categorical'){
                        if(criteria['matchingFunction'] == 'attributeValueMatch'){
                            if(node1[curAttribute]==node2[curAttribute]){
                                addToEdgeMap(node1,node2);
                            }
                        }else if(criteria['matchingFunction'] == 'hasValue'){
                            if(node1[curAttribute]==criteria['value'] && node2[curAttribute]==criteria['value']){
                                addToEdgeMap(node1,node2);
                            }
                        }
                    }
                }
            }
        }

        function addToEdgeMap(node1,node2){

            if(node1.ial.id in edgeMap){
                if(node2.ial.id in edgeMap[node1.ial.id]){
                    edgeMap[node1.ial.id][node2.ial.id] += 1;
                }else{
                    edgeMap[node1.ial.id][node2.ial.id] = 1;
                }
            }else{
                edgeMap[node1.ial.id] = {};
                edgeMap[node1.ial.id][node2.ial.id] = 1;
            }
        }

        var links = [], minWeight= null, maxWeight = null;

        for(var node1Id in edgeMap){
            for(var node2Id in edgeMap[node1Id]){
                links.push({
                    "source" : idItemMap[node1Id],
                    "target" : idItemMap[node2Id],
                    "weight" : edgeMap[node1Id][node2Id]
                });
                if(minWeight==null){
                    minWeight = edgeMap[node1Id][node2Id];
                }else{
                    if(edgeMap[node1Id][node2Id]<minWeight){
                        minWeight = edgeMap[node1Id][node2Id];
                    }
                }
                if(maxWeight==null){
                    maxWeight = edgeMap[node1Id][node2Id];
                }else{
                    if(edgeMap[node1Id][node2Id]>maxWeight){
                        maxWeight = edgeMap[node1Id][node2Id];
                    }
                }
            }
        }

        return {
            "links" : links,
            "nodes" : originalNodesList,
            "minEdgeWeight":minWeight,
            "maxEdgeWeight":maxWeight
        }

    };

})();