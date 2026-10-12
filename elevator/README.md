## Elevator System LLD: Recap and Interview Guide

TypeScript, SDE-2 mock interview notes. Everything we decided, why we decided it, and what to say in the room.

### 1. How to run this in a 45-minute round
   
- 0-5 min: clarify requirements and say your assumptions out loud.
- 5-10 min: enums, entities, and the public API (what a caller can do).
- 10-20 min: class design. Name the patterns you use and the tradeoffs you accept.
- 20-40 min: code Elevator.step() first (the heart of the problem), then the dispatch strategy, then the controller.
- 40-45 min: trace one example, cover edge cases, take follow-ups.

If time runs short, code Elevator.step() fully and describe the rest in words. Interviewers care more about step() and your reasoning than about boilerplate.

### 2. Problem and requirements
   
Prompt: design a system that controls multiple elevators in a building. It serves hall calls (a button on a floor) and destination requests (a button inside a car).

**Questions worth asking (we asked these):** 
> Is the door mechanism in scope? 
> How many elevators, fixed or dynamic? 
> Can a rider press several floors? 
> Capacity, weight, emergency stops? 
> Simulation or real hardware control?

**Answers we settled on:**
- n elevators (configurable at startup, e.g. 3) serving m floors (e.g. 0-9).
- Hall call: a floor plus a direction (UP or DOWN). The system picks the best elevator.
- Destination request: made inside a specific elevator, and a rider can press several floors.
- Simulation with step() ticks, one floor per tick.
- Invalid floors are rejected. A request for the floor the elevator is already on is a no-op.
- Many pending requests at once is fine. That is just a queue, not a concurrency hazard.
- Out of scope: weight and capacity, emergency stop, the door mechanism (STOPPED implicitly means doors are open).

**Non-functional requirements to state:**
- Extensibility: the dispatch algorithm is swappable (Strategy).
- Fairness: avoid indefinite starvation of a hall call. Pure SCAN can delay a request. Mitigation is aging (boost the priority of long-waiting requests) or a LOOK-style hybrid. Name it as a known tradeoff even if you do not build it.
- Concurrency: step() is synchronous and single-threaded by design, so no locks (see section 7).
- Determinism and testability: tick-based, no timers.

### 3. Final design
Enums: ElevatorState is IDLE, MOVING or STOPPED. Direction is UP or DOWN.

**Classes:**
- ElevatorRequest: floor and direction (a hall call).
- Elevator: id, currentFloor, currentState, direction (optional), requests as Set<number>. Methods: addRequest(floor), isIdle(), step().
- DispatchElevatorStrategy (interface): getBestElevator(request, elevators) returns Elevator or undefined. Implementations: NearestIdle, NearestMovingTowards.
- ElevatorController: elevators, numFloors, primary and fallback strategies, pendingHallCalls. Methods: requestElevator(floor, direction), selectDestinationFloor(elevatorId, floor), step().

**Flow:**
- Hall call: the controller validates the floor, asks the primary strategy, falls back to the second, otherwise queues the call in pendingHallCalls. The chosen elevator gets addRequest(floor).
- Destination: the controller validates the floor, finds the elevator by id, calls addRequest(floor).
- Every tick: the controller retries pending hall calls, then calls step() on every elevator.

`Relationships in words: the controller has many elevators and has a primary and a fallback dispatch strategy. Each elevator has a set of pending floors.`

### 4. The core algorithm: SCAN inside Elevator.step()
   
SCAN means keep moving in one direction, serve every pending floor on the way, and reverse only when nothing is left ahead. Real elevators work this way.

Each tick, in this order:
1. No requests: go IDLE and clear the direction.
2. No direction: head toward the nearest pending floor.
3. Current floor is pending: serve it, state STOPPED, and return. Stopping uses up the tick.
4. Nothing ahead: reverse the direction, state MOVING, and return. Reversing costs a tick, which is a deliberate simplification you should state.
5. Otherwise move one floor in the current direction, state MOVING.

**Trace 1** to practice: elevator at floor 0, IDLE, requests {1, 3}. Tick 1 moves to 1, tick 2 stops at 1, tick 3 moves to 2, tick 4 moves to 3, tick 5 stops at 3, tick 6 goes IDLE.
**Trace 2:** elevator at floor 5 going DOWN with requests {7, 2}. It moves down 4, 3, 2 and stops at 2. Next tick nothing is ahead, so it reverses (one tick). Then it moves up 3, 4, 5, 6, 7 and stops at 7. SCAN finishes the current direction before reversing, even though 7 is closer.

`Why direction is a separate field from state: a STOPPED elevator must remember which way it was heading so it can continue after serving the floor. If direction lived inside the state enum (MOVING_UP), that memory would be lost the moment it stops.`

### 5. Dispatch and the controller
Dispatch answers which elevator serves a hall call. It varies by building and traffic pattern, so it is a Strategy. We built two and chained them:

- **NearestIdle (primary):*- the nearest elevator for which isIdle() is true.
- **NearestMovingTowards (fallback):*- the nearest elevator already heading in the call's direction that has not yet reached the floor.

If both return undefined, the call goes into pendingHallCalls and is retried at the start of every tick. The caller never sees a failure: a call is either assigned or queued. Invalid input (a floor out of range) throws.

### 6. Design decisions and tradeoffs (the section to memorize)

**1. Simulation with a synchronous step().**
- Why: deterministic, easy to test, no timers.
- Tradeoff: no real-time behavior.
- Say: I model time as ticks. For real time I would drive step() from a scheduler.

**2. Hall call and destination request are separate APIs.**
- requestElevator(floor, direction) versus selectDestinationFloor(elevatorId, floor).
- Why: a hall call does not know which car will come, but a destination press always happens inside a specific car.
- The elevatorId lookup belongs on the controller. An Elevator already is that car, so an id parameter on its own method would be redundant and error-prone.

**3. State is an enum plus a separate direction field, not the GoF State pattern.**
- Why: three states and short per-state logic, so an enum with ordered checks in step() is simpler.
- Tradeoff: step() grows if the states multiply.
- Say: I considered the State pattern. With three states an enum is clearer. I would move to state classes if per-state behavior grew or needed independent extension.

**4. requests is Set<number>, not a list of request objects and not two heaps.**
- Why: floors are primitives, so has(currentFloor) works and duplicates collapse. A Set of objects never matches because JS compares objects by reference.
- Floors are few (tens to hundreds), so an O(n) scan to check whether anything is ahead is fine.
- Tradeoff: no O(log n) next-floor lookup, and the direction of a hall call is lost after assignment.
- Say: For thousands of floors I would use two sorted structures, one per direction. At building scale a Set is simpler and plenty fast.

**5. SCAN lives inside Elevator.step() (Information Expert), not behind a scheduling Strategy.**
- Why: only one algorithm is implemented, so an interface would have a single implementation. Elevator already holds the data (requests, direction, currentFloor).
- Tradeoff: swapping algorithms later needs an extraction. That refactor is mechanical (steps 2 and 4 are the only direction logic).
- FIFO would also need an ordered queue instead of a floor set, because it cares about arrival order.
- Say: Information Expert is a GRASP principle: give a responsibility to the class that holds the data. I did not make scheduling a Strategy because I only implement SCAN, which is what real elevators use. I would extract it the day a second algorithm is needed.

**6. Dispatch is a Strategy with two implementations chained.**
- Why: it genuinely varies, and we had two real implementations to combine.
- Tradeoff: more classes. Zone-based or ETA-based dispatch would be further strategies.

**7. Queue hall calls when no elevator qualifies.**
- Why: dropping a valid call is a bug, and returning false would mix up invalid with busy.
- Tradeoff: a call can wait several ticks. Aging would address fairness.

**8. Invalid floors throw. A request for the current floor is a no-op.**
- Why: consistent error handling, and it matches the requirement that an already-served request is a no-op.

**9. The controller is a normal class with constructor injection, not a Singleton.**
- Why: it needs configuration (elevators, floor count, strategies) and is easier to test.
- Say: A Singleton adds global state with no benefit here.

**10. isIdle() means state is IDLE and there are no pending requests.**
- Why: addRequest does not change the state until the next tick, so two calls in the same tick could pick the same elevator.

**11.  Strict inequality when checking that an elevator is approaching a floor.**
- Why: if the elevator is exactly on the floor, addRequest is a no-op, so the call would count as assigned and be silently lost.

**12.  Stopping and reversing each cost a tick.**
- A simplification. Say it explicitly so it reads as a choice, not an oversight.

**13. The concurrency answer**
- Separate two ideas: many pending requests (just a queue) versus a request arriving while step() is running.
- step() and requestElevator() are plain synchronous functions. JS runs synchronous code to completion, so nothing can interleave inside step(). No locks are needed.
- Say: There is no race here because the simulation is synchronous and single-threaded by design. It would become a real concern only if step() were async, because then a request could land between a check and the update, the same check-then-mutate-across-await hazard as in the job scheduler.

### 6. Bugs you can hit (check these when you redo it)
- Set<ElevatorRequest> with has(new ElevatorRequest(...)) never matches (reference equality). Use Set<number>.
- The state was never set to MOVING, so dispatch could not see moving cars.
- After STOPPED, step() fell through and moved in the same tick. Return after stopping.
- hasRequestAhead counted only requests with a matching direction. Under SCAN, any floor ahead counts.
- NearestMovingTowards ignored the elevator's own direction, skipped STOPPED cars (which still remember direction), and returned the first match instead of the nearest.
- selectDestinationFloor had a redundant elevatorId on Elevator. The lookup belongs on the controller.
- Pending hall calls were never queued or retried, so a busy building silently dropped calls.
- The Singleton controller could not be configured, and destination floors were not validated.
- Two calls in the same tick could pick the same idle elevator (fixed by isIdle()).
- An approaching check with <= lost a call when the car was exactly on the floor (use <).


### 7. Likely follow-up questions and answers
- Walk me through one tick. The five steps in section 4, in order.
- Is there a race condition? Section 7.
- Why a Set of numbers and not a heap? Decision 4: floors are few, so O(n) is fine, and a Set dedups and supports has(currentFloor) in O(1). Use two sorted structures for very large N.
- Why is dispatch a Strategy but scheduling is not? Decisions 5 and 6: dispatch has two real implementations and varies by building, while scheduling has one (SCAN).
- What if every elevator is busy? The call goes to pendingHallCalls and is retried every tick.
- Can a request starve? In pure SCAN, yes, in principle. Mitigate with aging or a LOOK-style hybrid.
- How would you add capacity limits? Add occupancy and capacity to Elevator. Dispatch skips full cars for hall calls, and a full car still serves its own destinations.
- How would you handle an out-of-service car? Add an OUT_OF_SERVICE state, make isIdle() false and have dispatch skip it, and push its pending requests back onto the pending queue.
- How would you model doors? STOPPED implies open doors today. Add DOORS_OPENING, DOORS_OPEN and DOORS_CLOSING states that each last a few ticks, and let step() count them down.
- Why not the GoF State pattern? Decision 3.
- How would you scale to a tall building with many cars? A zone-based dispatch strategy (each car serves a band of floors), express cars, and scoring by estimated time of arrival instead of nearest.
- How would you test it? step() is deterministic. Build an elevator, add requests, step N times and assert floor, state and direction at each tick. The driver acts as the integration test.
- What would you improve with more time? Separate hall-call sets per direction so pickups respect direction, extract scheduling into a strategy, an observer for floor displays, and ETA-based dispatch.
- A hall call's direction is lost after assignment. Is that a bug? It is a known simplification. Dispatch mostly prevents mismatches by assigning same-direction calls. The fuller version keeps destinations and per-direction hall-call sets, and serves a hall call only when traveling in its direction or at the reversal point.


**Output from your run, which this code should reproduce:**
tick 0 -> E1: floor 2 IDLE - | E2: floor 7 MOVING UP
tick 1 -> E1: floor 3 MOVING UP | E2: floor 7 MOVING DOWN
tick 2 -> E1: floor 4 MOVING UP | E2: floor 6 MOVING DOWN
tick 3 -> E1: floor 4 STOPPED UP | E2: floor 5 MOVING DOWN
tick 4 -> E1: floor 4 IDLE - | E2: floor 5 STOPPED DOWN
tick 5 -> E1: floor 3 MOVING DOWN | E2: floor 5 IDLE -
tick 6 -> E1: floor 3 STOPPED DOWN | E2: floor 5 IDLE -
tick 7 -> E1: floor 3 IDLE - | E2: floor 5 IDLE -
tick 8 -> E1: floor 3 IDLE - | E2: floor 5 IDLE -

What this run shows: the UP call at floor 3 waits in the pending queue because no car qualifies, then E1 (idle at 4) takes it at tick 5 and stops at 3 on tick 6. Nothing is dropped, though E1 could ideally have picked it up at tick 1 on its way up. That gap is a latency tradeoff, not a correctness bug.


### 8. Known limitations to mention
- Hall-call direction is not stored per elevator after assignment.
- Pure SCAN can starve a request. Aging is the mitigation.
- Reversing and stopping each cost a tick.
- Dispatch uses nearest-car, not estimated time of arrival.
- No capacity, door, or out-of-service modeling.