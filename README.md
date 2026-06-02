# Reasonable Adjustment Letter Generator

Browser-only letter generator for UK reasonable-adjustment requests. It includes starter guidance for employers, universities, NHS services, councils, rail operators, banks, airlines, and exam providers.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser. The generated letter is assembled from local JavaScript only; there is no tracking, account, API call, or form submission.

## Drafting coverage

- Organisation-specific framing for common UK access disputes.
- Issue prompts for exams, communication, travel, employment, premises, banking, and healthcare.
- A stronger generated letter that asks for written reasons, alternatives, responsible contacts, staff briefing, deadlines, and complaint or appeal routes.
- A browser-side action checklist that changes with the selected organisation and issue, including privacy reminders for sensitive banking or healthcare details.
- Local copy, `.txt` download, and browser print actions. Filename metadata is generated in the browser from the letter context; no backend or storage is used.
- Browser-local draft autosave, a clear/reset draft control, and an email-draft `mailto:` link. Draft data stays in `localStorage` on the user's device and can be cleared from the UI.

## Source checks

Starter wording is informed by public guidance from GOV.UK, the Equality and Human Rights Commission, the Information Commissioner's Office, the UK Civil Aviation Authority, National Rail, the Office of Rail and Road, the Financial Ombudsman Service, and Shelter England. Contributors should link to an official or specialist public-interest source when adding a new organisation type or issue prompt.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides information and drafting support, not legal advice. Users should check deadlines, local rules, complaint routes, appeal windows, limitation periods, and professional advice where needed. Avoid entering full account numbers, medical records, or other unnecessary sensitive detail into examples you share publicly.
