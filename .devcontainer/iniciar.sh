#!/usr/bin/env bash
# Liga a API da VeriSeal (que também mostra o site) dentro do GitHub Codespaces.
# Roda sozinho toda vez que o Codespace liga (postStartCommand do devcontainer.json).
# Para religar na mão, por exemplo depois de mudar o C#:
#   bash .devcontainer/iniciar.sh
set -u
cd "$(dirname "$0")/.."

LOG=/tmp/veriseal-api.log

echo "Esperando o MySQL ficar pronto..."
for _ in $(seq 1 150); do
  (echo > /dev/tcp/127.0.0.1/3306) 2>/dev/null && break
  sleep 2
done

# se a API já estava ligada, desliga antes de ligar de novo
pkill -f "VeriSealApi" 2>/dev/null && sleep 2

echo "Ligando a API em segundo plano (log: $LOG)..."
nohup setsid dotnet run --project backend/src/VeriSealApi --no-launch-profile > "$LOG" 2>&1 < /dev/null &

for _ in $(seq 1 90); do
  if curl -fs http://127.0.0.1:5021/api > /dev/null; then
    echo "API e site no ar na porta 5021 (aba PORTAS)."
    echo "A porta começa privada (só você acessa). Para o professor ou o GitHub Pages"
    echo "acessarem, veja a seção \"Deixar público\" em docs/github.md."
    exit 0
  fi
  sleep 2
done

echo "A API não respondeu. Veja o erro com:  tail -n 50 $LOG"
