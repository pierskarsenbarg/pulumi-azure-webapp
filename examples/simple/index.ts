import * as resources from "@pulumi/azure-native/resources";
import { WebAppContainer } from "./webAppContainer";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("test-rg");

const webapp = new WebAppContainer("testapp", {
    resourceGroupName: resourceGroup.name,
    pathToDockerFile: "./app",
    websitePort: 80
});

export const url = webapp.url;