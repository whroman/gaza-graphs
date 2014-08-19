$(function() {

    var Templates = {
        renderPrimaryTitle: function(node) {
            var html = node.title + "<span class='superscript'>" + node.sources + "</span>";
            return html;
        },
        renderPrimary: function(node) {
            var html = "" +
            "<div primary>" +
                "<div class='text-lg'>" + Templates.renderPrimaryTitle(node) + "</div>" +
                "<div class='spacer-xs'></div>" +
                "<div class='text-md'> " +
                    node.value + " Total Palestinians killed" +
                "</div>" +
            "</div>";

            return html;
        },
        renderSecondary: function(node) {
            var html = "" +
                "<div secondary class='text-sm'>" +
                    "<div>Including <span>" + node.value + "</span> <span>" + node.title + "</span> deaths</div>" +
                "</div>";   
            return html;
        },
        renderSource: function(source) {
            var sourceRef = "<span>[" + (source.i + 1) + "] </span>";
            var lastUpdated = "<span> - Retrieved " + source.lastUpdated + "</span";
            var link = "<div><div class='spacer-xs'></div><a href='" + source.link + "'>" + source.link + "</a></div>";
            var html = "<li class='text-xs'>" + sourceRef + lastUpdated + link + "<div class='spacer-md'></div></li>";

            return html;
        },
        renderSourcesPanel: function($panel, sources) {
            var i = 0,
                sourcesLen = sources.length;

            for ( i; i < sourcesLen; i++) {
                var source = sources[i];
                source.i = i;
                var html = Templates.renderSource(source);

                $panel.append(html);
            }
        }
    };

    var events = {
        onPathMouseover: function(d, graph) {
            graph.paths
            // Fade all fill colors
            .classed("faded", true)
            // Highlight only those that are an ancestor of the current segment
            .filter(function(node) {
                var ancestors = D3Partitions.getNodeAncestors(node, d);
                return ancestors;
            })
            .classed("faded", false);

            graph.info.update(d);
        }
    };

    function InfoPanel ($wrapper) {
        var $panel = $wrapper.find("[info]"),
            $primary = $wrapper.find("[primary]"),
            $secondary = $wrapper.find("[secondary]"),
            classHidden = "hidden";


        function updatePrimary(node) {
            var html = Templates.renderPrimary(node);
            $primary.html(html);  
        }

        function updateSecondary(node) {
            var html = Templates.renderSecondary(node);
            $secondary
                .removeClass(classHidden)
                .html(html);
        }
        
        function update(d) {
            if (d.depth === 1) {
                $secondary.addClass(classHidden);
                updatePrimary(d);
            } else if (d.depth === 2) {
                updatePrimary(d.parent);
                updateSecondary(d);           
            }
        }

        function hide() {
            $panel.addClass(classHidden);
        }

        return {
            update: update
        };
    }

    var D3Partitions = function() {
        var width = 600,
            height = 600,
            radius = Math.min(width, height) / 2,
            svgCenter = "translate(" + width / 2 + "," + height / 2 + ")";

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        function jsonRequestCB(error, json, graph) {
            if (!error) {
                renderGraph(json, graph);
                Templates.renderSourcesPanel(graph.$sources, json.sources);                
            }
        }

        function renderGraph(json, graph) {
            graph.paths = graph.svg.datum(json).selectAll("path")
                .data(D3Partitions.partition.nodes)
                .enter()
                .append("path")
                .attr("display", function(d) {
                    return d.depth === 0 ? "none" : null; // hide inner ring
                })
                .attr("class", function(d) { 
                    return d.title; 
                })
                .attr("d", D3Partitions.arc)
                .on("mouseover", function(d) {
                    events.onPathMouseover(d, graph);
                });    
        }

        function render() {
            var elements = $("[d3-partition-graph]"),
                i = 0,
                elementsLen = elements.length;

            for ( i; i < elementsLen; i++ ) {
                var element = d3.select(elements[i]);
                var graph = {
                    wrapper: element,
                    jsonPath: element.attr("data-source"),
                    svg: element.select("[graph]")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", svgCenter),
                    $sources: $(elements[i]).find("[sources]"),
                    info: new InfoPanel($(elements[i]))
                };

                d3.json(graph.jsonPath, function(error, json) {
                    D3Partitions.jsonRequestCB(error, json, graph);
                });
            }
        }

        function getNodeAncestors(node, currentNode) {
            var ancestors = [];
            var whileNode = node;
            while (whileNode.parent) {
                ancestors.unshift(whileNode);
                whileNode = whileNode.parent;
            }
            return (ancestors.indexOf(currentNode) >= 0);
        }

        return {
            arc: arc,
            partition: partition,
            render: render,
            jsonRequestCB: jsonRequestCB,
            getNodeAncestors: getNodeAncestors
        };
    }();

    D3Partitions.render();

});