@Library('hobom-shared-lib') _
hobomPipeline(
  serviceName:    'dev-for-hobom-backend',
  hostPort:       '8080',
  containerPort:  '8080',
  memory:         '512m',
  cpus:           '1',
  envPath:        '/etc/hobom-dev/dev-for-hobom-backend/.env',
  addHost:        true,
  submodules:     false,
  extraVolumes:   ['/home/infra-admin/certs:/etc/grpc-tls:ro'],
  smokeCheckPath: '/'
)
