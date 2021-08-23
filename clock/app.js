let app = new Vue({
  el: '#wrapper',
  data: {
    mins: 0,
    secs: 0,
    sep: false,
    c_mins: 0,
    c_secs: 0,
    progress: 0,
  },
  methods: {
    getSeperator: function(seperator) {
      return seperator ? ':' : ' ';
    },
    getTime: function(time) {
      return time < 10 ? '0' + time : time;
    },
    getCountdownMins: function(left) {
      return Math.trunc(left / 60);
    },
    getCountdownSecs: function(left) {
      return this.progress - (Math.trunc(left / 60) * 60);
    },
    update: function(
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
    resetClock: function() {
      this.sep = true;
      this.progress = c_start;
      this.mins = 0;
      this.secs = 0;
      this.c_mins = 0;
      this.c_secs = 0;

      app.update();
    },
  },
});
