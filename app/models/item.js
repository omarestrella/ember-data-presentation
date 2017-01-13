import DS from 'ember-data';

const {
    attr,
    Model
} = DS;

export default Model.extend({
    done: attr('boolean'),
    content: attr('string')
});

export const code = `import DS from 'ember-data';

const {
    attr,
    Model
} = DS;

export default Model.extend({
    done: attr('boolean'),
    content: attr('string')
});`;
