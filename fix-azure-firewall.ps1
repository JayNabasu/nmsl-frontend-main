# Azure PostgreSQL Firewall Configuration for Azure App Service
# This script helps you configure Azure PostgreSQL to allow connections from Azure App Service

Write-Host "🔧 Azure PostgreSQL Firewall Fix for Azure App Service" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$serverName = "nmslwebportaltestdb"
$resourceGroup = Read-Host "Enter your Azure Resource Group name"

Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "1. Allow all Azure services (recommended - backend is on Azure App Service)"
Write-Host "2. Allow all IPs temporarily (0.0.0.0-255.255.255.255) - for testing"
Write-Host "3. Add specific IP range"
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "Allowing all Azure services..." -ForegroundColor Green
        az postgres server firewall-rule create `
            --resource-group $resourceGroup `
            --server-name $serverName `
            --name "AllowAllAzureServices" `
            --start-ip-address 0.0.0.0 `
            --end-ip-address 0.0.0.0
    }
    "2" {
        Write-Host "⚠️  WARNING: This allows ALL IPs - only for testing!" -ForegroundColor Yellow
        az postgres server firewall-rule create `
            --resource-group $resourceGroup `
            --server-name $serverName `
            --name "AllowAllIPs-TEMP" `
            --start-ip-address 0.0.0.0 `
            --end-ip-address 255.255.255.255
    }
    "3" {
        Write-Host "Note: Enter the outbound IP range for your Azure App Service." -ForegroundColor Yellow
        $startIp = Read-Host "Enter start IP address"
        $endIp = Read-Host "Enter end IP address"
        az postgres server firewall-rule create `
            --resource-group $resourceGroup `
            --server-name $serverName `
            --name "AzureAppServiceIPRange" `
            --start-ip-address $startIp `
            --end-ip-address $endIp
    }
}

Write-Host ""
Write-Host "✅ Firewall rule created!" -ForegroundColor Green
Write-Host ""
Write-Host "Current firewall rules:" -ForegroundColor Cyan
az postgres server firewall-rule list `
    --resource-group $resourceGroup `
    --server-name $serverName `
    --output table

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your Azure App Service"
Write-Host "2. Check the logs for database connection"
Write-Host "3. If still failing, try option 1 (allow all Azure services)"
