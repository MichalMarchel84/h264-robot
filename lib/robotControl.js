const Gpio = require('pigpio').Gpio;

const LEFT_MOTOR_1 = 3;
const LEFT_MOTOR_2 = 4;
const LEFT_MOTOR_PWM = 2;
const RIGHT_MOTOR_1 = 17;
const RIGHT_MOTOR_2 = 27;
const RIGHT_MOTOR_PWM = 22;

const LIGHT = 26;

class Motor {

    constructor(pin1, pin2, pwmPin) {
        this.pin1 = new Gpio(pin1, {mode: Gpio.OUTPUT});
        this.pin2 = new Gpio(pin2, {mode: Gpio.OUTPUT});
        this.pwmPin = new Gpio(pwmPin, {mode: Gpio.OUTPUT});
    }

    run(setting) {
        if (setting > 0) {
            this.pin1.digitalWrite(1);
            this.pin2.digitalWrite(0);
            this.pwmPin.pwmWrite(setting);
        } else if (setting < 0) {
            this.pin1.digitalWrite(0);
            this.pin2.digitalWrite(1);
            this.pwmPin.pwmWrite(-setting);
        } else {
            this.pin1.digitalWrite(1);
            this.pin2.digitalWrite(1);
            this.pwmPin.digitalWrite(1);
        }
    }
}

const leftMotor = new Motor(LEFT_MOTOR_1, LEFT_MOTOR_2, LEFT_MOTOR_PWM);
const rightMotor = new Motor(RIGHT_MOTOR_1, RIGHT_MOTOR_2, RIGHT_MOTOR_PWM);
const light = new Gpio(LIGHT, {mode: Gpio.OUTPUT});

const onMessage = (message) => {
    const vals = JSON.parse(message);
    leftMotor.run(vals[0]);
    rightMotor.run(vals[1]);
    if (vals.length > 2) {
        light.pwmWrite(vals[2]);
    }
};

module.exports = {
    onMessage
}

