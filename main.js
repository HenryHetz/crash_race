
// import EmoChat from './EmoChat.js';

// ---------------- Config ----------------




// -------------- Scene -------------------
class MainScene extends Phaser.Scene {
    constructor() {
        super("main");
    }
    preload() {
        // sprites
        this.load.image("button", "assets/sprites/button_red.png");

        // атласы
        // this.load.atlas(
        //     'smileys',
        //     'assets/sprites/sheets/smileys.png',
        //     'assets/sprites/sheets/smileys.json'
        // )

        this.load.spritesheet('crash_cars', 'assets/sprites/sheets/crash_cars.png', {
            frameWidth: 200,     // ширина одной иконки
            frameHeight: 400,    // высота одной иконки
            margin: 0,          // отступ от краёв спрайта (если есть)
            spacing: 0          // промежуток между иконками (если есть)
        });


        // particles
        this.load.image("yellow", "assets/sprites/yellow.png");
        this.load.image("red", "assets/sprites/red.png");
        // звуки
        // this.load.audio("plink", "assets/sfx/plink.mp3");
        this.load.audio('cashout', 'assets/sfx/cashout.mp3')
        this.load.audio('nitro', 'assets/sfx/nitro_1.mp3')
        this.load.audio('revving', 'assets/sfx/revving_1.mp3')
        this.load.audio('car_crash_1', 'assets/sfx/car_crash_1.mp3')
        this.load.audio('car_crash_2', 'assets/sfx/car_crash_2.mp3')
        this.load.audio('car_crash_3', 'assets/sfx/car_crash_3.mp3')
        this.load.audio('car_crash_4', 'assets/sfx/car_crash_4.mp3')

        this.load.audio('race', 'assets/sfx/race.mp3')
        this.load.audio('flight', 'assets/sfx/flight.mp3')
    }
    init() {
        this.rtp = [];
        this.times = [];
        this.wins = [];
        this.crashCount = 0
        
        this.paused = true;
        this.elapsedSec = 0;
        this.startBase = 0.02
        this.lastUpdateBase = 0;
        this.lastUpdateDelta = 0;

        this.centerX = 320
        this.gridUnit = 80

        this.config = {
            CAR_AMOUNT: 5,
            CAR_X_START: 120,
            CAR_Y_START: 650,
            START_CAR_SPEED: 100,
            MAX_CAR_SPEED: 1000,
            MILESTONE_DELTA: 140,
            TRACK_TOP: 100,
            TRACK_HEIGHT: 700,
            TRACK_BOTTOM: 800,
            SPEED_UPDATE_SEC: 5, // 4 / 5
            START_BASE: 0.05 // 0.02 / 0.04
        };

        // colors
        this.standartColors = {
            white: 0xFBFAF8, // 0xffffff
            red: 0xE60000, // 0xff0000
            blue: 0x05edff, // 6CFFFF // #3DB6FF
            yellow: 0xfcd912, // orange: 0xFF9B0F yellow: 0xfcd912
            black: 0x000000,
            gray: 0xD9D9D9,
            wrapper: 0x212838,
            dark_red: 0x920000
        };

        // text
        this.textColors = {
            white: '#FBFAF8',
            red: '#c60000', // '#E60000' '#920000ff'
            gray: '#bcbcbcff', // '#cccccc'
            yellow: '#fcd912',
            blue: '#05edff',
            black: '#000000'
        }

        // депозит
        this.deposit = 10000;
        // this.currentWin = 0;
        this.bet = 100;
        this.win = 0;
        this.bets = new Array(this.config.CAR_AMOUNT).fill(0);

        // dev
        // this.devSim()
    }
    devSim() {
        const maxWins = []
        const max = 1000;
        let maxArrayWin = 0;
        let maxWinCount = 0;
        let winSum = 0;
        const bet = 5;
        const winOut = 4
        const amount = 1000000;
        for (let index = 0; index < amount; index++) {
            let maxWin = 0;
            for (let i = 0; i < 5; i++) {
                const win = 1 / Math.random();
                if (win > maxWin) maxWin = win;
                if (win >= winOut) winSum++;
            }
            // if (maxWin >= winOut) winSum++;

            // if (maxWin >= max) {
            //     maxWin = max; // кап на макс
            //     maxWinCount++;
            // }
            maxWins.push(maxWin);
            if (maxWin > maxArrayWin) maxArrayWin = maxWin;
        }
        const avgWin = maxWins.reduce((sum, val) => sum + val, 0) / maxWins.length;
        const medWin = median(maxWins);
        // const maxWin = Math.max(...maxWins);
        console.log('winSum', winSum, 'out of', amount, 'prob', (winSum / amount).toFixed(4));
        console.log('win', winSum * winOut, 'bet', amount * bet, 'RTP', (winSum * winOut / (amount * bet) * 100).toFixed(2) + '%');
        console.log('avgWin', avgWin.toFixed(2), 'medWin', medWin.toFixed(2),'maxWinCount', maxWinCount.toFixed(0));

        // this.printProb(maxWins)

        // let minValue = 1;
        // const maxValue = 10000;
        // for (let index = 0; index < 1000000; index++) {
        //     const random = Math.random()
        //     if (random < minValue) minValue = random
        //     this.targetCrash = 1 / random
        //     // if (this.targetCrash > maxValue) this.targetCrash = maxValue
        //     this.wins.push(this.targetCrash)
        // }
        // const avgWin = this.wins.reduce((sum, val) => sum + val, 0) / this.wins.length;
        // console.log(this.wins.length, 'ave: WIN', avgWin.toFixed(2), 'min random', minValue, 1 / minValue);

        // function median(arr) {
        //     if (!arr.length) return 0;
        //     const sorted = [...arr].sort((a, b) => a - b); // копия с сортировкой
        //     const mid = Math.floor(sorted.length / 2);
        //     if (sorted.length % 2 === 0) {
        //         return (sorted[mid - 1] + sorted[mid]) / 2;
        //     } else {
        //         return sorted[mid];
        //     }
        // }

        // пример:
        // const med = median(this.wins);
        // console.log("median win =", med.toFixed(2));

        this.wins = []
        // dev
        /**
         * Генерация краша с управляемой волатильностью
         * @param {number} U - равномерное случайное число 0..1 (provably fair)
         * @param {number} alpha - волатильность (1 = классика, <1 = более волатильно)
         * @param {number} [cap=100000] - верхний лимит, чтобы не улетало в бесконечность
         */
        function crashVolatile(U, alpha = 1.0, minCrash = 1.0, cap = 100000) {
            // защитим от 0
            U = Math.min(Math.max(U, Number.EPSILON), 1 - Number.EPSILON);
            const pow = 1 / Math.pow(U, alpha);
            const line = 1 / U
            console.log("crash pow", pow.toFixed(2), "crash line", line.toFixed(2));
            // волатильная форма
            let crash = minCrash + (1 / Math.pow(U, alpha));
            if (cap) crash = Math.min(crash, cap);
            return crash;
        }

        // for (let index = 0; index < 100000; index++) {
        //     const random = Math.random();
        //     // const targetCrash = crashVolatile(random, 0.5, 0, 10000);
        //     const targetCrash = 1/random;
        //     // console.log("targetCrash", targetCrash.toFixed(2));
        //     this.wins.push(targetCrash);
        // }
        // const avgWin =
        //     this.wins.reduce((sum, val) => sum + val, 0) / this.wins.length;
        // const medWin = median(this.wins);
        // const maxWin = Math.max(...this.wins);
        // // console.table(this.wins)
        // console.log('ave: WIN', avgWin.toFixed(2), 'med', medWin.toFixed(2), 'max', maxWin.toFixed(2));

        // // 🧠 Если хочешь проверить численно (в коде)
        // this.printProb(this.wins)


        // RTP 100%, но 10% с выигрыша мы забираем
        let bets = 0;
        let payouts = 0;
        // for (let index = 0; index < 1000000; index++) {
        //     bets += 1;
        //     if (Math.random() > 0.5) payouts += 2 - 2 * 0.05; // 5% с выигрыша
        // }
        // const RTP = (payouts / bets) * 100;
        // console.log('RTP', RTP.toFixed(2) + '%');

        const rtps = [0.8, 0.9, 0.95, 0.98, 0.99, 0.999];
        const depositStart = 100;  // стартовый депозит игрока
        const betSize = 1;          // ставка
        const rounds = 1000000;

        // for (const RTP of rtps) {
        //     let dep = depositStart;
        //     let spins = 0;

        //     // до тех пор, пока не кончились деньги или не превысили лимит ставок
        //     while (dep > 0 && spins < rounds) {
        //         dep -= betSize; // делаем ставку
        //         // если выиграли — возвращаем выигрыш в соответствии с RTP
        //         if (Math.random() < RTP) dep += betSize;
        //         spins++;
        //     }

        //     const percentLost = ((depositStart - dep) / depositStart * 100).toFixed(1);
        //     console.log(
        //         `RTP ${RTP * 100}% → закончились деньги через ${spins} ставок (потеря ${percentLost}% депа)`
        //     );
        // }
    }
    printProb(winsArray) {
        const sorted = [...winsArray].sort((a, b) => a - b);
        function survivalProb(array, x) {
            // console.table(' survivalProb', array)
            return array.filter(c => c > x).length / array.length;
        }
        console.log("P(X>2) ≈", survivalProb(winsArray, 2)); // должно быть ~0.5
        console.log("P(X>5) ≈", survivalProb(winsArray, 5)); 
        console.log("P(X>10) ≈", survivalProb(winsArray, 10)); // должно быть ~0.1
        console.log("P(X>100) ≈", survivalProb(winsArray, 100)); // ~0.01
    }
    createCounters() {
        const smallFont = "20px Helvetica" // 22
        const y_1 = 32
        const y_2 = 110
        const gapY = 26

        // MODE
        this.add
            .text(20, y_1, "GAME:", {
                font: smallFont,
                fill: this.textColors.white, // "#fff"
            }).setAlpha(1)
            .setOrigin(0, 0.5)
            .setDepth(20)

        this.modeText = this.add
            .text(20, y_1 + gapY, 'CRASH RACE', {
                font: smallFont, // "16px CyberFont"
                fill: this.textColors.red,
            }).setAlpha(1)
            .setOrigin(0, 0.5)
            .setDepth(20)

        // DEP
        this.add
            .text(505, y_1, "DEP:", {
                font: smallFont,
                fill: this.textColors.white,
            }).setAlpha(1)
            .setOrigin(0, 0.5)
            .setDepth(20)

        this.depoCounter = this.add
            .text(505, y_1 + gapY, this.deposit.toFixed(2), {
                font: smallFont,
                fill: this.textColors.red,
            }).setAlpha(1)
            .setOrigin(0, 0.5)
            .setDepth(20)
        // .setText(this.deposit)


        // TIME
        this.add
            .text(220, y_1, 'TIME', {
                font: smallFont,
                fill: this.textColors.white,
            }).setAlpha(0.5)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        this.timeCounter = this.add
            .text(220, y_1 + gapY, 0, {
                font: smallFont,
                fill: this.textColors.gray,
            }).setAlpha(0.5)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        // BASE x: 310
        this.add
            .text(420, y_1, 'BASE', {
                font: smallFont,
                fill: this.textColors.white,
            }).setAlpha(0.5)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        this.baseCounter = this.add
            .text(420, y_1 + gapY, this.wallTouchX, {
                font: smallFont,
                fill: this.textColors.gray,
            }).setAlpha(0.5)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        // STAKE x: 405
        this.add
            .text(320, y_1, 'STAKE', {
                font: smallFont,
                fill: this.textColors.white,
            }).setAlpha(1)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        this.stakeCounter = this.add
            .text(320, y_1 + gapY, this.bet.toFixed(2), {
                font: smallFont,
                fill: this.textColors.gray,
            }).setAlpha(1)
            .setOrigin(0.5, 0.5)
            .setDepth(20)

        this.outCounter = this.add
            .text(320, 890, '', {
                font: smallFont,
                fill: this.textColors.gray,
            }).setAlpha(1)
            .setOrigin(0.5, 0.5)
            .setDepth(15)

        // X counter
        this.xCounter = this.add
            .text(320, 140, '', {
                font: "44px Helvetica",
                // fontFamily: 'CyberFont',
                // fontSize: '40px',
                fill: this.textColors.red,
            }).setAlpha(1)
            .setOrigin(0.5)
            .setDepth(20)



        this.buttonText = this.add
            .text(this.button.x, this.button.y, 'CASH', {
                font: "44px Helvetica",
                // fontFamily: 'CyberFont',
                // fontSize: '40px',
                fill: this.textColors.black,
            }).setAlpha(1)
            .setOrigin(0.5)
            .setAlign('center')
            .setDepth(20)

    }
    createIcons() {

    }
    createMilestones() {
        this.milestones = [];

        const x = 20;
        const y_start = 100;
        // const deltaY = 140;
        const width = 20;
        const height = 20;

        for (let i = 0; i < 10; i++) {
            for (let index = 0; index < Phaser.Math.Between(1, 5); index++) {
                const g = this.add.graphics();
                g.fillStyle(0xffffff, 0.2);
                g.fillRoundedRect(0, 0, width, height, 2);
                const random_x = Phaser.Math.Between(40, 580);
                // const random_x = Phaser.Math.Between(40, 560);
                g.x = random_x;
                g.y = y_start + i * this.config.MILESTONE_DELTA;

                this.milestones.push(g);
            }
        }
    }
    createCars() {
        this.cars = []
        // this.carCounters = []
        // const x = 120
        const y = this.config.CAR_Y_START
        const delta = 100
        const radius = 30

        const graphics = this.add.graphics();
        // dev
        this.buttons = []


        for (let index = 0; index < this.config.CAR_AMOUNT; index++) {
            // this.cars[index] = graphics.fillStyle(0xff0000, 1) // 0xff0000 - красный
            //     .fillCircle(x + index * delta, y, radius);

            // const g = this.add.graphics();
            // g.fillStyle(0xff0000, 1)
            // g.fillCircle(x + index * delta, y, radius)
            // dev - кнопки для краша машин 
            const x = this.config.CAR_X_START + index * delta 
            const button = this.add.image(x, 850, "button") 
                .setOrigin(0.5)
                .setScale(0.3, 0.6)
                .setInteractive()
                .on("pointerdown", () => {
                    console.log("button car crash", index);
                    this.buttonHandler(index)
                })
            this.buttons.push(button)

            const car = this.add
            .image(x, y, 'crash_cars', index)
            .setOrigin(0.5, 0)
            .setScale(0.5)

            const counter = this.add.text(x, car.y, 'X', {
                font: "20px Helvetica",
                fill: this.textColors.black,
            }).setAlpha(1)
                .setOrigin(0.5)
            // .setDepth(20)

            this.cars.push({
                car: car,
                counter: counter,
                state: 0,
                defaults: {
                    x: x,
                    y: y,
                    scale: 0.5
                }
            });

            
        }

    }
    buttonHandler(index) {
        const car = this.cars[index];
        if (this.paused && this.bets[index] === 0) {
            // bet
            this.bets[index] = this.bet;
        }
        if (!this.paused && !car.exit && !car.dead && this.bets[index] > 0) {
            // exit
            this.carExit(car, index)
            const win = car.value * this.bets[index];
            this.deposit += win;
            this.depoCounter.setText(this.deposit.toFixed(2));
            // this.stakeCounter.setColor(this.textColors.red)
            // this.buttonUpdate(0)
            // this.sfx.cashout.play()
            this.buttons[index].setAlpha(0.5)
        }
    }  
    carExit(c, index) {
        c.exit = true
        c.exitTime = new Date().getTime();
        // c.car.alpha = 0.5
        this.tweens.add({
            targets: c.car,
            y: c.car.y + 40,
            // alpha: 0.2,
            // rotation: Phaser.Math.Between(-100, 100) * Math.PI / 180,
            scaleY: c.defaults.scale * 0.9,
            duration: 200,
            ease: "Back.easeOut", // 'Quad.easeOut'
            onComplete: () => {
                this.tweens.add({
                    targets: c.car,
                    y: -400,
                    scaleY: c.defaults.scale * 1.2,
                    alpha: 0.2,
                    // scale: 1.1,
                    duration: 2000,
                    ease: "Back.easeOut", // 'Quad.easeOut'
                    onComplete: () => {
                        c.car.scaleY = c.defaults.scale
                        c.counter.y = c.defaults.y
                    },
                });
            },
        });
        // 
        
        // sound
        if (c.state === 0) this.sfx.revving.play()
        else this.sfx.nitro.play()

        // dev crash
        setTimeout(() => {
            if (c.dead) return; // можно проверить время выхода и краша
            c.value = c.crash
            c.counter.setText((c.value * 100).toFixed(0));
            this.carCrash(c, index)
        }, 1000);
        
    }
    carCrash(c, index) {
        c.crashTime = new Date().getTime();
        console.log(index, 'крашнулся', c.crash)
        this.buttons[index].setAlpha(0.2)
        c.car.alpha = 0.2;
        c.counter.setText((c.crash * 100).toFixed(0));
        c.dead = true
        c.car.y = c.defaults.y // остановить
        c.counter.y = c.car.y
        this.crashCount++
        
        // sound
        if (c.exit) return;
        const sound = this.sfx['car_crash_' + Phaser.Math.Between(1,4)]
        sound.play()
    }
    create() {
        setTimeout(() => { }, 2000);

        // this.bg = this.add
        //     .image(0, 0, "bg")
        //     .setScale(1)
        //     .setOrigin(0, 0)
        //     .setAlpha(1)
        //     .setDepth(10)

        this.track = this.add.graphics()
            .fillStyle(0xffffff, 0.2) // 0x212838
            .fillRoundedRect(20, 100, 600, 700, 10);

        this.createMilestones()
        this.createCars()

        const w = 400;
        const h = 200;

        // const button = this.add.graphics()
        // .fillStyle(this.standartColors.red, 0.8) 
        // .fillRoundedRect(200, 900, 200, 100, 10);

        this.button = this.add
            .image(320, 1000, "button")
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(20)
            .setInteractive()
            .on("pointerdown", () => {
                return // dev
                console.log("button touch");
                if (!this.paused && !this.exitTime) {
                    this.exitTime = new Date().getTime();
                    this.exitX = this.bestX

                    this.win = this.bestX * this.bet;
                    this.deposit += this.win;
                    this.depoCounter.setText(this.deposit.toFixed(2));
                    // this.stakeCounter.setColor(this.textColors.red)
                    this.buttonUpdate(0)
                    this.sfx.cashout.play()
                }
            });


        this.createCounters()
        this.sfx = {
            // plink: this.sound.add("plink", { volume: 0.1 }),
            cashout: this.sound.add("cashout", { volume: 0.2 }),
            revving: this.sound.add("revving", { volume: 0.2 }),
            nitro: this.sound.add("nitro", { volume: 0.2 }),
            race: this.sound.add("race", { 
                volume: 0.1, 
                // pitch: 1000,
                detune: 500, }),
            flight: this.sound.add("flight", { volume: 0.2 }),
            car_crash_1: this.sound.add("car_crash_1", { volume: 0.3 }),
            car_crash_2: this.sound.add("car_crash_2", { volume: 0.3 }),
            car_crash_3: this.sound.add("car_crash_3", { volume: 0.3 }),
            car_crash_4: this.sound.add("car_crash_4", { volume: 0.3 }),
        };

        this.createParticles();

        setTimeout(() => {
            // this.sfx.ambient.play();
            // this.createCounters()
            this.resetRound();
        }, 1000);
    }
    buttonUpdate(state) {
        this.button.alpha = state
        if (state) {
            this.buttonText.setColor(this.textColors.black)
            this.buttonText.setText('CASH')
        } else {
            this.buttonText.setColor(this.textColors.red)
            this.buttonText.setText('OUT')
        }
    }
    createParticles() {
        this.emitter = this.add.particles(
            0,
            0, // стартовая позиция, не важна — мы двигаем emitter потом
            "red",
            {
                speed: 500,
                lifespan: 500,
                scale: { start: 2, end: 0 },
                blendMode: "ADD",
                emitting: false,
            }
        );
    }

    update(_time, deltaMs) {
        if (this.paused) return; // нужно и в паузу бежать дорогу?
        // const dt = Math.min(deltaMs, 32) / 1000; // кламп дельты
        const dt = Math.min(deltaMs / 1000, 0.05);
        this.elapsedSec += dt;
        this.timeCounter.setText(this.elapsedSec.toFixed(2));

        const timeNow = new Date().getTime();

        this.baseUpdate()
        this.carsDeltaUpdate()

        const TARGET_FPS = 60; 
        // this.speed += this.base
        this.speed += this.base * TARGET_FPS * dt;
        // console.log('this.speed', this.speed, 'dt', dt, this.speed + this.base * dt)

        for (const ms of this.milestones) {
            // двигаем вниз
            ms.y += this.speed * (dt * 4);

            // если milestone ушёл ниже трека — перебросить наверх
            if (ms.y > 100 + 700) {   // 100 = верх трека; 700 = высота трека
                ms.y -= 700 + 140;   // вернуть наверх + небольшой отступ
            }
        }

        this.checkCars();
    }
    baseUpdate() {
        const N = this.config.SPEED_UPDATE_SEC;
        const steps = Math.floor(this.elapsedSec / N);
        if (steps > this.lastUpdateBase) {
            this.lastUpdateBase = steps;
            this.base *= 2;
            this.baseCounter.setText(this.base);
        }
    }
    carsDeltaUpdate() {
        this.lider = {
            index: -1,
            y: 0
        }
        let liderY = 0

        const N = 5;
        const steps = Math.floor(this.elapsedSec / N);
        if (steps > this.lastUpdateDelta) {
            this.lastUpdateDelta = steps;
            // console.log('this.lastUpdateDelta', this.lastUpdateDelta)

            this.cars.forEach((c, index) => {
                if (c.dead) return;
                c.delta = Phaser.Math.Between(-10, 10) * this.lastUpdateDelta / 2;
                // console.log(index, 'car delta', c.delta, 'y', c.car.y)
                if (c.delta > 5 && c.state === 0) {
                    const drift = Phaser.Math.Between(-5, 5)
                    // console.log(index, 'car delta', c.delta, 'drift', drift)
                    // this.sfx.revving.play()
                    // reflex
                    this.tweens.add({
                        targets: c.car,
                        x: c.car.x - drift,
                        rotation: drift * Math.PI / 180,
                        duration: 100,
                        ease: "Back.easeIn", // 'Quad.easeOut'
                        onComplete: () => {
                            this.tweens.add({
                                targets: c.car,
                                x: c.defaults.x,
                                angle: 0,
                                duration: 500,
                                ease: "Back.easeOut", // 'Quad.easeOut'
                                onComplete: () => {
                                    c.car.x = c.defaults.x
                                },
                            });
                        },
                    });
                }
                if (c.car.y < this.lider.y) {
                    this.lider.y = c.car.y
                    this.lider.index = index
                }
            })
            // console.log('lider', this.lider.index, this.lider.y)
        }
    }
    checkCars() {
        let best = 0
        let liderIndex = -1
       
        this.cars.forEach((c, index) => {
            const x = (this.speed - (c.car.y - 700) / 10) / 100 // дикая конструкция, но работает
            if (c.crash <= x && !c.dead) {
                // крашнулся
                this.carCrash(c, index)
                // console.log(index, 'крашнулся', c.crash)
                // this.buttons[index].setAlpha(0.2)
                // c.car.alpha = 0.2;
                // c.counter.setText((c.crash * 100).toFixed(0));
                // c.dead = true
                // c.car.y = c.defaults.y // остановить
                // c.counter.y = c.car.y
                // this.crashCount++
            } 
            if (!c.dead && !c.exit) {
                const a = 10 / this.speed
                const b = c.delta / this.speed;
                // if (index === 0) console.log(c.car.y, 'a + b', a, b, 'total', a + b)
                // c.car.y -= a
                // c.car.y -= b
                c.car.y = c.car.y - (a + b)

                c.value = x
                c.counter.setText((c.value * 100).toFixed(0));
                c.counter.y = c.car.y // 700 + c.car.y
                // console.log('speed +', c.car.y)
            }
            if (c.exit && !c.dead) {
                // c.value = c.crash
                // c.counter.setText((c.value * 100).toFixed(0));
                // this.carCrash(c, index)
            }
            // if (c.exit && c.car.alpha > 0.2) c.car.alpha = 0.2
            if (c.value > 5 && c.state != 1 && !c.exit) {
                c.state = 1
                c.car.setFrame(c.state * 5 + index) 
                this.sfx.flight.play()
            }
            if (c.value > 20 && c.state != 2 && !c.exit) {
                c.state = 2
                c.car.setFrame(c.state * 5 + index) 
            }

            if (x > best && !c.exit && !c.dead) {
                best = x
                liderIndex = index
            }
        })
        if (best > this.bestX) this.bestX = best
        // this.xCounter.setText('LIDER '+f0(this.bestX * 100));
        liderIndex ++
        this.xCounter.setText(liderIndex +' LIDER '+ (this.bestX*100).toFixed(1));

        if (this.crashCount == this.cars.length) {
            this.finishRound();
        }
    }
    finishRound(target) {
        this.paused = true;
        const timeNow = new Date().getTime();
        // if (this.exitTime) const deltaExit = (timeNow - this.exitTime) / 1000;
            // console.log('deltaExit', deltaExit.toFixed(2));
            console.log('round time', this.elapsedSec.toFixed(2), 'base', this.base.toFixed(2));
            // console.log('win', this.exitX.toFixed(2), 'crash', this.bestX.toFixed(2), '%', (this.exitX * 100 / this.bestX).toFixed(2));
        
        // if (!target)
        // this.emitter.explode(30, this.ball.position.x, this.ball.position.y);

        this.showStat();

        setTimeout(() => {
            this.resetRound(target);
        }, 3000);

        this.sfx.race.stop()
        this.sfx.flight.stop()
    }
    showStat() {
        // const rtp = this.win / this.targetCrash;
        // this.rtp.push(rtp);
        // this.times.push(this.elapsedSec);
        // this.wins.push(this.win);
        // const avgRTP =
        //     this.rtp.reduce((sum, val) => sum + val, 0) / this.rtp.length;
        // const avgTime =
        //     this.times.reduce((sum, val) => sum + val, 0) / this.times.length;
        // const avgWin =
        //     this.wins.reduce((sum, val) => sum + val, 0) / this.wins.length;
        // const med = median(this.wins);
        // // console.log(this.rtp.length, 'ave: WIN', avgWin.toFixed(2), 'RTP', avgRTP.toFixed(8), 'TIME', avgTime.toFixed(2),);

        // console.log(
        //     "crash",
        //     "this.win",
        //     this.win.toFixed(2),
        //     "time",
        //     this.elapsedSec.toFixed(2)
        //     // 'RTP',
        //     // rtp.toFixed(4)
        // );

        // if (this.wins.length == 100) {
        //     const avgWin =
        //         this.wins.reduce((sum, val) => sum + val, 0) / this.wins.length;
        //     const medWin = median(this.wins);
        //     const maxWin = Math.max(...this.wins);
        //     console.table(this.wins)
        //     console.log('ave: WIN', avgWin.toFixed(2), 'med', medWin.toFixed(2), 'max', maxWin.toFixed(2));
        //     this.printProb(this.wins)
        // }

        // const totalTouches = this.wallTouchCount + this.targetTouchCount;
        // console.log(
        //     "touches",
        //     "wall",
        //     this.wallTouchCount,
        //     "target",
        //     this.targetTouchCount,
        //     "total",
        //     totalTouches,
        //     "tchs/sec",
        //     (totalTouches / this.elapsedSec).toFixed(2)
        // );
        // // dev
        // if (this.win > this.maxCrash) this.maxCrash = this.win;
        // console.log(
        //     this.wins.length,
        //     "median crash",
        //     med.toFixed(2),
        //     "max",
        //     this.maxCrash.toFixed(2),
        //     "avg",
        //     avgWin.toFixed(2),
        //     "avg time",
        //     avgTime.toFixed(2)
        // );
    }
    resetRound(target) {
        // сброс позиции и скорости

        this.win = 0;
        this.elapsedSec = 0;
        this.lastUpdateBase = 0;
        this.lastUpdateDelta = 0;
        this.base = this.config.START_BASE
        this.speed = this.config.START_CAR_SPEED
        // this.config.START_CAR_SPEED = 100;

        this.exitMode = undefined;

        this.paused = false;
        this.isExit = false;
        this.exitTime = 0;
        this.bestX = 0
        this.exitX = 0
        this.crashCount = 0

        this.deposit -= this.bet * 5;
        this.depoCounter.setText(this.deposit.toFixed(2));
        this.stakeCounter.setColor(this.textColors.white)
        this.baseCounter.setText(this.base.toFixed(2));

        // this.buttonUpdate(1)
        this.outCounter.setText('');

        this.cars.forEach((c, index) => {
            c.car.alpha = 1;
            c.counter.setText('X');
            // console.log(index, 'c.car.y', c.car.y)
            c.car.y = c.defaults.y;
            c.dead = false;
            c.value = 0;
            c.delta = Phaser.Math.Between(-10, 10);
            c.crash = 1 / Math.random();
            // if (index === 0) c.crash = 10000 // dev
            c.exit = false;
            c.state = 0
            c.car.setFrame(c.state * 5 + index)

            this.bets[index] = this.bet; // auto bet
        })

        this.buttons.forEach((b) => {
            b.setAlpha(1)
        })

        // sound
        this.sfx.race.play()

        // dev random
        console.log('--- NEW ROUND ---')
        // this.cars.forEach((c, index) => {
        //     // const randomSpeed = Phaser.Math.Between(50, 150);
        //     // c.car.speed = randomSpeed + index * 20;
        //     // console.log(`Car ${index} speed`, c.car.speed);

        //     //
        //     c.delta = Phaser.Math.Between(-10, 10);
        //     // c.delta = -20

        //     const random = Math.random();
        //     c.crash = 1 / random;
        //     // c.counter.setText(c.crash.toFixed(2));
        //     // console.log(index, 'car X', c.crash.toFixed(2), c.delta)
        // })
        // console.log('--- NEW ROUND ---')
        // const random = Math.random();
        // this.targetCrash = 1 / random;
        // // this.targetCrash = 1000 // dev
        // console.log('resetRound', random, 'this.targetCrash', this.targetCrash)

    }
}

// ===== helpers плашек =====
const f2 = v => Number(v).toFixed(2);
const f0 = v => Number(v).toFixed(0);

function formatDigits(v) {
    // if (v >= 1) return v.toFixed(0);
    // if (v >= 0.1) return v.toFixed(1);
    if (v >= 0.01) return v.toFixed(2);
    return v.toFixed(3);
}

function median(arr) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b); // копия с сортировкой
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

// --------------- Boot -------------------
new Phaser.Game({
    type: Phaser.AUTO, // Можно AUTO, CANVAS, WEBGL
    width: 640,
    height: 1120,
    scale: {
        mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.NO_CENTER,
    },
    // scale: {
    //     mode: Phaser.Scale.FIT,
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    // },
    backgroundColor: "#060B14",
    parent: "game",
    scene: [MainScene],
});
