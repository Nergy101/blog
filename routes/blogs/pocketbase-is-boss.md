---
title: PocketBase is Boss
date: 2025-11-25
author: Christian / Nergy101
tags: [Pocketbase]
---

# PocketBase: The Single-File Backend That's Actually Boss

My personal favorite for hackathons, prototypes, and small projects.

I'm sure you've all heard of Backend as a Service or BaaS.

Just to name a few:

- Firebase
- Supabase
- Appwrite
- Convex
- AWS Amplify
- The list goes on and on and on

Today we will dive a bit into PocketBase and why I have been using it to build [Tovedem](https://tovedem.nergy.space), rather rapidly and carefree in combination with Angular.
So this blog will go over the basics of PocketBase, how to get started, how to use the JavaScript SDK, and how to use PocketBase with a typed service in Angular.

This combination of PocketBase and Angular has been a great experience and I have been able to build a lot of features quickly and easily. Definitely worth a try for quick (hobby-)projects or prototypes.

## Table of Contents

- [PocketBase: The Single-File Backend That's Actually Boss](#pocketbase-the-single-file-backend-thats-actually-boss)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
  - [Basic JavaScript SDK Usage](#basic-javascript-sdk-usage)
  - [Typed PocketBase Service Lessons](#typed-pocketbase-service-lessons)
  - [Conclusion](#conclusion)

---

## Introduction

First off, what **is** PocketBase?

[PocketBase](https://pocketbase.io) is a backend service in a single file. It's being built as a framework in Go with a SQLite database backing. As said it is available to use as a framework, but not only that. It's also available as a database + backend application that encompasses most of the basic development work. Think of authentication (O-Auth), managing SQL tables with different relationships, APIs on this data, and real-time feeds.

Check out the [PocketBase demo](https://pocketbase.io/demo/) to get a feel for what PocketBase is capable of and what the UI looks like.

Another thing; The documentation is GREAT! While extending PocketBase functionality with custom Javascript endpoints, etc. the documentation has always been up-to-date and very searchable. The docs are easy to follow and understand, and breaking changes are well-documented and easy to follow.

## Getting Started

Let's have a quick look at how to get started with PocketBase.

Self-host in your preferred way, either with Docker or simply by running the executable. Then visit `localhost:8090/_/` to be visited by the dashboard. Within this dashboard, we can manage the authentication providers, database schema, the data inside, logging, and different kinds of settings.

Don't want to self-host? Use [PocketHost](https://pockethost.io/) for a managed PocketBase experience that keeps the zero-config feel without managing servers yourself.
Of course you still get full access to all the features of PocketBase.

Managing your data schema is really easy & visual,
Just add the fields you want for a collection, and you're done! Notice how there are some quite complex types you can add easily like rich text editor texts, emails, and whole files. Also, take special mention of the 'relation' type which allows for configuring 1-n or n-1 or 1-1 relationships between different collections.

## Basic JavaScript SDK Usage

Once you have your PocketBase instance running, you can easily interact with it using the JavaScript SDK. Here's a quick example:

```javascript
import PocketBase from "pocketbase";

// Initialize the client
const pb = new PocketBase("http://127.0.0.1:8090");

// Authenticate a user
const authData = await pb
  .collection("users")
  .authWithPassword("test@example.com", "1234567890");

// Create a new record
const data = {
  title: "My First Post",
  content: "Hello PocketBase!",
  author: pb.authStore.model.id,
};
const record = await pb.collection("posts").create(data);

// Fetch records with filtering
const records = await pb.collection("posts").getList(1, 20, {
  filter: 'created >= "2024-01-01"',
  sort: "-created",
});

// Real-time subscription
pb.collection("posts").subscribe("*", function (e) {
  console.log("Real-time update:", e.record);
});
```

The SDK makes it incredibly simple to handle authentication, CRUD operations, and real-time updates with just a few lines of code.

## Typed PocketBase Service Lessons

While building [Tovedem](https://tovedem.nergy.space) I wrapped the SDK in an Angular `PocketbaseService` that leans heavily on generics. Every helper (`create`, `update`, `getAll`, `getPage`, …) accepts a `T` type parameter, so TypeScript keeps the rest of my code perfectly aligned with the domain models—assuming those models mirror the PocketBase collections (or at least a subset of them). This buys us a few concrete wins:

- The raw `RecordModel` gets replaced with our own strongly typed models, so returned data is instantly usable.
- IntelliSense becomes effortless because every field is known up front.
- Runtime surprises drop—mismatched fields or missing ids show up while coding, not in production.
- When the PocketBase schema changes, we update the corresponding interface once and the compiler flags every usage that needs attention.

Here's the relevant slice of the service (truncated for brevity) showing how every CRUD helper is typed:

```typescript
import { inject, Injectable } from "@angular/core";
import PocketBase, { BaseModel } from "pocketbase";
import { Environment } from "@/environment";
import { Page } from "@/app/models/pocketbase/page.model";

type ListOptions = { expand?: string; filter?: string; sort?: string };
type GetOptions = { expand?: string };

@Injectable({ providedIn: "root" })
export class PocketbaseService {
  private environment = inject(Environment);
  private client = new PocketBase(this.environment.pocketbase.baseUrl);

  async create<T>(collectionName: string, item: Partial<T>): Promise<T> {
    const result = await this.client.collection(collectionName).create(item);
    return result as T;
  }

  async update<T extends BaseModel>(
    collectionName: string,
    item: T
  ): Promise<T> {
    const result = await this.client
      .collection(collectionName)
      .update(item.id, item);
    return result as T;
  }

  async getAll<T>(collectionName: string, options?: ListOptions): Promise<T[]> {
    const data = await this.client
      .collection(collectionName)
      .getFullList(options);
    return data as T[];
  }

  async getOne<T>(
    collectionName: string,
    id: string,
    options?: GetOptions
  ): Promise<T> {
    const data = await this.client
      .collection(collectionName)
      .getOne(id, options);
    return data as T;
  }

  async getPage<T>(
    collectionName: string,
    page: number,
    perPage: number,
    options?: GetOptions
  ): Promise<Page<T>> {
    const list = await this.client
      .collection(collectionName)
      .getList(page, perPage, options);
    return {
      ...list,
      items: list.items as T[],
    };
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const result = await this.client.collection(collectionName).delete(id);
    return result;
  }
}
```

The pagination helper leans on a tiny `Page` interface:

```typescript
import { ListResult } from "pocketbase";

export interface Page<T> extends ListResult<T> {}
```

(Defined in `@/app/models/pocketbase/page.model.ts`.)

Here's an example of a `Group` model, a small object that represents a group of users:

```typescript
import { BaseModel } from "pocketbase";

export interface Group extends BaseModel {
  name: string;
  description?: string;
  images?: string[];
}
```

And here's the typed CRUD flow wired into an Angular component, it's a bit illustrative for this example but it shows the power of the typed service and how it can be used to build a robust application.

```typescript
import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { PocketbaseService } from "@/app/shared/services/pocketbase.service";
import { Group } from "@/app/models/domain/group.model";
import { Page } from "@/app/models/pocketbase/page.model";

@Component({
  selector: "app-group-admin",
  templateUrl: "./group-admin.component.html",
})
export class GroupAdminComponent implements OnInit {
  private readonly pocketbase = inject(PocketbaseService);

  readonly groups = signal<Group[]>([]);
  readonly selected = signal<Group | null>(null);
  readonly page = signal<Page<Group> | null>(null);
  readonly loading = signal(false);

  readonly totalGroups = computed(
    () => this.page()?.totalItems ?? this.groups().length
  );

  async ngOnInit(): Promise<void> {
    await this.loadGroups();
  }

  async onGroupCreate(formValue: Pick<Group, "name" | "description">) {
    const created = await this.pocketbase.create<Group>("groups", {
      name: formValue.name,
      description: formValue.description,
    });
    this.groups.update((list) => [...list, created]);
  }

  async onGroupUpdate(group: Group) {
    const updated = await this.pocketbase.update<Group>("groups", group);
    this.selected.set(updated);
    await this.loadGroups();
  }

  async onGroupDelete(id: string) {
    await this.pocketbase.delete("groups", id);
    this.groups.update((list) => list.filter((g) => g.id !== id));
    if (this.selected()?.id === id) {
      this.selected.set(this.groups()[0] ?? null);
    }
  }

  async onRefreshPage(pageNumber = 1) {
    const nextPage = await this.pocketbase.getPage<Group>(
      "groups",
      pageNumber,
      10,
      { expand: "members" }
    );
    this.page.set(nextPage);
  }

  async onSelect(id: string) {
    const group = await this.pocketbase.getOne<Group>("groups", id, {
      expand: "members",
    });
    this.selected.set(group);
  }

  private async loadGroups() {
    this.loading.set(true);
    try {
      const result = await this.pocketbase.getAll<Group>("groups", {
        expand: "members",
      });
      this.groups.set(result);
      if (result.length) {
        await this.onSelect(result[0].id);
      }
      await this.onRefreshPage();
    } finally {
      this.loading.set(false);
    }
  }
}
```

Because every method returns `Promise` of `T` (or `Promise` of `Page` of `T` in the pagination helpers), responses stay typed and the compiler points me to every place that needs updating whenever the schema evolves. It's a small abstraction, but it turned the PocketBase SDK into a first-class citizen inside Angular and made refactors far less scary.

## Conclusion

If you want more on PocketBase, be sure to sign up, follow or even contact me.

It's my plan to update this blog into a full tutorial and getting-started. Hope to see you around!

Cheers, and, by the way, "BaaS" translates to "boss" in Dutch.
