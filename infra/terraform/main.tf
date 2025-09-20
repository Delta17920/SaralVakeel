terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.50.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

data "google_project" "project" {
  project_id = var.gcp_project_id
}

# --- Final Upload & DB Bucket ---
resource "google_storage_bucket" "uploads_bucket" {
  name                        = "lexi-simplify-uploads-v4"
  location                    = var.region
  uniform_bucket_level_access = true
}

# --- Dedicated Service Account for the Function ---
resource "google_service_account" "function_sa" {
  account_id   = "lexi-simplify-func-sa"
  display_name = "Lexi Simplify Function Service Account"
}

# --- Permissions for the Dedicated Service Account ---
# Allows use of Vertex AI and Document AI
resource "google_project_iam_member" "function_sa_ai_user" {
  project = var.gcp_project_id
  role    = "roles/aiplatform.user"
  member  = google_service_account.function_sa.member
}

resource "google_project_iam_member" "function_sa_docai_editor" {
  project = var.gcp_project_id
  role    = "roles/documentai.editor"
  member  = google_service_account.function_sa.member
}

# Allows reading and writing files to the GCS bucket
resource "google_project_iam_member" "function_sa_storage_admin" {
  project = var.gcp_project_id
  role    = "roles/storage.objectAdmin"
  member  = google_service_account.function_sa.member
}

# --- Permission for Google's GCS Service ---
# Allows GCS to publish events to create function triggers
resource "google_project_iam_member" "gcs_sa_pubsub_publisher" {
  project = var.gcp_project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:service-${data.google_project.project.number}@gs-project-accounts.iam.gserviceaccount.com"
}