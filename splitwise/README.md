# Splitwise Low-Level Design (TypeScript)

A modular, concurrency-safe expense-sharing system built in TypeScript modeled after Splitwise. It supports multiple expense-splitting rules, pairwise and aggregate balance sheets, greedy debt simplification, and atomic settlement updates.

---

## 1. Functional Requirements

* **Group Management**: Create groups, add members, look up/remove groups, and toggle **Simplify Group Debts** per group.
* **Expense Creation & Splitting**: Record expenses paid by a group member and split them using multiple strategies:
  * **Equal Split (`EQUAL`)**: Divides the total amount evenly across participants, distributing any remainder cents deterministically so splits always sum to the exact total.
  * **Exact Split (`EXACT`)**: Assigns explicit amounts per participant and validates that the sum matches the total expense.
  * **Percentage Split (`PERCENTAGE`)**: Splits by percentage shares, validates percentages sum to 100%, and handles rounding/remainder precision.
  * **Share Split (`SHARE`)**: Extensible strategy slot for ratio/share-based splits.
* **Balance Tracking**: Maintain per-user balance sheets within a group tracking:
  * Pairwise net balances (`Map<string, number>`, where positive means others owe the user and negative means the user owes others).
  * Cached summary metrics (`totalOwed`, `totalGetBack`) for fast reads.
  * Historical outlay/consumption metrics (`totalPaid`, `totalExpense`).
* **Debt Simplification**: Compute a minimal set of settlement transactions (`SimplifiedTransaction[]`) to reduce multi-party debts, and optionally rewrite pairwise group balances to match the simplified graph.
* **Settlements (`settleUp`)**: Record repayments between a debtor and a creditor so balances and totals update accurately.

---

## 2. Non-Functional Requirements

* **Concurrency & Atomicity**: Concurrent expense additions, settlements, and simplification toggles on the *same* group must not race or corrupt balances. Serialized via a per-`groupId` `Mutex` (`async-mutex`) inside `try ... finally` blocks.
* **Financial & Rounding Accuracy**: Avoid floating-point drift and dust balances (`0.0000001`) by normalizing currency values and applying an epsilon threshold (`0.01`) when clearing settled balances or checking totals.
* **Read Performance for Summary Views**: Serve `totalOwed` and `totalGetBack` in $O(1)$ read time by recalculating them on balance sheet mutations rather than scanning every time a summary is read.
* **Extensibility & Maintainability**: Decouple split calculation algorithms, persistence (`GroupRepo` / `InMemoryGroupRepo`), and orchestration services via dependency injection and clear interfaces.

---

## 3. Architecture & Design Patterns

* **Strategy Pattern (`SplitStrategy`, `EqualSplit`, `ExactSplit`, `PercentageSplit`)**: Encapsulates split calculation and validation rules behind a common interface so new split types can be added without modifying `ExpenseService`.
* **Factory Pattern (`SplitStrategyFactory`)**: Resolves the concrete `SplitStrategy` instance from `SplitType` at runtime.
* **Service & Repository Layering**:
  * `GroupService`: Facade for group creation, member management, expense creation, debt simplification, and toggling simplification.
  * `ExpenseService`: Owns per-group mutex locking, input/membership validation, split execution, balance updates, optional auto-simplification on new expenses, and settlements.
  * `BalanceSheetService`: Applies double-entry pairwise updates and prints formatted group balance sheets.
  * `DebtSimplificationService`: Computes minimum-cash-flow transfers using a greedy two-pointer algorithm in $O(N \log N)$ time and $O(N)$ space, and applies simplified balances when enabled.
  * `GroupRepo` / `InMemoryGroupRepo`: Abstracts group persistence so storage can be swapped from in-memory to a database later.

---

## 4. Key Design Choices & Trade-Offs

1. **Per-Group Mutex vs. Global Lock**:
   * *Choice*: Lock by `groupId` rather than globally across all groups.
   * *Why*: Expenses in different groups are independent; per-group locking prevents cross-group contention while still guaranteeing strict serialization for all mutations within a single group.
2. **Pairwise Ledger + Cached Totals (`totalOwed` / `totalGetBack`)**:
   * *Choice*: Store pairwise balances in a `Map<string, number>` and recompute `totalOwed` and `totalGetBack` whenever a pairwise balance changes.
   * *Why*: Keeps pairwise "who owes whom" queries and $O(1)$ dashboard totals fast and consistent, deleting near-zero entries (`< 0.01`) automatically once settled.
3. **Separating Current Debt (`totalOwed` / `totalGetBack`) from Historical Spend (`totalPaid` / `totalExpense`)**:
   * *Choice*: Track upfront cash outlay (`totalPaid`) and personal expense share (`totalExpense`) separately from unsettled balances, and guard them with an `isSettlement` flag during settlements.
   * *Why*: Paying back a debt reduces what someone owes/is owed, but does not mean a new group expense was consumed or a new upfront expense was incurred.
4. **Computing Net Balance from Current Debt vs. Total Paid/Expense**:
   * *Choice*: Compute net balance from `totalGetBack - totalOwed` (rather than `totalPaid - totalExpense` alone) when simplifying debts.
   * *Why*: If partial settlements occur before additional expenses are added and debts are simplified again, `totalGetBack - totalOwed` reflects actual remaining unsettled positions.
5. **Advisory Simplification vs. Rewriting Pairwise Balances ("Simplify Group Debts")**:
   * *Choice*: Keep `simplifyDebts` pure by default (returning suggested `SimplifiedTransaction[]`), and only overwrite pairwise `balances` via `applySimplifiedBalances` when `simplifyDebtsEnabled` is `true` on the group (and optionally auto-reapply on subsequent `addExpense` calls under the group lock).
   * *Why*: Rewriting pairwise edges makes direct simplified settlements zero out cleanly without leaving reverse pairwise entries, while keeping the toggle explicit avoids unexpectedly mutating raw pairwise history when disabled. *(Trade-off: overwriting pairwise balances in place loses the raw pre-simplification edge graph unless rebuilt from an immutable expense log.)*
6. **Greedy Two-Pointer Debt Simplification ($O(N \log N)$)**:
   * *Choice*: Separate net debtors and creditors, sort descending, and greedily match largest debtor with largest creditor.
   * *Why*: Exact minimum-transaction settlement on arbitrary graphs is NP-hard, whereas greedy matching runs in $O(N \log N)$ time and $O(N)$ space and substantially reduces transaction count in practice.
 * ### Settlement Flow (`settleUp`)

Recording a repayment between a debtor (`fromUser`) and a creditor (`toUser`) inside a group:

1. **Input & Membership Validation**: Ensures `amount > 0`, `fromUser.userId !== toUser.userId`, the `group` exists, and both users are active members of the group.
2. **Atomic Execution via Per-Group Mutex**: Acquires `getGroupLock(groupId)` inside a `try ... finally` block so a settlement cannot race with a concurrent `addExpense` or debt simplification toggle on the same group.
3. **Pairwise & Cached Balance Update**: Applies the repayment as a single `Split` of `amount` from `fromUser` to `toUser` via `BalanceSheetService.updateBalance(..., isSettlement = true)`:
   * `fromUser`'s balance with `toUser` increases by `+amount` (reducing debt if `fromUser` owed `toUser`, or clearing it to `0` and deleting the map entry when settled).
   * `toUser`'s balance with `fromUser` decreases by `-amount` (reducing what `toUser` is owed by `fromUser`).
   * `recalculateTotals()` refreshes `totalOwed` and `totalGetBack` on both sheets.
4. **Protecting `totalPaid` & `totalExpense` (`isSettlement = true`)**: Skips incrementing `totalPaid` and `totalExpense` on settlements so repaying a debt clears balances without inflating historical group spending or upfront expense metrics.
5. **Persistence**: Saves the updated `group` via `groupRepo.save(group)` before releasing the mutex.

* **Design Note & Trade-Off**: Reusing `updateBalance` with `isSettlement = true` avoids duplicating pairwise ledger logic and keeps `totalOwed` / `totalGetBack` automatically in sync. However, if a user settles an amount *greater* than their current pairwise debt with `toUser`, the pairwise balance flips sign (creating a reverse balance) unless you explicitly validate against over-settlement—a great edge case to call out in interviews.