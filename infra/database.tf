# resource "neon_project" "codecraft_db" {
#   name                      = "codecraft"
#   region_id                 = "aws-ap-southeast-1"
#   pg_version                = "17"
#   history_retention_seconds = 21600
#   branch {
#     name          = "production"
#     database_name = "codecraftdb"
#   }
#   default_endpoint_settings {
#     autoscaling_limit_min_cu = 1
#     autoscaling_limit_max_cu = 2
#   }
#   compute_provisioner = "k8s-neonvm"
# }

# resource "neon_branch" "codecraft_db_preview_branch" {
#   project_id = neon_project.codecraft_db.id
#   name       = "preview"
#   parent_id  = neon_project.codecraft_db.branch[0].id
#   depends_on = [neon_project.codecraft_db]
# }

# resource "neon_endpoint" "codecraft_db_preview_endpoint" {
#   project_id               = neon_project.codecraft_db.id
#   branch_id                = neon_branch.codecraft_db_preview_branch.id
#   autoscaling_limit_min_cu = 0.25
#   autoscaling_limit_max_cu = 1
#   type                     = "read_write"
#   compute_provisioner      = "k8s-neonvm"
#   depends_on = [
#     neon_branch.codecraft_db_preview_branch
#   ]
# }

# output "database_url" {
#   description = "Production database connection URL"
#   value       = "postgresql://${neon_project.codecraft_db.database_user}:${neon_project.codecraft_db.database_password}@${neon_project.codecraft_db.database_host_pooler}/${neon_project.codecraft_db.database_name}?sslmode=require"
#   sensitive   = true
# }

# output "preview_database_url" {
#   description = "Preview database connection URL"
#   value       = "postgresql://${neon_project.codecraft_db.database_user}:${neon_project.codecraft_db.database_password}@${neon_endpoint.codecraft_db_preview_endpoint.id}-pooler.${neon_endpoint.codecraft_db_preview_endpoint.proxy_host}/${neon_project.codecraft_db.database_name}?sslmode=require"
#   sensitive   = true
# }

# output "neon_project_id" {
#   description = "Neon project ID"
#   value       = neon_project.codecraft_db.id
# }

resource "neon_project" "codecraft_db" {
  name                      = "codecraft"
  region_id                 = "aws-ap-southeast-1"
  pg_version                = "17"
  history_retention_seconds = 21600
  branch {
    name          = "production"
    database_name = "codecraftdb"
  }
  default_endpoint_settings {
    autoscaling_limit_min_cu = 1
    autoscaling_limit_max_cu = 2
  }
  compute_provisioner = "k8s-neonvm"
}

resource "neon_branch" "codecraft_db_preview_branch" {
  project_id = neon_project.codecraft_db.id
  name       = "preview"
  parent_id  = neon_project.codecraft_db.branch[0].id
  depends_on = [neon_project.codecraft_db]
}

resource "neon_endpoint" "codecraft_db_preview_endpoint" {
  project_id               = neon_project.codecraft_db.id
  branch_id                = neon_branch.codecraft_db_preview_branch.id
  autoscaling_limit_min_cu = 0.25
  autoscaling_limit_max_cu = 1
  type                     = "read_write"
  compute_provisioner      = "k8s-neonvm"
  depends_on = [
    neon_branch.codecraft_db_preview_branch
  ]
}

# Local values to construct connection URLs
locals {
  # Production database URL
  database_url = "postgresql://${neon_project.codecraft_db.database_user}:${neon_project.codecraft_db.database_password}@${neon_project.codecraft_db.database_host_pooler}/${neon_project.codecraft_db.database_name}?sslmode=require"

  # Preview database URL
  preview_database_url = "postgresql://${neon_project.codecraft_db.database_user}:${neon_project.codecraft_db.database_password}@${neon_endpoint.codecraft_db_preview_endpoint.id}-pooler.${neon_endpoint.codecraft_db_preview_endpoint.proxy_host}/${neon_project.codecraft_db.database_name}?sslmode=require"
}

# Outputs with proper descriptions and validation
output "database_url" {
  description = "Production database connection URL"
  value       = local.database_url
  sensitive   = true

  # Add validation to ensure the URL is properly formatted
  precondition {
    condition     = can(regex("^postgresql://", local.database_url))
    error_message = "Database URL must be a valid PostgreSQL connection string."
  }
}

output "preview_database_url" {
  description = "Preview database connection URL"
  value       = local.preview_database_url
  sensitive   = true

  # Add validation to ensure the URL is properly formatted
  precondition {
    condition     = can(regex("^postgresql://", local.preview_database_url))
    error_message = "Preview database URL must be a valid PostgreSQL connection string."
  }
}

output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.codecraft_db.id
}
