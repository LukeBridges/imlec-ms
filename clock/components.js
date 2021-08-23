Vue.component('clock', {
  props: ['mins', 'sep', 'secs'],
  template: '<div id="clock"><span id="mins">{{mins}}</span><span id="seperator">{{sep}}</span><span id="secs">{{secs}}</span></div>',
});

Vue.component('countdown_clock', {
  props: ['mins', 'sep', 'secs'],
  template: '<div id="countdown_clock"><span id="countdown_mins">{{mins}}</span><span id="countdown_seperator">{{sep}}</span><span id="countdown_secs">{{secs}}</span></div>',
});

Vue.component('progress_bar', {
  props: ['progress'],
  template: '<div id="progress_bar" v-bind:class="classObject" v-bind:style="{width: getWidth()}">&nbsp;</div>',
  computed: {
    classObject: function() {
      return {
        red_background: this.showRed(),
        green_background: !this.showRed(),
      };
    },
  },
  methods: {
    showRed: function() {
      return this.progress < 300;
    },
    getWidth: function() {
      return (((c_start - this.progress) / c_start) * 100) + '%';
    },
  },
});
