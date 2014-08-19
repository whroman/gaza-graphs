$(function() {
    var info = {
        $panel: $("#info"),
        $secondary: $("#secondary"),
        $org: $("#org"),
        $totalDead: $("#total-dead"),
        $type: $("#type"),
        $typeDead: $("#type-dead"),
        classHidden: "hidden",
        updatePrimary: function(node) {
            info.$org.html(node.title + "<span class='superscript'>" + node.sources + "</span>");
            info.$totalDead.text(node.value);   
        },
        update: function(d) {
            info.$panel.removeClass(info.classHidden);

            if (d.depth === 1) {
                info.$secondary.addClass(info.classHidden);
                info.updatePrimary(d);
            } else if (d.depth === 2) {
                info.updatePrimary(d.parent);
                info.$secondary.removeClass(info.classHidden);
                info.$type.text(d.title);
                info.$typeDead.text(d.value);              
            }
        },
        hide: function() {
            info.$panel.addClass(info.classHidden);
        }
    };

    var d3ui = {
        onPathMouseover: function(d, paths) {

            paths
            // Fade all fill colors
            .classed("faded", true)
            // Highlight only those that are an ancestor of the current segment
            .filter(function(node) {
                var ancestors = d3ui.getAncestors(node, d);
                return ancestors;
            })
            .classed("faded", false);

            info.update(d);
        },
        getAncestors: function(node, currentNode) {
            var ancestors = [];
            var whileNode = node;
            while (whileNode.parent) {
                ancestors.unshift(whileNode);
                whileNode = whileNode.parent;
            }
            return (ancestors.indexOf(currentNode) >= 0);
        },

    };




    var d3Partitions = function() {
        var width = 600,
            height = 600,
            radius = Math.min(width, height) / 2,
            svgTranslateToCenter = "translate(" + width / 2 + "," + height / 2 + ")";

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        function jsonRequestCB(error, json) {
            var paths = svg.datum(json).selectAll("path")
                .data(d3Partitions.partition.nodes)
                .enter()
                .append("path")
                .attr("display", function(d) {
                    return d.depth === 0 ? "none" : null; // hide inner ring
                })
                .attr("class", function(d) { 
                    return d.title; 
                })
                .attr("d", d3Partitions.arc)
                .on("mouseover", function(d) {
                    d3ui.onPathMouseover(d, paths);
                });

            renderSourcesPanel(".sources[for='casualties']", json.sources);
        }

        function render() {
            var elements = $("[d3-partition-graph]"),
                i = 0,
                elementsLen = elements.length;

            for ( i; i < elementsLen; i++ ) {
                var element = d3.select(elements[i]),
                    jsonPath = element.attr("data-source");

                svg = element.append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", d3Partitions.centerSVG);


                d3.json(jsonPath, d3Partitions.jsonRequestCB);
            }
        }

        function centerSVG() {
            var translate =  "translate(" + width / 2 + "," + height / 2 + ")";
            return translate;
        }

        return {
            arc: arc,
            partition: partition,
            render: render,
            centerSVG: centerSVG,
            jsonRequestCB: jsonRequestCB
        };
    }();

    function renderSourcesPanel(sel, sources) {
        var $panel = $(sel),
            i = 0,
            sourcesLen = sources.length;

        for ( i; i < sourcesLen; i++) {
            var source = sources[i],
                sourceRef = "<span>[" + (i + 1) + "] </span>",
                lastUpdated = "<span> - Retrieved " + source.lastUpdated + "</span",
                link = "<div><div class='spacer-xs'></div><a href='" + source.link + "'>" + source.link + "</a></div>";

            $panel.append("<li class='text-xs'>" + sourceRef + lastUpdated + link + "<div class='spacer-md'></div></li>");
        }
    }

    d3Partitions.render();

});