// echart 表盘显示示例
// {"addr":1, "value":1123}
function doMsg(Message){
    if(Message.addr == this.id){
        option = {
            tooltip: {
                formatter: '{a} <br/>{b} : {c}%'
            },
            toolbox: {
                feature: {
                    restore: {},
                    saveAsImage: {}
                }
            },
            series: [
                {
                    name: '业务指标',
                    type: 'gauge',
                    detail: {formatter: '{value}%'},
                    data: [{value: 50, name: '完成率'}]
                }
            ]
        };

        option.series[0].data[0].value = Message.value / 100;
        this.chart.setOption(option, true);
    }
}


// 多表盘
function doMsg(Message){
    option = {
        tooltip: {
            formatter: "{a} <br/>{c} {b}"
        },
        toolbox: {
            show: true,
            feature: {
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        series : [
            {
                name: '速度',
                type: 'gauge',
                z: 3,
                min: 0,
                max: 220,
                splitNumber: 11,
                radius: '50%',
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    backgroundColor: 'auto',
                    borderRadius: 2,
                    color: '#eee',
                    padding: 3,
                    textShadowBlur: 2,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1,
                    textShadowColor: '#222'
                },
                title: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder',
                    fontSize: 20,
                    fontStyle: 'italic'
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    formatter: function (value) {
                        value = (value + '').split('.');
                        value.length < 2 && (value.push('00'));
                        return ('00' + value[0]).slice(-2)
                            + '.' + (value[1] + '00').slice(0, 2);
                    },
                    fontWeight: 'bolder',
                    borderRadius: 3,
                    backgroundColor: '#444',
                    borderColor: '#aaa',
                    shadowBlur: 5,
                    shadowColor: '#333',
                    shadowOffsetX: 0,
                    shadowOffsetY: 3,
                    borderWidth: 2,
                    textBorderColor: '#000',
                    textBorderWidth: 2,
                    textShadowBlur: 2,
                    textShadowColor: '#fff',
                    textShadowOffsetX: 0,
                    textShadowOffsetY: 0,
                    fontFamily: 'Arial',
                    width: 100,
                    color: '#eee',
                    rich: {}
                },
                data: [{value: 40, name: 'km/h'}]
            },
            {
                name: '转速',
                type: 'gauge',
                center: ['20%', '55%'],    // 默认全局居中
                radius: '35%',
                min: 0,
                max: 7,
                endAngle: 45,
                splitNumber: 7,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail: {
                    // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontWeight: 'bolder'
                },
                data: [{value: 1.5, name: 'x1000 r/min'}]
            },
            {
                name: '油表',
                type: 'gauge',
                center: ['77%', '50%'],    // 默认全局居中
                radius: '25%',
                min: 0,
                max: 2,
                startAngle: 135,
                endAngle: 45,
                splitNumber: 2,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    splitNumber: 5,
                    length: 10,        // 属性length控制线长
                    lineStyle: {        // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                axisLabel: {
                    formatter: function (v){
                        switch (v + '') {
                            case '0' : return 'E';
                            case '1' : return 'Gas';
                            case '2' : return 'F';
                        }
                    }
                },
                splitLine: {           // 分隔线
                    length: 15,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 2
                },
                title: {
                    show: false
                },
                detail: {
                    show: false
                },
                data: [{value: 0.5, name: 'gas'}]
            },
            {
                name: '水表',
                type: 'gauge',
                center: ['77%', '50%'],    // 默认全局居中
                radius: '25%',
                min: 0,
                max: 2,
                startAngle: 315,
                endAngle: 225,
                splitNumber: 2,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    show: false
                },
                axisLabel: {
                    formatter: function(v){
                        switch (v + '') {
                            case '0' : return 'H';
                            case '1' : return 'Water';
                            case '2' : return 'C';
                        }
                    }
                },
                splitLine: {           // 分隔线
                    length: 15,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width:2
                },
                title: {
                    show: false
                },
                detail: {
                    show: false
                },
                data: [{value: 0.5, name: 'gas'}]
            }
        ]
    };
    if([1,2,3,4].indexOf(Message.addr)){
        option.series[Message.addr].data[0].value = Message.value / 100;
        this.chart.setOption(option, true);
    }
}

// 地球
ROOT_PATH = "examples/echart/";
option = {
    backgroundColor: '#000',
    globe: {
        baseTexture: ROOT_PATH + 'earth.jpg',
        heightTexture: ROOT_PATH + 'bathymetry_bw_composite_4k.jpg',

        displacementScale: 0.1,

        shading: 'lambert',

        environment: ROOT_PATH + 'starfield.jpg',

        light: {
            ambient: {
                intensity: 0.1
            },
            main: {
                intensity: 1.5
            }
        },

        layers: [{
            type: 'blend',
            blendTo: 'emission',
            texture: ROOT_PATH + 'night.jpg'
        }, {
            type: 'overlay',
            texture: ROOT_PATH + 'clouds.png',
            shading: 'lambert',
            distance: 5
        }]
    },
    series: []
}
adapter.chart.setOption(option);
