// MQTT 客户端 by 郑伟星

function MqttClient(clientId, host, port, options) {

    this.clientId = clientId;
    this.host = host;
    this.port = port;
    this.options = {
        timeout: options.timeout ? options.timeout : 3,
        keepAliveInterval: options.keepAliveInterval ? options.keepAliveInterval : 60,
        cleanSession: options.cleanSession ? options.cleanSession : false,
        useSSL: options.useSSL ? options.useSSL : false
    };
    if (options.userName.length > 0) {
        this.options.userName = options.userName;
    }
    if (options.password.length > 0) {
        this.options.password = options.password;
    }
    var willMessage = options.willMessage;
    if (willMessage) {
        var willmsg = new Paho.Message(willMessage.payload);
        willmsg.qos = willMessage.qos;
        willmsg.destinationName = willMessage.topic;
        willmsg.retained = willMessage.retained;
        this.options.willMessage = willmsg;
    }

}

MqttClient.prototype.connect = function () {
    var self = this;
    var _connected = false;
    var _reconnecting = false;
    this.connected = function () {
        return _connected;
    }
    var _reconnect = function () {
        _connected = false;
        setTimeout(function(){
            _reconnecting = true;
            if(!_connected){
                console.log("Reconnect "+ self.host + ":" + self.port);
                self.client.connect(self.options);
            }
        }, 5000);
    }
    
    this.client = new Paho.Client(this.host, this.port, this.clientId);
    this.client.onConnectionLost = function (responseObject) {
        !_reconnecting && self.onConnectionLost(responseObject);
        _reconnect();
    };
    this.client.onMessageArrived = function (message) {
        self.onMessageArrived(message)
    };
    var options = this.options;
    options.onSuccess = function () {
        _connected = true;
        _reconnecting = false;
        console.log(self.clientId + " connected");
        self.onConnect();
    };
    options.onFailure = function (message) {
        !_reconnecting && self.onFail(message);
        _reconnect();
    };
    this.client.connect(options);
}

MqttClient.prototype.disconnect = function () {
    this.client.disconnect();
}

MqttClient.prototype.publish = function (topic, payload, qos, retain) {

    if (!this.connected()) {
        console.log(this.clientId + " Not connected");
        return false;
    }

    var message = new Messaging.Message(payload);
    message.destinationName = topic;
    message.qos = qos;
    message.retained = retain;
    this.client.send(message);
}

MqttClient.prototype.subscribe = function (topic, qosNr) {

    if (!this.connected()) {
        console.log(this.clientId + " Not connected");
        return false;
    }

    if (topic.length < 1) {
        console.log(this.clientId + " Topic cannot be empty");
        return false;
    }

    this.client.subscribe(topic, {qos: qosNr});
    return true;
}


MqttClient.prototype.unsubscribe = function (topic) {
    this.client.unsubscribe(topic);
}

MqttClient.prototype.onConnect = function () {
}

MqttClient.prototype.onFail = function (message) {
    console.log(this.clientId + " error: " + message.errorMessage);
}

MqttClient.prototype.onConnectionLost = function (responseObject) {

    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

MqttClient.prototype.onMessageArrived = function (message) {
    console.log(this.clientId + "onMessageArrived:" + message.payloadString + " qos: " + message.qos);
}

