import DS from 'ember-data';

const {
    attr,
    hasMany,
    Model
} = DS;

export default Model.extend({
    name: attr('string'),
    items: hasMany('item')
});

export const code = `import DS from 'ember-data';

const {
    attr,
    hasMany,
    Model
} = DS;

export default Model.extend({
    name: attr('string'),
    items: hasMany('item')
});`;
