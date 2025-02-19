#!/bin/bash
# mkenv.sh

# Memory limit for the container
MEMORY_LIMIT="4Gi" # Example: 512Mi, 1Gi, etc.

echo "Creating $1"
cat <<EOF > $1
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ${SERVICE}
  labels:
    cloud.googleapis.com/location: us-west1
spec:
  template:
    spec:
      timeoutSeconds: 3540
      containers:
      - image: ${IMAGE}
        ports:
        - name: h2c
          containerPort: 8080
        resources:
          limits:
            memory: ${MEMORY_LIMIT}
        env:
EOF

echo "Appending environment variables to $1"

# Append environment variables with proper indentation (10 spaces for list items)
for var in \
  DB_CONNECTION_NAME \
  DB_USER \
  DB_PASS \
  DB_NAME \
  TWILIO_ACCOUNT_SID \
  TWILIO_AUTH_TOKEN \
  TWILIO_VERIFY_SERVICE_SID \
  BSV_NETWORK \
  KNEX_DB_CONNECTION \
  SERVER_PRIVATE_KEY \
  TAAL_API_KEY \
  COMMISSION_FEE \
  COMMISSION_PUBLIC_KEY \
  FEE_MODEL; do
    value=$(printenv "$var")
    if [ -n "$value" ]; then
      echo "          - name: $var" >> $1
      echo "            value: '$value'" >> $1
    fi
done

echo "Built! Contents of $1:"
cat $1
