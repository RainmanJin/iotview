function baseProp(id, title, opts) {
    this.id = id;
    opts = opts ? opts : {};
    var required = opts.required ? opts.required : false;
    this.setRequired = function (Required) {
        required = Required
    }

    this.submit = function () {
        var value = this.getValue();
        if (required) {
            if (!value || value == '') {
                throw  title + " is required!";
            }
        }
        if (opts.type && opts.type == 'base64') {
            value = Base64.encode(value);
        }
        return value;
    }

    opts.default = opts.default ? opts.default : '';
    opts.className = opts.className ? opts.className : '';
    this.init = function (view, container, index) {
        if (index == 0) {
            opts.className += ' input-box-0';
        }
        var div = document.createElement("div");
        div.className = "input-row";

        var value = view.getValue(id, null);
        if (value && opts.type && opts.type == 'base64') {
            value = Base64.decode(value);
        }
        if (!value) {
            value = opts.default;
        }

        this.create(div, value, title, opts);
        if (opts.help) {
            div.innerHTML += '<a href="/resources/help_zh.html#' + opts.help + '" target="_blank"  class="help_link">?</a>';
        }
        container.appendChild(div);
    }
}

baseProp.prototype.create = function (div, value, title, opts) {
}

baseProp.prototype.getValue = function () {
    var element = document.getElementById(this.id);
    switch (element.type.toLowerCase()) {
        case 'submit':
        case 'hidden':
        case 'password':
        case 'text':
        case 'textarea':
        case 'select-one':
            return element.value;
        case 'checkbox':
        case 'radio':
            return element.checked;
    }
}

// input
function inputProp(id, title, help, className) {
    baseProp.call(this, id, title, help, className);
}

inputProp.prototype = Object.create(baseProp.prototype);

inputProp.prototype.create = function (div, value, title, opts) {
    var html =
        '<div class="input-box ' + opts.className + '">' +
        '  <div class="input-span">' + title + '</div>' +
        '  <input id="' + this.id + '" type="text" placeholder="请输入' + title + '" value="' + value + '" />' +
        '</div>';
    div.innerHTML = html;
}

// checkBox
function checkBoxProp(id, title, opts) {
    baseProp.call(this, id, title, opts);
}

checkBoxProp.prototype = Object.create(baseProp.prototype);

checkBoxProp.prototype.create = function (div, value, title, opts) {
    value = value == 'true' ? 'checked=checked' : '';
    var html =
        '<div class="input-box ' + opts.className + '">' +
        '  <div class="input-span">' + title + '</div>' +
        '  <input class="input-check" id="' + this.id + '" type="checkbox" ' + value + ' />' +
        '</div>';
    div.innerHTML = html;
}


// textarea
function textareaProp(id, title, rows, opts) {
    this.rows = rows;
    baseProp.call(this, id, title, opts);
}

textareaProp.prototype = Object.create(baseProp.prototype);

textareaProp.prototype.create = function (div, value, title, opts) {
    var html =
        '<div class="input-box ' + opts.className + '">' +
        '  <div style="border-width: 0px;width:100%; padding-top:8px; padding-bottom:8px;" class="input-span">' + title + '</div>' +
        '  <div style="padding:10px 15px 10px 10px;">' +
        '    <textarea  rows="' + this.rows + '" id="' + this.id + '" placeholder="请输入' + title + '">' + value + '</textarea>' +
        '  </div>' +
        '</div>';
    div.innerHTML = html;
}


//select

function selectProp(id, title, opts) {
    baseProp.call(this, id, title, opts);
}

selectProp.prototype = Object.create(baseProp.prototype);


selectProp.prototype.create = function (div, value, title, opts) {
    var items = opts.items;
    var html =
        '<div class="input-box ' + opts.className + '">' +
        '  <div class="input-span">' + title + '</div>' +
        '  <select id="' + this.id + '">';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var selected = value == item.value ? "selected" : "";
        html += '<option value="' + item.value + '" ' + selected + '>' + item.title + '</option>';
    }
    html +=
        '  </select>' +
        '</div>';
    div.innerHTML = html;
}


// 属性展示面板渲染器

var propRender = {

    views: new Object(),
    register: function (Type, Class) {
        this.views[Type] = Class;
    },

    getPropView: function (graph, cell) {
        var container = document.getElementById('propBox');
        var state = graph.view.getState(cell);
        var PropView = this.views[state.style.shape];
        if (!PropView) {
            PropView = this.views['default'];
        }
        return new PropView(container, graph, cell);
    },

    init: function (graph) {
        var form = document.getElementById('propForm');
        var cells = graph.getSelectionCells();
        if (cells != null && cells.length > 0) {
            var cell = cells[0];
            var prop = this.getPropView(graph, cell);
            form.onsubmit = function () {
                try {
                    prop.onSubmit();
                    window.parent.openFile.setData(cell);
                    return true;
                } catch (Err) {
                    mxUtils.alert("Error: " + Err);
                    return false
                }
            }
        }
    }
}

// 属性展示面板

function BasePropView(container, graph, cell) {
    this.graph = graph;
    this.state = graph.view.getState(cell);
    this.required = this.required ? this.required : [];

    var baseProps = [
        {
            title: "基本属性",
            items: [
                new inputProp(mxConstants.STYLE_ID, "ID")
            ]
        }
    ];
    this.initProp();
    if (this.props) {
        this.props = baseProps.concat(this.props);
    } else {
        this.props = baseProps
    }

    for (var i = 0; i < this.props.length; i++) {
        var prop = this.props[i];
        var subtitle = document.createElement("div");
        subtitle.className = "subtitle";
        subtitle.innerHTML = prop.title;
        container.appendChild(subtitle);
        for (var idx = 0; idx < prop.items.length; idx++) {
            var item = prop.items[idx];
            if (this.required.indexOf(item.id) >= 0) {
                item.setRequired(true);
            }
            item.init(this, container, idx);
        }
    }
}

BasePropView.prototype.initProp = function () {

}

BasePropView.prototype.getValue = function (id, defaultValue) {
    return mxUtils.getValue(this.state.style, id, defaultValue);
}

BasePropView.prototype.save = function (id, value, cells) {
    this.graph.setCellStyles(id, value, cells);
}

BasePropView.prototype.onSubmit = function () {
    for (var i = 0; i < this.props.length; i++) {
        var props = this.props[i];
        for (var j = 0; j < props.items.length; j++) {
            var prop = props.items[j];
            var value = prop.submit();
            var cells = this.graph.getSelectionCells();

            // 对于选择多个cell，设置ID时，只能设置最后一个
            if (prop.id == mxConstants.STYLE_ID && value && value.length > 0) {
                var self = this;
                var currentCell = cells[cells.length - 1];
                loopCell(self.graph, function (cell) {
                    if (cell.id != currentCell.id) {
                        var state = self.graph.view.getState(cell);
                        var id = mxUtils.getValue(state.style, mxConstants.STYLE_ID, null);
                        if (id && id == value) {
                            throw 'ID ' + value + ' is duplicate!'
                        }
                    }
                });
                cells = [currentCell];
            }
            this.save(prop.id, value, cells);
        }
    }
}

function MqttPropView(container, graph, cell) {
    this.required = [
        mxConstants.STYLE_ID,
        mxConstants.STYLE_MQTT_HOST,
        mxConstants.STYLE_MQTT_PORT
    ];
    BasePropView.call(this, container, graph, cell);
}

MqttPropView.prototype = Object.create(BasePropView.prototype);

propRender.register('mqtt', MqttPropView);

MqttPropView.prototype.initProp = function () {
    this.props = [
        {
            title: "MQTT参数",
            items: [
                new inputProp(mxConstants.STYLE_MQTT_HOST, "服务器地址", {help: "mqtt", default: "127.0.0.1"}),
                new inputProp(mxConstants.STYLE_MQTT_PORT, "端口", {help: "mqtt", default: "8083"}),
                new inputProp(mxConstants.STYLE_MQTT_USERNAME, "用户名", {help: "mqtt"}),
                new inputProp(mxConstants.STYLE_MQTT_PASSWORD, "密码", {help: "mqtt"}),
                new inputProp(mxConstants.STYLE_MQTT_KEEPALIVE, "心跳", {help: "mqtt", default: "60"}),
                new inputProp(mxConstants.STYLE_MQTT_TIMEOUT, "超时", {help: "mqtt", default: "10"}),
                new checkBoxProp(mxConstants.STYLE_MQTT_SSL, "SSL", {help: "mqtt", default: "false"}),
                new checkBoxProp(mxConstants.STYLE_MQTT_SESSION, "清除会话", {help: "mqtt", default: "true"}),
                new inputProp(mxConstants.STYLE_MQTT_TOPICS, "订阅主题", {help: "mqtt"})
            ]
        },
        {
            title: "连接/断开图形",
            items: [
                new checkBoxProp(mxConstants.STYLE_VISIBLE, "是否可见", {help: "mqtt", default: "true"}),
                new inputProp(mxConstants.STYLE_MQTT_OFFIMG, "未连接", {help: "mqtt", default: "/shapes/1/20.png"}),
                new inputProp(mxConstants.STYLE_MQTT_ONIMG, "已连接", {help: "mqtt", default: "/shapes/1/14.png"})
            ]
        },
        {
            title: "事件",
            items: [
                new textareaProp(mxConstants.STYLE_FORMAT, "消息格式化", 10, {
                    type: "base64",
                    help: "doFormat",
                    default: doFormat.toString()
                })
            ]
        }
    ];
}


// 显示控件
function ShapePropView(container, graph, cell) {
    BasePropView.call(this, container, graph, cell);
}

ShapePropView.prototype = Object.create(BasePropView.prototype);

propRender.register('default', ShapePropView);


ShapePropView.prototype.initProp = function () {
    var dataSource = [{title: 'NONE', value: ''}];
    var Graph = this.graph;
    loopCell(Graph, function (cell) {
        var state = Graph.view.getState(cell);
        var id = mxUtils.getValue(state.style, mxConstants.STYLE_ID, null);
        if (id && state.shape.type == 'dataSource') {
            dataSource.push({
                title: '[' + state.style.shape.toUpperCase() + '] ' + id,
                value: id
            });
        }
    });
    this.props = [
        {
            title: "数据绑定",
            items: [
                new selectProp(mxConstants.STYLE_DATASOURCE, "数据源", {items: dataSource, help: "dataSource"}),
                new textareaProp(mxConstants.STYLE_ONMSGARRIVED, "消息处理", 10, {
                    type: "base64",
                    help: "onMsgArrived",
                    default: doMsg.toString()
                }),
                new textareaProp(mxConstants.STYLE_ONCLICK, "单击事件", 10, {
                    type: "base64",
                    help: "onClick",
                    default: doClick.toString()
                })
            ]
        }
    ];
}


// 显示定时器控件
function TimerPropView(container, graph, cell) {
    this.required = [
        mxConstants.STYLE_ID,
        mxConstants.STYLE_TIMER_FREQ
    ];
    BasePropView.call(this, container, graph, cell);
}

TimerPropView.prototype = Object.create(BasePropView.prototype);

propRender.register('timer', TimerPropView);

TimerPropView.prototype.initProp = function () {
    this.props = [
        {
            title: "高级配置",
            items: [
                new checkBoxProp(mxConstants.STYLE_VISIBLE, "是否可见", {help: "visible", default: "true"}),
                new inputProp(mxConstants.STYLE_TIMER_FREQ, "周期", {help: "timer", default: "1000"})
            ]
        }
    ];
}


// echartjs控件
function echartPropView(container, graph, cell) {
    this.required = [
        mxConstants.STYLE_ID,
        mxConstants.STYLE_TIMER_FREQ
    ];
    ShapePropView.call(this, container, graph, cell);
}

echartPropView.prototype = Object.create(ShapePropView.prototype);

propRender.register('echartBox', echartPropView);

echartPropView.prototype.initProp = function () {

    ShapePropView.prototype.initProp.apply(this, arguments);

    this.props = this.props.concat([
        {
            title: "EChart配置",
            items: [
                new checkBoxProp(mxConstants.STYLE_ECHART_GL, "是否引入GL", {help: "echart-gl", default: "true"}),
                new textareaProp(mxConstants.STYLE_ECHART_SCRIPT, "脚本", 10, {
                    type: "base64",
                    help: "echart/script",
                    default: ''
                })
            ]
        }
    ]);
}



