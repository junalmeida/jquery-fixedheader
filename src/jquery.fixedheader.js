/*
* jQuery Plugin: Fix Table Headers
*
* Copyright (c) 2012 Marcos Almeida Jr. (http://about.me/junalmeida)
* Licensed jointly under the GPL and MIT licenses,
* choose which one suits your project best!
* 
*/

(function ($) {
    var DEFAULT_SETTINGS =
    {
        classes:
        {
            cloneTable: "ui-clonetable"
        }
    };

    var methods = {
        init: function (options) {
            var i = 1;
            return this.each(function () {
                var settings = $.extend({}, DEFAULT_SETTINGS, options || {});
                settings.eventKey = ".FixedHeader_" + i.toString();
                if ($(this).data("fixedHeaderObject") == null)
                    $(this).data("fixedHeaderObject", new $.FixedHeader(this, settings));
                i++;
            });
        }
    };

    // Expose the .fixedHeader function to jQuery as a plugin
    $.fn.fixedHeader = function (method) {
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    $.FixedHeader = function (table, settings) {
        table = $(table);
        var thead = table.find("thead");
        if (thead.length == 0)
            thead = table.find("th").parents("tr");

        var newTable = $("<table></table>")
            .hide()
            .append(thead.clone())
            .attr("class", table.attr("class"))
            .addClass(settings.classes.cloneTable);
        table.after(newTable);

        var parentTag = table.offsetParent();
        if (parentTag.get(0) == $("body").get(0)) {
            //lets bind to window scroll and resize
            $(window)
                .bind("scroll" + settings.eventKey, ResizeAndScroll)
                .bind("resize" + settings.eventKey, ResizeAndScroll);
        }
        else {
            //lets bind to parent div scroll and resize
            $(parentTag)
                .bind("scroll" + settings.eventKey, ResizeAndScroll)
                .bind("resize" + settings.eventKey, ResizeAndScroll);

            //if (!$.browser.msie) //only ie fires resize for divs.
            $(window).bind("resize" + settings.eventKey, WindowResize);

        }

        var lastOffset = newTable.height() * 2;
        var animeTimeout = null;

        var parentTagResize = null;
        function WindowResize() {
            ResizeAndScroll.call(parentTag.get(0));
        }

        function ResizeAndScroll() {
            var offset = $(this).offset() || { left: 0, top: 0 };
            if (offset.left > 0)
                offset.left = offset.left + Math.ceil((parentTag.outerWidth() - parentTag.width()) /2);
            var scrollTop = $(this).scrollTop();

            var tableTop = table.position().top - scrollTop;
            var totalHeight = table.height() + table.position().top + (this != window ? scrollTop : 0) - lastOffset;

            if (animeTimeout)
                clearTimeout(animeTimeout);
            newTable.hide();
            if (tableTop >= 0) //50 pixels to get near the last row
                newTable.hide();
            else {
                var newTableTop = scrollTop > totalHeight ? totalHeight : scrollTop;
                animeTimeout = setTimeout(function () {
                    newTable.css({
                        position: "absolute",
                        top: newTableTop - table.height(),
                        left: table.offset().left - offset.left - (table.outerWidth() - table.width()),
                        width: table.width()
                    }).show();
                    newTable.animate({
                        top: newTableTop
                    }, "slow");
                }, 500);
            }
        }
    };

} (jQuery));