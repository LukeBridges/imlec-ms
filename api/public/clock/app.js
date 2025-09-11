Vue.createApp({
    template: '<div id="clock"><span id="mins">{{mins}}</span><span id="seperator">{{sep}}</span><span id="secs">{{secs}}</span></div>\n' +
        '<div id="countdown_clock"><span id="countdown_mins">{{c_mins}}</span><span id="countdown_seperator">{{sep}}</span><span id="countdown_secs">{{c_secs}}</span></div>\n' +
        '<div id="progress_bar" :class="classObject" :style="{width: getWidth()}">&nbsp;</div>',
    data() {
        return {
            mins: 0,
            secs: 0,
            sep: false,
            c_mins: 0,
            c_secs: 0,
            progress: 0,
            minutes: 0,
            seconds: 0,
            seperator: false,
            doubleSpace: false,
            c_time: c_start,
            running: false,
            timer: null,
        }
    },
    computed: {
        classObject: function () {
            return {
                red_background: this.showRed(),
                green_background: !this.showRed(),
            };
        },
    },
    methods: {
        getSeperator: function (seperator) {
            return seperator ? ':' : ' ';
        },
        getTime: function (time) {
            return time < 10 ? '0' + time : time;
        },
        getCountdownMins: function (left) {
            return Math.trunc(left / 60);
        },
        getCountdownSecs: function (left) {
            return this.progress - (Math.trunc(left / 60) * 60);
        },
        update: function (
            minutes = this.mins, seconds = this.secs, c_time = this.progress,
            seperator = this.sep) {
            this.mins = this.getTime(minutes);
            this.secs = this.getTime(seconds);
            this.sep = this.getSeperator(seperator);
            this.progress = c_time;
            this.c_mins = this.getTime(this.getCountdownMins(c_time));
            this.c_secs = this.getTime(this.getCountdownSecs(c_time));
            return true;
        },
        resetClock: function () {
            this.sep = true;
            this.progress = c_start;
            this.mins = 0;
            this.secs = 0;
            this.c_mins = 0;
            this.c_secs = 0;

            this.update();
        },
        showRed() {
            return this.progress < 300;
        },
        getWidth () {
            return (((c_start - this.progress) / c_start) * 100) + '%';
        },
        timerFunc() {
            this.seperator = !this.seperator;

            this.seconds++;
            if (this.c_time > 0) {
                this.c_time--;
            }
            if (this.seconds >= 60) {
                this.seconds = 0;
                this.minutes++;
            }

            this.doubleSpace = false;

            this.update(this.minutes, this.seconds, this.c_time, this.seperator);
        }
    },
    mounted() {
        this.resetClock();
    },
    created() {
        window.addEventListener('keypress', (e) => {
            switch (e.which) {
                case 32: //SPACE
                    if (!this.running) {
                        this.timer = setInterval(this.timerFunc, 1000);
                        this.running = true;
                    } else if (this.doubleSpace) {
                        this.doubleSpace = false;
                        this.running = false;
                        clearInterval(this.timer);
                    } else {
                        this.doubleSpace = true;
                    }
                    break;
                case 13: //ENTER
                    if (!this.running) {
                        this.minutes = 0;
                        this.seconds = 0;
                        this.c_time = c_start;
                        this.resetClock();
                    }
                    break;
                default:
                    break;
            }
        });
    },
}).mount('#wrapper');
