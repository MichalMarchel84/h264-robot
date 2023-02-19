const motorSettings = [0, 0];
const decrementFactor = 40;
const incrementFactor = 50;
const keysDown = [];
let service;

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
            motorSettings[0] -= incrementFactor;
            motorSettings[1] += incrementFactor;
            break;
        case "d":
            motorSettings[0] += incrementFactor;
            motorSettings[1] -= incrementFactor;
            break;
    };
}

function sendSettings() {
    keysDown.forEach((key) => resolveKey(key));
    motorSettings[0] = getTrimmedValue(motorSettings[0]);
    motorSettings[1] = getTrimmedValue(motorSettings[1]);
    service.sendMessage(JSON.stringify(motorSettings));
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
