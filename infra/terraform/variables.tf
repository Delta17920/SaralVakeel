variable "gcp_project_id" {
  description = "The ID of your Google Cloud project."
  type        = string
}

variable "region" {
  description = "The primary region for your resources."
  type        = string
  default     = "asia-south1"
}
variable "user_email" {
  description = "The email address of the user who will be deploying the functions."
  type        = string
}