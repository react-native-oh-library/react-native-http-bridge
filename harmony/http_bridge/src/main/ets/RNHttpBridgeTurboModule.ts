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

import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import Logger from './Logger';
import { Server } from './Server';

const TAG: string = "[RNOH] HttpBridge"
const MODULE_NAME: string = "HttpServer";

export class RNHttpBridgeTurboModule extends TurboModule implements TM.ReactNativeHttpBridge.Spec {
  private port: number;
  private server: Server = null;
  private context: TurboModuleContext;

  constructor(ctx: TurboModuleContext) {
    super(ctx);
    this.context = this.ctx;
  }

  start(port: number, serviceName: string): void {
    Logger.info(TAG, "Initializing server...");
    this.port = port;
    this.startServer();
  }

  stop(): void {
    Logger.info(TAG, "Stopping server...");
    this.stopServer();
  }

  respond(requestId: string, code: number, type: string, body: string): void {
    Logger.info(TAG, "respond server...");
    if (this.server != null) {
      this.server.respond(requestId, code, type, body)
    }
  }

  private startServer() {
    if (this.port == 0) {
      return;
    }
    if (this.server == null) {
      this.server = new Server(this.port, this.context);
    }
    try {
      this.server.start();
    } catch (e) {
      Logger.error(MODULE_NAME, e.getMessage());
    }
  }

  private stopServer() {
    if (this.server != null) {
      this.server = null;
      this.port = 0;
    }
  }
}