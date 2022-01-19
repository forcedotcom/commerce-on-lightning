import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { listContent } from 'lightning/cmsDeliveryApi';
import communityId from '@salesforce/community/Id';

export default class StoreLogo extends NavigationMixin(LightningElement) {
    @api
    height;

    @api
    width;

    @api
    alternateText;

    @api
    alignment;

    @api
    imageUrl;

    contentKeys = [undefined];

    @api get cmsContentId() {
        return this.contentKeys[0];
    }

    set cmsContentId(id) {
        this.contentKeys = [id];
    }

    homeURL = basePath;

    @wire(listContent, { communityId: communityId, contentKeys: '$contentKeys' })
    onListContent(results) {
        const content = results.data;
        if (!this.imageUrl && content && content.items) {
            this.imageUrl = basePath.replace('/s', '') + content.items[0]?.contentNodes?.source?.url;
        }
    }

    get getAlignmentClass() {
        let alignmentClass = 'slds-grid ';
        if (this.alignment === 'Center') {
            alignmentClass += 'slds-grid_align-center';
        } else if (this.alignment === 'Right') {
            alignmentClass += 'slds-grid_align-end';
        }
        return alignmentClass;
    }

    handleClick(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home',
            },
        });
    }
}
