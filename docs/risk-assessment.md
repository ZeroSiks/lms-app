# Risk Assessment — Lumify LMS

## Risk Register

Risks identified during project planning and development, assessed by **likelihood** (Low / Medium / High) and **impact** (Low / Medium / High / Critical).

| # | Risk | Likelihood | Impact | Risk Level | Mitigation Strategy | Status |
|---|---|---|---|---|---|---|
| R01 | **Unauthenticated admin API access** — Admin endpoints lack server-side auth, allowing anyone to manage users, courses, and enrollments | High | Critical | **Critical** | Implemented `requireAdmin()` middleware on all 25+ admin API routes. JWT verification + role check enforced server-side. | ✅ Mitigated |
| R02 | **Credential brute-force attacks** — No rate limiting on login/register endpoints enables unlimited password guessing | Medium | High | **High** | Implemented in-memory IP-based rate limiter. Login: 5 req/min. Register: 3 req/min. Forgot-password: 3 req/min. | ✅ Mitigated |
| R03 | **XSS via user-generated content** — HTML/script tags in user inputs (names, messages, bios, assignment content) could execute in browsers | Medium | High | **High** | `stripHtml()` sanitization applied to all user-input fields: firstName, lastName, bio, message content. Zod max-length constraints added. | ✅ Mitigated |
| R04 | **Plaintext credentials in repository** — `superadmin.txt` contained admin and test account passwords in plaintext | High | High | **High** | File deleted. Added to `.gitignore`. Credentials documented only in private team communication. | ✅ Mitigated |
| R05 | **Data loss (database failure)** — Hardware failure or accidental deletion could destroy all user data | Low | Critical | **Medium** | Regular `pg_dump` backups recommended for production. PostgreSQL ACID compliance provides crash safety. | ⚠️ Ongoing |
| R06 | **JWT secret exposure** — If `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are leaked, all tokens become forgeable | Low | Critical | **Medium** | Secrets stored in `.env` (gitignored). `.env.example` uses placeholder values. Rotation procedure documented. | ✅ Mitigated |
| R07 | **File upload abuse** — Malicious file uploads (oversized files, wrong types, malware) could compromise server | Medium | Medium | **Medium** | Type whitelist (8 MIME types), 10MB size limit, magic byte validation, filename sanitization, extension whitelist. Uploads served from `/public/uploads/`. | ⚠️ Partial (no virus scanning) |
| R08 | **Scope creep** — Uncontrolled feature additions could delay delivery | Medium | Medium | **Medium** | SCRUM sprint planning with MoSCoW prioritization. Sprint backlog locked after planning. | ✅ Mitigated |
| R09 | **Team member unavailability** — Illness or scheduling conflicts could reduce capacity | Medium | Medium | **Medium** | Pair programming on critical features. Shared code ownership via GitHub PR reviews. Documentation reduces bus factor. | ⚠️ Ongoing |
| R10 | **Database schema drift** — Inconsistent migrations between team members' local databases | Medium | Medium | **Medium** | Prisma Migrate for version-controlled schema changes. `prisma migrate dev` run after each schema change. | ✅ Mitigated |
| R11 | **Password reset token abuse** — Reset tokens could be guessed or intercepted | Low | High | **Medium** | 32-byte cryptographically random hex tokens (`randomBytes`). 1-hour expiry. Token cleared after successful reset. | ✅ Mitigated |
| R12 | **Insecure Direct Object Reference (IDOR)** — Numeric auto-increment IDs could allow enumeration of users, courses, enrollment IDs | Medium | Medium | **Medium** | Auth middleware prevents unauthenticated access to admin endpoints. Instructor endpoints verify ownership via compound `findFirst` queries with `instructorId`. | ⚠️ Partial |
| R13 | **Cross-Site Request Forgery (CSRF)** — Authenticated users could be tricked into performing unintended actions | Low | Medium | **Low** | JWT stored in `SameSite: lax` cookies. No state-changing GET endpoints. `verifyAccessToken` on all protected routes. | ✅ Mitigated |
| R14 | **Poor accessibility (WCAG non-compliance)** — Users with disabilities may be unable to use the system | Medium | Medium | **Medium** | Semantic HTML used throughout. Form labels associated with inputs. Responsive design supports zoom. Dashboard layout uses `aria-label`, `aria-current`, `role` attributes. More ARIA coverage still needed. | ⚠️ Partial |
| R15 | **Deployment misconfiguration** — Production environment differences (Node version, PostgreSQL version) could cause failures | Low | High | **Medium** | Docker Compose recommended for consistent PostgreSQL version. `.env.example` documents all required variables. | ⚠️ Ongoing |
| R16 | **Announcement broadcast abuse** — Instructor/Admin posts excessive or inappropriate announcements, spamming student notifications | Low | Medium | **Low** | Only instructors and admins can post announcements. Notifications are DB-inserted per student — no email blast. Announcements can be deleted post-publication. | ✅ Mitigated |

---

## Risk Matrix

|  | Low Impact | Medium Impact | High Impact | Critical Impact |
|---|---|---|---|---|
| **High Likelihood** | — | — | R01, R04 | R01 |
| **Medium Likelihood** | — | R07, R08, R09, R10, R12, R14 | R02, R03 | — |
| **Low Likelihood** | R13 | R15 | R11 | R05, R06 |

---

## Key

- ✅ **Mitigated:** Risk has been addressed with a specific countermeasure
- ⚠️ **Partial / Ongoing:** Risk partially addressed or requires ongoing monitoring
- ❌ **Unaddressed:** Risk not yet addressed
