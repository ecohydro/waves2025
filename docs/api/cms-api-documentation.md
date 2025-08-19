# CMS API Documentation

This document describes the REST API endpoints for the WAVES Lab CMS integration. The API provides programmatic access to manage people, publications, and news content.

## Base URL

```
https://your-domain.com/api/cms
```

## Authentication

All write operations (POST, PUT, DELETE) require authentication using an API key. Include the API key in the request headers:

```
x-api-key: your-api-key-here
```

Or using the Authorization header:

```
Authorization: Bearer your-api-key-here
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Read operations**: 100 requests per minute
- **Write operations**: 10 requests per minute
- **Delete operations**: 5 requests per minute

When rate limited, the API returns a `429 Too Many Requests` status code.

## Common Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": ["Detailed error information"]
}
```

## Endpoints

### Health Check

#### GET /api/cms/health

Check the health status of the CMS API and Sanity connection.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "nodeEnv": "production",
  "sanity": {
    "connected": true,
    "responseTime": "150ms",
    "personCount": 69
  },
  "environment": {
    "projectId": true,
    "dataset": true,
    "apiToken": true,
    "cmsApiKey": true
  },
  "version": "1.0.0"
}
```

### People Endpoints

#### GET /api/cms/people

Retrieve a list of people with optional filtering and pagination.

**Query Parameters:**

- `userGroup` (optional): Filter by user group (`current`, `alumni`, `collaborator`, `visitor`)
- `limit` (optional): Number of items per page (default: 50, max: 100)
- `offset` (optional): Number of items to skip (default: 0)
- `search` (optional): Search in name, title, and bio fields

**Example:**

```bash
GET /api/cms/people?userGroup=current&limit=10&search=john
```

**Response:**

```json
{
  "data": [
    {
      "_id": "person-1",
      "_type": "person",
      "name": "John Doe",
      "slug": { "current": "john-doe" },
      "title": "Research Scientist",
      "userGroup": "current",
      "email": "john.doe@example.com",
      "website": "https://johndoe.com",
      "socialMedia": {
        "orcid": "0000-0000-0000-0000",
        "googleScholar": "https://scholar.google.com/citations?user=...",
        "linkedin": "https://linkedin.com/in/johndoe"
      },
      "education": [
        {
          "degree": "Ph.D.",
          "field": "Environmental Science",
          "institution": "University of Example",
          "year": 2020
        }
      ],
      "researchInterests": ["Ecohydrology", "Climate Change"],
      "bio": "John is a research scientist...",
      "bioLong": "John Doe is a research scientist...",
      "joinDate": "2020-09-01",
      "currentPosition": "Research Scientist",
      "isActive": true
    }
  ],
  "pagination": {
    "total": 69,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/cms/people

Create a new person. Requires authentication.

**Request Body:**

```json
{
  "name": "Jane Smith",
  "slug": { "current": "jane-smith" },
  "title": "Postdoctoral Researcher",
  "userGroup": "current",
  "email": "jane.smith@example.com",
  "website": "https://janesmith.com",
  "socialMedia": {
    "orcid": "0000-0000-0000-0001",
    "twitter": "@janesmith"
  },
  "education": [
    {
      "degree": "Ph.D.",
      "field": "Hydrology",
      "institution": "University of Science",
      "year": 2023
    }
  ],
  "researchInterests": ["Water Resources", "Remote Sensing"],
  "bio": "Jane is a postdoctoral researcher...",
  "joinDate": "2023-09-01",
  "isActive": true
}
```

**Response:**

```json
{
  "message": "Person created successfully",
  "data": {
    "_id": "person-2",
    "_type": "person",
    "name": "Jane Smith",
    ...
  }
}
```

#### GET /api/cms/people/{id}

Retrieve a specific person by ID.

**Response:**

```json
{
  "data": {
    "_id": "person-1",
    "_type": "person",
    "name": "John Doe",
    ...
  }
}
```

#### PUT /api/cms/people/{id}

Update an existing person. Requires authentication.

**Request Body:** Same format as POST, but only include fields to update.

**Response:**

```json
{
  "message": "Person updated successfully",
  "data": {
    "_id": "person-1",
    "_type": "person",
    "name": "John Updated",
    ...
  }
}
```

#### DELETE /api/cms/people/{id}

Delete a person. Requires authentication.

**Response:**

```json
{
  "message": "Person deleted successfully"
}
```

### Publications Endpoints

#### GET /api/cms/publications

Retrieve a list of publications with optional filtering and pagination.

**Query Parameters:**

- `publicationType` (optional): Filter by type (`journal-article`, `conference-paper`, `book-chapter`, `preprint`, `thesis`, `report`, `book`, `other`)
- `status` (optional): Filter by status (`published`, `in-press`, `accepted`, `under-review`, `submitted`, `in-preparation`, `preprint`)
- `limit` (optional): Number of items per page (default: 50, max: 100)
- `offset` (optional): Number of items to skip (default: 0)
- `search` (optional): Search in title and abstract fields
- `featured` (optional): Filter featured publications (`true`/`false`)
- `year` (optional): Filter by publication year

**Example:**

```bash
GET /api/cms/publications?publicationType=journal-article&status=published&year=2024&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "_id": "pub-1",
      "_type": "publication",
      "title": "Ecohydrological Patterns in Arid Regions",
      "slug": { "current": "ecohydrological-patterns-arid-regions" },
      "publicationType": "journal-article",
      "authors": [
        {
          "person": {
            "_id": "person-1",
            "name": "John Doe",
            "slug": { "current": "john-doe" }
          },
          "name": "John Doe",
          "affiliation": "WAVES Lab",
          "email": "john.doe@example.com",
          "orcid": "0000-0000-0000-0000",
          "isCorresponding": true
        }
      ],
      "abstract": "This study examines ecohydrological patterns...",
      "keywords": ["ecohydrology", "arid regions", "climate change"],
      "venue": {
        "name": "Journal of Hydrology",
        "shortName": "J Hydrol",
        "volume": "123",
        "issue": "4",
        "pages": "123-145",
        "publisher": "Elsevier"
      },
      "publishedDate": "2024-01-15",
      "doi": "10.1016/j.jhydrol.2024.123456",
      "links": {
        "publisher": "https://doi.org/10.1016/j.jhydrol.2024.123456",
        "pdf": {
          "asset": {
            "_ref": "file-123",
            "_type": "reference"
          }
        }
      },
      "metrics": {
        "citations": 15,
        "altmetricScore": 45,
        "impactFactor": 4.5,
        "quartile": "Q1"
      },
      "status": "published",
      "isFeatured": true,
      "isOpenAccess": true
    }
  ],
  "pagination": {
    "total": 134,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/cms/publications

Create a new publication. Requires authentication.

**Request Body:**

```json
{
  "title": "New Research Findings",
  "slug": { "current": "new-research-findings" },
  "publicationType": "journal-article",
  "authors": [
    {
      "person": { "_ref": "person-1" },
      "isCorresponding": true
    }
  ],
  "abstract": "This paper presents new findings...",
  "keywords": ["research", "findings"],
  "venue": {
    "name": "Nature",
    "publisher": "Springer Nature"
  },
  "publishedDate": "2024-01-01",
  "doi": "10.1038/s41586-024-00000-0",
  "status": "published",
  "isFeatured": false,
  "isOpenAccess": true
}
```

#### GET /api/cms/publications/{id}

Retrieve a specific publication by ID.

#### PUT /api/cms/publications/{id}

Update an existing publication. Requires authentication.

#### DELETE /api/cms/publications/{id}

Delete a publication. Requires authentication.

### News Endpoints

#### GET /api/cms/news

Retrieve a list of news posts with optional filtering and pagination.

**Query Parameters:**

- `category` (optional): Filter by category (`research`, `publication`, `lab-news`, `conference`, `award`, `outreach`, `collaboration`, `event`, `general`)
- `status` (optional): Filter by status (`draft`, `published`, `scheduled`, `archived`)
- `limit` (optional): Number of items per page (default: 50, max: 100)
- `offset` (optional): Number of items to skip (default: 0)
- `search` (optional): Search in title, excerpt, and content fields
- `featured` (optional): Filter featured posts (`true`/`false`)
- `sticky` (optional): Filter sticky posts (`true`/`false`)
- `year` (optional): Filter by publication year
- `month` (optional): Filter by publication month

**Example:**

```bash
GET /api/cms/news?category=lab-news&status=published&featured=true&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "_id": "news-1",
      "_type": "news",
      "title": "New Research Grant Awarded",
      "slug": { "current": "new-research-grant-awarded" },
      "excerpt": "The WAVES Lab has been awarded a major research grant...",
      "content": "The WAVES Lab has been awarded a major research grant...",
      "featuredImage": {
        "asset": {
          "_ref": "image-123",
          "_type": "reference"
        },
        "alt": "Grant award ceremony",
        "caption": "Lab members celebrating the grant award"
      },
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "_id": "person-1",
        "name": "John Doe",
        "slug": { "current": "john-doe" },
        "title": "Research Scientist"
      },
      "category": "lab-news",
      "tags": ["grant", "research", "funding"],
      "relatedPublications": [
        {
          "_id": "pub-1",
          "title": "Related Publication",
          "slug": { "current": "related-publication" },
          "publicationType": "journal-article"
        }
      ],
      "externalLinks": [
        {
          "title": "Grant Announcement",
          "url": "https://example.com/grant-announcement",
          "description": "Official grant announcement"
        }
      ],
      "status": "published",
      "isFeatured": true,
      "isSticky": false,
      "socialMedia": {
        "twitterText": "Excited to announce our new research grant!",
        "hashtags": ["research", "grant", "science"]
      }
    }
  ],
  "pagination": {
    "total": 155,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/cms/news

Create a new news post. Requires authentication.

**Request Body:**

```json
{
  "title": "New Lab Member Joins",
  "slug": { "current": "new-lab-member-joins" },
  "excerpt": "We're excited to welcome a new member to our lab...",
  "content": "We're excited to welcome Dr. Jane Smith to our lab...",
  "publishedAt": "2024-01-01T10:00:00.000Z",
  "author": { "_ref": "person-1" },
  "category": "lab-news",
  "tags": ["new member", "welcome"],
  "status": "published",
  "isFeatured": false,
  "isSticky": false
}
```

#### GET /api/cms/news/{id}

Retrieve a specific news post by ID.

#### PUT /api/cms/news/{id}

Update an existing news post. Requires authentication.

#### DELETE /api/cms/news/{id}

Delete a news post. Requires authentication.

## Error Codes

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 200         | Success                                   |
| 201         | Created                                   |
| 400         | Bad Request - Validation error            |
| 401         | Unauthorized - Missing or invalid API key |
| 404         | Not Found - Resource not found            |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error                     |

## Validation Rules

### Person Validation

- `name`: Required, non-empty string
- `slug.current`: Required, non-empty string
- `userGroup`: Required, must be one of: `current`, `alumni`, `collaborator`, `visitor`
- `email`: Optional, must be valid email format if provided
- `website`: Optional, must be valid URL if provided
- `joinDate`, `leaveDate`: Optional, must be valid date if provided
- `education`: Optional array, each entry must have `degree`, `field`, `institution`, and `year`

### Publication Validation

- `title`: Required, non-empty string
- `slug.current`: Required, non-empty string
- `publicationType`: Required, must be valid publication type
- `authors`: Required array with at least one author
- `publishedDate`: Required, must be valid date
- `status`: Required, must be valid status
- Each author must have either `person` reference or `name`

### News Validation

- `title`: Required, non-empty string
- `slug.current`: Required, non-empty string
- `excerpt`: Required, non-empty string
- `content`: Required, non-empty string
- `publishedAt`: Required, must be valid date
- `author`: Required, must have `_ref` property
- `category`: Required, must be valid category
- `status`: Required, must be valid status
- `externalLinks`: Optional array, each link must have `title` and `url`

## Examples

### Using cURL

```bash
# Get all current lab members
curl -X GET "https://your-domain.com/api/cms/people?userGroup=current" \
  -H "Content-Type: application/json"

# Create a new person
curl -X POST "https://your-domain.com/api/cms/people" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "name": "Jane Smith",
    "slug": {"current": "jane-smith"},
    "userGroup": "current",
    "isActive": true
  }'

# Update a person
curl -X PUT "https://your-domain.com/api/cms/people/person-1" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "title": "Senior Research Scientist"
  }'
```

### Using JavaScript

```javascript
const API_BASE = 'https://your-domain.com/api/cms';
const API_KEY = 'your-api-key';

// Get people
async function getPeople() {
  const response = await fetch(`${API_BASE}/people?userGroup=current`);
  const data = await response.json();
  return data.data;
}

// Create a person
async function createPerson(personData) {
  const response = await fetch(`${API_BASE}/people`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(personData),
  });
  return response.json();
}

// Update a person
async function updatePerson(id, updates) {
  const response = await fetch(`${API_BASE}/people/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}
```

### Using Python

```python
import requests

API_BASE = 'https://your-domain.com/api/cms'
API_KEY = 'your-api-key'

headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
}

# Get people
def get_people():
    response = requests.get(f'{API_BASE}/people?userGroup=current')
    return response.json()['data']

# Create a person
def create_person(person_data):
    response = requests.post(
        f'{API_BASE}/people',
        headers=headers,
        json=person_data
    )
    return response.json()

# Update a person
def update_person(person_id, updates):
    response = requests.put(
        f'{API_BASE}/people/{person_id}',
        headers=headers,
        json=updates
    )
    return response.json()
```

## Integration with Automation Tools

### n8n Workflow Example

```json
{
  "nodes": [
    {
      "name": "Create Person",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-domain.com/api/cms/people",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "x-api-key": "{{ $env.CMS_API_KEY }}"
        },
        "body": {
          "name": "{{ $json.name }}",
          "slug": { "current": "{{ $json.slug }}" },
          "userGroup": "{{ $json.userGroup }}",
          "isActive": true
        }
      }
    }
  ]
}
```

### Slack Integration Example

```javascript
// Slack slash command handler
app.post('/slack/create-person', async (req, res) => {
  const { text, user_id } = req.body;

  // Parse command text (e.g., "John Doe /john-doe current")
  const [name, slug, userGroup] = text.split(' ');

  try {
    const response = await fetch('https://your-domain.com/api/cms/people', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CMS_API_KEY,
      },
      body: JSON.stringify({
        name,
        slug: { current: slug },
        userGroup,
        isActive: true,
      }),
    });

    const result = await response.json();

    res.json({
      text: `✅ Created person: ${name}`,
      attachments: [
        {
          text: `ID: ${result.data._id}\nSlug: ${result.data.slug.current}`,
        },
      ],
    });
  } catch (error) {
    res.json({ text: `❌ Error: ${error.message}` });
  }
});
```

## Support

For API support and questions, please contact the development team or refer to the project documentation.
