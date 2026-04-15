
IMAGE_NAME=congguaraninorte-front
VPS_NETWORK=vps-network

# echo "removendo node modules"
# rm node_modules -r

echo "Limpando versão anterior..."
docker rm -f $IMAGE_NAME || true

echo "Contruindo imagem"
docker build -t $IMAGE_NAME .

echo "Contruindo Container"

docker run -d \
    --network $VPS_NETWORK \
    --name $IMAGE_NAME \
    -e AUTH_SECRET_KEY=$AUTH_SECRET_KEY \
    -e PORT=$PORT \
    -e SPREADSHEET_ID=$SPREADSHEET_ID \
    $IMAGE_NAME

sleep 10

docker logs --tail 20 $IMAGE_NAME