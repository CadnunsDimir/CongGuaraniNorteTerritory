APP_FOLDER=CongGuaraniNorteFront

# Habilita a exclusão no bash
shopt -s extglob

# Envia tudo exceto node_modules
scp -pr !(node_modules) root@XPTO:~/apps/$APP_FOLDER