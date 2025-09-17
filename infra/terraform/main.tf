# main.tf - Defines our core cloud infrastructure

# 1. Configure the Google Cloud provider
# This tells Terraform which project to work in.
provider "google" {
  project = var.gcp_project_id # <-- IMPORTANT: Replace with your actual GCP Project ID
  region  = "asia-south1"
}

# 2. Define the Google Cloud Storage bucket
# This is the secure container for user document uploads.
resource "google_storage_bucket" "document_uploads" {
  # Bucket names must be globally unique.
  name          = "lexi-simplify-uploads-20250827-v9k3" # <-- IMPORTANT: Replace with a unique name
  
  # We chose the Mumbai region to be close to our initial users.
  location      = "asia-south1"
  
  # This is a key security setting that enforces uniform access control.
  uniform_bucket_level_access = true

  # This CORS policy allows our web app to upload files directly.
  cors {
    origin          = ["http://localhost:3000", "https://*.lexi-simplify.app"]
    method          = ["POST", "PUT"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }
}