# This script reads configuration from a .env file and deploys the backend.

Write-Host "Starting deployment..."
Write-Host "------------------------------------"

# --- Read variables from the .env file ---
Write-Host "Reading configuration from .env file..."
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found. Please create it from .env.example."
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^(?!#)([^=]+)=(.*)') {
        $key = $Matches[1].Trim()
        $value = $Matches[2].Trim()
        $envVars[$key] = $value
    }
}

# --- THIS IS THE CORRECTED LINE ---
$gcloudEnvVars = ($envVars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ","
# --- END OF CORRECTION ---

Write-Host ".env file loaded successfully."
Write-Host "------------------------------------"

# Step 1: Set the Service Account variable
Write-Host "Setting Service Account variable..."
$env:SERVICE_ACCOUNT_EMAIL = gcloud iam service-accounts list --filter='displayName:"Lexi Simplify Function Service Account"' --format='value(email)'

if (-not $env:SERVICE_ACCOUNT_EMAIL) {
    Write-Host "ERROR: Could not find the service account."
    exit 1
}
Write-Host "Service Account set to: $env:SERVICE_ACCOUNT_EMAIL"
Write-Host "------------------------------------"

# Step 2: Deploy the 'processor' function
Write-Host "Deploying the 'process-document-chroma' function..."
Set-Location "$PSScriptRoot\backend\services\document-processor"
gcloud functions deploy process-document-chroma `
  --gen2 `
  --runtime=python311 `
  --region=asia-south1 `
  --source=. `
  --entry-point=process_document_for_chroma `
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" `
  --trigger-event-filters="bucket=$($envVars['FINAL_DB_BUCKET'])" `
  --memory=1GiB `
  --cpu=1 `
  --service-account=$env:SERVICE_ACCOUNT_EMAIL `
  --timeout=540s `
  --allow-unauthenticated `
  --set-env-vars=$gcloudEnvVars
Set-Location $PSScriptRoot
Write-Host "'process-document-chroma' deployment submitted."
Write-Host "------------------------------------"

# Step 3: Deploy the 'query' function
Write-Host "Deploying the 'document-query' function..."
Set-Location "$PSScriptRoot\backend\services\document-query"
$queryEnvVars = "GCP_PROJECT_ID=$($envVars['GCP_PROJECT_ID']),VERTEXAI_LOCATION=$($envVars['VERTEXAI_LOCATION']),FINAL_DB_BUCKET=$($envVars['FINAL_DB_BUCKET'])"
gcloud functions deploy document-query `
  --gen2 `
  --runtime=python311 `
  --region=asia-south1 `
  --source=. `
  --entry-point=query_document `
  --trigger-http `
  --allow-unauthenticated `
  --memory=1GiB `
  --service-account=$env:SERVICE_ACCOUNT_EMAIL `
  --timeout=120s `
  --set-env-vars=$queryEnvVars
Set-Location $PSScriptRoot
Write-Host "'document-query' deployment submitted."
Write-Host "------------------------------------"

Write-Host "Deployment of all functions submitted successfully!"