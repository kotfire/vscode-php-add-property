const vscode = require('vscode');

const waitToAssertInSeconds = 15;

exports.waitToAssertInSeconds = waitToAssertInSeconds;

exports.delay = (seconds, callback) => {
    return new Promise(resolve => {
        setTimeout(() => {
            callback();
            resolve();
        }, seconds * waitToAssertInSeconds);
    });
}

exports.resetDefaultSettings = async () => {
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

async function setDefaultSetting(config, value, parentKey) {
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