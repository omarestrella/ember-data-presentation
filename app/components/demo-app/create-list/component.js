import Ember from 'ember';

const {
    Component
} = Ember;

export default Component.extend({
    classNames: ['create-list'],

    listName: '',
    showForm: false,

    actions: {
        toggleForm() {
            this.set('showForm', true);
        },

        setName(event) {
            this.set('listName', event.target.value);
        },

        save() {
            const name = this.get('listName');
            this.get('save')(name);

            this.set('listName', '');
            this.set('showForm', false);
        }
    }
});
