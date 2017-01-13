import DS from 'ember-data';

const {
    Store
} = DS;

export default Store.extend({
    init() {
        this._super(...arguments);

        this.database = window.firebase.database().ref();
    }
});
