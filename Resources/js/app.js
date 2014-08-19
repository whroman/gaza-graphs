$(function() {
    var $window = $(window),
        sources = [],
        width = 600,
        height = 600,
        radius = Math.min(width, height) / 2,
        paths,
        svg,
        partition,
        arc;

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

    var events = {
        pathMouseover: function(d) {
            var sequenceArray = getAncestors(d);

            paths
            // Fade all fill colors
            .classed("faded", true)
            // Highlight only those that are an ancestor of the current segment
            .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
            })
            .classed("faded", false);

            info.update(d);
        }
    };

    $window.resize(function() {
        svg.attr("transform", centerSVG);
    });

    renderD3Partitions();

    function renderD3Partitions() {
        var elements = $("[d3-partition-graph]"),
            i = 0,
            elementsLen = elements.length;

        for ( i; i < elementsLen; i++ ) {
            var element = d3.select(elements[i]),
                jsonToLoad = element.attr("data-source");

            svg = element.append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", centerSVG);

            partition = d3.layout.partition()
                .sort(null)
                .size([2 * Math.PI, radius * radius])
                .value(function(d) { return d.value; })
                .children(function(d) {return d.figures; });

            arc = d3.svg.arc()
                .startAngle(function(d) { return d.x; })
                .endAngle(function(d) { return d.x + d.dx; })
                .innerRadius(function(d) { return Math.sqrt(d.y); })
                .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

            d3.json(jsonToLoad, onLoadSuccess);
        }
    }

    function centerSVG() {
        var translate =  "translate(" + width / 2 + "," + height / 2 + ")";
        return translate;
    }

    function getAncestors(node) {
        var path = [];
        var current = node;
        while (current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }

    function onLoadSuccess(error, data) {
        var nodeIndex = 1;
        paths = svg.datum(data).selectAll("path")
            .data(partition.nodes)
            .enter()
            .append("path")
            .attr("display", function(d) {
                return d.depth === 0 ? "none" : null; // hide inner ring
            })
            .attr("class", function(d) { 
                return d.title.toLowerCase(); 
            })
            .attr("d", arc)
            .style("z-index", function(d) {
                return d.depth;
            })
            .style("stroke", "#fff")
            .on("mouseover", events.pathMouseover);

        renderSourcesPanel(".sources[for='casualties']", data.sources);
    }

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

});