.PHONY: build deploy create

build:
	graph codegen && graph build

create:
	graph create --node http://localhost:8020 subgraph

deploy:
	graph deploy subgraph --node http://localhost:8020 --ipfs http://localhost:5001
