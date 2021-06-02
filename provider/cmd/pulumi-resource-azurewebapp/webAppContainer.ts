import * as azure from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { Output, ComponentResource, ComponentResourceOptions } from "@pulumi/pulumi"

export interface WebAppContainerArgs {
    resourceGroupName: Output<string>,
    appServicePlanId?: Output<string> | "",
    websitePort: number,
    pathToDockerfile: string
}

type Registry = {
    username: Output<string>;
    password: Output<string>;
    url: Output<string>;
}

export class WebAppContainer extends ComponentResource {
    public readonly websiteUrl: Output<string>;
    private _componentName: string;
    constructor(name: string, args: WebAppContainerArgs, opts?: ComponentResourceOptions) {
        super("azure:infrastructure:webappcontainer", name, opts);
        this._componentName = name;

        let appServicePlanId: pulumi.Input<string>;
        if (args.appServicePlanId === "" || args.appServicePlanId === undefined) {
            appServicePlanId = this.buildAppServicePlan(args.resourceGroupName);
        } else {
            appServicePlanId = args.appServicePlanId!;
        }

        let containerRegistry: azure.containerregistry.Registry = this.buildContainerRegistry(args.resourceGroupName);
        let registryDetails: Registry = this.getRegistryCredentials(args.resourceGroupName, containerRegistry);

        const image = new docker.Image(`${name}image`, {
            imageName: pulumi.interpolate`${registryDetails.url}/${name}:v1.0.0`,
            build: {
                context: args.pathToDockerfile
            },
            registry: {
                server: registryDetails.url,
                username: registryDetails.username,
                password: registryDetails.password
            }
        }, { parent: this })

        const app = new azure.web.WebApp(`${name}-webapp`, {
            resourceGroupName: args.resourceGroupName,
            serverFarmId: appServicePlanId,
            siteConfig: {
                appSettings: [
                    {
                        name: "WEBSITES_ENABLE_APP_SERVICE_STORAGE",
                        value: "false",
                    },
                    {
                        name: "DOCKER_REGISTRY_SERVER_URL",
                        value: pulumi.interpolate`https://${registryDetails.url}`,
                    },
                    {
                        name: "DOCKER_REGISTRY_SERVER_USERNAME",
                        value: registryDetails.username,
                    },
                    {
                        name: "DOCKER_REGISTRY_SERVER_PASSWORD",
                        value: registryDetails.password,
                    },
                    {
                        name: "WEBSITES_PORT",
                        value: "80", // Our custom image exposes port 80. Adjust for your app as needed.
                    },
                ],
                alwaysOn: true,
                linuxFxVersion: pulumi.interpolate`DOCKER|${image.imageName}`,
            },
            httpsOnly: true,
        }, { parent: this });

        this.websiteUrl = pulumi.interpolate`https://${app.defaultHostName}`;

        this.registerOutputs({
            url: this.websiteUrl,
        });
    }

    private buildAppServicePlan(resourceGroupName: pulumi.Input<string>): pulumi.Output<string> {
        const appServicePlan = new azure.web.AppServicePlan(`${this._componentName}-appserviceplan`, {
            resourceGroupName: resourceGroupName,
            kind: "Linux",
            reserved: true,
            sku: {
                name: "B1",
                tier: "basic"
            }
        }, { parent: this });

        return appServicePlan.id;
    }

    private getRegistryCredentials(resourceGroupName: pulumi.Input<string>, containerRegistry: azure.containerregistry.Registry): Registry {
        const credentials: Registry = pulumi.all([resourceGroupName, containerRegistry.name])
            .apply(([resourceGroupName, registryName]) => {
                const credentials = pulumi.output(azure.containerregistry.listRegistryCredentials({
                    registryName,
                    resourceGroupName
                }));

                return {
                    username: credentials.apply(x => x.username!),
                    password: credentials.apply(x => x.passwords![0].value!),
                    url: containerRegistry.loginServer
                };
            });
        return credentials;
    }

    private buildContainerRegistry(resourceGroupName: pulumi.Input<string>): azure.containerregistry.Registry {
        return new azure.containerregistry.Registry(`${this._componentName}Registry`, {
            resourceGroupName: resourceGroupName,
            adminUserEnabled: true,
            sku: {
                name: "Basic"
            }
        }, { parent: this });
    }
}