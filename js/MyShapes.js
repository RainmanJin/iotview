function getScript(Paths, callback){
    var Load = function (Idx) {
        var path = Paths[Idx];
        $.getScript(path, function () {
            if(Paths.length > Idx + 1){
                Load(Idx + 1)
            }else{
                callback()
            }
        });
    }
    Load(0);
}


// 自定义图形

// 流动箭头

function animConnector(points, stroke, strokewidth) {
    mxConnector.call(this, points, stroke, strokewidth);
}

mxUtils.extend(animConnector, mxConnector);

mxCellRenderer.registerShape('animConnector', animConnector);

animConnector.prototype.paintEdgeShape = function (c, pts) {

    mxConnector.prototype.paintEdgeShape.apply(this, arguments);

    var path0 = this.node.getElementsByTagName('path')[0];
    var path1 = this.node.getElementsByTagName('path')[1];
    path0.removeAttribute('visibility');
    path0.setAttribute('stroke-width', '6');
    path0.setAttribute('stroke', 'lightGray');
    path1.setAttribute('class', 'flow');

}

// 时间显示控件

function dateTimeText(bounds, fill, stroke, strokewidth) {
    mxRectangleShape.call(this, bounds, fill, stroke, strokewidth);
}

mxUtils.extend(dateTimeText, mxRectangleShape);

mxCellRenderer.registerShape('dateTimeText', dateTimeText);

dateTimeText.prototype.init = function (container) {

    mxRectangleShape.prototype.init.apply(this, arguments);

    var graph = this.state.view.graph;
    var cell = this.state.cell;
    cell.setValue(graph.formatDate(new Date(), "yyyy-mm-dd HH:MM:ss"));
    if (cell.isLoad !== true) {
        cell.isLoad = true;
        cell.timer = setInterval(function () {
            graph.refresh(cell);
        }, 1000);
    }
}


// echartjs控件

function echartBox(bounds, fill, stroke, strokewidth) {
    mxRectangleShape.call(this, bounds, fill, stroke, strokewidth);
}

mxUtils.extend(echartBox, mxRectangleShape);

mxCellRenderer.registerShape('echartBox', echartBox);


echartBox.prototype.init = function (container) {

    mxRectangleShape.prototype.init.apply(this, arguments);

    var adapter = this.state.cell.adapter;
    if(adapter){

        var id = 'chart_' + mxUtils.getValue(this.style, mxConstants.STYLE_ID, new Date().getTime());
        this.state.cell.setValue('<div id="' + id + '"></div>');

        var box = document.createElement('div');
        box.style.width = this.state.width + 'px';
        box.style.height = this.state.height + 'px';
        adapter.box = box;

        var self = this;

        var scripts = ["lib/echarts/echarts.min.js"];
        if(mxUtils.getValue(self.style, mxConstants.STYLE_ECHART_GL, false)){
            scripts.push("lib/echarts/echarts-gl.min.js");
        }
        getScript(scripts,function () {

            var chart = echarts.init(box);
            adapter.chart = chart;
            var timer = setInterval(function () {
                var main = document.getElementById(id);
                if (main) {
                    clearInterval(timer);
                    main.appendChild(box);
                }
            }, 1);
            self.run();

        });
    }
}

echartBox.prototype.run = function () {
    var code = mxUtils.getValue(this.style, mxConstants.STYLE_ECHART_SCRIPT, null);
    if (code) {
        code = Base64.decode(code);
        var adapter = this.state.cell.adapter;
        eval(code);
    }
}


// 适配器控件
function dataShape() {
    this.type = 'dataSource';
    mxImageShape.call(this);
}

mxUtils.extend(dataShape, mxImageShape);


var adapters = new Object();

function registerAdapter(Type, Class) {
    adapters[Type] = Class
}


// 基础控件
function BaseAdapter(graph, cell) {

    this.graph = graph;
    this.cell = cell;
    this.id = this.getStyle(mxConstants.STYLE_ID, null);

    // 消息接收函数
    var code = this.getStyle(mxConstants.STYLE_ONMSGARRIVED, '');
    if (code.length > 0) {
        code = Base64.decode(code);
        eval('var onMessage = ' + code);
        this.doMessage = onMessage;
    }

    // 单击事件
    var code = this.getStyle(mxConstants.STYLE_ONCLICK, '');
    if (code.length > 0) {
        code = Base64.decode(code);
        eval('var onClick = ' + code);
        this.onClick = onClick;
        var state = graph.view.getState(cell);
        mxEvent.addListener(state.shape.node, 'click', mxUtils.bind(this, this.onClick));
    }
}

BaseAdapter.prototype.beginUpdate = function () {
    this.graph.getModel().beginUpdate();
}

BaseAdapter.prototype.endUpdate = function () {
    this.graph.getModel().endUpdate();
}

BaseAdapter.prototype.setValue = function (value) {
    this.cell.setValue(value);
}

BaseAdapter.prototype.getStyle = function (Id, Default) {
    var state = this.graph.view.getState(this.cell);
    return mxUtils.getValue(state.style, Id, Default);
}

BaseAdapter.prototype.setStyle = function (Id, Value) {
    var cells = [this.cell];
    this.graph.setCellStyles(Id, Value, cells);
}

BaseAdapter.prototype.refresh = function () {
    this.graph.refresh(this.cell);
}


// 扩展 mxShape
mxShape.prototype.old_init = mxShape.prototype.init;
mxShape.prototype.init = function (container) {

    this.old_init(container);

    var view = this.state && this.state.view;
    if(view){
        var graph = view.graph;
        var cell = this.state.cell;
        if (graph.isView && !cell.adapter) {
            var Adapter = adapters[this.style.shape];
            if (Adapter) {
                cell.adapter = new Adapter(graph, cell);
            } else {
                cell.adapter = new BaseAdapter(graph, cell)
            }
        }
    }

}


// 适配器控件
function dataAdapter(graph, cell) {

    BaseAdapter.call(this, graph, cell);

    var state = this.graph.view.getState(this.cell);
    //是否可见
    if (this.graph.isView) {
        this.visible = this.getStyle(mxConstants.STYLE_VISIBLE, 'true') == 'true';
        if (!this.visible) {
            state.shape.node.setAttribute('display', 'none');
        }
    }

    var code = this.getStyle(mxConstants.STYLE_FORMAT, '');
    if (code.length > 0) {
        code = Base64.decode(code);
        eval('var format = ' + code);
        this.format = format;
    }
}

dataAdapter.prototype = Object.create(BaseAdapter.prototype);

//消息处理
dataAdapter.prototype.onMessageArrived = function (message) {
    this.beginUpdate();
    try {
        var self = this;
        loopCell(self.graph, function (bindCell) {
            try {
                if (bindCell.adapter) {
                    var dataSource = bindCell.adapter.getStyle(mxConstants.STYLE_DATASOURCE, null);
                    if (dataSource && dataSource == self.id && bindCell.adapter.doMessage) {
                        bindCell.adapter.doMessage(message);
                    }
                }
            } catch (e) {
                console.log(e)
            }
        });
    } finally {
        this.endUpdate();
    }
}


function mqttAdapter(graph, cell) {
    this.client = null;
    dataAdapter.call(this, graph, cell);

    var scripts = [
        "lib/mqtt/paho-mqtt.js",
        "js/MqttClient.js"
    ];
    var self = this;
    getScript(scripts, function () {

        var host = self.getStyle(mxConstants.STYLE_MQTT_HOST, null);
        var port = self.getStyle(mxConstants.STYLE_MQTT_PORT, null);
        if (host && port) {
            var options = {
                timeout: self.getStyle(mxConstants.STYLE_MQTT_TIMEOUT, 3),
                keepAliveInterval: self.getStyle(mxConstants.STYLE_MQTT_KEEPALIVE, 60),
                cleanSession: self.getStyle(mxConstants.STYLE_MQTT_SESSION, "true") == "true",
                useSSL: self.getStyle(mxConstants.STYLE_MQTT_SSL, false) == "true",
                userName: self.getStyle(mxConstants.STYLE_MQTT_USERNAME, ""),
                password: self.getStyle(mxConstants.STYLE_MQTT_PASSWORD, "")
            };
            var id = self.id.length > 0 ? self.id : new Date().getTime();
            self.client = new MqttClient(id.toString(), host, port, options);

            self.client.onConnect = function () {
                self.onConnect();
            }
            self.client.onFail = function (message) {
                self.onDisconnect(message);
            };
            self.client.onConnectionLost = function (message) {
                self.onDisconnect(message);
            }
            self.client.onMessageArrived = function (message) {
                if (self.format) {
                    message = self.format(message)
                }
                self.onMessageArrived(message)
            }
            self.client.connect();
        }

    });

}

mqttAdapter.prototype = Object.create(dataAdapter.prototype);

registerAdapter('mqtt', mqttAdapter);


mqttAdapter.prototype.onConnect = function () {
    var Path = this.getStyle(mxConstants.STYLE_MQTT_ONIMG, null);
    if (this.visible && Path) {
        this.setStyle(mxConstants.STYLE_IMAGE, Path);
    }
    var topics = this.getStyle(mxConstants.STYLE_MQTT_TOPICS, "").split(',');
    var subs = [];
    for (var i = 0; i < topics.length; i++) {
        var topic = topics[i];
        if (topic.length > 0 && subs.indexOf(topic) < 0) {
            subs.push(topic);
            this.client.subscribe(topic, 0);
        }
    }
}

mqttAdapter.prototype.onDisconnect = function (message) {
    var Error = '[' + message.errorCode + '] ' + message.errorMessage;
    console.log(Error);
    var Path = this.getStyle(mxConstants.STYLE_MQTT_OFFIMG, null);
    if (this.visible && Path) {
        this.setStyle(mxConstants.STYLE_IMAGE, Path);
    }
}


// Timer 适配器
function timerAdapter(graph, cell) {
    dataAdapter.call(this, graph, cell);
    this.freq = this.getStyle(mxConstants.STYLE_TIMER_FREQ, null);
    this.start();
}

timerAdapter.prototype = Object.create(dataAdapter.prototype);

registerAdapter('timer', timerAdapter);

timerAdapter.prototype.start = function () {
    this.stop();
    var self = this;
    if (this.freq > 0) {
        this.timer = setInterval(function () {
            self.onMessageArrived(self);
        }, this.freq);
    }
}

timerAdapter.prototype.stop = function () {
    if (this.timer && this.timer > 0) {
        clearInterval(this.timer);
        this.timer = null;
    }
}


mxCellRenderer.registerShape('mqtt', dataShape);
mxCellRenderer.registerShape('timer', dataShape);

