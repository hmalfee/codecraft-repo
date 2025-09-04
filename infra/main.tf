terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.3.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.9.0"
    }
  }
  cloud {
    organization = "Demo-Organization-124"
    workspaces {
      name    = "codecraft-prod"
      project = "codecraft"
    }
  }
}

variable "neon_api_key" {
  description = "API key for Neon database provider"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "API token for Vercel provider"
  type        = string
  sensitive   = true
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "vercel" {
  api_token = var.vercel_api_token
}
