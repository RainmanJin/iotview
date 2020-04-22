// 配置
mxLanguages = ['zh'];
mxLanguage = 'zh';
mxBasePath = 'lib/mxgraph/src/';
STYLE_PATH = 'lib/grapheditor/styles';
RESOURCES_PATH = 'lib/grapheditor/resources';
STENCIL_PATH = 'lib/grapheditor/stencils';
IMAGE_PATH = 'lib/grapheditor/images';
mxLoadResources = false;
OPEN_URL = '/view/open';
EXPORT_URL = '/view/export';
SAVE_URL = '/view/save';
OPEN_FORM = 'lib/grapheditor/open.html';
RESOURCES_PATH = "resources";

var urlParams = (function (url) {
    var result = new Object();
    var idx = url.lastIndexOf('?');
    if (idx > 0) {
        var params = url.substring(idx + 1).split('&');
        for (var i = 0; i < params.length; i++) {
            idx = params[i].indexOf('=');
            if (idx > 0) {
                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
            }
        }
    }
    return result;
})(window.location.href);


var loopCell = function(Graph, Do){
    var loop = function (cell) {
        Do(cell);
        var children = cell.children;
        if (children) {
            for (i = 0; i < children.length; i++) {
                loop(children[i])
            }
        }
    }
    loop(Graph.model.root);
}