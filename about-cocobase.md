[visit cocobase.buzz](https://docs.cocobase.buzz/)

Getting Started
Welcome To Cocobase
The Backend That Just Works - Build faster, ship sooner, scale effortlessly

​
Cocobase - The Backend That Just Works
Build faster. Ship sooner. Scale effortlessly.
Cocobase is a modern Backend-as-a-Service (BaaS) platform that eliminates the complexity of backend development. Focus on creating amazing user experiences while we handle your data, authentication, and infrastructure.
​
Why Cocobase?
​
Lightning Fast Setup
Go from idea to MVP in minutes, not weeks. No server configuration, no database setup, no authentication headaches.
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from "cocobase";

// This is literally all you need to start
const db = new Cocobase({ apiKey: "YOUR_API_KEY" });

await db.createDocument("users", {
  name: "John"
});
​
Authentication Made Simple
Built-in user management that actually works. Registration, login, sessions, and user profiles - all handled seamlessly.
JavaScript
Dart
Go
HTTP
await db.auth.register(
  'email@gmail.com',
  'password12',
  {
    full_name: "Stony Tech",
    address: "123 Lost avenue"
  }
);
​
Real-time Data Management
Store, retrieve, and manage your application data with a clean, intuitive API. No SQL knowledge required.
​
Developer Experience First
TypeScript-native, excellent error handling, and documentation that doesn’t make you cry.
​
Perfect For
​
Rapid Prototyping
Need to validate an idea quickly? Cocobase gets you from concept to working prototype in hours.
​
Mobile & Web Apps
Build modern applications without worrying about backend complexity. Works seamlessly with React, Vue, Angular, React Native, and Flutter.
​
Startups & MVPs
Scale from zero to thousands of users without changing a single line of backend code.
​
Solo Developers
You’re a frontend wizard but backend feels like dark magic? We’ve got you covered.
​
Learning Projects
Students and bootcamp graduates can focus on learning frontend skills without backend overwhelm.
​
Key Features
​
Instant Database
NoSQL Collections: Store any JSON data structure
Real-time Updates: Changes sync instantly across all clients
Automatic Indexing: Fast queries without database optimization headaches
Type Safety: Full TypeScript support with generic types
​
Complete Authentication System
User Registration & Login: Email/password authentication out of the box
Session Management: Automatic token handling and refresh
User Profiles: Extensible user data with custom fields
Secure by Default: Industry-standard security practices built-in
​
Developer-Friendly API
Intuitive Methods: CRUD operations that make sense
Error Handling: Detailed error messages with actionable suggestions
Local Storage Integration: Automatic session persistence
Zero Configuration: Works immediately after installation
​
Built to Scale
Global CDN: Fast response times worldwide
Auto-scaling Infrastructure: Handles traffic spikes automatically
99.9% Uptime: Reliable infrastructure you can count on
Performance Monitoring: Built-in analytics and monitoring
​
Use Cases
​
Content Management
Build blogs, portfolios, or documentation sites with dynamic content management.
// Create a blog post
await db.createDocument("posts", {
  title: "My Amazing Post",
  content: "...",
  author: currentUser.id,
  published: true,
});
​
E-commerce Applications
Manage products, orders, and customer data effortlessly.
// Add product to cart
await db.createDocument("cart", {
  userId: user.id,
  productId: "prod-123",
  quantity: 2,
});
​
Social Applications
Build social features like user profiles, posts, comments, and messaging.
// Create a social post
await db.createDocument("posts", {
  content: "Just shipped a new feature! 🚀",
  author: user.id,
  likes: 0,
  timestamp: new Date(),
});
​
Analytics Dashboards
Store and visualize application metrics and user data.
JavaScript
Dart
Go
HTTP
// Track user events
await db.createDocument("events", {
  userId: user.id,
  event: "button_click",
  metadata: { button: "signup", page: "landing" },
});
​
How We Compare
Feature	Cocobase	Custom Backend
Setup Time	2 minutes	Weeks/Months
TypeScript Support	Native	DIY
Learning Curve	Minimal	Very Steep
Authentication	Built-in	Build it
Developer Experience	Excellent	Varies
Pricing	Transparent	Unpredictable
​
Framework Integration
Cocobase works beautifully with all modern frameworks:
​
React/Next.js
const [posts, setPosts] = useState([]);

useEffect(() => {
  db.listDocuments("posts").then(setPosts);
}, []);
​
Vue/Nuxt
const posts = ref([]);

onMounted(async () => {
  posts.value = await db.listDocuments("posts");
});
​
React Native
// Same API, works everywhere
const posts = await db.listDocuments("posts");
​
Success Stories
“Cocobase saved us 3 months of backend development. We launched our MVP in 2 weeks and now serve 10,000+ users.”
- Sarah Chen, Startup Founder
“As a frontend developer, I was always intimidated by backend work. Cocobase made it feel natural and intuitive.”
- Marcus Rodriguez, Full-stack Developer
“We migrated from a custom Node.js backend to Cocobase and reduced our infrastructure costs by 60% while improving reliability.”
- Alex Thompson, CTO
​
Getting Started
Ready to build something amazing? Here’s how to get started:
Visit cocobase.buzz
Sign up for a free account
Create your first project
Install the SDK: npm install cocobase
Start building awesome things!
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "your-api-key" });

// You're ready to build!
​
Resources
Documentation - Comprehensive guides and API reference
Examples - Sample projects and tutorials
SDK List - All Official SDK repositories
Community - Join our developer community
​
Community & Support
Discord: Join our community for real-time help
Twitter: @CocobaseHQ for updates
Email: hello@cocobase.buzz for direct support
Issues: Report bugs on GitHub
​
Built With Love
Cocobase is crafted by developers, for developers. We understand the pain of backend complexity because we’ve lived it. Our mission is to make backend development as enjoyable as frontend development.
Join thousands of developers who’ve already made the switch to Cocobase.
​
Ready to eliminate backend complexity forever?
Start Building Now →
Free tier available. No credit card required.

Getting Started
Quickstart
Start building awesome documentation in minutes

​
Get started in three steps
Get your documentation site running locally and make your first customization.
​
Step 1: Set up your local environment
Clone your docs locally

During the onboarding process, you created a GitHub repository with your docs content if you didn’t already have one. You can find a link to this repository in your dashboard.
To clone the repository locally so that you can make and preview changes to your docs, follow the Cloning a repository guide in the GitHub docs.
Start the preview server

Install the Mintlify CLI: npm i -g mint
Navigate to your docs directory and run: mint dev
Open http://localhost:3000 to see your docs live!
Your preview updates automatically as you edit files.
​
Step 2: Deploy your changes
Install our GitHub app

Install the Mintlify GitHub app from your dashboard.
Our GitHub app automatically deploys your changes to your docs site, so you don’t need to manage deployments yourself.
Update your site name and colors

For a first change, let’s update the name and colors of your docs site.
Open docs.json in your editor.
Change the "name" field to your project name.
Update the "colors" to match your brand.
Save and see your changes instantly at http://localhost:3000.
Try changing the primary color to see an immediate difference!
​
Step 3: Go live
Publish your docs

Commit and push your changes.
Your docs will update and be live in moments!

Getting Started
Get up and running with Cocobase in minutes

​
Getting Started with Cocobase
Welcome to Cocobase! This guide will help you set up and make your first API call in just a few minutes.
​
Prerequisites
Before you begin, make sure you have:
A Cocobase account - Sign up for free
An API key from your project dashboard
Your development environment set up for your preferred language
​
Installation
Choose your language and install the Cocobase SDK:
JavaScript
Dart
Go
Python
HTTP
npm
npm install cocobase
yarn
yarn add cocobase
pnpm
pnpm add cocobase
​
Configuration
Initialize Cocobase with your API key:
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: "YOUR_API_KEY",
});
For Next.js projects:
// lib/cocobase.ts
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY,
});
For React projects:
// src/lib/cocobase.ts
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: import.meta.env.VITE_COCOBASE_API_KEY,
});
​
Your First Request
Let’s create a document in a collection called “users”:
JavaScript
Dart
Go
Python
HTTP
// Create a new user
const user = await db.createDocument("users", {
  name: "Alice Johnson",
  email: "alice@example.com",
  role: "developer",
});

console.log("Created user:", user);
Response:
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "developer",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
​
Reading Data
Now let’s retrieve the document we just created:
JavaScript
Dart
Go
Python
HTTP
// Get all users
const users = await db.listDocuments("users");
console.log("All users:", users);

// Get a specific user by ID
const user = await db.getDocument("users", "507f1f77bcf86cd799439011");
console.log("User:", user);
​
Environment Variables
For security, always use environment variables for your API key:
JavaScript
Dart
Go
Python
HTTP
Create a .env.local file:
NEXT_PUBLIC_COCOBASE_API_KEY=your_api_key_here
# or for Vite/React
VITE_COCOBASE_API_KEY=your_api_key_here
Never commit your .env files to version control. Add them to .gitignore: bash .env .env.local .env*.local
​

Authentication
Complete guide to user authentication and management with Cocobase

​
Authentication
Cocobase provides a complete authentication system with user registration, login, session management, and profile handling. No complex setup required - just use the built-in auth methods.
​
Quick Start
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "YOUR_API_KEY" });

// Register a new user
const user = await db.auth.register(
  "user@example.com",
  "securePassword123",
  {
    full_name: "Alice Johnson",
    role: "developer"
  }
);

// Login
const session = await db.auth.login("user@example.com", "securePassword123");
​
User Registration
Create new user accounts with email and password:
JavaScript
Dart
Go
Python
HTTP
// Basic registration
const user = await db.auth.register(
  "alice@example.com",
  "SecurePass123!"
);

// With additional user data
const userWithData = await db.auth.register(
  "bob@example.com",
  "SecurePass123!",
  {
    full_name: "Bob Smith",
    age: 25,
    role: "admin",
    preferences: {
      theme: "dark",
      notifications: true
    }
  }
);
Response:
{
  "id": "user_123abc",
  "email": "alice@example.com",
  "data": {
    "full_name": "Bob Smith",
    "age": 25,
    "role": "admin",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "token": "eyJhbGc..."
}
Password requirements: - Minimum 8 characters - At least one uppercase letter
At least one lowercase letter - At least one number
​
User Login
Authenticate users and get access tokens:
JavaScript
Dart
Go
Python
HTTP
// Login
const session = await db.auth.login(
  "alice@example.com",
  "SecurePass123!"
);

console.log("Token:", session.token);
console.log("User:", session.user);

// The token is automatically stored and used for future requests
With automatic token persistence:
// Token is automatically saved to localStorage
await db.auth.login("alice@example.com", "SecurePass123!");

// On page reload, check if user is still logged in
const currentUser = db.auth.getCurrentUser();
if (currentUser) {
  console.log("User is logged in:", currentUser);
}
​
Get Current User
Retrieve the currently authenticated user:
JavaScript
Dart
Go
Python
HTTP
// Get current user (from stored token)
const user = db.auth.getCurrentUser();

if (user) {
  console.log("Logged in as:", user.email);
  console.log("User data:", user.data);
} else {
  console.log("No user logged in");
}

// Fetch fresh user data from server
const freshUser = await db.auth.fetchCurrentUser();
​
Update User Profile
Update user data after authentication:
JavaScript
Dart
Go
Python
HTTP
// Update user profile
const updatedUser = await db.auth.updateProfile({
  full_name: "Alice Johnson Smith",
  bio: "Full-stack developer",
  avatar: "https://example.com/avatar.jpg",
  preferences: {
    theme: "dark",
    language: "en"
  }
});

console.log("Updated user:", updatedUser);
​
Logout
End the user session:
JavaScript
Dart
Go
Python
HTTP
// Logout current user
await db.auth.logout();

console.log("User logged out");

// Verify logout
const user = db.auth.getCurrentUser(); // Returns null
​
Password Management
​
Change Password
JavaScript
Dart
Go
Python
HTTP
// Change password (user must be logged in)
await db.auth.changePassword("oldPassword123", "newPassword456");
​
Request Password Reset
JavaScript
Dart
Go
Python
HTTP
// Send password reset email
await db.auth.requestPasswordReset("user@example.com");
​
Reset Password with Token
JavaScript
Dart
Go
Python
HTTP
// Reset password using token from email
await db.auth.resetPassword("reset_token_from_email", "newPassword123");
​
OAuth Authentication
Authenticate users with Google, GitHub, and other OAuth providers:
JavaScript
Dart
Go
Python
HTTP
// Initiate Google OAuth flow
const authUrl = await db.auth.getOAuthUrl("google", {
  redirectUrl: "https://yourapp.com/auth/callback",
  scopes: ["email", "profile"]
});

// Redirect user to authUrl
window.location.href = authUrl;

// In your callback handler
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// Exchange code for token
const session = await db.auth.handleOAuthCallback("google", code);
console.log("User logged in:", session.user);
Supported OAuth Providers:
Google
GitHub
Facebook
Twitter
Microsoft
Apple
​
Two-Factor Authentication (2FA)
​
Enable 2FA
JavaScript
Dart
Go
Python
HTTP
// Enable 2FA for current user
const { qrCode, secret } = await db.auth.enable2FA();

console.log("Scan this QR code:", qrCode);
console.log("Or enter this secret manually:", secret);

// Verify 2FA setup with code from authenticator app
await db.auth.verify2FA("123456");
​
Login with 2FA
JavaScript
Dart
Go
Python
HTTP
try {
  // First attempt login
  await db.auth.login("user@example.com", "password123");
} catch (error) {
  if (error.code === "2FA_REQUIRED") {
    // Prompt user for 2FA code
    const code = prompt("Enter 2FA code:");

    // Complete login with 2FA
    await db.auth.verify2FALogin(code);
  }
}
​
Role-Based Access Control
Manage user roles and permissions:
JavaScript
Dart
Go
Python
HTTP
// Register user with role
const admin = await db.auth.register(
  "admin@example.com",
  "password123",
  {
    full_name: "Admin User",
    role: "admin"
  }
);

// Check user role
const currentUser = db.auth.getCurrentUser();
if (currentUser.data.role === "admin") {
  // Show admin features
}

// Update user role (admin only)
await db.auth.updateUserRole("user_id_123", "moderator");
​
Authentication with React
Complete example for React applications:
// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { db } from "@/lib/cocobase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = db.auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const session = await db.auth.login(email, password);
    setUser(session.user);
    return session;
  };

  const register = async (email: string, password: string, data?: any) => {
    const user = await db.auth.register(email, password, data);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await db.auth.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}

// components/LoginForm.tsx
function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
​
Authentication with Flutter
Complete example for Flutter applications:
// providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import 'package:coco_base_flutter/coco_base_flutter.dart';

class AuthProvider with ChangeNotifier {
  final Cocobase _db;
  Map<String, dynamic>? _user;

  AuthProvider(this._db) {
    _loadUser();
  }

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<void> _loadUser() async {
    _user = await _db.getCurrentUser();
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final session = await _db.login(email: email, password: password);
    _user = session.user;
    notifyListeners();
  }

  Future<void> register(String email, String password, Map<String, dynamic>? data) async {
    final user = await _db.register(
      email: email,
      password: password,
      data: data,
    );
    _user = user;
    notifyListeners();
  }

  Future<void> logout() async {
    await _db.logout();
    _user = null;
    notifyListeners();
  }
}

// screens/login_screen.dart
class LoginScreen extends StatelessWidget {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            ElevatedButton(
              onPressed: () async {
                await context.read<AuthProvider>().login(
                  _emailController.text,
                  _passwordController.text,
                );
              },
              child: Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
​
Error Handling
Common authentication errors and how to handle them:
JavaScript
Dart
Go
Python
HTTP
try {
  await db.auth.login(email, password);
} catch (error) {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      console.error('Invalid email or password');
      break;
    case '2FA_REQUIRED':
      console.log('2FA code required');
      break;
    case 'USER_NOT_FOUND':
      console.error('User not found');
      break;
    case 'EMAIL_ALREADY_EXISTS':
      console.error('Email already registered');
      break;
    default:
      console.error('Authentication error:', error.message);
  }
}
​
Best Practices
Secure Password Storage

Never store passwords in plain text. Use environment variables and secure storage:
// ✅ Good
const password = process.env.USER_PASSWORD;

// ❌ Bad
const password = "hardcoded_password123";
Token Security

Tokens are automatically stored securely: - Browser: localStorage (with HttpOnly flag) - Mobile: Secure storage (Keychain/Keystore) - Server: Memory or secure storage backend
Session Management

Implement automatic token refresh and session validation:
// Check session on app start
const user = db.auth.getCurrentUser();
if (user) {
  try {
    await db.auth.fetchCurrentUser(); // Validates token
  } catch (error) {
    // Token expired, redirect to login
    await db.auth.logout();
  }
}
Password Requirements

Enforce strong password requirements:
Minimum 8 characters
Mix of uppercase, lowercase, numbers
Consider special characters
Implement password strength meter

​
Collections & Documents
Understanding data organization in Cocobase

​
Collections & Documents
Cocobase uses a document-based data model similar to MongoDB and Firestore. Data is organized into collections containing documents (JSON objects).
​
What is a Collection?
A collection is a group of related documents. Think of it like a table in a relational database, but without a fixed schema.
Examples:
users - User profiles and account data
posts - Blog posts or social media content
products - E-commerce product catalog
orders - Customer orders
​
What is a Document?
A document is a JSON object containing your data. Each document has a specific structure:
id - Unique identifier (auto-generated)
collection - Name of the collection this document belongs to
createdAt - Creation timestamp (auto-generated)
updatedAt - Last update timestamp (auto-generated)
data - Object containing your custom fields
Document Structure:
{
  "id": "507f1f77bcf86cd799439011",
  "collection": "users",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "data": {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "age": 28,
    "role": "developer",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "tags": ["javascript", "react", "nodejs"]
  }
}
Important: All your custom fields are stored inside the data property. The top-level properties (id, collection, createdAt, updatedAt) are managed by Cocobase.
​
Schema-less Design
Collections in Cocobase are schema-less - documents in the same collection can have different fields.
JavaScript
Dart
Go
Python
// These can all exist in the same collection
await db.createDocument("products", {
  type: "book",
  title: "Learning TypeScript",
  author: "John Doe",
  pages: 350
});

await db.createDocument("products", {
  type: "laptop",
  brand: "Apple",
  model: "MacBook Pro",
  specs: {
    ram: "16GB",
    storage: "512GB"
  }
});
​
Supported Data Types
Cocobase supports all JSON data types:
Type	Description	Example
String	Text data	"Hello World"
Number	Integers and floats	42, 3.14
Boolean	True/false values	true, false
Array	Ordered lists	[1, 2, 3], ["a", "b"]
Object	Nested objects	{ "name": "John" }
Null	Null value	null
Date	ISO 8601 strings	"2024-01-15T10:30:00Z"
​
Nested Objects
You can nest objects as deeply as needed:
{
  "user": {
    "name": "Alice",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "geo": {
        "lat": 40.7128,
        "lng": -74.006
      }
    }
  }
}
​
Arrays
Arrays can contain any data type:
{
  "tags": ["javascript", "react", "nodejs"],
  "scores": [85, 92, 78],
  "metadata": [
    { "key": "category", "value": "tech" },
    { "key": "priority", "value": 1 }
  ]
}
​
Collection Naming
Best practices for naming collections:
Use lowercase - users, not Users
Use plural - posts, not post
Use underscores for multi-word - blog_posts
Keep names descriptive - product_reviews, not pr
Avoid special characters except _ and -
Good names:
users
blog_posts
product_reviews
order_items
user_preferences
Avoid:
User          // Not plural
blogPost      // Use snake_case
pr            // Too short
product$      // Special characters
123_test      // Starting with number
​
Document IDs
Every document has a unique id field:
Auto-generated
Custom ID
// Cocobase generates a unique ID
const doc = await db.createDocument("users", {
  name: "Alice"
});

console.log(doc.id); // "507f1f77bcf86cd799439011"
Custom IDs must be unique within the collection. Attempting to create a document with an existing ID will fail.
​
Automatic Fields
Cocobase automatically adds these fields to every document:
​
id - Unique Identifier
{
  "id": "507f1f77bcf86cd799439011"
}
​
createdAt - Creation Timestamp
{
  "createdAt": "2024-01-15T10:30:00Z"
}
​
updatedAt - Last Update Timestamp
{
  "updatedAt": "2024-01-15T15:45:00Z"
}
These fields are managed automatically. You cannot override them when creating or updating documents.
​
Collection Operations
​
Create a Collection
Collections are created automatically when you insert the first document:
JavaScript
Dart
Go
Python
// Collection "users" is created automatically
await db.createDocument("users", {
  name: "Alice"
});
​
List Collections
JavaScript
Dart
Go
Python
const collections = await db.listCollections();
console.log(collections); // ["users", "posts", "products"]
​
Delete a Collection
Deleting a collection permanently removes all documents. This action cannot be undone.
JavaScript
Dart
Go
Python
await db.deleteCollection("old_data");
​
Document Size Limits
Maximum document size: 16 MB
Maximum nesting depth: 100 levels
Maximum array length: 100,000 elements
For large files (images, videos, documents), use File Storage instead of embedding in documents.
​
Best Practices
Keep Documents Focused

Each document should represent a single entity. Don’t try to store your entire application state in one document.
// ✅ Good - Focused document
{
  "id": "user_123",
  "name": "Alice",
  "email": "alice@example.com"
}

// ❌ Bad - Too much data
{
  "id": "user_123",
  "name": "Alice",
  "posts": [...100 posts...],
  "comments": [...500 comments...],
  "friends": [...200 friends...]
}
Use Relationships for Related Data

Instead of embedding everything, use document references and population.
// ✅ Good - Use references
{
  "id": "post_456",
  "title": "My Post",
  "authorId": "user_123"  // Reference to user
}

// Then populate when needed
const posts = await db.listDocuments("posts", {
  populate: ["authorId"]
});
Index Frequently Queried Fields

Add indexes for fields you query often to improve performance.
// Create index on email field
await db.createIndex("users", "email");

// Queries on email will be faster
const user = await db.listDocuments("users", {
  filters: { email: { $eq: "alice@example.com" } }
});
Use Consistent Field Names

Stick to a naming convention across your application.
// ✅ Good - Consistent naming
{
  "userId": "user_123",
  "createdBy": "user_456",
  "assignedTo": "user_789"
}

// ❌ Bad - Inconsistent
{
  "userId": "user_123",
  "creator": "user_456",
  "assigned_user_id": "user_789"
}
​
Type Safety (TypeScript)
Use TypeScript interfaces for type-safe operations:
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  role: "admin" | "user" | "moderator";
  createdAt: string;
  updatedAt: string;
}

// Type-safe create
const user = await db.createDocument<User>("users", {
  name: "Alice",
  email: "alice@example.com",
  role: "user",
});

// user is typed as User
console.log(user.name); // ✅ TypeScript knows this exists
console.log(user.foo); // ❌ TypeScript error
​

Data Types
Supported data types and type conversion in Cocobase

​
Data Types
Cocobase supports all standard JSON data types plus additional type conversion utilities for strongly-typed applications.
​
Primitive Types
​
String
Text data of any length.
{
  "name": "Alice Johnson",
  "bio": "Full-stack developer passionate about clean code",
  "website": "https://alice.dev"
}
​
Number
Integers and floating-point numbers.
{
  "age": 28,
  "price": 99.99,
  "rating": 4.5,
  "quantity": 100
}
Numbers are stored as IEEE 754 double-precision floating-point. Maximum safe integer: 2^53 - 1 (9,007,199,254,740,991)
​
Boolean
True or false values.
{
  "isActive": true,
  "emailVerified": false,
  "hasSubscription": true
}
​
Null
Represents absence of a value.
{
  "middleName": null,
  "avatar": null
}
​
Complex Types
​
Object
Nested JSON objects for structured data.
{
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
Nesting limit: 100 levels deep
​
Array
Ordered collections of any type.
{
  "tags": ["javascript", "react", "nodejs"],
  "scores": [85, 92, 78, 95],
  "metadata": [
    { "key": "category", "value": "tech" },
    { "key": "priority", "value": 1 }
  ]
}
Maximum length: 100,000 elements
​
Date and Time
Dates are stored as ISO 8601 strings.
{
  "createdAt": "2024-01-15T10:30:00Z",
  "publishDate": "2024-02-01T00:00:00Z",
  "lastLogin": "2024-01-20T14:45:30.123Z"
}
JavaScript
Dart
Go
Python
// Create with current date
await db.createDocument("events", {
  name: "Product Launch",
  date: new Date().toISOString()
});

// Parse date from document
const event = await db.getDocument("events", "event_123");
const date = new Date(event.date);
console.log(date.toLocaleDateString()); // "1/15/2024"
​
Type Conversion (Flutter/Dart)
Flutter SDK provides type converters for type-safe operations.
​
Defining Converters
// models/user.dart
class User {
  final String id;
  final String name;
  final String email;
  final int age;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.age,
    required this.createdAt,
  });

  // From JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      age: json['age'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  // To JSON
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'age': age,
    };
  }
}
​
Registering Converters
// Register converters globally
db.registerConverter<User>(
  fromJson: (json) => User.fromJson(json),
  toJson: (user) => user.toJson(),
);

// Use typed operations
final user = await db.createDocument<User>('users', User(
  id: '',
  name: 'Alice',
  email: 'alice@example.com',
  age: 28,
  createdAt: DateTime.now(),
));

// user is strongly typed
print(user.name); // Alice
​
TypeScript Type Definitions
Define interfaces for compile-time type safety:
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  tags: string[];
  category: "electronics" | "clothing" | "books";
  metadata: {
    brand: string;
    sku: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Type-safe operations
const product = await db.createDocument<Product>("products", {
  name: "Laptop",
  description: "High-performance laptop",
  price: 1299.99,
  inStock: true,
  tags: ["computer", "electronics"],
  category: "electronics",
  metadata: {
    brand: "TechCorp",
    sku: "LAP-001",
  },
});

// TypeScript knows the shape
console.log(product.price); // ✅ number
console.log(product.foo); // ❌ Error: Property 'foo' does not exist
​
Special Data Types
​
File References
Store file URLs or references to uploaded files:
{
  "profilePicture": "https://storage.cocobase.buzz/files/avatar.jpg",
  "documents": [
    "https://storage.cocobase.buzz/files/resume.pdf",
    "https://storage.cocobase.buzz/files/portfolio.pdf"
  ]
}
See File Storage for details.
​
Document References
Store references to other documents:
{
  "userId": "user_123",           // Reference to user document
  "categoryId": "category_456",   // Reference to category document
  "relatedPosts": [               // Array of references
    "post_789",
    "post_012"
  ]
}
Use population to fetch referenced documents.
​
Geolocation
Store coordinates as nested objects:
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "accuracy": 10
  }
}
Query with range filters:
const nearbyPlaces = await db.listDocuments("places", {
  filters: {
    "location.lat": { $gte: 40.0, $lte: 41.0 },
    "location.lng": { $gte: -75.0, $lte: -73.0 },
  },
});
​
Type Validation
While Cocobase is schema-less, you can implement validation in your application:
TypeScript/JavaScript
Flutter/Dart
Go
Python
Cloud Functions
​
Using Zod
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(["admin", "user", "moderator"]),
});

// Validate before creating
const userData = {
  name: "Alice",
  email: "alice@example.com",
  age: 28,
  role: "user" as const,
};

const validatedData = UserSchema.parse(userData);
await db.createDocument("users", validatedData);
​
Type Coercion
Cocobase automatically handles some type conversions:
// Numbers
"42" → 42         // String to number in numeric context
42.0 → 42         // Float to int when whole number

// Booleans
"true" → true     // String to boolean
1 → true          // Number to boolean
0 → false

// Dates
"2024-01-15" → "2024-01-15T00:00:00Z"  // Date string normalization
Automatic coercion is not guaranteed. Always store data in the correct type to avoid unexpected behavior.
​
Best Practices
Use Consistent Types

Keep field types consistent across documents:
// ✅ Good - Consistent types
{ "price": 99.99 }
{ "price": 149.99 }

// ❌ Bad - Mixed types
{ "price": 99.99 }
{ "price": "149.99" }  // String instead of number
Store Dates as ISO Strings

Always use ISO 8601 format for dates:
// ✅ Good
{ "date": "2024-01-15T10:30:00Z" }

// ❌ Bad
{ "date": "01/15/2024" }        // Non-standard format
{ "date": 1705319400000 }       // Unix timestamp
Use Arrays for Ordered Data

Use arrays when order matters, objects when it doesn’t:
// ✅ Array for ordered list
{
  "steps": ["Mix", "Bake", "Cool", "Serve"]
}

// ✅ Object for key-value pairs
{
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  }
}
Define TypeScript Interfaces

Always define interfaces for your data models:
// ✅ Good - Clear interface
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishedAt: string;
}

// Use in operations
const post = await db.createDocument<Post>("posts", {...});
​
Type Limits
Type	Maximum Size/Length
String	16 MB per document
Number	±1.7976931348623157 × 10^308
Array	100,000 elements
Object	100 levels of nesting
Document	16 MB total size


CRUD Operations
Master the fundamental database operations with multi-language support

​
CRUD Operations
Master the four fundamental database operations: Create, Read, Update, and Delete across all platforms.
CRUD operations are the building blocks of any application. Cocobase makes them simple, intuitive, and consistent across all languages.
​
Overview
Cocobase provides type-safe, efficient CRUD operations for all supported platforms:
Create - Add new documents to collections
Read - Retrieve documents by ID or with filters
Update - Modify existing documents (partial or full)
Delete - Remove documents from collections
Batch Operations - Perform multiple operations at once
​
Create Documents
Add new documents to your collections with automatic ID generation and timestamp tracking.
​
Basic Creation
JavaScript
TypeScript
Dart
Go
Python
HTTP
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// Create a single document
const user = await db.createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true
});

console.log('Created user:', user.id);
​
Type-Safe Creation
JavaScript
Dart
Go
Python
HTTP
interface User {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

const user = await db.createDocument<User>('users', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 28,
  active: true
});

// TypeScript knows the structure
console.log(user.data.name); // ✓ Type-safe
​
Batch Creation
Create multiple documents in a single operation for better performance.
JavaScript
Dart
Go
Python
HTTP
const users = await db.createDocuments('users', [
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob', email: 'bob@example.com', age: 32 },
  { name: 'Charlie', email: 'charlie@example.com', age: 28 }
]);

console.log(`Created ${users.length} users`);
​
Read Documents
Retrieve documents by ID, or query collections with filters and pagination.
​
Get Single Document
JavaScript
Dart
Go
Python
HTTP
const user = await db.getDocument('users', 'user-123');
console.log(user.data);
​
List All Documents
JavaScript
Dart
Go
Python
HTTP
const allUsers = await db.listDocuments('users');
console.log(`Total users: ${allUsers.length}`);
​
With Filters
JavaScript
Dart
Go
Python
HTTP
// Get active users
const activeUsers = await db.listDocuments('users', {
  filters: { active: true }
});

// Get users older than 25
const olderUsers = await db.listDocuments('users', {
  filters: { age_gte: 25 }
});

// Multiple filters (AND logic)
const specificUsers = await db.listDocuments('users', {
  filters: {
    active: true,
    age_gte: 25,
    age_lte: 40
  }
});
​
With Pagination
JavaScript
Dart
Go
Python
HTTP
// Get first page (10 users)
const page1 = await db.listDocuments('users', {
  limit: 10,
  offset: 0
});

// Get second page
const page2 = await db.listDocuments('users', {
  limit: 10,
  offset: 10
});

// Helper function
function getPage(pageNumber, pageSize = 10) {
  return db.listDocuments('users', {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });
}

const page3 = await getPage(3); // Users 21-30
​
Update Documents
Modify existing documents with partial or full updates.
​
Basic Update
JavaScript
Dart
Go
Python
HTTP
await db.updateDocument('users', 'user-123', {
  age: 31,
  active: false
});

console.log('User updated');
Updates are partial by default - you only need to provide the fields you want to change. Other fields remain unchanged.
​
Batch Update
JavaScript
Dart
Go
Python
HTTP
// Update multiple documents at once
await db.updateDocuments('users', {
  'user-1': { age: 31 },
  'user-2': { age: 29 },
  'user-3': { active: false }
});
​
Delete Documents
Remove documents from collections permanently.
​
Delete Single Document
JavaScript
Dart
Go
Python
HTTP
await db.deleteDocument('users', 'user-123');
console.log('User deleted');
​
Batch Delete
JavaScript
Dart
Go
Python
HTTP
const idsToDelete = ['user-1', 'user-2', 'user-3'];

const result = await db.deleteDocuments('users', idsToDelete);
console.log(`Deleted ${result.count} documents`);
​
Soft Delete (Recommended)
Instead of permanently deleting, mark documents as deleted for recovery options.
JavaScript
Dart
Go
Python
HTTP
// Mark as deleted instead of removing
await db.updateDocument('users', 'user-123', {
  deleted: true,
  deletedAt: new Date().toISOString()
});

// Query non-deleted items
const activeUsers = await db.listDocuments('users', {
  filters: { deleted: false }
});
​
Error Handling
Handle errors gracefully across all operations.
JavaScript
Dart
Go
Python
HTTP
try {
  const user = await db.getDocument('users', userId);
  console.log(user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
  // Handle error appropriately
}
​
Best Practices
1. Use Type Safety

Define your data structures for better development experience and fewer bugs.
// ✓ Good: Type-safe
interface User {
  name: string;
  email: string;
}

const user = await db.createDocument<User>('users', {
  name: 'John',
  email: 'john@example.com'
});
2. Handle Errors

Always wrap operations in try-catch blocks or check for errors.
// ✓ Good: Error handling
try {
  const user = await db.getDocument('users', userId);
  console.log(user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
}
3. Use Batch Operations

Batch operations are more efficient than multiple individual requests.
// ✓ Good: Single batch operation
await db.createDocuments('users', [user1, user2, user3]);

// ✗ Bad: Multiple individual operations
await db.createDocument('users', user1);
await db.createDocument('users', user2);
await db.createDocument('users', user3);
4. Prefer Soft Deletes

Use soft deletes for important data to enable recovery.
// ✓ Good: Soft delete
await db.updateDocument('users', userId, {
  deleted: true,
  deletedAt: new Date().toISOString()
});
5. Add Timestamps

Track when records are created and modified.
// ✓ Good: Include timestamps
const post = await db.createDocument('posts', {
  title: 'My Post',
  content: '...',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});


CRUD Operations
Master the fundamental database operations with multi-language support

​
CRUD Operations
Master the four fundamental database operations: Create, Read, Update, and Delete across all platforms.
CRUD operations are the building blocks of any application. Cocobase makes them simple, intuitive, and consistent across all languages.
​
Overview
Cocobase provides type-safe, efficient CRUD operations for all supported platforms:
Create - Add new documents to collections
Read - Retrieve documents by ID or with filters
Update - Modify existing documents (partial or full)
Delete - Remove documents from collections
Batch Operations - Perform multiple operations at once
​
Create Documents
Add new documents to your collections with automatic ID generation and timestamp tracking.
​
Basic Creation
JavaScript
TypeScript
Dart
Go
Python
HTTP
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// Create a single document
const user = await db.createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true
});

console.log('Created user:', user.id);
​
Type-Safe Creation
JavaScript
Dart
Go
Python
HTTP
interface User {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

const user = await db.createDocument<User>('users', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 28,
  active: true
});

// TypeScript knows the structure
console.log(user.data.name); // ✓ Type-safe
​
Batch Creation
Create multiple documents in a single operation for better performance.
JavaScript
Dart
Go
Python
HTTP
const users = await db.createDocuments('users', [
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob', email: 'bob@example.com', age: 32 },
  { name: 'Charlie', email: 'charlie@example.com', age: 28 }
]);

console.log(`Created ${users.length} users`);
​
Read Documents
Retrieve documents by ID, or query collections with filters and pagination.
​
Get Single Document
JavaScript
Dart
Go
Python
HTTP
const user = await db.getDocument('users', 'user-123');
console.log(user.data);
​
List All Documents
JavaScript
Dart
Go
Python
HTTP
const allUsers = await db.listDocuments('users');
console.log(`Total users: ${allUsers.length}`);
​
With Filters
JavaScript
Dart
Go
Python
HTTP
// Get active users
const activeUsers = await db.listDocuments('users', {
  filters: { active: true }
});

// Get users older than 25
const olderUsers = await db.listDocuments('users', {
  filters: { age_gte: 25 }
});

// Multiple filters (AND logic)
const specificUsers = await db.listDocuments('users', {
  filters: {
    active: true,
    age_gte: 25,
    age_lte: 40
  }
});
​
With Pagination
JavaScript
Dart
Go
Python
HTTP
// Get first page (10 users)
const page1 = await db.listDocuments('users', {
  limit: 10,
  offset: 0
});

// Get second page
const page2 = await db.listDocuments('users', {
  limit: 10,
  offset: 10
});

// Helper function
function getPage(pageNumber, pageSize = 10) {
  return db.listDocuments('users', {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });
}

const page3 = await getPage(3); // Users 21-30
​
Update Documents
Modify existing documents with partial or full updates.
​
Basic Update
JavaScript
Dart
Go
Python
HTTP
await db.updateDocument('users', 'user-123', {
  age: 31,
  active: false
});

console.log('User updated');
Updates are partial by default - you only need to provide the fields you want to change. Other fields remain unchanged.
​
Batch Update
JavaScript
Dart
Go
Python
HTTP
// Update multiple documents at once
await db.updateDocuments('users', {
  'user-1': { age: 31 },
  'user-2': { age: 29 },
  'user-3': { active: false }
});
​
Delete Documents
Remove documents from collections permanently.
​
Delete Single Document
JavaScript
Dart
Go
Python
HTTP
await db.deleteDocument('users', 'user-123');
console.log('User deleted');
​
Batch Delete
JavaScript
Dart
Go
Python
HTTP
const idsToDelete = ['user-1', 'user-2', 'user-3'];

const result = await db.deleteDocuments('users', idsToDelete);
console.log(`Deleted ${result.count} documents`);
​
Soft Delete (Recommended)
Instead of permanently deleting, mark documents as deleted for recovery options.
JavaScript
Dart
Go
Python
HTTP
// Mark as deleted instead of removing
await db.updateDocument('users', 'user-123', {
  deleted: true,
  deletedAt: new Date().toISOString()
});

// Query non-deleted items
const activeUsers = await db.listDocuments('users', {
  filters: { deleted: false }
});
​
Error Handling
Handle errors gracefully across all operations.
JavaScript
Dart
Go
Python
HTTP
try {
  const user = await db.getDocument('users', userId);
  console.log(user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
  // Handle error appropriately
}
​
Best Practices
1. Use Type Safety

Define your data structures for better development experience and fewer bugs.
// ✓ Good: Type-safe
interface User {
  name: string;
  email: string;
}

const user = await db.createDocument<User>('users', {
  name: 'John',
  email: 'john@example.com'
});
2. Handle Errors

Always wrap operations in try-catch blocks or check for errors.
// ✓ Good: Error handling
try {
  const user = await db.getDocument('users', userId);
  console.log(user);
} catch (error) {
  console.error('Failed to fetch user:', error.message);
}
3. Use Batch Operations

Batch operations are more efficient than multiple individual requests.
// ✓ Good: Single batch operation
await db.createDocuments('users', [user1, user2, user3]);

// ✗ Bad: Multiple individual operations
await db.createDocument('users', user1);
await db.createDocument('users', user2);
await db.createDocument('users', user3);
4. Prefer Soft Deletes

Use soft deletes for important data to enable recovery.
// ✓ Good: Soft delete
await db.updateDocument('users', userId, {
  deleted: true,
  deletedAt: new Date().toISOString()
});
5. Add Timestamps

Track when records are created and modified.
// ✓ Good: Include timestamps
const post = await db.createDocument('posts', {
  title: 'My Post',
  content: '...',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});


Query & Filtering
Advanced filtering, searching, and querying across all platforms

​
Query & Filtering
Master advanced query techniques including filtering, searching, sorting, and pagination with powerful operators across all platforms.
Cocobase provides a comprehensive query system with support for complex filters, logical operators, and efficient pagination.
​
Overview
Build powerful queries with:
Comparison operators - Equal, not equal, greater than, less than
String operators - Contains, starts with, ends with, regex
List operators - In, not in
Logical operators - AND, OR, NOT combinations
Sorting - Order results by any field
Pagination - Limit and offset for large datasets
Query builder - Fluent, chainable API
​
Basic Filtering
Filter documents by field values with automatic type handling.
​
Equality Filters
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// Simple equality
const activeUsers = await db.listDocuments('users', {
  filters: { status: 'active' }
});

// Multiple filters (AND logic)
const specificUsers = await db.listDocuments('users', {
  filters: {
    status: 'active',
    role: 'admin',
    verified: true
  }
});
​
Query Operators
​
Comparison Operators
Filter by numeric ranges and comparisons.
JavaScript
Dart
Go
Python
HTTP
// Greater than
const seniors = await db.listDocuments('users', {
  filters: { age_gt: 65 }
});

// Greater than or equal
const adults = await db.listDocuments('users', {
  filters: { age_gte: 18 }
});

// Less than
const minors = await db.listDocuments('users', {
  filters: { age_lt: 18 }
});

// Less than or equal
const eligible = await db.listDocuments('users', {
  filters: { age_lte: 65 }
});

// Not equal
const nonAdmins = await db.listDocuments('users', {
  filters: { role_ne: 'admin' }
});

// Between (range)
const midAge = await db.listDocuments('users', {
  filters: {
    age_gte: 25,
    age_lte: 40
  }
});
​
String Operators
Search and filter text fields with powerful string operations.
JavaScript
Dart
Go
Python
HTTP
// Contains (case-insensitive)
const johns = await db.listDocuments('users', {
  filters: { name_contains: 'john' }
});

// Starts with
const admins = await db.listDocuments('users', {
  filters: { email_startswith: 'admin' }
});

// Ends with
const gmailUsers = await db.listDocuments('users', {
  filters: { email_endswith: '@gmail.com' }
});

// Multiple string filters
const specific = await db.listDocuments('users', {
  filters: {
    name_contains: 'john',
    email_endswith: '@example.com'
  }
});
​
List Operators
Filter by multiple possible values.
JavaScript
Dart
Go
Python
HTTP
// In - match any of the values
const staff = await db.listDocuments('users', {
  filters: { role_in: 'admin,moderator,support' }
});

// Not in - exclude values
const active = await db.listDocuments('users', {
  filters: { status_notin: 'deleted,banned,suspended' }
});

// Array contains (for array fields)
const followers = await db.listDocuments('users', {
  filters: { 'followers_array_contains': 'user_123' }
});
​
Logical Operators
Combine filters with AND and OR logic for complex queries.
​
OR Queries
JavaScript
Dart
Go
Python
HTTP
// Simple OR - match any condition
const users = await db.listDocuments('users', {
  filters: {
    '[or]role': 'admin',
    '[or]isPremium': true
  }
});

// Multi-field search
const searchResults = await db.listDocuments('users', {
  filters: {
    'name__or__email_contains': 'john'
  }
});
​
Complex Queries (AND + OR)
JavaScript
Dart
Go
Python
HTTP
// Active users who are (admin OR moderator)
const users = await db.listDocuments('users', {
  filters: {
    status: 'active',
    '[or]role': 'admin',
    '[or]role': 'moderator'
  }
});

// Advanced: (Premium OR Verified) AND Active
const eligibleUsers = await db.listDocuments('users', {
  filters: {
    status: 'active',
    '[or:tier]isPremium': true,
    '[or:tier]isVerified': true
  }
});
​
Sorting
Order results by any field in ascending or descending order.
JavaScript
Dart
Go
Python
HTTP
// Sort ascending
const byName = await db.listDocuments('users', {
  orderBy: 'name',
  order: 'asc'
});

// Sort descending
const newest = await db.listDocuments('users', {
  orderBy: 'created_at',
  order: 'desc'
});

// Multiple sorts
const sorted = await db.listDocuments('users', {
  orderBy: 'role,name',
  order: 'asc'
});
​
Pagination
Efficiently handle large datasets with limit and offset.
JavaScript
Dart
Go
Python
HTTP
// Get first page (10 items)
const page1 = await db.listDocuments('users', {
  limit: 10,
  offset: 0
});

// Get next page
const page2 = await db.listDocuments('users', {
  limit: 10,
  offset: 10
});

// Helper function
async function getPage(pageNumber, pageSize = 10) {
  return db.listDocuments('users', {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });
}

const page3 = await getPage(3);
​
Query Builder Pattern
Use fluent, chainable APIs for complex queries.
JavaScript
Dart
Go
Python
HTTP
// Not directly supported in JS SDK - use filters object
const users = await db.listDocuments('users', {
  filters: {
    status: 'active',
    age_gte: 18,
    role_in: 'admin,moderator'
  },
  orderBy: 'created_at',
  order: 'desc',
  limit: 20
});
​
Real-World Examples
​
E-commerce Product Search
JavaScript
Dart
Go
Python
HTTP
async function searchProducts(searchTerm, minPrice, maxPrice, category) {
  return await db.listDocuments('products', {
    filters: {
      name_contains: searchTerm,
      price_gte: minPrice,
      price_lte: maxPrice,
      category: category,
      inStock: true
    },
    orderBy: 'popularity',
    order: 'desc',
    limit: 24
  });
}

const laptops = await searchProducts('laptop', 500, 2000, 'electronics');
​
Social Feed with Filters
JavaScript
Dart
Go
Python
HTTP
async function getUserFeed(userId, page = 1) {
  return await db.listDocuments('posts', {
    filters: {
      '[or]author_id': userId,
      '[or]followers_array_contains': userId,
      status: 'published'
    },
    orderBy: 'created_at',
    order: 'desc',
    limit: 20,
    offset: (page - 1) * 20
  });
}

const myFeed = await getUserFeed('user-123');


Real-time Updates
Build reactive applications with WebSocket-based real-time data synchronization

​
Real-time Updates
Build reactive, collaborative applications with instant data synchronization using WebSocket connections across all platforms.
Real-time updates enable live collaboration, instant notifications, and reactive UI updates without polling.
​
Overview
Cocobase Real-time features:
WebSocket connections - Persistent, bidirectional communication
Collection watching - Subscribe to document changes
Event types - Create, update, delete notifications
Filtered subscriptions - Only receive relevant events
Broadcast messaging - Real-time communication channels
Automatic reconnection - Built-in connection management
​
WebSocket Connection
Establish a persistent connection to receive real-time updates.
​
Basic Connection
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// Watch a collection
const connection = db.watchCollection('users', (event) => {
  console.log('Event:', event.type);
  console.log('Data:', event.data);
});

// Close when done
connection.close();
​
With Connection Callbacks
JavaScript
Dart
Go
Python
HTTP
const connection = db.watchCollection('users',
  (event) => {
    console.log('Event:', event);
  },
  {
    onConnected: () => console.log('✓ Connected'),
    onDisconnected: () => console.log('✗ Disconnected'),
    onError: (error) => console.error('Error:', error)
  }
);
​
Event Types
Handle different types of real-time events.
​
Create Events
Triggered when a new document is created.
JavaScript
Dart
Go
Python
HTTP
db.watchCollection('posts', (event) => {
  if (event.type === 'create') {
    console.log('New post created:', event.data.id);
    console.log('Title:', event.data.title);

    // Update UI
    addPostToUI(event.data);
  }
});
​
Update Events
Triggered when a document is modified.
JavaScript
Dart
Go
Python
HTTP
db.watchCollection('posts', (event) => {
  if (event.type === 'update') {
    console.log('Post updated:', event.data.id);
    console.log('New title:', event.data.title);

    // Update existing UI element
    updatePostInUI(event.data);
  }
});
​
Delete Events
Triggered when a document is deleted.
JavaScript
Dart
Go
Python
HTTP
db.watchCollection('posts', (event) => {
  if (event.type === 'delete') {
    console.log('Post deleted:', event.data.id);

    // Remove from UI
    removePostFromUI(event.data.id);
  }
});
​
All Events Handler
JavaScript
Dart
Go
Python
HTTP
db.watchCollection('posts', (event) => {
  switch (event.type) {
    case 'connected':
      console.log('✓ Connected to real-time updates');
      break;

    case 'create':
      console.log('📝 New post:', event.data.id);
      addPostToUI(event.data);
      break;

    case 'update':
      console.log('✏️ Updated post:', event.data.id);
      updatePostInUI(event.data);
      break;

    case 'delete':
      console.log('🗑️ Deleted post:', event.data.id);
      removePostFromUI(event.data.id);
      break;

    default:
      console.log('Unknown event:', event.type);
  }
});
​
Filtering Real-time Events
Only receive events for documents matching specific criteria.
JavaScript
Dart
Go
Python
HTTP
// Watch only active posts
db.watchCollection('posts',
  (event) => {
    console.log('Active post event:', event);
  },
  {
    filters: { status: 'active' }
  }
);

// Watch posts by specific author
db.watchCollection('posts',
  (event) => {
    console.log('Author post event:', event);
  },
  {
    filters: { author_id: 'user-123' }
  }
);
​
Broadcast Messaging
Send and receive messages across connected clients.
JavaScript
Dart
Go
Python
HTTP
// Join a room
const room = db.joinRoom('chat-room-1', (message) => {
  console.log('Message from:', message.from);
  console.log('Content:', message.content);
});

// Send a message
room.broadcast({
  type: 'chat',
  content: 'Hello everyone!',
  timestamp: new Date().toISOString()
});

// Leave room
room.leave();
​
Reconnection Handling
Handle connection drops and automatic reconnection.
JavaScript
Dart
Go
Python
HTTP
class ResilientWatcher {
  constructor(db, collection) {
    this.db = db;
    this.collection = collection;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.connection = null;
  }

  watch(handler) {
    try {
      this.connection = this.db.watchCollection(
        this.collection,
        handler,
        {
          onConnected: () => {
            console.log('✓ Connected');
            this.retryCount = 0; // Reset on success
          },
          onDisconnected: () => {
            console.log('✗ Disconnected, reconnecting...');
            this.reconnect(handler);
          },
          onError: (error) => {
            console.error('Error:', error);
            this.reconnect(handler);
          }
        }
      );
    } catch (error) {
      console.error('Failed to connect:', error);
      this.reconnect(handler);
    }
  }

  reconnect(handler) {
    if (this.retryCount >= this.maxRetries) {
      console.error('Max retries reached');
      return;
    }

    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

    console.log(`Retry ${this.retryCount} in ${delay}ms`);

    setTimeout(() => {
      this.watch(handler);
    }, delay);
  }

  close() {
    if (this.connection) {
      this.connection.close();
    }
  }
}

// Usage
const watcher = new ResilientWatcher(db, 'posts');
watcher.watch((event) => {
  console.log('Event:', event);
});
​
Real-World Examples
​
Live Chat Application
JavaScript
Dart
Go
Python
HTTP
class ChatRoom {
  constructor(db, roomId, userId) {
    this.db = db;
    this.roomId = roomId;
    this.userId = userId;
    this.messages = [];
  }

  async connect() {
    // Watch for new messages
    this.connection = this.db.watchCollection(
      'messages',
      (event) => {
        if (event.type === 'create') {
          this.messages.push(event.data);
          this.displayMessage(event.data);
        }
      },
      {
        filters: { room_id: this.roomId }
      }
    );
  }

  async sendMessage(content) {
    await this.db.createDocument('messages', {
      room_id: this.roomId,
      user_id: this.userId,
      content: content,
      timestamp: new Date().toISOString()
    });
  }

  displayMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.textContent = `${message.user_id}: ${message.content}`;
    document.getElementById('messages').appendChild(messageEl);
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
    }
  }
}

// Usage
const chat = new ChatRoom(db, 'room-123', 'user-456');
await chat.connect();

document.getElementById('send-btn').addEventListener('click', () => {
  const input = document.getElementById('message-input');
  chat.sendMessage(input.value);
  input.value = '';
});
​
Best Practices
1. Always Close Connections

Properly close WebSocket connections when done to free up resources.
// ✓ Good: Close when component unmounts
useEffect(() => {
  const connection = db.watchCollection('posts', handler);

  return () => {
    connection.close();
  };
}, []);
2. Filter Events Server-Side

Use filters to reduce bandwidth and only receive relevant events.
// ✓ Good: Filter on server
db.watchCollection('posts', handler, {
  filters: { author_id: userId }
});

// ✗ Bad: Filter on client
db.watchCollection('posts', (event) => {
  if (event.data.author_id === userId) {
    handler(event);
  }
});
3. Implement Reconnection Logic

Handle connection drops gracefully with exponential backoff.
4. Debounce UI Updates

Don’t update UI on every event - batch updates for better performance.
// ✓ Good: Debounce updates
let updateTimeout;
db.watchCollection('posts', (event) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updateUI();
  }, 300);
});
5. Handle Errors

Always implement error handlers for WebSocket connections.
// ✓ Good: Error handling
db.watchCollection('posts', handler, {
  onError: (error) => {
    console.error('Connection error:', error);
    showErrorNotification();
  }
});


Relationships
Connect and populate related documents across collections

​
Relationships
Build relational data structures by linking documents and users together with automatic population support across all platforms.
Relationships enable you to structure complex data models like social networks, e-commerce systems, and collaborative applications.
​
Overview
Cocobase supports powerful relationship features:
Document references - Store IDs to link documents
Population - Automatically fetch related data
Nested population - Multi-level relationship resolution
User-to-user relationships - Followers, friends, referrals
User-to-document relationships - Bookmarks, favorites, ownership
Document-to-document relationships - Comments, reviews, hierarchies
​
Relationship Types
​
One-to-One
A single reference to another entity.
{
  "id": "user_123",
  "email": "john@example.com",
  "data": {
    "username": "johndoe",
    "referred_by": "user_456"
  }
}
​
One-to-Many / Many-to-Many
Arrays of references for multiple relationships.
{
  "id": "user_123",
  "email": "john@example.com",
  "data": {
    "username": "johndoe",
    "followers_ids": ["user_456", "user_789", "user_012"],
    "following_ids": ["user_456", "user_999"]
  }
}
​
Creating Relationships
​
User to User
JavaScript
Dart
Go
Python
HTTP
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// User signs up with referral
await db.auth.signup({
  email: 'bob@example.com',
  password: 'password123',
  data: {
    username: 'bob',
    referred_by: 'user_abc123'
  }
});

// Follow a user
const currentUser = await db.auth.getUser();
const currentFollowing = currentUser.data.following_ids || [];

await db.auth.updateUser({
  data: {
    following_ids: [...currentFollowing, 'user_to_follow']
  }
});

// Unfollow a user
await db.auth.updateUser({
  data: {
    following_ids: currentFollowing.filter(id => id !== 'user_to_unfollow')
  }
});
​
User to Document
JavaScript
Dart
Go
Python
HTTP
// User bookmarks a post
const currentUser = await db.auth.getUser();
const bookmarks = currentUser.data.bookmarked_posts || [];

await db.auth.updateUser({
  data: {
    bookmarked_posts: [...bookmarks, 'post_123']
  }
});

// Remove bookmark
await db.auth.updateUser({
  data: {
    bookmarked_posts: bookmarks.filter(id => id !== 'post_123')
  }
});
​
Document to Document
JavaScript
Dart
Go
Python
HTTP
// Create a post
const post = await db.createDocument('posts', {
  title: 'My first post',
  content: 'Hello world!',
  author_id: 'user_123'
});

// Create a comment on the post
const comment = await db.createDocument('comments', {
  post_id: post.id,
  author_id: 'user_456',
  text: 'Great post!',
  created_at: new Date().toISOString()
});
​
Populating Relationships
Automatically fetch related data instead of just IDs.
​
Basic Population
JavaScript
Dart
Go
Python
HTTP
// Without population (just IDs)
const users = await db.listDocuments('users');
console.log(users[0].data.referred_by); // "user_456"

// With population (full data)
const usersWithReferrer = await db.listDocuments('users', {
  populate: ['referred_by']
});
console.log(usersWithReferrer[0].data.referred_by);
// { id: "user_456", email: "alice@example.com", data: { username: "alice" } }
​
Populate Multiple Fields
JavaScript
Dart
Go
Python
HTTP
const users = await db.listDocuments('users', {
  populate: ['referred_by', 'followers_ids', 'following_ids']
});

console.log(users[0].data.referred_by); // Full user object
console.log(users[0].data.followers_ids); // Array of full user objects
console.log(users[0].data.following_ids); // Array of full user objects
​
Explicit Source Specification
Force population from specific collections or AppUser model.
JavaScript
Dart
Go
Python
HTTP
// Force fetch from AppUser model
const posts = await db.listDocuments('posts', {
  populate: ['author:appuser']
});

// Force fetch from specific collection
const projects = await db.listDocuments('projects', {
  populate: ['owner:team_members']
});
​
Social Features
​
Follow System
JavaScript
Dart
Go
Python
HTTP
class FollowSystem {
  constructor(db, token) {
    this.db = db;
    this.token = token;
  }

  async follow(userIdToFollow) {
    const currentUser = await this.db.auth.getUser();
    const following = currentUser.data.following_ids || [];

    if (following.includes(userIdToFollow)) {
      console.log('Already following');
      return;
    }

    await this.db.auth.updateUser({
      data: {
        following_ids: [...following, userIdToFollow]
      }
    });
  }

  async unfollow(userIdToUnfollow) {
    const currentUser = await this.db.auth.getUser();
    const following = currentUser.data.following_ids || [];

    await this.db.auth.updateUser({
      data: {
        following_ids: following.filter(id => id !== userIdToUnfollow)
      }
    });
  }

  async getFollowers(userId) {
    const response = await this.db.listDocuments('users', {
      filters: { id: userId },
      populate: ['followers_ids']
    });

    return response[0]?.data.followers_ids || [];
  }

  async getFollowing(userId) {
    const response = await this.db.listDocuments('users', {
      filters: { id: userId },
      populate: ['following_ids']
    });

    return response[0]?.data.following_ids || [];
  }
}

// Usage
const followSystem = new FollowSystem(db, userToken);
await followSystem.follow('user_456');
const followers = await followSystem.getFollowers('user_123');
​
Referral System
JavaScript
Dart
Go
Python
HTTP
async function getReferralStats(db, userId) {
  // Get the user who referred this user
  const [user] = await db.listDocuments('users', {
    filters: { id: userId },
    populate: ['referred_by']
  });

  // Get all users this user referred
  const referrals = await db.listDocuments('users', {
    filters: { 'data.referred_by': userId }
  });

  return {
    referredBy: user.data.referred_by,
    referralCount: referrals.length,
    referrals: referrals
  };
}

// Usage
const stats = await getReferralStats(db, 'user_123');
console.log('Referred by:', stats.referredBy?.data?.username);
console.log('Total referrals:', stats.referralCount);
​
Best Practices
1. Use Batch Queries with Population

Population uses optimized batch queries to avoid N+1 problems.
// ✓ Good: Single query with populate
const users = await db.listDocuments('users', {
  populate: ['followers_ids', 'following_ids']
});

// ✗ Bad: Multiple individual queries
for (const user of users) {
  const follower = await db.getDocument('users', user.data.followers_ids[0]);
}
2. Only Populate What You Need

Avoid over-populating to reduce response size and improve performance.
// ✓ Good: Only populate what's needed
const users = await db.listDocuments('users', {
  populate: ['referred_by']
});

// ✗ Bad: Populating unnecessary relationships
const users = await db.listDocuments('users', {
  populate: ['followers_ids', 'following_ids', 'referred_by', 'friends_ids']
});
3. Keep Relationship Arrays Reasonable

Don’t store thousands of IDs in a single array field.
// ✓ Good: Reasonable array size (< 1000 items)
followers_ids: ['user_1', 'user_2', ..., 'user_500']

// ✗ Bad: Massive arrays (> 10,000 items)
// Consider a separate junction collection for this
4. Use Filters with Population

Combine filters and population for efficient queries.
// ✓ Good: Filter and populate together
const activeUsers = await db.listDocuments('users', {
  filters: { status: 'active' },
  populate: ['referred_by']
});
5. Cache Populated Results

Cache frequently accessed relationships to reduce API calls.
const cache = new Map();

async function getUserWithRelationships(userId, populate) {
  const cacheKey = `${userId}:${populate.join(',')}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const data = await db.getDocument('users', userId, { populate });
  cache.set(cacheKey, data);

  return data;
}


File Storage
Upload and manage files within documents and user profiles

​
File Storage
Upload files as part of your documents and user profiles with automatic S3 storage integration. Files are uploaded alongside your data and their URLs are automatically stored in your documents.
Cocobase integrates file uploads directly into document and user operations. Files are automatically uploaded to S3 storage and their URLs are saved in your documents.
​
Overview
File storage features:
Integrated uploads - Upload files with document creation/updates
Multiple file types - Images, documents, videos, any file type
Single or array - Upload single files or arrays of files
Automatic URLs - File URLs automatically saved in documents
S3 storage - Secure, scalable cloud storage
User profile files - Upload avatars and cover photos with registration
​
Upload Files with Documents
Upload files when creating or updating documents using field naming.
​
Single File Upload
JavaScript
TypeScript
Dart
Python
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

// Upload avatar with user profile
const user = await db.createDocumentWithFiles(
  'users',
  {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer'
  },
  {
    avatar: avatarFile,          // Single file
    cover_photo: coverPhotoFile  // Another single file
  }
);

console.log('Avatar URL:', user.data.avatar);
console.log('Cover URL:', user.data.cover_photo);
Response Structure:
{
  "id": "user-123",
  "collection": "users",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "avatar": "https://storage.cocobase.buzz/.../avatar.jpg",
    "cover_photo": "https://storage.cocobase.buzz/.../cover.jpg"
  }
}
​
Multiple Files (Array)
Upload multiple files to create an array of URLs:
JavaScript
TypeScript
Dart
Python
// Product with gallery
const product = await db.createDocumentWithFiles(
  'products',
  {
    name: 'Laptop',
    price: 1299,
    description: 'High-performance laptop'
  },
  {
    main_image: mainImageFile,
    gallery: [img1File, img2File, img3File]  // Array of files
  }
);

console.log('Main image:', product.data.main_image);
console.log('Gallery:', product.data.gallery);
// Gallery: ["https://.../img1.jpg", "https://.../img2.jpg", "https://.../img3.jpg"]
Response:
{
  "id": "product-123",
  "data": {
    "name": "Laptop",
    "price": 1299,
    "description": "High-performance laptop",
    "main_image": "https://storage.cocobase.buzz/.../main.jpg",
    "gallery": [
      "https://storage.cocobase.buzz/.../img1.jpg",
      "https://storage.cocobase.buzz/.../img2.jpg",
      "https://storage.cocobase.buzz/.../img3.jpg"
    ]
  }
}
​
Update Documents with Files
Update existing documents with new files:
JavaScript
TypeScript
Dart
Python
// Update only the avatar
await db.updateDocumentWithFiles(
  'users',
  'user-123',
  undefined,  // No data changes
  {
    avatar: newAvatarFile
  }
);

// Update both data and files
await db.updateDocumentWithFiles(
  'users',
  'user-123',
  { bio: 'Updated bio' },  // Data changes
  {
    avatar: newAvatarFile,
    cover_photo: newCoverFile
  }
);
​
User Registration with Files
Register users with profile pictures:
JavaScript
TypeScript
Dart
Python
// Register with avatar
await db.registerWithFiles(
  'john@example.com',
  'password123',
  {
    username: 'johndoe',
    full_name: 'John Doe',
    bio: 'Developer'
  },
  {
    avatar: avatarFile
  }
);

// Get user details
const user = await db.auth.getUser();
console.log('Avatar URL:', user.avatar);
Response:
{
  "id": "user-123",
  "email": "john@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "bio": "Developer",
  "avatar": "https://storage.cocobase.buzz/.../avatar.jpg",
  "createdAt": "2024-01-15T10:00:00Z"
}
​
Update User Profile with Files
Update authenticated user’s profile pictures:
JavaScript
TypeScript
Dart
Python
// Update only avatar
await db.updateUserWithFiles(
  undefined,
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Update bio and avatar
await db.updateUserWithFiles(
  { bio: 'Updated bio', location: 'New York' },
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Update email, data, and files
await db.updateUserWithFiles(
  { username: 'newusername' },
  'newemail@example.com',
  undefined,
  {
    avatar: newAvatar,
    cover_photo: newCover
  }
);
​
React Example
Complete React component with file uploads:
import React, { useState } from 'react';
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Please upload a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await db.registerWithFiles(
        email,
        password,
        { username },
        avatarFile ? { avatar: avatarFile } : undefined
      );

      // Get user details
      const user = await db.auth.getUser();
      console.log('User created:', user);
      alert('Sign up successful!');
    } catch (error) {
      console.error('Sign up failed:', error);
      alert('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Preview */}
        {avatarPreview && (
          <div className="flex justify-center mb-4">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full"
          />
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
​
Product Gallery Example
Create products with multiple images:
import React, { useState } from 'react';
import { Cocobase } from 'cocobase';

const db = new Cocobase({ apiKey: 'your-api-key' });

function CreateProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const files: Record<string, File | File[]> = {};

      if (mainImage) {
        files.main_image = mainImage;
      }

      if (galleryImages.length > 0) {
        files.gallery = galleryImages;
      }

      const product = await db.createDocumentWithFiles(
        'products',
        {
          name,
          price: parseFloat(price),
          status: 'active'
        },
        files
      );

      console.log('Product created:', product);
      alert('Product created successfully!');

      // Reset form
      setName('');
      setPrice('');
      setMainImage(null);
      setGalleryImages([]);
    } catch (error) {
      console.error('Product creation failed:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Create Product</h2>

      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        step="0.01"
        className="w-full px-3 py-2 border rounded"
      />

      <div>
        <label className="block text-sm font-medium mb-2">Main Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Gallery Images (Multiple)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="w-full"
        />
        {galleryImages.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {galleryImages.length} image(s) selected
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
​
Best Practices
Validate Files Before Upload

Always validate file types and sizes before uploading:
const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file');
    return false;
  }

  if (file.size > maxSize) {
    alert('File size must be less than 5MB');
    return false;
  }

  return true;
};
Show Upload Progress

Provide visual feedback during uploads:
const [loading, setLoading] = useState(false);

const handleUpload = async () => {
  setLoading(true);
  try {
    await db.createDocumentWithFiles(/* ... */);
  } finally {
    setLoading(false);
  }
};
Compress Images

Reduce file sizes before uploading:
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  return await imageCompression(file, options);
};

// Use compressed image
const compressed = await compressImage(originalFile);
await db.createDocumentWithFiles('users', data, { avatar: compressed });
Show Image Previews

Let users preview images before uploading:
const [preview, setPreview] = useState<string | null>(null);

const handleFileChange = (file: File) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};
Handle Errors Gracefully

Provide meaningful error messages:
try {
  await db.createDocumentWithFiles(/* ... */);
} catch (error) {
  if (error.message.includes('Storage limit')) {
    alert('Storage limit exceeded. Please upgrade your plan.');
  } else if (error.message.includes('Invalid file')) {
    alert('Invalid file format. Please use JPG, PNG, or WebP.');
  } else {
    alert('Upload failed. Please try again.');
  }
}
​
Field Naming Convention
Use descriptive field names for your files:
// User profiles
{ avatar: file, cover_photo: file, profile_picture: file }

// Products
{ main_image: file, thumbnail: file, gallery: [files] }

// Blog posts
{ featured_image: file, inline_images: [files] }

// Documents
{ id_document: file, verification_photo: file }

// Real estate
{ main_photo: file, photos: [files], floor_plan: file }


Cloud Functions
Build powerful serverless functions with full database access

​
Cloud Functions
Create serverless backend logic with full database access, request handling, and real-time capabilities using Python cloud functions.
​
What Are Cloud Functions?
Cloud functions are serverless Python functions that run in the cloud. They provide:
Full Database Access - Query and modify your data using the powerful Database API
HTTP Request Handling - Process GET/POST requests with query parameters and JSON payloads
HTML Rendering - Return dynamic HTML pages with Jinja2 templates
Email Integration - Send emails directly from your functions
Environment Context - Access user authentication, project info, and more
​
When to Use Cloud Functions
Custom API Endpoints - Build custom backend logic without deploying servers
Data Processing - Transform, aggregate, or validate data before storing
Dynamic Web Pages - Render server-side HTML with real-time data
Webhooks - Handle webhook events from external services
Scheduled Tasks - Run background jobs and cron tasks
Email Notifications - Send automated emails based on events
​
Getting Started
​
Basic Function Structure
Every cloud function has a main() function that serves as the entry point:
def main():
    return {"message": "Hello, World!"}
​
Execution URL
Each cloud function gets a unique execution URL:
https://api.cocobase.buzz/functions/{function_id}/execute
Call it with GET or POST requests:
# GET request with query parameters
curl "https://api.cocobase.buzz/functions/abc123/execute?name=John&age=25"

# POST request with JSON body
curl -X POST https://api.cocobase.buzz/functions/abc123/execute \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 25}'
​
Database API Access
The db object provides full access to your database. It’s automatically available in all cloud functions.
​
Query Documents
def main():
    # Simple query
    posts = db.query("posts",
        status="published",
        limit=10
    )

    return {"posts": posts["data"]}
​
Query with Filters
def main():
    # Advanced filtering
    products = db.query("products",
        price_gte="50",        # Greater than or equal
        price_lte="500",       # Less than or equal
        stock_gt="0",          # Greater than
        category_in="electronics,computers",  # In array
        populate=["category", "reviews"],
        sort="popularity",
        order="desc",
        limit=24
    )

    return {"products": products["data"]}
​
Get Single Document
def main():
    post_id = req.get("post_id")

    post = db.find_one("posts",
        id=post_id,
        populate=["author", "category"]
    )

    if not post:
        return {"error": "Post not found"}, 404

    return {"post": post}
​
Create Documents
def main():
    # Create a new document
    post = db.create_document("posts", {
        "title": "My First Post",
        "content": "Hello World!",
        "status": "draft",
        "author_id": req.user.id,
        "views": 0
    })

    return {"post": post}
​
Update Documents
def main():
    post_id = req.get("post_id")

    # Full replacement
    post = db.update_document("posts", post_id, {
        "title": "Updated Title",
        "content": "Updated content"
    })

    # Partial update (merges with existing)
    post = db.update_document_fields("posts", post_id, {
        "views": 150,
        "status": "published"
    })

    return {"post": post}
​
Delete Documents
def main():
    post_id = req.get("post_id")
    deleted = db.delete_document("posts", post_id)

    return {"deleted": deleted}
​
Request and Response Handling
​
The Request Object
Access incoming request data with the request object (also available as req):
def main():
    # Get data from POST body or GET query params
    name = req.get('name', 'Guest')
    age = req.get('age', 0)

    # Access all payload data
    all_data = req.json()

    # Get query parameters (GET requests)
    page = req.query_params.get('page', '1')

    # Access headers
    auth_token = req.headers.get('authorization', '')

    # Check HTTP method
    method = req.method  # 'GET' or 'POST'

    # Current user (if authenticated)
    user = req.user  # AppUser object or None

    return {
        "received": all_data,
        "method": method
    }
​
Response Types
JSON Response (Default)
def main():
    return {
        "success": True,
        "message": "Operation completed",
        "data": {"id": "123", "name": "John"}
    }
HTML Response
def main():
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
    </body>
    </html>
    '''

    return render.render_html(html)
Status Codes
def main():
    user = req.user

    if not user:
        return {"error": "Unauthorized"}, 401

    if not user.is_admin:
        return {"error": "Forbidden"}, 403

    return {"success": True}, 200
​
Error Handling
def main():
    try:
        result = some_operation()
        return {"result": result}
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        return {"error": "Internal server error"}, 500
​
Environment Variables
Access environment and project information:
def main():
    # Project ID
    project_id = env.project_id

    # Execution environment
    runtime = env.runtime  # "python3.10"

    # Static files base URL
    static_url = env.static_base_url

    return {
        "project": project_id,
        "runtime": runtime
    }
​
Execution Context
​
User Authentication
Access authenticated user data:
def main():
    user = req.user

    if not user:
        return {"error": "Authentication required"}, 401

    # User properties
    user_id = user.id
    email = user.email
    user_data = user.data  # Custom user fields
    roles = user.roles

    return {
        "user_id": user_id,
        "email": email,
        "roles": roles
    }
​
HTTP Methods
Route based on HTTP method:
def main():
    method = req.method

    if method == "GET":
        # List posts
        posts = db.query("posts",
            status="published",
            limit=20
        )
        return {"posts": posts["data"]}

    elif method == "POST":
        # Create post
        user = req.user
        if not user:
            return {"error": "Authentication required"}, 401

        data = req.json()
        post = db.create_document("posts", {
            "title": data["title"],
            "content": data["content"],
            "author_id": user.id,
            "status": "draft"
        })
        return {"post": post}

    else:
        return {"error": "Method not supported"}, 405
​
Database Queries in Cloud Functions
​
Comparison Operators
Use operator suffixes to filter data:
Operator	Suffix	Example	Description
Equal	(none) or _eq	status="published"	Exact match
Not Equal	_ne	status_ne="draft"	Not equal
Greater Than	_gt	price_gt="100"	Greater than
Greater or Equal	_gte	age_gte="18"	Greater than or equal
Less Than	_lt	price_lt="1000"	Less than
Less or Equal	_lte	stock_lte="10"	Less than or equal
Contains	_contains	title_contains="python"	String contains
Starts With	_startswith	name_startswith="john"	String starts with
Ends With	_endswith	email_endswith="@gmail.com"	String ends with
In Array	_in	status_in="published,draft"	Value in list
Not In Array	_notin	category_notin="spam,nsfw"	Value not in list
Is Null	_isnull	deleted_at_isnull="true"	Check if null
Examples:
# Greater than
products = db.query("products", price_gt="50")

# Contains (case-insensitive)
users = db.query_users(name_contains="john")

# In array
posts = db.query("posts",
    status_in="published,featured,trending"
)

# Multiple operators
products = db.query("products",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    category_ne="discontinued"
)
​
Boolean Logic - OR Queries
Simple OR:
# Posts with status = published OR featured
posts = db.query("posts", **{
    "[or]status": "published",
    "[or]status_2": "featured"
})
Named OR Groups:
# (category=tech OR category=programming) AND (status=published OR status=featured)
posts = db.query("posts", **{
    "[or:cats]category": "tech",
    "[or:cats]category_2": "programming",
    "[or:status]status": "published",
    "[or:status]status_2": "featured"
})
Search Across Multiple Fields:
# Posts where title OR content contains keyword
posts = db.query("posts", **{
    "[or:search]title_contains": "python",
    "[or:search]content_contains": "python"
})
​
Relationships and Population
Auto-Relationship Detection:
Relationships are automatically detected based on field naming:
{field}id - Single reference
{field}_ids - Multiple references
# Populate single relationship
posts = db.query("posts",
    populate=["author"],
    limit=10
)

# Populate multiple relationships
posts = db.query("posts",
    populate=["author", "category", "tags"],
    limit=10
)

# Deep (nested) population
posts = db.query("posts",
    populate=["author.company.location"],
    limit=10
)
Filter by Related Data:
# Get posts where author has role=admin
posts = db.query("posts", **{
    "author.role": "admin"
}, populate=["author"], limit=20)

# Multiple relationship filters
posts = db.query("posts", **{
    "author.verified": "true",
    "category.status": "active"
}, populate=["author", "category"])
​
User Queries
Query users with the same powerful features:
# Query users
users = db.query_users(
    role="premium",
    age_gte="18",
    email_endswith="@gmail.com",
    populate=["referred_by"],
    sort="created_at",
    order="desc",
    limit=50
)

# Find single user
user = db.find_user(
    id="user-123",
    populate=["company", "manager"]
)

# By email
user = db.find_user(email="john@example.com")
​
User Relationships
Manage relationships between users:
# Get followers
followers = db.get_user_relationships(
    user_id="user-123",
    relationship_type="followers",
    limit=50
)

# Add relationship
db.add_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="following"
)

# Remove relationship
db.remove_user_relationship(
    user_id="user-123",
    related_user_id="user-456",
    relationship_type="following"
)

# Get user's collections
posts = db.get_user_collections(
    user_id="user-123",
    collection_name="posts",
    filters={"status": "published"},
    populate=["category"],
    limit=20
)
​
Operators and Filtering
​
Text Search
# Search in title or description
products = db.query("products", **{
    "[or]name_contains": "laptop",
    "[or]description_contains": "laptop"
})

# Email domain filtering
company_users = db.query_users(
    email_endswith="@mycompany.com"
)

# Name prefix search
users = db.query_users(
    name_startswith="John"
)
​
Range Queries
# Price range
products = db.query("products",
    price_gte="10",
    price_lte="100",
    stock_gt="0"
)

# Date range
orders = db.query("orders",
    created_at_gte="2024-01-01",
    created_at_lt="2024-02-01"
)

# Age range
users = db.query_users(
    age_gte="18",
    age_lte="65"
)
​
List Filtering
# Multiple values (any match)
posts = db.query("posts",
    category_in="tech,science,tutorial"
)

# Exclude values
users = db.query_users(
    role_notin="admin,superadmin"
)
​
Null Checks
# Find items without deletion timestamp
active_posts = db.query("posts",
    deleted_at_isnull="true"
)

# Find users with referrer
referred_users = db.query_users(
    referred_by_id_isnull="false"
)
​
Sorting and Pagination
# Sort by field
posts = db.query("posts",
    status="published",
    sort="created_at",
    order="desc",  # or "asc"
    limit=20,
    offset=0
)

# Pagination helper
def get_page(page=1, per_page=20):
    offset = (page - 1) * per_page
    result = db.query("posts",
        status="published",
        limit=per_page,
        offset=offset,
        sort="created_at",
        order="desc"
    )
    return {
        "posts": result["data"],
        "page": page,
        "per_page": per_page,
        "total": result["total"],
        "has_more": result["has_more"]
    }
​
Real-World Examples
​
E-Commerce: Product Search
def main():
    # Get filters from request
    category = req.get("category")
    min_price = req.get("min_price", "0")
    max_price = req.get("max_price", "10000")
    search = req.get("search", "")

    # Build filters
    filters = {
        "status": "active",
        "stock_gt": "0",
        "price_gte": min_price,
        "price_lte": max_price
    }

    if category:
        filters["category_id"] = category

    if search:
        filters["[or]name_contains"] = search
        filters["[or]description_contains"] = search

    # Query products
    products = db.query("products", **filters,
        populate=["category", "reviews"],
        sort="popularity",
        order="desc",
        limit=24
    )

    return {
        "products": products["data"],
        "total": products["total"],
        "has_more": products["has_more"]
    }
​
Social Media: User Feed
def main():
    user_id = req.get("user_id")

    # Get users this user follows
    following = db.get_user_relationships(user_id, "following")
    following_ids = [u["id"] for u in following["data"]]

    # Build OR filter for posts from followed users
    filters = {}
    for idx, followed_id in enumerate(following_ids[:50]):
        filters[f"[or:authors]author_id_{idx}"] = followed_id

    # Query posts
    feed = db.query("posts", **{
        **filters,
        "status": "published"
    },
    populate=["author", "category"],
    sort="created_at",
    order="desc",
    limit=30)

    return {"feed": feed["data"]}
​
CMS: Blog Search
def main():
    keyword = req.get("keyword", "")
    category = req.get("category")
    author_id = req.get("author_id")
    tags = req.get("tags", "").split(",") if req.get("tags") else []

    # Build filters
    filters = {"status": "published"}

    # Search in title or content
    if keyword:
        filters["[or:search]title_contains"] = keyword
        filters["[or:search]content_contains"] = keyword

    # Filter by category
    if category:
        filters["category_id"] = category

    # Filter by author
    if author_id:
        filters["author_id"] = author_id

    # Filter by tags (any tag matches)
    if tags:
        for idx, tag in enumerate(tags):
            filters[f"[or:tags]tag_ids_{idx}"] = tag

    # Query posts
    posts = db.query("posts", **filters,
        populate=["author", "category", "tags"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {
        "posts": posts["data"],
        "total": posts["total"]
    }
​
User Dashboard
def main():
    user_id = req.get("user_id")

    # Get user info
    user = db.find_user(id=user_id, populate=["company"])

    # Get user's posts
    posts = db.get_user_collections(
        user_id, "posts",
        filters={"status": "published"},
        limit=10
    )

    # Get followers/following
    followers = db.get_user_relationships(user_id, "followers", limit=5)
    following = db.get_user_relationships(user_id, "following", limit=5)

    # Get recent activity
    comments = db.get_user_collections(
        user_id, "comments",
        populate=["post"],
        limit=5
    )

    return {
        "user": user,
        "stats": {
            "posts": posts["total"],
            "followers": followers["total"],
            "following": following["total"],
            "comments": comments["total"]
        },
        "recent_posts": posts["data"],
        "recent_comments": comments["data"]
    }
​
Dynamic Web Page
def main():
    # Get page from query param
    page = int(req.query_params.get('page', '1'))
    per_page = 10

    # Get posts from database
    posts = db.query("posts",
        status="published",
        populate=["author", "category"],
        sort="created_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    # Render HTML
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blog - Page {{ page }}</title>
        <link rel="stylesheet" href="{{ static('css/blog.css') }}">
    </head>
    <body>
        <header>
            <h1>My Blog</h1>
        </header>

        <main>
            {% for post in posts %}
            <article class="post">
                <h2>{{ post.title }}</h2>
                <div class="meta">
                    <span>By {{ post.author.name }}</span>
                    <span>{{ post.created_at }}</span>
                </div>
                <p>{{ post.excerpt }}</p>
                <a href="?post={{ post.id }}">Read more →</a>
            </article>
            {% endfor %}
        </main>

        <footer>
            <div class="pagination">
                {% if page > 1 %}
                <a href="?page={{ page - 1 }}">← Previous</a>
                {% endif %}

                <span>Page {{ page }}</span>

                {% if has_more %}
                <a href="?page={{ page + 1 }}">Next →</a>
                {% endif %}
            </div>
        </footer>
    </body>
    </html>
    '''

    return render.render_html(html, {
        'posts': posts['data'],
        'page': page,
        'has_more': posts['has_more']
    })
​
Best Practices
​
1. Always Use Limits
# Good
posts = db.query("posts", limit=20)

# Bad (could return thousands)
posts = db.query("posts")
​
2. Use Indexes for Performance
# Query on indexed fields
posts = db.query("posts",
    status="published",  # Should be indexed
    user_id="user-123",  # Should be indexed
    sort="created_at",   # Should be indexed
    limit=20
)
​
3. Selective Population
# Good - only populate what you need
posts = db.query("posts",
    populate=["author"],
    select=["id", "title", "author"]
)

# Bad - populating everything is slow
posts = db.query("posts",
    populate=["author", "category", "tags", "comments", "likes"]
)
​
4. Clear Field Naming
# Good - clear intent
{
  "author_id": "user-123",        # Obviously a user
  "product_ids": ["p1", "p2"],    # Obviously products
  "referred_by_id": "user-456"    # Obviously a user
}

# Bad - ambiguous
{
  "related_id": "...",   # Related to what?
  "linked_ids": ["..."]  # Linked to what?
}
​
5. Handle Pagination
def get_posts(page=1, per_page=20):
    offset = (page - 1) * per_page

    result = db.query("posts",
        status="published",
        limit=per_page,
        offset=offset,
        sort="created_at",
        order="desc"
    )

    return {
        "posts": result["data"],
        "page": page,
        "per_page": per_page,
        "total": result["total"],
        "has_more": result["has_more"]
    }
​
6. Error Handling
def main():
    try:
        user_id = req.get("user_id")

        if not user_id:
            return {"error": "user_id is required"}, 400

        posts = db.query("posts",
            author_id=user_id,
            limit=20
        )

        return {"posts": posts["data"]}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
​
7. Validate Input
def main():
    email = req.get('email', '').strip()

    if not email:
        return {"error": "Email is required"}, 400

    if '@' not in email:
        return {"error": "Invalid email format"}, 400

    # Process email...
​
Intellisense Setup
​
Monaco Editor Integration
Enable IntelliSense for cloud functions in your code editor:
Install Dependencies:
npm install @monaco-editor/react monaco-editor
Use CloudFunctionEditor Component:
import CloudFunctionEditor from "@/components/CloudFunctionEditor";

function MyPage() {
  const [code, setCode] = useState(
    'def main():\n    return {"message": "Hello"}'
  );

  return (
    <CloudFunctionEditor
      value={code}
      onChange={setCode}
      apiBaseUrl="https://your-api.com"
      height="600px"
    />
  );
}
​
Available Endpoints
Your backend provides IntelliSense data:
GET /intellisense/python-stubs - Type definitions for request, db, render objects
GET /intellisense/python-examples - Code examples and patterns
GET /intellisense/operators - Query operator documentation
​
Features Provided
Autocomplete - Type request., db., or render. to see available methods
Code Snippets - Quick templates for common patterns
Hover Documentation - Hover over globals to see documentation
Examples Toolbar - One-click insertion of complete code patterns
​
Available Python Modules
Cloud functions have access to these Python standard library modules without import statements:
Module	Description	Common Uses
json	JSON encoding/decoding	Parse API responses, serialize data
datetime	Date and time class	Current time, timestamps
timedelta	Time duration class	Add/subtract time, expiration
time	Time utilities	Delays, timestamps, timing
math	Mathematical functions	Calculations, rounding
re	Regular expressions	Pattern matching, validation
secrets	Cryptographically secure random	OTP generation, tokens, passwords
uuid	UUID generation	Unique identifiers
hashlib	Hash functions	MD5, SHA256, data integrity
base64	Base64 encoding	Encode/decode binary data
string	String constants	ASCII letters, digits, punctuation
collections	Data structures	Counter, defaultdict, deque
​
Examples
OTP Generation (Secure):
def main():
    # Generate 6-digit OTP (cryptographically secure)
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    # Send via email or SMS
    return {"otp": otp}
Password Hashing:
def main():
    password = req.get('password')

    # Hash password with SHA256
    hashed = hashlib.sha256(password.encode()).hexdigest()

    return {"hash": hashed}
Email Validation:
def main():
    email = req.get('email')

    # Validate email format
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    is_valid = bool(re.match(email_pattern, email))

    if not is_valid:
        return {"error": "Invalid email format"}, 400

    return {"valid": True}


Advanced Features
Master batch operations, aggregations, transactions, and performance optimization

​
Advanced Features
Unlock the full power of CocoBase with batch operations, aggregations, transactions, and advanced data processing techniques.
​
Batch Operations
Handle multiple documents efficiently with batch operations. Available across all SDKs.
​
Batch Create
Create multiple documents in a single request:
Flutter
JavaScript
Python
Go
# Cloud Functions
def main():
    new_books = [
        {'title': 'Flutter Guide', 'author': 'John Doe', 'price': 29.99},
        {'title': 'Dart Essentials', 'author': 'Jane Smith', 'price': 39.99},
        {'title': 'Clean Code', 'author': 'Robert Martin', 'price': 49.99},
    ]

    result = db.bulk_create_documents("books", new_books)

    return {
        "created": result["count"],
        "documents": result["data"]
    }
​
Batch Update
Update multiple documents at once:
Flutter
JavaScript
Python
def main():
    updates = [
        {'id': 'doc-1', 'price': 19.99},
        {'id': 'doc-2', 'price': 24.99},
        {'id': 'doc-3', 'price': 34.99},
    ]

    result = db.bulk_update_documents("books", updates)

    return {
        "updated": result["count"],
        "failed": result.get("failed", 0)
    }
​
Batch Delete
Delete multiple documents efficiently:
Flutter
JavaScript
Python
Go
def main():
    ids = ['doc-1', 'doc-2', 'doc-3']

    result = db.bulk_delete_documents("books", ids)

    return {"deleted": result["count"]}
​
Best Practices for Batch Operations
Process Large Datasets in Chunks:
// Flutter example - process in batches of 100
Future<void> importBooks(List<Map<String, dynamic>> bookData) async {
  const batchSize = 100;
  for (int i = 0; i < bookData.length; i += batchSize) {
    final batch = bookData.sublist(
      i,
      (i + batchSize).clamp(0, bookData.length),
    );

    try {
      final result = await db.batchCreateDocuments<Book>("books", batch);
      print('Created batch: ${result.created}');
    } catch (e) {
      print('Batch failed: $e');
    }
  }
}
Handle Errors Gracefully:
// JavaScript example - handle partial failures
async function updateMultipleBooks(updates) {
  const result = await db.batchUpdateDocuments('books', updates);

  console.log(`Success: ${result.updated}`);
  if (result.failed > 0) {
    console.error(`Failed to update: ${result.errorIds}`);
    // Retry failed updates
  }
}
​
Aggregations
Calculate statistics across your data efficiently.
​
Sum
Calculate total of a field:
Flutter
Python
def main():
    # Sum all order totals
    result = db.aggregate_documents(
        "orders",
        field="total",
        operation="sum"
    )

    return {"total_revenue": result["value"]}
​
Average
Calculate average value:
Flutter
Python
def main():
    result = db.aggregate_documents(
        "products",
        field="price",
        operation="avg"
    )

    return {"average_price": result["value"]}
​
Min/Max
Find minimum and maximum values:
// Minimum price
final min = await db.aggregateDocuments(
  "books",
  field: 'price',
  operation: 'min',
);

// Maximum price
final max = await db.aggregateDocuments(
  "books",
  field: 'price',
  operation: 'max',
);

print('Price range: \$${min.value} - \$${max.value}');
​
Aggregations with Filters
Calculate statistics on filtered data:
// Total revenue from completed orders in 2024
final result = await db.aggregateDocuments(
  "orders",
  field: 'total',
  operation: 'sum',
  filters: {
    'status': 'completed',
    'createdAt__gte': '2024-01-01',
  },
);

print('2024 revenue: \$${result.value}');
​
Real-World Aggregation Examples
Statistics Dashboard:
Future<Map<String, dynamic>> getStorageStats() async {
  final totalSize = await db.aggregateDocuments(
    "files",
    field: 'size',
    operation: 'sum',
  );

  final avgSize = await db.aggregateDocuments(
    "files",
    field: 'size',
    operation: 'avg',
  );

  return {
    'totalSize': totalSize.value,
    'averageSize': avgSize.value,
    'totalDocuments': totalSize.count,
  };
}
Price Analysis:
def main():
    # Get price statistics
    min_price = db.aggregate_documents(
        "products",
        field="price",
        operation="min",
        filters={"active": True}
    )

    max_price = db.aggregate_documents(
        "products",
        field="price",
        operation="max",
        filters={"active": True}
    )

    avg_price = db.aggregate_documents(
        "products",
        field="price",
        operation="avg",
        filters={"active": True}
    )

    return {
        "minPrice": min_price["value"],
        "maxPrice": max_price["value"],
        "avgPrice": avg_price["value"],
        "range": max_price["value"] - min_price["value"]
    }
​
Group By
Group documents by field values and get counts.
​
Basic Grouping
Flutter
Python
def main():
    result = db.group_by_field("orders", field="status")

    groups = {}
    for item in result["groups"]:
        groups[item["key"]] = item["count"]

    return {"groups": groups}
​
Group With Filters
final result = await db.groupByField(
  "users",
  field: 'country',
  filters: {'active': true},
);

print('Active users by country:');
for (var group in result.groups) {
  print('${group.key}: ${group.count}');
}
​
Grouping Patterns
Dashboard Statistics:
Future<Map<String, int>> getUserStatistics() async {
  final byRole = await db.groupByField("users", field: 'role');

  final stats = <String, int>{};
  for (var group in byRole.groups) {
    stats[group.key.toString()] = group.count;
  }

  return stats;
}
Activity Report:
def main():
    by_type = db.group_by_field("activities", field="type")
    by_status = db.group_by_field("activities", field="status")

    return {
        "byType": [{"type": g["key"], "count": g["count"]} for g in by_type["groups"]],
        "byStatus": [{"status": g["key"], "count": g["count"]} for g in by_status["groups"]]
    }
​
Transactions
Handle multiple operations atomically (availability depends on your backend).
​
Client-Side Transaction Pattern
class Transaction {
  final Cocobase db;
  final List<Function> operations = [];

  Transaction(this.db);

  void add(Function operation) {
    operations.add(operation);
  }

  Future<void> commit() async {
    for (var op in operations) {
      try {
        await op();
      } catch (e) {
        print('Transaction failed: $e');
        rethrow;
      }
    }
  }
}

// Use it
Future<void> transferFunds(
  String fromAccount,
  String toAccount,
  double amount,
) async {
  final tx = Transaction(db);

  tx.add(() => db.updateDocument(
    "accounts",
    fromAccount,
    {'balance': FieldValue.increment(-amount)},
  ));

  tx.add(() => db.updateDocument(
    "accounts",
    toAccount,
    {'balance': FieldValue.increment(amount)},
  ));

  tx.add(() => db.createDocument(
    "transactions",
    {
      'from': fromAccount,
      'to': toAccount,
      'amount': amount,
      'timestamp': DateTime.now(),
    },
  ));

  await tx.commit();
}
​
Performance Optimization
​
1. Use Indexes
Create indexes on frequently queried fields:
final collection = Collection(
  name: 'orders',
  fields: {
    'customerId': {'type': 'string', 'indexed': true},  // Index frequently queried
    'createdAt': {'type': 'datetime', 'indexed': true},
    'status': {'type': 'string', 'indexed': true},
    'notes': {'type': 'string'},  // Don't index large text
  },
);

await db.createCollection(collection);
Guidelines:
Index fields used in where clauses
Index fields used for sorting
Don’t over-index (impacts write performance)
Avoid indexing large text fields
​
2. Pagination
Always paginate large datasets:
// Good - Paginate large datasets
const pageSize = 50;
int page = 0;

Future<List<Document<Book>>> getNextPage() async {
  final offset = page * pageSize;
  final docs = await db.listDocuments<Book>(
    "books",
    filters: {
      'limit': pageSize,
      'offset': offset,
    },
    converter: Book.fromJson,
  );
  page++;
  return docs;
}
Infinite Scroll Example:
class PaginatedBookList extends StatefulWidget {
  @override
  State<PaginatedBookList> createState() => _PaginatedBookListState();
}

class _PaginatedBookListState extends State<PaginatedBookList> {
  final books = <Document<Book>>[];
  bool hasMore = true;
  bool isLoading = false;

  Future<void> loadNextPage() async {
    if (isLoading || !hasMore) return;

    setState(() => isLoading = true);

    try {
      final newBooks = await getNextPage();
      setState(() {
        books.addAll(newBooks);
        if (newBooks.length < 50) {
          hasMore = false;
        }
      });
    } catch (e) {
      print('Error loading page: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: books.length + (hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == books.length) {
          loadNextPage();
          return const Center(child: CircularProgressIndicator());
        }
        return ListTile(title: Text(books[index].data.title));
      },
    );
  }
}
​
3. Caching
Implement client-side caching to reduce API calls:
class DocumentCache {
  final Map<String, Document> _cache = {};
  static const cacheDuration = Duration(minutes: 5);
  final Map<String, DateTime> _timestamps = {};

  Document? get(String key) {
    if (_isCacheValid(key)) {
      return _cache[key];
    }
    _cache.remove(key);
    _timestamps.remove(key);
    return null;
  }

  void set(String key, Document value) {
    _cache[key] = value;
    _timestamps[key] = DateTime.now();
  }

  bool _isCacheValid(String key) {
    final timestamp = _timestamps[key];
    if (timestamp == null) return false;
    return DateTime.now().difference(timestamp) < cacheDuration;
  }

  void clear() {
    _cache.clear();
    _timestamps.clear();
  }
}

// Use cache
final cache = DocumentCache();

Future<Document<Book>> getBook(String id) async {
  // Try cache first
  final cached = cache.get('book_$id');
  if (cached != null) {
    return cached;
  }

  // Fetch from server
  final doc = await db.getDocument<Book>("books", id);
  cache.set('book_$id', doc);
  return doc;
}
​
4. Select Specific Fields
Only fetch needed fields to reduce bandwidth:
// Bad - fetches all fields
final docs = await db.listDocuments("books");

// Good - select specific fields only
final docs = await db.listDocuments(
  "books",
  queryBuilder: QueryBuilder()
    .select('id')
    .select('title')
    .select('price')
    .limit(100),
);
​
5. Lazy Loading
Load data on demand:
class LazyLoadingList extends StatefulWidget {
  @override
  State<LazyLoadingList> createState() => _LazyLoadingListState();
}

class _LazyLoadingListState extends State<LazyLoadingList> {
  final items = <Document<Item>>[];
  bool hasMore = true;
  ScrollController? _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController!.addListener(_onScroll);
    _loadMore();
  }

  void _onScroll() {
    if (_scrollController!.position.pixels ==
        _scrollController!.position.maxScrollExtent) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (!hasMore) return;

    final newItems = await db.listDocuments<Item>(
      "items",
      filters: {
        'limit': 20,
        'offset': items.length,
      },
      converter: Item.fromJson,
    );

    setState(() {
      items.addAll(newItems);
      if (newItems.length < 20) {
        hasMore = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: items.length,
      itemBuilder: (context, index) {
        return ListTile(title: Text(items[index].data.name));
      },
    );
  }

  @override
  void dispose() {
    _scrollController?.dispose();
    super.dispose();
  }
}
​
Caching Strategies
​
Memory Cache
class MemoryCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Use it
const cache = new MemoryCache();

async function getBook(id) {
  // Try cache first
  const cached = cache.get(`book_${id}`);
  if (cached) return cached;

  // Fetch from server
  const book = await db.getDocument('books', id);
  cache.set(`book_${id}`, book);
  return book;
}
​
Local Storage Cache (Browser/Flutter)
import 'package:shared_preferences/shared_preferences.dart';

class PersistentCache {
  static const _prefix = 'cache_';
  static const _ttl = Duration(hours: 1);

  Future<void> set(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_prefix$key', value);
    await prefs.setInt('${_prefix}${key}_timestamp',
      DateTime.now().millisecondsSinceEpoch);
  }

  Future<String?> get(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString('$_prefix$key');
    final timestamp = prefs.getInt('${_prefix}${key}_timestamp');

    if (value == null || timestamp == null) return null;

    final age = DateTime.now().millisecondsSinceEpoch - timestamp;
    if (age > _ttl.inMilliseconds) {
      await prefs.remove('$_prefix$key');
      await prefs.remove('${_prefix}${key}_timestamp');
      return null;
    }

    return value;
  }
}
​
Indexing Best Practices
​
When to Index
Fields used frequently in where clauses
Fields used for sorting
Fields used in relationships
Fields with high cardinality (many unique values)
​
When NOT to Index
Large text fields
Fields that change frequently
Low cardinality fields (few unique values like boolean)
Fields rarely queried
​
Example Index Strategy
# Good indexing strategy
collection_schema = {
    "name": "products",
    "indexes": [
        # Frequently queried
        {"field": "status", "type": "btree"},
        {"field": "category_id", "type": "btree"},

        # Used for sorting
        {"field": "created_at", "type": "btree"},
        {"field": "price", "type": "btree"},

        # Compound index for common query
        {"fields": ["category_id", "status"], "type": "btree"}
    ]
}
​
Type Conversion and Type Safety
​
Flutter Type-Safe Models
class Book {
  final String title;
  final String author;
  final double price;

  Book({
    required this.title,
    required this.author,
    required this.price,
  });

  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      title: json['title'] as String,
      author: json['author'] as String,
      price: (json['price'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'author': author,
      'price': price,
    };
  }
}

// Register converter
CocobaseConverters.register<Book>(Book.fromJson);

// Use with full type safety
final books = await db.listDocuments<Book>("books");
print(books[0].data.title);  // Fully typed!
​
JavaScript Type Safety with TypeScript
interface Book {
  title: string;
  author: string;
  price: number;
  isbn?: string;
}

// Type-safe operations
const books = await db.listDocuments<Book>('books');
books.forEach(doc => {
  console.log(doc.data.title); // TypeScript knows the type
});

const book: Book = {
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 45.99
};

await db.createDocument<Book>('books', book);
​
Custom Data Models
​
Nested Objects
class Order {
  final String id;
  final List<Item> items;
  final Address shippingAddress;
  final double total;

  Order({
    required this.id,
    required this.items,
    required this.shippingAddress,
    required this.total,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      items: (json['items'] as List<dynamic>)
          .map((item) => Item.fromJson(item as Map<String, dynamic>))
          .toList(),
      shippingAddress: Address.fromJson(
        json['shippingAddress'] as Map<String, dynamic>
      ),
      total: (json['total'] as num).toDouble(),
    );
  }
}
​
Polymorphic Types
abstract class Content {
  String get title;

  factory Content.fromJson(Map<String, dynamic> json) {
    final type = json['contentType'] as String;
    switch (type) {
      case 'article':
        return Article.fromJson(json);
      case 'video':
        return Video.fromJson(json);
      case 'podcast':
        return Podcast.fromJson(json);
      default:
        throw ArgumentError('Unknown content type: $type');
    }
  }
}
​
Monitoring and Debugging
​
Query Performance Measurement
Future<T> measureQueryTime<T>(
  Future<T> Function() query,
) async {
  final sw = Stopwatch()..start();
  final result = await query();
  sw.stop();
  print('Query took ${sw.elapsedMilliseconds}ms');
  return result;
}

// Use it
final books = await measureQueryTime(() =>
  db.listDocuments<Book>("books")
);
​
Request Logging
// Enable debug logging in Dio
final dio = Dio();
dio.interceptors.add(LogInterceptor(
  requestBody: true,
  responseBody: true,
));



Cloud Functions Introduction
Comprehensive guide to querying and managing data in CocoBase cloud functions

​
Cloud Functions Database API
Complete guide to querying and managing data in your CocoBase cloud functions.
​
Overview
The Database API provides a powerful, MongoDB-like query interface for your PostgreSQL database with automatic relationship detection and advanced filtering capabilities.
​
Key Features
Advanced Querying - 12+ operators (eq, ne, lt, gt, contains, in, etc.)
Complex Logic - OR/AND combinations with grouping
Auto Relationships - Automatically detects users vs collections
Deep Population - Nested relationship loading (author.company.location)
Relationship Filtering - Filter by related data (author.role=admin)
User Relationships - Followers, friends, teams support
Zero Configuration - No manual relationship definitions needed
​
Quick Start
​
Basic Query
def main():
    # Get all published posts
    posts = db.query("posts",
        status="published",
        limit=10
    )

    return {"posts": posts["data"]}
​
Query with Population
def main():
    # Get posts with author and category data
    posts = db.query("posts",
        status="published",
        populate=["author", "category"],
        sort="created_at",
        order="desc",
        limit=20
    )

    return {"posts": posts["data"]}
​
Advanced Filtering
def main():
    # Get posts with views > 100, published after date
    posts = db.query("posts",
        status="published",
        views_gte="100",
        created_at_gt="2024-01-01",
        populate=["author"],
        limit=50
    )

    return {"posts": posts["data"]}
​
Query Operations
​
query() - Query Collection
Query documents with filters, population, sorting, and pagination.
db.query(
    collection_name: str,
    populate: List[str] = None,
    select: List[str] = None,
    sort: str = None,
    order: str = "asc",
    limit: int = 10,
    offset: int = 0,
    **filters
)
Parameters:
collection_name - Name of the collection to query
populate - List of relationship fields to populate
select - List of fields to return (optional, returns all by default)
sort - Field name to sort by
order - Sort order: “asc” or “desc” (default: “asc”)
limit - Maximum number of documents to return (default: 10)
offset - Number of documents to skip for pagination (default: 0)
**filters - Dynamic filter parameters using operators
Returns:
{
    "data": [...],      # List of documents
    "total": 42,        # Total count matching filters
    "has_more": True    # Whether more results exist
}
Example:
def main():
    posts = db.query("posts",
        status="published",
        category_id="cat-123",
        populate=["author", "category"],
        sort="created_at",
        order="desc",
        limit=20,
        offset=0
    )

    return {
        "posts": posts["data"],
        "total": posts["total"],
        "has_more": posts["has_more"]
    }
​
find_one() - Get Single Document
Get a single document matching filters.
db.find_one(
    collection_name: str,
    populate: List[str] = None,
    select: List[str] = None,
    **filters
)
Returns: Single document or None if not found
Example:
def main():
    post_id = req.get("post_id")

    post = db.find_one("posts",
        id=post_id,
        populate=["author", "category"]
    )

    if not post:
        return {"error": "Post not found"}, 404

    return {"post": post}
​
query_users() - Query Users
Query users with the same powerful features as collections.
db.query_users(
    populate: List[str] = None,
    select: List[str] = None,
    sort: str = None,
    order: str = "asc",
    limit: int = 10,
    offset: int = 0,
    **filters
)
Example:
def main():
    # Get premium users over 18
    users = db.query_users(
        role="premium",
        age_gte="18",
        email_endswith="@gmail.com",
        populate=["referred_by"],
        sort="created_at",
        order="desc",
        limit=50
    )

    return {"users": users["data"]}
​
find_user() - Get Single User
Find a single user by ID or filters.
db.find_user(
    populate: List[str] = None,
    select: List[str] = None,
    **filters
)
Example:
def main():
    # By ID
    user = db.find_user(
        id="user-123",
        populate=["company", "manager"]
    )

    # By email
    user = db.find_user(email="john@example.com")

    if not user:
        return {"error": "User not found"}, 404

    return {"user": user}
​
Comparison Operators
Use operator suffixes to filter data:
Operator	Suffix	Example	Description
Equal	(none) or _eq	status="published"	Exact match
Not Equal	_ne	status_ne="draft"	Not equal
Greater Than	_gt	price_gt="100"	Greater than
Greater or Equal	_gte	age_gte="18"	Greater than or equal
Less Than	_lt	price_lt="1000"	Less than
Less or Equal	_lte	stock_lte="10"	Less than or equal
Contains	_contains	title_contains="python"	String contains (case-insensitive)
Starts With	_startswith	name_startswith="john"	String starts with
Ends With	_endswith	email_endswith="@gmail.com"	String ends with
In Array	_in	status_in="published,draft"	Value in comma-separated list
Not In Array	_notin	category_notin="spam,nsfw"	Value not in list
Is Null	_isnull	deleted_at_isnull="true"	Check if field is null/not null
​
Examples
Greater Than:
products = db.query("products", price_gt="50")
Contains (case-insensitive):
users = db.query_users(name_contains="john")
In Array:
posts = db.query("posts",
    status_in="published,featured,trending"
)
Multiple Operators:
products = db.query("products",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    category_ne="discontinued"
)
​
Boolean Logic
​
Simple OR Queries
Use [or] prefix to create OR conditions:
# Posts with status = published OR featured
posts = db.query("posts", **{
    "[or]status": "published",
    "[or]status_2": "featured"
})
​
Named OR Groups
Create multiple independent OR groups:
# (category=tech OR category=programming) AND (status=published OR status=featured)
posts = db.query("posts", **{
    "[or:cats]category": "tech",
    "[or:cats]category_2": "programming",
    "[or:status]status": "published",
    "[or:status]status_2": "featured"
})
​
Search Across Multiple Fields
# Posts where title OR content contains keyword
posts = db.query("posts", **{
    "[or:search]title_contains": "python",
    "[or:search]content_contains": "python"
})


Execution Environment
Complete guide to request handling and response types in cloud functions

​
Cloud Function Environment
Complete guide to the execution environment, request handling, and response types in CocoBase cloud functions.
​
Overview
CocoBase cloud functions execute in a sandboxed Python 3.10 environment with access to:
Request object (request or req) - Access to query params, payload, headers, user info
Database service (db) - Query and manage your data
Template renderer (render) - Render HTML with Jinja2
Environment object (env) - Project and environment info
​
Function Execution
​
Execution URL
When you create a cloud function, you get an execution URL:
https://api.cocobase.buzz/functions/{function_id}/execute
​
HTTP Methods
GET Request:
# Query parameters in URL
curl "https://api.cocobase.buzz/functions/abc123/execute?name=John&age=25"
POST Request:
# JSON payload in body
curl -X POST https://api.cocobase.buzz/functions/abc123/execute \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 25}'
​
The request Object
The request object (also available as req) provides access to incoming request data.
​
Properties
def main():
    # Get data from POST body or GET query params
    name = req.get('name', 'Guest')
    age = req.get('age', 0)

    # Access all payload data
    all_data = req.json()

    # Get query parameters (GET requests)
    page = req.query_params.get('page', '1')

    # Access headers
    auth_token = req.headers.get('authorization', '')

    # Check HTTP method
    method = req.method  # 'GET' or 'POST'

    # Request timestamp
    timestamp = req.timestamp

    # Current user (if authenticated)
    user = req.user  # AppUser object or None

    # Project ID
    project_id = req.proj
​
Methods
​
request.get(key, default=None)
Get value from payload (POST) or query params (GET):
def main():
    # From POST body: {"name": "John"}
    # Or GET query: ?name=John
    name = req.get('name', 'Anonymous')

    return {"greeting": f"Hello, {name}!"}
​
request.json()
Get entire payload as dictionary:
def main():
    data = req.json()
    # Returns: {"name": "John", "age": 25, "email": "john@example.com"}

    return {
        "received": data,
        "keys": list(data.keys())
    }
​
request.send_mail()
Send email using CocoMailer integration:
def main():
    # Send with template
    result = req.send_mail(
        to="user@example.com",
        subject="Welcome!",
        template_id="welcome-template",
        context={
            "username": "John",
            "activation_link": "https://..."
        }
    )

    # Send with plain body
    result = req.send_mail(
        to=["user1@example.com", "user2@example.com"],
        subject="Notification",
        body="<h1>Hello!</h1><p>This is your notification.</p>"
    )

    return {"email_sent": result}
​
User Authentication
Access authenticated user data:
def main():
    user = req.user

    if not user:
        return {"error": "Authentication required"}, 401

    # User properties
    user_id = user.id
    email = user.email
    user_data = user.data  # Custom user fields
    roles = user.roles

    return {
        "user_id": user_id,
        "email": email,
        "roles": roles
    }
​
Response Types
​
JSON Response (Default)
Return a dictionary to send JSON:
def main():
    return {
        "success": True,
        "message": "Operation completed",
        "data": {"id": "123", "name": "John"}
    }
​
HTML Response
Use render.render_html() for HTML pages:
def main():
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Page</title>
    </head>
    <body>
        <h1>Hello World!</h1>
    </body>
    </html>
    '''

    return render.render_html(html)
​
HTML with Template Variables
def main():
    posts = db.query("posts", status="published", limit=10)

    html = '''
    <!DOCTYPE html>
    <html>
    <body>
        <h1>Blog Posts</h1>
        {% for post in posts %}
        <article>
            <h2>{{ post.title }}</h2>
            <p>By {{ post.author.name }}</p>
        </article>
        {% endfor %}
    </body>
    </html>
    '''

    return render.render_html(html, {
        'posts': posts['data']
    })
​
Status Codes
Return a tuple with status code:
def main():
    user = req.user

    if not user:
        return {"error": "Unauthorized"}, 401

    if not user.is_admin:
        return {"error": "Forbidden"}, 403

    return {"success": True}, 200
​
Environment Variables
Access environment and project information:
def main():
    # Project ID
    project_id = env.project_id

    # Execution environment
    runtime = env.runtime  # "python3.10"

    # Static files base URL
    static_url = env.static_base_url

    return {
        "project": project_id,
        "runtime": runtime
    }
​
Available Python Modules
Cloud functions have access to these Python standard library modules without import statements:
Module	Description	Common Uses
json	JSON encoding/decoding	Parse API responses, serialize data
datetime	Date and time class	Current time, timestamps
timedelta	Time duration class	Add/subtract time, expiration
time	Time utilities	Delays, timestamps, timing
math	Mathematical functions	Calculations, rounding
re	Regular expressions	Pattern matching, validation
secrets	Cryptographically secure random	OTP generation, tokens, passwords
uuid	UUID generation	Unique identifiers
hashlib	Hash functions	MD5, SHA256, data integrity
base64	Base64 encoding	Encode/decode binary data
string	String constants	ASCII letters, digits, punctuation
collections	Data structures	Counter, defaultdict, deque
​
Examples
OTP Generation (Secure):
def main():
    # Generate 6-digit OTP (cryptographically secure)
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    # Send via email
    req.send_mail(
        to=req.get('email'),
        subject="Your OTP Code",
        body=f"Your OTP is: {otp}"
    )

    return {"otp_sent": True}
Email Validation:
def main():
    email = req.get('email')

    # Validate email format
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    is_valid = bool(re.match(email_pattern, email))

    if not is_valid:
        return {"error": "Invalid email format"}, 400

    return {"valid": True}
Password Hashing:
def main():
    password = req.get('password')

    # Hash password with SHA256
    hashed = hashlib.sha256(password.encode()).hexdigest()

    return {"hash": hashed}
​
Error Handling
def main():
    try:
        result = some_operation()
        return {"result": result}
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
​


Quick Reference
Quick lookup for common queries and patterns

​
Quick Reference
Quick lookup for common queries and patterns in CocoBase cloud functions.
​
Operators
# Comparison
db.query("posts", status="published")                    # Equal
db.query("posts", status_ne="draft")                     # Not equal
db.query("posts", views_gt="100")                        # Greater than
db.query("posts", views_gte="100")                       # Greater or equal
db.query("posts", views_lt="1000")                       # Less than
db.query("posts", views_lte="1000")                      # Less or equal

# String
db.query("posts", title_contains="python")               # Contains
db.query("posts", title_startswith="How to")             # Starts with
db.query("posts", email_endswith="@gmail.com")           # Ends with

# Array
db.query("posts", status_in="published,featured")        # In array
db.query("posts", category_notin="spam,nsfw")            # Not in array

# Null check
db.query("posts", deleted_at_isnull="true")              # Is null
​
Boolean Logic
# OR - same field
db.query("posts", **{
    "[or]status": "published",
    "[or]status_2": "featured"
})

# OR - different fields
db.query("posts", **{
    "[or]title_contains": "python",
    "[or]content_contains": "python"
})

# OR groups
db.query("posts", **{
    "[or:cats]category": "tech",
    "[or:cats]category_2": "programming",
    "[or:status]status": "published",
    "[or:status]status_2": "featured"
})
​
Relationships
# Basic population
db.query("posts", populate=["author"])

# Multiple fields
db.query("posts", populate=["author", "category", "tags"])

# Nested (deep)
db.query("posts", populate=["author.company.location"])

# With filtering
db.query("posts", **{"author.role": "admin"}, populate=["author"])

# Select fields
db.query("posts", populate=["author"], select=["id", "title", "author"])
​
User Queries
# Query users
db.query_users(role="premium", age_gte="18", limit=50)

# Find user
db.find_user(id="user-123", populate=["company"])
db.find_user(email="john@example.com")

# User relationships
db.get_user_relationships("user-123", "followers", limit=50)
db.get_user_relationships("user-123", "following", limit=50)
db.get_user_relationships("user-123", "friends", limit=100)

# User's documents
db.get_user_collections("user-123", "posts", limit=20)
db.get_user_collections("user-123", "comments", limit=50)

# Add/remove relationships
db.add_user_relationship("user-1", "user-2", "following")
db.remove_user_relationship("user-1", "user-2", "following")
db.add_user_relationship("user-1", "user-2", "friends", bidirectional=True)
​
Common Patterns
​
Pagination
page = 1
per_page = 20
offset = (page - 1) * per_page

result = db.query("posts",
    status="published",
    limit=per_page,
    offset=offset,
    sort="created_at",
    order="desc"
)

return {
    "data": result["data"],
    "page": page,
    "total": result["total"],
    "has_more": result["has_more"]
}
​
Search
keyword = req.get("keyword", "")

posts = db.query("posts", **{
    "[or]title_contains": keyword,
    "[or]content_contains": keyword,
    "status": "published"
}, limit=20)
​
Filtering with Population
products = db.query("products",
    category_id="cat-1",
    price_gte="50",
    price_lte="500",
    stock_gt="0",
    populate=["category", "reviews"],
    sort="price",
    order="asc",
    limit=24
)
​
User Profile
user_id = req.get("user_id")

user = db.find_user(id=user_id, populate=["company"])
posts = db.get_user_collections(user_id, "posts", limit=10)
followers = db.get_user_relationships(user_id, "followers", limit=5)
following = db.get_user_relationships(user_id, "following", limit=5)

return {
    "user": user,
    "stats": {
        "posts": posts["total"],
        "followers": followers["total"],
        "following": following["total"]
    },
    "recent_posts": posts["data"]
}
​
Social Feed
user_id = req.get("user_id")

# Get following
following = db.get_user_relationships(user_id, "following")
following_ids = [u["id"] for u in following["data"]]

# Build OR filters
filters = {"status": "published"}
for idx, followed_id in enumerate(following_ids[:50]):
    filters[f"[or:authors]author_id_{idx}"] = followed_id

# Get feed
feed = db.query("posts", **filters,
    populate=["author", "category"],
    sort="created_at",
    order="desc",
    limit=30
)

return {"feed": feed["data"]}
​
Follow/Unfollow
action = req.get("action")
user_id = req.get("user_id")
target_id = req.get("target_id")

if action == "follow":
    return db.add_user_relationship(user_id, target_id, "following")
elif action == "unfollow":
    return db.remove_user_relationship(user_id, target_id, "following")
elif action == "is_following":
    following = db.get_user_relationships(user_id, "following")
    is_following = target_id in [u["id"] for u in following["data"]]
    return {"is_following": is_following}
​
Field Naming
# Single reference (belongs_to)
{
  "author_id": "user-123",
  "category_id": "cat-1",
  "manager_id": "user-456"
}

# Multiple references (has_many)
{
  "tag_ids": ["tag-1", "tag-2"],
  "follower_ids": ["user-1", "user-2"],
  "product_ids": ["prod-1", "prod-2"]
}

# Populate
populate=["author", "category", "manager", "tags", "followers", "products"]
​
Response Format
{
  "data": [
    {"id": "...", "title": "..."},
    {"id": "...", "title": "..."}
  ],
  "total": 150,      # Total matching documents
  "limit": 20,       # Requested limit
  "offset": 0,       # Offset used
  "has_more": true   # More results available
}
​
Error Handling
def main():
    try:
        posts = db.query("posts",
            status="published",
            limit=20
        )
        return {"posts": posts["data"]}
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": "Internal server error"}, 500
​
Tips
Always use limit to avoid large result sets
Use populate only for needed fields
Use select to return only required fields
Cache relationship counts in user data
Index frequently queried fields
Use pagination for large datasets
Handle errors gracefully



Cloud Functions
Examples
Complete working examples for common use cases

​
Cloud Function Examples
Complete working examples for common use cases.
​
E-Commerce
​
Product Search with Filters
def main():
    # Get search parameters
    category = req.get("category")
    min_price = req.get("min_price", "0")
    max_price = req.get("max_price", "10000")
    search = req.get("search", "")
    in_stock = req.get("in_stock", "true")

    # Build filters
    filters = {
        "status": "active",
        "price_gte": min_price,
        "price_lte": max_price
    }

    if in_stock == "true":
        filters["stock_gt"] = "0"

    if category:
        filters["category_id"] = category

    # Search in name or description
    if search:
        filters["[or]name_contains"] = search
        filters["[or]description_contains"] = search

    # Query products
    products = db.query("products", **filters,
        populate=["category", "brand"],
        sort="popularity",
        order="desc",
        limit=24
    )

    return {
        "products": products["data"],
        "total": products["total"],
        "page": 1,
        "has_more": products["has_more"]
    }
​
Shopping Cart with Product Details
def main():
    user_id = req.get("user_id")

    # Get user's cart
    cart = db.find_one("carts",
        user_id=user_id,
        populate=["items.product"]  # Nested population
    )

    if not cart:
        return {"cart": {"items": [], "total": 0}}

    # Calculate totals
    total = sum(item["quantity"] * item["product"]["price"]
                for item in cart.get("items", []))

    return {
        "cart": cart,
        "total": total,
        "item_count": len(cart.get("items", []))
    }
​
Social Media
​
User Feed
def main():
    user_id = req.get("user_id")
    page = int(req.get("page", "1"))
    per_page = 20

    # Get users this user follows
    following = db.get_user_relationships(user_id, "following")
    following_ids = [u["id"] for u in following["data"]]

    # Add user's own posts
    following_ids.append(user_id)

    # Build OR filter for posts from followed users
    filters = {"status": "published"}
    for idx, followed_id in enumerate(following_ids[:50]):
        filters[f"[or:authors]author_id_{idx}"] = followed_id

    # Get feed
    feed = db.query("posts", **filters,
        populate=["author", "attachments"],
        sort="created_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    return {
        "feed": feed["data"],
        "page": page,
        "has_more": feed["has_more"]
    }
​
User Profile
def main():
    profile_id = req.get("profile_id")
    viewer_id = req.get("viewer_id")  # Current user

    # Get user info
    user = db.find_user(id=profile_id, populate=["company"])

    if not user:
        return {"error": "User not found"}, 404

    # Get stats
    followers = db.get_user_relationships(profile_id, "followers")
    following = db.get_user_relationships(profile_id, "following")

    # Get user's posts
    posts = db.get_user_collections(
        profile_id, "posts",
        filters={"status": "published"},
        populate=["attachments"],
        limit=10
    )

    # Check viewer's relationship with this user
    relationship = {}
    if viewer_id and viewer_id != profile_id:
        viewer_following = db.get_user_relationships(viewer_id, "following")
        viewer_friends = db.get_user_relationships(viewer_id, "friends")

        relationship = {
            "is_following": profile_id in [u["id"] for u in viewer_following["data"]],
            "are_friends": profile_id in [u["id"] for u in viewer_friends["data"]]
        }

    return {
        "user": user,
        "stats": {
            "followers": followers["total"],
            "following": following["total"],
            "posts": posts["total"]
        },
        "recent_posts": posts["data"],
        "relationship": relationship
    }
​
Follow/Unfollow System
def main():
    action = req.get("action")
    user_id = req.get("user_id")
    target_id = req.get("target_id")

    if not user_id or not target_id:
        return {"error": "user_id and target_id required"}, 400

    if user_id == target_id:
        return {"error": "Cannot follow yourself"}, 400

    if action == "follow":
        result = db.add_user_relationship(user_id, target_id, "following")
        return {"success": True, "message": "Followed successfully"}

    elif action == "unfollow":
        result = db.remove_user_relationship(user_id, target_id, "following")
        return {"success": True, "message": "Unfollowed successfully"}

    elif action == "is_following":
        following = db.get_user_relationships(user_id, "following")
        is_following = target_id in [u["id"] for u in following["data"]]
        return {"is_following": is_following}

    elif action == "get_followers":
        return db.get_user_relationships(target_id, "followers", limit=50)

    elif action == "get_following":
        return db.get_user_relationships(target_id, "following", limit=50)

    else:
        return {"error": "Invalid action"}, 400
​
Blog/CMS
​
Blog Post Search
def main():
    keyword = req.get("keyword", "")
    category = req.get("category")
    author_id = req.get("author_id")
    tags = req.get("tags", "").split(",") if req.get("tags") else []
    page = int(req.get("page", "1"))
    per_page = 20

    # Build filters
    filters = {"status": "published"}

    # Search in title or content
    if keyword:
        filters["[or:search]title_contains"] = keyword
        filters["[or:search]content_contains"] = keyword
        filters["[or:search]excerpt_contains"] = keyword

    # Filter by category
    if category:
        filters["category_id"] = category

    # Filter by author
    if author_id:
        filters["author_id"] = author_id

    # Filter by tags (any tag matches)
    if tags:
        for idx, tag in enumerate(tags):
            filters[f"[or:tags]tag_ids_{idx}"] = tag

    # Query posts
    posts = db.query("posts", **filters,
        populate=["author", "category", "tags"],
        sort="published_at",
        order="desc",
        limit=per_page,
        offset=(page - 1) * per_page
    )

    return {
        "posts": posts["data"],
        "total": posts["total"],
        "page": page,
        "total_pages": (posts["total"] + per_page - 1) // per_page
    }
​
Related Posts
def main():
    post_id = req.get("post_id")

    # Get current post
    post = db.find_one("posts", id=post_id)

    if not post:
        return {"error": "Post not found"}, 404

    # Get related posts (same category or tags)
    filters = {
        "status": "published",
        "id_ne": post_id  # Exclude current post
    }

    # Same category OR any matching tags
    if post.get("category_id"):
        filters["[or:related]category_id"] = post["category_id"]

    if post.get("tag_ids"):
        for idx, tag_id in enumerate(post["tag_ids"][:5]):
            filters[f"[or:related]tag_ids_{idx}"] = tag_id

    related = db.query("posts", **filters,
        populate=["author", "category"],
        sort="views",
        order="desc",
        limit=5
    )

    return {"related_posts": related["data"]}
​
Project Management
​
Task Board
def main():
    project_id = req.get("project_id")
    status = req.get("status")  # todo, in_progress, done
    assignee_id = req.get("assignee_id")

    filters = {"project_id": project_id}

    if status:
        filters["status"] = status

    if assignee_id:
        filters["assignee_id"] = assignee_id

    tasks = db.query("tasks", **filters,
        populate=["assignee", "created_by", "labels"],
        sort="priority",
        order="desc",
        limit=100
    )

    # Group by status
    grouped = {
        "todo": [],
        "in_progress": [],
        "done": []
    }

    for task in tasks["data"]:
        status = task.get("status", "todo")
        if status in grouped:
            grouped[status].append(task)

    return {
        "tasks": tasks["data"],
        "grouped": grouped,
        "total": tasks["total"]
    }
​
Analytics
​
User Activity Dashboard
def main():
    user_id = req.get("user_id")
    days = int(req.get("days", "30"))

    start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

    # Get user's content
    posts = db.get_user_collections(
        user_id, "posts",
        filters={"created_at_gte": start_date}
    )

    comments = db.get_user_collections(
        user_id, "comments",
        filters={"created_at_gte": start_date}
    )

    likes = db.get_user_collections(
        user_id, "likes",
        filters={"created_at_gte": start_date}
    )

    return {
        "period_days": days,
        "activity": {
            "posts_created": posts["total"],
            "comments_made": comments["total"],
            "likes_given": likes["total"]
        }
    }
​
Popular Content
def main():
    collection = req.get("collection", "posts")
    period = req.get("period", "week")  # day, week, month, all
    limit = int(req.get("limit", "10"))

    filters = {"status": "published"}

    # Set date filter based on period
    if period == "day":
        start_date = (datetime.utcnow() - timedelta(days=1)).isoformat()
        filters["created_at_gte"] = start_date
    elif period == "week":
        start_date = (datetime.utcnow() - timedelta(weeks=1)).isoformat()
        filters["created_at_gte"] = start_date
    elif period == "month":
        start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        filters["created_at_gte"] = start_date

    # Get popular content
    content = db.query(collection, **filters,
        populate=["author", "category"],
        sort="views",
        order="desc",
        limit=limit
    )

    return {
        "popular_content": content["data"],
        "period": period,
        "total": content["total"]
    }



Complete Applications
Complete App Examples
Full-featured application examples built with Cocobase

​
Complete Application Examples
Learn by building! These complete application examples show you how to build real-world apps with Cocobase.
​
Todo Application
A simple yet complete todo app with authentication, CRUD operations, and real-time sync.
​
Features
User authentication
Create, read, update, delete todos
Mark todos as complete
Real-time sync across devices
Filter by status
JavaScript/React
Flutter
Python
// lib/cocobase.ts
import { Cocobase } from "cocobase";

export const db = new Cocobase({
  apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
});

// types/todo.ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

// hooks/useTodos.ts
import { useState, useEffect } from 'react';
import { db } from '@/lib/cocobase';
import type { Todo } from '@/types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();

    // Real-time subscription
    const unsubscribe = db.watch('todos', (event) => {
      if (event.type === 'create') {
        setTodos(prev => [...prev, event.data as Todo]);
      } else if (event.type === 'update') {
        setTodos(prev => prev.map(t =>
          t.id === event.data.id ? event.data as Todo : t
        ));
      } else if (event.type === 'delete') {
        setTodos(prev => prev.filter(t => t.id !== event.documentId));
      }
    });

    return () => unsubscribe();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await db.listDocuments<Todo>('todos', {
        sort: { createdAt: -1 }
      });
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    const todo = await db.createDocument<Todo>('todos', {
      title,
      completed: false,
      userId: db.auth.getCurrentUser()?.id,
    });
    return todo;
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await db.updateDocument('todos', id, { completed });
  };

  const deleteTodo = async (id: string) => {
    await db.deleteDocument('todos', id);
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}

// components/TodoList.tsx
import { useTodos } from '@/hooks/useTodos';

export function TodoList() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodo(newTodo);
    setNewTodo('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
​
E-Commerce Application
A complete e-commerce app with products, cart, and checkout.
​
Features
Product catalog with search
Shopping cart
User orders
Inventory management
Real-time stock updates
JavaScript/Next.js
Flutter
// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

// hooks/useProducts.ts
export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    const filters = category ? { category: { $eq: category } } : {};
    const data = await db.listDocuments<Product>('products', {
      filters,
      sort: { createdAt: -1 }
    });
    setProducts(data);
  };

  const searchProducts = async (query: string) => {
    const data = await db.listDocuments<Product>('products', {
      filters: {
        name: { $contains: query }
      }
    });
    setProducts(data);
  };

  return { products, searchProducts };
}

// hooks/useCart.ts
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    const existing = cart.find(item => item.productId === productId);

    if (existing) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity }]);
    }

    // Save to database
    await db.createDocument('cart_items', {
      userId: db.auth.getCurrentUser()?.id,
      productId,
      quantity
    });
  };

  const removeFromCart = async (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));

    // Delete from database
    const cartItem = await db.listDocuments('cart_items', {
      filters: {
        userId: { $eq: db.auth.getCurrentUser()?.id },
        productId: { $eq: productId }
      }
    });

    if (cartItem[0]) {
      await db.deleteDocument('cart_items', cartItem[0].id);
    }
  };

  const checkout = async () => {
    const user = db.auth.getCurrentUser();
    if (!user) throw new Error('Please login to checkout');

    // Calculate total
    const total = cart.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    // Create order
    const order = await db.createDocument<Order>('orders', {
      userId: user.id,
      items: cart,
      total,
      status: 'pending'
    });

    // Clear cart
    setCart([]);

    return order;
  };

  return { cart, addToCart, removeFromCart, checkout };
}

// components/ProductCard.tsx
export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <img src={product.images[0]} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="stock">
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>
      <button
        onClick={() => addToCart(product.id)}
        disabled={product.stock === 0}
      >
        Add to Cart
      </button>
    </div>
  );
}

// components/Cart.tsx
export function Cart() {
  const { cart, removeFromCart, checkout } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const order = await checkout();
      alert(`Order placed! Order ID: ${order.id}`);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) =>
    sum + (item.product?.price || 0) * item.quantity, 0
  );

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.productId} className="cart-item">
          <span>{item.product?.name}</span>
          <span>x{item.quantity}</span>
          <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeFromCart(item.productId)}>
            Remove
          </button>
        </div>
      ))}
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
      <button onClick={handleCheckout} disabled={loading || cart.length === 0}>
        {loading ? 'Processing...' : 'Checkout'}
      </button>
    </div>
  );
}
​
Social Media Feed
A social media application with posts, likes, comments, and follows.
​
Features
Create and view posts
Like/unlike posts
Comment on posts
Follow/unfollow users
Real-time feed updates
User profiles
JavaScript/React
// types/social.ts
export interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  images?: string[];
  likes: string[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  data: {
    full_name: string;
    avatar?: string;
    bio?: string;
  };
}

// hooks/useFeed.ts
export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();

    // Real-time updates
    const unsubscribe = db.watch('posts', (event) => {
      if (event.type === 'create') {
        setPosts(prev => [event.data as Post, ...prev]);
      } else if (event.type === 'update') {
        setPosts(prev => prev.map(p =>
          p.id === event.data.id ? event.data as Post : p
        ));
      } else if (event.type === 'delete') {
        setPosts(prev => prev.filter(p => p.id !== event.documentId));
      }
    });

    return () => unsubscribe();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await db.listDocuments<Post>('posts', {
        sort: { createdAt: -1 },
        populate: ['userId'],
        limit: 20
      });
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, images?: string[]) => {
    const post = await db.createDocument<Post>('posts', {
      userId: db.auth.getCurrentUser()?.id,
      content,
      images: images || [],
      likes: [],
      commentCount: 0
    });
    return post;
  };

  const likePost = async (postId: string) => {
    const userId = db.auth.getCurrentUser()?.id;
    const post = posts.find(p => p.id === postId);

    if (!post || !userId) return;

    const likes = post.likes.includes(userId)
      ? post.likes.filter(id => id !== userId)
      : [...post.likes, userId];

    await db.updateDocument('posts', postId, { likes });
  };

  const deletePost = async (postId: string) => {
    await db.deleteDocument('posts', postId);
  };

  return { posts, loading, createPost, likePost, deletePost };
}

// hooks/useComments.ts
export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const data = await db.listDocuments<Comment>('comments', {
      filters: { postId: { $eq: postId } },
      sort: { createdAt: -1 },
      populate: ['userId']
    });
    setComments(data);
  };

  const addComment = async (content: string) => {
    const comment = await db.createDocument<Comment>('comments', {
      postId,
      userId: db.auth.getCurrentUser()?.id,
      content
    });

    // Increment comment count
    const post = await db.getDocument('posts', postId);
    await db.updateDocument('posts', postId, {
      commentCount: (post.commentCount || 0) + 1
    });

    return comment;
  };

  return { comments, addComment };
}

// components/PostCard.tsx
export function PostCard({ post }: { post: Post }) {
  const { likePost, deletePost } = useFeed();
  const currentUser = db.auth.getCurrentUser();
  const isLiked = post.likes.includes(currentUser?.id || '');

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.user?.data.avatar} alt={post.user?.data.full_name} />
        <div>
          <h4>{post.user?.data.full_name}</h4>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button onClick={() => likePost(post.id)}>
          {isLiked ? '❤️' : '🤍'} {post.likes.length}
        </button>
        <button>💬 {post.commentCount}</button>
        {currentUser?.id === post.userId && (
          <button onClick={() => deletePost(post.id)}>🗑️ Delete</button>
        )}
      </div>
    </div>
  );
}

// components/CreatePost.tsx
export function CreatePost() {
  const { createPost } = useFeed();
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      await createPost(content);
      setContent('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
      />
      <button type="submit" disabled={posting || !content.trim()}>
        {posting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
​
Real-Time Chat Application
A complete chat app with rooms, direct messages, and online status.
​
Features
Real-time messaging
Chat rooms
Direct messages
Online status
Typing indicators
Message history
JavaScript/React
// hooks/useChat.ts
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<string[]>([]);

  useEffect(() => {
    // Load message history
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = db.realtimeApi.joinRoom(roomId, (event) => {
      if (event.type === 'message') {
        setMessages(prev => [...prev, event.data]);
      } else if (event.type === 'typing') {
        setTyping(prev => [...prev, event.userId]);
        setTimeout(() => {
          setTyping(prev => prev.filter(id => id !== event.userId));
        }, 3000);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const loadMessages = async () => {
    const data = await db.listDocuments('messages', {
      filters: { roomId: { $eq: roomId } },
      sort: { createdAt: 1 },
      populate: ['userId'],
      limit: 50
    });
    setMessages(data);
  };

  const sendMessage = async (content: string) => {
    const message = await db.createDocument('messages', {
      roomId,
      userId: db.auth.getCurrentUser()?.id,
      content
    });

    // Broadcast to room
    await db.realtimeApi.broadcast(roomId, {
      type: 'message',
      data: message
    });

    return message;
  };

  const sendTyping = async () => {
    await db.realtimeApi.broadcast(roomId, {
      type: 'typing',
      userId: db.auth.getCurrentUser()?.id
    });
  };

  return { messages, typing, sendMessage, sendTyping };
}

// components/ChatRoom.tsx
export function ChatRoom({ roomId }: { roomId: string }) {
  const { messages, typing, sendMessage, sendTyping } = useChat(roomId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  };

  const handleTyping = () => {
    sendTyping();
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.user?.data.full_name}:</strong>
            <span>{msg.content}</span>
            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
        {typing.length > 0 && (
          <div className="typing-indicator">
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="message-input">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
​
Notes App with Real-Time Sync
A collaborative notes app with folders and real-time synchronization.
​
Features
Create and organize notes in folders
Rich text editing
Real-time sync across devices
Collaboration with other users
Search notes
// Full implementation available in the examples repository
​
Complete App Architecture
All these apps follow this general architecture:
/src
  /lib
    cocobase.ts         # Cocobase client setup
  /types
    index.ts            # TypeScript interfaces
  /hooks
    useAuth.ts          # Authentication hook
    useData.ts          # Data fetching hooks
  /components
    ...                 # React components
  /pages or /screens
    ...                 # App pages/screens
​
Best Practices
Data Modeling

Keep documents denormalized for read performance
Use relationships for one-to-many associations
Store frequently accessed data together
Real-Time Updates

Only subscribe to data you’re actively displaying - Unsubscribe when components unmount - Filter subscriptions to reduce bandwidth
Error Handling

Always handle errors in async operations - Show user-friendly error messages
Implement retry logic for network errors
Performance

Paginate large lists
Cache frequently accessed data
Use optimistic UI updates


