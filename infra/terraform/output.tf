output "upload_bucket_name" {
  description = "The name of the GCS bucket for PDF uploads and DB storage."
  value       = google_storage_bucket.uploads_bucket.name
}

output "function_service_account_email" {
  description = "The email of the dedicated service account for the functions."
  value       = google_service_account.function_sa.email
}