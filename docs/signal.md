# Signal

## Question
What should a baggage-tracking system show when scans arrive twice, out of order, or with a handoff missing?

## Implementation
An append-only array stores scan id, bag id, station and timestamp. A pure projection function validates scans, isolates one bag, deduplicates event ids and derives seen stations. It keeps the furthest observed station and identifies gaps at or before that point. Late scans fill gaps without moving the bag backwards. Arrival requires all five stations; seeing only the arrival scan does not prove a complete journey.

The displayed log is sorted by timestamp and event id. Operational order and delivery order are separate. Duplicate counts are observable. Invalid events throw rather than silently entering state.

## Try failure and recovery
1. Send check-in.
2. Skip sorting to send security: sorting becomes missing.
3. Duplicate the security event: the projection is unchanged and the duplicate count rises.
4. Recover sorting: the gap closes, while the latest station remains security.
5. Continue to arrival: all five scans produce Arrived.

## Evidence
Tests exercise skips, duplicate ids, late recovery, reverse delivery order, bag isolation and invalid station rejection. No timer, random delays or external service is needed to reproduce the states.

## Relationship to academic work
This is a new browser prototype extending the system thinking in my 2025 team RFID baggage project. It does not imply that I implemented this event-sourced system in the original course project, deployed an airport system, or connected RFID hardware.

## Boundaries
In-memory simulation, not durable ingestion. The first event wins when an id repeats; mismatched payloads need a conflict policy. Id generation is appropriate for this single-session UI, not distributed producers. A production design would need persistent logs, producer identity, authorization, schema versions, device clock handling and replay monitoring.
