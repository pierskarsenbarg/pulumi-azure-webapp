using System.Threading.Tasks;
using Pulumi;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureWebapp;

class MyStack : Stack
{

    public MyStack()
    {
        // Create an Azure Resource Group
        var resourceGroup = new ResourceGroup("resourceGroup");
        var app = new AzureWebApp("mywebapp", new AzureWebAppArgs
        {
            ResourceGroupName = resourceGroup.Name,
            PathToDockerfile = "../app",
            WebsitePort = 80
        });

        this.Url = app.WebsiteUrl;
    }

    [Output]
    public Output<string> Url { get; set; }
}
