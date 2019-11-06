/**
 * Created by arjun010 on 9/21/16.
 */
(function () {

    utils = {};

    utils.sortObj = function (list, key, order) {
        order = typeof order !== 'undefined' ? order : 'a';
        function compare(a, b) {
            a = a[key];
            b = b[key];
            var type = (typeof(a) === 'string' || typeof(b) === 'string') ? 'string' : 'number';
            var result;
            if (type === 'string') {
                if (key == 'startDate' || key == 'endDate') {
                    a = new Date(a).getTime();
                    b = new Date(b).getTime();
                    if (order == 'a') {
                        result = a - b;
                    } else if (order == 'd') {
                        result = b - a;
                    }
                    //if(order=='a'){
                    //    result = a < b;
                    //}else if(order=='d'){
                    //    result = a > b;
                    //}
                } else {
                    if (order == 'a') {
                        result = a.localeCompare(b);
                    } else if (order == 'd') {
                        result = b.localeCompare(a);
                    }
                }
            } else {
                if (order == 'a') {
                    result = a - b;
                } else if (order == 'd') {
                    result = b - a;
                }
            }
            return result;
        }

        return list.sort(compare);
    };

    utils.isDirectedEdge = function(sourceId,targetId){
        //if((targetId in globalVars.edgeMap[sourceId]) && (sourceId in globalVars.edgeMap[targetId])){
        //    return -1;
        //}
        if(sourceId in globalVars.edgeMap){
            if(targetId in globalVars.edgeMap[sourceId]){
                if(targetId in globalVars.edgeMap){
                    if(sourceId in globalVars.edgeMap[targetId]){
                        return -1;
                    }
                }
            }
        }else if(targetId in globalVars.edgeMap){
            if(sourceId in globalVars.edgeMap[targetId]){
                if(sourceId in globalVars.edgeMap){
                    if(targetId in globalVars.edgeMap[sourceId]){
                        return -1;
                    }
                }
            }
        }
        return 1;
    };

    utils.clone = function(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] =  utils.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] =  utils.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    utils.getIndexInList = function(item, list, key){
        for(var index in list){
            var listItem = list[index];
            if(item[key]==listItem[key]){
                return index;
            }
        }
        return -1;
    }

})();