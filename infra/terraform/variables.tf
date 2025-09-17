# variables.tf - Declares all input variables for our Terraform configuration

variable "gcp_project_id" {
  description = "The GCP Project ID to deploy resources into."
  type        = string
  # No default value is set, so Terraform will require this variable.
}