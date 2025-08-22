김준호
foxmon_
In a call

ish.isha
 added 
fleo_
 to the group. — Yesterday at 10:50 PM
ish.isha
 started a call. — Yesterday at 10:50 PM
ish.isha
[DAD]
 — Yesterday at 10:52 PM
살의가 올라와요?
김준호 — Yesterday at 10:54 PM
지금
해야하는거.
fleo_ — Yesterday at 11:06 PM
ㅇㅇ
김준호 — Yesterday at 11:07 PM
http://ishisha.iptime.org:30000/
hobom-infra
123456qwer!
pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }
Expand
message.txt
5 KB
ish.isha
[DAD]
 — Yesterday at 11:24 PM
hobom.infra@gmail.com
김준호 — Yesterday at 11:51 PM
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/configure
withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            if [ -f "$ENV_FILE" ]; then
              cp "$ENV_FILE" deploy/.env
            fi
          '''
        }
fleo_ — 12:09 AM
https://jenakim47.tistory.com/73
Jen's Space
Jenkins Pipeline Github Private Token 사용하여 연동
보안을 위해서 Github Private Repo 를 생성하였습니다. 프라이빗 저장소를 Jenkins와 연동하는 방법에는 1. ssh private, public key 사용 2. token 사용 두가지 방법이 있습니다. 저는 이번에 두번째 방법을 사용하겠습니다. 참고로 token을 발급받은 이후에는 git bash에서 git clone, pu...
Jenkins Pipeline Github Private Token 사용하여 연동
김준호 — 12:12 AM
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/credentials/
김준호 — 12:20 AM
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/job/develop/7/console
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/job/develop/lastFailedBuild/console
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/job/develop/lastFailedBuild/console
김준호 — 12:27 AM
http://ishisha.iptime.org:30000/job/for-hobom-baceknd-develop/job/develop/9/console
withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            if [ -f "$ENV_FILE" ]; then
              cp "$ENV_FILE" deploy/.env
            fi
          '''
        }
hobom-infra
ish.isha
[DAD]
 — 12:30 AM
hobom-infra-token
hobom-infra-signin
김준호 — 12:33 AM
Environment=PATH=/usr/local/bin:/usr/bin:/bin
DB
HOBOM_SYSTEM_BACKEND_LION_DB=mongodb+srv://hobom:HoBom1031@hobom-system-lion-db.ag3ygsp.mongodb.net/hobom-system-backend-lion-db?retryWrites=true&w=majority&appName=hobom-system-lion-db

SALT
HOBOM_GEN_SALT=10

PORT
HOBOM_BACKEND_PORT=8080

JWT
HOBOM_JWT_SIGN_EXPIRED_AT=5m
HOBOM_JWT_SECRET=IloveHoBom1031^
HOBOM_JWT_ACCESS_TOKEN_EXPIRED=7d
HOBOM_JWT_REFRESH_TOKEN_EXPIRED=30d

Discord
HOBOM_DISCORED_WEBHOOK_URL=https://discord.com/api/webhooks/1396840755674353775/rUo_NRYz6e4bnGZ4jsTkRE8cHs9J_jWncV3J_VsHJFDZqufSQBxRp32oTf-vsDPQBsmd
Attachment file type: unknown
.env
547 bytes
ish.isha
[DAD]
 — 12:40 AM
hobom-infra-env
김준호 — 12:41 AM
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
Expand
message.txt
6 KB
fleo_ — 12:52 AM
sudo mkdir -p ${env.DEPLOY_DIR}
sudo chown -R ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}
ish.isha
[DAD]
 — 12:55 AM
chown ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}/.env
sh "sudo chown ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}/.env"
sh "chown ${env.DEPLOY_USER}:${env.DEPLOY_USER} ${env.DEPLOY_DIR}/.env"
김준호 — 12:59 AM
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
Expand
message.txt
6 KB
[Pipeline] { (Install dependencies)
[Pipeline] sh
00:59:50  + node -v
00:59:50  /var/jenkins_home/workspace/or-hobom-baceknd-develop_develop@tmp/durable-9827b086/script.sh.copy: 1: node: not found
[Pipeline] }
김준호 — 1:09 AM
deploy-ssh-key
fleo_ — 1:12 AM
https://k-sky.tistory.com/832
engineering blog
[Jenkins] 서버에 자동 배포하기 위한 Jenkins Credentials ...
1. Jenkins의 credintials이란?사용자, 스크립트, 또는 jenkins 자체가 외부 시스템과 안전하게 상호 작용할 수 있도록 인증 정보를 저장하고 관리하는 방법을 의미Jenkins의 인증 정보 관리 시스템은 다양한 인증 정보를 지원사용자 이름과 비밀번호: 가장 일반적인 인증 방...
[Jenkins] 서버에 자동 배포하기 위한 Jenkins Credentials ...
김준호 — 1:13 AM
ssh-keygen -t rsa -b 4096 -C "hobom"
fleo_ — 1:14 AM
SHA256:qwHLdbsa81LuxDjg2iMlzeSi9uk/Q57tS/RRMFmKV3k hobom
ish.isha
[DAD]
 — 1:16 AM
infra-admin
fleo_ — 1:17 AM
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDKUV/p9jIz1HJl/uF+12nArXQiA2DJdt16zBTKWifeFoqwELapbr/CwxYXFJxNRmbN2TUqBSIvv3+Nc2wE1Fh8ewIpbLFtJe8sk7KwRez4ofYCbaXHF7utJcXknKzbarNx5c9bcEzUQHaxeOg167LjKUU3DxfeMoIbcpvwcK+FV8bJ353sbWO1nRIZtogXFHiz851RsUtW4Zw3Zb+fdcEObDRiX7R9KhRQgfeb0Rp2mkN7MjirZ/bF+jPRH1O143YJ9hHmHCBLdx5VI4YRzh023kwP1eT2hRS0CBc8KaFR5FHZ2/GOAFZv3PHuU7CfxCPHnOyLlv22BoQkMpcuu/3fW1C23Xp7aiGAADHn1bEQfX7DXXc94LUGmWlk+x8bgMnxF3mYRalfY9zlFfeOmBRXtOfurAwhufxCmxCAykWhvvTQYF5idIrlbY7lxEQaSA/OsMrmQRdSxg0OcB5T4kP4bJodiGLx7JUp7T4tSxcrEJGNmR43eZCJ2k/cduQGfX4afUfJdwwg1uZZrV7vJSX6pCG+oOsfIw0aeScDCcveiQ+/Sl8DbAjB/31BKMjRsxk6p0WBuijSdlARQx4ELeC7ufeZukVOQ6yjQBBmOFNflOIcuUIjEwek+I5lGBzhjAUf575w0A/vShAE1/OKIvH9nbBMklJbQQxXJsbJSsEtNw== hobom
ish.isha
[DAD]
 — 1:33 AM
ssh -i /path/to/private_key infra-admin@ishisha.iptime.org -p22223
김준호 — 1:39 AM
01:38:57  [ssh-agent] Using credentials infra-admin (deploy-ssh-key)
01:38:57  $ ssh-agent
01:38:57  SSH_AUTH_SOCK=/tmp/ssh-BqqnyiWroWyO/agent.5435
01:38:57  SSH_AGENT_PID=5438
01:38:57  Running ssh-add (command line suppressed)
[Pipeline] // sshagent
[Pipeline] }
[Pipeline] // withEnv
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Deploy to server (systemd))
ssh -o StrictHostKeyChecking=no 유저@호스트'echo OK && whoami && hostname'
ish.isha
[DAD]
 — 1:46 AM
ishisha.iptime.org
host
infra-admin
-p7777
-p 7777
김준호 — 1:47 AM
DEPLOY_HOST     = 'ishisha.iptime.org -p 7777'
ish.isha
[DAD]
 — 1:49 AM
22223
김준호 — 1:55 AM
https://www.yes24.com/product/goods/11481543
예스24
딜레마 - 예스24
따뜻한 한 조각의 빵 냄새는 인간의 선의에 어떤 영향을 미칠까? 유럽 최고의 지성집단 프랑스 국립과학연구소(CNRS)의 거두, 프랑스 현대 철학자 뤼방 오지앙이 제시하는 도덕철학의 사고실험 19가지가 담긴 책이다. 책에 담긴 19가지 딜레마는 ‘기게스의 반지’...
Image
https://product.kyobobook.co.kr/detail/S000000625441
https://product.kyobobook.co.kr/detail/S000201932024
https://product.kyobobook.co.kr/detail/S000001290624
김준호 — 2:11 AM
[Pipeline] sshagent
02:08:16  [ssh-agent] Using credentials infra-admin (deploy-ssh-key)
02:08:16  $ ssh-agent
02:08:16  SSH_AUTH_SOCK=/tmp/ssh-qDSc6nJkzeoO/agent.8277
02:08:16  SSH_AGENT_PID=8280
02:08:16  Running ssh-add (command line suppressed)
02:08:16  Identity added: /var/jenkins_home/workspace/or-hobom-baceknd-develop_develop@tmp/private_key_11747825477025473143.key (hobom-key)
02:08:16  [ssh-agent] Started.
[Pipeline] {
[Pipeline] sh
02:08:16  /var/jenkins_home/workspace/or-hobom-baceknd-develop_develop@tmp/durable-3c8d7a35/script.sh.copy: 3: Bad substitution
[Pipeline] }
02:08:16  $ ssh-agent -k
02:08:16  unset SSH_AUTH_SOCK;
02:08:16  unset SSH_AGENT_PID;
02:08:16  echo Agent pid 8280 killed;
02:08:16  [ssh-agent] Stopped.
[Pipeline] // sshagent
ish.isha
[DAD]
 — 2:15 AM
pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME        = 'for-hobom-backend'
    SERVICE_NAME    = 'for-hobom-backend'
    ENTRY_FILE      = 'dist/main.js'

    // ★★★ 수정됨: DEPLOY_HOST와 DEPLOY_PORT 분리 ★★★
    DEPLOY_HOST     = 'ishisha.iptime.org'
    DEPLOY_PORT     = '22223'
    DEPLOY_USER     = 'infra-admin'
    DEPLOY_DIR      = '/srv/for-hobom-backend'

    SSH_CRED_ID     = 'deploy-ssh-key'     // SSH private key (서버 접속)
    ENV_FILE_CRED   = 'hobom-infra-env'    // ✅ Jenkins Secret file (서버용 .env)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Install dependencies') {
      steps {
        // tools 블록이 Node.js를 PATH에 추가해주므로 node -v && npm -v는 필요 없습니다.
        sh 'npm ci'
      }
    }

    stage('Lint & Test') {
      steps {
        sh '''
          npm run lint || true
          npm run test || true
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/**/*.xml'
        }
      }
    }

    stage('Build') {
      steps { sh 'npm run build' }
      post {
        success { archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true }
      }
    }

    stage('Package for deploy (include .env from credentials)') {
      steps {
        sh '''
          rm -rf deploy && mkdir -p deploy
          cp -r dist deploy/dist
          cp package.json package-lock.json deploy/
          [ -d prisma ] && cp -r prisma deploy/prisma || true
          [ -d public ] && cp -r public deploy/public || true
        '''
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            install -m 600 "$ENV_FILE" deploy/.env
          '''
        }
        sh 'tar -C deploy -czf deploy.tgz .'
      }
    }

    stage('Verify SSH to target') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          // ★★★ 수정됨: -p 옵션 추가 및 DEPLOY_HOST 분리 ★★★
          sh "ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'echo OK && whoami && hostname'"
        }
      }
    }

    stage('Deploy to server (systemd)') {
      when {
        allOf {
          anyOf { branch 'develop'; branch 'main' }
          not { changeRequest() }
        }
      }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
... (105 lines left)
Collapse
message.txt
7 KB
﻿
pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    APP_NAME        = 'for-hobom-backend'
    SERVICE_NAME    = 'for-hobom-backend'
    ENTRY_FILE      = 'dist/main.js'

    // ★★★ 수정됨: DEPLOY_HOST와 DEPLOY_PORT 분리 ★★★
    DEPLOY_HOST     = 'ishisha.iptime.org'
    DEPLOY_PORT     = '22223'
    DEPLOY_USER     = 'infra-admin'
    DEPLOY_DIR      = '/srv/for-hobom-backend'

    SSH_CRED_ID     = 'deploy-ssh-key'     // SSH private key (서버 접속)
    ENV_FILE_CRED   = 'hobom-infra-env'    // ✅ Jenkins Secret file (서버용 .env)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git --no-pager log -1 --pretty=oneline'
      }
    }

    stage('Install dependencies') {
      steps {
        // tools 블록이 Node.js를 PATH에 추가해주므로 node -v && npm -v는 필요 없습니다.
        sh 'npm ci'
      }
    }

    stage('Lint & Test') {
      steps {
        sh '''
          npm run lint || true
          npm run test || true
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/**/*.xml'
        }
      }
    }

    stage('Build') {
      steps { sh 'npm run build' }
      post {
        success { archiveArtifacts artifacts: 'dist/**/*', onlyIfSuccessful: true }
      }
    }

    stage('Package for deploy (include .env from credentials)') {
      steps {
        sh '''
          rm -rf deploy && mkdir -p deploy
          cp -r dist deploy/dist
          cp package.json package-lock.json deploy/
          [ -d prisma ] && cp -r prisma deploy/prisma || true
          [ -d public ] && cp -r public deploy/public || true
        '''
        withCredentials([file(credentialsId: env.ENV_FILE_CRED, variable: 'ENV_FILE')]) {
          sh '''
            install -m 600 "$ENV_FILE" deploy/.env
          '''
        }
        sh 'tar -C deploy -czf deploy.tgz .'
      }
    }

    stage('Verify SSH to target') {
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          // ★★★ 수정됨: -p 옵션 추가 및 DEPLOY_HOST 분리 ★★★
          sh "ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} 'echo OK && whoami && hostname'"
        }
      }
    }

    stage('Deploy to server (systemd)') {
      when {
        allOf {
          anyOf { branch 'develop'; branch 'main' }
          not { changeRequest() }
        }
      }
      steps {
        sshagent (credentials: [env.SSH_CRED_ID]) {
          sh '''
            # ★★★ 수정됨: ssh 명령어에 -p 옵션 추가 ★★★
            scp -o StrictHostKeyChecking=no -P ${env.DEPLOY_PORT} deploy.tgz ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:/tmp/${env.APP_NAME}.tgz

            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} ${env.DEPLOY_USER}@${env.DEPLOY_HOST} << 'EOF'
    set -e

    # 0) Node 없으면 설치 (대비용)
    if ! command -v node >/dev/null 2>&1; then
      if [ -f /etc/debian_version ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get update -y && sudo apt-get install -y nodejs
      elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ] || [ -f /etc/rocky-release ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
      elif [ -f /etc/amazon-linux-release ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs || sudo yum install -y nodejs
      else
        echo "Unsupported distro: please pre-install Node 20+"
        exit 1
      fi
    fi

    # 1) 배포 디렉토리
    sudo mkdir -p ${DEPLOY_DIR}
    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}

    # 2) 패키지 전개 (.env 포함)
    tar -xzf /tmp/${APP_NAME}.tgz -C ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}

    # 🔒 .env 권한/소유권 보강
    chmod 600 ${DEPLOY_DIR}/.env
    
    # ★★★ 수정됨: 셸 스크립트 문법 오류 수정 ★★★
    chown ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_DIR}/.env

    # 3) prod deps 설치
    npm ci --omit=dev

    # 4) systemd 유닛 설정
    NODE_BIN="\\$(command -v node || true)"
    if [ -z "\\$NODE_BIN" ]; then echo "node not found"; exit 1; fi

    # 안전: .env 확인
    if [ ! -f "${DEPLOY_DIR}/.env" ]; then
      echo "ERROR: ${DEPLOY_DIR}/.env not found"
      exit 1
    fi

    sudo bash -c 'cat > /etc/systemd/system/${SERVICE_NAME}.service' <<SERVICE
    [Unit]
    Description=${APP_NAME} service
    After=network-online.target
    Wants=network-online.target

    [Service]
    Type=simple
    User=${DEPLOY_USER}
    Group=${DEPLOY_USER}
    WorkingDirectory=${DEPLOY_DIR}
    Environment=NODE_ENV=production
    EnvironmentFile=${DEPLOY_DIR}/.env
    Environment=PATH=/usr/local/bin:/usr/bin:/bin
    ExecStart=\\$NODE_BIN ${DEPLOY_DIR}/${ENTRY_FILE}
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    SERVICE

    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    sudo systemctl restart ${SERVICE_NAME}

    # 상태 확인
    for i in 1 2 3 4 5; do
      sleep 2
      if systemctl is-active --quiet ${SERVICE_NAME}; then
        echo "Service ${SERVICE_NAME} is active."
        exit 0
      fi
    done

    echo "Service ${SERVICE_NAME} failed to become active."
    sudo systemctl status ${SERVICE_NAME} --no-pager -l || true
    exit 1
    EOF
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build #${env.BUILD_NUMBER} OK (${env.BRANCH_NAME})"
      echo "🚀 Deployed to ${env.DEPLOY_USER}@${env.DEPLOY_HOST}:${env.DEPLOY_DIR} (systemd: ${env.SERVICE_NAME})"
    }
    failure {
      echo "❌ Build failed (${env.BRANCH_NAME})"
    }
  }
}
message.txt
7 KB