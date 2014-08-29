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
        var i = 0;
        var sourcesLen = json.sources.length;

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
        // Remove text color from all sources
        $(".source").removeClass(hightlightClass);

        // If `hash` exists, highlight corresponding element
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
        $secondary.removeClass(classHidden);
        $secondaryTitle.text(node.title);
        $secondaryValue.text(node.value);
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

    function renderGraph(graph) {
        // Render <path> els
        graph.paths = graph.svg.datum(graph.json).selectAll("path")
            .data(D3Partitions.partition.nodes)
            .enter()
            .append("path");

        // Style <path> els
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

        // Load graph with one highlighted <path>
        var path = graph.wrapper.select("path.depth-2");
        var data = path[0][0].__data__;
        events.onPathMouseover(data, graph);
    }

    function attachGraphEvents(graph) {
        graph.paths.on("mouseover", function(data) {
            events.onPathMouseover(data, graph);
        });  

        return this;
    }

    function render(sel) {
        var elements = $(sel),
            i = 0,
            elementsLen = elements.length;

        for ( i; i < elementsLen; i++ ) {
            var el = elements[i];
            var graph = createGraphObject(el);

            D3Partitions.graphs[graph.jsonPath] = graph;

            $.getJSON(graph.jsonPath)
            .success(jsonRequestCB);
        }
        return this;
    }

    function createGraphObject(el) {
        var $el = $(el);
        var wrapper = d3.select(el);
        var jsonPath = wrapper.attr("data-source");
        var $sources = $("[data-source='" + jsonPath + "']");
        var svg = wrapper.select("[graph]")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", svgCenter);

        var graph = {
            wrapper: wrapper,
            json: null, // To be filled by AJAX request
            jsonPath: jsonPath,
            svg: svg,
            $sources: $sources,
            info: new InfoPanel($el)
        };

        return graph;
    }

    function jsonRequestCB(json) {
        var key = this.url;
        var graph = D3Partitions.graphs[key];
        graph.json = json;
        renderGraph(graph);
        attachGraphEvents(graph);
        Templates.renderSourcesPanel(graph.$sources, graph.json);
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
        graphs: graphs,
        arc: arc,
        partition: partition,
        render: render,
        jsonRequestCB: jsonRequestCB,
        getNodeAncestors: getNodeAncestors
    };
}();

D3Partitions.render("[d3-partition-graph]");

$(window).on("hashchange", events.hightlightSourceByHash);

});