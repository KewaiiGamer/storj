// Copyright (C) 2020 Storj Labs, Inc.
// See LICENSE for copying information.

import { VNode } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import Vuex from 'vuex';

import PayoutHistoryPeriodDropdown from '@/app/components/payments/PayoutHistoryPeriodDropdown.vue';

import { appStateModule } from '@/app/store/modules/appState';
import { makeNodeModule, NODE_MUTATIONS } from '@/app/store/modules/node';
import { makePayoutModule, PAYOUT_MUTATIONS } from '@/app/store/modules/payout';
import { PayoutHttpApi } from '@/storagenode/api/payout';
import { SNOApi } from '@/storagenode/api/storagenode';
import { Satellites } from '@/storagenode/satellite';
import { createLocalVue, shallowMount } from '@vue/test-utils';

let clickOutsideEvent: EventListener;

const localVue = createLocalVue();
localVue.use(Vuex);

localVue.directive('click-outside', {
    bind: function (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
        clickOutsideEvent = function(event: Event): void {
            if (el === event.target) {
                return;
            }

            if (vnode.context) {
                vnode.context[binding.expression](event);
            }
        };

        document.body.addEventListener('click', clickOutsideEvent);
    },
    unbind: function(): void {
        document.body.removeEventListener('click', clickOutsideEvent);
    },
});

const payoutApi = new PayoutHttpApi();
const payoutModule = makePayoutModule(payoutApi);
const nodeApi = new SNOApi();
const nodeModule = makeNodeModule(nodeApi);

const store = new Vuex.Store({ modules: { payoutModule, node: nodeModule, appStateModule }});

describe('PayoutHistoryPeriodDropdown', (): void => {
    it('renders correctly with actual values', async (): Promise<void> => {
        const wrapper = shallowMount(PayoutHistoryPeriodDropdown, {
            store,
            localVue,
        });

        await store.commit(PAYOUT_MUTATIONS.SET_PAYOUT_HISTORY_PERIOD, '2020-05');

        expect(wrapper).toMatchSnapshot();
    });

    it('renders correctly with actual values', async (): Promise<void> => {
        const wrapper = shallowMount(PayoutHistoryPeriodDropdown, {
            store,
            localVue,
        });

        const satelliteInfo = new Satellites([], [], [], [], 0, 0, 0, 0, new Date(2020, 1));

        await store.commit(NODE_MUTATIONS.SELECT_ALL_SATELLITES, satelliteInfo);

        expect(wrapper.vm.isCalendarDisabled).toBe(false);

        await wrapper.find('.period-container').trigger('click');

        expect(wrapper.vm.isCalendarShown).toBe(true);

        expect(wrapper).toMatchSnapshot();
    });
});
