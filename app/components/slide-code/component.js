import Ember from 'ember';

const {
    run,
    Component
} = Ember;

export default Component.extend({
    tagName: 'pre',
    classNames: ['slide-code'],

    code: null,
    module: null,

    init() {
        this._super(...arguments);

        const mod = this.get('module');
        if (mod) {
            this.set('code', window.requirejs(`presentation/${mod}`).code);
        }
    },

    didInsertElement() {
        this._super(...arguments);

        run.scheduleOnce('afterRender', this, this.highlight);
    },

    highlight() {
        window.hljs.highlightBlock(this.$('code')[0]);
    }
});
