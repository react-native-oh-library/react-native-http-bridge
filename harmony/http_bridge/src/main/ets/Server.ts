/*
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Logger from './Logger';
import { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import polka from '@ohos/polka';
import emitter from '@ohos.events.emitter';

const TAG: string = "HttpServer";
const SERVER_EVENT_ID: string = "httpServerResponseReceived";

type request = {
  requestId: string;
  postData?: {};
  type: string;
  url: string;
};

export class Server {
  private port: number;
  private context: TurboModuleContext;
  private method: string; // 请求方式
  private url: string; // 请求url
  private requestId: string; // 请求Id
  private polkaServer;

  constructor(port: number, ctx: TurboModuleContext) {
    this.port = port;
    this.context = ctx;
    this.polkaServer = polka().listen(this.port);
  }

  start() {
    this.polkaServer.use((req, res) => {
      this.requestId = Date.now() + ':' + Math.floor(Math.random() * 1000000);
      this.method = req.method;
      this.url = req.path;
      let result: request;
      if (this.method === 'POST' || this.method === 'PUT') {
        result = {
          requestId: this.requestId,
          postData: req.files.get('postData')?.toString('utf8'),
          type: this.method,
          url: this.url
        }
      } else {
        result = {
          requestId: this.requestId,
          type: this.method,
          url: this.url
        }
      }
      this.context.rnInstance.emitDeviceEvent(SERVER_EVENT_ID, result);

      emitter.once('requestId' + this.requestId, (data) => {
        Logger.info(TAG, 'on EventEmitter data: ' + JSON.stringify(data.data));
        if (this.requestId === data.data.requestId) {
          res.writeHead(data.data.code, {
            'Content-Type': data.data.type,
          });
          res.end(data.data.body);
        }
      })
    })
  }

  respond(requestId: string, code: number, type: string, body: string) {
    let eventData: emitter.EventData = {
      data: {
        "requestId": requestId,
        "code": code,
        "type": type,
        "body": body,
      }
    };
    emitter.emit('requestId' + requestId, eventData);
  }
}
