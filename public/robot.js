const motorSettings = [0, 0];
const decrementFactor = 40;
const incrementFactor = 50;
const keysDown = [];
let service;
let lightChanged = true;
let light = 0;
const lightAlterationFactor = 20;
const turnFactor = decrementFactor + (incrementFactor - decrementFactor)/2;

function decrement(value) {
    let result = 0;
    if (value === 0) {
        return result;
    }
    if (value > 0) {
        result = value - decrementFactor;
        if (result < 0) {
            return 0;
        } else {
            return result;
        }
    } else {
        result = value + decrementFactor;
        if (result > 0) {
            return 0;
        } else {
            return result;
        }
    }
}

function getTrimmedValue(val) {
    if (val > 255) {
        return 255;
    } else if (val < -255) {
        return -255;
    } else {
        return val;
    }
}

function alterLight(dir) {
    light += dir * lightAlterationFactor;
    if (light > 255) {
        light = 255;
    } else if (light < 0) {
        light = 0;
    }
    lightChanged = true;
}

function resolveKey(key) {
    switch (key) {
        case "w":
            motorSettings[0] += incrementFactor;
            motorSettings[1] += incrementFactor;
            break;
        case "s":
            motorSettings[0] -= incrementFactor;
            motorSettings[1] -= incrementFactor;
            break;
        case "a":
            if ((motorSettings[0] < 0) && (motorSettings[1] < 0)) {
                motorSettings[0] += turnFactor
                motorSettings[1] -= turnFactor
            } else {
                motorSettings[0] -= turnFactor
                motorSettings[1] += turnFactor
            }
            break;
        case "d":
            if ((motorSettings[0] < 0) && (motorSettings[1] < 0)) {
                motorSettings[0] -= turnFactor
                motorSettings[1] += turnFactor
            } else {
                motorSettings[0] += turnFactor
                motorSettings[1] -= turnFactor
            }
            break;
            break;
        case "[":
            alterLight(-1);
            break;
        case "]":
            alterLight(1);
            break;
    };
}

function sendSettings() {
    keysDown.forEach((key) => resolveKey(key));
    motorSettings[0] = getTrimmedValue(motorSettings[0]);
    motorSettings[1] = getTrimmedValue(motorSettings[1]);
    if (lightChanged) {
        lightChanged = false;
        service.sendMessage(JSON.stringify([...motorSettings, light]));
    } else {
        service.sendMessage(JSON.stringify(motorSettings));
    }
    motorSettings[0] = decrement(motorSettings[0]);
    motorSettings[1] = decrement(motorSettings[1]);
}

function keyDown(e) {
    const i = keysDown.indexOf(e.key.toLowerCase());
    if (i === -1) keysDown.push(e.key.toLowerCase());
}

function keyUp(e) {
    const i = keysDown.indexOf(e.key.toLowerCase());
    if (i > -1) keysDown.splice(i, 1);
}

function initializeMotorControl(val) {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    service = val;
    setInterval(() => sendSettings(), 100);
}
