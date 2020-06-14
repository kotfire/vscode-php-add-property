"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.waitToAssertInSeconds = 15;
function delay(seconds, callback) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve();
        }, seconds * exports.waitToAssertInSeconds);
    });
}
exports.delay = delay;
function resetDefaultSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('phpAddProperty');
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                yield setDefaultSetting(config, config[key], key);
            }
        }
        const constructorConfig = vscode.workspace.getConfiguration('phpAddProperty.constructor');
        for (const setting in constructorConfig) {
            if (constructorConfig.hasOwnProperty(setting)) {
                yield setDefaultSetting(constructorConfig, constructorConfig[setting], setting);
            }
        }
    });
}
exports.resetDefaultSettings = resetDefaultSettings;
function setDefaultSetting(config, value, parentKey) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof value === 'function') {
            return;
        }
        if (typeof value !== 'object') {
            yield config.update(parentKey, undefined, true);
            return;
        }
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                setDefaultSetting(config, value[key], [parentKey, key].join('.'));
            }
        }
    });
}
//# sourceMappingURL=utils.js.map