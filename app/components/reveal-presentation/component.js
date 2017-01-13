import Ember from 'ember';

const { Reveal } = window;

const {
    Component
} = Ember;

export default Component.extend({
    classNames: ['presentation', 'reveal'],

    didInsertElement() {
        this._super(...arguments);

        Reveal.initialize({
            center: false,
            width: '100%',
            height: '100%',
            margin: 0,
            minScale: 1,
            maxScale: 1
        });

        // Reveal.slide(6);
    }
});
