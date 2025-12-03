---
title: PocketBase and Angular
date: 2025-11-25
lastUpdated: 2025-11-25
author: Christian / Nergy101
tags: [Pocketbase, Angular, BaaS, Database]
---

# PocketBase & Angular

The combination of [PocketBase](https://pocketbase.io) and [Angular](https://angular.io) is my personal favorite for fast prototyping and hobbying. What makes PocketBase stand out is how it manages to pack enterprise-grade features into a single executable while keeping the developer experience refreshingly simple. You get a complete backend solution that feels like it was built by developers who actually understand the pain points of modern web development.

Of all [BaaS](#what-is-a-baas) offerings, PocketBase is my favorite because it delivers everything you need without the typical BaaS headaches:

- Easy to use, with a good JavaScript SDK (and Flutter SDK) that makes integration seamless
- Being actively developed on [GitHub](https://github.com/pocketbase/pocketbase) with a responsive community
- Easy to follow OAuth configuration pages for Google, GitHub and Microsoft. No more wrestling with cryptic OAuth setups 🥳🎉
- Simple table management with relational fields and an intuitive UI that makes schema design feel natural
- It can do custom endpoints by writing simple JS functions, giving you the flexibility to extend functionality without leaving the ecosystem
- You can hook-in on events like 'beforeCreate', 'beforeUpdate', 'beforeDelete', 'afterCreate', 'afterUpdate', 'afterDelete', etc. to do custom logic when you want to do something custom.
- It can do CRUD + live-view subscriptions on data, so real-time features come built-in
- Easy to host (yourself or hosted for free by [PocketHost](https://pockethost.io/)), deploy it anywhere, from your Raspberry Pi to a managed service
- And the best part? **It's completely free**. All of these features, and it costs you nothing

And [Angular](https://angular.io) is my favorite because well... I've worked with it for years.
It's a great framework for building web applications. It continually evolves with new trends, like using Signals, Vite, and more. It has stood the test of time and is used a lot in enterprise applications.

## Table of Contents

- [PocketBase & Angular](#pocketbase--angular)
  - [What is a BaaS?](#what-is-a-baas)
  - [Introduction to PocketBase](#introduction-to-pocketbase)
  - [Getting Started with PocketBase](#getting-started-with-pocketbase)
  - [Basic JavaScript SDK Usage](#basic-javascript-sdk-usage)
  - [Typed PocketBase Angular Service](#typed-pocketbase-angular-service)
  - [Downsides to using PocketBase](#downsides-to-using-pocketbase)
  - [Conclusion](#conclusion)

## What is a BaaS?
A BaaS is a 'backend as a service'. These offerings usually provide a storage mechanism (database), authentication through OAuth and other means, and other services for your application. They are usually very easy to get started with, and very easy to use.

Just to name a few:

- [Firebase](https://firebase.google.com/)
- [Supabase](https://supabase.com/)
- [Appwrite](https://appwrite.io/)
- [Convex](https://www.convex.dev/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- The list goes on and on and on

Today we will dive into [PocketBase](https://pocketbase.io) and why I have been using it to build [Tovedem](https://tovedem.nergy.space), rather rapidly and carefree in combination with [Angular](https://angular.io).
So this blog will go over the basics of [PocketBase](#introduction-to-pocketbase), [how to get started](#getting-started-with-pocketbase), [how to use the JavaScript SDK](#basic-javascript-sdk-usage), and how to use PocketBase with [a typed service in Angular](#typed-pocketbase-angular-service).

This combination of PocketBase and Angular has been a great experience and I have been able to build a lot of features quickly and easily. Definitely worth a try for quick (hobby-)projects or prototypes.

---

## Introduction to PocketBase

First off, what **is** PocketBase?

[PocketBase](https://pocketbase.io) is a backend service in a single file. It's being built as a framework in Go with a SQLite database backing. As said it is available to use as a framework, but not only that. It's also available as a database + backend application that encompasses most of the basic development work. Think of authentication (O-Auth), managing SQL tables with different relationships, APIs on this data, and real-time feeds.

Check out the [PocketBase demo](https://pocketbase.io/demo/) to get a feel for what PocketBase is capable of and what the UI looks like.

Another thing; The documentation is GREAT! While extending PocketBase functionality with custom Javascript endpoints, etc. the documentation has always been up-to-date and very searchable. The docs are easy to follow and understand, and breaking changes are well-documented and easy to follow.

## Getting Started with PocketBase

Let's have a quick look at how to get started with PocketBase.

Self-host in your preferred way, either with Docker or simply by running the executable. Then visit `localhost:8090/_/` to be visited by the dashboard. Within this dashboard, we can manage the authentication providers, database schema, the data inside, logging, and different kinds of settings.

Don't want to self-host? Use [PocketHost](https://pockethost.io/) for a managed PocketBase experience that keeps the zero-config feel without managing servers yourself.
Of course you still get full access to all the features of PocketBase.

Managing your data schema is really easy and visual,
just add the fields you want for a collection, and you're done! Notice how there are some complex types you can add easily like rich text editor texts, emails, and whole files. Also, take special mention of the 'relation' type which allows for configuring 1-n or n-1 or 1-1 relationships between different collections.

<div class="readable-image">
  <figure>
    <div class="image-scroll">
      <img src="/assets/pocketbase/image.jpeg" alt="PocketBase dashboard showing device_comments collection from retroranker.site" />
    </div>
    <figcaption>
      Screenshot from the PocketBase instance for <a href="https://retroranker.site" target="_blank">retroranker.site</a> showing the PocketBase dashboard with the <code>device comments</code> collection. Notice how relational fields (like <code>user</code> and <code>device</code>) display readable names like "nergy101" instead of string IDs, making it much easier to work with your data in the admin interface.
    </figcaption>
  </figure>
</div>

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

Of course, for this to work, you need to create a collection named `posts` in the PocketBase instance with the fields `title`, `content`, and `author`. The `id`, `created`, `updated` fields are created automatically in every collection.

The SDK makes it incredibly simple to handle authentication, CRUD operations, and real-time updates with just a few lines of code.

## Typed PocketBase Angular Service

While building [Tovedem](https://tovedem.nergy.space) I wrapped [the SDK](#basic-javascript-sdk-usage) in an Angular `PocketbaseService` that leans heavily on generics. Every helper (`create`, `update`, `getAll`, `getPage`, …) accepts a `T` type parameter, so TypeScript keeps the rest of my code perfectly aligned with the domain models, assuming those models mirror the PocketBase collections (or at least a subset of them). This buys us a few concrete wins:

- The raw `RecordModel` of PocketBase gets replaced with our own strongly typed models, so returned data is instantly usable and typed.
- IntelliSense becomes effortless because every field is now known up front.
- Runtime surprises drop as mismatched fields show up while coding compile-time, not only during runtime or in production.
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

  async update<T extends BaseModel>(collectionName: string, item: T): Promise<T> {
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

  async getOne<T>(collectionName: string, id: string, options?: GetOptions): Promise<T> {
    const data = await this.client
      .collection(collectionName)
      .getOne(id, options);

    return data as T;
  }

  async getPage<T>(collectionName: string, page: number, perPage: number, options?: GetOptions): Promise<Page<T>> {
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

(Defined in `@/app/models/pocketbase/page.model.ts`)

Here's an example of a `Group` model, a small object that represents a group of users:

```typescript
import { BaseModel } from "pocketbase";

export interface Group extends BaseModel {
  name: string;
  description?: string;
  images?: string[];
}
```

And here's the typed CRUD flow wired into an Angular component, it's a bit illustrative for this example but it shows the power of [the typed service](#typed-pocketbase-angular-service) and how it can be used to build a robust application.

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

Because every method returns `Promise` of `T` (or `Promise` of `Page` of `T` in the pagination helpers), responses stay typed and the compiler points me to every place that needs updating whenever the schema evolves. It's a small abstraction, but it turned [the PocketBase SDK](#basic-javascript-sdk-usage) into a first-class citizen inside Angular and made refactors far less scary.


## Downsides to using PocketBase

- **Database migrations** are not supported. You have to manually update the schema in the database. This includes transformations of existing data, making it difficult to make changes to the schema without losing data.
- **Custom query language** might be a bit limited. You can't use SQL queries, only the PocketBase query language. This can be limiting for complex queries.
- **Storage space for files** is limited to the storage specs of where you host PocketBase. The only integration to cloud storage is S3-compatible storage.

Seperate note about **performance**:
**[Does it scale?](https://pocketbase.io/faq)**

The [FAQ](https://pocketbase.io/faq) states:
> Only on a single server, aka. vertical. Most of the time, you may not need the complexity of managing a fleet of machines and services just to run your backend.
> PocketBase could be a great choice for small and midsize applications - SaaS, mobile api backend, intranet, etc.
> Even without optimizations, PocketBase can easily serve 10 000+ persistent realtime connections on a cheap $4 Hetzner CAX11 VPS (2vCPU, 4GB RAM).
> You can find performance tests for various read&write operations in the official benchmarks repo .
> There is still room for improvements (I haven't done extensive profiling yet), but the current performance is already good enough for the type of applications PocketBase is intended for.

## Conclusion

So why choose PocketBase over other [BaaS](#what-is-a-baas) options like Firebase, Supabase, or Appwrite? 

The combination of PocketBase with [a typed Angular service](#typed-pocketbase-angular-service) gives you **several key advantages**:


- **Self-hosting freedom**: Unlike Firebase or AWS Amplify, you can run PocketBase anywhere, on your own server, a Raspberry Pi, or use PocketHost for free managed hosting. This gives you complete control over your data and infrastructure.
- **Simplicity**: PocketBase's single-file deployment and SQLite backend mean zero configuration headaches. No complex cloud setups, no vendor lock-in, just a simple executable that works.
- **Type safety**: [By wrapping the SDK in a typed service](#typed-pocketbase-angular-service) (as shown above), you get compile-time guarantees that catch errors before they reach production. This is especially valuable when working with rapidly evolving schemas.
- **Cost**: It's completely free and open-source. While other BaaS platforms have free tiers, they often come with limitations that can bite you as you scale. For small to midsize projects, PocketBase is a great (FREE!) choice.
- **Developer experience**: The admin UI is intuitive, the documentation is excellent, and the ability to write custom endpoints and hooks in JavaScript makes it easy to extend functionality without leaving the ecosystem.
- **SQLite**: The database is SQLite, which makes it very lightweight and easy to backup, move, etc.

The [typed service pattern](#typed-pocketbase-angular-service) I've shown here transforms PocketBase from a great BaaS into a first-class TypeScript citizen. When your schema changes, TypeScript will guide you to every place that needs updating, no more runtime surprises or manual grep searches through your codebase.

If you want more on PocketBase, be sure to sign up, follow or even contact me.

It's my plan to update this blog into a full tutorial and getting-started. Hope to see you around!

Cheers, and, by the way, "BaaS" translates to "boss" in Dutch.

---

_Last updated: 2025-11-25_
