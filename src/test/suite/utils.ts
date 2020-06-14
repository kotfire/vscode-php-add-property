import * as vscode from 'vscode';

export const waitToAssertInSeconds = 15;

export function delay(seconds: number, callback: Function) {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve();
        }, seconds * waitToAssertInSeconds);
    });
}

export async function resetDefaultSettings() {
    const config = vscode.workspace.getConfiguration('phpAddProperty');

    for (const key in config) {
        if (config.hasOwnProperty(key)) {
            await setDefaultSetting(config, config[key], key);
        }
    }

    const constructorConfig = vscode.workspace.getConfiguration('phpAddProperty.constructor');
    for (const setting in constructorConfig) {
        if (constructorConfig.hasOwnProperty(setting)) {
            await setDefaultSetting(constructorConfig, constructorConfig[setting], setting);
        }
    }
}

async function setDefaultSetting(config: vscode.WorkspaceConfiguration, value: any, parentKey: string) {
    if (typeof value === 'function') {
        return;
    }
    
    if (typeof value !== 'object') {
        await config.update(parentKey, undefined, true);
        return;
    }

    for (const key in value) {
        if (value.hasOwnProperty(key)) {
            setDefaultSetting(config, value[key], [parentKey, key].join('.'));
        }
    }
}
