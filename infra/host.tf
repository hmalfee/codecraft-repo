resource "vercel_project" "codecraft_app" {
  name                       = "codecraft-repo"
  framework                  = "nextjs"
  serverless_function_region = "bom1"
  build_command              = "pnpm next build"
  install_command            = "pnpm install --ignore-scripts"
  node_version               = "22.x"
}

resource "vercel_project_domain" "codecraft_www_domain" {
  project_id = vercel_project.codecraft_app.id
  domain     = "www.codecraft.com"
}

resource "vercel_project_domain" "codecraft_apex_domain" {
  project_id           = vercel_project.codecraft_app.id
  domain               = "codecraft.com"
  redirect             = vercel_project_domain.codecraft_www_domain.domain
  redirect_status_code = 307
}
