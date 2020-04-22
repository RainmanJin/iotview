mxConstants.STYLE_ID = "id";

mxConstants.STYLE_VISIBLE = 'visible';

mxConstants.STYLE_ONMSGARRIVED = "doMsg";
mxConstants.STYLE_ONCLICK = "onclick";

mxConstants.STYLE_MQTT_HOST = "host";
mxConstants.STYLE_MQTT_PORT = "port";
mxConstants.STYLE_MQTT_TOPICS = "topics";
mxConstants.STYLE_MQTT_SSL = "useSSL";
mxConstants.STYLE_MQTT_SESSION = "cleanSession";
mxConstants.STYLE_MQTT_KEEPALIVE = "keepAliveInterval";
mxConstants.STYLE_MQTT_TIMEOUT = "timeout";
mxConstants.STYLE_MQTT_USERNAME = "username";
mxConstants.STYLE_MQTT_PASSWORD = "password";

mxConstants.STYLE_MQTT_ONIMG = "on_img";
mxConstants.STYLE_MQTT_OFFIMG = "off_img";

mxConstants.STYLE_FORMAT = "format";
mxConstants.STYLE_DATASOURCE = "dataSource";
mxConstants.STYLE_TIMER_FREQ = "freq";

mxConstants.STYLE_ECHART_SCRIPT = "script";
mxConstants.STYLE_ECHART_GL = "gl";


Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// 消息格式化函数
var doFormat = function (Message){
    return JSON.parse(Message.payloadString);
}

// 消息处理函数
var doMsg = function(Message){
    if(Message.addr == this.id){
        this.setValue(Message.value);
        this.refresh();
    }
}

// 定时器消息处理函数
var doTimer = function (timer) {
    this.setValue(new Date().format("yyyy-MM-dd HH:mm:ss"));
    this.refresh();
}

// 单击事件
var doClick = function (event) {
    if(!this.onimg){
        // 设置开的图片
        this.onimg = '/shapes/18/50.png'
    }
    if(!this.offimg){
        this.offimg = this.getStyle(mxConstants.STYLE_IMAGE, null);
    }
    var path = !this.status  ? this.onimg : this.offimg;
    this.status = !this.status;
    this.setStyle(mxConstants.STYLE_IMAGE, path);
}

