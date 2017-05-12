// const Client = require('azure-iot-device').Client;
// const Message = require('azure-iot-device').Message;
import {Client, Message} from 'azure-iot-device'
import Protocol from './mqtt.js';
import wpi from './wiring-pi.js';
import codeFactory from '../data/codeFactory.js';

export default function run(option) {
    wpi.setFunc(option);
    const prefix = '76f98350'; // a prefix of UUID
    var replaces = [{
        src: /require\('wiring-pi'\)/g,
        dest: 'wpi'
    }, {
        src: /require\('azure-iot-device'\)\.Client/g,
        dest: 'Client'
    }, {
        src: /require\('azure-iot-device'\)\.Message/g,
        dest: 'Message'
    }, {
        src: /require\('azure-iot-device-mqtt'\)\.Mqtt/g,
        dest: 'Protocol'
    }, {
        src: /console\.log/g,
        dest: 'msgCb'
    }, {
        src: /console\.error/g,
        dest: 'errCb'
    }];
    try {
        var src = codeFactory.getRunCode('index', replaces, prefix);
        var clientApp = new Function('replaces' + prefix, src);
        clientApp({
            wpi: wpi,
            Client: Client,
            Message: Message,
            Protocol: Protocol,
            msgCb: option.onMessage,
            errCb: option.onError
        });
        if (src.search(/^((?!\/\/).)*setInterval/gm) < 0) {
            option.onFinish();
        }
    } catch (err) {
        option.onError(err.message || JSON.stringify(err));
        option.onFinish();
    }
}
