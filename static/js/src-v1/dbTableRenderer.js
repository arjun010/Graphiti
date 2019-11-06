/**
 * Created by arjun010 on 9/27/16.
 */
(function () {
    dbTableRenderer = {};

    dbTableRenderer.updateNodeTable = function (dataAttributes, dataPoints) {
        //console.log(dataAttributes,dataPoints)
        //var dataAttributes = Object.keys(globalVars.nodeList);
        var data = new google.visualization.DataTable();

        for(var dataAttribute of dataAttributes){
            data.addColumn('string', dataAttribute);
        }

        for(var dataPoint of dataPoints){
            var dataRow = [];
            for(var dataAttribute of dataAttributes){
                dataRow.push(dataPoint[dataAttribute].toString());
            }
            data.addRow(dataRow);
        }


        table = new google.visualization.Table(document.getElementById('nodesDbDisplay'));

        table.draw(data, {showRowNumber: false, width: '100%', height: '95%'});

    };

    dbTableRenderer.updateEdgeTable = function (dataAttributes, dataPoints) {
        //console.log(dataAttributes,dataPoints)
        //var dataAttributes = Object.keys(globalVars.nodeList);
        var data = new google.visualization.DataTable();

        for(var dataAttribute of dataAttributes){
            data.addColumn('string', dataAttribute);
        }

        for(var dataPoint of dataPoints){
            var dataRow = [];
            for(var dataAttribute of dataAttributes){
                dataRow.push(dataPoint[dataAttribute].toString());
            }
            data.addRow(dataRow);
        }


        table = new google.visualization.Table(document.getElementById('linksDbDisplay'));

        table.draw(data, {showRowNumber: false, width: '100%', height: '100%'});

    };

    dbTableRenderer.drawEmptyTable = function (columns,selectorDiv) {
        //var dataAttributes = Object.keys(globalVars.dataAttributeMap);
        //var columns = Object.keys(dataObject);
        var data = new google.visualization.DataTable();

        for(var column of columns){
            //if(globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="1"){
            //    data.addColumn('number', dataAttribute);
            //}else if(globalVars.dataAttributeMap[dataAttribute]["isCategorical"]=="1" && globalVars.dataAttributeMap[dataAttribute]["isNumeric"]=="0"){
            data.addColumn('string', column);
            //}
        }

        table = new google.visualization.Table(document.getElementById(selectorDiv));

        table.draw(data, {showRowNumber: false, width: '100%', height: '100%'});
    };
})();