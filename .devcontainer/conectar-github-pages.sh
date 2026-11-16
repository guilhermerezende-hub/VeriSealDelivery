#!/usr/bin/env bash
# Liga o site publicado no GitHub Pages à API (e ao banco) deste Codespace.
# Rode uma vez, no terminal do Codespace aberto na branch main:
#   bash .devcontainer/conectar-github-pages.sh
# Ele grava o endereço da API em frontend/js/config.js, faz o commit e o push.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${CODESPACE_NAME:-}" ]; then
  echo "Este script só funciona dentro do GitHub Codespaces."
  exit 1
fi

api="https://${CODESPACE_NAME}-5021.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/api"

sed -i "s|^export const API_PUBLIC_URL = .*|export const API_PUBLIC_URL = \"${api}\";|" frontend/js/config.js
if ! grep -qF "\"${api}\"" frontend/js/config.js; then
  echo "Não consegui gravar o endereço em frontend/js/config.js."
  exit 1
fi
echo "Endereço da API: ${api}"

if ! gh codespace ports visibility 5021:public -c "$CODESPACE_NAME" > /dev/null 2>&1; then
  echo "Deixe a porta 5021 pública: aba PORTAS > botão direito na 5021 > Port Visibility > Public."
fi

if git diff --quiet -- frontend/js/config.js; then
  echo "O GitHub Pages já usa este Codespace. Nada para enviar."
  exit 0
fi

git add frontend/js/config.js
git commit -m "GitHub Pages usando a API do Codespace ${CODESPACE_NAME}"
git push

branch="$(git branch --show-current)"
if [ "$branch" = "main" ]; then
  echo "Pronto! Em 1 ou 2 minutos o GitHub Pages passa a usar este banco."
  echo "Ele funciona enquanto este Codespace estiver ligado."
else
  echo "Enviado para a branch ${branch}. O GitHub Pages publica a main:"
  echo "abra um Pull Request de ${branch} para a main e faça o merge."
fi
