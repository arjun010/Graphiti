/**
 * Created by arjun010 on 11/7/16.
 */
(function(){

    Action = function(type) {
        this.timestamp = new Date();
        this.type = type;
        this.params = {};
    };

    Action.prototype.addParamObj = function(param, obj){
        this.params[param] = obj;
    }

})();