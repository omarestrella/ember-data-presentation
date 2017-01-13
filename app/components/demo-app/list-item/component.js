import Ember from 'ember';

const {
    Component
} = Ember;

export default Component.extend({
    classNames: ['list-item'],

    item: null,

    actions: {
        toggleDone() {
            const item = this.get('item');
            item.toggleProperty('done');
            item.save();
        },

        saveContent(event) {
            const item = this.get('item');
            item.set('content', event.target.value);
            item.save();
        }
    }
});
