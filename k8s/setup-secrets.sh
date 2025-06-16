#!/bin/bash

# Create namespace if it doesn't exist
kubectl create namespace pictive --dry-run=client -o yaml | kubectl apply -f -

# Create secret for MongoDB
kubectl create secret generic posts-db-secret \
  --namespace pictive \
  --from-literal=mongo-url='YOUR_MONGO_URL' \
  --from-literal=mongo-password='YOUR_MONGO_PASSWORD' \
  --dry-run=client -o yaml | kubectl apply -f - 