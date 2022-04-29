.PHONY: all www proto server
all: proto www 

www:
	cd www && PUBLIC_URL=http://localhost:8080/web npm run build

proto:
	protoc --go_out=. abi.proto
	protoc --js_out=import_style=commonjs,binary:www/src abi.proto

run:
	GIN_MODE=release go run ./server