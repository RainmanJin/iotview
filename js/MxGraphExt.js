//扩展改造,动态加载自己的图形
// 郑伟星


var OpenDialog2 = function (Src) {
    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('src', Src);
    this.container = iframe;
};


// 扩展图库
var url = "shapes/mxGraph.json";

// 官方的没有加shape=
Sidebar.prototype.addImagePalette = function (id, title, prefix, postfix, items, titles, tags) {
    var fns = [];
    for (var i = 0; i < items.length; i++) {
        (mxUtils.bind(this, function (item, title, tmpTags) {
            if (tmpTags == null) {
                var slash = item.lastIndexOf('/');
                var dot = item.lastIndexOf('.');
                tmpTags = item.substring((slash >= 0) ? slash + 1 : 0, (dot >= 0) ? dot : item.length).replace(/[-_]/g, ' ');
            }
            fns.push(this.createVertexTemplateEntry(
                'shape=image;html=1;labelBackgroundColor=#ffffff;image=' + prefix + item + postfix,
                this.defaultImageWidth,
                this.defaultImageHeight,
                '',            // value
                title,         // title
                title != null, // showLabel
                null,          // showTitle
                this.filterTags(tmpTags)
            ));
        }))(items[i], (titles != null) ? titles[i] : null, (tags != null) ? tags[items[i]] : null);
    }
    this.addPaletteFunctions(id, title, false, fns);
};


// 扩展图形
Sidebar.prototype.addExtShapes = function () {

    var fns =[
        this.createEdgeTemplateEntry('shape=animConnector;html=1;', 50, 50, '', 'animation Connector', null, 'animation directional'),
        this.createVertexTemplateEntry('shape=dateTimeText;html=1', 120, 60, '', 'dateTimeText', null, null, 'datetime text'),
        this.createVertexTemplateEntry('shape=echartBox;html=1;strokeColor=#c0c0c0;fillColor=#ffffff;overflow=fill;rounded=0;', 280, 160, 'EChart', 'EChart')
    ];
    this.addPaletteFunctions('extShapes', '扩展图形', false, fns);

    var style = 'html=1;image=lib/grapheditor/stencils/clipart/Gear_128x128.png;fontColor=none;align=center;fontStyle=1;labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top;';
    var fns = [
        this.createVertexTemplateEntry('shape=timer;' + style, this.defaultImageWidth, this.defaultImageHeight, 'Timer', "Timer Adapter", true, null, null),
        this.createVertexTemplateEntry('shape=mqtt;' + style, this.defaultImageWidth, this.defaultImageHeight, 'MQTT', "MQTT Adapter", true, null, null)
    ];
    this.addPaletteFunctions('Adapter', '适配器', false, fns);
}

//扩展其它图形
Sidebar.prototype.addImageShapes = function () {
    var shapes = JSON.parse(mxUtils.load(url).request.responseText);
    function foreach(files) {
        var tags = [];
        var paths = [];
        var titles = [];
        for (i = 0; i < files.length; i++) {
            var File = files[i];
            paths.push(File.path);
            titles.push(File.title);
            tags[File.path] = File.title
        }
        return {
            paths: paths,
            tags: tags,
            titles: titles
        };
    }

    for (j = 0; j < shapes.length; j++) {
        var item = shapes[j];
        var title = item.title;
        var label = mxResources.get(title) ? mxResources.get(title) : title;
        var Files = foreach(item.files);
        this.addImagePalette(title, label, '', '', Files.paths, Files.titles, Files.tags);
    }
}

Sidebar.prototype.oldInit = Sidebar.prototype.init;
Sidebar.prototype.init = function () {
    this.oldInit();
    this.addExtShapes();
    this.addImageShapes();
}


// 动作扩展
Actions.prototype.oldInit = Actions.prototype.init;
Actions.prototype.init = function () {

    this.oldInit();

    var ui = this.editorUi;
    var editor = ui.editor;
    var graph = editor.graph;
    this.addAction('Preview', function () {
        var view = mxUtils.getPrettyXml(editor.getGraphXml());
        graph.openLink('viewer.html?xml=' + Base64.encode(view));
    });


    this.put('about', new Action(mxResources.get('about'), function () {
        ui.showDialog(new OpenDialog2(RESOURCES_PATH + "/about_" + mxClient.language + ".html").container, 350, 300, true, true, function () {
        }, undefined, undefined, undefined, true);
    }));

};

// 菜单扩展
Menus.prototype.oldInit = Menus.prototype.init;
Menus.prototype.init = function () {
    this.oldInit();
    this.put('file', new Menu(mxUtils.bind(this, function (menu, parent) {
        this.addMenuItems(menu, ['Preview', 'new', 'open', '-', 'save', 'saveAs', '-', 'import', 'export', '-', 'pageSetup', 'print'], parent);
    })));
}


// 扩展format
TextFormatPanel.prototype.oldInit = TextFormatPanel.prototype.init
TextFormatPanel.prototype.init = function () {

    this.oldInit();

    // 增加Shape数据绑定, 选择一个时显示
    var ui = this.editorUi;
    if (ui.editor.graph.getSelectionCount() == 1) {

        var graph = this.editorUi.editor.graph;
        var title = mxResources.get('advanced');
        title = title ? title : 'Advanced';
        var btn = mxUtils.button(title, mxUtils.bind(this, function (evt) {
            window.openNew = false;
            window.graph = graph;
            window.openFile = new OpenFile(mxUtils.bind(this, function () {
                ui.hideDialog();
            }));
            window.openFile.setConsumer(mxUtils.bind(this, function (cells) {
                // console.log(cells);
            }));
            ui.showDialog(new OpenDialog2("bind.html").container, 650, 500, true, true, function () {
                window.openFile = null;
                window.graph = null;
            }, undefined, undefined, undefined, true);
        }));

        btn.style.width = '202px';
        btn.style.marginBottom = '2px';
        var div = this.createPanel();
        div.appendChild(btn);
        this.container.appendChild(div);
    }
}








