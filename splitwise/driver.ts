import { InMemoryGroupRepo } from './repository/InMemoryGroupRepo';
import { GroupRepo } from "./repository/GroupRepo";
import { BalanceSheetService } from './services/BalanceSheetService';
import { ExpenseService } from './services/ExpenseService';
import { DebtSimplificationService } from './services/DebtSimplificationService';
import { GroupService } from './services/GroupService';
import { User } from './models/User';
import { SplitData } from './strategy/split/SplitData';
import { SplitType } from './enums/SplitType';

async function driver() {
    // Initialize Repositories and Services (Dependency Injection)
    const groupRepo = new InMemoryGroupRepo();
    const balanceSheetService = new BalanceSheetService();
    const expenseService = new ExpenseService(groupRepo, balanceSheetService);
    const debtSimplifier = new DebtSimplificationService();

    const groupService = new GroupService(
        groupRepo,
        expenseService,
        debtSimplifier
    );

    // Create Users
    const userA = new User("U101", "Alice");
    const userB = new User("U102", "Bob");
    const userC = new User("U103", "Charlie");
    const userD = new User("U104", "David");

    console.log("--- Initializing Splitwise Simulation ---");

    const tripGroup = groupService.createGroup("Rishikesh Trip 2026", [
        userA,
        userB,
        userC,
        userD
    ]);

    console.log(`Created Group: ${tripGroup.name} (ID: ${tripGroup.groupId})`);

    // Add Expense #1: EQUAL SPLIT
    // Alice pays ₹1000 for dinner split equally among Alice, Bob, Charlie, David (₹250 each)
    console.log("\n1. Adding Dinner Expense (EQUAL Split)...");
    console.log(`Alice pays ₹1000 for dinner split equally among Alice, Bob, Charlie, David (₹250 each)`)

    const equalSplits: SplitData[] = [
        { user: userA },
        { user: userB },
        { user: userC },
        { user: userD },
    ]

    await groupService.addExpense(
        tripGroup.groupId,
        "Dinner",
        1000,
        userA,
        equalSplits,
        SplitType.EQUAL
    );

    // Add Expense #2: EXACT SPLIT
    // Bob pays ₹500 for shopping: Charlie owes ₹300, David owes ₹200
    console.log("2. Adding Taxi Expense (EXACT Split)...");
    console.log("Bob pays ₹500 for shopping: Charlie owes ₹300, David owes ₹200");

    const exactSplits: SplitData[] = [
        { user: userC, value: 300 },
        { user: userD, value: 200 },
    ];

    await groupService.addExpense(
        tripGroup.groupId,
        "Shopping",
        500,
        userB,
        exactSplits,
        SplitType.EXACT
    );

    // Add Expense #3: PERCENTAGE SPLIT
    // Charlie pays ₹2000 for Resort stay: Alice 50%, Bob 25%, Charlie 25%
    console.log("3. Adding Resort Expense (PERCENTAGE Split)...");
    console.log("Charlie pays ₹2000 for Resort stay: Alice 50%, Bob 25%, Charlie 25%");
    
    const percentageSplits: SplitData[] = [
        { user: userA, value: 50 }, // ₹1000
        { user: userB, value: 25 }, // ₹500
        { user: userC, value: 25 }, // ₹500
    ];

    await groupService.addExpense(
        tripGroup.groupId,
        "Resort Stay",
        2000,
        userC,
        percentageSplits,
        SplitType.PERCENTAGE
    );

    // Print Detailed Balance Sheet
    const updatedGroup = groupService.getGroup(tripGroup.groupId);
    balanceSheetService.printGroupBalanceSheets(updatedGroup);

    // Execute Debt Simplification
    console.log("--- Executing Debt Simplification Algorithm ---");

    const transactions = groupService.simplifyDebts(tripGroup.groupId);
    console.log(`\nMin-Cash-Flow Settlement Plan (${transactions.length} transactions total):`);

    transactions.forEach((tranc) => {
        const fromUser = updatedGroup.members.get(tranc.from)?.name;
        const toUser = updatedGroup.members.get(tranc.to)?.name;
        console.log(`${fromUser} --> pays --> ${toUser}: ${tranc.amount}`)
    });
}
driver().catch(console.error);
//  npx tsx driver.ts

