# InkFlow API Reference

Base URL (local): `http://localhost:5000/api/v1`
Interactive Swagger UI: `http://localhost:5000/api/docs`

All responses follow one of two shapes:

```json
// success
{ "success": true, "statusCode": 200, "message": "...", "data": { ... }, "meta": { ... } }
// error
{ "success": false, "statusCode": 400, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

`meta` appears only on paginated list endpoints: `{ total, page, limit, totalPages, hasMore }`.

Authenticated routes expect `Authorization: Bearer <accessToken>`. The refresh token is an `httpOnly` cookie set automatically on login/register — call `/auth/refresh` to get a new access token when the old one expires.

## Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | `{ name, username, email, password }` → `{ user, accessToken }` |
| POST | `/auth/login` | – | `{ email, password }` → `{ user, accessToken }` |
| POST | `/auth/logout` | – | Clears refresh cookie |
| POST | `/auth/refresh` | cookie | Returns a new `{ accessToken }` |
| GET | `/auth/me` | required | Current user |

## Blogs — `/blogs`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/blogs` | optional | Query: `page, limit, category, tag, author, sort, q` |
| GET | `/blogs/trending` | – | Query: `limit` |
| GET | `/blogs/my-blogs` | required | Own published + draft blogs |
| GET | `/blogs/slug/:slug` | optional | Drafts 404 to non-owners |
| GET | `/blogs/:id/related` | – | Related blogs |
| POST | `/blogs` | required | Create |
| PATCH | `/blogs/:id` | required (owner) | Update |
| DELETE | `/blogs/:id` | required (owner/admin) | **Delete — also used from the profile page's Published/Drafts tabs** |

## Comments — `/blogs/:blogId/comments`, `/comments/:id`
| Method | Path | Auth |
|---|---|---|
| GET | `/blogs/:blogId/comments` | – |
| POST | `/blogs/:blogId/comments` | required |
| PATCH | `/comments/:id` | required (owner) |
| DELETE | `/comments/:id` | required (owner/admin) |

## Likes — `/blogs/:blogId/like`
POST / DELETE / POST `.../toggle` — all `required`.

## Bookmarks — `/bookmarks`
`GET /bookmarks/saved`, `POST|DELETE /bookmarks/blogs/:blogId/bookmark`, `POST .../toggle` — all `required`.

## Profile — `/profile`
| Method | Path | Auth |
|---|---|---|
| GET | `/profile/:username` | optional |
| PATCH | `/profile/me` | required — `{ name?, bio? }` (no avatar field; InkFlow has no profile pictures) |
| GET | `/profile/:username/blogs` | optional |
| POST | `/profile/:username/follow` | required |

## Categories / Search / Upload
- `GET /categories`
- `GET /search?q=...&scope=blogs|authors`
- `POST /upload/image` (required, `multipart/form-data`, field `image`, max 5MB)

## Error codes
400 validation · 401 auth · 403 forbidden · 404 not found · 409 conflict · 429 rate limited · 500 server error

## Rate limits
General: 300/15min · Auth: 20/15min · Writes (create/like/bookmark/comment): 60/min
