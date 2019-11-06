/**
 * Created by arjun010 on 11/29/16.
 */
(function () {
    graphRenderer = {};

    function zoomer(){
        viewContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        // d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        d.x = d3.event.x;
        d.y = d3.event.y;
    }

    function dragended(d) {
        //d.fixed = true;
        d3.select(this).classed("dragging", false);
    }

    var svg,width,height,force,link,node,viewContainer,xScale,yScale,viewZoom,myDrag,edgeStrokeScale;

    graphRenderer.draw = function(graph, graphDiv){
        d3.select("#"+graphDiv).selectAll("svg").remove();

        edgeStrokeScale = d3.scale.linear().domain([graph.minEdgeWeight,graph.maxEdgeWeight]).range([1,4]);

        width = $("#"+graphDiv).width();
        height = 600;

        xScale = d3.scale.linear()
            .domain([0, width]).range([0, width]);
        yScale = d3.scale.linear()
            .domain([0, height]).range([0, height]);

        viewZoom = d3.behavior.zoom()
            .scaleExtent([0.2, 10])
            .x(xScale)
            .y(yScale)
            .on("zoom", zoomer);

        svg = d3.select("#"+graphDiv).append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(viewZoom).on("dblclick.zoom", null);

        viewContainer = svg.append("g");

        force = d3.layout.force()
            .gravity(0.05)
            .distance(100)
            .charge(-100)
            .size([width, height]);

        myDrag = force.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        force.nodes(graph.nodes)
            .links(graph.links)
            .start();

        link = viewContainer.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width",function(d){
                return edgeStrokeScale(d.weight);
            });

        node = viewContainer.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(myDrag);

        node.append("circle")
            .attr("r",5);

        node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.Name });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
    };

})();