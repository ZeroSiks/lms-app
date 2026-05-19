# Diagrams — Lumify LMS

## Viewing Instructions

| Diagram | File | Format | How to View |
|---|---|---|---|
| ER Diagram | `er-diagram.md` | Mermaid `erDiagram` | Renders automatically on GitHub, or use VS Code Mermaid extension |
| Use Case Diagram | `use-case.puml` | PlantUML | [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/), VS Code PlantUML extension, or `plantuml use-case.puml` |
| Class Diagram | `class-diagram.md` | Mermaid `classDiagram` | Renders automatically on GitHub, or use VS Code Mermaid extension |
| Sequence Diagrams | `sequence-diagram.md` | Mermaid `sequenceDiagram` | Renders automatically on GitHub, or use VS Code Mermaid extension |
| Activity Diagrams | `activity-diagram.md` | Mermaid `flowchart` | Renders automatically on GitHub, or use VS Code Mermaid extension |

## Re-generating ER Diagram

The ER diagram was generated from `prisma/schema.prisma` using `prisma-erd-generator`. To regenerate:

```bash
# Add the generator back to prisma/schema.prisma:
# generator erd {
#   provider = "prisma-erd-generator"
#   output   = "../docs/diagrams/er-diagram.md"
# }
bunx prisma generate
```

## Diagram Summary

| Diagram | Description |
|---|---|
| **Use Case** | 32 use cases across 4 actors (Guest, Student, Instructor, Admin), organized into 7 functional areas |
| **Class** | 13 model classes + 5 enum classes + JwtPayload interface, with all associations and multiplicities |
| **ER** | Auto-generated from Prisma schema — 13 entities, 5 enums, all relationships with cardinality |
| **Sequence** | 3 flows: Authentication (login + JWT token cycle), Enrollment + Lesson Completion, Assignment Submission + Grading |
| **Activity** | 3 workflows: Registration & Approval, Course Content Management (Instructor), Assignment Grading |
