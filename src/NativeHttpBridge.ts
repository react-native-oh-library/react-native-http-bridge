/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
    start(port:number, serviceName:string): void;

    stop(): void
    
    respond(requestId:string, code:number, type:string, body:string): void;
}
export default TurboModuleRegistry.get<Spec>('ReactNativeHttpBridge') as Spec | null;