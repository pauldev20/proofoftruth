.PHONY: build deploy create codegen create-remote deploy-remote

codegen:
	graph codegen

build:
	graph build

create:
	graph create --node http://localhost:8020 subgraph

deploy:
	graph deploy subgraph --node http://localhost:8020 --ipfs http://localhost:5001

create-remote:
	graph create --node http://5.223.50.216:8020 subgraph

deploy-remote:
	graph deploy subgraph --node http://5.223.50.216:8020 --ipfs http://5.223.50.216:5001
