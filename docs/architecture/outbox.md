# Outbox Pattern Foundation

Domain changes and integration events should be persisted atomically.
A relay process publishes pending outbox records to Kafka or RabbitMQ.
