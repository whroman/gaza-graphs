$(function() {

    var Templates = {
        renderPrimaryTitle: function(node) {
            var i = 0;
            var sourcesLen = node.sources.length;
            var html = node.title;

            for ( i; i < sourcesLen; i++) {
                var source = node.sources[i];
                var sourceRef = node.parent.title + "-" + source;
                html += "<a href='" + "#" + sourceRef + "' class='superscript text-green'>[" + source + "]</a>";
            }

            return html;
        },
        renderSecondary: function(node) {
            return html;
        },
        renderSource: function(source) {
            var index = source.i + 1;
            var sourceRef = source.title + "-" + index; 
            var lastUpdated = "<span> - Retrieved " + source.lastUpdated + "</span";
            var link = "<div><div class='spacer-xs'></div><a href='" + source.link + "'>" + source.link + "</a></div>";
            var html = "<li id='" + sourceRef + "'class='text-xs source'>" + "<span>[" + index + "]</span>" + lastUpdated + link + "<div class='spacer-md'></div></li>";

            return html;
        },
        renderSourcesPanel: function($panel, json) {
            var i = 0,
                sourcesLen = json.sources.length;

            for ( i; i < sourcesLen; i++) {
                var source = json.sources[i];
                source.i = i;
                source.title = json.title;
                var html = Templates.renderSource(source);

                $panel.append(html);
            }
            events.hightlightSourceByHash();
        }
    };

    var events = {
        onPathMouseover: function(d, graph) {
            graph.paths
            // Fade all fill colors
            .classed("faded", true)
            // Highlight only those that are an ancestor of the current segment
            .filter(function(node) {
                var ancestors = D3Partitions.getNodeAncestors(d, node);
                return ancestors;
            })
            .classed("faded", false);

            graph.info.update(d);
        },
        hightlightSourceByHash: function() {
            var hash = window.location.hash;
            var hightlightClass = "text-green";
            $(".source").removeClass(hightlightClass);
            if (hash) {
                $(window.location.hash).addClass(hightlightClass);
            }
        }
    };

    function InfoPanel ($wrapper) {
        var $panel = $wrapper.find("[info]"),
            $primary = $wrapper.find("[primary]"),
            $primaryTitle = $primary.find("[title]"),
            $primaryValue = $primary.find("[value]"),
            $secondary = $wrapper.find("[secondary]"),
            $secondaryTitle = $secondary.find("[title]"),
            $secondaryValue = $secondary.find("[value]"),
            classHidden = "hidden";

        function updatePrimary(node) {
            var titleHTML = Templates.renderPrimaryTitle(node);
            $primaryTitle.html(titleHTML);  
            $primaryValue.text(node.value);
        }

        function updateSecondary(node) {
            $secondary.removeClass(classHidden)
            $secondaryTitle.text(node.title)
            $secondaryValue.text(node.value)
        }

        function updateTertiary(node) {

        }
        
        function update(d) {
            if (d.depth === 1) {
                $secondary.addClass(classHidden);
                updatePrimary(d);
            } else if (d.depth === 2) {
                updatePrimary(d.parent);
                updateSecondary(d);           
            } else if (d.depth === 3 ) {
                console.log(d.parent)
                updatePrimary(d.parent.parent)
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
        var graphs = {},
            width = 650,
            height = 650,
            radius = Math.min(width, height) / 2,
            svgCenter = "translate(" + width / 2 + "," + height / 2 + ")";

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        function jsonRequestCB(error, json) {
            var key;
            if (!error) {
                key = json.title + ".json"
                renderGraph(json, graphs[key]);
                attachGraphEvents(graphs[key]);
                Templates.renderSourcesPanel(graphs[key].$sources, json);                
            }
        }

        function renderGraph(json, graph) {
            graph.paths = graph.svg.datum(json).selectAll("path")
                .data(D3Partitions.partition.nodes)
                .enter()
                .append("path");

            graph.paths
                .attr("display", function(d) {
                    return d.depth === 0 ? "none" : null; // hide inner ring
                })
                .attr("class", function(d) { 
                    if (d.depth > 1) {
                        return d.title + " depth-" + d.depth; 
                    }
                })
                .attr("d", D3Partitions.arc);

            // Load graph with one selected <path>
            var data = d3.select("path.depth-2")[0][0].__data__;
            events.onPathMouseover(data, graph);
        }

        function attachGraphEvents(graph) {
            graph.paths.on("mouseover", function(d) {
                events.onPathMouseover(d, graph);
            });  
        }

        function render() {
            var elements = $("[d3-partition-graph]"),
                i = 0,
                elementsLen = elements.length;

            for ( i; i < elementsLen; i++ ) {
                var element = d3.select(elements[i]);
                var jsonPath = element.attr("data-source");
                var svg = element.select("[graph]")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", svgCenter);
                var $sources = $("[data-source='" + jsonPath + "']")

                var graph = {
                    wrapper: element,
                    jsonPath: jsonPath,
                    svg: svg,
                    $sources: $sources,
                    info: new InfoPanel($(elements[i]))
                };

                graphs[jsonPath] = graph;

                d3.json(graph.jsonPath, function(error, json) {
                    D3Partitions.jsonRequestCB(error, json);
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


    $(window).on("hashchange", events.hightlightSourceByHash);
});