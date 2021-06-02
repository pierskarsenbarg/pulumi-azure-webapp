// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export class AzureWebApp extends pulumi.ComponentResource {
    /** @internal */
    public static readonly __pulumiType = 'x:index:AzureWebApp';

    /**
     * Returns true if the given object is an instance of AzureWebApp.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is AzureWebApp {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === AzureWebApp.__pulumiType;
    }

    /**
     * The website URL.
     */
    public /*out*/ readonly websiteUrl!: pulumi.Output<string>;

    /**
     * Create a AzureWebApp resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: AzureWebAppArgs, opts?: pulumi.ComponentResourceOptions) {
        let inputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            if ((!args || args.pathToDockerfile === undefined) && !opts.urn) {
                throw new Error("Missing required property 'pathToDockerfile'");
            }
            if ((!args || args.resourceGroupName === undefined) && !opts.urn) {
                throw new Error("Missing required property 'resourceGroupName'");
            }
            if ((!args || args.websitePort === undefined) && !opts.urn) {
                throw new Error("Missing required property 'websitePort'");
            }
            inputs["appServicePlanId"] = args ? args.appServicePlanId : undefined;
            inputs["pathToDockerfile"] = args ? args.pathToDockerfile : undefined;
            inputs["resourceGroupName"] = args ? args.resourceGroupName : undefined;
            inputs["websitePort"] = args ? args.websitePort : undefined;
            inputs["websiteUrl"] = undefined /*out*/;
        } else {
            inputs["websiteUrl"] = undefined /*out*/;
        }
        if (!opts.version) {
            opts = pulumi.mergeOptions(opts, { version: utilities.getVersion()});
        }
        super(AzureWebApp.__pulumiType, name, inputs, opts, true /*remote*/);
    }
}

/**
 * The set of arguments for constructing a AzureWebApp resource.
 */
export interface AzureWebAppArgs {
    /**
     * Id of app service plan to add web app to
     */
    appServicePlanId?: pulumi.Input<string>;
    /**
     * Path to dockerfile for app
     */
    pathToDockerfile: pulumi.Input<string>;
    /**
     * Resource group to place resources in
     */
    resourceGroupName: pulumi.Input<string>;
    /**
     * Port that container is running on
     */
    websitePort: pulumi.Input<number>;
}
