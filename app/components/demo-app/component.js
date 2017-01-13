import Ember from 'ember';

const {
    inject,
    computed,
    Component
} = Ember;

export default Component.extend({
    classNames: ['demo-app'],

    store: inject.service(),

    actions: {
        save(name) {
            const model = this.get('store').createRecord('list', {
                name
            });

            model.save();
        },

        selectList(list) {
            this.set('currentList', list);
        },

        addNewItem() {
            const list = this.get('currentList');
            const item = this.get('store').createRecord('item', {
                content: '',
                done: false
            });

            list.get('items').addObject(item);
            list.save();
        },

        restoreList(list) {
            list.rollbackAttributes();
        },

        deleteList(list) {
            this.set('currentList', null);

            list.deleteRecord();
            list.save();
        },

        sendListToTrash(list) {
            list.deleteRecord();
            this.set('currentList', this.get('activeLists.firstObject'));
        }
    },

    activeLists: computed('lists.[]', 'lists.@each.isDeleted', function () {
        return this.get('lists').rejectBy('isDeleted');
    }),

    deletedLists: computed('lists.[]', 'lists.@each.isDeleted', function () {
        return this.get('lists').filterBy('isDeleted');
    })
});
