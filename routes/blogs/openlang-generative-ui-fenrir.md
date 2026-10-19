---
title: OpenLang Generative UI - Fenrir
date: 2026-08-13
author: Christian / Nergy101
tags: [Generative UI, MCP, OpenUI, LLM, Angular, .NET]
---

# OpenLang Generative UI - Fenrir

Every question our business asks is legit; too bad we never build the dashboards they want...

**_Why don't you?_**

Because every one of them means a new screen, a new query, a sprint item, a release. So they get triaged,
and most of them quietly never get answered. Or worse, we one-off it with a SQL query and give them the raw numbers.
The thought is hard to avoid: _if only we could have this built by an AI_.

So I did it, on a real platform, with real data.

## Let's draw the setting of this blog

Wolf is the system Cito uses for the Dutch national secondary-education exams. Its users are the account
administrators and examiners at a school, and the vocabulary of the domain is the vocabulary of the exam
calendar: an exam is taken in an exam period, at a given education level; a school groups its candidates into
exam groups; every group then walks through marking — first marking, second marking, consultation, approval,
export — under deadlines set by law rather than by a product owner.

In the two existing frontends: **every screen shows data of one school.**
Almost every repository method that returns exam groups takes a school code, an account, or one exam.
That is not an accident - it is what authorization, navigation and page design are all built on.

**Fenrir** is a third frontend project in that same workspace, and it is a proof of concept in the strict sense: it
has no build artifact, no pipeline, no deployment. You ask it a question in plain language and it builds a screen
for you — KPI cards, charts, tables, filters — with real Wolf data in it.

It started as curiosity rather than as a roadmap item. Two things had appeared that I wanted to try against a
real, large domain instead of the usual to-do-list demo: **the Model Context Protocol, and generative UI**. This
post is about what came out of putting them together, and in particular about one design decision that turned
out to carry the whole thing.

## The questions the product cannot ask

Start from the boundary. Because every screen in Wolf is anchored to one school, there is a whole class of
questions the product cannot ask — not "has not got a screen for yet", but *cannot ask*, since asking would
mean crossing the boundary the entire application is organised around:

- Where is the country stuck in the marking pipeline, and how many candidates sit at each stage?
- Which exam is going to miss its submission deadline, and with how many unapproved candidates behind it?
- Which second-marking pairings have no marker assigned yet?
- Which schools need a phone call today?

Every one of those is answerable from the data. None of them is answerable from a single screen. And the honest
alternative — build a national dashboard for each — collapses on the second problem: **the long tail.** Most
questions get asked once. "How does the pre-university track compare to the lowest vocational track in the
second exam period?" is worth two minutes of someone's attention and never worth a sprint, so it does not get
asked at all, and the answer never influences anything. There is also a third-order effect: because trying a
screen is expensive, nobody really knows which screen should be built next.

That is exactly the shape of problem an LLM looks good at, right up to the point where you notice what the data
is. This is exam administration under statutory deadlines. Candidates are mostly minors; examiners and account
administrators are named staff. A model that answers in prose will, sooner or later, produce a number that is
close to right, or a name that looks plausible, and there is no way for the reader to tell which sentence was
retrieved and which was generated. A chat surface over this data is not merely imprecise — it is the wrong
artifact.

Two constraints, then, and they pull in opposite directions:

1. The answer has to be a **screen**: figures, a chart with the shape of the data, the rows behind it, filters
   that actually filter.
2. Every figure on that screen has to come out of Wolf, verifiably, and nothing else may ever appear there.

Constraint 2 is the hard one, and it is what most "AI dashboard" demos quietly skip.

## The model writes the program. MCP fetches the numbers.

The decision that resolves both constraints is a split, and it is the one thing I would carry to any other
generative-UI project: **the model writes a program; the program fetches the data.**

Fenrir's model output is not prose, and it is not JSON with numbers in it. It is a program in OpenUI-Lang —
OpenLang, the `@openuidev/*` packages — a short sequence of `name = Component(...)` assignments that describes a
screen *and declares the data that screen needs*. Every `Query("tool_name", {...})` inside it is an MCP tool
call that the browser performs while the screen renders.

Read that again from the model's point of view: it decides **which** figures belong on the screen, in what
shape, with which labels and which filters. It never decides **what** those figures are. The numbers arrive
later, over a different channel, from (hopefully) deterministic code.

So there are two chains, and they are deliberately not connected:

```text
1. Writing the screen
   browser → POST /api/genui/chat → LlmService → provider (claude/copilot/azure/mock)
           ← OpenUI-Lang, streamed back token by token

2. Filling the screen with data
   island Query() → POST /api/genui/tools/{name} → McpBridge → /mcp → Tools/*.cs → Logic → SQL
```

Chain 1 has no database access. Chain 2 has no model in it. The LLM is not in the data path at all — it never
sees a row, so it cannot paraphrase one, round one, or average two of them into a third. That single property is
what makes the whole idea deployable-in-principle on real exam data, and it changes what a failure even looks
like. A wrong answer from Fenrir is one of exactly three things:

- a **wrong layout** — a pie chart where a ranking was wanted. Visible in a second, and cheap.
- a **wrong tool argument** — every filter in Wolf is a closed vocabulary, so an invented exam period comes back
  as an error message rather than as a plausible-looking table.
- a **missing screen** — the model states, in a callout, that Wolf does not hold what you asked for.

What it cannot be is a wrong number. There is no code path that would produce one.

### Why the data goes over MCP

Here is the part that looks like over-engineering until you say the goal out loud. The tools run *inside the
Wolf API process*. Fenrir could have called the logic layer directly, one C# method to another. Instead there is
`McpBridge`: the application's own MCP client, pointed at its own `/mcp` endpoint, over loopback HTTP.

That is a choice, not a necessity, and the class comment says so. What the generative UI actually depends on is
the tool **catalogue** — names, descriptions, JSON schemas, generated from the C# attributes and handed to the
model — and that catalogue would be identical over a plain JSON endpoint.

What the hop buys:

- **One dispatch path, by tool name.** There is no second route from the browser to Wolf's data. Not a
  convenience endpoint, not a "just this one query" controller.
- **The same protocol an external client speaks.** One make target exposes `/mcp` to Claude Desktop or the MCP
  inspector, against the same thirty-six tools. A broken tool is therefore broken for everyone at once, rather
  than only for Fenrir — which is a much better failure mode than it sounds, because it gets noticed.
- **And, honestly: MCP was half the point.** This is a proof of concept *of MCP* as much as of generative UI. If
  the protocol only ever works when the client is somebody else's chat app, it has not been proven.

The cost is one loopback HTTP request with no session bookkeeping (`Stateless = true`) — and one genuinely
non-obvious problem. `/mcp` requires the same sign-in and the same linked admin account as every other surface,
so a loopback request without an `Authorization` header is a 401: the bridge would lock itself out of the very
endpoint it exists to reach. Hence a `DelegatingHandler` that copies the header of whichever inbound request it
is currently serving. Putting the token on the transport instead would freeze the first caller's token into an
`HttpClient` that every caller shares — a bug that works perfectly in a demo with one user.

### Why OpenLang, and not the obvious alternatives

Letting the model emit HTML or JSX was never seriously on the table: no component library, no data binding, and
a rendering surface that will happily execute whatever arrives. The point of a UI *language* is that the output
is parsed into a known set of components with declared data dependencies — the model is writing inside a grammar
you control, not producing a document you have to trust.

I did try **Google GenKit** first. It is a capable framework, but it took noticeably more effort to get the same
features out of it: a working CRUD screen, for example, was still mine to design, build and wire. OpenUI-Lang
arrives with the component library, the grammar and the renderer, so the work moves to where the domain actually
is — which tools to expose, and what the model is allowed to do with them.

### Why a React island inside an Angular app

The shell — chat, layout, state, services, auth — is Angular: standalone components, signals, zoneless. The
OpenLang renderer is React. Rather than reimplement its parser and runtime in Angular, the renderer is bundled
as a standalone IIFE that exposes a small imperative API on `window.FenrirIsland`, and Angular drives it:
`render(element, { response, isStreaming, onToolCall })`.

It is ~2.3 MB, and it is loaded as a plain static file outside the Angular build, so it cannot touch the bundle
budgets of the two apps that actually ship. Two frameworks in one page is a cost; pretending you can port a
React runtime for free is a bigger one.

## Thirty-six tools, four endpoints and a 2.3 MB island

What that adds up to, concretely.

### A tool is a C# method

Eleven classes, thirty-six tools. There is no separate schema file and no registry to keep in sync: a tool is a
method with an attribute, and the description is written for the model to read. This one is the marking funnel:

```csharp
[McpServerTool(Name = "marking_funnel", UseStructuredContent = true, ReadOnly = true)]
[Description("""
    The national marking pipeline as a funnel: how many exam groups and candidates sit in
    each markingStatus (first marking → second marking → consultation → approval →
    approved → exported) ... Render stages as a funnel or ordered bar chart on
    order, and leadTimes as a table.
    """)]
public async Task<MarkingFunnel> MarkingFunnel(
    [Description("Restrict to one exam period (1, 2 or 3). Omit for all periods.")]
    int? examPeriod = null,
    [Description("Restrict to one education level. Matched loosely. Omit for all levels.")]
    string? educationLevel = null)
```

Note the rendering hint in the middle of the API documentation ("render the stages as a funnel or an ordered bar
chart"). That is not sloppiness — on this surface the tool description *is* prompt engineering, and the same text
serves both readers. Note also what the parameters are: nullable, with "omit for all" spelled out, because the
most common thing a generated filter does is ask for everything.

The tools return **projections, not entities**. No addresses, no e-mail addresses, no usernames, no scores. The
account tools count accounts rather than listing them. Schools are named; people are counted. That is a property
of the tool layer, not a rule in the prompt, which matters: it holds even when the model misbehaves, and it holds
for the external MCP client too.

Five of those tools are the national ones — the marking funnel, the deadline radar, second-marking status,
subject participation, and a scorecard per school. All five read one national scan: a single query across every
internal exam group, cached for sixty seconds, aggregated in memory afterwards. These are precisely the questions
from the top of this post, and they exist only because a tool does not have to belong to a screen.

### Four endpoints, and nothing else

```text
GET  /api/genui/health         provider + MCP status
GET  /api/genui/tools/spec     tool specs, straight from MCP tools/list
POST /api/genui/tools/{name}   execute one Wolf tool, via McpBridge
POST /api/genui/chat           stream OpenUI-Lang from the configured provider
```

Both surfaces — `/api/genui/*` and `/mcp` — require a valid sign-in *and* a linked administration account. The
split matters for the UI: a 401 means "sign in", a 403 means "you have no account in this system", and those are
different screens with different buttons.

The provider behind `/chat` is configurable per question: the local **Claude CLI** by default (it uses the CLI's
own sign-in, and nothing leaves the machine — which is the only reason this is acceptable on real exam data), the
local **Copilot CLI**, **Azure OpenAI** (the one option that does send data off the machine, and it is labelled
as such in the UI), or **mock** for fixtures and tests.

### What arrives, and what gets rendered

The response streams token by token, and it is *not* trustworthy input. Models narrate — "I'll build you a
dashboard…" — or explain mid-answer that OpenLang has no function definitions. Feed that to a markdown-capable
renderer and the user watches developer chatter appear in their dashboard for a second.

So the stream passes through one small pure module first, which is also the entire reason it is a separate file
with its own tests rather than living inside a 2.3 MB React bundle:

```ts
/** An OpenUI-Lang program is a sequence of `name = Component(...)` assignments. Prose
 *  never starts a line that way, which is what lets us tell a program from narration. */
export const LOOKS_LIKE_PROGRAM = /^[ \t]*\$?[A-Za-z_][\w$]*[ \t]*=/m;
```

`extractProgram` takes the last fenced block (tolerating one that is still streaming), tests it, and returns
`null` if it does not look like a program. Better to show nothing than to show the model thinking out loud.

What survives looks like this — a real program from the mock provider's fixtures, building a national progress
view of exams enrolled against exams submitted:

```text
summary = Query("exam_summary", {}, {rows: []})
header = CardHeader("National progress", "Enrolled versus submitted, per exam")
bar = BarChart(summary.rows.examName, [Series("Schools enrolled", summary.rows.schoolsEnrolled), Series("Schools submitted", summary.rows.schoolsSubmitted)], "grouped")
tbl = Table([Col("Exam", summary.rows.examName), Col("Schools enrolled", summary.rows.schoolsEnrolled, "number")])
root = Stack([header, bar, tbl])
```

Four lines of layout and one line of data dependency. The `{rows: []}` at the end of the `Query` is the fallback,
rendered the instant the statement parses — which is why the prompt insists it stays empty, forever, in every
generated program. An invented example row in that position is shown to the user as real exam administration.

### The data path, per call

The generated program's `Query()` calls land on a plain function map, one entry per tool name, memoized per
render root. Two details there earned their comments:

- It is a **concrete map, not a `Proxy`.** A Proxy would happily answer to `callTool`, and the renderer would
  then decide it was talking to an MCP client and take a different path entirely.
- It is **memoized**, because `render` runs on every streaming delta, and a fresh map identity on each one
  invites the renderer to re-run queries that had already settled.

Every call is reported to the Angular shell twice — once as pending, once settled with a duration and an
ok/error — which is what lets the shell hold the surface back instead of flashing an empty fallback table, and
what puts a visible list of "these tools ran, and this is what they took" under every generated screen. On this
kind of surface that list is not a debugging nicety; it is the provenance of what you are looking at.

Writes are deliberately awkward. Anything whose name ends in "save" or "delete" is a `Mutation()`, never a
`Query()`, never wired to run on page load, always behind a button the user presses. It returns a success flag
and a message, and the prompt requires showing that message and re-running the matching query afterwards.

### Containment

Because this runs against national exam data, "off" has to mean off. The feature flag does not merely hide the
UI: a feature filter removes the controller from the MVC model, so with the flag off the route table is identical
to a build without the proof of concept. The local sign-in shortcut has three independent locks — the feature
flag, its own setting, and an `IHostEnvironment.IsDevelopment()` check in code — and it bypasses *authentication*
only, never *authorization*: an address that is not in the user table gets the same "no access" screen it would
get in production. And if the flag is on, startup logs a warning; if `/mcp` is open, a second, differently worded
one. Seeing either line in the logs of anything other than a development machine *is* the bug.

## A system prompt is a defect log

The system prompt in `island/index.tsx` is about 38 kB, and it opens with a comment telling the next developer
not to trim it for brevity. That is because it is not a prompt in the "you are a helpful assistant" sense. It is
a defect log: roughly ten paragraphs, each of which is a bug someone actually watched happen. Here are the ones
worth stealing.

### The silent default in your component library will betray you

The bug that cost the most was not in the model, the protocol or the backend. It was this: a generated screen
opens showing every exam period, the user picks period 2, and there is no way back. There is no "all periods" row
in the select. Their only escape is to ask the entire question again.

The obvious spelling of that row — an option whose value is the empty string — cannot work in this stack, twice
over:

1. The OpenLang select wrapper builds its option list with `items.filter((item) => item?.props?.value)`. An empty
   string is falsy, so the row is dropped before it is ever rendered. No warning, anywhere.
2. Underneath sits `@radix-ui/react-select`, which reserves the empty string for "nothing selected":
   `shouldShowPlaceholder(value) => value === "" || value === undefined`. Even if the row survived, its value is
   the one string that means *no selection*.

So the option needs a real sentinel value, and something has to turn that value back into "no filter" before the
tool call. In the generated program that looks like this — `"all"` is the sentinel, meaning "no filter":

```text
$examPeriod = "all"
examPeriodFilter = Select($examPeriod, [SelectItem("all", "All exam periods"), SelectItem("1", "Exam period 1"), ...])
groups = Query("marking_funnel", {examPeriod: $examPeriod == "all" ? "" : $examPeriod}, {stages: []})
```

Two lessons, and the second is the more general one. First: generative UI inherits every quiet default of your
component library, and the model cannot see them — it writes the reasonable thing and gets a dead end. Second:
**hold the invariant in more than one place, and name the authority.** The prompt asks the model to map the
sentinel back. A client-side helper strips the sentinel anyway, so the visible call list stays honest about what
was actually sent — and it skips mutations, because the save-a-notice tool takes free text, and a notice whose
body is the word "all" is odd but legal. And the MCP bridge drops empty arguments server-side, where it is the
authority. Three nets, one of which is load-bearing, and the code says which.

### Never let a fallback be plausible

A `Query()` renders its fallback the moment the statement parses — before any data has arrived. So a "realistic"
example row in a fallback is not placeholder content; it is fabricated exam administration, displayed to a user
with nothing to mark it as fake. Every fallback stays `{rows: []}`. Slow and empty is a state people understand.
Wrong and confident is not.

### Rendering booleans is a domain decision

Two defects with one cause. A table cell is rendered as `String(cell)`, so a bare boolean shows up as "true" or
"false", and a null or missing field renders as an empty cell with no warning at all — the row then reads as
though nobody ever entered a value. Meanwhile some tools already hand back finished words rather than booleans,
and a ternary on such a field prints the positive branch for every single row, because a non-empty string is
truthy. The same wrong answer, everywhere, consistently — the worst kind. And "unknown" is not "no": the system
never recorded an answer, which is a third state that has to survive all the way to the screen.

### Chat history for a program-writing model is not chat history

Sending every previous program back with the next question broke twice. The cheap failure: the request grows by
kilobytes per turn on top of a 38 kB system prompt. The expensive one: the model reads its own earlier programs as
worked examples and starts repeating them instead of answering the new question.

Now only the last *successful* program survives verbatim — that is the only thing a follow-up like "and now per
period" can refer to. Older turns collapse into a single line: which question they answered and which tools they
read. Failed and aborted turns get a sentence too, and deliberately not their text, because the error callout that
Fenrir writes on failure is itself a valid two-line OpenLang program — which is exactly what you must not hand
back to a model that writes programs.

### Tool descriptions are the prompt

There is no separate "AI layer" in this design. The `[Description]` on a C# method is what the model reads,
rendering hints included, and the enum values on the parameters are what keep an impossible question from becoming
a plausible table. If you build tools for a model, the API surface and the prompt are one artifact, maintained
together.

### Design containment before you build the feature

A proof of concept that reads production-shaped data needs its off switch designed first, not retrofitted. A flag
that actually removes routes, extra locks behind it, and a startup log line that screams when it is on — that is
what makes it responsible to point this at a real database at all.

### The prompt rules are the one thing nothing tests

Every other invariant in Fenrir is enforced by code: the tool layer returns projections, the bridge validates
enums, the extractor rejects narration. The ten paragraphs of the system prompt are not. Each of them fixes a
failure someone watched happen, and nothing checks whether editing one breaks a rule another paragraph was holding
up. If you build this, assume your prompt is production code with no test suite — because that is what it is.

## Where this actually shines

The honest answer is that it is not "everywhere", and it is also not quite where I expected. Three cases stand
out.

**The long tail of one-off questions.** This is the real win. Most questions about a large dataset are asked once:
this exam, this period, compared to that education level, today. A dashboard is an expensive answer to a question
with a lifetime of two minutes, so those questions get triaged away and their answers never influence anything. A
generated screen has almost no marginal cost, which changes which questions are worth asking at all.

**Exploration — finding out what the screen should be.** A generated dashboard is the cheapest prototype in
existence. Ask for it, look at it, notice that the KPI you assumed was central is boring and the funnel next to it
is not. Then go and build *that*, by hand, properly, as a real feature. Generative UI as a design tool turned out
to be more immediately useful than generative UI as a product feature.

**Onboarding into a complex domain.** Wolf has a vocabulary — exam periods, exam groups, marking statuses, school
codes — and normally you learn it by being walked through screens. Someone who does not know the system can now
ask their way into it in plain language, and get a picture back with the right words on it. Watching a newcomer do
that is the demo that consistently lands.

What it is *not* good at, on this data, and I would say the same about most enterprise domains: it is not a
replacement for the screens people use every day. Those need to be stable, learnable, tested, accessible, and
identical for every user on every visit — five properties a generated surface does not have. The two coexist: the
product answers the questions you always have, and this answers the ones you did not know you had.

> Add a piece about saving the generated Program to re-hydrate with actual data at a later point!

> Add a piece that the MCP was totally optional - having the Program just do JSON-API REST calls would also work just fine, and if
> you already have that, it is an even quicker path to using Generative UI without the MCP.

## What I would keep

The interesting work turned out not to be the generation. Getting a model to emit a valid OpenLang program was an
afternoon; everything after that was learning what a generated screen does to real users. A filter that cannot go
back to "all" is a dead end. A fallback with a plausible row in it is fabricated exam administration. A word like
"no" is a truthy string, and it gives the same wrong answer on every row. A model that sees its own earlier programs
starts repeating them instead of answering the question.

The 38 kB system prompt is a defect log, one paragraph per bug someone actually watched happen.

Which leaves the one decision I would keep on any project of this kind: keep the model out of the data path. Let it
write the program, let the protocol fetch the numbers. Every remaining mistake then becomes a layout mistake or a
rejected argument — annoying, visible, cheap. That is a class of failure you can live with; "probably about 4,200
candidates" is not.

> Also given the bonuses of very repeatable Programs (just save the output) and then
> being able to share these, keep these, and that the SLOW part of this Generative UI is the LLM coming up with the Program.
> However if you already have the program, well, it's as fast as your API is!

---

Anyone who wants to spar about this is always welcome to send me a message — I am especially curious where you
would draw the line between the program and the data. And if you would rather just find out for yourself: one
MCP tool over a table you already have, one `Query()` in a generated program, and you are holding this whole
architecture in miniature.
