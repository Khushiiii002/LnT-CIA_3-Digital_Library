const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Book = require("./models/Book");
const MembershipPlan = require("./models/MembershipPlan");
const Transaction = require("./models/Transaction");
const Hold = require("./models/Hold");
const FinePayment = require("./models/FinePayment");
const Notification = require("./models/Notification");

const seedData = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB for seeding...");
    }

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Transaction.deleteMany({});
    await Hold.deleteMany({});
    await FinePayment.deleteMany({});
    await Notification.deleteMany({});

    // Create membership plans
    const plans = await MembershipPlan.insertMany([
      {
        name: "Student Plan",
        memberType: "student",
        maxBooksAllowed: 3,
        loanDurationDays: 14,
        maxRenewals: 1,
        finePerDay: 2,
      },
      {
        name: "Faculty Plan",
        memberType: "faculty",
        maxBooksAllowed: 10,
        loanDurationDays: 30,
        maxRenewals: 2,
        finePerDay: 1,
      },
    ]);
    console.log(`${plans.length} membership plans created`);

    // Create admin
    await User.create({
      name: "Admin User",
      email: "admin@library.com",
      passwordHash: "admin123",
      role: "admin",
      memberType: "faculty",
      membershipId: "ADM-2026-0001",
    });
    console.log("Admin created");

    // Create librarian
    const librarian = await User.create({
      name: "Librarian User",
      email: "librarian@library.com",
      passwordHash: "lib123",
      role: "librarian",
      memberType: "faculty",
      membershipId: "LIB-2026-0001",
    });
    console.log("Librarian created");

    // Create sample members (User.create so the bcrypt pre-save hook runs)
    const memberDefs = [
      {
        name: "John Doe",
        email: "john@student.com",
        passwordHash: "password123",
        role: "member",
        memberType: "student",
        membershipId: "MEM-2026-0001",
        phone: "1234567890",
      },
      {
        name: "Jane Smith",
        email: "jane@student.com",
        passwordHash: "password123",
        role: "member",
        memberType: "student",
        membershipId: "MEM-2026-0002",
        phone: "0987654321",
      },
      {
        name: "Dr. Robert Brown",
        email: "robert@faculty.com",
        passwordHash: "password123",
        role: "member",
        memberType: "faculty",
        membershipId: "MEM-2026-0003",
        phone: "5555555555",
      },
    ];
    const members = [];
    for (const def of memberDefs) members.push(await User.create(def));
    console.log(`${members.length} members created`);

    // Create sample books
    const books = await Book.insertMany([
      {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        isbn: "978-0262033848",
        category: "Computer Science",
        description: "Comprehensive textbook on algorithms",
        totalCopies: 5,
        availableCopies: 5,
      },
      {
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        isbn: "978-0078022159",
        category: "Computer Science",
        description: "Fundamentals of database systems",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Engineering Mathematics",
        author: "K.A. Stroud",
        isbn: "978-1358324857",
        category: "Mathematics",
        description: "Comprehensive engineering math reference",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Physics for Engineers",
        author: "R.A. Serway",
        isbn: "978-1133104261",
        category: "Physics",
        description: "Standard physics textbook for engineers",
        totalCopies: 6,
        availableCopies: 6,
      },
      {
        title: "Data Structures and Algorithms",
        author: "Michael T. Goodrich",
        isbn: "978-1118771334",
        category: "Computer Science",
        description: "Data structures and algorithm design",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Operating System Concepts",
        author: "Abraham Silberschatz",
        isbn: "978-1119800361",
        category: "Computer Science",
        description: "Operating systems principles and design",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Machine Learning",
        author: "Tom Mitchell",
        isbn: "978-0070428073",
        category: "Artificial Intelligence",
        description: "Introduction to machine learning",
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: "Linear Algebra and Its Applications",
        author: "Gilbert Strang",
        isbn: "978-1292222431",
        category: "Mathematics",
        description: "Linear algebra concepts and applications",
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum",
        isbn: "978-0132126953",
        category: "Computer Science",
        description: "Computer networking fundamentals",
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: "Thermodynamics: An Engineering Approach",
        author: "Yunus A. Cengel",
        isbn: "978-1260084719",
        category: "Mechanical Engineering",
        description: "Thermodynamics principles for engineers",
        totalCopies: 3,
        availableCopies: 3,
      },
    ]);
    console.log(`${books.length} books created`);

    // Create overdue transactions for Jane so fine/notification demo flows work
    const jane = members.find((m) => m.email === "jane@student.com");
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const janeTransactions = await Transaction.insertMany([
      {
        bookId: books[0]._id,
        memberId: jane._id,
        issuedBy: librarian._id,
        issueDate: new Date(now - 20 * day),
        dueDate: new Date(now - 6 * day),
        status: "overdue",
        bookTitle: books[0].title,
        memberName: jane.name,
      },
      {
        bookId: books[1]._id,
        memberId: jane._id,
        issuedBy: librarian._id,
        issueDate: new Date(now - 15 * day),
        dueDate: new Date(now - 1 * day),
        status: "overdue",
        bookTitle: books[1].title,
        memberName: jane.name,
      },
    ]);
    console.log(`${janeTransactions.length} overdue transactions created for Jane`);

    // Reflect overdue copies as borrowed
    for (const idx of [0, 1]) {
      books[idx].availableCopies -= 1;
      await books[idx].save();
    }

    console.log("\n--- Seed Complete ---");
    console.log("Admin: admin@library.com / admin123");
    console.log("Librarian: librarian@library.com / lib123");
    console.log("Member 1: john@student.com / password123");
    console.log("Member 2: jane@student.com / password123");
    console.log("Member 3: robert@faculty.com / password123");

    if (exitOnComplete) process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    if (exitOnComplete) process.exit(1);
  }
};

module.exports = seedData;

if (require.main === module) {
  seedData(true);
}
