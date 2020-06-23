import $ from 'jquery';

import { AccessType } from '@girder/core/constants';
import { getCurrentUser } from '@girder/core/auth';
import { wrap } from '@girder/core/utilities/PluginUtils';

import QuotaPoliciesWidget from './QuotaPoliciesWidget';

function extendView(View, Template, modelType) {
    const eventSelector = 'click .g-' + modelType + '-policies';
    View.prototype.events[eventSelector] = 'editPolicies';

    const _initialize = View.prototype.initialize;
    View.prototype.initialize = function (settings) {
        this.quota = ((settings || {}).dialog === 'quota');
        _initialize.apply(this, arguments);
    };

    wrap(View, 'render', function (render) {
        /* Add the quota menu item to the resource menu as needed */
        render.call(this);
        const el = $('.g-' + modelType + '-header a.g-delete-' + modelType).closest('li');
        const settings = {
            AccessType: AccessType,
            currentUser: getCurrentUser()
        };
        settings[modelType] = this.model;
        el.before(Template(settings));
        if (this.quota) {
            this.quota = null;
            this.editPolicies();
        }
    });

    View.prototype.editPolicies = function () {
        const widget = new QuotaPoliciesWidget({
            el: $('#g-dialog-container'),
            model: this.model,
            modelType: modelType,
            parentView: this
        }).on('g:saved', function () {
            this.render();
        }, this).on('g:hidden', function () {
            widget.destroy();
        });
    };
}

export default extendView;
