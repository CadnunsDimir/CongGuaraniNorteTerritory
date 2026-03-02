
IMAGE_NAME=congguaraninorte-front

echo "removendo node modules"
rm node_modules -r

echo "Limpando versão anterior..."
docker rm -f $IMAGE_NAME || true

echo "Contruindo imagem"
docker build -t $IMAGE_NAME .

echo "Contruindo Container"
docker run -d -p 3000:3000 --name $IMAGE_NAME $IMAGE_NAME