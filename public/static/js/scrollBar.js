$('head').append('<script src="static/EasyUI151/jquery.nicescroll.min.js"></script>');

function tableRoll(node, color, width) {
    $(document).ready(
        function() {
            node.niceScroll({cursorcolor: color,
                cursorwidth: width});
        }
    );
}
function tableRollInit(node, color, width) {
    tableRoll(node, color, width)
    $(window).resize(function () {
        tableRoll(node, color, width)
    });
}