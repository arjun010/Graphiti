/**
 * Created by arjun010 on 12/22/16.
 */
(function () {

    Condition = function(id,attribute,operator,value,possibleValues,confidence) {
        this.timestamp = new Date();
        this.id = id;
        this.attribute = attribute;
        this.operator = operator;
        this.value = value;
        this.startValue = value;
        this.possibleValues = possibleValues;
        this.displayHTML = constructConditionHTML(this, false);
        this.displayControl = constructConditionHTML(this, true);
        this.confidence = confidence;
    };

    var constructConditionHTML = function(condition, control){
        switch (globalVars.dataAttributeMap[condition.attribute]['type']){
            case "Number":
                return getConditionHTMLForNumericalAttribute(condition, control);
                break;
            case "Categorical":
                return getConditionHTMLForCategoricalAttribute(condition, control);
                break;
            case "List":
                return getConditionHTMLForListAttribute(condition, control);
                break;
            default:
                return "Condition text.";
                break;
        }
    };

    var getConditionHTMLForNumericalAttribute = function(condition, control){
        var conditionHTML = null;
        if(condition.operator == "SAME_VALUE"){ // if two values are same
            // // var conditionHTML = "<b>" + globalVars.dataAttributeMap[condition.attribute]['label'] + "</b> is same."
            // conditionHTML = "Same value for <b>" + globalVars.dataAttributeMap[condition.attribute]['label'] + "</b>"
            conditionHTML = "Same value for <b>" + condition.attribute + "</b>"
        
        }else if (condition.operator == "LESS_THAN_EQUALS") { // if two values are close to each other
            //var conditionHTML = "Difference between <b>" + globalVars.dataAttributeMap[condition.attribute]['label'] + "</b> is <i>" + condition.operator + "</i> <b>" + condition.value + "</b>."

            if (control) {
                var valuePickerId =  "valuePickerFor-"+condition.id;
                var handleId = "handleFor-"+condition.id;
                var valuePickerHTML = "<div id='"+valuePickerId+"' class='valuePickerSlider'><div id='"+handleId+"' class='ui-slider-handle valuePickerSliderHandle'></div></div>";
                // conditionHTML = "Difference between <b>" + globalVars.dataAttributeMap[condition.attribute]['label'] + "</b> is <u><i>" + condition.operator + "</i> &#9660;</u> " + valuePickerHTML + ".";
                conditionHTML = "Difference between <b>" + condition.attribute + "</b> is <u><i>" + condition.operator + "</i> &#9660;</u> " + valuePickerHTML + ".";
        
            } else {
                // HP disabling controls on the left
                // conditionHTML = "Difference between <b>" + globalVars.dataAttributeMap[condition.attribute]['label'] + "</b> is <i>LESS_THAN_EQUALS</i> <u>"+condition.value+"</u>";
                // conditionHTML = "Difference between <b>" + condition.attribute + "</b> is <i>LESS_THAN_EQUALS</i> <u>"+condition.value+"</u>";
                conditionHTML = "Difference between <b>" + condition.attribute + "</b> is <i>EQUALS</i> <u>"+condition.value+"</u>";
        
            }
        }
        return conditionHTML;
    };

    var getConditionHTMLForCategoricalAttribute = function(condition, control){
        var conditionHTML = null;
        if(condition.operator == "CONTAINS_COMMON") {
            conditionHTML = "Common values for <b>" + condition.attribute + "</b>";
        }else if (condition.operator == "CONTAINS_VALUES") {

            //var conditionHTML = "Value for <b>" + condition.attribute + "</b> is <i>" + condition.value + "</i>.";
            if (control) {
                var valuePickerId = "valuePickerFor-"+condition.id;
                var valuePickerHTML = "<select id='"+valuePickerId+"' class='selectpicker' multiple data-actions-box='true'>";
                for(var value of condition.possibleValues){
                    valuePickerHTML += "<option value='"+value+"'>"+value+"</option>";
                }
                valuePickerHTML += "</select>";

                conditionHTML = "Value for <b>" + condition.attribute + "</b> is "+valuePickerHTML+".";
            } else {
                // HP disabling controls on the left
                conditionHTML = "Value for <b>" + condition.attribute + "</b> is <u>"+condition.possibleValues.join(', ')+"</u>";
            }
        }
        return conditionHTML;
    };

    var getConditionHTMLForListAttribute = function(condition, control){
        var conditionHTML = null;
        
        if(condition.attribute == "plot_keywords"){ // dirty fix for paper
            if(condition.operator == "CONTAINS_COMMON") {
                conditionHTML = "Common topics in <b>" + "plot_summary" + "</b>";
            }else if (condition.operator == "CONTAINS_VALUES") {
                //var conditionHTML = "<b>" + condition.attribute + "</b> contains <i>" + condition.value + "</i>.";

                if (control) {
                    var valuePickerId = "valuePickerFor-"+condition.id;
                    var valuePickerHTML = "<select id='"+valuePickerId+"' class='selectpicker' multiple data-actions-box='true'>";
                    for(var value of condition.possibleValues){
                        valuePickerHTML += "<option value='"+value+"'>"+value+"</option>";
                    }
                    valuePickerHTML += "</select>";

                    conditionHTML = "Topics in <b>" + "plot_summary" + "</b> include "+valuePickerHTML+".";
                } else {
                    // HP disabling controls on the left
                    conditionHTML = "Topics in <b>" + "plot_summary" + "</b> include <u>"+condition.possibleValues.join(', ')+"</u>";
                }
            }
        }else{
            if(condition.operator == "CONTAINS_COMMON") {
                conditionHTML = "Common values for <b>" + condition.attribute + "</b>";
            }else if (condition.operator == "CONTAINS_VALUES") {
                //var conditionHTML = "<b>" + condition.attribute + "</b> contains <i>" + condition.value + "</i>.";

                if (control) {
                    var valuePickerId = "valuePickerFor-"+condition.id;
                    var valuePickerHTML = "<select id='"+valuePickerId+"' class='selectpicker' multiple data-actions-box='true'>";
                    for(var value of condition.possibleValues){
                        valuePickerHTML += "<option value='"+value+"'>"+value+"</option>";
                    }
                    valuePickerHTML += "</select>";

                    conditionHTML = "Value for <b>" + condition.attribute + "</b> is "+valuePickerHTML+".";
                } else {
                    // HP disabling controls on the left
                    conditionHTML = "Value for <b>" + condition.attribute + "</b> is <u>"+condition.possibleValues.join(', ')+"</u>";
                }
            }
        }


        return conditionHTML;
    };

})();