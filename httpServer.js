/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
/**
 * @providesModule react-native-http-server
 */
'use strict';

import { DeviceEventEmitter } from 'react-native';
import { NativeModules } from 'react-native';
import { TurboModuleRegistry } from "react-native";
var Server = TurboModuleRegistry ? TurboModuleRegistry.get('ReactNativeHttpBridge') : NativeModules.HttpServer;

module.exports = {
    start: function (port, serviceName, callback) {
        if (port == 80) {
            throw "Invalid server port specified. Port 80 is reserved.";
        }

        Server.start(port, serviceName);
        DeviceEventEmitter.addListener('httpServerResponseReceived', callback);
    },

    stop: function () {
        Server.stop();
        DeviceEventEmitter.removeAllListeners('httpServerResponseReceived');
    },

    respond: function (requestId, code, type, body) {
        Server.respond(requestId, code, type, body);
    }
}
