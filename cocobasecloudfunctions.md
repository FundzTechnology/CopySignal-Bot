visit https://docs.cocobase.buzz/cloud-functions/introduction

Cloud Functions
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
​
Next Steps
Environment - Learn about request/response handling
Quick Reference - Cheat sheet for common patterns
Examples - Real-world code examples