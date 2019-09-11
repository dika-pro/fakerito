const _ = require('lodash');

module.exports = {
    api: {
        IS_VISIBLE_TO_CLIENT: {
            positive: function(params) {
                const task = params.task; 
                if (task.data.fields.description.raw.indexOf('**Visible to client:** Yes') >= 0) {
                    return true;
                }
                return false;
            },
            ICON: 'eye'
        },
        HAS_DOWNTIME: {
           positive: function(params) {
                const task = params.task; 
                if (task.data.fields.description.raw.indexOf('**Downtime**: Yes') >= 0) {
                    return true;
                }
                return false;
            },
            ICON: 'arrow-circle-o-down'
        },
        IS_PATCH: {
            positive: function(params) {
                 const task = params.task; 
                 const isPatch = _.find(task.data.attachments.projects.projectPHIDs, 'PHID-PROJ-ybfgysjchkqm6ooarhbx');
                 if (isPatch) {
                     return true;
                 }
                 return false;
             },
             ICON: 'arrow-circle-o-up'
         }
    },
    IS_VISIBLE_TO_CLIENT: 'IS_VISIBLE_TO_CLIENT',
    HAS_DOWNTIME: 'HAS_DOWNTIME',
    IS_PATCH: 'IS_PATCH'
}