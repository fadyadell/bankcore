# Clean Architecture Foundation

## Layers

- presentation: controllers, API contracts
- application: use-case orchestration
- domain: entities, value objects, domain services
- infrastructure: persistence, messaging, external adapters

## Rule

Dependencies point inward. Domain must not depend on framework code.
