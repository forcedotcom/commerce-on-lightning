/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { addAllowedArgs, modifyArgFlag } from '../../../../lib/utils/args/flagsUtils';
import { EXAMPLE_DIR, FILE_COPY_ARGS } from '../../../../lib/utils/constants/properties';
import { shellJsonSfdx } from '../../../../lib/utils/shell';
import { FilesCopy } from '../../files/copy';
import { appendCommonFlags, setApiVersion } from '../../../../lib/utils/args/flagsUtils';
import { Location, PickListValueResult } from '../../../../lib/utils/jsonUtils';
Messages.importMessagesDirectory(__dirname);

const TOPIC = 'ordermanagement';
const CMD = `commerce:${TOPIC}:quickstart:setup`;
const msgs = Messages.loadMessages('@salesforce/commerce', TOPIC);
export const QUERY_LOCATION_TYPES =
    "SELECT Id,Value FROM PicklistValueInfo WHERE EntityParticleId = 'Location.LocationType'";

export class OrderManagementQuickstartSetup extends SfdxCommand {
    public static readonly requiresUsername = true;
    public static description = msgs.getMessage('quickstart.setup.cmdDescription');

    public static examples = [`sfdx ${CMD} `]; // TODO documentation including examples and descriptions
    protected static flagsConfig = {
        prompt: flags.boolean({
            char: 'y',
            default: false,
            description: 'If there is a file difference detected, prompt before overwriting file',
        }),
    };
    public org: Org;

    public async run(): Promise<AnyJson> {
        await setApiVersion(this.org, this.flags);
        // Copy example files
        FILE_COPY_ARGS.forEach((v) => modifyArgFlag(v.args, v.value, this.argv));
        await FilesCopy.run(addAllowedArgs(this.argv, FilesCopy), this.config);

        this.ux.log(msgs.getMessage('quickstart.setup.pushingOrderManagementMetadataToOrg'));

        this.deployMetadata();
        await this.addLocations();
        return { quickstartSetupComplete: true };
    }

    private deployMetadata(): void {
        this.ux.log(msgs.getMessage('quickstart.setup.deployFlowsToOrg'));
        let deployResult = shellJsonSfdx(
            appendCommonFlags(
                `sfdx force:mdapi:deploy -u "${this.org.getUsername()}" -d ${EXAMPLE_DIR}/som/ -w 1`,
                this.flags,
                this.logger
            )
        );
        this.ux.log(JSON.stringify(deployResult, null, 4));

        /*
         Note: There is a known bug that actions and related flows can not be deployed together
         https://issues.salesforce.com/issue/a028c00000gAxFuAAK/deployment-of-a-flow-component-recordactiondeployment-component-together-fails
         */
        this.ux.log(msgs.getMessage('quickstart.setup.deployActionsToOrg'));
        deployResult = shellJsonSfdx(
            appendCommonFlags(
                `sfdx force:mdapi:deploy -u "${this.org.getUsername()}" -d ${EXAMPLE_DIR}/som/actions/ -w 1`,
                this.flags,
                this.logger
            )
        );
        this.ux.log(JSON.stringify(deployResult, null, 4));
    }

    private async addLocations(): Promise<void> {
        this.ux.log(msgs.getMessage('quickstart.setup.addingLocations'));
        // get location types
        const cmd = appendCommonFlags(
            `sfdx force:data:soql:query -u "${this.org.getUsername()}" -q "${QUERY_LOCATION_TYPES}"`,
            this.flags,
            this.logger
        );
        const queryResult = shellJsonSfdx<PickListValueResult>(cmd);
        const locationTypes = queryResult.result.records;

        // get existing locations
        const locations: Array<Partial<Location>> = await this.org
            .getConnection()
            .sobject('Location')
            .select(['LocationType']);

        // Add a location for each location type if not exists
        for (const locationType of locationTypes) {
            if (!locations.find((location) => location.LocationType === locationType.Value)) {
                this.logger.debug(`Adding location ${locationType.Value}`);
                const result = await this.org
                    .getConnection()
                    .sobject('Location')

                    .create({ Name: locationType.Value, LocationType: locationType.Value });

                if (result.success !== true) {
                    throw new SfdxError(JSON.stringify(result, null, 4));
                }
            }
        }
    }
}
