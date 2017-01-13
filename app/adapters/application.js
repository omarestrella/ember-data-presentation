import Ember from 'ember';
import DS from 'ember-data';

// Heavily inspired by: https://github.com/firebase/emberfire/blob/master/addon/adapters/firebase.js
// Some code switched for ease of use

const {
    run,
    inject,
    RSVP
} = Ember;

const {
    Adapter
} = DS;

export default Adapter.extend({
    store: inject.service(),

    init() {
        this._super(...arguments);

        this._ref = this.get('store.database');
        this._recordCacheForType = {};
        this._mapForType = {};
    },

    generateIdForRecord() {
        return this._ref.push().key;
    },

    findRecord(store, typeClass, id) {
        const ref = this._getCollectionRef(typeClass, id);
        return this._fetch(ref).then(record => {
            return record.val();
        });
    },

    findAll(store, typeClass) {
        const ref = this._getCollectionRef(typeClass);
        return this._fetch(ref).then(records => {
            if (!this._mapForType[typeClass.modelName]) {
                this._addEventListeners(store, typeClass, ref);
            }
            const results = [];

            records.forEach(record => {
                const payload = record.val();
                if (!payload.id) {
                    payload.id = record.key;
                }
                // this._updateRecordCacheForType(typeClass, payload, store);
                results.push(payload);
            });

            return results;
        });
    },

    updateRecord(store, typeClass, snapshot) {
        const recordRef = this._getCollectionRef(snapshot);
        // const recordCache = this._getRecordCache(typeClass, snapshot.id);
        const serializedRecord = snapshot.serialize({
            includeId: true
        });

        return new RSVP.Promise(resolve => {
            const data = {
                [snapshot.id]: serializedRecord
            };
            recordRef.update(data).then(() => {
                const relationships = [];
                snapshot.record.eachRelationship((key, relationship) => {
                    const ids = serializedRecord[key];
                    ids.forEach(id => {
                        const item = store.peekRecord(relationship.type, id);
                        relationships.push(item.save());
                    });
                });

                return Ember.RSVP.allSettled(relationships);
            }).then(() => {
                resolve(serializedRecord);
            });
        });
    },

    createRecord(store, typeClass, snapshot) {
        return this.updateRecord(store, typeClass, snapshot).then(() => {
            this.listenForChanges(store, typeClass, snapshot.record);
        });
    },

    deleteRecord(store, typeClass, snapshot) {
        return this._getCollectionRef(typeClass, snapshot.id).remove();
    },

    listenForChanges(store, typeClass, record) {
        record.__listening = true;
        var ref = this._getCollectionRef(typeClass, record.id);
        var called = false;
        ref.on('value', (snapshot) => {
            if (called) {
                run(() => {
                    this._handleEvent(store, typeClass, snapshot);
                });
            }
            called = true;
        });
    },

    _getRecordCache(typeClass, id) {
        const modelName = typeClass.modelName;
        const cache = this._recordCacheForType;
        cache[modelName] = cache[modelName] || {};
        cache[modelName][id] = cache[modelName][id] || {};
        return cache[modelName][id];
    },

    _fetch(ref) {
        return new RSVP.Promise(resolve => {
            ref.once('value', data => {
                run(null, resolve, data);
            });
        });
    },

    _addEventListeners(store, typeClass, ref) {
        const modelName = typeClass.modelName;

        this._mapForType[modelName] = true;

        ref.on('child_added', snapshot => {
            if (!store.hasRecordForId(modelName, snapshot.key)) {
                this._handleEvent(store, typeClass, snapshot);
            }
        });
        ref.on('child_removed', snapshot => {
            if (store.hasRecordForId(modelName, snapshot.key)) {
                this._handleEvent(store, typeClass, snapshot, 'child_removed');
            }
        });
    },

    _handleEvent(store, typeClass, snapshot, eventType = 'child_added') {
        const type = typeClass.modelName;
        const payload = snapshot.val();
        if (eventType === 'child_removed') {
            const id = snapshot.key;
            const record = store.peekRecord(type, id);
            if (!record.get('isDeleted')) {
                record.deleteRecord();
                record.save();
            }
        } else {
            store.push(store.normalize(type, payload));
        }
    },

    _getCollectionRef(typeClass, id) {
        let ref = this._ref;
        if (typeClass) {
            ref = ref.child(Ember.String.pluralize(typeClass.modelName));
        }
        if (id) {
            ref = ref.child(id);
        }
        return ref;
    }
});

export const code = `import Ember from 'ember';
import DS from 'ember-data';

const {
    run,
    inject,
    RSVP
} = Ember;

const {
    Adapter
} = DS;

export default Adapter.extend({
    store: inject.service(),

    init() {
        this._super(...arguments);

        this._ref = this.get('store.database');
        this._recordCacheForType = {};
        this._mapForType = {};
    },

    generateIdForRecord() {
        return this._ref.push().key;
    },

    findRecord(store, typeClass, id) {
        const ref = this._getCollectionRef(typeClass, id);
        return this._fetch(ref).then(record => {
            return record.val();
        });
    },

    findAll(store, typeClass) {
        const ref = this._getCollectionRef(typeClass);
        return this._fetch(ref).then(records => {
            if (!this._mapForType[typeClass.modelName]) {
                this._addEventListeners(store, typeClass, ref);
            }
            const results = [];

            records.forEach(record => {
                const payload = record.val();
                if (!payload.id) {
                    payload.id = record.key;
                }
                results.push(payload);
            });

            return results;
        });
    },

    updateRecord(store, typeClass, snapshot) {
        const recordRef = this._getCollectionRef(snapshot);
        const serializedRecord = snapshot.serialize({
            includeId: true
        });

        return new RSVP.Promise(resolve => {
            const data = {
                [snapshot.id]: serializedRecord
            };
            recordRef.update(data).then(() => {
                const relationships = [];
                snapshot.record.eachRelationship((key, relationship) => {
                    const ids = serializedRecord[key];
                    ids.forEach(id => {
                        const item = store.peekRecord(relationship.type, id);
                        relationships.push(item.save());
                    });
                });

                return Ember.RSVP.allSettled(relationships);
            }).then(() => {
                resolve(serializedRecord);
            });
        });
    },

    createRecord(store, typeClass, snapshot) {
        return this.updateRecord(store, typeClass, snapshot).then(() => {
            this.listenForChanges(store, typeClass, snapshot.record);
        });
    },

    deleteRecord(store, typeClass, snapshot) {
        return this._getCollectionRef(typeClass, snapshot.id).remove();
    },

    listenForChanges(store, typeClass, record) {
        record.__listening = true;
        var ref = this._getCollectionRef(typeClass, record.id);
        var called = false;
        ref.on('value', (snapshot) => {
            if (called) {
                run(() => {
                    this._handleEvent(store, typeClass, snapshot);
                });
            }
            called = true;
        });
    },

    _getRecordCache(typeClass, id) {
        const modelName = typeClass.modelName;
        const cache = this._recordCacheForType;
        cache[modelName] = cache[modelName] || {};
        cache[modelName][id] = cache[modelName][id] || {};
        return cache[modelName][id];
    },

    _fetch(ref) {
        return new RSVP.Promise(resolve => {
            ref.once('value', data => {
                run(null, resolve, data);
            });
        });
    },

    _addEventListeners(store, typeClass, ref) {
        const modelName = typeClass.modelName;

        this._mapForType[modelName] = true;

        ref.on('child_added', snapshot => {
            if (!store.hasRecordForId(modelName, snapshot.key)) {
                this._handleEvent(store, typeClass, snapshot);
            }
        });
        ref.on('child_removed', snapshot => {
            if (store.hasRecordForId(modelName, snapshot.key)) {
                this._handleEvent(store, typeClass, snapshot, 'child_removed');
            }
        });
    },

    _handleEvent(store, typeClass, snapshot, eventType = 'child_added') {
        const type = typeClass.modelName;
        const payload = snapshot.val();
        if (eventType === 'child_removed') {
            const id = snapshot.key;
            const record = store.peekRecord(type, id);
            if (!record.get('isDeleted')) {
                record.deleteRecord();
                record.save();
            }
        } else {
            store.push(store.normalize(type, payload));
        }
    },

    _getCollectionRef(typeClass, id) {
        let ref = this._ref;
        if (typeClass) {
            ref = ref.child(Ember.String.pluralize(typeClass.modelName));
        }
        if (id) {
            ref = ref.child(id);
        }
        return ref;
    }
});`;
